"use client"

import { createId } from "@/lib/utils"

const databaseName = "final-rescue-file-store"
const databaseVersion = 1
const storeName = "files"

export type StoredFile = {
  id: string
  name: string
  type: string
  size: number
  blob: Blob
  createdAt: string
}

function ensureBrowser() {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    throw new Error("IndexedDB is only available in the browser.")
  }
}

function openDatabase(): Promise<IDBDatabase> {
  ensureBrowser()

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, databaseVersion)

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName, { keyPath: "id" })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function runStoreTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDatabase().then(
    (database) =>
      new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, mode)
        const store = transaction.objectStore(storeName)
        const request = operation(store)

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
        transaction.oncomplete = () => database.close()
        transaction.onerror = () => {
          database.close()
          reject(transaction.error)
        }
        transaction.onabort = () => {
          database.close()
          reject(transaction.error)
        }
      }),
  )
}

export async function saveStoredFile(file: File): Promise<StoredFile> {
  const storedFile: StoredFile = {
    id: createId(),
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    blob: file,
    createdAt: new Date().toISOString(),
  }

  await runStoreTransaction("readwrite", (store) => store.put(storedFile))
  return storedFile
}

export async function getStoredFile(fileId: string): Promise<StoredFile | null> {
  const result = await runStoreTransaction<StoredFile | undefined>("readonly", (store) =>
    store.get(fileId),
  )

  return result ?? null
}

export async function deleteStoredFile(fileId?: string) {
  if (!fileId) {
    return
  }

  await runStoreTransaction("readwrite", (store) => store.delete(fileId))
}

export async function deleteStoredFiles(fileIds: Array<string | undefined>) {
  await Promise.all(fileIds.filter(Boolean).map((fileId) => deleteStoredFile(fileId)))
}

export async function clearStoredFiles() {
  await runStoreTransaction("readwrite", (store) => store.clear())
}

export async function downloadStoredFile(fileId: string, fallbackName: string) {
  const storedFile = await getStoredFile(fileId)
  if (!storedFile) {
    throw new Error("File not found in local browser storage.")
  }

  const url = URL.createObjectURL(storedFile.blob)
  const link = document.createElement("a")
  link.href = url
  link.download = storedFile.name || fallbackName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
