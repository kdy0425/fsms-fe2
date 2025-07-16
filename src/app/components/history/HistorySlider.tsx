'use client'
import React, { useRef } from 'react'
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

  return (
    <div className="history_tabs">
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        slidesPerView="auto"
        spaceBetween={4}
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
            >
            이전
            </button>
        <button className='history_next'
            onClick={() => swiperRef.current?.slideNext()}
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
