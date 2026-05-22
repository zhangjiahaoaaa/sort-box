"use client"

import Link from "next/link"
import { Download, Eye, FileText, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TagList } from "@/components/common/TagList"
import { materialTypeLabels } from "@/lib/constants"
import { formatDate } from "@/lib/date"
import { downloadStoredFile } from "@/lib/file-store"
import type { Material } from "@/lib/types"
import { formatFileSize, formatMimeType } from "@/lib/utils"

export function MaterialItem({
  material,
  onDelete,
}: {
  material: Material
  onDelete?: (materialId: string) => void
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
          <FileText className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-slate-950">
              {material.fileName}
            </p>
            <Badge>{materialTypeLabels[material.type]}</Badge>
            <Badge variant={material.fileId ? "success" : "warning"}>
              {material.fileId ? "本地已保存" : "仅有记录"}
            </Badge>
            {onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  if (window.confirm(`确定删除资料「${material.fileName}」吗？`)) {
                    onDelete(material.id)
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
                删除
              </Button>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            上传于 {formatDate(material.uploadedAt)} · {formatFileSize(material.fileSize)} ·{" "}
            {formatMimeType(material.mimeType)}
          </p>
          {material.note ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">{material.note}</p>
          ) : null}
          <div className="mt-3">
            <TagList tags={material.tags} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {material.fileId ? (
              <Button asChild variant="secondary" size="sm">
                <Link href={`/materials/${material.id}`}>
                  <Eye className="h-4 w-4" />
                  预览
                </Link>
              </Button>
            ) : (
              <Button type="button" variant="secondary" size="sm" disabled>
                <Eye className="h-4 w-4" />
                预览
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              size="sm"
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
        </div>
      </div>
    </div>
  )
}
