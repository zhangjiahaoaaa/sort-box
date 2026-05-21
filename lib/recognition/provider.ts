import { recognizeMaterialFileName } from "@/lib/material-recognition"
import { recognizeNotice } from "@/lib/recognition"
import type { MaterialRecognitionDraft } from "@/lib/material-recognition"
import type { Course, RecognitionDraft } from "@/lib/types"

export type RecognizeNoticeInput = {
  rawText: string
  courses: Course[]
  selectedCourseId?: string
  referenceDate?: Date
}

export type RecognizeMaterialFileNameInput = {
  fileName: string
  courses: Course[]
}

export type RecognitionProvider = {
  recognizeNotice(input: RecognizeNoticeInput): Promise<RecognitionDraft>
  recognizeMaterialFileName(
    input: RecognizeMaterialFileNameInput,
  ): Promise<MaterialRecognitionDraft>
}

export const MockRecognitionProvider: RecognitionProvider = {
  async recognizeNotice(input) {
    return recognizeNotice(
      input.rawText,
      input.courses,
      input.selectedCourseId,
      input.referenceDate,
    )
  },
  async recognizeMaterialFileName(input) {
    return recognizeMaterialFileName(input.fileName, input.courses)
  },
}

export const AiNoticeRecognitionProvider: RecognitionProvider = {
  async recognizeNotice(input) {
    try {
      const response = await fetch("/api/recognition/notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        throw new Error("AI recognition request failed")
      }

      const payload = (await response.json()) as { draft?: RecognitionDraft }
      if (!payload.draft) {
        throw new Error("AI recognition response missing draft")
      }

      return payload.draft
    } catch {
      return MockRecognitionProvider.recognizeNotice(input)
    }
  },
  recognizeMaterialFileName(input) {
    return MockRecognitionProvider.recognizeMaterialFileName(input)
  },
}

export const recognitionProvider: RecognitionProvider = AiNoticeRecognitionProvider
