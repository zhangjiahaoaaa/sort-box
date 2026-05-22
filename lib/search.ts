import type { AppData, SearchMatch, SearchResultGroup } from "@/lib/types"

export function searchAppData(data: AppData, keyword: string): SearchResultGroup {
  const query = keyword.trim().toLowerCase()

  if (!query) {
    return {
      courses: [],
      materials: [],
      todos: [],
      notices: [],
    }
  }

  return {
    courses: data.courses
      .map((course) => ({
        item: course,
        matches: collectMatches(
          [
            { field: "name", label: "课程名", value: course.name },
            { field: "teacher", label: "老师", value: course.teacher },
            { field: "semester", label: "学期", value: course.semester },
            { field: "description", label: "课程备注", value: course.description },
          ],
          query,
        ),
      }))
      .filter((result) => result.matches.length),
    materials: data.materials
      .map((material) => {
      const course = data.courses.find((item) => item.id === material.courseId)
        return {
          item: material,
          matches: collectMatches(
            [
              { field: "courseName", label: "所属课程", value: course?.name },
              { field: "fileName", label: "文件名", value: material.fileName },
              { field: "tags", label: "标签", value: material.tags.join("，") },
              { field: "note", label: "备注", value: material.note },
              {
                field: "extractedText",
                label: "资料正文",
                value: material.extractedText,
                shouldSnippet: true,
              },
            ],
            query,
          ),
        }
      })
      .filter((result) => result.matches.length),
    todos: data.todos
      .map((todo) => {
      const course = data.courses.find((item) => item.id === todo.courseId)
        return {
          item: todo,
          matches: collectMatches(
            [
              { field: "courseName", label: "所属课程", value: course?.name },
              { field: "title", label: "待办标题", value: todo.title },
              { field: "deadlineText", label: "截止时间", value: todo.deadlineText || todo.deadline },
              { field: "submitMethod", label: "提交方式", value: todo.submitMethod },
              { field: "tags", label: "标签", value: todo.tags.join("，") },
            ],
            query,
          ),
        }
      })
      .filter((result) => result.matches.length),
    notices: data.notices
      .map((notice) => {
      const course = data.courses.find((item) => item.id === notice.courseId)
        return {
          item: notice,
          matches: collectMatches(
            [
              { field: "courseName", label: "所属课程", value: course?.name },
              { field: "originalText", label: "通知原文", value: notice.originalText || notice.rawText },
              { field: "title", label: "通知标题", value: notice.extractedTitle },
              { field: "deadline", label: "截止时间", value: notice.extractedDeadline },
              { field: "submitMethod", label: "提交方式", value: notice.submitMethod },
              { field: "tags", label: "标签", value: notice.tags.join("，") },
            ],
            query,
          ),
        }
      })
      .filter((result) => result.matches.length),
  }
}

function collectMatches(
  fields: Array<{
    field: string
    label: string
    value?: string
    shouldSnippet?: boolean
  }>,
  query: string,
): SearchMatch[] {
  return fields
    .filter((field) => field.value && includesQuery(field.value, query))
    .map((field) => ({
      field: field.field,
      label: field.label,
      value: field.value || "",
      snippet: field.shouldSnippet ? createSnippet(field.value || "", query) : undefined,
    }))
}

function includesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query)
}

function createSnippet(value: string, query: string) {
  const normalizedValue = value.toLowerCase()
  const index = normalizedValue.indexOf(query)

  if (index < 0) {
    return value.slice(0, 100)
  }

  const start = Math.max(0, index - 42)
  const end = Math.min(value.length, index + query.length + 58)
  const prefix = start > 0 ? "..." : ""
  const suffix = end < value.length ? "..." : ""

  return `${prefix}${value.slice(start, end)}${suffix}`
}
