import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  type DocumentData,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { BaseDoc } from '@/types'

function timestampToDate(value: Timestamp | Date | undefined): Date {
  if (!value) return new Date()
  if (value instanceof Date) return value
  return value.toDate()
}

export function mapDoc<T extends BaseDoc>(
  id: string,
  data: DocumentData,
  mapper: (data: DocumentData) => Omit<T, keyof BaseDoc>,
): T {
  return {
    id,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    ...mapper(data),
  } as T
}

export function useCollection<T extends BaseDoc>(
  collectionName: string,
  mapper: (data: DocumentData) => Omit<T, keyof BaseDoc>,
) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const docs = snapshot.docs.map((d) => mapDoc<T>(d.id, d.data(), mapper))
        docs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        setItems(docs)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName])

  const create = useCallback(
    async (data: Omit<T, keyof BaseDoc>) => {
      const ref = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return ref.id
    },
    [collectionName],
  )

  const update = useCallback(
    async (id: string, data: Partial<Omit<T, keyof BaseDoc>>) => {
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: serverTimestamp(),
      })
    },
    [collectionName],
  )

  const remove = useCallback(
    async (id: string) => {
      await deleteDoc(doc(db, collectionName, id))
    },
    [collectionName],
  )

  return { items, loading, error, create, update, remove }
}
