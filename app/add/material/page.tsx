"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/common/EmptyState"
import { PageHeader } from "@/components/common/PageHeader"
import { Badge } from "@/components/ui/badge"
import { materialTypeLabels, materialTypes } from "@/lib/constants"
import {
  recognizeMaterialFileName,
  type MaterialRecognitionDraft,
} from "@/lib/material-recognition"
import { createId, nowIso, parseTags } from "@/lib/utils"
import { useAppData } from "@/hooks/useAppData"
import type { MaterialType } from "@/lib/types"

export default function AddMaterialPage() {
  const router = useRouter()
  const { data, isReady, addMaterial } = useAppData()
  const [courseId, setCourseId] = useState("")
  const [fileName, setFileName] = useState("")
  const [type, setType] = useState<MaterialType>("courseware")
  const [tags, setTags] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [recognition, setRecognition] = useState<MaterialRecognitionDraft | null>(null)

  useEffect(() => {
    queueMicrotask(() => {
      const queryCourseId = new URLSearchParams(window.location.search).get("courseId")
      if (queryCourseId) {
        setCourseId(queryCourseId)
      }
    })
  }, [])

  if (!isReady || !data) {
    return <p className="text-sm text-slate-500">正在准备资料表单...</p>
  }

  if (!data.courses.length) {
    return (
      <EmptyState
        title="请先创建课程"
        description="资料需要归到具体课程里。先建一门课，再回来添加资料。"
        action={
          <Button asChild>
            <Link href="/courses">去创建课程</Link>
          </Button>
        }
      />
    )
  }

  const courses = data.courses
  const selectedCourseName = courses.find((course) => course.id === courseId)?.name

  function handleFileChange(file?: File) {
    const nextFileName = file?.name || ""
    setFileName(nextFileName)
    setRecognition(null)

    if (!nextFileName) {
      return
    }

    const draft = recognizeMaterialFileName(nextFileName, courses)
    setRecognition(draft)
    if (!courseId && draft.courseId) {
      setCourseId(draft.courseId)
    }
    setType(draft.type)
    setTags(draft.tags.join("，"))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!courseId) {
      setError("请选择资料所属课程。")
      return
    }
    if (!fileName.trim()) {
      setError("请选择文件，或手动补充文件名。")
      return
    }

    addMaterial({
      id: createId(),
      courseId,
      fileName: fileName.trim(),
      type,
      tags: parseTags(tags),
      uploadedAt: nowIso(),
      note: note.trim() || undefined,
    })

    router.push(`/courses/${courseId}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="添加资料"
        description="选择文件只会读取文件名；MVP 不保存文件内容，也不会上传到云端。"
      />

      <Card>
        <CardHeader>
          <CardTitle>资料信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <span className="text-sm font-medium text-slate-700">选择文件</span>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    id="material-file-input"
                    type="file"
                    className="sr-only"
                    onChange={(event) => handleFileChange(event.target.files?.[0])}
                  />
                  <label
                    htmlFor="material-file-input"
                    className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    <Upload className="h-4 w-4" />
                    选择文件
                  </label>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">当前文件名</p>
                    <p className="truncate text-sm font-medium text-slate-900">
                      {fileName || "尚未选择文件"}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  这里只读取文件名用于推荐课程、类型和标签，不会上传或保存文件内容。
                </p>
              </div>
              {recognition ? (
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <Badge
                    variant={recognition.courseId || selectedCourseName ? "success" : "warning"}
                  >
                    {recognition.courseId
                      ? `推荐课程：${
                          courses.find((course) => course.id === recognition.courseId)
                            ?.name || "未知课程"
                        }`
                      : selectedCourseName
                        ? `已使用课程：${selectedCourseName}`
                        : "文件名未识别课程"}
                  </Badge>
                  <Badge variant={recognition.confidenceFlags.typeUncertain ? "warning" : "muted"}>
                    推荐类型：{materialTypeLabels[recognition.type]}
                  </Badge>
                  {recognition.tags.length ? (
                    <Badge variant="muted">推荐标签：{recognition.tags.join("，")}</Badge>
                  ) : (
                    <Badge variant="warning">未识别标签</Badge>
                  )}
                </div>
              ) : null}
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">资料类型</span>
                <Select
                  value={type}
                  onChange={(event) => setType(event.target.value as MaterialType)}
                >
                  {materialTypes.map((item) => (
                    <option key={item} value={item}>
                      {materialTypeLabels[item]}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">标签</span>
                <Input
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="复习，期末，重点"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">备注</span>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="例如：老师群里发的最终版，优先看第 3-5 章"
              />
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit">保存资料</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
