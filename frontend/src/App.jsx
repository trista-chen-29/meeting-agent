import { useState } from "react";

const sampleTranscript = `John: The rover camera feed is still lagging.
Sarah: I will investigate the UI pipeline by Friday.
Alex: We should deploy the telemetry update this week.
John: Good idea. We still need someone to confirm the backend socket issue.`;

export default function App() {
  const [transcript, setTranscript] = useState(sampleTranscript);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyzeMeeting = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Meeting Agent</h1>
          <p className="text-slate-300 mt-2">
            Turn messy meeting transcripts into execution-ready outputs.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Transcript Input</h2>
              <button
                className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600"
                onClick={() => setTranscript(sampleTranscript)}
              >
                Use Sample
              </button>
            </div>

            <textarea
              className="w-full h-80 rounded-xl bg-slate-800 p-3 outline-none"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />

            <button
              className="mt-4 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
              onClick={analyzeMeeting}
              disabled={loading || !transcript.trim()}
            >
              {loading ? "Analyzing..." : "Analyze Meeting"}
            </button>

            {error && <p className="mt-3 text-red-400">{error}</p>}
          </div>

          <div className="bg-slate-900 rounded-2xl p-4">
            <h2 className="text-xl font-semibold mb-3">Output</h2>

            {!result ? (
              <p className="text-slate-400">Results will appear here.</p>
            ) : (
              <div className="space-y-4">
                <section>
                  <h3 className="font-semibold">Summary</h3>
                  <p className="text-slate-200">{result.summary}</p>
                </section>

                <section>
                  <h3 className="font-semibold">Decisions</h3>
                  <ul className="list-disc pl-5 text-slate-200">
                    {result.decisions?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold">Action Items</h3>
                  <div className="space-y-2">
                    {result.action_items?.map((item, index) => (
                      <div key={index} className="rounded-xl bg-slate-800 p-3">
                        <p className="font-medium">{item.task}</p>
                        <p className="text-sm text-slate-300">Owner: {item.owner}</p>
                        <p className="text-sm text-slate-300">Deadline: {item.deadline}</p>
                        <p className="text-sm text-slate-300">Priority: {item.priority}</p>
                        <p className="text-sm text-slate-300">Status: {item.status}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold">Blockers</h3>
                  <ul className="list-disc pl-5 text-slate-200">
                    {result.blockers?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold">Unresolved Questions</h3>
                  <ul className="list-disc pl-5 text-slate-200">
                    {result.unresolved_questions?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold">Follow-up Message</h3>
                  <div className="rounded-xl bg-slate-800 p-3 whitespace-pre-wrap text-slate-200">
                    {result.follow_up_message}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
