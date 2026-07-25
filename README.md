# AI Interview Simulator

Full-stack AI Interview Simulator application with React, Monaco Editor, Web Speech API, MediaPipe Face Detection, Recharts, and FastAPI with Gemini API & Edge TTS.

## Overview & Workflow

1. **Resume & JD Upload**: Candidate uploads a PDF resume (parsed client-side via `pdfjs-dist`). Option to provide a target Job Description.
2. **Analysis & Personalized Interview Plan**: Gemini analyzes candidate background & role requirements, generating a 15–20 question interview spanning Resume, Technical, Coding, Behavioral (STAR), and Job-specific topics.
3. **Voice Interviewing**: Edge TTS synthesizes questions to audio. Web Speech API transcribes spoken candidate answers.
4. **Coding Challenges**: Monaco Editor code submission evaluated by Gemini against test cases and complexity analysis.
5. **Presence Monitoring**: MediaPipe Face Detection tracks webcam stream for face presence, flagging when candidate face is absent for >2s.
6. **Performance Dashboard & PDF Export**: Detailed breakdown of technical accuracy, coding, communication, behavioral skills, ideal answers, learning roadmap, and downloadable PDF report via `jsPDF`.

## Setup Instructions

### Backend (FastAPI + Gemini + Edge TTS)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Create .env file with your Gemini API Key
echo "GEMINI_API_KEY=your_key_here" > .env

# Run FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend (React + Vite + Tailwind CSS)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.
# AI-Interviewer-2026
