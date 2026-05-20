"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, FilePlus2, Home, Inbox, ListChecks } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/courses", label: "课程", icon: BookOpen },
  { href: "/add/material", label: "添加资料", icon: FilePlus2 },
  { href: "/add/notice", label: "粘贴通知", icon: Inbox },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-white">
            <ListChecks className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-base font-semibold text-slate-950">
              期末救命箱
            </span>
            <span className="block text-xs text-slate-500">课程资料作战台</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
                  active && "bg-teal-50 text-teal-800",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-700 text-white">
                <ListChecks className="h-4 w-4" />
              </span>
              <span className="font-semibold text-slate-950">期末救命箱</span>
            </Link>
            <p className="hidden text-sm text-slate-500 lg:block">
              把群通知、课程资料和 DDL 收进一个地方。
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/courses"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                课程
              </Link>
              <Link
                href="/add/material"
                className="hidden rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:inline-block"
              >
                添加资料
              </Link>
              <Link
                href="/add/notice"
                className="rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800"
              >
                粘贴通知
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
