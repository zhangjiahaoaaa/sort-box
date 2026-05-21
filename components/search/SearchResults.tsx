import Link from "next/link"
import { EmptyState } from "@/components/common/EmptyState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TagList } from "@/components/common/TagList"
import { materialTypeLabels } from "@/lib/constants"
import type { AppData, SearchResultGroup } from "@/lib/types"

type SearchResultsProps = {
  data: AppData
  results: SearchResultGroup
}

export function SearchResults({ data, results }: SearchResultsProps) {
  const total =
    results.courses.length +
    results.materials.length +
    results.todos.length +
    results.notices.length

  if (!total) {
    return (
      <EmptyState
        title="没有找到匹配结果"
        description="换个关键词试试，比如课程名、实验三、提交方式或通知里的原文。"
      />
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ResultCard title={`课程 · ${results.courses.length}`}>
        {results.courses.map((course) => (
          <ResultLink key={course.id} href={`/courses/${course.id}`}>
            <p className="font-medium text-slate-950">{course.name}</p>
            <p className="text-sm text-slate-500">{course.teacher || "未填写老师"}</p>
          </ResultLink>
        ))}
      </ResultCard>

      <ResultCard title={`资料 · ${results.materials.length}`}>
        {results.materials.map((material) => {
          const course = data.courses.find((item) => item.id === material.courseId)
          return (
            <ResultLink key={material.id} href={`/courses/${material.courseId}`}>
              <Badge variant="default">资料</Badge>
              <p className="font-medium text-slate-950">{material.fileName}</p>
              <p className="text-sm text-slate-500">
                {course?.name || "未知课程"} · {materialTypeLabels[material.type]}
              </p>
              <div className="mt-2">
                <TagList tags={material.tags} />
              </div>
            </ResultLink>
          )
        })}
      </ResultCard>

      <ResultCard title={`待办 · ${results.todos.length}`}>
        {results.todos.map((todo) => {
          const course = data.courses.find((item) => item.id === todo.courseId)
          return (
            <ResultLink key={todo.id} href={`/courses/${todo.courseId}`}>
              <Badge variant="warning">待办</Badge>
              <p className="font-medium text-slate-950">{todo.title}</p>
              <p className="text-sm text-slate-500">{course?.name || "未知课程"}</p>
              <div className="mt-2">
                <TagList tags={todo.tags} />
              </div>
            </ResultLink>
          )
        })}
      </ResultCard>

      <ResultCard title={`通知 · ${results.notices.length}`}>
        {results.notices.map((notice) => {
          const course = data.courses.find((item) => item.id === notice.courseId)
          return (
            <ResultLink key={notice.id} href={`/courses/${notice.courseId}`}>
              <Badge variant="muted">通知</Badge>
              <p className="font-medium text-slate-950">{notice.extractedTitle}</p>
              <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                {course?.name || "未知课程"} · {notice.rawText}
              </p>
            </ResultLink>
          )
        })}
      </ResultCard>
    </div>
  )
}

function ResultCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {children || <p className="text-sm text-slate-400">暂无匹配</p>}
      </CardContent>
    </Card>
  )
}

function ResultLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="block rounded-md border border-slate-100 p-3 transition hover:border-teal-200 hover:bg-teal-50"
    >
      {children}
    </Link>
  )
}
