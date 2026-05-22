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
import { saveStoredFile } from "@/lib/file-store"
import type { MaterialRecognitionDraft } from "@/lib/material-recognition"
import { recognitionProvider } from "@/lib/recognition/provider"
import { createId, nowIso, parseTags } from "@/lib/utils"
import { useAppData } from "@/hooks/useAppData"
import type { Course, MaterialType } from "@/lib/types"

const courseColors = ["#0f766e", "#2563eb", "#d97706", "#7c3aed", "#be123c"]

export default function AddMaterialPage() {
  const router = useRouter()
  const { data, isReady, addCourse, addMaterial } = useAppData()
  const [courseId, setCourseId] = useState("")
  const [fileName, setFileName] = useState("")
  const [type, setType] = useState<MaterialType>("courseware")
  const [tags, setTags] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
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
        title="创建第一门课"
        description="资料需要归到具体课程里。先创建课程，再回来添加第一份资料。"
        action={
          <Button asChild>
            <Link href="/courses">创建第一门课</Link>
          </Button>
        }
      />
    )
  }

  const courses = data.courses
  const selectedCourseName = courses.find((course) => course.id === courseId)?.name

  function createCourseFromSuggestion() {
    const suggestedName = recognition?.suggestedCourseName?.trim()
    if (!suggestedName) {
      return
    }

    const existingCourse = courses.find((course) => course.name === suggestedName)
    if (existingCourse) {
      setCourseId(existingCourse.id)
      return
    }

    const timestamp = nowIso()
    const course: Course = {
      id: createId(),
      name: suggestedName,
      semester: "2025-2026 春季",
      color: courseColors[Math.floor(Math.random() * courseColors.length)],
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    addCourse(course)
    setCourseId(course.id)
    setError("")
  }

  async function handleFileChange(file?: File) {
    const nextFileName = file?.name || ""
    setSelectedFile(file ?? null)
    setFileName(nextFileName)
    setRecognition(null)
    setError("")

    if (!nextFileName) {
      return
    }

    const draft = await recognitionProvider.recognizeMaterialFileName({
      fileName: nextFileName,
      courses,
    })
    setRecognition(draft)
    if (!courseId && draft.courseId) {
      setCourseId(draft.courseId)
    }
    setType(draft.type)
    setTags(draft.tags.join("，"))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!courseId) {
      setError("请选择资料所属课程。")
      return
    }
    if (!selectedFile) {
      setError("请选择要保存到本地资料库的文件。")
      return
    }

    setIsSaving(true)
    setError("")
    try {
      const storedFile = await saveStoredFile(selectedFile)
      const extractedText = await extractTextFromFile(selectedFile)
      addMaterial({
        id: createId(),
        courseId,
        fileName: fileName.trim() || storedFile.name,
        fileId: storedFile.id,
        mimeType: storedFile.type,
        fileSize: storedFile.size,
        type,
        tags: parseTags(tags),
        uploadedAt: nowIso(),
        extractedText,
        note: note.trim() || undefined,
      })

      router.push(`/courses/${courseId}`)
    } catch {
      setError("文件保存到浏览器本地资料库失败，请换个文件或检查浏览器存储权限。")
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="添加资料"
        description="文件会保存在本机浏览器 IndexedDB 中，刷新后仍可预览或下载；不会上传到云端。"
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
                  系统会根据文件名推荐课程、类型和标签；文件本体只保存在当前浏览器本地。
                </p>
              </div>
              {recognition ? (
                <div className="space-y-3">
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
                          : recognition.suggestedCourseName
                            ? `疑似新课程：${recognition.suggestedCourseName}`
                            : "文件名未识别课程"}
                    </Badge>
                    <Badge
                      variant={recognition.confidenceFlags.typeUncertain ? "warning" : "muted"}
                    >
                      推荐类型：{materialTypeLabels[recognition.type]}
                    </Badge>
                    {recognition.tags.length ? (
                      <Badge variant="muted">推荐标签：{recognition.tags.join("，")}</Badge>
                    ) : (
                      <Badge variant="warning">未识别标签</Badge>
                    )}
                  </div>
                  {!recognition.courseId && !selectedCourseName && recognition.suggestedCourseName ? (
                    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      <span>检测到可能的新课程：{recognition.suggestedCourseName}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={createCourseFromSuggestion}
                      >
                        创建课程并使用
                      </Button>
                    </div>
                  ) : null}
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
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "正在保存..." : "保存资料"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

async function extractTextFromFile(file: File) {
  if (file.type !== "text/plain" && !file.name.toLowerCase().endsWith(".txt")) {
    return undefined
  }

  const text = await file.text()
  return text.trim() || undefined
}
