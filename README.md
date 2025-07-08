# PrepPro: AI-Powered Learning Platform

**PrepPro** is a full-stack, AI-powered educational platform designed to enhance personalized learning for students and streamline test and feedback management for teachers. It leverages **Django REST Framework** for the backend, **Next.js** for the frontend, and integrates with **RapidAPI Claude 3** for advanced NLP features like text summarization and automatic MCQ generation.

---

## 🚀 Features

### 👩‍🎓 For Students
- **AI-Powered Practice Sessions**: Input text to receive instant summaries and auto-generated MCQs.
- **Real-Time Analytics**: Track performance and monitor learning progress.
- **Personalized Learning**: Adaptive practice and feedback based on individual performance.
- **Feedback System**: Submit feedback on tests and learning sessions.

### 👨‍🏫 For Teachers
- **Test Creation & Management**: Easily create, assign, and manage tests and questions.
- **AI MCQ Generation**: Instantly generate MCQs from input text using Claude 3.
- **Advanced Analytics**: Visual dashboards for tracking student and class performance.
- **Feedback Review**: View and respond to student feedback efficiently.

---

## 🛠️ Tech Stack

### 🔧 Backend
- Django, Django REST Framework
- PostgreSQL
- JWT Authentication
- RapidAPI Claude 3 (for NLP)

### 🎨 Frontend
- Next.js, React
- TailwindCSS
- Chart.js
- Axios

### 🤖 NLP Integration
- Synchronous API calls to Claude 3 for summarization and MCQ generation

---

## 📁 Project Structure

```
preppro/             # Django backend
├── nlp/             # NLP integration (Claude 3)
├── users/           # User management
├── questions/       # Question models & APIs
├── tests/           # Test models & APIs
└── ...

frontend/            # Next.js frontend
├── app/             # Pages and routes (dashboard, login, etc.)
├── components/      # Shared React components
└── ...
```

---

## 🧬 Clone and Set Up from GitHub

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/preppro.git
   cd preppro
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```

3. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   Create a `.env` file in the root directory with the following content:

   ```env
   # .env file

   SECRET_KEY=your_django_secret_key
   DEBUG=True

   DB_NAME=preppro_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432

   EMAIL_HOST=sandbox.smtp.mailtrap.io
   EMAIL_HOST_USER=your_mailtrap_user
   EMAIL_HOST_PASSWORD=your_mailtrap_password
   EMAIL_PORT=2525
   FROM_EMAIL=example@example.com

   FRONTEND_APP_URL=http://127.0.0.1:3000

   RAPIDAPI_KEY=your_rapidapi_key
   ```

   > 🔒 Do **not** commit this file. Ensure `.env` is listed in `.gitignore`.

5. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

6. **Continue with the [PostgreSQL Setup](#postgresql-setup)**.

---

## ⚙️ Getting Started

### PostgreSQL Setup

1. **Install PostgreSQL** (if not already installed):
   - On macOS (Homebrew):
     ```bash
     brew install postgresql
     ```
   - On Ubuntu/Debian:
     ```bash
     sudo apt update
     sudo apt install postgresql postgresql-contrib
     ```

2. **Start PostgreSQL service**:
   ```bash
   sudo service postgresql start
   ```

3. **Create a database and user**:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE preppro_db;
   CREATE USER preppro_user WITH PASSWORD 'your_password';
   ALTER ROLE preppro_user SET client_encoding TO 'utf8';
   ALTER ROLE preppro_user SET default_transaction_isolation TO 'read committed';
   ALTER ROLE preppro_user SET timezone TO 'UTC';
   GRANT ALL PRIVILEGES ON DATABASE preppro_db TO preppro_user;
   \q
   ```

4. **Update `settings.py` in Django**:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'preppro_db',
           'USER': 'preppro_user',
           'PASSWORD': 'your_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

---

### Backend (Django)

1. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

2. **Start the development server**:
   ```bash
   python manage.py runserver
   ```

---

### Frontend (Next.js)

1. **Navigate to frontend and start the server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Visit**:
   ```
   http://localhost:3000
   ```

---

## 📦 Key Dependencies

### Backend
- `django`, `djangorestframework`, `djangorestframework_simplejwt`
- `requests`, `pandas`, `numpy`, `matplotlib`, `plotly`
- `sentence-transformers`, `transformers`, `torch`

### Frontend
- `next`, `react`, `tailwindcss`, `axios`
- `chart.js`, `react-chartjs-2`, `react-toastify`

---

## 🤝 Contribution Guide

1. **Fork the repository**
2. **Create a new branch**  
   ```bash
   git checkout -b feature/your-feature
   ```
3. **Commit your changes**
4. **Push your branch** and open a **Pull Request**

---

## 📄 License

_Add your license here (e.g., MIT, Apache 2.0, etc.)_

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Django](https://www.djangoproject.com/)
- [RapidAPI Claude 3](https://rapidapi.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)

---

> *Final year project — built with love and AI to empower educators and learners alike.*
