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
        return json.loads(content)
    except json.JSONDecodeError:
        print("LLM returned invalid JSON:")
        print(content)
        raise
