"use client"

import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Course } from "@/lib/types"
import { createId, nowIso } from "@/lib/utils"

const colors = ["#0f766e", "#2563eb", "#d97706", "#7c3aed", "#be123c"]

export function CourseForm({ onAdd }: { onAdd: (course: Course) => void }) {
  const [name, setName] = useState("")
  const [teacher, setTeacher] = useState("")
  const [semester, setSemester] = useState("2025-2026 春季")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      setError("请先填写课程名称。")
      return
    }

    const timestamp = nowIso()
    onAdd({
      id: createId(),
      name: name.trim(),
      teacher: teacher.trim() || undefined,
      semester: semester.trim() || undefined,
      description: description.trim() || undefined,
      color: colors[Math.floor(Math.random() * colors.length)],
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    setName("")
    setTeacher("")
    setSemester("2025-2026 春季")
    setDescription("")
    setError("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="课程名称，例如 数据库系统"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          value={teacher}
          onChange={(event) => setTeacher(event.target.value)}
          placeholder="老师，可选"
        />
        <Input
          value={semester}
          onChange={(event) => setSemester(event.target.value)}
          placeholder="学期，可选"
        />
      </div>
      <Textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="备注这门课的复习重点或资料来源，可选"
        className="min-h-20"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit">新建课程</Button>
    </form>
  )
}
