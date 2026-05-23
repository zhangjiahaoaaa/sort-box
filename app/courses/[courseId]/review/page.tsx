"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { AlertTriangle, BookOpen, FileText, Flame, Tags } from "lucide-react"
import { EmptyState } from "@/components/common/EmptyState"
import { PageHeader } from "@/components/common/PageHeader"
import { TagList } from "@/components/common/TagList"
import { DeadlineBadge } from "@/components/todos/DeadlineBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { materialTypeLabels } from "@/lib/constants"
import { formatDateTime } from "@/lib/date"
import { getReviewModeData } from "@/lib/review-mode"
import type { Material, Notice, Todo } from "@/lib/types"
import { formatFileSize } from "@/lib/utils"
import { useAppData } from "@/hooks/useAppData"

const materialStatusLabels = {
  new: "未查看",
  viewed: "已查看",
  reviewed: "已复习",
}

const materialStatusVariants = {
  new: "warning",
  viewed: "muted",
  reviewed: "success",
} as const

export default function CourseReviewPage() {
  const params = useParams<{ courseId: string }>()
  const { data, isReady } = useAppData()

  if (!isReady || !data) {
    return <p className="text-sm text-slate-500">正在整理期末复习模式...</p>
  }

  const course = data.courses.find((item) => item.id === params.courseId)
  if (!course) {
    return (
      <EmptyState
        title="这门课已经不存在"
        description="可能刚刚被删除，或者链接已经失效。"
        action={
          <Button asChild>
            <Link href="/courses">返回课程列表</Link>
          </Button>
        }
      />
    )
  }

  const reviewData = getReviewModeData(data, course)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${course.name} · 期末复习模式`}
        description="先救 DDL，再救重点资料。把这门课期末最要紧的东西集中到一页。"
        action={
          <Button asChild variant="secondary">
            <Link href={`/courses/${course.id}`}>返回课程详情</Link>
          </Button>
        }
      />

      <Card className="border-teal-200 bg-teal-50">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-900">期末救命概览</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">{course.name}</h2>
            <p className="mt-2 text-sm text-teal-800">
              {course.teacher || "未填写老师"} · {course.semester || "本学期"}
            </p>
            {course.description ? (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-teal-900">
                {course.description}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Metric value={reviewData.pendingTodos.length} label="未完成 DDL" />
            <Metric value={reviewData.reviewMaterials.length} label="重点资料" />
            <Metric value={reviewData.examNotices.length} label="考试通知" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <ReviewChecklist items={reviewData.checklist} />
          <PendingTodos todos={reviewData.pendingTodos} />
          <ReviewMaterials materials={reviewData.reviewMaterials} />
        </div>

        <aside className="space-y-4">
          <TopTags tags={reviewData.topTags} />
          <ExamNotices notices={reviewData.examNotices} />
        </aside>
      </div>
    </div>
  )
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-teal-200 bg-white px-3 py-2">
      <p className="text-xl font-semibold text-slate-950">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}

function ReviewChecklist({ items }: { items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-600" />
          复习清单
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item} className="flex gap-3 rounded-lg bg-slate-50 p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PendingTodos({ todos }: { todos: Todo[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          先救这些 DDL
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todos.length ? (
          <div className="space-y-3">
            {todos.map((todo) => (
              <div key={todo.id} className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-950">{todo.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <DeadlineBadge deadline={todo.deadline} />
                  {todo.submitMethod ? (
                    <span className="text-xs text-slate-500">{todo.submitMethod}</span>
                  ) : null}
                </div>
                <div className="mt-3">
                  <TagList tags={todo.tags} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyInline text="这门课暂时没有未完成 DDL，可以直接进入复习节奏。" />
        )}
      </CardContent>
    </Card>
  )
}

function ReviewMaterials({ materials }: { materials: Material[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-teal-700" />
          重点资料优先看这些
        </CardTitle>
      </CardHeader>
      <CardContent>
        {materials.length ? (
          <div className="space-y-3">
            {materials.map((material) => (
              <Link
                key={material.id}
                href={`/materials/${material.id}`}
                className="block rounded-lg border border-slate-200 p-4 transition hover:border-teal-200 hover:bg-teal-50"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{materialTypeLabels[material.type]}</Badge>
                  <Badge variant={materialStatusVariants[material.status]}>
                    {materialStatusLabels[material.status]}
                  </Badge>
                  {material.isImportant ? <Badge variant="danger">重点</Badge> : null}
                  <Badge variant="muted">{formatFileSize(material.fileSize)}</Badge>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-950">{material.fileName}</p>
                {material.note ? (
                  <p className="mt-2 text-sm leading-6 text-slate-500">{material.note}</p>
                ) : null}
                <div className="mt-3">
                  <TagList tags={material.tags} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyInline text="还没有明显的复习资料，建议上传课件、重点提纲或样卷。" />
        )}
      </CardContent>
    </Card>
  )
}

function TopTags({ tags }: { tags: Array<{ tag: string; count: number }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Tags className="h-4 w-4 text-purple-700" />
          高频标签
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tags.length ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((item) => (
              <Badge key={item.tag} variant="muted">
                {item.tag} · {item.count}
              </Badge>
            ))}
          </div>
        ) : (
          <EmptyInline text="还没有标签，上传资料或归档通知后会更准。" />
        )}
      </CardContent>
    </Card>
  )
}

function ExamNotices({ notices }: { notices: Notice[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-blue-700" />
          考试通知别漏掉
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notices.length ? (
          <div className="space-y-3">
            {notices.map((notice) => (
              <Link
                key={notice.id}
                href={`/courses/${notice.courseId}`}
                className="block rounded-lg border border-slate-200 p-3 transition hover:border-teal-200 hover:bg-teal-50"
              >
                <p className="text-sm font-medium text-slate-950">{notice.extractedTitle}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {formatDateTime(notice.extractedDeadline)}
                  {notice.submitMethod ? ` · ${notice.submitMethod}` : ""}
                </p>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                  {notice.rawText}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyInline text="还没有考试相关通知，建议把老师关于范围、形式、样卷的消息贴进来。" />
        )}
      </CardContent>
    </Card>
  )
}

function EmptyInline({ text }: { text: string }) {
  return <p className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-500">{text}</p>
}
