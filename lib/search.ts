import type { AppData, SearchResultGroup } from "@/lib/types"

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
    courses: data.courses.filter((course) =>
      [course.name, course.teacher, course.semester, course.description]
        .filter(Boolean)
        .some((value) => includesQuery(value, query)),
    ),
    materials: data.materials.filter((material) =>
      [material.fileName, material.note, ...material.tags]
        .filter(Boolean)
        .some((value) => includesQuery(value, query)),
    ),
    todos: data.todos.filter((todo) =>
      [todo.title, todo.submitMethod, ...todo.tags]
        .filter(Boolean)
        .some((value) => includesQuery(value, query)),
    ),
    notices: data.notices.filter((notice) =>
      [
        notice.rawText,
        notice.extractedTitle,
        notice.extractedDeadline,
        notice.submitMethod,
        ...notice.tags,
      ]
        .filter(Boolean)
        .some((value) => includesQuery(value, query)),
    ),
  }
}

function includesQuery(value: unknown, query: string) {
  return String(value).toLowerCase().includes(query)
}
