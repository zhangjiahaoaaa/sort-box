"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseCard } from "@/components/courses/CourseCard"
import { CourseForm } from "@/components/courses/CourseForm"
import { EmptyState } from "@/components/common/EmptyState"
import { PageHeader } from "@/components/common/PageHeader"
import { useAppData } from "@/hooks/useAppData"

export default function CoursesPage() {
  const { data, isReady, addCourse } = useAppData()

  if (!isReady || !data) {
    return <p className="text-sm text-slate-500">正在读取课程...</p>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="课程列表"
        description="把资料、通知和待办先归到课程里，后面搜索和复习都会轻松很多。"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          {data.courses.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {data.courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  materials={data.materials.filter(
                    (item) => item.courseId === course.id,
                  )}
                  todos={data.todos.filter((item) => item.courseId === course.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="创建第一门课"
              description="先创建课程，再开始添加资料或粘贴群通知。"
            />
          )}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>新建课程</CardTitle>
          </CardHeader>
          <CardContent>
            <CourseForm onAdd={addCourse} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
