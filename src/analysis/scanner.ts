export type IssueSeverity = "critical" | "warning" | "info"

export type CodeIssue = {
  id: string
  title: string
  severity: IssueSeverity
  line: number
  explanation: string
  fix: string
  category: string
  fixedCode?: string
}

export type AnalysisResult = {
  issues: CodeIssue[]
  score: number
  linesScanned: number
}

function getIndentation(line: string) {
  return line.match(/^\s*/)?.[0] ?? ""
}

function calculateScore(issues: CodeIssue[]) {
  let score = 100

  for (const issue of issues) {
    if (issue.severity === "critical") score -= 25
    else if (issue.severity === "warning") score -= 15
    else score -= 5
  }

  return Math.max(0, score)
}

/* ---------------------------------------------------------
   PYTHON: POSSIBLE NONE / UNSAFE ACCESS
--------------------------------------------------------- */

function scanPythonNoneAccess(code: string): CodeIssue[] {
  const lines = code.split("\n")
  const issues: CodeIssue[] = []

  const assignments = new Map<string, number>()

  lines.forEach((line, index) => {
    const match = line.match(
      /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*[A-Za-z_][A-Za-z0-9_]*\s*\(/
    )

    if (match) {
      assignments.set(match[1], index)
    }
  })

  for (const [variable, assignmentLine] of assignments.entries()) {
    for (let i = assignmentLine + 1; i < lines.length; i++) {
      const line = lines[i]

      const accessPattern = new RegExp(
        `\\b${variable}\\s*(?:\\[|\\.)`
      )

      if (!accessPattern.test(line)) {
        continue
      }

      // Check whether the variable is already protected.
      let protectedAccess = false

      for (let j = i - 1; j >= Math.max(0, i - 4); j--) {
        const previousLine = lines[j].trim()

        if (previousLine === `if ${variable}:`) {
          protectedAccess = true
          break
        }

        // Stop looking once we hit another statement.
        if (
          previousLine &&
          !previousLine.startsWith("if ") &&
          !previousLine.startsWith("#") &&
          j !== i - 1
        ) {
          break
        }
      }

      if (protectedAccess) {
        continue
      }

      const originalIndent = getIndentation(line)

      // Check if the exact guard already exists immediately above.
      const previousNonEmptyIndex = (() => {
        for (let j = i - 1; j >= 0; j--) {
          if (lines[j].trim() !== "") {
            return j
          }
        }

        return -1
      })()

      const alreadyGuarded =
        previousNonEmptyIndex >= 0 &&
        lines[previousNonEmptyIndex].trim() === `if ${variable}:`

      let fixedCode = code

      if (!alreadyGuarded) {
        const fixedLines = [...lines]

        fixedLines.splice(
          i,
          0,
          `${originalIndent}if ${variable}:`,
          `${originalIndent}    ${line.trim()}`
        )

        // Remove the original unsafe line because it was replaced
        // by the indented version above.
        fixedLines.splice(i + 2, 1)

        fixedCode = fixedLines.join("\n")
      }

      issues.push({
        id: `python-none-${variable}-${i}`,
        title: `Possible unsafe access to "${variable}"`,
        severity: "warning",
        line: i + 1,
        category: "Null Safety",
        explanation:
          `"${variable}" comes from a function call and may be None. ` +
          `Accessing it directly can cause a runtime error.`,
        fix:
          `Check that "${variable}" exists before accessing its properties or keys.`,
        fixedCode,
      })

      // Only report the first unsafe access for this variable.
      break
    }
  }

  return issues
}

/* ---------------------------------------------------------
   PYTHON: BARE EXCEPT
--------------------------------------------------------- */

function scanPythonBareExcept(code: string): CodeIssue[] {
  const lines = code.split("\n")
  const issues: CodeIssue[] = []

  lines.forEach((line, index) => {
    if (/^\s*except\s*:/.test(line)) {
      const fixedLines = [...lines]

      fixedLines[index] = line.replace(
        /except\s*:/,
        "except Exception:"
      )

      issues.push({
        id: `python-except-${index}`,
        title: "Bare exception handler",
        severity: "warning",
        line: index + 1,
        category: "Error Handling",
        explanation:
          "A bare except catches every exception, including exceptions that should usually propagate.",
        fix:
          "Catch Exception explicitly so unexpected system-level exceptions are not silently swallowed.",
        fixedCode: fixedLines.join("\n"),
      })
    }
  })

  return issues
}

/* ---------------------------------------------------------
   PYTHON: EVAL / EXEC
--------------------------------------------------------- */

function scanPythonDynamicExecution(code: string): CodeIssue[] {
  const lines = code.split("\n")
  const issues: CodeIssue[] = []

  lines.forEach((line, index) => {
    if (/\b(eval|exec)\s*\(/.test(line)) {
      const fixedLines = [...lines]

      fixedLines[index] =
        `${getIndentation(line)}# Replace dynamic execution with explicit parsing and validation`

      issues.push({
        id: `python-dynamic-${index}`,
        title: "Dynamic code execution",
        severity: "critical",
        line: index + 1,
        category: "Security",
        explanation:
          "eval() or exec() can execute dynamically supplied code and may create a security vulnerability.",
        fix:
          "Replace dynamic execution with explicit parsing and validation.",
        fixedCode: fixedLines.join("\n"),
      })
    }
  })

  return issues
}

/* ---------------------------------------------------------
   JAVASCRIPT / TYPESCRIPT: UNSAFE PROPERTY ACCESS
--------------------------------------------------------- */

function scanJavaScriptUnsafeAccess(code: string): CodeIssue[] {
  const lines = code.split("\n")
  const issues: CodeIssue[] = []

  const assignments = new Map<string, number>()

  lines.forEach((line, index) => {
    const match = line.match(
      /^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*[A-Za-z_$][\w$]*\s*\(/
    )

    if (match) {
      assignments.set(match[1], index)
    }
  })

  for (const [variable, assignmentLine] of assignments.entries()) {
    for (let i = assignmentLine + 1; i < lines.length; i++) {
      const line = lines[i]

      const unsafePattern = new RegExp(
        `\\b${variable}\\.[A-Za-z_$][\\w$]*`
      )

      if (!unsafePattern.test(line)) {
        continue
      }

      if (line.includes(`${variable}?.`)) {
        continue
      }

      const fixedLines = [...lines]

      fixedLines[i] = line.replace(
        new RegExp(`\\b${variable}\\.`, "g"),
        `${variable}?.`
      )

      issues.push({
        id: `js-unsafe-${variable}-${i}`,
        title: `Unsafe property access on "${variable}"`,
        severity: "warning",
        line: i + 1,
        category: "Null Safety",
        explanation:
          `"${variable}" comes from a function call and may be undefined or null before its property is accessed.`,
        fix:
          `Use optional chaining or explicitly validate "${variable}" before accessing its properties.`,
        fixedCode: fixedLines.join("\n"),
      })

      break
    }
  }

  return issues
}

/* ---------------------------------------------------------
   JAVASCRIPT / TYPESCRIPT: JSON.PARSE
--------------------------------------------------------- */

function scanJsonParse(code: string): CodeIssue[] {
  const lines = code.split("\n")
  const issues: CodeIssue[] = []

  lines.forEach((line, index) => {
    if (!/JSON\.parse\s*\(/.test(line)) {
      return
    }

    const previousLines = lines
      .slice(Math.max(0, index - 5), index)
      .join("\n")

    if (previousLines.includes("try {")) {
      return
    }

    const indent = getIndentation(line)

    const fixedLines = [...lines]

    fixedLines.splice(
      index,
      1,
      `${indent}try {`,
      `${indent}  ${line.trim()}`,
      `${indent}} catch (error) {`,
      `${indent}  console.error("Invalid JSON:", error)`,
      `${indent}}`
    )

    issues.push({
      id: `json-parse-${index}`,
      title: "Unprotected JSON parsing",
      severity: "warning",
      line: index + 1,
      category: "Error Handling",
      explanation:
        "JSON.parse() throws an exception when the input is invalid JSON.",
      fix:
        "Wrap JSON.parse() in error handling so malformed input does not crash the flow.",
      fixedCode: fixedLines.join("\n"),
    })
  })

  return issues
}

/* ---------------------------------------------------------
   JAVASCRIPT / TYPESCRIPT: CONSOLE.LOG
--------------------------------------------------------- */

function scanConsoleLogs(code: string): CodeIssue[] {
  const lines = code.split("\n")
  const issues: CodeIssue[] = []

  lines.forEach((line, index) => {
    if (!/^\s*console\.log\s*\(/.test(line)) {
      return
    }

    const fixedLines = [...lines]
    fixedLines.splice(index, 1)

    issues.push({
      id: `console-log-${index}`,
      title: "Debug console log",
      severity: "info",
      line: index + 1,
      category: "Code Quality",
      explanation:
        "Console logging is useful during development but may expose debugging information in production.",
      fix:
        "Remove temporary console logging or replace it with a structured logging system.",
      fixedCode: fixedLines.join("\n"),
    })
  })

  return issues
}

/* ---------------------------------------------------------
   GENERIC TODO / FIXME
--------------------------------------------------------- */

function scanTodo(code: string): CodeIssue[] {
  const lines = code.split("\n")
  const issues: CodeIssue[] = []

  lines.forEach((line, index) => {
    if (!/\b(TODO|FIXME)\b/i.test(line)) {
      return
    }

    const fixedLines = [...lines]

    fixedLines[index] = line.replace(
      /\b(TODO|FIXME)\b\s*:?\s*/gi,
      ""
    )

    issues.push({
      id: `todo-${index}`,
      title: "Unresolved TODO/FIXME",
      severity: "info",
      line: index + 1,
      category: "Code Quality",
      explanation:
        "This code contains a TODO or FIXME marker indicating unfinished work.",
      fix:
        "Complete the task or remove the marker once the code is ready.",
      fixedCode: fixedLines.join("\n"),
    })
  })

  return issues
}

/* ---------------------------------------------------------
   MAIN SCANNER
--------------------------------------------------------- */

export function scanCode(
  code: string,
  language: string
): AnalysisResult {
  const normalizedLanguage = language.toLowerCase()

  let issues: CodeIssue[] = []

  if (normalizedLanguage === "python") {
    issues.push(...scanPythonNoneAccess(code))
    issues.push(...scanPythonBareExcept(code))
    issues.push(...scanPythonDynamicExecution(code))
  }

  if (
    normalizedLanguage === "javascript" ||
    normalizedLanguage === "typescript"
  ) {
    issues.push(...scanJavaScriptUnsafeAccess(code))
    issues.push(...scanJsonParse(code))
    issues.push(...scanConsoleLogs(code))
  }

  issues.push(...scanTodo(code))

  issues.sort((a, b) => {
    const severityOrder = {
      critical: 0,
      warning: 1,
      info: 2,
    }

    return (
      severityOrder[a.severity] - severityOrder[b.severity] ||
      a.line - b.line
    )
  })

  return {
    issues,
    score: calculateScore(issues),
    linesScanned: code.split("\n").length,
  }
}