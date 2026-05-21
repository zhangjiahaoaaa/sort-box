import { NextRequest, NextResponse } from "next/server"
import { recognizeNotice } from "@/lib/recognition"
import type { Course, RecognitionDraft } from "@/lib/types"

type RequestBody = {
  rawText?: string
  courses?: Course[]
  selectedCourseId?: string
  referenceDate?: string
}

type AiNoticeResult = {
  courseName: string
  title: string
  deadlineText: string
  parsedDeadline: string
  submitMethod: string
  tags: string[]
  confidence: number
  needsReview: boolean
}

const noticeRecognitionSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "courseName",
    "title",
    "deadlineText",
    "parsedDeadline",
    "submitMethod",
    "tags",
    "confidence",
    "needsReview",
  ],
  properties: {
    courseName: {
      type: "string",
      description: "课程名称；无法判断时返回空字符串。",
    },
    title: {
      type: "string",
      description: "待办事项标题；无法判断时返回空字符串。",
    },
    deadlineText: {
      type: "string",
      description: "通知原文中的截止时间表达；无法判断时返回空字符串。",
    },
    parsedDeadline: {
      type: "string",
      description:
        "按当前日期解析后的 ISO-like 时间，例如 2026-05-22T22:00:00；无法判断时返回空字符串。",
    },
    submitMethod: {
      type: "string",
      description: "提交方式；无法判断时返回空字符串。",
    },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "适合搜索和归档的短标签。",
    },
    confidence: {
      type: "number",
      description: "0 到 1 的整体置信度。",
    },
    needsReview: {
      type: "boolean",
      description: "只要任何字段不确定，就返回 true。",
    },
  },
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RequestBody
  const rawText = body.rawText?.trim() || ""
  const courses = Array.isArray(body.courses) ? body.courses : []
  const referenceDate = body.referenceDate
    ? new Date(body.referenceDate)
    : new Date()
  const mockDraft = recognizeNotice(
    rawText,
    courses,
    body.selectedCourseId,
    referenceDate,
  )

  if (!rawText) {
    return NextResponse.json({ draft: mockDraft, provider: "mock" })
  }

  const aiConfig = getAiConfig()
  if (!aiConfig) {
    return NextResponse.json({ draft: mockDraft, provider: "mock" })
  }

  try {
    const aiResult = await recognizeNoticeWithOpenAI({
      ...aiConfig,
      rawText,
      courses,
      referenceDate,
    })

    return NextResponse.json({
      draft: mapAiResultToDraft({
        aiResult,
        mockDraft,
        rawText,
        courses,
        selectedCourseId: body.selectedCourseId,
      }),
      provider: aiConfig.provider,
    })
  } catch {
    return NextResponse.json({ draft: mockDraft, provider: "mock" })
  }
}

async function recognizeNoticeWithOpenAI({
  apiKey,
  baseUrl,
  model,
  rawText,
  courses,
  referenceDate,
}: {
  apiKey: string
  baseUrl: string
  model: string
  rawText: string
  courses: Course[]
  referenceDate: Date
}) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "你是大学课程通知识别器。只从用户提供的通知中提取信息，必须返回 JSON。AI 只提供建议，字段不确定时 needsReview=true，不要编造不存在的信息。",
        },
        {
          role: "user",
          content: JSON.stringify({
            today: toLocalDateString(referenceDate),
            existingCourses: courses.map((course) => course.name),
            notice: rawText,
          }),
        },
      ],
      response_format: buildResponseFormat(model),
    }),
  })

  if (!response.ok) {
    throw new Error("OpenAI notice recognition failed")
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = payload.choices?.[0]?.message?.content
  if (!content) {
    throw new Error("OpenAI notice recognition returned empty content")
  }

  return JSON.parse(content) as AiNoticeResult
}

function buildResponseFormat(model: string) {
  if (model.startsWith("deepseek")) {
    return {
      type: "json_object",
    }
  }

  return {
    type: "json_schema",
    json_schema: {
      name: "course_notice_recognition",
      strict: true,
      schema: noticeRecognitionSchema,
    },
  }
}

function getAiConfig() {
  const preferredProvider = process.env.NOTICE_AI_PROVIDER?.toLowerCase()
  const deepSeekKey = process.env.DEEPSEEK_API_KEY
  const openAiKey = process.env.OPENAI_API_KEY

  if ((preferredProvider === "deepseek" || !preferredProvider) && deepSeekKey) {
    return {
      provider: "deepseek",
      apiKey: deepSeekKey,
      baseUrl: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
      model: process.env.DEEPSEEK_NOTICE_MODEL || "deepseek-chat",
    }
  }

  if ((preferredProvider === "openai" || !preferredProvider) && openAiKey) {
    return {
      provider: "openai",
      apiKey: openAiKey,
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      model: process.env.OPENAI_NOTICE_MODEL || "gpt-4o-mini",
    }
  }

  return null
}

function mapAiResultToDraft({
  aiResult,
  mockDraft,
  rawText,
  courses,
  selectedCourseId,
}: {
  aiResult: AiNoticeResult
  mockDraft: RecognitionDraft
  rawText: string
  courses: Course[]
  selectedCourseId?: string
}): RecognitionDraft {
  const courseName = aiResult.courseName.trim()
  const matchedCourse = courses.find((course) => course.name === courseName)
  const courseId = selectedCourseId || matchedCourse?.id
  const parsedDeadline = normalizeParsedDeadline(aiResult.parsedDeadline)
  const confidence = clampConfidence(aiResult.confidence)
  const needsReview = aiResult.needsReview || confidence < 0.85

  return {
    rawText,
    courseId,
    suggestedCourseName:
      !courseId && courseName ? courseName : mockDraft.suggestedCourseName,
    title: aiResult.title.trim() || mockDraft.title,
    deadline: parsedDeadline || mockDraft.deadline,
    deadlineSourceText: aiResult.deadlineText.trim() || mockDraft.deadlineSourceText,
    submitMethod: aiResult.submitMethod.trim() || mockDraft.submitMethod,
    tags: aiResult.tags.length ? aiResult.tags : mockDraft.tags,
    confidenceFlags: {
      courseUnmatched: !courseId,
      deadlineUncertain: needsReview || !parsedDeadline,
      submitMethodUncertain: needsReview || !aiResult.submitMethod.trim(),
    },
  }
}

function normalizeParsedDeadline(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
}

function clampConfidence(value: number) {
  if (Number.isNaN(value)) {
    return 0
  }

  return Math.min(1, Math.max(0, value))
}

function toLocalDateString(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  }).format(date)
}
