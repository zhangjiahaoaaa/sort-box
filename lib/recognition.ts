import type { Course, RecognitionDraft } from "@/lib/types"

const tagKeywords = [
  "作业",
  "考试",
  "复习",
  "实验",
  "论文",
  "小组",
  "预习",
  "课程资料",
  "展示",
  "报告",
]

const submitMethods = [
  { keyword: "学习通", label: "学习通提交" },
  { keyword: "邮箱", label: "邮箱提交" },
  { keyword: "群文件", label: "群文件提交" },
  { keyword: "QQ群", label: "QQ群提交" },
  { keyword: "微信群", label: "微信群提交" },
  { keyword: "课堂派", label: "课堂派提交" },
  { keyword: "纸质版", label: "纸质版提交" },
]

export function recognizeNotice(
  rawText: string,
  courses: Course[],
  selectedCourseId?: string,
  referenceDate?: Date,
): RecognitionDraft {
  const normalizedText = rawText.trim()
  const matchedCourse = courses.find((course) => normalizedText.includes(course.name))
  const courseId = selectedCourseId || matchedCourse?.id
  const suggestedCourseName = courseId
    ? undefined
    : extractSuggestedCourseName(normalizedText, courses)
  const deadlineResult = extractDeadline(normalizedText, referenceDate)
  const submitMethod = extractSubmitMethod(normalizedText)

  return {
    rawText: normalizedText,
    courseId,
    suggestedCourseName,
    title: extractTitle(normalizedText),
    deadline: deadlineResult.deadline,
    deadlineSourceText: deadlineResult.sourceText,
    submitMethod,
    tags: extractTags(normalizedText),
    confidenceFlags: {
      courseUnmatched: !courseId,
      deadlineUncertain: !deadlineResult.deadline,
      submitMethodUncertain: !submitMethod,
    },
  }
}

function extractTitle(text: string) {
  const sentence =
    text
      .split(/[。！？\n]/)
      .map((item) => item.trim())
      .find((item) => /作业|实验|考试|论文|提交|展示|报告|复习/.test(item)) ||
    text.split(/[。！？\n]/)[0]?.trim()

  if (!sentence) {
    return "待确认事项"
  }

  return sentence.length > 28 ? `${sentence.slice(0, 28)}...` : sentence
}

function extractSuggestedCourseName(text: string, courses: Course[]) {
  const cleaned = text.replace(/\s+/g, "")
  const existingNames = new Set(courses.map((course) => course.name))
  const patterns = [
    /^([\u4e00-\u9fa5A-Za-z0-9]{2,12}?)(?:期末|考试|作业|实验|论文|展示|报告|复习|课程)/,
    /(?:关于|通知[:：]?)([\u4e00-\u9fa5A-Za-z0-9]{2,12}?)(?:期末|考试|作业|实验|论文|展示|报告|复习|课程)/,
    /([\u4e00-\u9fa5A-Za-z0-9]{2,12}?)(?:课|课程)(?:的)?(?:作业|实验|考试|通知|资料)/,
  ]

  for (const pattern of patterns) {
    const match = cleaned.match(pattern)
    const candidate = sanitizeCourseCandidate(match?.[1])
    if (candidate && !existingNames.has(candidate)) {
      return candidate
    }
  }

  return undefined
}

function sanitizeCourseCandidate(value?: string) {
  if (!value) {
    return undefined
  }

  const candidate = value
    .replace(/^(请|各位|同学|关于|通知|本次|这次)+/, "")
    .split(/下周|本周|这周|星期|周[一二三四五六日天1-7]?|今天|明天|后天|今晚|明晚|上午|中午|下午|晚上|需要|请|务必|将|于|在|前|之前|截止|提交|上传/)
    [0]
    ?.replace(/[，。！？:：；;、]+$/, "")
    .trim()

  if (
    !candidate ||
    candidate.length < 2 ||
    candidate.length > 10 ||
    /^(作业|实验|考试|论文|展示|报告|复习|课程|资料)$/.test(candidate)
  ) {
    return undefined
  }

  return candidate
}

