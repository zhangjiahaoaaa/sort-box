"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Download, FileWarning } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { EmptyState } from "@/components/common/EmptyState"
import { PageHeader } from "@/components/common/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { downloadStoredFile, getStoredFile } from "@/lib/file-store"
import type { StoredFile } from "@/lib/file-store"
import { formatFileSize, formatMimeType } from "@/lib/utils"
import { useAppData } from "@/hooks/useAppData"

export default function MaterialPreviewPage() {
  const params = useParams<{ materialId: string }>()
  const { data, isReady } = useAppData()
  const [storedFile, setStoredFile] = useState<StoredFile | null>(null)
  const [objectUrl, setObjectUrl] = useState("")
  const [textContent, setTextContent] = useState("")
  const [isLoadingFile, setIsLoadingFile] = useState(true)
  const [fileError, setFileError] = useState("")

  const material = data?.materials.find((item) => item.id === params.materialId)
  const course = data?.courses.find((item) => item.id === material?.courseId)

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
        <Badge variant={material.fileId ? "success" : "warning"}>
          {material.fileId ? "IndexedDB 本地保存" : "仅有资料记录"}
        </Badge>
      </div>

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
    </div>
  )
}
