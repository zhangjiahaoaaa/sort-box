"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { FilePlus2, Inbox, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/PageHeader"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { UpcomingTodos } from "@/components/dashboard/UpcomingTodos"
import { RecentMaterials } from "@/components/dashboard/RecentMaterials"
import { CourseOverview } from "@/components/dashboard/CourseOverview"
import { GlobalSearch } from "@/components/search/GlobalSearch"
import { SearchResults } from "@/components/search/SearchResults"
import { useAppData } from "@/hooks/useAppData"
import { searchAppData } from "@/lib/search"

export default function DashboardPage() {
  const { data, isReady, toggleTodo, deleteTodo, resetDemoData } = useAppData()
  const [query, setQuery] = useState("")
  const [resetMessage, setResetMessage] = useState("")

  const results = useMemo(
    () => (data ? searchAppData(data, query) : null),
    [data, query],
  )

  if (!isReady || !data || !results) {
    return <p className="text-sm text-slate-500">正在整理你的课程资料...</p>
  }

  const isSearching = query.trim().length > 0

  function handleResetDemoData() {
    resetDemoData()
    setQuery("")
    setResetMessage("已恢复演示数据，可以重新开始三分钟演示。")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="首页 Dashboard"
        description="快速查看课程资料、近期 DDL，并从通知和文件名里搜索关键信息。"
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/add/material">
                <FilePlus2 className="h-4 w-4" />
                添加资料
              </Link>
            </Button>
            <Button asChild>
              <Link href="/add/notice">
                <Inbox className="h-4 w-4" />
                粘贴通知
              </Link>
            </Button>
            <Button type="button" variant="ghost" onClick={handleResetDemoData}>
              <RotateCcw className="h-4 w-4" />
              恢复演示数据
            </Button>
          </div>
        }
      />

      {resetMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {resetMessage}
        </div>
      ) : null}

      <GlobalSearch value={query} onChange={setQuery} />

      {isSearching ? (
        <SearchResults data={data} results={results} />
      ) : (
        <>
          <DashboardStats data={data} />
          <div className="grid gap-4 xl:grid-cols-2">
            <section id="ddl-list" className="scroll-mt-24">
              <UpcomingTodos
                todos={data.todos}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            </section>
            <section id="recent-materials" className="scroll-mt-24">
              <RecentMaterials materials={data.materials} />
            </section>
          </div>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-950">课程概览</h2>
            <CourseOverview data={data} />
          </section>
        </>
      )}
    </div>
  )
}
