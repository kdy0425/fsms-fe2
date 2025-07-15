import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Link from 'next/link'
import { styled } from '@mui/material/styles'
import { useSelector, useDispatch } from '@/store/hooks'
import UserProfile from './UserProfile'
import { AppState } from '@/store/store'
import Logo from '../../shared/logo/Logo'
import Navigation from './Navigation'
import { useContext, useEffect, useState } from 'react'
import Badge from '@mui/material/Badge'

import { userProfileType } from '@/types/auth/auth'
import { getAuthInfo } from '@/utils/fsms/common/user/authUtils'
import MyPage from './MyPage'
import Favorites from './Favorites'
import LogoutButton from '@/app/components/fsms/fsm/user/LoginButton'
import UserAuthContext from '@/app/components/context/UserAuthContext'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import NtcnDialog from '../../../_components/NtcnDialog'

export interface NtcnRow {
  ntcnRegYmd: string //게시일자
  ntcnUrl: string //이동 URL (공지사항 이외 구분 필요)
  ntcnTtl: string //업무구분명
  ntcnCn: string //제목
  ntcnSn: string //알림일련번호
  delYn?: string //삭제여부 전달용
}

const Header = () => {
  // drawer
  const customizer = useSelector((state: AppState) => state.customizer)
  const dispatch = useDispatch()

  const { setUserAuthInfo } = useContext(UserAuthContext)

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    [theme.breakpoints.up('lg')]: {
      minHeight: customizer.TopbarHeight,
    },
  }))
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }))

  const [rows, setRows] = useState<NtcnRow[]>([]) // 가져온 로우 데이터

  // 알림카운트
  const [rtcnCnt, setRtcnCnt] = useState(0)
  const [rtcnMoalFlag, setRtcnModalFlag] = useState(false)

  /* 회원프로필 */
  const [authStatus, setAuthStatus] = useState<userProfileType>({})
  /* 로그인 여부 */
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  /** 토큰 기반 로그인 정보 호출 및 할당 */
  useEffect(() => {
    const fetchAuthInfo = async () => {
      const authInfo = await getAuthInfo()

      setAuthStatus(authInfo.authSttus ?? {})
      setIsLoggedIn(authInfo.isLoggedIn)
      setUserAuthInfo(authInfo.authSttus)
      if (authInfo.isLoggedIn) {
        //로그인 되어있을때만 알림 호출
        fetchData()
      }
    }
    fetchAuthInfo()
  }, [])

  useEffect(() => {
    setRtcnCnt(rows.length)
  }, [rows])

  const handleReload = () => {
    fetchData()
  }

  const handleDetailCloseModal = () => {
    setRtcnModalFlag((prev) => false)
  }

  const handleClick = () => {
    setRtcnModalFlag(true)
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `/fsm/mai/ntcn/getAllRtroact`
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data)
        // setRtcnCnt(rows.length)
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setRtcnCnt(0)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setRtcnCnt(0)
    } finally {
    }
  }

  return (
    <AppBarStyled
      position="relative"
      color="default"
      className="header-wrapper"
    >
      <ToolbarStyled className="header-inner">
        <Logo />

        <Box flexGrow={1} />

        <Stack spacing={1} direction="row" alignItems="center">
          {/* 로그인/프로필 분기처리 */}
          {isLoggedIn ? (
            <>
              {/* <UserProfile
                userNm={authStatus.userNm}
                authorities={authStatus.authorities}
              /> */}
              <Stack spacing={1} className="global-link-wrapper">
                <span className="username-zone">
                  <span className="username">{authStatus.userNm}</span>님이
                  로그인하셨습니다.
                </span>
                <LogoutButton />
                {/* <Button className="top-btn btn-mypage">마이 페이지</Button> */}
                {/* 마이 페이지 */}
                <MyPage />
                {/* 즐겨찾는 메뉴 */}
                <Favorites />
                {/* <Button className="top-btn btn-sitemap">사이트맵</Button> */}
                <Button className="top-btn btn-alarm" onClick={handleClick}>
                  <Badge color="primary" badgeContent={rtcnCnt}>
                    알림
                  </Badge>
                </Button>
              </Stack>
            </>
          ) : (
            <Stack spacing={1} className="global-link-wrapper">
              <Link className="top-btn btn-login" href={'/user/login'}>
                로그인
              </Link>
            </Stack>
          )}
        </Stack>
      </ToolbarStyled>
      <NtcnDialog
        size="sm"
        title="알림내용"
        reloadFunc={handleReload}
        handleDetailCloseModal={handleDetailCloseModal}
        ntcnRows={rows}
        open={rtcnMoalFlag}
      ></NtcnDialog>
    </AppBarStyled>
  )
}

export default Header
