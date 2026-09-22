
import { useState } from "react"

import GradientMenu, {
  type PairCheckScreen,
} from "./components/ui/gradient-menu"

import DevLens from "./components/DevLens"
import LiveReview from "./components/LiveReview"

import {
  scanCode,
  type AnalysisResult,
  type CodeIssue,
} from "./analysis/scanner"


const sampleCode = `def get_user(user_id):
    user = db.get(user_id)

    if user:
        return user["name"]

    return None


result = get_user(42)
print(result["email"])`


function App() {
  const [screen, setScreen] =
    useState<PairCheckScreen>("home")

  const [language, setLanguage] =
    useState("Python")

  const [code, setCode] =
    useState(sampleCode)

  const [analysis, setAnalysis] =
    useState<AnalysisResult | null>(null)

  const [selectedIssue, setSelectedIssue] =
    useState<CodeIssue | null>(null)

  const [correctedCode, setCorrectedCode] =
    useState<string | null>(null)

  const [fixed, setFixed] =
    useState(false)

  const [fixVerified, setFixVerified] =
    useState(false)


  /* =========================================================
     NAVIGATION
  ========================================================= */

  const navigate = (
    nextScreen: PairCheckScreen
  ) => {
    setScreen(nextScreen)
  }


  const goHome = () => {
    setScreen("home")
  }


  /* =========================================================
     RESET
  ========================================================= */

  const resetAnalysisState = () => {
    setAnalysis(null)
    setSelectedIssue(null)
    setCorrectedCode(null)
    setFixed(false)
    setFixVerified(false)
  }


  /* =========================================================
     ANALYSIS RESULT
  ========================================================= */

  const handleAnalysis = (
    result: AnalysisResult,
    reviewedCode: string,
    reviewedLanguage: string
  ) => {
    setAnalysis(result)

    setCode(reviewedCode)

    setLanguage(reviewedLanguage)

    setSelectedIssue(
      result.issues[0] ?? null
    )

    setCorrectedCode(null)

    setFixed(false)

    setFixVerified(false)

    setScreen("analysis")
  }


  /* =========================================================
     APPLY FIX
  ========================================================= */

  const applyFix = () => {
    if (!selectedIssue?.fixedCode) {
      return
    }

    const newCode =
      selectedIssue.fixedCode

    setCorrectedCode(newCode)

    setCode(newCode)

    setFixed(true)

    const verifiedResult =
      scanCode(
        newCode,
        language
      )

    setAnalysis(
      verifiedResult
    )

    setFixVerified(
      verifiedResult.issues.length === 0
    )
  }


  /* =========================================================
     BACK TO REVIEW
  ========================================================= */

  const backToReview = () => {
    setScreen("review")
  }


  return (
    <div className="min-h-screen bg-[#F7F1E8] text-[#24171B]">

      {/* =====================================================
          TOP APP BAR
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-[#DCCFC5] bg-[#F7F1E8]/95 backdrop-blur-xl">

        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5">

          {/* BRAND */}

          <button
            onClick={goHome}
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7A1F3D] text-lg font-bold text-white shadow-sm">
              P
            </div>

            <div className="text-lg font-semibold tracking-tight">
              PairCheck
            </div>
          </button>


          {/* DEVICE STATUS */}

          <div className="flex items-center gap-2 text-xs text-[#74686B]">

            <div className="h-2 w-2 rounded-full bg-green-500" />

            <span>
              On-device
            </span>

          </div>

        </div>

      </header>


      {/* =====================================================
          HOME
      ===================================================== */}

      {screen === "home" && (

        <main className="mx-auto max-w-6xl px-5 pb-28">

          <section className="flex min-h-[calc(100vh-68px)] items-start">

            <div className="w-full py-10 sm:py-16">

              {/* BADGE */}

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#B98295]/40 bg-[#7A1F3D]/5 px-4 py-2 text-xs text-[#7A1F3D]">

                <span className="h-2 w-2 rounded-full bg-[#7A1F3D]" />

                Offline AI Code Review

              </div>


              {/* HERO */}

              <h1 className="max-w-[650px] text-[48px] font-bold leading-[0.98] tracking-[-0.045em] text-[#24171B] sm:text-6xl md:text-7xl">

                See the bug.

                <br />

                <span className="text-[#7A1F3D]">
                  Understand it.
                </span>

                <br />

                Fix it.

              </h1>


              {/* DESCRIPTION */}

              <p className="mt-6 max-w-xl text-[15px] leading-7 text-[#74686B] sm:text-lg sm:leading-8">

                PairCheck is your phone-first AI
                pair programmer. Detect bugs,
                understand failures and apply fixes
                without depending on the cloud.

              </p>


              {/* ACTIONS */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <button
                  onClick={() =>
                    navigate("devlens")
                  }
                  className="rounded-xl bg-[#7A1F3D] px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#651832]"
                >
                  Open DevLens
                </button>


                <button
                  onClick={() =>
                    navigate("review")
                  }
                  className="rounded-xl border border-[#CFC1B7] bg-white/70 px-6 py-3.5 font-semibold transition hover:bg-white"
                >
                  Review Code
                </button>

              </div>

            </div>

          </section>

        </main>

      )}


      {/* =====================================================
          DEV LENS
      ===================================================== */}

      {screen === "devlens" && (

        <DevLens
          onBack={goHome}
          onAnalysis={handleAnalysis}
        />

      )}


      {/* =====================================================
          REVIEW CODE
      ===================================================== */}

      {screen === "review" && (

        <LiveReview
          initialCode={code}
          initialLanguage={language}
          onBack={goHome}
          onAnalysis={handleAnalysis}
        />

      )}


      {/* =====================================================
          ANALYSIS
      ===================================================== */}

      {screen === "analysis" && (

        <main className="mx-auto max-w-md px-5 pb-36 pt-5">

          {/* HEADER */}

          <div className="flex items-center gap-3">

            <button
              onClick={backToReview}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#DCCFC5] bg-white text-[#4E4246]"
            >
              ←
            </button>


            <div>

              <p className="text-[10px] font-bold tracking-[0.18em] text-[#7A1F3D]">
                PAIRCHECK
              </p>

              <h1 className="text-[18px] font-bold text-[#24171B]">
                Fix & Verify
              </h1>

            </div>


            <div className="ml-auto flex items-center gap-1.5 rounded-full bg-[#EAF7EE] px-2.5 py-1.5">

              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

              <span className="text-[10px] text-[#4E4246]">
                On-device
              </span>

            </div>

          </div>


          {/* STATUS */}

          <div className="mt-7">

            <div className="mb-2 flex items-center gap-2">

              <span
                className={`
                  flex h-7 w-7 items-center justify-center
                  rounded-full text-xs font-bold
                  ${
                    fixVerified
                      ? "bg-green-100 text-green-700"
                      : fixed
                      ? "bg-amber-100 text-amber-700"
                      : "bg-[#F9DDE2] text-[#A31D39]"
                  }
                `}
              >
                {fixVerified
                  ? "✓"
                  : "!"}
              </span>


              <span className="text-[10px] font-bold tracking-[0.16em] text-[#7A1F3D]">

                {fixVerified
                  ? "FIX VERIFIED"
                  : fixed
                  ? "FIX APPLIED"
                  : "ISSUE DETECTED"}

              </span>

            </div>


            <h2 className="text-[30px] font-extrabold leading-[1.05] tracking-[-0.04em] text-[#24171B]">

              {fixVerified
                ? "Your code is fixed."
                : fixed
                ? "Fix applied."
                : "We found a problem."}

            </h2>


            <p className="mt-2 text-[13px] leading-5 text-[#74686B]">

              {fixVerified
                ? "PairCheck fixed the issue and verified the corrected code."
                : fixed
                ? "The corrected code is shown below. PairCheck found other issues that may still need attention."
                : "PairCheck found an issue in the code you submitted."}

            </p>

          </div>


          {/* SCORE */}

          <div className="mt-5 flex items-center justify-between rounded-[18px] border border-[#DCCFC5] bg-white p-4 shadow-sm">

            <div>

              <p className="text-[9px] font-bold tracking-[0.15em] text-[#8B7D82]">
                CODE HEALTH
              </p>

              <p className="mt-1 text-[10px] text-[#74686B]">
                Local static analysis
              </p>

            </div>


            <div
              className={`
                text-2xl font-extrabold
                ${
                  fixVerified
                    ? "text-green-600"
                    : "text-[#7A1F3D]"
                }
              `}
            >

              {analysis?.score ?? 100}

              <span className="text-xs text-[#8B7D82]">
                /100
              </span>

            </div>

          </div>


          {/* ===================================================
              ORIGINAL ISSUE
          =================================================== */}

          {selectedIssue && !fixed && (

            <div className="mt-4 overflow-hidden rounded-[20px] border border-[#E3C2C8] bg-white shadow-sm">

              {/* ISSUE HEADER */}

              <div className="bg-[#FFF7F8] p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F9DDE2] font-bold text-[#A31D39]">
                    !
                  </div>


                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-2">

                      <h3 className="text-sm font-bold leading-5 text-[#24171B]">
                        {selectedIssue.title}
                      </h3>


                      <span className="shrink-0 rounded-full bg-[#F9DDE2] px-2 py-1 text-[8px] font-bold uppercase text-[#A31D39]">
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

              </div>


              {/* EXPLANATION */}

              <div className="p-4">

                <p className="text-[9px] font-bold tracking-[0.15em] text-[#8B7D82]">
                  UNDERSTAND
                </p>


                <p className="mt-2 text-[12px] leading-5 text-[#4E4246]">
                  {selectedIssue.explanation}
                </p>


                {/* FIX DESCRIPTION */}

                <div className="mt-4 rounded-[14px] bg-[#F7F1E8] p-4">

                  <p className="text-[9px] font-bold tracking-[0.15em] text-[#7A1F3D]">
                    PAIRCHECK'S FIX
                  </p>


                  <p className="mt-2 text-[11px] leading-5 text-[#4E4246]">
                    {selectedIssue.fix}
                  </p>

                </div>


                {/* FIX BUTTON */}

                <button
                  onClick={applyFix}
                  disabled={!selectedIssue.fixedCode}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#7A1F3D] py-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#651832] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {selectedIssue.fixedCode
                    ? "Fix Issue"
                    : "Fix unavailable"}

                  <span className="text-base">
                    →
                  </span>

                </button>

              </div>

            </div>

          )}


          {/* ===================================================
              ORIGINAL CODE
          =================================================== */}

          {selectedIssue && !fixed && (

            <div className="mt-4 overflow-hidden rounded-[20px] border border-[#4A1025] bg-[#21191C]">

              <div className="flex items-center justify-between border-b border-white/10 bg-[#2A2023] px-4 py-3">

                <div>

                  <p className="text-[10px] font-bold text-white">
                    Your Code
                  </p>

                  <p className="mt-0.5 text-[8px] text-[#A99A9F]">
                    Problem detected here
                  </p>

                </div>


                <span className="text-[9px] text-[#F07B83]">
                  Line {selectedIssue.line}
                </span>

              </div>


              <div className="max-h-[300px] overflow-auto">

                {code
                  .split("\n")
                  .map((line, index) => {

                    const lineNumber =
                      index + 1

                    const isProblemLine =
                      lineNumber === selectedIssue.line

                    return (

                      <div
                        key={index}
                        className={`
                          flex min-w-max
                          ${
                            isProblemLine
                              ? "bg-red-500/10"
                              : ""
                          }
                        `}
                      >

                        <span className="w-9 shrink-0 select-none border-r border-white/5 bg-[#181214] px-2 py-1 text-right font-mono text-[9px] text-[#71666A]">
                          {lineNumber}
                        </span>


                        <code
                          className={`
                            px-3 py-1 font-mono text-[10px] leading-5
                            ${
                              isProblemLine
                                ? "font-bold text-[#F07B83]"
                                : "text-[#E8DEE1]"
                            }
                          `}
                        >
                          {line || " "}
                        </code>

                      </div>

                    )
                  })}

              </div>

            </div>

          )}


          {/* ===================================================
              CORRECTED CODE
          =================================================== */}

          {fixed && correctedCode && (

            <div className="mt-5">

              {/* STATUS */}

              <div
                className={`
                  mb-4 flex items-center gap-3 rounded-[16px] border p-4
                  ${
                    fixVerified
                      ? "border-green-200 bg-green-50"
                      : "border-amber-200 bg-amber-50"
                  }
                `}
              >

                <div
                  className={`
                    flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                    ${
                      fixVerified
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }
                  `}
                >
                  {fixVerified
                    ? "✓"
                    : "!"}
                </div>


                <div>

                  <p
                    className={`
                      text-xs font-bold
                      ${
                        fixVerified
                          ? "text-green-800"
                          : "text-amber-800"
                      }
                    `}
                  >
                    {fixVerified
                      ? "Fix verified"
                      : "Fix applied"}
                  </p>


                  <p
                    className={`
                      mt-0.5 text-[10px]
                      ${
                        fixVerified
                          ? "text-green-700/70"
                          : "text-amber-700/70"
                      }
                    `}
                  >
                    {fixVerified
                      ? "PairCheck re-scanned the corrected code and found no remaining issues."
                      : "The corrected code is shown below. The scanner found additional issues."}
                  </p>

                </div>

              </div>


              {/* CORRECTED CODE */}

              <div className="overflow-hidden rounded-[20px] border border-green-300 bg-[#21191C] shadow-sm">

                <div className="flex items-center justify-between border-b border-white/10 bg-[#2A2023] px-4 py-3">

                  <div>

                    <p className="text-[10px] font-bold text-white">
                      Corrected Code
                    </p>

                    <p className="mt-0.5 text-[8px] text-green-300">

                      {fixVerified
                        ? "✓ Issue resolved"
                        : "✓ Fix applied"}

                    </p>

                  </div>


                  <span
                    className={`
                      rounded-full px-2 py-1 text-[8px] font-bold
                      ${
                        fixVerified
                          ? "bg-green-500/10 text-green-300"
                          : "bg-amber-500/10 text-amber-300"
                      }
                    `}
                  >
                    {fixVerified
                      ? "VERIFIED"
                      : "APPLIED"}
                  </span>

                </div>


                <div className="max-h-[380px] overflow-auto">

                  {correctedCode
                    .split("\n")
                    .map((line, index) => {

                      const lineNumber =
                        index + 1

                      return (

                        <div
                          key={index}
                          className="flex min-w-max"
                        >

                          <span className="w-9 shrink-0 select-none border-r border-white/5 bg-[#181214] px-2 py-1 text-right font-mono text-[9px] text-[#71666A]">
                            {lineNumber}
                          </span>


                          <code
                            className={`
                              px-3 py-1 font-mono text-[10px] leading-5
                              ${
                                lineNumber === selectedIssue?.line
                                  ? "font-bold text-green-200"
                                  : "text-[#E8DEE1]"
                              }
                            `}
                          >
                            {line || " "}
                          </code>

                        </div>

                      )
                    })}

                </div>

              </div>


              {/* REMAINING ISSUES */}

              {analysis &&
                analysis.issues.length > 0 && (

                  <div className="mt-4 rounded-[20px] border border-[#E3C2C8] bg-white p-4">

                    <div className="flex items-center justify-between">

                      <p className="text-[9px] font-bold tracking-[0.15em] text-[#8B7D82]">
                        REMAINING ISSUES
                      </p>


                      <span className="rounded-full bg-[#F9DDE2] px-2 py-1 text-[8px] font-bold text-[#A31D39]">
                        {analysis.issues.length}
                      </span>

                    </div>


                    <div className="mt-3 space-y-2">

                      {analysis.issues.map(
                        (issue, index) => (

                          <div
                            key={`${issue.id}-${index}`}
                            className="rounded-[12px] bg-[#FFF7F8] p-3"
                          >

                            <div className="flex items-start justify-between gap-2">

                              <div>

                                <p className="text-[11px] font-bold text-[#24171B]">
                                  {issue.title}
                                </p>

                                <p className="mt-1 text-[9px] text-[#8B7D82]">
                                  Line {issue.line}
                                  {" • "}
                                  {issue.category}
                                </p>

                              </div>


                              <span className="rounded-full bg-[#F9DDE2] px-2 py-1 text-[7px] font-bold uppercase text-[#A31D39]">
                                {issue.severity}
                              </span>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}


              {/* VERIFICATION */}

              <div className="mt-4 rounded-[20px] border border-[#DCCFC5] bg-white p-4">

                <p className="mb-4 text-[9px] font-bold tracking-[0.15em] text-[#8B7D82]">
                  VERIFICATION
                </p>


                <div className="space-y-3">

                  <VerificationRow
                    label="Issue detected"
                    done
                  />

                  <VerificationRow
                    label="Fix generated from your code"
                    done
                  />

                  <VerificationRow
                    label="Corrected code applied"
                    done
                  />

                  <VerificationRow
                    label="Code re-scanned"
                    done
                  />

                  <VerificationRow
                    label="Issue resolved"
                    done={fixVerified}
                  />

                </div>

              </div>

            </div>

          )}


          {/* ===================================================
              NO ISSUES
          =================================================== */}

          {!selectedIssue &&
            !fixed && (

              <div className="mt-5 rounded-[20px] border border-green-200 bg-green-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700">
                    ✓
                  </div>


                  <div>

                    <p className="text-sm font-bold text-green-800">
                      No issues detected
                    </p>

                    <p className="mt-1 text-[10px] text-green-700/70">
                      Your code passed the local scanner.
                    </p>

                  </div>

                </div>

              </div>

            )}


          {/* CONTINUE */}

          <button
            onClick={() => {
              resetAnalysisState()
              setScreen("review")
            }}
            className="mt-5 w-full rounded-[14px] border border-[#DCCFC5] bg-white py-3.5 text-xs font-semibold text-[#4E4246] transition hover:bg-[#FFFDF9]"
          >
            Continue Reviewing
          </button>

        </main>

      )}


      {/* =====================================================
          BOTTOM NAVIGATION
      ===================================================== */}

      <GradientMenu
        activeScreen={screen}
        onNavigate={navigate}
        hasAnalysis={Boolean(analysis)}
      />

    </div>
  )
}


/* =========================================================
   VERIFICATION ROW
========================================================= */

function VerificationRow({
  label,
  done,
}: {
  label: string
  done: boolean
}) {

  return (

    <div className="flex items-center gap-3">

      <div
        className={`
          flex h-6 w-6 shrink-0 items-center justify-center
          rounded-full text-[10px] font-bold
          ${
            done
              ? "bg-green-100 text-green-700"
              : "bg-[#F1EBE5] text-[#8B7D82]"
          }
        `}
      >
        {done
          ? "✓"
          : "○"}
      </div>


      <span
        className={
          done
            ? "text-[11px] text-[#4E4246]"
            : "text-[11px] text-[#8B7D82]"
        }
      >
        {label}
      </span>

    </div>

  )
}


export default App