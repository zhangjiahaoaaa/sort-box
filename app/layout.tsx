import type { Metadata } from "next"
import "./globals.css"
import { AppShell } from "@/components/layout/AppShell"

export const metadata: Metadata = {
  title: "期末救命箱",
  description: "课程资料与 DDL 智能整理助手",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
