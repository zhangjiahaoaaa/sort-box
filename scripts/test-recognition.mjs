import { execFileSync } from "node:child_process"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"

const tempDir = ".tmp-recognition-test"

rmSync(tempDir, { recursive: true, force: true })
mkdirSync(tempDir, { recursive: true })

writeFileSync(
  `${tempDir}/tsconfig.json`,
  JSON.stringify(
    {
      compilerOptions: {
        target: "ES2020",
        module: "Node16",
        moduleResolution: "Node16",
        ignoreDeprecations: "6.0",
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
        baseUrl: "..",
        paths: {
          "@/*": ["./*"],
        },
        rootDir: "..",
        outDir: "dist",
      },
      include: ["test.ts", "../lib/recognition.ts", "../lib/types.ts"],
    },
    null,
    2,
  ),
)

writeFileSync(
  `${tempDir}/test.ts`,
  `
import { recognizeNotice } from "../lib/recognition"

assertDeadline(
  "矩阵论期末考试展示下周三进行，请每组提前上传 PPT",
  "下周三",
  "2026-05-27",
)

assertDeadline(
  "随机过程期末考试展示下周1进行，请每组提前上传 PPT",
  "下周1",
  "2026-05-25",
)

console.log("recognition tests passed")

function assertDeadline(text: string, expectedSource: string, expectedDate: string) {
  const result = recognizeNotice(
    text,
    [],
    undefined,
    new Date("2026-05-20T12:00:00+08:00"),
  )

  if (result.deadlineSourceText !== expectedSource) {
    throw new Error(\`Expected source \${expectedSource}, got \${result.deadlineSourceText}\`)
  }

  const deadline = new Date(result.deadline!)
  const localDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(deadline)

  if (localDate !== expectedDate) {
    throw new Error(\`Expected \${expectedDate}, got \${localDate}\`)
  }
}
`,
)

execFileSync(process.execPath, ["node_modules/typescript/bin/tsc", "-p", `${tempDir}/tsconfig.json`], {
  stdio: "inherit",
})

execFileSync(process.execPath, [`${tempDir}/dist/.tmp-recognition-test/test.js`], {
  stdio: "inherit",
})

rmSync(tempDir, { recursive: true, force: true })
