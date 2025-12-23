# 📘 Technical Assessment Report
**Project:** Axyres Intelligent Resume Manager
**Author:** Sowmya Indurthi
**Date:** December 23, 2025

---

## 1. Executive Summary
This report outlines the development of the **Axyres Resume Manager**, a full-stack solution designed to automate the extraction of structured data from unstructured candidate resumes.

To demonstrate advanced problem-solving, I integrated **Task 1 (Backend API)** and **Task 2 (AI/ML Extraction)** into a **Unified Microservices Application**. This architecture decouples the Application Layer (Node.js) from the Compute Layer (Python), mirroring real-world enterprise systems.

---

## 2. Architecture & Approach
The system follows a **Microservices Pattern**:
* **API Gateway (Node.js/Express):** Handles 100% of client traffic, authentication (JWT), and file I/O.
* **AI Microservice (Python/Flask):** A specialized service that performs OCR and queries **Google Gemini 1.5 Flash** to transform PDF/DOCX text into JSON.
* **Communication:** Services communicate via internal HTTP requests using efficient stream handling to minimize memory overhead.

---

## 3. Compliance with Evaluation Criteria

### ✅ Code Quality, Readability, and Modularity
* **Modular Structure:** The codebase is separated into distinct layers: `routes`, `controllers`, `services`, and `models`.
* **Separation of Concerns:** The AI logic is isolated in the `ai-service` directory, ensuring the main server remains lightweight.
* **Documentation:** Key algorithms and API endpoints are documented with JSDoc/Docstrings.

### ✅ Functionality and Accuracy
* **Requirement Coverage:** All specified endpoints (Auth, Upload, CRUD, Download) are fully implemented.
* **AI Accuracy:** The implementation uses a Generative LLM (Gemini) instead of simple Regex. This ensures that complex layouts (e.g., multi-column PDFs) are parsed correctly.
* **Format Support:** Validated support for both `.pdf` and `.docx` file formats.

### ✅ Creativity in UI/UX
* **Unified Dashboard:** Instead of disjointed scripts, I built a cohesive "Candidate Database" dashboard.
* **"Human-in-the-Loop":** Recognized that AI is probabilistic, not deterministic. I implemented an **Edit Feature** that allows recruiters to review and correct data before final acceptance.
* **Visual Feedback:** Added loading states and real-time status updates to enhance user experience.

### ✅ Adherence to Guidelines
* **Testing:** Comprehensive unit tests implemented for both Backend (Jest) and AI (Pytest).
* **Submission:** Project submitted via GitHub with full commit history and documentation.

---

## 4. Challenges & Solutions

**Challenge:** Cross-Service File Handling
* *Issue:* Sending a file from Client → Node.js → Python without saving multiple temporary files.
* *Solution:* Implemented a stream-based handoff using `form-data` in Node.js, piping the upload buffer directly to the Python service for efficiency.

**Challenge:** Path Compatibility (Windows vs. Linux)
* *Issue:* Download paths failing due to operating system slash differences (`\` vs `/`).
* *Solution:* Utilized Node.js `path.resolve()` to dynamically generate absolute paths, ensuring cross-platform reliability.

---

## 5. Future Roadmap
1.  **Cloud Storage:** Migrate local file storage to AWS S3 for scalability.
2.  **Containerization:** Add `Docker` and `docker-compose` support for one-command deployment.
3.  **RBAC:** Implement distinct roles for "Admin" and "Recruiter".

---

## 6. Conclusion
The Axyres Resume Manager is a production-ready prototype that satisfies all functional requirements while prioritizing security, scalability, and user experience.