"use client"

import { useEffect, useMemo, useState } from "react"
import { clearStoredFiles, deleteStoredFile, deleteStoredFiles } from "@/lib/file-store"
import { readAppData, resetAppData, writeAppData } from "@/lib/storage"
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
      deleteMaterial(materialId: string) {
        setData((current) =>
          {
            if (!current) {
              return current
            }

            const material = current.materials.find((item) => item.id === materialId)
            void deleteStoredFile(material?.fileId)

            return {
                ...current,
                materials: current.materials.filter(
                  (material) => material.id !== materialId,
                ),
              }
          },
        )
      },
      deleteTodo(todoId: string) {
        setData((current) =>
          current
            ? {
                ...current,
                todos: current.todos.filter((todo) => todo.id !== todoId),
              }
            : current,
        )
      },
      deleteCourse(courseId: string) {
        setData((current) =>
          {
            if (!current) {
              return current
            }

            const fileIds = current.materials
              .filter((material) => material.courseId === courseId)
              .map((material) => material.fileId)
            void deleteStoredFiles(fileIds)

            return {
                courses: current.courses.filter((course) => course.id !== courseId),
                materials: current.materials.filter(
                  (material) => material.courseId !== courseId,
                ),
                todos: current.todos.filter((todo) => todo.courseId !== courseId),
                notices: current.notices.filter((notice) => notice.courseId !== courseId),
              }
          },
        )
      },
      resetDemoData() {
        void clearStoredFiles()
        setData(resetAppData())
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
