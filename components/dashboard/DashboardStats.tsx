import { BookOpen, FileText, ListChecks } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { AppData } from "@/lib/types"

export function DashboardStats({ data }: { data: AppData }) {
  const pending = data.todos.filter((todo) => todo.status === "pending").length
  const stats = [
    { label: "课程", value: data.courses.length, icon: BookOpen },
    { label: "资料", value: data.materials.length, icon: FileText },
    { label: "待办", value: pending, icon: ListChecks },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {stat.value}
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <Icon className="h-5 w-5" />
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
