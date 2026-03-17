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
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const isTranscriptEmpty = !transcript.trim();

  const copyFollowUp = async () => {
    if (!result?.follow_up_message) return;
    await navigator.clipboard.writeText(result.follow_up_message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

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
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} ${errorText}`);
      }
        
      const data = await response.json();
      console.log("API response:", data);
      console.log("Action items:", data.action_items);

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setTranscript("");
    setResult(null);
    setError("");
    setCopied(false);
  };

  const priorityBadgeClass = (priority) => {
    switch ((priority || "").toLowerCase()) {
      case "high":
        return "bg-red-500/15 text-red-300 ring-1 ring-red-400/30";
      case "medium":
        return "bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-400/30";
      case "low":
        return "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30";
      default:
        return darkMode
          ? "bg-slate-500/15 text-slate-300 ring-1 ring-slate-400/30"
          : "bg-slate-200 text-slate-700 ring-1 ring-slate-300";
    }
  };

  const statusBadgeClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "clear":
        return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30";
      case "missing_owner":
      case "missing deadline":
      case "missing_deadline":
        return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30";
      case "unclear":
        return "bg-orange-500/15 text-orange-300 ring-1 ring-orange-400/30";
      default:
        return darkMode
          ? "bg-slate-500/15 text-slate-300 ring-1 ring-slate-400/30"
          : "bg-slate-200 text-slate-700 ring-1 ring-slate-300";
    }
  };

  const formatLabel = (value) => {
    return (value || "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const pageClass = darkMode
    ? "min-h-screen bg-slate-950 px-6 py-8 text-white"
    : "min-h-screen bg-slate-100 px-6 py-8 text-slate-900";

  const panelClass = darkMode
    ? "rounded-2xl bg-slate-900 p-5 shadow-lg"
    : "rounded-2xl border border-slate-200 bg-white p-5 shadow-lg";

  const cardClass = darkMode
    ? "rounded-2xl bg-slate-800/70 p-4"
    : "rounded-2xl border border-slate-200 bg-slate-50 p-4";

  const inputClass = darkMode
    ? "min-h-[320px] w-full rounded-2xl border border-slate-700 bg-slate-800 p-4 text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-500"
    : "min-h-[320px] w-full rounded-2xl border border-slate-300 bg-white p-4 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500";

  const subTextClass = darkMode ? "text-slate-300" : "text-slate-600";
  const bodyTextClass = darkMode ? "text-slate-200" : "text-slate-800";
  const labelTextClass = darkMode ? "text-slate-400" : "text-slate-500";

  return (
    <div className={pageClass}>
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Meeting Agent</h1>
            <p className={`mt-2 ${subTextClass}`}>
              Turn messy meeting transcripts into execution-ready outputs.
            </p>
          </div>

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              darkMode
                ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                : "bg-slate-200 text-slate-900 hover:bg-slate-300"
            }`}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className={panelClass}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Transcript Input</h2>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTranscript(sampleTranscript)}
                  disabled={loading}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    loading
                      ? "cursor-not-allowed bg-slate-700 text-slate-400"
                      : darkMode
                      ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                      : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                  }`}
                >
                  Load Demo Transcript
                </button>

                <button
                  onClick={resetApp}
                  disabled={loading}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    loading
                      ? "cursor-not-allowed bg-slate-700 text-slate-400"
                      : darkMode
                      ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                      : "bg-white text-slate-900 hover:bg-slate-100 border border-slate-300"
                  }`}
                >
                  Reset
                </button>
              </div>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste meeting transcript or notes here..."
              disabled={loading}
              className={inputClass}
            />

            <button
              onClick={analyzeMeeting}
              disabled={loading || isTranscriptEmpty}
              className={`mt-4 rounded-xl px-5 py-3 font-medium transition ${
                loading || isTranscriptEmpty
                  ? darkMode
                    ? "cursor-not-allowed bg-slate-700 text-slate-400"
                    : "cursor-not-allowed bg-slate-200 text-slate-400"
                  : "bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.99]"
              }`}
            >
              {loading ? "Analyzing..." : "Analyze Meeting"}
            </button>

            {error && (
              <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>

          <div className={panelClass}>
            <h2 className="mb-4 text-xl font-semibold">Output</h2>

            {!result ? (
              <div
                className={`rounded-2xl border border-dashed p-6 text-sm ${
                  darkMode
                    ? "border-slate-700 bg-slate-800/40 text-slate-400"
                    : "border-slate-300 bg-slate-50 text-slate-500"
                }`}
              >
                No analysis yet. Paste meeting notes or load the demo transcript,
                then click Analyze Meeting.
              </div>
            ) : (
              <div className="space-y-5">
                {result?.meeting_topic && (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm ring-1 ${
                      darkMode
                        ? "bg-blue-500/10 text-blue-200 ring-blue-400/20"
                        : "bg-blue-50 text-blue-700 ring-blue-200"
                    }`}
                  >
                    Meeting Topic:{" "}
                    <span className="font-medium">{result.meeting_topic}</span>
                  </div>
                )}

                <section className={cardClass}>
                  <h3
                    className={
                      darkMode
                        ? "mb-2 text-lg font-semibold text-slate-100"
                        : "mb-2 text-lg font-semibold text-slate-900"
                    }
                  >
                    Summary
                  </h3>
                  <p className={`text-sm leading-6 ${bodyTextClass}`}>
                    {result.summary}
                  </p>
                </section>

                <section className={cardClass}>
                  <h3
                    className={
                      darkMode
                        ? "mb-4 text-lg font-semibold text-slate-100"
                        : "mb-4 text-lg font-semibold text-slate-900"
                    }
                  >
                    Action Items
                  </h3>

                  {result.action_items?.length ? (
                    <div className="space-y-4">
                      {result.action_items.map((item, index) => (
                        <div
                          key={index}
                          className={`rounded-2xl border p-4 ${
                            darkMode
                              ? "border-slate-700 bg-slate-800"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                            <h4
                              className={
                                darkMode
                                  ? "text-base font-semibold text-white"
                                  : "text-base font-semibold text-slate-900"
                              }
                            >
                              {item.task}
                            </h4>

                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityBadgeClass(
                                  item.priority
                                )}`}
                              >
                                {formatLabel(item.priority)}
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(
                                  item.status
                                )}`}
                              >
                                {formatLabel(item.status)}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`grid gap-2 text-sm sm:grid-cols-2 ${
                              darkMode ? "text-slate-300" : "text-slate-700"
                            }`}
                          >
                            <p>
                              <span className={labelTextClass}>Owner:</span>{" "}
                              {item.owner}
                            </p>
                            <p>
                              <span className={labelTextClass}>Deadline:</span>{" "}
                              {item.deadline}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={labelTextClass}>No action items extracted.</p>
                  )}
                </section>

                <section className={cardClass}>
                  <h3
                    className={
                      darkMode
                        ? "mb-3 text-lg font-semibold text-slate-100"
                        : "mb-3 text-lg font-semibold text-slate-900"
                    }
                  >
                    Decisions
                  </h3>
                  {result.decisions?.length ? (
                    <ul className={`list-disc space-y-2 pl-5 text-sm ${bodyTextClass}`}>
                      {result.decisions.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={labelTextClass}>No decisions extracted.</p>
                  )}
                </section>

                <section className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
                  <h3 className="mb-3 text-lg font-semibold text-red-200">
                    Blockers
                  </h3>
                  {result.blockers?.length ? (
                    <ul className="space-y-2 text-sm text-red-100">
                      {result.blockers.map((item, index) => (
                        <li
                          key={index}
                          className={`rounded-xl px-3 py-2 ${
                            darkMode ? "bg-slate-900/40" : "bg-white/70 text-red-900"
                          }`}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={labelTextClass}>No blockers found.</p>
                  )}
                </section>

                <section className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
                  <h3 className="mb-3 text-lg font-semibold text-amber-200">
                    Unresolved Questions
                  </h3>
                  {result.unresolved_questions?.length ? (
                    <ul className="space-y-2 text-sm text-amber-100">
                      {result.unresolved_questions.map((item, index) => (
                        <li
                          key={index}
                          className={`rounded-xl px-3 py-2 ${
                            darkMode ? "bg-slate-900/40" : "bg-white/70 text-amber-900"
                          }`}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={labelTextClass}>No unresolved questions.</p>
                  )}
                </section>

                <section className={cardClass}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3
                      className={
                        darkMode
                          ? "text-lg font-semibold text-slate-100"
                          : "text-lg font-semibold text-slate-900"
                      }
                    >
                      Follow-up Message
                    </h3>

                    <button
                      onClick={copyFollowUp}
                      disabled={!result.follow_up_message}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        !result.follow_up_message
                          ? "cursor-not-allowed bg-slate-300 text-slate-400"
                          : darkMode
                          ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                          : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                      }`}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <div
                    className={`rounded-xl border p-4 ${
                      darkMode
                        ? "border-slate-700 bg-slate-900/50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className={`whitespace-pre-line text-sm leading-6 ${bodyTextClass}`}>
                      {result.follow_up_message}
                    </p>
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