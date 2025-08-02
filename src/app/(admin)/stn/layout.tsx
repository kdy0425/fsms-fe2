'use client'

import { ReactNode, useState } from 'react'
import HistorySlider from '@/components/history/HistorySlider'
import { useTabHistory } from '@/utils/fsms/common/useTabHistory'

export default function StnLayout({ children }: { children: ReactNode }) {
  const { tabs, remove, removeAll } = useTabHistory()

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' ,width: '100%'}}>
        <HistorySlider
          items={tabs}
          onRemove={remove}
          onRemoveAll={removeAll}
        />

        <div style={{ flex: 1, position: 'relative' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
