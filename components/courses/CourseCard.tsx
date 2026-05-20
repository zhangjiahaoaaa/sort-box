import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Course, Material, Todo } from "@/lib/types"

type CourseCardProps = {
  course: Course
  materials: Material[]
  todos: Todo[]
}

export function CourseCard({ course, materials, todos }: CourseCardProps) {
  const pendingCount = todos.filter((todo) => todo.status === "pending").length

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="h-full transition hover:border-teal-300 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: course.color || "#0f766e" }}
            >
              <BookOpen className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-950">
                {course.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {course.teacher || "未填写老师"} · {course.semester || "本学期"}
              </p>
            </div>
          </div>
          {course.description ? (
            <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
              {course.description}
            </p>
          ) : null}
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-500">资料</p>
              <p className="mt-1 font-semibold text-slate-950">{materials.length}</p>
            </div>
            <div className="rounded-md bg-amber-50 p-3">
              <p className="text-xs text-amber-700">待办</p>
              <p className="mt-1 font-semibold text-amber-900">{pendingCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
