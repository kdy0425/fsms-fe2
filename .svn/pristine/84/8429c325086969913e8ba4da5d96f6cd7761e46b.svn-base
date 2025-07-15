'use client'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { styled, useTheme } from '@mui/material/styles'
import React, { useState } from 'react'
import Header from '@/app/(admin)/layout/vertical/header/Header'
import Footer from '@/app/(admin)//layout/vertical/footer/Footer'
//import Navigation from "@/ptl/layout/vertical/navbar/Navigation"; // 트리메뉴 방식
import Navigation from '@/app/(admin)/layout/vertical/navbar-top/Navigation' // 전체메뉴 방식
import { useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import { useEffect } from 'react'
// 포털시스템 스타일
import '@/app/assets/css/layoutFsm.css'
import { useRouter } from 'next/router'
import Sidebar from './layout/vertical/sidebar/Sidebar'
import { usePathname } from 'next/navigation'

const BodyContainerWrapper = styled('div')(() => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
}))

const BodyContainerInner = styled('div')(() => ({
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',
  zIndex: 1,
  width: '100%',
  backgroundColor: 'transparent',
}))

const BodyContent = styled('div')(() => ({}))

interface Props {
  children: React.ReactNode
}

export default function RootLayout({ children }: Props) {
  const customizer = useSelector((state: AppState) => state.customizer)
  const theme = useTheme()
  const pathname = usePathname() // usePathname 사용하여 경로 가져오기
  const isIndexPage = pathname === '/'
  const isPrivacyPage = pathname.indexOf('privacy') > -1

  return (
    <BodyContainerWrapper
      className={`body-container-wrapper page-fsm-wrapper ${
        isIndexPage ? 'page-fsm-main' : ''
      }`}
    >
      {/* ------------------------------------------- */}
      {/* Body Wrapper */}
      {/* ------------------------------------------- */}
      <BodyContainerInner className="body-container-inner">
        {/* ------------------------------------------- */}
        {/* Header */}
        {/* ------------------------------------------- */}
        <Header />

        {/* ------------------------------------------- */}
        {/* Navigation */}
        {/* ------------------------------------------- */}
        <Navigation />

        {/* 인덱스 페이지가 아닌 경우에만 Navigation을 표시 */}
        <BodyContent className="body-content">
          {/* ------------------------------------------- */}
          {/* Sidebar */}
          {/* ------------------------------------------- */}
          {!isIndexPage && <Sidebar />}
          {/* PageContent */}
          <Container className={'page-content-wrapper'}>
            {/* ------------------------------------------- */}
            {/* PageContent */}
            {/* ------------------------------------------- */}

            <Box className="page-content-inner">
              {/* <Outlet /> */}
              {children}
              {/* <Index /> */}
            </Box>

            {/* ------------------------------------------- */}
            {/* End Page */}
            {/* ------------------------------------------- */}
          </Container>
        </BodyContent>
        <Footer />
      </BodyContainerInner>
    </BodyContainerWrapper>
  )
}
