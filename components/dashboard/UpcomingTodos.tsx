import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TodoItem } from "@/components/todos/TodoItem"
import type { Todo } from "@/lib/types"

export function UpcomingTodos({
  todos,
  onToggle,
  onDelete,
}: {
  todos: Todo[]
  onToggle: (todoId: string) => void
  onDelete?: (todoId: string) => void
}) {
  const groups = groupTodosByDeadline(todos)

  return (
    <Card>
      <CardHeader>
        <CardTitle>DDL 救命清单</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {groups.some((group) => group.todos.length) ? (
          groups.map((group) =>
            group.todos.length ? (
              <section key={group.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">
                    {group.label}
                  </h3>
                  <span className="text-xs text-slate-400">{group.todos.length}</span>
                </div>
                <div className="space-y-2">
                  {group.todos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={onToggle}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </section>
            ) : null,
          )
        ) : (
          <p className="text-sm text-slate-500">暂无待办。</p>
        )}
      </CardContent>
    </Card>
  )
}

function groupTodosByDeadline(todos: Todo[]) {
  const sorted = [...todos].sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""))
  const groups = [
    { label: "已逾期", todos: [] as Todo[] },
    { label: "今天", todos: [] as Todo[] },
    { label: "明天", todos: [] as Todo[] },
    { label: "本周", todos: [] as Todo[] },
    { label: "更晚", todos: [] as Todo[] },
    { label: "已完成", todos: [] as Todo[] },
    { label: "待确认时间", todos: [] as Todo[] },
  ]

  for (const todo of sorted) {
    if (todo.status === "done") {
      groups[5].todos.push(todo)
      continue
    }

    if (!todo.deadline) {
      groups[6].todos.push(todo)
      continue
    }

    const deadline = new Date(todo.deadline)
    if (Number.isNaN(deadline.getTime())) {
      groups[6].todos.push(todo)
      continue
    }

    if (isBeforeDay(deadline, new Date())) {
      groups[0].todos.push(todo)
    } else if (isSameDay(deadline, new Date())) {
      groups[1].todos.push(todo)
    } else if (isSameDay(deadline, addDays(new Date(), 1))) {
      groups[2].todos.push(todo)
    } else if (isSameWeek(deadline, new Date())) {
      groups[3].todos.push(todo)
    } else {
      groups[4].todos.push(todo)
    }
  }

  return groups
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isBeforeDay(a: Date, b: Date) {
  const left = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  const right = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  return left < right
}

function isSameWeek(a: Date, b: Date) {
  const weekStart = startOfWeek(b)
  const weekEnd = addDays(weekStart, 7)
  return a >= weekStart && a < weekEnd
}

function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = start.getDay() || 7
  start.setDate(start.getDate() - day + 1)
  return start
}
