import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

type GlobalSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function GlobalSearch({ value, onChange }: GlobalSearchProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="搜索课程、文件名、标签、通知内容或 DDL 标题"
        className="h-12 pl-10 text-base"
      />
    </div>
  )
}
