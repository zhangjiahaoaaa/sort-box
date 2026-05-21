"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/common/EmptyState"
import { PageHeader } from "@/components/common/PageHeader"
import { recognizeNotice } from "@/lib/recognition"
import { writeRecognitionDraft } from "@/lib/storage"
import { useAppData } from "@/hooks/useAppData"

export default function AddNoticePage() {
  const router = useRouter()
  const { data, isReady } = useAppData()
  const [courseId, setCourseId] = useState("")
  const [rawText, setRawText] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    queueMicrotask(() => {
      const queryCourseId = new URLSearchParams(window.location.search).get("courseId")
      if (queryCourseId) {
        setCourseId(queryCourseId)
      }
    })
  }, [])

  if (!isReady || !data) {
    return <p className="text-sm text-slate-500">正在准备通知识别...</p>
  }

  if (!data.courses.length) {
    return (
      <EmptyState
        title="创建第一门课"
        description="通知识别结果需要归到课程里。先创建课程，再粘贴第一条群通知。"
        action={
          <Button asChild>
            <Link href="/courses">创建第一门课</Link>
          </Button>
        }
      />
    )
  }

  const courses = data.courses

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!rawText.trim()) {
      setError("请粘贴一段群通知。")
      return
    }

    const draft = recognizeNotice(rawText, courses, courseId || undefined)
    writeRecognitionDraft(draft)
    router.push("/recognition/confirm")
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="粘贴通知"
        description="把群聊、学习平台或邮箱里的作业要求贴进来，先用 mock 规则识别。"
      />

      <Card>
        <CardHeader>
          <CardTitle>通知原文</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">课程，可选</span>
              <Select value={courseId} onChange={(event) => setCourseId(event.target.value)}>
                <option value="">让系统从文本里猜</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">通知内容</span>
              <Textarea
                value={rawText}
                onChange={(event) => setRawText(event.target.value)}
                placeholder="例如：数据库系统实验报告4请在5月28日23:59前提交到学习通，文件命名为学号+姓名。"
                className="min-h-56"
              />
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit">识别通知</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
