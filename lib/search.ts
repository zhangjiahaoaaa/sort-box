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
    materials: data.materials.filter((material) => {
      const course = data.courses.find((item) => item.id === material.courseId)
      return [material.fileName, material.note, course?.name, ...material.tags]
        .filter(Boolean)
        .some((value) => includesQuery(value, query))
    }),
    todos: data.todos.filter((todo) => {
      const course = data.courses.find((item) => item.id === todo.courseId)
      return [todo.title, todo.submitMethod, course?.name, ...todo.tags]
        .filter(Boolean)
        .some((value) => includesQuery(value, query))
    }),
    notices: data.notices.filter((notice) => {
      const course = data.courses.find((item) => item.id === notice.courseId)
      return [
        notice.rawText,
        notice.extractedTitle,
        notice.extractedDeadline,
        notice.submitMethod,
        course?.name,
        ...notice.tags,
      ]
        .filter(Boolean)
        .some((value) => includesQuery(value, query))
    }),
  }
}

function includesQuery(value: unknown, query: string) {
  return String(value).toLowerCase().includes(query)
}
