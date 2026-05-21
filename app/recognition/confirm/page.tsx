"use client"

import Link from "next/link"
import { FormEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/common/EmptyState"
import { PageHeader } from "@/components/common/PageHeader"
import { clearRecognitionDraft, readRecognitionDraft } from "@/lib/storage"
import { createId, formatTags, nowIso, parseTags } from "@/lib/utils"
import { useAppData } from "@/hooks/useAppData"

export default function RecognitionConfirmPage() {
  const router = useRouter()
  const { data, isReady, addCourse, addNoticeAndTodo } = useAppData()
  const draft = useMemo(() => readRecognitionDraft(), [])
  const [courseId, setCourseId] = useState(() => draft?.courseId || "")
  const [createdCourseName, setCreatedCourseName] = useState("")
  const [title, setTitle] = useState(() => draft?.title || "")
  const [deadline, setDeadline] = useState(() => toDatetimeLocalValue(draft?.deadline))
  const [submitMethod, setSubmitMethod] = useState(() => draft?.submitMethod || "")
  const [tags, setTags] = useState(() => formatTags(draft?.tags || []))
  const [error, setError] = useState("")

  if (!isReady || !data) {
    return <p className="text-sm text-slate-500">正在读取识别结果...</p>
  }

  if (!draft) {
    return (
      <EmptyState
        title="没有待确认的识别结果"
        description="请先粘贴一段通知，系统会生成一份可修改的识别草稿。"
        action={
          <Button asChild>
            <Link href="/add/notice">去粘贴通知</Link>
          </Button>
        }
      />
    )
  }

  if (!data.courses.length) {
    return (
      <EmptyState
        title="请先创建课程"
        description="识别结果归档前需要选择课程。"
        action={
          <Button asChild>
            <Link href="/courses">去创建课程</Link>
          </Button>
        }
      />
    )
  }

  const courses = data.courses
  const currentDraft = draft
  const selectedCourse = courses.find((course) => course.id === courseId)
  const suggestedCourseName =
    currentDraft.suggestedCourseName && !createdCourseName
      ? currentDraft.suggestedCourseName
      : ""

  function handleCreateSuggestedCourse() {
    if (!currentDraft.suggestedCourseName) {
      return
    }

    const timestamp = nowIso()
    const newCourseId = createId()
    addCourse({
      id: newCourseId,
      name: currentDraft.suggestedCourseName,
      semester: "2025-2026 春季",
      color: pickCourseColor(currentDraft.suggestedCourseName),
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    setCourseId(newCourseId)
    setCreatedCourseName(currentDraft.suggestedCourseName)
    setError("")
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!courseId) {
      setError("请选择这条通知所属课程。")
      return
    }
    if (!title.trim()) {
      setError("请填写待办标题。")
      return
    }

    const timestamp = nowIso()
    const noticeId = createId()
    const normalizedDeadline = fromDatetimeLocalValue(deadline)
    const normalizedTags = parseTags(tags)

    addNoticeAndTodo(
      {
        id: noticeId,
        rawText: currentDraft.rawText,
        courseId,
        extractedTitle: title.trim(),
        extractedDeadline: normalizedDeadline,
        submitMethod: submitMethod.trim() || undefined,
        tags: normalizedTags,
        createdAt: timestamp,
      },
      {
        id: createId(),
        courseId,
        title: title.trim(),
        deadline: normalizedDeadline,
        submitMethod: submitMethod.trim() || undefined,
        status: "pending",
        tags: normalizedTags,
        sourceNoticeId: noticeId,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    )

    clearRecognitionDraft()
    router.push(`/courses/${courseId}`)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="确认识别结果"
        description="系统先帮你整理出结构化信息，归档前可以手动改准。"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>归档信息</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <RecognitionHint
                matchedCourseName={selectedCourse?.name}
                suggestedCourseName={suggestedCourseName}
                createdCourseName={createdCourseName}
                courseUnmatched={currentDraft.confidenceFlags?.courseUnmatched}
                onCreateSuggestedCourse={handleCreateSuggestedCourse}
              />

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">课程</span>
                <Select value={courseId} onChange={(event) => setCourseId(event.target.value)}>
                  <option value="">选择课程</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">事项标题</span>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">截止时间</span>
                  <Input
                    type="datetime-local"
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                  />
                  <FieldHint
                    sourceText={currentDraft.deadlineSourceText}
                    uncertain={currentDraft.confidenceFlags?.deadlineUncertain}
                    fallback="没有识别到截止时间，通知原文已保留，可以手动补充或留空。"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">提交方式</span>
                  <Input
                    value={submitMethod}
                    onChange={(event) => setSubmitMethod(event.target.value)}
                    placeholder="学习通提交"
                  />
                  <FieldHint
                    uncertain={currentDraft.confidenceFlags?.submitMethodUncertain}
                    fallback="没有识别到提交方式，可以留空或手动填写。"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">标签</span>
                <Input
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="作业，实验"
                />
              </label>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button type="submit">确认并归档</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>通知原文</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={draft.rawText} readOnly className="min-h-72 bg-slate-50" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RecognitionHint({
  matchedCourseName,
  suggestedCourseName,
  createdCourseName,
  courseUnmatched,
  onCreateSuggestedCourse,
}: {
  matchedCourseName?: string
  suggestedCourseName?: string
  createdCourseName?: string
  courseUnmatched?: boolean
  onCreateSuggestedCourse: () => void
}) {
  if (matchedCourseName) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          已使用课程：{matchedCourseName}
        </div>
      </div>
    )
  }

  if (createdCourseName) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          已创建并使用新课程：{createdCourseName}
        </div>
      </div>
    )
  }

  if (suggestedCourseName) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
              <AlertCircle className="h-4 w-4" />
              检测到可能的新课程：{suggestedCourseName}
            </div>
            <p className="mt-1 text-xs text-amber-800">
              系统没有在现有课程中找到它，确认后可以先创建课程再归档。
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCreateSuggestedCourse}
          >
            <PlusCircle className="h-4 w-4" />
            创建并使用
          </Button>
        </div>
      </div>
    )
  }

  if (courseUnmatched) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
          <AlertCircle className="h-4 w-4" />
          没有识别到课程，请手动选择。
        </div>
      </div>
    )
  }

  return null
}

function FieldHint({
  sourceText,
  uncertain,
  fallback,
}: {
  sourceText?: string
  uncertain?: boolean
  fallback: string
}) {
  if (sourceText) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <Badge variant="muted">识别自：{sourceText}</Badge>
        {uncertain ? <span>请确认是否准确。</span> : null}
      </div>
    )
  }

  if (uncertain) {
    return <p className="text-xs text-amber-700">{fallback}</p>
  }

  return null
}

function toDatetimeLocalValue(value?: string) {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

function fromDatetimeLocalValue(value: string) {
  if (!value) {
    return undefined
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
}

function pickCourseColor(seed: string) {
  const colors = ["#0f766e", "#2563eb", "#d97706", "#7c3aed", "#be123c"]
  const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return colors[total % colors.length]
}
