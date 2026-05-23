"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Flame, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/EmptyState"
import { CourseHeader } from "@/components/courses/CourseHeader"
import { MaterialList } from "@/components/materials/MaterialList"
import { NoticeList } from "@/components/notices/NoticeList"
import { TodoList } from "@/components/todos/TodoList"
import { useAppData } from "@/hooks/useAppData"

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>()
  const router = useRouter()
  const {
    data,
    isReady,
    toggleTodo,
    deleteMaterial,
    deleteTodo,
    deleteCourse,
  } = useAppData()

  if (!isReady || !data) {
    return <p className="text-sm text-slate-500">正在读取课程详情...</p>
  }

  const course = data.courses.find((item) => item.id === params.courseId)
  if (!course) {
    return (
      <EmptyState
        title="这门课已经不存在"
        description="可能刚刚被删除，或者链接已经失效。"
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/courses">返回课程列表</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">回到首页</Link>
            </Button>
          </div>
        }
      />
    )
  }
  const currentCourse = course

  const materials = data.materials.filter((item) => item.courseId === currentCourse.id)
  const todos = data.todos.filter((item) => item.courseId === currentCourse.id)
  const notices = data.notices.filter((item) => item.courseId === currentCourse.id)

  function handleDeleteCourse() {
    const confirmed = window.confirm(
      `确定删除课程「${currentCourse.name}」吗？这会同时删除这门课下的资料、待办和通知。`,
    )
    if (!confirmed) {
      return
    }

    deleteCourse(currentCourse.id)
    router.replace("/courses")
  }

  return (
    <div className="space-y-6">
      <CourseHeader course={currentCourse} />

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href={`/courses/${currentCourse.id}/review`}>
            <Flame className="h-4 w-4" />
            进入复习模式
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href={`/add/material?courseId=${currentCourse.id}`}>添加这门课的资料</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href={`/add/notice?courseId=${currentCourse.id}`}>粘贴这门课的通知</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleDeleteCourse}
        >
          <Trash2 className="h-4 w-4" />
          删除课程
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">待办列表</h2>
        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">资料列表</h2>
        <MaterialList materials={materials} onDelete={deleteMaterial} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">通知记录</h2>
        <NoticeList notices={notices} />
      </section>
    </div>
  )
}
