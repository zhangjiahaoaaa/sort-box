import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function nowIso() {
  return new Date().toISOString()
}

export function parseTags(value: string) {
  return value
    .split(/[,，\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function formatTags(tags: string[]) {
  return tags.join("，")
}

export function formatFileSize(size?: number) {
  if (!size || size < 0) {
    return "未知大小"
  }

  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

export function formatMimeType(type?: string) {
  if (!type) {
    return "未知类型"
  }

  const labels: Record<string, string> = {
    "application/pdf": "PDF",
    "image/jpeg": "JPEG 图片",
    "image/png": "PNG 图片",
    "image/gif": "GIF 图片",
    "image/webp": "WebP 图片",
    "text/plain": "文本",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word 文档",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPT 演示文稿",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel 表格",
  }

  return labels[type] ?? type
}
