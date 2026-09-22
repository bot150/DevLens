import { useState } from "react"
import { scanCode, type AnalysisResult } from "../analysis/scanner"

type DevLensProps = {
  onBack: () => void
  onAnalysis: (
    result: AnalysisResult,
    code: string,
    language: string
  ) => void
}

export default function DevLens({
  onBack,
  onAnalysis,
}: DevLensProps) {
  const [mode, setMode] = useState<"Code" | "Error" | "Logs">("Code")
  const [language, setLanguage] = useState("Python")
  const [input, setInput] = useState("")

  const handleAnalyze = () => {
    if (!input.trim()) return

    const result = scanCode(input, language)

    onAnalysis(result, input, language)
  }

  return (
    <main className="min-h-screen bg-[#F7F1E8] px-5 pb-40 text-[#24171B]">

      {/* HEADER */}
      <div className="pt-6">
        <button
          onClick={onBack}
          className="mb-5 text-sm font-medium text-[#7A1F3D]"
        >
          ← Back
        </button>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A83B5B]">
              DevLens
            </p>

            <h1 className="mt-1 text-3xl font-bold leading-tight">
              See the bug.
              <br />
              Fix the code.
            </h1>

            <p className="mt-2 text-sm leading-5 text-[#74686B]">
              Paste code, an error, or logs and PairCheck will scan it.
            </p>
          </div>
        </div>
      </div>

      {/* INPUT TYPE */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#74686B]">
          Input type
        </p>

        <div className="grid grid-cols-3 gap-2">
          {(["Code", "Error", "Logs"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setMode(item)}
              className={`rounded-xl py-3 text-sm font-semibold transition ${
                mode === item
                  ? "bg-[#7A1F3D] text-white shadow-sm"
                  : "border border-[#E4D8D0] bg-white text-[#74686B]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* INPUT CARD */}
      <div className="mt-5 rounded-2xl border border-[#E4D8D0] bg-white p-4 shadow-sm">

        {/* CARD HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">
              {mode === "Code"
                ? "Code input"
                : mode === "Error"
                ? "Error input"
                : "Log input"}
            </p>

            <p className="mt-0.5 text-xs text-[#74686B]">
              Analyzed locally on-device
            </p>
          </div>

          {mode === "Code" && (
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl bg-[#F7F1E8] px-3 py-2 text-xs font-medium text-[#24171B] outline-none"
            >
              <option>Python</option>
              <option>JavaScript</option>
              <option>TypeScript</option>
            </select>
          )}
        </div>

        {/* EDITOR */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder={
            mode === "Code"
              ? "Paste your code here..."
              : mode === "Error"
              ? "Paste the error message here..."
              : "Paste your logs here..."
          }
          className="mt-4 h-56 w-full resize-none rounded-xl bg-[#21191C] p-4 font-mono text-sm leading-6 text-white outline-none placeholder:text-[#8E7F83]"
        />

        {/* STATUS */}
        <div className="mt-3 flex items-center gap-2 text-xs text-[#74686B]">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          On-device scanner ready
        </div>

        {/* ANALYZE BUTTON */}
        <button
          onClick={handleAnalyze}
          disabled={!input.trim()}
          className="mt-4 w-full rounded-xl bg-[#7A1F3D] py-4 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Analyze with PairCheck
        </button>
      </div>

      {/* HOW IT WORKS */}
      <div className="mt-5 rounded-2xl border border-[#E4D8D0] bg-white p-4">
        <p className="text-sm font-bold">
          DevLens pipeline
        </p>

        <div className="mt-4 space-y-3">
          <Step
            number="01"
            title="Capture"
            description="Bring in code, errors or logs."
          />

          <Step
            number="02"
            title="Detect"
            description="Scan the input for potential issues."
          />

          <Step
            number="03"
            title="Understand"
            description="Explain what could go wrong."
          />

          <Step
            number="04"
            title="Fix & verify"
            description="Apply a fix and re-scan the code."
          />
        </div>
      </div>

    </main>
  )
}

function Step({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F7F1E8] text-xs font-bold text-[#7A1F3D]">
        {number}
      </div>

      <div>
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="text-xs text-[#74686B]">
          {description}
        </p>
      </div>
    </div>
  )
}