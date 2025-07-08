import os
import json
import hashlib
import numpy as np
import pandas as pd
import requests
import logging
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from sentence_transformers import SentenceTransformer, util
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
EMBEDDING_MODEL = 'all-MiniLM-L6-v2'
RAPIDAPI_KEY = 'de400cff03mshd636b6f46cca699p15cec1jsn675599bc1f0c'  # Replace with your key

# Initialize model and load data
try:
    logger.info("Loading sentence transformer model...")
    embedder = SentenceTransformer(EMBEDDING_MODEL)
    
    # Get absolute paths
    CSV_PATH = os.path.join(settings.BASE_DIR, 'nlp', 'data', 'train.csv')
    EMBEDDING_FILE = os.path.join(settings.BASE_DIR, 'nlp', 'data', 'embeddings.npy')
    
    logger.info(f"Loading CSV from: {CSV_PATH}")
    logger.info(f"Loading embeddings from: {EMBEDDING_FILE}")
    
    # Check if files exist
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"CSV file not found at {CSV_PATH}")
    if not os.path.exists(EMBEDDING_FILE):
        raise FileNotFoundError(f"Embeddings file not found at {EMBEDDING_FILE}")
    
    # Load data
    MCQ_DF = pd.read_csv(CSV_PATH)
    embeddings = np.load(EMBEDDING_FILE)
    
    # Verify data shapes
    if len(MCQ_DF) != len(embeddings):
        raise ValueError(f"Data mismatch: CSV has {len(MCQ_DF)} rows but embeddings has {len(embeddings)} vectors")
    
    MCQ_DF['embedding'] = [vec for vec in embeddings]
    logger.info(f"Successfully loaded {len(MCQ_DF)} questions and embeddings")
    
except Exception as e:
    logger.error(f"Error loading model or data: {str(e)}")
    embedder = None
    MCQ_DF = None

# Cache for storing generated questions
cache = {}

def openai_generate_questions(text, num_questions, difficulty):
    """Fallback using Claude 3 via RapidAPI if semantic similarity doesn't yield enough questions."""
    logger.info(f"Generating {num_questions} questions using Claude 3 API")
    url = "https://open-ai21.p.rapidapi.com/claude3"
    prompt = f"Generate {num_questions} {difficulty} difficulty multiple-choice questions (MCQs) with 4 options each and the correct answer marked clearly from the following text:\n\n{text}\n\nFormat:\nQ1. ...\nA. ...\nB. ...\nC. ...\nD. ...\nAnswer: ..."

    payload = {
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "web_access": False
    }

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "open-ai21.p.rapidapi.com",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            result = response.json()
            text = result.get("result", "").strip()
            
            questions = text.split('Q')[1:]  # Split by question
            mcq_list = []

            for q in questions:
                lines = q.strip().split('\n')
                question_text = lines[0].strip()
                options = [line[2:].strip() for line in lines[1:5] if line.startswith(tuple("ABCD"))]
                answer_line = next((line for line in lines if line.lower().startswith("answer:")), "")
                correct_answer = answer_line.split(":", 1)[-1].strip()
                
                if len(options) == 4 and question_text:
                    mcq_list.append({
                        "question_text": question_text,
                        "options": options,
                        "correct_answer": correct_answer,
                        "support": text,
                        "relevance_score": 0.0,
                        "difficulty": difficulty
                    })

            logger.info(f"Successfully generated {len(mcq_list)} questions from Claude 3")
            return mcq_list[:num_questions]
    except Exception as e:
        logger.error(f"Error in OpenAI generation: {str(e)}")
    
    return []

def get_semantically_similar_mcqs(input_text, num_questions=5, difficulty="medium"):
    if embedder is None or MCQ_DF is None:
        logger.warning("Model or data not loaded, falling back to Claude 3")
        return []

    try:
        logger.info("Generating embeddings for input text")
        input_vec = embedder.encode(input_text, convert_to_numpy=True)
        embedding_matrix = np.vstack(MCQ_DF['embedding'].to_numpy())
        similarities = util.cos_sim(input_vec, embedding_matrix)[0]

        threshold = 0.75
        top_indices = sorted(
            [idx for idx, score in enumerate(similarities) if score > threshold],
            key=lambda idx: similarities[idx],
            reverse=True
        )[:num_questions]

        results = []
        used = set()

        for idx in top_indices:
            row = MCQ_DF.iloc[idx]
            if row['question'] in used:
                continue
            options = list({row['correct_answer'], row['distractor1'], row['distractor2'], row['distractor3']})
            np.random.shuffle(options)
            results.append({
                "question_text": row['question'],
                "options": options,
                "correct_answer": row['correct_answer'],
                "support": row['support'],
                "relevance_score": round(float(similarities[idx]), 3),
                "difficulty": difficulty
            })
            used.add(row['question'])
            if len(results) >= num_questions:
                break

        logger.info(f"Found {len(results)} semantically similar questions")
        return results
    except Exception as e:
        logger.error(f"Error in semantic similarity search: {str(e)}")
        return []

def generate_mcqs(text, num_questions, difficulty="medium"):
    text_hash = hashlib.md5(f"{text}_{difficulty}".encode()).hexdigest()
    if (text_hash, num_questions) in cache:
        logger.info("Returning cached questions")
        return cache[(text_hash, num_questions)]

    logger.info(f"Generating {num_questions} questions for difficulty: {difficulty}")
    mcqs = get_semantically_similar_mcqs(text, num_questions, difficulty)
    
    if len(mcqs) < num_questions:
        logger.info(f"Only found {len(mcqs)} questions, using Claude 3 for remaining {num_questions - len(mcqs)}")
        mcqs += openai_generate_questions(text, num_questions - len(mcqs), difficulty)

    cache[(text_hash, num_questions)] = mcqs
    return mcqs

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_questions(request):
    try:
        data = json.loads(request.body)
        text = data.get('text', '')
        num_questions = int(data.get('num_questions', 5))
        difficulty = data.get('difficulty', 'medium')
        subject = data.get('subject', '')
        topic = data.get('topic', '')

        logger.info(f"Received request for {num_questions} {difficulty} questions on {subject}/{topic}")

        if not text:
            return JsonResponse({'error': 'Text is required'}, status=400)

        if num_questions < 1 or num_questions > 20:
            return JsonResponse({'error': 'Number of questions must be between 1 and 20'}, status=400)

        if difficulty not in ['easy', 'medium', 'hard']:
            return JsonResponse({'error': 'Difficulty must be easy, medium, or hard'}, status=400)

        questions = generate_mcqs(text, num_questions, difficulty)
        
        # Add subject and topic to each question
        for q in questions:
            q['subject'] = subject
            q['topic'] = topic

        logger.info(f"Successfully generated {len(questions)} questions")
        return JsonResponse({
            'questions': questions,
            'total': len(questions),
            'difficulty': difficulty,
            'subject': subject,
            'topic': topic
        })

    except Exception as e:
        logger.error(f"Error in generate_questions: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)