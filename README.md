# 📄 Axyres - Intelligent Resume Manager

![Status](https://img.shields.io/badge/Status-Completed-success)
![Architecture](https://img.shields.io/badge/Architecture-Microservices-orange)
![Stack](https://img.shields.io/badge/Stack-MERN_%2B_Python_AI-blue)

## 📸 Project Preview
<img width="1910" height="865" alt="image" src="https://github.com/user-attachments/assets/d864d2df-1899-422a-9280-52ffffdf9455" />

<img width="1918" height="715" alt="image" src="https://github.com/user-attachments/assets/dced7fed-8a29-462a-b7b1-d568f80faaa5" />

<img width="1917" height="737" alt="image" src="https://github.com/user-attachments/assets/0ea93eb9-f7bc-44de-8f09-5982cfb15df6" />

## 🚩 Problem Statement
In the modern recruitment landscape, organizations receive thousands of resumes daily. These documents come in **unstructured formats** (PDF, DOCX) with varying layouts, fonts, and designs.

* **The Challenge:** Recruiters spend hours manually re-typing candidate details into databases. Traditional regex-based parsers often fail on complex layouts or creative designs.
* **The Need:** A system that can "read" a resume like a human, understand context (e.g., distinguishing a project description from work experience), and convert it into structured, searchable data instantly.

## 💡 Proposed Solution
I developed a **Unified Full-Stack Application** that integrates a secure Backend API with an advanced AI Microservice.

Instead of a simple script, this solution offers a **complete lifecycle management system**:
1.  **AI-Powered Extraction:** Utilizes **Google Gemini 1.5 Flash** (LLM) to intelligently parse text, ensuring high accuracy even with non-standard layouts.
2.  **Microservices Architecture:** Decouples the Application Logic (Node.js) from the AI Processing (Python) for scalability and separation of concerns.
3.  **Human-in-the-Loop:** Recognizes that AI is not perfect; provides an interface for recruiters to **Review and Edit** extracted data before final storage.

---

## 🏗 System Architecture & Workflow

The application follows a **Microservices pattern** involving two distinct services communicating via HTTP:

1.  **User Upload:** The user uploads a resume (PDF/DOCX) via the **Frontend Dashboard**.
2.  **API Gateway (Node.js):** The backend authenticates the user (JWT), validates the file, and securely stores it locally.
3.  **AI Handoff:** The Node.js server forwards the file stream to the **Python AI Service**.
4.  **Intelligent Parsing:** * The Python service extracts raw text using `pypdf` or `python-docx`.
    * It sends the text to **Gemini LLM** with a strict prompt to return standardized JSON.
5.  **Data Persistence:** The structured JSON is returned to Node.js and stored in **MongoDB** linked to the user's account.
6.  **Response:** The user sees the extracted data instantly on their dashboard.

---

## 📂 Folder Structure

This project is organized into two main services within a single repository:

```text
AXYRES-PROJECT/
├── .vscode/                # VS Code settings
├── .env                    # Environment variables (Secrets)
├── .gitignore              # Git ignore rules
│
├── ai-service/             # 🧠 Python AI Microservice
│   ├── tests/              # Pytest Unit Tests
│   ├── venv/               # Virtual Environment
│   ├── app.py              # Flask Application Entry Point
│   └── parser_utils.py     # PDF/DOCX Text Extraction Logic
│
└── backend/                # 🛡 Node.js API Gateway
    ├── middleware/         # Auth & Error Handling Middleware
    ├── models/             # Mongoose Schemas (User, Resume)
    ├── public/             # Frontend Assets (HTML/CSS/JS)
    ├── routes/             # API Routes (Auth, Resume)
    ├── tests/              # Jest Integration Tests
    ├── uploads/            # Secure File Storage
    ├── server.js           # Express Server Entry Point
    └── package.json        # Node.js Dependencies

Here is the comprehensive and professional **`README.md`** file you requested.

It is structured exactly as you asked: **Problem Statement -> Proposed Solution -> Architecture -> Tests -> Folder Structure**. I have also incorporated the exact folder structure visible in your screenshot.

You can copy the code block below directly into your project's `README.md` file.

---


Component	Technology	Role
Backend	Node.js, Express	API Gateway, File Handling, Auth
AI Engine	Python, Flask	Microservice Framework
LLM	Google Gemini 1.5	Generative Data Extraction
Database	MongoDB	NoSQL Data Persistence
Frontend	HTML5, Bootstrap	Responsive User Interface
Security	JWT, BCrypt	Stateless Authentication



🧪 Testing Strategy
To ensure reliability, I implemented automated testing for both services:

1. Backend Integration Tests (Jest + Supertest)
Located in backend/tests/, these tests verify the core API flows:

✅ Auth Flow: Verifies that Users can Signup and Login to receive a valid Token.

✅ Protected Routes: Ensures unauthenticated requests are blocked.

✅ Error Handling: Verifies the system fails gracefully with invalid inputs.

2. AI Logic Tests (Pytest)
Located in ai-service/tests/, these tests verify the parsing engine:

✅ File Detection: Ensures the system correctly identifies PDF vs DOCX.

✅ Extraction Safety: specific tests to ensure the parser handles empty or corrupted files without crashing the server.

## 🚀 Installation & Setup

### Prerequisites

* Node.js (v14+)
* Python (v3.9+)
* MongoDB (Local or Atlas)
* Google Gemini API Key

### Step 1: Clone the Repository

```bash
git clone [https://github.com/YOUR_USERNAME/axyres-resume-manager.git](https://github.com/YOUR_USERNAME/axyres-resume-manager.git)
cd axyres-resume-manager

```

### Step 2: Setup Backend (Node.js)

```bash
cd backend
npm install
node server.js

```

*Server runs on: `http://localhost:3000*`

### Step 3: Setup AI Service (Python)

Open a new terminal.

```bash
cd ai-service
# (Optional) Create venv
pip install -r requirements.txt
python app.py

```

*AI Service runs on: `http://127.0.0.1:5000*`

---

## 👤 Author

**Sowmya Indurthi** *Submitted for Axyres Technical Assessment*

```

```
