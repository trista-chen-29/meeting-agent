# Meeting Agent

AI agent that converts messy meeting transcripts into structured decisions, action items, priorities, blockers, and a ready-to-send follow-up.

## Tech Stack
- React + Vite + Tailwind
- FastAPI
- NVIDIA Nemotron API

---

## Local Setup
### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Hackathon Demo Flow
1. paste messy meeting transcript
2. click Analyze Meeting
3. show summary, decisions, action items, blockers, unresolved questions
4. show follow-up message
5. point out UNKNOWN owner or deadline detection as the agentic feature

---

## Division of Work
- **Teammate 1:** backend route, model integration, schema validation
- **Teammate 2:** frontend input/output UI

---

## Fastest Possible Build Order
1. backend `/health`
2. backend `/analyze` returning mocked JSON
3. frontend textarea + Analyze button
4. connect frontend to mocked backend
5. replace mocked JSON with real model call
6. polish cards and action item display
7. rehearse demo

---

## Notes
- Keep model temperature low for cleaner JSON.
- Validate every response before sending it to the frontend.
- If the model returns invalid JSON, log raw output for debugging.
- For the hackathon, reliability matters more than extra features.
