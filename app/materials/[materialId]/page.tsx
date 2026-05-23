"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  Bell,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  FileWarning,
  ListChecks,
  Star,
  Trash2,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { EmptyState } from "@/components/common/EmptyState"
import { PageHeader } from "@/components/common/PageHeader"
import { TagList } from "@/components/common/TagList"
import { DeadlineBadge } from "@/components/todos/DeadlineBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { downloadStoredFile, getStoredFile } from "@/lib/file-store"
import type { StoredFile } from "@/lib/file-store"
import { getMaterialContext } from "@/lib/material-context"
import { materialTypeLabels } from "@/lib/constants"
import { formatDateTime } from "@/lib/date"
import type { Material, Notice, Todo } from "@/lib/types"
import { formatFileSize, formatMimeType } from "@/lib/utils"
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

export default function MaterialPreviewPage() {
  const params = useParams<{ materialId: string }>()
  const router = useRouter()
  const {
    data,
    isReady,
    deleteMaterial,
    setMaterialStatus,
    toggleMaterialImportant,
  } = useAppData()
  const [storedFile, setStoredFile] = useState<StoredFile | null>(null)
  const [objectUrl, setObjectUrl] = useState("")
  const [textContent, setTextContent] = useState("")
  const [isLoadingFile, setIsLoadingFile] = useState(true)
  const [fileError, setFileError] = useState("")

  const material = data?.materials.find((item) => item.id === params.materialId)
  const course = data?.courses.find((item) => item.id === material?.courseId)
  const context = useMemo(
    () => (data && material ? getMaterialContext(data, material) : null),
    [data, material],
  )

  function handleDeleteMaterial() {
    if (!material) {
      return
    }

    const confirmed = window.confirm(`确定删除资料「${material.fileName}」吗？`)
    if (!confirmed) {
      return
    }

    const nextHref = course ? `/courses/${course.id}` : "/"
    deleteMaterial(material.id)
    router.replace(nextHref)
  }

  const previewKind = useMemo(() => {
    const mimeType = material?.mimeType || storedFile?.type || ""
    const fileName = material?.fileName.toLowerCase() || ""

    if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      return "pdf"
    }
    if (mimeType.startsWith("image/")) {
      return "image"
    }
    if (mimeType === "text/plain" || fileName.endsWith(".txt")) {
      return "text"
    }
    return "unsupported"
  }, [material?.fileName, material?.mimeType, storedFile?.type])

  useEffect(() => {
    let nextObjectUrl = ""
    let isActive = true

    async function loadFile() {
      setStoredFile(null)
      setObjectUrl("")
      setTextContent("")
      setFileError("")

      if (!material?.fileId) {
        setIsLoadingFile(false)
        return
      }

      setIsLoadingFile(true)
      try {
        const nextFile = await getStoredFile(material.fileId)
        if (!isActive) {
          return
        }

        if (!nextFile) {
          setFileError("没有在当前浏览器找到这个文件，请重新上传。")
          setIsLoadingFile(false)
          return
        }

        nextObjectUrl = URL.createObjectURL(nextFile.blob)
        setStoredFile(nextFile)
        setObjectUrl(nextObjectUrl)
        if (
          nextFile.type === "text/plain" ||
          material.fileName.toLowerCase().endsWith(".txt")
        ) {
          setTextContent(await nextFile.blob.text())
        }
      } catch {
        if (isActive) {
          setFileError("读取本地文件失败，请检查浏览器存储权限。")
        }
      } finally {
        if (isActive) {
          setIsLoadingFile(false)
        }
      }
    }

    void loadFile()

    return () => {
      isActive = false
      if (nextObjectUrl) {
        URL.revokeObjectURL(nextObjectUrl)
      }
    }
  }, [material?.fileId, material?.fileName])

  if (!isReady || !data) {
    return <p className="text-sm text-slate-500">正在读取资料...</p>
  }

  if (!material) {
    return (
      <EmptyState
        title="资料不存在"
        description="可能已经被删除，或者链接已经失效。"
        action={
          <Button asChild>
            <Link href="/">回到首页</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={material.fileName}
        description={course ? `来自课程：${course.name}` : "本地资料库文件"}
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={course ? `/courses/${course.id}` : "/"}>返回课程</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleDeleteMaterial}
            >
              <Trash2 className="h-4 w-4" />
              删除资料
            </Button>
            <Button
              type="button"
              disabled={!material.fileId}
              onClick={async () => {
                if (!material.fileId) {
                  return
                }

                try {
                  await downloadStoredFile(material.fileId, material.fileName)
                } catch {
                  window.alert("没有在当前浏览器找到这个文件，请重新上传。")
                }
              }}
            >
              <Download className="h-4 w-4" />
              下载
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Badge>{formatMimeType(material.mimeType)}</Badge>
        <Badge variant="muted">{formatFileSize(material.fileSize)}</Badge>
        <Badge variant={materialStatusVariants[material.status]}>
          {materialStatusLabels[material.status]}
        </Badge>
        {material.isImportant ? <Badge variant="danger">重点资料</Badge> : null}
        <Badge variant={material.fileId ? "success" : "warning"}>
          {material.fileId ? "IndexedDB 本地保存" : "仅有资料记录"}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={material.status !== "new"}
          onClick={() => setMaterialStatus(material.id, "viewed")}
        >
          <Eye className="h-4 w-4" />
          标为已查看
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={material.status === "reviewed"}
          onClick={() => setMaterialStatus(material.id, "reviewed")}
        >
          <CheckCircle2 className="h-4 w-4" />
          标为已复习
        </Button>
        <Button
          type="button"
          variant={material.isImportant ? "danger" : "secondary"}
          onClick={() => toggleMaterialImportant(material.id)}
        >
          <Star className="h-4 w-4" />
          {material.isImportant ? "取消重点" : "标为重点"}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardContent className="p-0">
            {isLoadingFile ? (
              <p className="p-6 text-sm text-slate-500">正在读取本地文件...</p>
            ) : fileError ? (
              <div className="flex items-center gap-3 p-6 text-sm text-amber-700">
                <FileWarning className="h-5 w-5" />
                {fileError}
              </div>
            ) : previewKind === "pdf" && objectUrl ? (
              <iframe
                title={material.fileName}
                src={objectUrl}
                className="h-[72vh] w-full rounded-lg"
              />
            ) : previewKind === "image" && objectUrl ? (
              <div className="flex justify-center bg-slate-950/5 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={objectUrl}
                  alt={material.fileName}
                  className="max-h-[72vh] max-w-full rounded-md object-contain"
                />
              </div>
            ) : previewKind === "text" ? (
              <pre className="max-h-[72vh] overflow-auto whitespace-pre-wrap p-6 text-sm leading-6 text-slate-800">
                {textContent || "这个文本文件没有内容。"}
              </pre>
            ) : (
              <div className="space-y-3 p-6">
                <div className="flex items-center gap-3 text-slate-700">
                  <FileWarning className="h-5 w-5" />
                  <p className="font-medium">暂不支持在线预览，可下载查看。</p>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  Word、PPT、Excel 等 Office 文件会保存在本地资料库中，但当前 MVP
                  不做浏览器内解析。
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {context ? (
          <aside className="space-y-4">
            <CourseContextCard
              courseName={course?.name || "未知课程"}
              teacher={course?.teacher}
              semester={course?.semester}
              description={course?.description}
              href={course ? `/courses/${course.id}` : "/courses"}
            />
            <RelatedTodosCard todos={context.relatedTodos} />
            <RelatedNoticesCard notices={context.relatedNotices} />
            <SimilarMaterialsCard materials={context.similarMaterials} />
          </aside>
        ) : null}
      </div>
    </div>
  )
}

function CourseContextCard({
  courseName,
  teacher,
  semester,
  description,
  href,
}: {
  courseName: string
  teacher?: string
  semester?: string
  description?: string
  href: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4 text-teal-700" />
          课程信息
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href={href} className="font-medium text-slate-950 hover:text-teal-700">
          {courseName}
        </Link>
        <div className="flex flex-wrap gap-2">
          {teacher ? <Badge variant="muted">{teacher}</Badge> : null}
          {semester ? <Badge variant="muted">{semester}</Badge> : null}
        </div>
        {description ? (
          <p className="text-sm leading-6 text-slate-500">{description}</p>
        ) : (
          <p className="text-sm text-slate-400">暂无课程备注</p>
        )}
      </CardContent>
    </Card>
  )
}

function RelatedTodosCard({ todos }: { todos: Todo[] }) {
  return (
    <ContextCard title="相关 DDL" icon={<ListChecks className="h-4 w-4 text-amber-700" />}>
      {todos.length ? (
        <div className="space-y-3">
          {todos.map((todo) => (
            <Link
              key={todo.id}
              href={`/courses/${todo.courseId}`}
              className="block rounded-md border border-slate-100 p-3 transition hover:border-teal-200 hover:bg-teal-50"
            >
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
            </Link>
          ))}
        </div>
      ) : (
        <EmptyContext text="还没有匹配到相关 DDL" />
      )}
    </ContextCard>
  )
}

function RelatedNoticesCard({ notices }: { notices: Notice[] }) {
  return (
    <ContextCard title="相关通知" icon={<Bell className="h-4 w-4 text-blue-700" />}>
      {notices.length ? (
        <div className="space-y-3">
          {notices.map((notice) => (
            <Link
              key={notice.id}
              href={`/courses/${notice.courseId}`}
              className="block rounded-md border border-slate-100 p-3 transition hover:border-teal-200 hover:bg-teal-50"
            >
              <p className="text-sm font-medium text-slate-950">{notice.extractedTitle}</p>
              <p className="mt-2 text-xs text-slate-500">
                {formatDateTime(notice.extractedDeadline)}
                {notice.submitMethod ? ` · ${notice.submitMethod}` : ""}
              </p>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                {notice.rawText}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyContext text="还没有匹配到相关通知" />
      )}
    </ContextCard>
  )
}

function SimilarMaterialsCard({ materials }: { materials: Material[] }) {
  return (
    <ContextCard title="相似资料" icon={<FileText className="h-4 w-4 text-teal-700" />}>
      {materials.length ? (
        <div className="space-y-3">
          {materials.map((material) => (
            <Link
              key={material.id}
              href={`/materials/${material.id}`}
              className="block rounded-md border border-slate-100 p-3 transition hover:border-teal-200 hover:bg-teal-50"
            >
              <p className="line-clamp-2 text-sm font-medium text-slate-950">
                {material.fileName}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {materialTypeLabels[material.type]} · {formatFileSize(material.fileSize)}
              </p>
              <div className="mt-3">
                <TagList tags={material.tags} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyContext text="还没有相似资料" />
      )}
    </ContextCard>
  )
}

function ContextCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function EmptyContext({ text }: { text: string }) {
  return <p className="text-sm text-slate-400">{text}</p>
}
