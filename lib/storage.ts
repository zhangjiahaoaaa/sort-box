"use client"

import { appDataKey, recognitionDraftKey } from "@/lib/constants"
import { demoData } from "@/lib/mock-data"
import type { AppData, Material, RecognitionDraft } from "@/lib/types"

function cloneData(data: AppData): AppData {
  return JSON.parse(JSON.stringify(data)) as AppData
}

function normalizeMaterial(material: Material): Material {
  return {
    ...material,
    status: material.status || "new",
    isImportant: Boolean(material.isImportant),
  }
}

function normalizeAppData(data: AppData): AppData {
  return {
    ...data,
    materials: data.materials.map(normalizeMaterial),
  }
}

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== "object") {
    return false
  }

  const data = value as Partial<AppData>
  return (
    Array.isArray(data.courses) &&
    Array.isArray(data.materials) &&
    Array.isArray(data.todos) &&
    Array.isArray(data.notices)
  )
}

export function readAppData(): AppData {
  if (typeof window === "undefined") {
    return cloneData(demoData)
  }

  try {
    const raw = window.localStorage.getItem(appDataKey)
    if (!raw) {
      const seeded = normalizeAppData(cloneData(demoData))
      window.localStorage.setItem(appDataKey, JSON.stringify(seeded))
      return seeded
    }

    const parsed = JSON.parse(raw) as unknown
    if (!isAppData(parsed)) {
      throw new Error("Invalid app data")
    }

    const normalized = normalizeAppData(parsed)
    window.localStorage.setItem(appDataKey, JSON.stringify(normalized))
    return normalized
  } catch {
    const fallback = normalizeAppData(cloneData(demoData))
    window.localStorage.setItem(appDataKey, JSON.stringify(fallback))
    return fallback
  }
}

export function writeAppData(data: AppData) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(appDataKey, JSON.stringify(data))
}

export function resetAppData(): AppData {
  const seeded = normalizeAppData(cloneData(demoData))
  if (typeof window !== "undefined") {
    window.localStorage.setItem(appDataKey, JSON.stringify(seeded))
    window.localStorage.removeItem(recognitionDraftKey)
  }

  return seeded
}

export function readRecognitionDraft(): RecognitionDraft | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw = window.localStorage.getItem(recognitionDraftKey)
    return raw ? (JSON.parse(raw) as RecognitionDraft) : null
  } catch {
    window.localStorage.removeItem(recognitionDraftKey)
    return null
  }
}

export function writeRecognitionDraft(draft: RecognitionDraft) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(recognitionDraftKey, JSON.stringify(draft))
}

export function clearRecognitionDraft() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(recognitionDraftKey)
}
