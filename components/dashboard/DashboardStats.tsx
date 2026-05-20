import Link from "next/link"
import { ArrowRight, BookOpen, FileText, ListChecks } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { AppData } from "@/lib/types"

export function DashboardStats({ data }: { data: AppData }) {
  const pending = data.todos.filter((todo) => todo.status === "pending").length
  const stats = [
    {
      label: "课程",
      value: data.courses.length,
      icon: BookOpen,
      href: "/courses",
      action: "查看课程",
    },
    {
      label: "资料",
      value: data.materials.length,
      icon: FileText,
      href: "#recent-materials",
      action: "查看资料",
    },
    {
      label: "待办",
      value: pending,
      icon: ListChecks,
      href: "#ddl-list",
      action: "查看待办",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.label}
            className="transition hover:border-teal-300 hover:shadow-md"
          >
            <CardContent
              asChild
              className="flex items-center justify-between p-5"
            >
              <Link href={stat.href} aria-label={stat.action}>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {stat.value}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-teal-700">
                  {stat.action}
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <Icon className="h-5 w-5" />
              </span>
              </Link>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
