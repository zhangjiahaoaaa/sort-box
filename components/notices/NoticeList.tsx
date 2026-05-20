import { EmptyState } from "@/components/common/EmptyState"
import { TagList } from "@/components/common/TagList"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/date"
import type { Notice } from "@/lib/types"

export function NoticeList({ notices }: { notices: Notice[] }) {
  if (!notices.length) {
    return (
      <EmptyState
        title="还没有通知记录"
        description="粘贴群通知并确认后，原文和识别结果会保存在这里。"
      />
    )
  }

  return (
    <div className="space-y-3">
      {notices.map((notice) => (
        <div key={notice.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-slate-950">
              {notice.extractedTitle}
            </p>
            <Badge variant="warning">{formatDateTime(notice.extractedDeadline)}</Badge>
          </div>
          {notice.submitMethod ? (
            <p className="mt-2 text-xs text-slate-500">{notice.submitMethod}</p>
          ) : null}
          <p className="mt-3 text-sm leading-6 text-slate-600">{notice.rawText}</p>
          <div className="mt-3">
            <TagList tags={notice.tags} />
          </div>
        </div>
      ))}
    </div>
  )
}
