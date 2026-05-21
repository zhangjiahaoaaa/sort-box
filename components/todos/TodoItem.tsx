import { CheckCircle2, Circle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeadlineBadge } from "@/components/todos/DeadlineBadge"
import { TagList } from "@/components/common/TagList"
import type { Todo } from "@/lib/types"

type TodoItemProps = {
  todo: Todo
  onToggle?: (todoId: string) => void
  onDelete?: (todoId: string) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onToggle?.(todo.id)}
            className="mt-0.5 text-teal-700"
            aria-label={todo.status === "done" ? "标记为待完成" : "标记为已完成"}
          >
            {todo.status === "done" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>
          <div>
            <p className={todo.status === "done" ? "text-sm text-slate-400 line-through" : "text-sm font-medium text-slate-950"}>
              {todo.title}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <DeadlineBadge deadline={todo.deadline} />
              {todo.submitMethod ? (
                <span className="text-xs text-slate-500">{todo.submitMethod}</span>
              ) : null}
            </div>
            <div className="mt-3">
              <TagList tags={todo.tags} />
            </div>
          </div>
        </div>
      </div>
      {onToggle ? (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => onToggle(todo.id)}>
            {todo.status === "done" ? "恢复待办" : "完成"}
          </Button>
          {onDelete ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                if (window.confirm(`确定删除待办「${todo.title}」吗？`)) {
                  onDelete(todo.id)
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              删除
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
