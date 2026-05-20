import { Badge } from "@/components/ui/badge"
import { formatDateTime, getDeadlineState } from "@/lib/date"

export function DeadlineBadge({ deadline }: { deadline?: string }) {
  const state = getDeadlineState(deadline)

  if (state === "none") {
    return <Badge variant="muted">未设置截止时间</Badge>
  }

  if (state === "overdue") {
    return <Badge variant="danger">{formatDateTime(deadline)}</Badge>
  }

  return <Badge variant="warning">{formatDateTime(deadline)}</Badge>
}
