export type Course = {
  id: string
  name: string
  teacher?: string
  color?: string
  semester?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export type MaterialType =
  | "courseware"
  | "homework"
  | "review"
  | "exam"
  | "reading"
  | "other"

export type Material = {
  id: string
  courseId: string
  fileName: string
  fileId?: string
  mimeType?: string
  fileSize?: number
  type: MaterialType
  tags: string[]
  uploadedAt: string
  extractedText?: string
  note?: string
}

export type TodoStatus = "pending" | "done"

export type Todo = {
  id: string
  courseId: string
  title: string
  deadline?: string
  deadlineText?: string
  submitMethod?: string
  status: TodoStatus
  tags: string[]
  sourceNoticeId?: string
  createdAt: string
  updatedAt: string
}

export type Notice = {
  id: string
  rawText: string
  originalText?: string
  courseId: string
  extractedTitle: string
  extractedDeadline?: string
  submitMethod?: string
  tags: string[]
  createdAt: string
}

export type RecognitionDraft = {
  rawText: string
  courseId?: string
  suggestedCourseName?: string
  title: string
  deadline?: string
  deadlineSourceText?: string
  submitMethod?: string
  tags: string[]
  confidenceFlags?: {
    courseUnmatched?: boolean
    deadlineUncertain?: boolean
    submitMethodUncertain?: boolean
  }
}

export type AppData = {
  courses: Course[]
  materials: Material[]
  todos: Todo[]
  notices: Notice[]
}

export type SearchResultGroup = {
  courses: Array<SearchResultItem<Course>>
  materials: Array<SearchResultItem<Material>>
  todos: Array<SearchResultItem<Todo>>
  notices: Array<SearchResultItem<Notice>>
}

export type SearchMatch = {
  field: string
  label: string
  value: string
  snippet?: string
}

export type SearchResultItem<T> = {
  item: T
  matches: SearchMatch[]
}
