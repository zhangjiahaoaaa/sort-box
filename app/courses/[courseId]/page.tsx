"use client"

import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CourseHeader } from "@/components/courses/CourseHeader"
import { MaterialList } from "@/components/materials/MaterialList"
import { NoticeList } from "@/components/notices/NoticeList"
import { TodoList } from "@/components/todos/TodoList"
import { useAppData } from "@/hooks/useAppData"

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>()
  const { data, isReady, toggleTodo } = useAppData()

  if (!isReady || !data) {
    return <p className="text-sm text-slate-500">正在读取课程详情...</p>
  }

  const course = data.courses.find((item) => item.id === params.courseId)
  if (!course) {
    notFound()
  }

  const materials = data.materials.filter((item) => item.courseId === course.id)
  const todos = data.todos.filter((item) => item.courseId === course.id)
  const notices = data.notices.filter((item) => item.courseId === course.id)

  return (
    <div className="space-y-6">
      <CourseHeader course={course} />

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="secondary">
          <Link href="/add/material">添加这门课的资料</Link>
        </Button>
        <Button asChild>
          <Link href="/add/notice">粘贴这门课的通知</Link>
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">待办列表</h2>
        <TodoList todos={todos} onToggle={toggleTodo} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">资料列表</h2>
        <MaterialList materials={materials} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">通知记录</h2>
        <NoticeList notices={notices} />
      </section>
    </div>
  )
}
