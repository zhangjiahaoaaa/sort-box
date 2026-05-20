"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/common/EmptyState"
import { PageHeader } from "@/components/common/PageHeader"
import { materialTypeLabels, materialTypes } from "@/lib/constants"
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
              <Input
                type="file"
                onChange={(event) => setFileName(event.target.files?.[0]?.name || "")}
              />
              <p className="text-xs text-slate-500">
                当前文件名：{fileName || "尚未选择文件"}
              </p>
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
