import { useEffect, useState } from "react"

import {
  scanCode,
  type AnalysisResult,
  type CodeIssue,
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


/* =========================================================
   LANGUAGE SAMPLE CODE
========================================================= */

const languageSamples: Record<string, string> = {
  Python: `def get_user(user_id):
    user = db.get(user_id)

    if user:
        return user["name"]

    return None


result = get_user(42)
print(result["email"])`,

  JavaScript: `function getUser(id) {
  return users.find(user => user.id === id);
}

const user = getUser(42);

console.log(user.profile.email);`,

  TypeScript: `type User = {
  name: string;
  profile?: {
    email: string;
  };
};

const user = getUser(42);

console.log(user.profile.email);`,
}


/* =========================================================
   COMPONENT
========================================================= */

export default function LiveReview({
  initialCode,
  initialLanguage,
  onBack,
  onAnalysis,
}: LiveReviewProps) {

  const [code, setCode] =
    useState(
      initialCode ||
      languageSamples[initialLanguage] ||
      languageSamples.Python
    )

  const [language, setLanguage] =
    useState(
      initialLanguage || "Python"
    )

  const [result, setResult] =
    useState<AnalysisResult | null>(null)

  const [isScanning, setIsScanning] =
    useState(false)

  const [selectedIssue, setSelectedIssue] =
    useState<CodeIssue | null>(null)


  /* =====================================================
     INITIAL SCAN
  ===================================================== */

  useEffect(() => {

    const initialResult =
      scanCode(
        code,
        language
      )

    setResult(initialResult)

    setSelectedIssue(
      initialResult.issues[0] ?? null
    )

  }, [])


  /* =====================================================
     LIVE SCANNER
  ===================================================== */

  useEffect(() => {

    setIsScanning(true)

    const timer = setTimeout(() => {

      const analysis =
        scanCode(
          code,
          language
        )

      setResult(analysis)

      setSelectedIssue(
        analysis.issues[0] ?? null
      )

      setIsScanning(false)

    }, 400)

    return () => {
      clearTimeout(timer)
    }

  }, [code, language])


  /* =====================================================
     CHANGE LANGUAGE
  ===================================================== */

  const handleLanguageChange = (
    newLanguage: string
  ) => {

    setLanguage(newLanguage)

    /*
      For the prototype, changing the language
      also loads that language's demo code.

      This makes the experience feel like an
      actual multi-language code review tool.
    */

    const newCode =
      languageSamples[newLanguage] ||
      ""

    setCode(newCode)

    setSelectedIssue(null)

    setResult(null)
  }


  /* =====================================================
     OPEN FULL ANALYSIS
  ===================================================== */

  const openAnalysis = () => {

    if (!result) {
      return
    }

    onAnalysis(
      result,
      code,
      language
    )
  }


  const lines =
    code.split("\n")


  return (
    <main className="mx-auto min-h-[calc(100vh-68px)] max-w-md px-5 pb-28">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center gap-3 py-5">

        <button
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#DCCFC5] bg-white text-[#4E4246] transition hover:bg-[#F3E7E9]"
        >
          ←
        </button>


        <div>

          <p className="text-[10px] font-bold tracking-[0.18em] text-[#7A1F3D]">
            PAIRCHECK
          </p>

          <h1 className="text-[18px] font-bold text-[#24171B]">
            Live Review
          </h1>

        </div>


        {/* STATUS */}

        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-[#EAF7EE] px-2.5 py-1.5">

          <span
            className={`
              h-1.5 w-1.5 rounded-full
              ${
                isScanning
                  ? "animate-pulse bg-amber-500"
                  : "bg-green-500"
              }
            `}
          />

          <span className="text-[10px] font-medium text-[#4E4246]">

            {isScanning
              ? "Scanning"
              : "Watching"}

          </span>

        </div>

      </div>


      {/* =================================================
          INTRO
      ================================================= */}

      <div className="mb-5">

        <div className="mb-2 flex items-center gap-2">

          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7A1F3D] text-xs text-white">
            ✦
          </span>

          <span className="text-xs font-semibold text-[#7A1F3D]">
            Live static scan
          </span>

        </div>


        <h2 className="text-[30px] font-extrabold leading-[1.05] tracking-[-0.035em] text-[#24171B]">

          Type normally.
          <br />

          <span className="text-[#7A1F3D]">
            We'll watch the code.
          </span>

        </h2>


        <p className="mt-2 text-[13px] leading-5 text-[#74686B]">

          No scan button. PairCheck checks your
          code automatically while you type.

        </p>

      </div>


      {/* =================================================
          LANGUAGE SELECTOR
      ================================================= */}

      <div className="mb-3 flex items-center justify-between gap-3">

        <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#DCCFC5] bg-white px-3 py-2.5">

          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F3E7E9] font-mono text-[10px] font-bold text-[#7A1F3D]">
            {"</>"}
          </span>


          <select
            value={language}
            onChange={(event) =>
              handleLanguageChange(
                event.target.value
              )
            }
            className="w-full cursor-pointer bg-transparent text-xs font-semibold text-[#4E4246] outline-none"
          >

            <option value="Python">
              Python
            </option>

            <option value="JavaScript">
              JavaScript
            </option>

            <option value="TypeScript">
              TypeScript
            </option>

          </select>

        </div>


        {/* RESET SAMPLE */}

        <button
          onClick={() => {
            const freshCode =
              languageSamples[language]

            setCode(freshCode)

            setSelectedIssue(null)
          }}
          className="rounded-xl border border-[#DCCFC5] bg-white px-4 py-3 text-xs font-semibold text-[#4E4246] transition hover:bg-[#FBF8F4]"
        >
          Reset
        </button>

      </div>


      {/* =================================================
          CODE EDITOR
      ================================================= */}

      <div className="overflow-hidden rounded-[20px] border border-[#4A1025] bg-[#21191C] shadow-[0_12px_30px_rgba(74,16,37,0.14)]">

        {/* EDITOR BAR */}

        <div className="flex items-center justify-between border-b border-white/10 bg-[#2A2023] px-4 py-3">

          <div className="flex gap-1.5">

            <div className="h-2.5 w-2.5 rounded-full bg-[#E06B71]" />

            <div className="h-2.5 w-2.5 rounded-full bg-[#D8B05D]" />

            <div className="h-2.5 w-2.5 rounded-full bg-[#71B58A]" />

          </div>


          <span className="text-[9px] text-[#A99A9F]">

            main.
            {language === "TypeScript"
              ? "ts"
              : language === "JavaScript"
              ? "js"
              : "py"}

          </span>

        </div>


        {/* CODE AREA */}

        <div className="relative h-[310px]">

          {/* LINE NUMBERS */}

          <div className="absolute bottom-0 left-0 top-0 w-9 overflow-hidden border-r border-white/5 bg-[#181214] pt-4 pr-2 text-right font-mono text-[10px] leading-6 text-[#71666A] select-none">

            {lines.map((_, index) => (

              <div
                key={index}
                className={
                  selectedIssue?.line === index + 1
                    ? "font-bold text-[#F07B83]"
                    : ""
                }
              >
                {index + 1}
              </div>

            ))}

          </div>


          {/* TEXTAREA */}

          <textarea
            value={code}
            onChange={(event) =>
              setCode(event.target.value)
            }
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="h-full w-full resize-none overflow-auto bg-transparent py-4 pl-12 pr-3 font-mono text-[11px] leading-6 text-[#F0E8EA] outline-none"
          />

        </div>


        {/* EDITOR STATUS */}

        <div className="flex items-center justify-between border-t border-white/10 bg-[#2A2023] px-4 py-2.5">

          <div className="flex items-center gap-2">

            <span
              className={`
                h-1.5 w-1.5 rounded-full
                ${
                  isScanning
                    ? "bg-amber-400"
                    : result?.issues.length
                    ? "bg-red-400"
                    : "bg-green-400"
                }
              `}
            />


            <span className="text-[9px] text-[#A99A9F]">

              {isScanning
                ? "Checking..."
                : result?.issues.length
                ? `${result.issues.length} issue${
                    result.issues.length === 1
                      ? ""
                      : "s"
                  } found`
                : "No issues detected"}

            </span>

          </div>


          <span className="text-[9px] text-[#A99A9F]">
            On-device
          </span>

        </div>

      </div>


      {/* =================================================
          LIVE ISSUE
      ================================================= */}

      {selectedIssue &&
        !isScanning && (

        <div className="mt-4 overflow-hidden rounded-[18px] border border-[#E3C2C8] bg-white shadow-sm">

          {/* ISSUE HEADER */}

          <div className="flex items-start gap-3 bg-[#FFF7F8] p-4">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F9DDE2] text-[#B4233F]">
              !
            </div>


            <div className="min-w-0 flex-1">

              <div className="flex items-center justify-between gap-2">

                <h3 className="text-sm font-bold text-[#24171B]">
                  {selectedIssue.title}
                </h3>


                <span className="rounded-full bg-[#F9DDE2] px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-[#A31D39]">

                  {selectedIssue.severity}

                </span>

              </div>


              <p className="mt-1 text-[10px] text-[#8B7D82]">

                Line {selectedIssue.line}

                {" • "}

                {selectedIssue.category}

              </p>

            </div>

          </div>


          {/* EXPLANATION */}

          <div className="p-4">

            <p className="text-[10px] font-bold tracking-[0.12em] text-[#8B7D82]">
              WHY THIS MATTERS
            </p>


            <p className="mt-2 text-[12px] leading-5 text-[#4E4246]">
              {selectedIssue.explanation}
            </p>


            {/* FIX */}

            <div className="mt-4 rounded-xl bg-[#F7F1E8] p-3">

              <p className="text-[10px] font-bold tracking-[0.12em] text-[#7A1F3D]">
                SUGGESTED FIX
              </p>


              <p className="mt-1 text-[11px] leading-5 text-[#4E4246]">
                {selectedIssue.fix}
              </p>

            </div>


            <button
              onClick={openAnalysis}
              className="mt-4 w-full rounded-xl bg-[#7A1F3D] py-3 text-xs font-bold text-white transition hover:bg-[#651832]"
            >
              View Fix & Verify →
            </button>

          </div>

        </div>

      )}


      {/* =================================================
          CLEAN STATE
      ================================================= */}

      {!selectedIssue &&
        !isScanning &&
        result && (

        <div className="mt-4 flex items-center gap-3 rounded-[18px] border border-green-200 bg-green-50 p-4">

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700">
            ✓
          </div>


          <div>

            <p className="text-xs font-bold text-green-800">
              Looking good
            </p>

            <p className="mt-0.5 text-[10px] text-green-700/70">
              No problems detected by the local scanner.
            </p>

          </div>

        </div>

      )}


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="mt-5 flex items-center justify-center gap-2 text-[9px] text-[#8B7D82]">

        <span className="h-1.5 w-1.5 rounded-full bg-[#7A1F3D]" />

        PairCheck watches while you type

      </div>

    </main>
  )
}