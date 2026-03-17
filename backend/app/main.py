from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import AnalyzeRequest, MeetingAnalysis
from app.llm import analyze_transcript

USE_MOCK = False

app = FastAPI(title="Meeting Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/analyze", response_model=MeetingAnalysis)
async def analyze(body: AnalyzeRequest):

    transcript = body.transcript.strip()

    if USE_MOCK:
        return MeetingAnalysis(
            meeting_topic="Rover Telemetry and Camera Sync",
            summary="The team discussed camera lag and telemetry deployment.",
            decisions=["Deploy telemetry update this week"],
            action_items=[
                {
                    "task": "Investigate UI pipeline",
                    "owner": "Sarah",
                    "deadline": "Friday",
                    "priority": "high",
                    "status": "clear",
                }
            ],
            blockers=["Camera lag unresolved"],
            unresolved_questions=["Who owns backend socket debugging?"],
            follow_up_message="Quick recap from today's discussion:\n- Sarah: investigate UI pipeline by Friday"
        )

    try:
        result = await analyze_transcript(transcript)
        return MeetingAnalysis(**result)

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))