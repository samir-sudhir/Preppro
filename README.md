<<<<<<< HEAD
# PrepPro: AI-Powered Learning Platform

PrepPro is a full-stack, AI-powered educational platform designed to enhance personalized learning for students and streamline test and feedback management for teachers. It leverages Django REST Framework for the backend, Next.js for the frontend, and integrates with RapidAPI Claude 3 for advanced NLP features like text summarization and automatic MCQ generation.

---

## Features

### For Students

- **AI-Powered Practice Sessions:** Input text, receive instant summaries and MCQs.
- **Real-Time Analytics:** Track performance and progress.
- **Personalized Learning:** Adaptive practice and feedback.
- **Feedback System:** Submit feedback on tests and sessions.

### For Teachers

- **Test Creation & Management:** Create, assign, and manage tests and questions.
- **AI MCQ Generation:** Instantly generate MCQs from text using Claude 3.
- **Advanced Analytics:** Visualize student and class performance.
- **Feedback Review:** View and respond to student feedback.

---

## Tech Stack & Architecture

- **Backend:** Django, Django REST Framework, PostgreSQL, JWT Auth, RapidAPI Claude 3 (NLP)
- **Frontend:** Next.js, React, TailwindCSS, Chart.js, Axios
- **NLP Integration:** Synchronous API calls to Claude 3 for summarization and MCQ generation
- **Deployment:** (Add your deployment details here)

### Directory Structure

```
preppro/           # Django backend
  ├── nlp/         # NLP integration (Claude 3)
  ├── users/       # User management
  ├── questions/   # Question models & APIs
  ├── tests/       # Test models & APIs
  └── ...
frontend/          # Next.js frontend
  ├── app/         # Main app (dashboard, login, signup, etc.)
  ├── components/  # Shared React components
  └── ...
```

---

## Getting Started

### Backend (Django)

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Run migrations:**
   ```bash
   python manage.py migrate
   ```
3. **Start the server:**
   ```bash
   python manage.py runserver
   ```

### Frontend (Next.js)

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
3. **Visit:** [http://localhost:3000](http://localhost:3000)

---

## Key Dependencies

### Backend

- Django, djangorestframework, djangorestframework_simplejwt
- requests, pandas, numpy, matplotlib, plotly
- sentence-transformers, transformers, torch

### Frontend

- next, react, tailwindcss, axios, chart.js, react-chartjs-2, react-toastify

---

## Contribution

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your branch and open a Pull Request

---

## License

(Add your license here)

---

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Django](https://www.djangoproject.com/)
- [RapidAPI Claude 3](https://rapidapi.com/anthropic/api/claude-3)
- [TailwindCSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
=======
# Preppro
Final year project
>>>>>>> 0bb718eb9cf985dd66878de095dd625c74eb3a50
