import type { AppData, Course, Material, Notice, Todo } from "@/lib/types"

const reviewTags = ["期末", "复习", "重点", "样卷", "考试"]
const examNoticeKeywords = ["期末", "考试", "范围", "开卷", "闭卷", "样卷", "复习"]
const priorityMaterialTypes = ["review", "exam", "courseware"]

export type ReviewModeData = {
  course: Course
  pendingTodos: Todo[]
  reviewMaterials: Material[]
  examNotices: Notice[]
  topTags: Array<{ tag: string; count: number }>
  checklist: string[]
}

export function getReviewModeData(data: AppData, course: Course): ReviewModeData {
  const courseTodos = data.todos.filter((todo) => todo.courseId === course.id)
  const courseMaterials = data.materials.filter((material) => material.courseId === course.id)
  const courseNotices = data.notices.filter((notice) => notice.courseId === course.id)

  const pendingTodos = courseTodos
    .filter((todo) => todo.status === "pending")
    .sort((left, right) => compareDeadline(left.deadline, right.deadline))

  const reviewMaterials = courseMaterials
    .map((material) => ({
      item: material,
      score: scoreReviewMaterial(material),
    }))
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((result) => result.item)

  const examNotices = courseNotices
    .map((notice) => ({
      item: notice,
      score: scoreExamNotice(notice),
    }))
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((result) => result.item)

  const topTags = collectTopTags(courseMaterials, courseTodos, courseNotices)

  return {
    course,
    pendingTodos,
    reviewMaterials,
    examNotices,
    topTags,
    checklist: buildReviewChecklist({
      pendingTodos,
      reviewMaterials,
      examNotices,
      topTags,
    }),
  }
}

function scoreReviewMaterial(material: Material) {
  let score = priorityMaterialTypes.includes(material.type) ? 4 : 0
  if (material.isImportant) {
    score += 8
  }
  if (material.status !== "reviewed") {
    score += 5
  }
  if (material.status === "new") {
    score += 2
  }
  const combined = [material.fileName, material.note, material.extractedText, ...material.tags]
    .join(" ")
    .toLowerCase()

  for (const keyword of reviewTags) {
    if (combined.includes(keyword.toLowerCase())) {
      score += 3
    }
  }

  return score
}

function scoreExamNotice(notice: Notice) {
  let score = 0
  const combined = [
    notice.originalText,
    notice.rawText,
    notice.extractedTitle,
    notice.submitMethod,
    ...notice.tags,
  ]
    .join(" ")
    .toLowerCase()

  for (const keyword of examNoticeKeywords) {
    if (combined.includes(keyword.toLowerCase())) {
      score += 2
    }
  }

  return score
}

function collectTopTags(materials: Material[], todos: Todo[], notices: Notice[]) {
  const counts = new Map<string, number>()

  for (const tag of [
    ...materials.flatMap((material) => material.tags),
    ...todos.flatMap((todo) => todo.tags),
    ...notices.flatMap((notice) => notice.tags),
  ]) {
    counts.set(tag, (counts.get(tag) || 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((left, right) => right.count - left.count || left.tag.localeCompare(right.tag))
    .slice(0, 8)
}

function buildReviewChecklist({
  pendingTodos,
  reviewMaterials,
  examNotices,
  topTags,
}: {
  pendingTodos: Todo[]
  reviewMaterials: Material[]
  examNotices: Notice[]
  topTags: Array<{ tag: string; count: number }>
}) {
  const checklist: string[] = []

  if (pendingTodos.length) {
    checklist.push(`先救最近的 DDL：${pendingTodos[0].title}`)
  } else {
    checklist.push("目前没有未完成 DDL，可以把注意力集中到复习资料。")
  }

  if (examNotices.length) {
    checklist.push("先确认考试通知里的范围、形式和提交要求，别被规则细节绊倒。")
  } else {
    checklist.push("还没有考试相关通知，建议补充老师群里关于范围和形式的消息。")
  }

  if (reviewMaterials.length) {
    checklist.push(`优先看这份资料：${reviewMaterials[0].fileName}`)
  } else {
    checklist.push("复习资料还不够明显，建议上传课件、样卷或重点提纲。")
  }

  if (topTags.length) {
    checklist.push(`围绕高频标签复盘：${topTags.slice(0, 3).map((item) => item.tag).join("、")}`)
  }

  checklist.push("最后用首页搜索查漏补缺，把同一关键词下的资料、通知和 DDL 一起看完。")

  return checklist
}

function compareDeadline(left?: string, right?: string) {
  if (!left && !right) {
    return 0
  }
  if (!left) {
    return 1
  }
  if (!right) {
    return -1
  }

  return new Date(left).getTime() - new Date(right).getTime()
}
