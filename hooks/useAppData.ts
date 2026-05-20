"use client"

import { useEffect, useMemo, useState } from "react"
import { readAppData, writeAppData } from "@/lib/storage"
import type { AppData, Course, Material, Notice, Todo } from "@/lib/types"

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null)
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      setData(readAppData())
      setHasHydrated(true)
    })
  }, [])

  useEffect(() => {
    if (hasHydrated && data) {
      writeAppData(data)
    }
  }, [data, hasHydrated])

  const actions = useMemo(
    () => ({
      addCourse(course: Course) {
        setData((current) =>
          current
            ? { ...current, courses: [course, ...current.courses] }
            : current,
        )
      },
      addMaterial(material: Material) {
        setData((current) =>
          current
            ? { ...current, materials: [material, ...current.materials] }
            : current,
        )
      },
      addNoticeAndTodo(notice: Notice, todo: Todo) {
        setData((current) =>
          current
            ? {
                ...current,
                notices: [notice, ...current.notices],
                todos: [todo, ...current.todos],
              }
            : current,
        )
      },
      toggleTodo(todoId: string) {
        setData((current) =>
          current
            ? {
                ...current,
                todos: current.todos.map((todo) =>
                  todo.id === todoId
                    ? {
                        ...todo,
                        status: todo.status === "pending" ? "done" : "pending",
                        updatedAt: new Date().toISOString(),
                      }
                    : todo,
                ),
              }
            : current,
        )
      },
    }),
    [],
  )

  return {
    data,
    isReady: hasHydrated && Boolean(data),
    ...actions,
  }
}
