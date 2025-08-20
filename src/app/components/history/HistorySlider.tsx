'use client'
import React, { useRef, useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { usePathname } from 'next/navigation' 
import 'swiper/css'

interface TabItem {
  title: string
  url: string
}

interface HistorySliderProps {
  items: TabItem[]
  onRemove: (url: string) => void
  onRemoveAll: () => void
}

const HistorySlider: React.FC<HistorySliderProps> = ({
  items,
  onRemove,
  onRemoveAll,
}) => {
  const swiperRef = useRef<any>(null)
  const pathname = usePathname()
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)

  const EPS = 1;
  const syncNav = (sw: any) => {
    const atStart =
    sw.isBeginning || !sw.allowSlidePrev || sw.translate >= sw.minTranslate() - EPS
    const atEnd =
    sw.isEnd || !sw.allowSlideNext || sw.translate <= sw.maxTranslate() + EPS

    setIsBeginning(atStart)
    setIsEnd(atEnd)
  }

  useEffect(() => {
    const sw = swiperRef.current
    if (!sw) return
    requestAnimationFrame(() => {
      sw.update()
      syncNav(sw)
    })
  }, [items, pathname])

  return (
    <div className={`history_tabs${!isBeginning ? ' scrolled_left' : ''} ${!isEnd ? ' scrolled_right' : ''}`}>
      <Swiper
        onSwiper={(sw) => {
        swiperRef.current = sw
        requestAnimationFrame(() => {
          sw.update()
          sw.setTranslate(sw.getTranslate()) 
          syncNav(sw)
        })

        sw.on('slideChange', () => syncNav(sw))
        sw.on('transitionEnd', () => syncNav(sw))
        sw.on('setTranslate', () => syncNav(sw))
        sw.on('fromEdge', () => syncNav(sw))
        sw.on('reachEnd', () => syncNav(sw))
        sw.on('reachBeginning', () => syncNav(sw))
        sw.on('resize', () => { sw.update(); syncNav(sw) })
        sw.on('observerUpdate', () => { sw.update(); syncNav(sw) })
        sw.on('slidesLengthChange', () => { sw.update(); syncNav(sw) })
      }}
        observer
        observeParents
        resizeObserver
        slidesPerView="auto"
        spaceBetween={4}
        speed={300}
      >
        {items.map((item) => {
          const isActive = item.url === pathname
          return (
            <SwiperSlide
                key={item.url}
                style={{ width: 'auto'}}
            >
                <div
                    className={`tab_item${isActive ? ' active' : ''}`}
                >
                    <a href={item.url}>{item.title}</a>
                    <button
                        onClick={() => onRemove(item.url)}
                        className="remove_button"
                    >
                        삭제
                    </button>
                </div>
            </SwiperSlide>
          )
        })}
      </Swiper>

      <div className='history_buttons'>
        <button className='history_prev'
            onClick={() => swiperRef.current?.slidePrev()}
            disabled={isBeginning}
            >
            이전
            </button>
        <button className='history_next'
            onClick={() => swiperRef.current?.slideNext()}
            disabled={isEnd}
        >
            다음
        </button>

        <button className='history_remove_all'
            onClick={onRemoveAll}
        >
            모두 지우기
        </button>
        </div>
    </div>
  )
}

export default HistorySlider
