import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/EmptyState"

export default function NotFound() {
  return (
    <EmptyState
      title="没有找到这个页面"
      description="可能是课程不存在，或者链接已经失效。"
      action={
        <Button asChild>
          <Link href="/">回到首页</Link>
        </Button>
      }
    />
  )
}
