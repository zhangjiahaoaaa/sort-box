import { BookOpen } from "lucide-react"
import type { Course } from "@/lib/types"

export function CourseHeader({ course }: { course: Course }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-white"
          style={{ backgroundColor: course.color || "#0f766e" }}
        >
          <BookOpen className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{course.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {course.teacher || "未填写老师"} · {course.semester || "本学期"}
          </p>
          {course.description ? (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {course.description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
