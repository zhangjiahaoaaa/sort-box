import { EmptyState } from "@/components/common/EmptyState"
import { TodoItem } from "@/components/todos/TodoItem"
import type { Todo } from "@/lib/types"

type TodoListProps = {
  todos: Todo[]
  onToggle?: (todoId: string) => void
  onDelete?: (todoId: string) => void
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (!todos.length) {
    return (
      <EmptyState
        title="暂无待办"
        description="粘贴课程通知并确认识别结果后，DDL 会出现在这里。"
      />
    )
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
