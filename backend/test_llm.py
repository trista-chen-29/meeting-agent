import asyncio
import json
from app.llm import analyze_transcript


TEST_TRANSCRIPT = """
John: The rover camera feed is still lagging.

Sarah: I will investigate the UI pipeline by Friday.

Alex: We should deploy the telemetry update this week.

John: Good idea. Someone should confirm whether the backend socket issue is causing the delay.
"""


async def main():
    print("Running LLM test...\n")

    result = await analyze_transcript(TEST_TRANSCRIPT)

    print("LLM result:\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
    