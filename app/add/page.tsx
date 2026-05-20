import Link from "next/link"
import { FilePlus2, Inbox } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/common/PageHeader"

const actions = [
  {
    href: "/add/material",
    title: "添加资料",
    description: "选择本地文件，只保存文件名、课程、类型、标签和备注。",
    icon: FilePlus2,
  },
  {
    href: "/add/notice",
    title: "粘贴通知",
    description: "粘贴群通知，先 mock 识别，再确认归档为通知和待办。",
    icon: Inbox,
  },
]

export default function AddPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="添加内容" description="选择你要收进救命箱的信息类型。" />
      <div className="grid gap-4 md:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.href} href={action.href}>
              <Card className="h-full transition hover:border-teal-300 hover:shadow-md">
                <CardContent className="p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-lg font-semibold text-slate-950">
                    {action.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
