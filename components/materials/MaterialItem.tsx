import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TagList } from "@/components/common/TagList"
import { materialTypeLabels } from "@/lib/constants"
import { formatDate } from "@/lib/date"
import type { Material } from "@/lib/types"

export function MaterialItem({ material }: { material: Material }) {
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
