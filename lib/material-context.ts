import type { AppData, Material, Notice, Todo } from "@/lib/types"

export type MaterialContext = {
  relatedTodos: Todo[]
  relatedNotices: Notice[]
  similarMaterials: Material[]
}

export function getMaterialContext(data: AppData, material: Material): MaterialContext {
  const tokens = getMaterialTokens(material)

  return {
    relatedTodos: data.todos
      .map((todo) => ({
        item: todo,
        score: scoreTextMatch({
          material,
          tokens,
          courseId: todo.courseId,
          tags: todo.tags,
          text: [todo.title, todo.submitMethod, todo.deadlineText].join(" "),
        }),
      }))
      .filter((result) => result.score > 0)
      .sort(sortByScore)
      .slice(0, 4)
      .map((result) => result.item),
    relatedNotices: data.notices
      .map((notice) => ({
        item: notice,
        score: scoreTextMatch({
          material,
          tokens,
          courseId: notice.courseId,
          tags: notice.tags,
          text: [
            notice.extractedTitle,
            notice.rawText,
            notice.originalText,
            notice.submitMethod,
          ].join(" "),
        }),
      }))
      .filter((result) => result.score > 0)
      .sort(sortByScore)
      .slice(0, 4)
      .map((result) => result.item),
    similarMaterials: data.materials
      .filter((item) => item.id !== material.id)
      .map((item) => ({
        item,
        score: scoreTextMatch({
          material,
          tokens,
          courseId: item.courseId,
          tags: item.tags,
          text: [item.fileName, item.note, item.extractedText].join(" "),
        }),
      }))
      .filter((result) => result.score > 0)
      .sort(sortByScore)
      .slice(0, 4)
      .map((result) => result.item),
  }
}

function scoreTextMatch({
  material,
  tokens,
  courseId,
  tags,
  text,
}: {
  material: Material
  tokens: string[]
  courseId: string
  tags: string[]
  text: string
}) {
  let score = courseId === material.courseId ? 4 : 0
  const normalizedText = text.toLowerCase()

  for (const tag of material.tags) {
    if (tag && tags.includes(tag)) {
      score += 3
    } else if (tag && normalizedText.includes(tag.toLowerCase())) {
      score += 2
    }
  }

  for (const token of tokens) {
    if (normalizedText.includes(token.toLowerCase())) {
      score += 1
    }
  }

  return score
}

function getMaterialTokens(material: Material) {
  const nameWithoutExtension = material.fileName.replace(/\.[^.]+$/, "")
  const tokens = nameWithoutExtension
    .split(/[_\-\s.（）()【】\[\]]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2)
    .filter((token) => !["doc", "docx", "pdf", "ppt", "pptx", "txt"].includes(token))

  return Array.from(new Set([...material.tags, ...tokens])).slice(0, 12)
}

function sortByScore<T>(left: { score: number; item: T }, right: { score: number; item: T }) {
  return right.score - left.score
}
