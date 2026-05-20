import type { Course, MaterialType } from "@/lib/types"

export type MaterialRecognitionDraft = {
  courseId?: string
  type: MaterialType
  tags: string[]
  confidenceFlags: {
    courseUnmatched?: boolean
    typeUncertain?: boolean
    tagsUncertain?: boolean
  }
}

const typeRules: Array<{
  type: MaterialType
  keywords: string[]
}> = [
  { type: "homework", keywords: ["作业", "实验", "报告", "模板", "习题"] },
  { type: "courseware", keywords: ["课件", "ppt", "讲义", "上课", "课堂"] },
  { type: "review", keywords: ["复习", "重点", "提纲", "总结", "整理"] },
  { type: "exam", keywords: ["考试", "期末", "期中", "真题", "试卷"] },
  { type: "reading", keywords: ["阅读", "论文", "文献", "资料"] },
]

export function recognizeMaterialFileName(
  fileName: string,
  courses: Course[],
): MaterialRecognitionDraft {
  const normalized = fileName.toLowerCase()
  const nameWithoutExtension = fileName.replace(/\.[^.]+$/, "")
  const matchedCourse = courses.find((course) =>
    normalized.includes(course.name.toLowerCase()),
  )
  const type = inferMaterialType(normalized)
  const tags = inferTags(nameWithoutExtension, matchedCourse?.name)

  return {
    courseId: matchedCourse?.id,
    type,
    tags,
    confidenceFlags: {
      courseUnmatched: !matchedCourse,
      typeUncertain: type === "other",
      tagsUncertain: tags.length === 0,
    },
  }
}

function inferMaterialType(normalizedFileName: string): MaterialType {
  return (
    typeRules.find((rule) =>
      rule.keywords.some((keyword) =>
        normalizedFileName.includes(keyword.toLowerCase()),
      ),
    )?.type || "other"
  )
}

function inferTags(fileName: string, courseName?: string) {
  const cleaned = courseName ? fileName.replace(courseName, "") : fileName
  const tokens = cleaned
    .split(/[_\-\s.（）()【】\[\]]+/)
    .map((token) => token.trim())
    .filter(Boolean)

  const keywordTags = [
    ...fileName.matchAll(/实验\s*[一二三四五六七八九十\d]+/g),
    ...fileName.matchAll(/第\s*[一二三四五六七八九十\d]+\s*[章节]/g),
  ].map((match) => match[0].replace(/\s+/g, ""))

  const tags = [...keywordTags, ...tokens]
    .map((tag) => tag.replace(/\.[^.]+$/, ""))
    .filter((tag) => tag && tag !== courseName)
    .filter((tag) => !["doc", "docx", "pdf", "ppt", "pptx"].includes(tag.toLowerCase()))

  return Array.from(new Set(tags)).slice(0, 5)
}
