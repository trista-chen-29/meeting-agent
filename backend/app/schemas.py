from typing import Literal
from pydantic import BaseModel, Field


class ActionItem(BaseModel):
    task: str
    owner: str = "UNKNOWN"
    deadline: str = "UNKNOWN"
    priority: Literal["high", "medium", "low"] = "medium"
    status: Literal["clear", "unclear"] = "clear"


class AnalyzeRequest(BaseModel):
    transcript: str = Field(..., min_length=1)


class MeetingAnalysis(BaseModel):
    meeting_topic: str
    summary: str
    decisions: list[str]
    action_items: list[ActionItem]
    blockers: list[str]
    unresolved_questions: list[str]
    follow_up_message: str
    