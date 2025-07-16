'use client'
import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'

export interface TabItem {
  title: string
  url: string
}

const COOKIE_KEY = 'history_tabs'

export function useTabHistory() {
  const [tabs, setTabs] = useState<TabItem[]>([])

  const load = useCallback(() => {
    const json = Cookies.get(COOKIE_KEY)
    if (json) {
      try { setTabs(JSON.parse(json)) }
      catch { setTabs([]) }
    }
  }, [])

  const save = useCallback((list: TabItem[]) => {
    Cookies.set(COOKIE_KEY, JSON.stringify(list), { expires: 7 })
  }, [])

  // 탭 추가
  const add = useCallback((item: TabItem) => {
    setTabs(prev => {
      if (prev.some(t => t.url === item.url)) return prev
      const next = [...prev, item]
      save(next)
      return next
    })
  }, [save])

  // 개별 삭제
  const remove = useCallback((url: string) => {
    setTabs(prev => {
      const next = prev.filter(t => t.url !== url)
      save(next)
      return next
    })
  }, [save])

  // 전체 삭제
  const removeAll = useCallback(() => {
    setTabs([])
    Cookies.remove(COOKIE_KEY)
  }, [])

  useEffect(() => {
    load()
    const title = document.title || '페이지'
    const url = window.location.pathname
    add({ title, url })
  }, [load, add])

  return { tabs, add, remove, removeAll }
}
