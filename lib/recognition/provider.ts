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
  recognizeNotice(input: RecognizeNoticeInput): RecognitionDraft
  recognizeMaterialFileName(
    input: RecognizeMaterialFileNameInput,
  ): MaterialRecognitionDraft
}

export const MockRecognitionProvider: RecognitionProvider = {
  recognizeNotice(input) {
    return recognizeNotice(
      input.rawText,
      input.courses,
      input.selectedCourseId,
      input.referenceDate,
    )
  },
  recognizeMaterialFileName(input) {
    return recognizeMaterialFileName(input.fileName, input.courses)
  },
}

export const recognitionProvider: RecognitionProvider = MockRecognitionProvider