function extractDeadline(text: string, referenceDate = new Date()): {
  deadline?: string
  sourceText?: string
} {
  const now = referenceDate
  const year = now.getFullYear()
  const timeResult = extractTime(text)
  const hour = timeResult.hour
  const minute = timeResult.minute

  const isoDate = text.match(/(20\d{2})[-/.年](\d{1,2})[-/.月](\d{1,2})/)
  if (isoDate) {
    return {
      deadline: toIso(Number(isoDate[1]), Number(isoDate[2]), Number(isoDate[3]), hour, minute),
      sourceText: withTimeSource(isoDate[0], timeResult.sourceText),
    }
  }

  const monthDate = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*[日号]?/)
  if (monthDate) {
    return {
      deadline: toIso(year, Number(monthDate[1]), Number(monthDate[2]), hour, minute),
      sourceText: withTimeSource(monthDate[0], timeResult.sourceText),
    }
  }

  const slashDate = text.match(/(?<!\d)(\d{1,2})\/(\d{1,2})(?!\d)/)
  if (slashDate) {
    return {
      deadline: toIso(year, Number(slashDate[1]), Number(slashDate[2]), hour, minute),
      sourceText: withTimeSource(slashDate[0], timeResult.sourceText),
    }
  }

  const shortNight = text.match(/(今晚|明晚)/)
  if (shortNight) {
    const date = new Date(now)
    date.setDate(date.getDate() + (shortNight[1] === "明晚" ? 1 : 0))
    applyTime(date, hour, minute)
    return {
      deadline: date.toISOString(),
      sourceText: withTimeSource(shortNight[1], timeResult.sourceText),
    }
  }

  const relativeDay = text.match(/(今天|今日|明天|明日|后天)(?:晚上|晚|上午|中午|下午)?/)
  if (relativeDay) {
    const date = new Date(now)
    const offsetMap: Record<string, number> = {
      今天: 0,
      今日: 0,
      明天: 1,
      明日: 1,
      后天: 2,
    }
    date.setDate(date.getDate() + offsetMap[relativeDay[1]])
    applyTime(date, hour, minute)
    return {
      deadline: date.toISOString(),
      sourceText: withTimeSource(relativeDay[0], timeResult.sourceText),
    }
  }

  const weekPhrase = text.match(
    /((?:下周|本周|这周)[一二三四五六日天1-7](?:前|之前)?|(?:下星期|本星期|这星期|星期|周)[一二三四五六日天1-7](?:前|之前)?)/,
  )
  if (weekPhrase) {
    const weekday = weekPhrase[0].match(/[周星期]([一二三四五六日天1-7])/)?.[1]
    if (weekday) {
      const forceNextWeek = /下周|下星期/.test(weekPhrase[0])
      return {
        deadline: nextWeekdayIso(weekday, hour, minute, forceNextWeek, now),
        sourceText: withTimeSource(weekPhrase[0], timeResult.sourceText),
      }
    }
  }

  const weekday = text.match(/周([一二三四五六日天1-7])前?/)
  if (weekday) {
    return {
      deadline: nextWeekdayIso(weekday[1], hour, minute, false),
      sourceText: withTimeSource(weekday[0], timeResult.sourceText),
    }
  }

  return {}
}

function extractSubmitMethod(text: string) {
  return submitMethods.find((item) => text.includes(item.keyword))?.label
}

function extractTags(text: string) {
  return tagKeywords.filter((keyword) => text.includes(keyword))
}

function toIso(year: number, month: number, day: number, hour: number, minute: number) {
  return new Date(year, month - 1, day, hour, minute, 0).toISOString()
}

function nextWeekdayIso(
  weekday: string,
  hour: number,
  minute: number,
  forceNextWeek: boolean,
  referenceDate = new Date(),
) {
  const map: Record<string, number> = {
    日: 0,
    天: 0,
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 0,
  }

  const target = map[weekday]
  const date = new Date(referenceDate)
  const current = date.getDay()
  let diff = target - current
  if (forceNextWeek) {
    diff += diff <= 0 ? 7 : 7
  } else if (diff < 0) {
    diff += 7
  }

  date.setDate(date.getDate() + diff)
  applyTime(date, hour, minute)
  return date.toISOString()
}

function extractTime(text: string) {
  const colon = text.match(/([01]?\d|2[0-3])[:：]([0-5]\d)/)
  if (colon) {
    return {
      hour: Number(colon[1]),
      minute: Number(colon[2]),
      sourceText: colon[0],
    }
  }

  const chinese = text.match(/(上午|中午|下午|晚上|今晚|明晚|晚)?\s*(\d{1,2})\s*[点時时]/)
  if (chinese) {
    const period = chinese[1] || ""
    let hour = Number(chinese[2])
    if ((period.includes("下午") || period.includes("晚")) && hour < 12) {
      hour += 12
    }
    if (period.includes("中午") && hour < 11) {
      hour += 12
    }

    return {
      hour,
      minute: 0,
      sourceText: chinese[0].trim(),
    }
  }

  if (/今晚|明晚|晚上/.test(text)) {
    return {
      hour: 20,
      minute: 0,
      sourceText: text.match(/今晚|明晚|晚上/)?.[0],
    }
  }

  return {
    hour: 23,
    minute: 59,
    sourceText: undefined,
  }
}

function applyTime(date: Date, hour: number, minute: number) {
  date.setHours(hour, minute, 0, 0)
}

function withTimeSource(dateSource: string, timeSource?: string) {
  return timeSource && !dateSource.includes(timeSource)
    ? `${dateSource} ${timeSource}`
    : dateSource
}
