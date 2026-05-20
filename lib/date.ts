import { format, isPast, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"

export function formatDateTime(value?: string) {
  if (!value) {
    return "未设置截止时间"
  }

  const parsed = parseISO(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return format(parsed, "M月d日 HH:mm", { locale: zhCN })
}

export function formatDate(value: string) {
  const parsed = parseISO(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return format(parsed, "M月d日", { locale: zhCN })
}

export function getDeadlineState(value?: string) {
  if (!value) {
    return "none"
  }

  const parsed = parseISO(value)
  if (Number.isNaN(parsed.getTime())) {
    return "unknown"
  }

  return isPast(parsed) ? "overdue" : "upcoming"
}
