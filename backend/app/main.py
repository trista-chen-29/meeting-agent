from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import AnalyzeRequest, MeetingAnalysis
from app.llm import analyze_transcript

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
    try:
        result = await analyze_transcript(body.transcript)
        return MeetingAnalysis(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return MeetingAnalysis(
        meeting_topic="Rover Telemetry and Camera Sync",
        summary="The team discussed lag in the rover camera feed, a UI investigation, and the telemetry update planned for this week.",
        decisions=[
            "Investigate the UI pipeline for camera lag.",
            "Deploy the telemetry update this week.",
        ],
        action_items=[
            {
                "task": "Investigate UI pipeline for camera lag",
                "owner": "Sarah",
                "deadline": "Friday",
                "priority": "high",
                "status": "clear",
            },
            {
                "task": "Deploy telemetry update",
                "owner": "Alex",
                "deadline": "This week",
                "priority": "medium",
                "status": "clear",
            },
            {
                "task": "Confirm backend socket issue",
                "owner": "UNKNOWN",
                "deadline": "UNKNOWN",
                "priority": "high",
                "status": "unclear",
            },
        ],
        blockers=[
            "Camera feed lag remains unresolved.",
        ],
        unresolved_questions=[
            "Who will confirm the backend socket issue?",
        ],
        follow_up_message=(
            "Quick recap: we discussed the rover camera lag and telemetry rollout.\n"
            "- Sarah: investigate the UI pipeline by Friday.\n"
            "- Alex: deploy the telemetry update this week.\n"
            "- Missing owner/deadline: confirm the backend socket issue.\n"
            "Please confirm ownership for the remaining unresolved task."
        ),
    )
