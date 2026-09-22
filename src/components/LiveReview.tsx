import { useState } from "react"
import {
  scanCode,
  type AnalysisResult,
} from "../analysis/scanner"

type LiveReviewProps = {
  initialCode: string
  initialLanguage: string
  onBack: () => void
  onAnalysis: (
    result: AnalysisResult,
    code: string,
    language: string
  ) => void
}

const samples: Record<string, string> = {
  Python: `def get_user(user_id):
    user = db.get(user_id)

    if user:
        return user["name"]

    return None


result = get_user(42)
print(result["email"])`,

  JavaScript: `function getUser() {
  return null;
}

const user = getUser();

console.log(user.profile.email);`,

  TypeScript: `function getUser(): any {
  return null;
}

const user = getUser();

console.log(user.profile.email);`,
}

export default function LiveReview({
  initialCode,
  initialLanguage,
  onBack,
  onAnalysis,
}: LiveReviewProps) {
  const [language, setLanguage] = useState(
    initialLanguage || "Python"
  )

  const [code, setCode] = useState(
    initialCode || samples[initialLanguage] || samples.Python
  )

  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleLanguageChange = (
    newLanguage: string
  ) => {
    setLanguage(newLanguage)
    setCode(
      samples[newLanguage] ||
        samples.Python
    )
  }

  const handleAnalyze = () => {
    if (!code.trim()) return

    setIsAnalyzing(true)

    setTimeout(() => {
      const result = scanCode(
        code,
        language
      )

      setIsAnalyzing(false)

      onAnalysis(
        result,
        code,
        language
      )
    }, 350)
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

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A83B5B]">
          Review Code
        </p>

        <h1 className="mt-1 text-3xl font-bold leading-tight">
          Review your code.
        </h1>

        <p className="mt-2 text-sm leading-5 text-[#74686B]">
          Paste code and PairCheck will scan it for potential issues.
        </p>
      </div>

      {/* LANGUAGE */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-[#74686B]">
          Language
        </p>

        <select
          value={language}
          onChange={(e) =>
            handleLanguageChange(e.target.value)
          }
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium shadow-sm outline-none"
        >
          <option>Python</option>
          <option>JavaScript</option>
          <option>TypeScript</option>
        </select>
      </div>

      {/* EDITOR */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#3A292D] bg-[#21191C] shadow-sm">

        <div className="flex items-center justify-between border-b border-[#3A292D] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#A83B5B]" />
            <span className="text-xs font-semibold text-white">
              {language}
            </span>
          </div>

          <span className="text-[10px] text-[#A99A9E]">
            PairCheck editor
          </span>
        </div>

        <textarea
          value={code}
          onChange={(e) =>
            setCode(e.target.value)
          }
          spellCheck={false}
          className="h-[360px] w-full resize-none bg-[#21191C] p-4 font-mono text-[13px] leading-6 text-white outline-none placeholder:text-[#75676B]"
          placeholder="Paste your code here..."
        />
      </div>

      {/* STATUS */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#E4D8D0] bg-white px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

        <div>
          <p className="text-xs font-semibold">
            On-device scanner ready
          </p>

          <p className="text-[11px] text-[#74686B]">
            Your code is analyzed locally.
          </p>
        </div>
      </div>

      {/* ANALYZE */}
      <button
        onClick={handleAnalyze}
        disabled={
          !code.trim() ||
          isAnalyzing
        }
        className="mt-4 w-full rounded-xl bg-[#7A1F3D] py-4 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-50"
      >
        {isAnalyzing
          ? "Analyzing..."
          : "Analyze Code"}
      </button>

      {/* INFO */}
      <div className="mt-5 rounded-2xl border border-[#E4D8D0] bg-white p-4">
        <p className="text-sm font-bold">
          What PairCheck checks
        </p>

        <div className="mt-3 space-y-2 text-xs text-[#74686B]">
          <p>• Null / unsafe access</p>
          <p>• Error handling</p>
          <p>• Security patterns</p>
          <p>• Code-quality issues</p>
        </div>
      </div>

    </main>
  )
}