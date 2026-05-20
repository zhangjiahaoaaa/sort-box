import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TodoItem } from "@/components/todos/TodoItem"
import type { Todo } from "@/lib/types"

export function UpcomingTodos({
  todos,
  onToggle,
}: {
  todos: Todo[]
  onToggle: (todoId: string) => void
}) {
  const upcoming = [...todos]
    .filter((todo) => todo.status === "pending")
    .sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""))
    .slice(0, 4)

  return (
    <Card>
      <CardHeader>
        <CardTitle>近期 DDL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcoming.length ? (
          upcoming.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={onToggle} />
          ))
        ) : (
          <p className="text-sm text-slate-500">暂时没有待完成的 DDL。</p>
        )}
      </CardContent>
    </Card>
  )
}
