import { Badge } from "@/components/ui/badge"

export function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) {
    return <span className="text-xs text-slate-400">暂无标签</span>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="muted">
          {tag}
        </Badge>
      ))}
    </div>
  )
}
