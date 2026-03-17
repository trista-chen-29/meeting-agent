import json
from pathlib import Path
import httpx
from .settings import settings


def load_prompt(name: str) -> str:
    prompt_path = Path(__file__).parent / "prompts" / name
    return prompt_path.read_text(encoding="utf-8")

def strip_code_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if len(lines) >= 3:
            return "\n".join(lines[1:-1]).strip()
    return text

def infer_priority(item: dict, blockers: list[str]) -> str:
    deadline = (item.get("deadline") or "").lower()
    task = (item.get("task") or "").lower()

    blocker_text = " ".join(blockers).lower()

    if deadline in {"today", "tomorrow", "friday", "monday", "this week", "this friday"}:
        return "high"

    if task and blocker_text and any(word in blocker_text for word in task.split()):
        return "high"

    if any(phrase in task for phrase in ["optional", "later", "future", "if there is time"]):
        return "low"

    return item.get("priority", "medium") or "medium"

def normalize_analysis_dict(data: dict) -> dict:
    data.setdefault("meeting_topic", "")
    data.setdefault("summary", "")
    data.setdefault("decisions", [])
    data.setdefault("action_items", [])
    data.setdefault("blockers", [])
    data.setdefault("unresolved_questions", [])
    data.setdefault("follow_up_message", "")

    blockers = data.get("blockers", [])

    normalized_items = []
    for item in data.get("action_items", []):
        normalized_item = {
            "task": item.get("task", "").strip(),
            "owner": item.get("owner", "UNKNOWN") or "UNKNOWN",
            "deadline": item.get("deadline", "UNKNOWN") or "UNKNOWN",
            "priority": item.get("priority", "medium") or "medium",
            "status": item.get("status", "clear") or "clear",
        }

        normalized_item["priority"] = infer_priority(normalized_item, blockers)
        normalized_items.append(normalized_item)

    data["action_items"] = normalized_items
    return data


async def analyze_transcript(transcript: str) -> dict:
    system_prompt = load_prompt("extraction.txt")

    user_prompt = f"""
Analyze the following meeting transcript and return structured JSON.

Generate a short meeting_topic in 3 to 8 words based on the discussion, even if the title is not explicitly stated.

Transcript:
{transcript}

Output schema:
{{
  "meeting_topic": "string",
  "summary": "string",
  "decisions": ["string"],
  "action_items": [
    {{
      "task": "string",
      "owner": "string",
      "deadline": "string",
      "priority": "medium",
      "status": "clear"
    }}
  ],
  "blockers": ["string"],
  "unresolved_questions": ["string"],
  "follow_up_message": "string"
}}
""".strip()

    payload = {
        "model": settings.model_name,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.1,
    }

    headers = {
        "Authorization": f"Bearer {settings.nvidia_api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(settings.nvidia_base_url, headers=headers, json=payload)

        if response.status_code != 200:
            print(response.text)

        response.raise_for_status()
        data = response.json()

    content = data["choices"][0]["message"]["content"]
    content = strip_code_fences(content)

    try:
        parsed = json.loads(content)

        # normalize fields and infer priorities
        normalized = normalize_analysis_dict(parsed)

        return normalized

    except json.JSONDecodeError:
        print("LLM returned invalid JSON:")
        print(content)
        raise
