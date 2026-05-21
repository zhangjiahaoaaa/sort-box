import { FileText, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TagList } from "@/components/common/TagList"
import { materialTypeLabels } from "@/lib/constants"
import { formatDate } from "@/lib/date"
import type { Material } from "@/lib/types"

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
            上传于 {formatDate(material.uploadedAt)}
          </p>
          {material.note ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">{material.note}</p>
          ) : null}
          <div className="mt-3">
            <TagList tags={material.tags} />
          </div>
        </div>
      </div>
    </div>
  )
}
