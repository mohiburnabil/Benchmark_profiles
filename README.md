# 🏁 Benchmarking Platform for Face2Profile Dataset

A  web application that allows users to upload and evaluate results from the **Face2Profile Dataset**. Users receive scores based on their submission, can track personal submissions, and view the global leaderboard.

---

## 📦 Features

* 🔐 User registration and login with JWT authentication
* 📤 Upload benchmark results in CSV format
* 📈 Automatic scoring of submissions
* 🏆 Leaderboard (only highest score per user shown)
* 👤 Personal dashboard with full submission history
* 💡 Clean and modern UI

---

## 🚀 Tech Stack

* **Backend**: FastAPI
* **Frontend**: HTML, CSS, JavaScript
* **Database**: SQLite (SQLAlchemy)
* **Authentication**: OAuth2 with JWT

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── scoring.py
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── leaderboard.html
│   ├── static/
│   │   ├── css/style.css
│   │   ├── js/login.js
│   │   ├── js/register.js
│   │   ├── js/dashboard.js
│   │   ├── js/leaderboard.js
│   │   └── files/sample.csv
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

> Ensure `bcrypt==3.2.0` is installed to avoid compatibility issues with passlib.

### 2. Frontend Setup

```bash
cd frontend
python -m http.server 3000
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 📤 Submission Format

Submissions must be in CSV format with the following structure:

```csv
id,summary
1,Result summary for Face2Profile
2,Another result
```

📎 A sample file is available at: `frontend/static/files/sample.csv`

---

## 🔐 Authentication Flow

1. Register on the platform via the `/register.html` page.
2. Login to receive a JWT.
3. JWT is stored in `localStorage` and used for secure endpoints.
4. Logout clears the token and redirects to the login screen.

---

## 📚 About Face2Profile Dataset

This benchmarking platform is built specifically for evaluating and comparing models trained on the **Face2Profile Dataset** — a dataset for face profiling tasks. Participants are encouraged to submit results and improve their algorithms through consistent evaluation.

---

## 🏁 License

MIT License. Free to use, distribute, and modify. Contributions are welcome!
