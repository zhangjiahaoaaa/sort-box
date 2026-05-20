import type { MaterialType } from "@/lib/types"

export const materialTypeLabels: Record<MaterialType, string> = {
  courseware: "课件",
  homework: "作业",
  review: "复习",
  exam: "考试",
  reading: "阅读",
  other: "其他",
}

export const materialTypes: MaterialType[] = [
  "courseware",
  "homework",
  "review",
  "exam",
  "reading",
  "other",
]

export const appDataKey = "final-rescue.appData.v1"
export const recognitionDraftKey = "final-rescue.recognitionDraft.v1"
