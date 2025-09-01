'use client'
import React, { useContext, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Box, Divider, Button } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'
// import { useRouter } from 'next/router'
import PageContainer from '@/components/container/PageContainer'
// 탭 모듈
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Breadcrumb from '@/app/(admin)/layout/shared/breadcrumb/BreadcrumbFsmMain'
// 주석 : amcharts nextjs  SyntaxError: Unexpected token 'export'
import dynamic from 'next/dynamic'
const XYChart01 = dynamic(() => import('@/app/components/amcharts/XYChart01'), {
  ssr: false,
})
const XYChart02 = dynamic(() => import('@/app/components/amcharts/XYChart02'), {
  ssr: false,
})
const XYChart03 = dynamic(() => import('@/app/components/amcharts/XYChart03'), {
  ssr: false,
})
// 도움말 모듈
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  Notice,
  CardIssueRequest,
  RfidIssueRequest,
  WrittenApplication,
  ClaimConfirmation,
  SuspiciousTransaction,
  TankCapacity,
  FuelSubsidyRate,
  FreightDailyApplicationStatus,
  BusCardDailyApplicationStatus,
  BusRfidDailyApplicationStatus,
  TaxiCardDailyApplicationStatus,
  FreightFuelSubsidyClaimStatus,
  BusFuelSubsidyClaimStatus,
  TaxiFuelSubsidyClaimStatus,
  FreightMonthlySubsidyPaymentStatus,
  BusMonthlySubsidyPaymentStatus,
  TaxiMonthlySubsidyPaymentStatus,
  FreightSuspiciousTransactionDetection,
  TaxiSuspiciousTransactionDetection,
  urls,
} from '@/types/main/main'

import {
  getLabelFromCode,
  getNumtoWon,
  formatDate,
  formatKorYearMonth,
  formBrno,
  getNumtoWonAndDecimalPoint,
  formatToTwoDecimalPlaces,
  formatDateDecimal,
} from '@/utils/fsms/common/convert'
import UserAuthContext, {
  UserAuthInfo,
} from '../components/context/UserAuthContext'
import ModifyDialog from './_components/NoticeDetailDialog'
import { useDispatch } from '@/store/hooks'
import { openIllegalModal } from '@/store/popup/MainPageIllegalitySlice'
import { openServeyModal, setSurveyInfo } from '@/store/popup/SurveySlice'
import MainIllegalityModal from '../components/popup/MainIllegalityModal'
import SurveyModal from '../components/popup/SurveyModal'
import NoticeModalContainer from '../components/popup/NoticeModalContainer'
import { openNoticeModal, setNoticeModalData } from '@/store/popup/NoticeSlice'
import CustomFormLabel from '../components/forms/theme-elements/CustomFormLabel'
import { string } from '@amcharts/amcharts4/core'
import { getCommaNumber } from '@/utils/fsms/common/util'
import { VerticalAlignCenter } from '@mui/icons-material'

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} placement="top" />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#2A3547',
    color: '#fff',
    maxWidth: 220,
    fontSize: 14,
    border: '1px solid #dadde9',
  },
}))
const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '/',
    title: '관리시스템 메인',
  },
]

const currentYear = new Date().getFullYear() // 현재 연도 가져오기

const selectData = Array.from({ length: 3 }, (_, i) => {
  const year = currentYear - i
  return {
    value: String(year),
    label: `${year}년`,
  }
})

export default function Main() {
  // 탭
  const [valueTab1, setValueTab1] = React.useState('1')
  const handleChangeTab1 = (
    event: React.SyntheticEvent,
    newValueTab1: string,
  ) => {
    setValueTab1(newValueTab1)
  }
  const [valueTab2, setValueTab2] = React.useState('1')
  const handleChangeTab2 = (
    event: React.SyntheticEvent,
    newValueTab2: string,
  ) => {
    setValueTab2(newValueTab2)
  }
  const [valueTab3, setValueTab3] = React.useState('1')
  const handleChangeTab3 = (
    event: React.SyntheticEvent,
    newValueTab3: string,
  ) => {
    setValueTab3(newValueTab3)
  }
  const [valueTab4, setValueTab4] = React.useState('1')
  const handleChangeTab4 = (
    event: React.SyntheticEvent,
    newValueTab4: string,
  ) => {
    setValueTab4(newValueTab4)
  }
  // Select
  const [select, setSelect] = React.useState(selectData[0]?.value)

  const handleChangeSelect = (event: any) => {
    setSelect(event.target.value)
  }

  const dispatch = useDispatch()

  // 현재 년 월 일을 반환하는 함수 yyyy.mm.dd
  const getFormattedDate = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const day = today.getDate().toString().padStart(2, '0')
    return `${year}.${month}.${day}`
  }
  const router = useRouter()

  const [detailMoalFlag, setDetailModalFlag] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState<Notice>()
  const handleDetailCloseModal = () => {
    setDetailModalFlag((prev) => false)
  }
  const handleSelectedNotice = (notice: Notice) => {
    setSelectedNotice(notice)
    setDetailModalFlag(true)
  }

  // 원하는 경로로 이동!
  const handleCartPubClick = (url: string, options?: object) => {
    // useEffect 안에서 라우팅 기능을 실행
    router.push(url, options)
  }
  const [loading, setLoading] = React.useState(false) // 로딩여부
  // 상태 변수들 정의
  const [notices, setNotices] = useState<Notice[]>([]) // 1.메인화면 게시판을 조회
  const [cardIssueRequests, setCardIssueRequests] = useState<CardIssueRequest>() // 2.나의 할일 - 카드발급요청을 조회
  const [rfidIssueRequests, setRfidIssueRequests] = useState<RfidIssueRequest>() // 3.나의 할일 - RFID발급요청을 조회
  const [writtenApplications, setWrittenApplications] =
    useState<WrittenApplication>() // 4.나의 할일 - 서면신청을 조회
  const [claimConfirmations, setClaimConfirmations] =
    useState<ClaimConfirmation>() // 5.나의 할일 - 청구확정을 조회
  const [suspiciousTransactions, setSuspiciousTransactions] =
    useState<SuspiciousTransaction>() // 6.나의 할일 - 의심거래를 조회
  const [tankCapacities, setTankCapacities] = useState<TankCapacity>() // 7.나의 할일 - 탱크용량을 조회
  const [urls, setUrls] = useState<any>([])
  const [fuelSubsidyRates, setFuelSubsidyRates] = useState<FuelSubsidyRate>() // 유가보조금 단가를 조회
  const [freightDailyApplications, setFreightDailyApplications] = useState<
    FreightDailyApplicationStatus[]
  >([]) // 8.화물 일별 신청현황을 조회
  const [busCardDailyApplications, setBusCardDailyApplications] = useState<
    BusCardDailyApplicationStatus[]
  >([]) // 9.버스 카드 일별 신청현황을 조회
  const [busRfidDailyApplications, setBusRfidDailyApplications] = useState<
    BusRfidDailyApplicationStatus[]
  >([]) // 10.버스 RFID 일별 신청현황을 조회
  const [taxiCardDailyApplications, setTaxiCardDailyApplications] = useState<
    TaxiCardDailyApplicationStatus[]
  >([]) // 11.택시 카드 일별 신청현황을 조회

  const [freightFuelSubsidyClaims, setFreightFuelSubsidyClaims] = useState<
    FreightFuelSubsidyClaimStatus[]
  >([]) // 12.화물 유가보조금 청구현황을 조회
  const [busFuelSubsidyClaims, setBusFuelSubsidyClaims] = useState<
    BusFuelSubsidyClaimStatus[]
  >([]) // 13.버스 유가보조금 청구현황을 조회
  const [taxiFuelSubsidyClaims, setTaxiFuelSubsidyClaims] = useState<
    TaxiFuelSubsidyClaimStatus[]
  >([]) // 14.택시 유가보조금 청구현황을 조회            파리미터

  const [freightMonthlySubsidies, setFreightMonthlySubsidies] = useState<
    FreightMonthlySubsidyPaymentStatus[]
  >([]) // 15.화물 월별 보조금 지급현황을 조회           파리미터
  const [busMonthlySubsidies, setBusMonthlySubsidies] = useState<
    BusMonthlySubsidyPaymentStatus[]
  >([]) // 16.페이징, 버스 월별 보조금 지급현황을 조회   페이징      파리미터
  const [taxiMonthlySubsidies, setTaxiMonthlySubsidies] = useState<
    TaxiMonthlySubsidyPaymentStatus[]
  >([]) //17.페이징, 택시 월별 보조금 지급현황을 조회   페이징      파리미터

  const [freightSuspiciousDetections, setFreightSuspiciousDetections] =
    useState<FreightSuspiciousTransactionDetection[]>([]) // 18.화물 의심거래 적발현황을 조회   페이징      파리미터
  const [taxiSuspiciousDetections, setTaxiSuspiciousDetections] = useState<
    TaxiSuspiciousTransactionDetection[]
  >([]) // 19.택시 의심거래 적발현황을 조회    페이징    파리미터

  const [year, setYear] = useState<string>()

  const { authInfo } = useContext(UserAuthContext)

  /**************************************************************  useEffect 부 시작 ********************************************************/

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoints = [
          // 0
          sendHttpRequest(
            'GET',
            `/fsm/mai/main/getMyJobCrdIssuDmnd`,
            null,
            true,
          ),
          // 1
          sendHttpRequest(
            'GET',
            `/fsm/mai/main/getMyJobRfidIssuDmnd`,
            null,
            true,
          ),
          // 2
          sendHttpRequest(
            'GET',
            `/fsm/mai/main/getMyJobDocmntAply`,
            null,
            true,
          ),
          // 3
          sendHttpRequest('GET', `/fsm/mai/main/getMyJobClnCfmtn`, null, true),
          // 4
          sendHttpRequest(
            'GET',
            `/fsm/mai/main/getMyJobDoubtDelng`,
            null,
            true,
          ),
          // 5
          sendHttpRequest('GET', `/fsm/mai/main/getMyJobTnkCpcty`, null, true),
          // 6
          sendHttpRequest('GET', `/fsm/mai/main/getUnitPrc`, null, true),
          // 7
          sendHttpRequest('GET', `/fsm/mai/main/getNtcMttr`, null, true),
          // 부정수급 행정처리 현황 모달 표시여부 조회
          // 8
          sendHttpRequest('GET', `/fsm/mai/main/getIllegalityCnt`, null, true),
          // 설문조사 팝업 표시여부 조회
          // 9
          sendHttpRequest('GET', `/fsm/mai/main/getQesitmTrgetYn`, null, true),
        ]

        const results = await Promise.allSettled(endpoints)

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const data = result.value
            switch (index) {
              case 0:
                if (data?.resultType === 'success') {
                  setCardIssueRequests(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할 일 카드발급요청 건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 1:
                if (data?.resultType === 'success') {
                  setRfidIssueRequests(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할 일 RFID발급요청 건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 2:
                if (data?.resultType === 'success') {
                  setWrittenApplications(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할 일 서면신청 건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 3:
                if (data?.resultType === 'success') {
                  setClaimConfirmations(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할 일 청구확정 건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 4:
                if (data?.resultType === 'success') {
                  setSuspiciousTransactions(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할 일 의심거래 건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 5:
                if (data?.resultType === 'success') {
                  setTankCapacities(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할 일 탱크용량 건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 6:
                if (data?.resultType === 'success')
                  setFuelSubsidyRates(data.data)
                break
              case 7:
                if (data?.resultType === 'success') setNotices(data.data)
                break

              // 부정수급 행정처리 현황 모달 표시
              case 8:
                if (data?.resultType === 'success') {
                  let { rdmCnt } = data?.data
                  if (rdmCnt > 0) {
                    if (checkTrDoubtDelng()) {
                      dispatch(openIllegalModal())
                    }
                  }
                }
                break
              // 설문조사 팝업 표시여부 조회
              case 9:
                if (data?.data.length > 0) {
                  let { srvyYn, srvyCycl } = data?.data[0]
                  if (srvyYn === 'N') {
                    dispatch(setSurveyInfo(srvyCycl))
                    dispatch(openServeyModal())
                  }
                  break
                }
                break
              default:
                break
            }
            // console.log('공지사항 출력함.', result.value)
          } else {
            console.error(`Error in request ${index}:`, result.reason)
          }
        })
      } catch (error) {
        console.error('Unexpected error:', error)
      }
    }

    fetchData().then(() => {
      //데이터 전부 조회 후에 공지사항 모달데이터를 조회한다.
      dispatch(openNoticeModal())
    })
  }, [])

  const checkTrDoubtDelng = () => {
    const auths = authInfo?.auths
    if (
      auths.findIndex((value: string, index: number) => {
        return value === 'LOGV_10'
      }) > -1
    ) {
      return true
    }
    return false
  }

  useEffect(() => {
    setTabValue()

    if (isAuthUser('TR')) {
      fetchTruckMainData()
      fetchFreightData()
    }
    if (isAuthUser('TX')) {
      fetchTaxiMainData()
      fetchTaxiData()
    }
    if (isAuthUser('BS')) {
      fetchBusMainData()
      fetchBusData()
    }
  }, [authInfo])

  useEffect(() => {
    handleSelectChange()
  }, [select])

  /**************************************************************  useEffect 부 끝 ********************************************************/

  /*********************************************************  나의 할일 이외 api호출 시작 ***************************************************/

  const fetchTruckMainData = async () => {
    const { locgovCd }: any = authInfo

    try {
      const endpoints = [
        // 8
        sendHttpRequest('GET', `/fsm/mai/main/tr/getCardCnt`, null, true), //화물 카드발급&rfid발급 일별신청현황
        // 12
        sendHttpRequest(
          'GET',
          `/fsm/mai/main/tr/getInstcDoubt?gubun=TR`,
          null,
          true,
        ), //화물 의심거래 적발현황
        sendHttpRequest(
          'GET',
          `/fsm/mai/main/tr/getFtxAsst?locgovCd=` + locgovCd,
          null,
          true,
        ),
      ]

      const [
        //유가 보조금 청구현황
        trCardRfid,
        trInstcDoubt,
        trftxAsst,
      ] = await Promise.all(endpoints)

      try {
        if (trCardRfid?.resultType === 'success')
          setFreightDailyApplications(trCardRfid.data)
      } catch (error) {
        console.log('error fail trCardRfid')
      }
      try {
        if (trInstcDoubt?.resultType === 'success')
          setFreightSuspiciousDetections(trInstcDoubt.data)
      } catch (error) {
        console.log('error fail trInstcDoubt')
      }
      try {
        if (trftxAsst?.resultType === 'success')
          setFreightFuelSubsidyClaims(trftxAsst.data)
      } catch (error) {
        console.log('error fail trftxAsst')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchTaxiMainData = async () => {
    const { locgovCd }: any = authInfo
    try {
      const endpoints = [
        // 8
        sendHttpRequest('GET', `/fsm/mai/main/tx/getCardCnt`, null, true), //택시 카드발급 일별신청현황
        // 12
        sendHttpRequest(
          'GET',
          `/fsm/mai/main/tr/getInstcDoubt?gubun=TX`,
          null,
          true,
        ), //택시 의심거래 적발현황
        sendHttpRequest(
          'GET',
          `/fsm/mai/main/tx/getFtxAsst?locgovCd=` + locgovCd,
          null,
          true,
        ), //택시 유가보조금 청구현황을 조회
      ]

      const [
        //유가 보조금 청구현황
        txCardRfid,
        txInstcDoubt,
        txftxAsst,
      ] = await Promise.all(endpoints)

      try {
        if (txCardRfid?.resultType === 'success')
          setTaxiCardDailyApplications(txCardRfid.data)
      } catch (error) {
        console.log('error fail txCardRfid')
      }
      try {
        if (txInstcDoubt?.resultType === 'success')
          setTaxiSuspiciousDetections(txInstcDoubt.data)
      } catch (error) {
        console.log('error fail txInstcDoubt')
      }
      try {
        if (txftxAsst?.resultType === 'success')
          setTaxiFuelSubsidyClaims(txftxAsst.data)
      } catch (error) {
        console.log('error fail setTaxiCardDailyApplications')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchBusMainData = async () => {
    const { locgovCd }: any = authInfo
    try {
      const endpoints = [
        // 9
        sendHttpRequest('GET', `/fsm/mai/main/bs/getCardRqstDt`, null, true),
        // 10
        sendHttpRequest('GET', `/fsm/mai/main/bs/getRfidRqstDt`, null, true), //택시 의심거래 적발현황
        sendHttpRequest(
          'GET',
          `/fsm/mai/main/bs/getFtxAsst?locgovCd=` + locgovCd,
          null,
          true,
        ), // 버스 유가보조금 청구현황을 조회
      ]

      const [
        //유가 보조금 청구현황
        bsCardCnt,
        bsRfidCnt,
        bsftxAsst,
      ] = await Promise.all(endpoints)

      try {
        if (bsCardCnt?.resultType === 'success')
          setBusCardDailyApplications(bsCardCnt.data)
      } catch (error) {
        console.log('error fail bsCardCnt')
      }
      try {
        if (bsRfidCnt?.resultType === 'success')
          setBusRfidDailyApplications(bsRfidCnt.data)
      } catch (error) {
        console.log('error fail bsRfidCnt')
      }
      try {
        if (bsftxAsst?.resultType === 'success')
          setBusFuelSubsidyClaims(bsftxAsst.data)
      } catch (error) {
        console.log('error fail bsftxAsst')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // 화물 월별 보조금 지급 현황 호출
  const fetchFreightData = async () => {
    setLoading(true)
    try {
      const endpoint = `/fsm/mai/main/tr/monAsstGiveCusTr?&year=${select}`
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // console.log('Freight Data:', response.data)
        // setFreightMonthlySubsidies([...response.data])
        const responseData = response.data.map((item: any) => ({
          ...item,
          type: 'freight',
        }))
        setFreightMonthlySubsidies(responseData)
      }
    } catch (error) {
      console.log('화물 월별 보조금 데이터를 가져오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 버스 월별 보조금 지급 현황 호출
  const fetchBusData = async () => {
    setLoading(true)
    try {
      const endpoint = `/fsm/mai/main/bs/getOpsMth?&year=${select}`
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // console.log('Bus Data:', response.data.content)
        // setBusMonthlySubsidies([...response.data.content])
        const responseData = response.data.content.map((item: any) => ({
          ...item,
          type: 'bus',
        }))
        setBusMonthlySubsidies(responseData)
      }
    } catch (error) {
      console.log('버스 월별 보조금 데이터를 가져오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 택시 월별 보조금 지급 현황 호출
  const fetchTaxiData = async () => {
    setLoading(true)
    try {
      const endpoint = `/fsm/mai/main/tx/getOpsMthTx?&year=${select}`
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // console.log('Taxi Data:', response.data)
        // setTaxiMonthlySubsidies([...response.data])
        const responseData = response.data.map((item: any) => ({
          ...item,
          type: 'taxi',
        }))
        setTaxiMonthlySubsidies(responseData)
      }
    } catch (error) {
      console.log('택시 월별 보조금 데이터를 가져오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  /*********************************************************  나의 할일 이외 api호출 끝 ***************************************************/

  const isAuthUser = (task: string): boolean => {
    const { taskSeCd }: any = authInfo //string[]

    if (!taskSeCd) {
      return false
    }

    if (
      taskSeCd.findIndex((value: string, index: number) => value === task) < 0
    ) {
      return false
    } else {
      return true
    }
  }

  const setTabValue = () => {
    let tabIndex = 0
    const taskSeArr = ['TR', 'TX', 'BS']
    const { taskSeCd }: any = authInfo
    if (!taskSeCd) {
      return
    }
    tabIndex =
      taskSeArr.findIndex(
        (value: string, index: number) => value === taskSeCd[0],
      ) + 1
    setValueTab1(String(tabIndex))
    setValueTab2(String(tabIndex))
    setValueTab3(String(tabIndex))
    setValueTab4(String(tabIndex))
  }

  const handleSelectChange = () => {
    if (isAuthUser('TR')) {
      fetchFreightData()
    }
    if (isAuthUser('BS')) {
      fetchBusData()
    }
    if (isAuthUser('TX')) {
      fetchTaxiData()
    }
  }

  return (
    <PageContainer title="Main" description="메인페이지">
      <div className="main-container">
        <div className="main-container-inner">
          {/* 카테고리 시작 */}
          <Breadcrumb title="유가보조금 관리시스템" items={BCrumb} />
          <Breadcrumb title="부정수급 방지시스템" items={BCrumb} className={'category-gradient'} />
          {/* 카테고리 끝 */}
        </div>
      </div>
      <div className="main-container">
        <div className="main-container-inner">
          <div className="main-contents">
            <div className="main-contents-box">
              <div style={{
                display: 'flex',
                gap:10,
                alignItems:'center',
                margin:0,
                padding:0
              }}>
                <h1 className="contents-box-title"
                  style={{margin:0}}
                >나의 할일</h1>
                <p className="oilps-info-date">
                    ({getFormattedDate() + '  기준 최근 한달'})
                  </p>
              </div>
              <div className="contents-box-con">
                <div className='info-box-dsc'>
                  <div className="oilps-map-info-box">
                    <div className="oilps-info-con-value-md ">
                      ※ <span className="textB">화물</span> /{' '}
                      <span className="color-orange">택시</span> /{' '}
                      <span className="color-gray">버스</span>
                    </div>
                  </div>
                </div>
                <div className='main-oilps-full'>
                  <div className="oilps-map-info-box-col-group grid-4">
                    {/* 카드발급요청 건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">카드발급요청</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        <p
                          className="oilps-info-con-value textB button"
                          onClick={() => handleCartPubClick('/stn/tcc')}
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-orange button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=TX')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-gray button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=BS')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                      </div>
                    </div>
                    {/* RFID발급요청 건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">RFID발급요청</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        <p
                          className="oilps-info-con-value textB button"
                          onClick={() => handleCartPubClick('/stn/tcc')}
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-orange button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=TX')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-gray button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=BS')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                      </div>
                    </div>
                    {/* 서면신청건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">서면신청</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        <p
                          className="oilps-info-con-value textB button"
                          onClick={() => handleCartPubClick('/stn/tcc')}
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-orange button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=TX')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-gray button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=BS')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                      </div>
                    </div>
                    {/* 청구확정건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">조사대상건수</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        <p
                          className="oilps-info-con-value textB button"
                          onClick={() => handleCartPubClick('/stn/tcc')}
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-orange button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=TX')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-gray button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=BS')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                      </div>
                    </div>
                    {/* 의심거래건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">청구확정</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        <p
                          className="oilps-info-con-value textB button"
                          onClick={() => handleCartPubClick('/stn/tcc')}
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-orange button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=TX')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-gray button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=BS')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                      </div>
                    </div>
                    {/* 탱크용량신청건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">의심거래</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        <p
                          className="oilps-info-con-value textB button"
                          onClick={() => handleCartPubClick('/stn/tcc')}
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-orange button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=TX')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-gray button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=BS')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                      </div>
                    </div>
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">추가</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        <p
                          className="oilps-info-con-value textB button"
                          onClick={() => handleCartPubClick('/stn/tcc')}
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-orange button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=TX')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-gray button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=BS')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                      </div>
                    </div>
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">추가</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        <p
                          className="oilps-info-con-value textB button"
                          onClick={() => handleCartPubClick('/stn/tcc')}
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-orange button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=TX')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-gray button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=BS')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='oilps-map-info-box-col-group green_box half'>
                    <div className="oilps-map-title">
                        <h2>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M11.8965 2C11.8965 2 9.97499 6.40886 4 5.4569V14.3975C4.15354 14.9765 3.4648 19.6749 11.8965 22C20.3281 19.6749 19.6394 14.9765 19.7929 14.3975V5.4569C13.8179 6.40886 11.8965 2 11.8965 2Z" stroke="#1694B1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M8.94385 12.6235L11.6462 14.8784L15.2522 10.623" stroke="#1694B1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/> </svg>
                          부정수급방지시스템
                        </h2>
                        <div className="description">
                          부정수급방지시스템으로 이동합니다.
                        </div>
                    </div>
                    <div className="oilps-map-info-box green">
                      <div className="oilps-info-title">탱크용량</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                          <p
                            className="oilps-info-con-value textB button"
                            onClick={() => handleCartPubClick('/stn/tcc')}
                          >
                            12
                            <span className="info-value-small">건</span>
                          </p>
                      </div>
                    </div>
                    <div className="oilps-map-info-box green">
                      <div className="oilps-info-title">의심거래</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        <p
                          className="oilps-info-con-value textB button"
                          onClick={() => handleCartPubClick('/stn/tcc')}
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-orange button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=TX')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                        <p
                          className="oilps-info-con-value color-gray button"
                          onClick={() =>
                            handleCartPubClick('/cad/cijm?tabIndex=BS')
                          }
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-container">
        <div className="main-container-inner">
          <div className="main-contents-group">
            <div className="main-contents">
              <div className="main-contents-box">
                <h1 className="contents-box-title">
                  공지사항
                  <div className="main-title-option">
                    <button
                      className="main-info-board-more-btn"
                      onClick={() => handleCartPubClick('./sup/notice')}
                      title="더보기 버튼"
                    ></button>
                  </div>
                </h1>
                <div className="contents-box-con">
                  <ul className="main-info-board-list">
                    <li>
                      <div
                        className="main-info-board-inner"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="main-notice-link-title">
                          [긴급][화물]테스트 공지사항입니다.
                        </span>
                        <p className="main-notice-link-date">
                          <span className="info-month-date">
                            2025.08.14
                          </span>
                        </p>
                      </div>
                    </li>
                    <li>
                      <div
                        className="main-info-board-inner"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="main-notice-link-title">
                          [긴급][화물]테스트 공지사항입니다.
                        </span>
                        <p className="main-notice-link-date">
                          <span className="info-month-date">
                            2025.08.14
                          </span>
                        </p>
                      </div>
                    </li>
                    <li>
                      <div
                        className="main-info-board-inner"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="main-notice-link-title">
                          [긴급][화물]테스트 공지사항입니다.
                        </span>
                        <p className="main-notice-link-date">
                          <span className="info-month-date">
                            2025.08.14
                          </span>
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="main-contents">
              <div className="main-contents-box">
                <h1 className="contents-box-title">
                  부정수급 사례 공유
                  <div className="main-title-option">
                    <button
                      className="main-info-board-more-btn"
                      onClick={() => handleCartPubClick('./sup/notice')}
                      title="더보기 버튼"
                    ></button>
                  </div>
                </h1>
                <div className="contents-box-con">
                  <ul className="main-info-board-list">
                    <li>
                      <div
                        className="main-info-board-inner"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="main-notice-link-title">
                          서울시 부정수급 사례공유
                        </span>
                        <p className="main-notice-link-date">
                          <span className="info-month-date">
                            2025.08.14
                          </span>
                        </p>
                      </div>
                    </li>
                    <li>
                      <div
                        className="main-info-board-inner"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="main-notice-link-title">
                          서울시 부정수급 사례공유
                        </span>
                        <p className="main-notice-link-date">
                          <span className="info-month-date">
                            2025.08.14
                          </span>
                        </p>
                      </div>
                    </li>
                    <li>
                      <div
                        className="main-info-board-inner"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="main-notice-link-title">
                          서울시 부정수급 사례공유
                        </span>
                        <p className="main-notice-link-date">
                          <span className="info-month-date">
                            2025.08.14
                          </span>
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-container">
        <div className="main-container-inner">
          <div className="main-contents-group">
            <div className="main-contents">
              <div className="main-contents-box">
                <h1 className="contents-box-title">주요 서비스</h1>
                <div className="contents-box-con">
                  <div className="main-service-box">
                    <div className='item'>
                      <a href="javascript:;">
                        <svg width={50} height={50} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" > <mask id="mask0_180_2864" style={{ maskType: "luminance", }} maskUnits="userSpaceOnUse" x={0} y={0} width={50} height={50} > <path d="M50 0H0V50H50V0Z" fill="white" /> </mask> <g mask="url(#mask0_180_2864)"> <path d="M15.7583 5H35.7918C38.001 5 39.7918 6.79086 39.7918 9V41C39.7918 43.2091 38.0147 45 35.8056 45C29.2975 45 16.501 45 9.99771 45C7.78857 45 6 43.2091 6 41V14.7544L15.7583 5Z" fill="#97BCFF" /> <path d="M15.7543 10.7544C15.7543 12.9635 13.9635 14.7544 11.7543 14.7544H6L15.7543 5V10.7544Z" fill="#3D79E7" /> <path d="M26.5 20H13.5C12.6716 20 12 20.6716 12 21.5C12 22.3284 12.6716 23 13.5 23H26.5C27.3284 23 28 22.3284 28 21.5C28 20.6716 27.3284 20 26.5 20Z" fill="white" /> <path d="M21.5 27H13.5C12.6716 27 12 27.6716 12 28.5C12 29.3284 12.6716 30 13.5 30H21.5C22.3284 30 23 29.3284 23 28.5C23 27.6716 22.3284 27 21.5 27Z" fill="white" /> <path d="M19.5 34H13.5C12.6716 34 12 34.6716 12 35.5C12 36.3284 12.6716 37 13.5 37H19.5C20.3284 37 21 36.3284 21 35.5C21 34.6716 20.3284 34 19.5 34Z" fill="white" /> <path d="M41.7143 43.0003C41.3536 43.0003 40.993 42.8508 40.7335 42.5605L37.5449 39.0069C37.0567 38.4659 37.1051 37.6303 37.6461 37.1421C38.187 36.6539 39.0227 36.7023 39.5108 37.2432L42.6994 40.7969C43.1876 41.3378 43.1392 42.1735 42.5983 42.6617C42.3476 42.886 42.0309 43.0003 41.7187 43.0003H41.7143Z" fill="#3D79E7" stroke="#3D79E7" strokeWidth={0.8} /> <path d="M34.0704 41.1321C29.6196 41.1321 26 37.5125 26 33.0661C26 28.6196 29.6196 25 34.0704 25C38.5213 25 42.1365 28.6196 42.1365 33.0661C42.1365 37.5125 38.5169 41.1321 34.0704 41.1321ZM34.0704 27.6388C31.0754 27.6388 28.6388 30.0754 28.6388 33.0661C28.6388 36.0568 31.0754 38.4933 34.0704 38.4933C37.0655 38.4933 39.4976 36.0568 39.4976 33.0661C39.4976 30.0754 37.0611 27.6388 34.0704 27.6388Z" fill="#3D79E7" stroke="#3D79E7" strokeWidth={0.8} /> </g> </svg>
                        <span>자격정보</span>
                      </a>
                    </div>
                    <div className='item'>
                      <a href="javascript:;">
                        <svg xmlns="http://www.w3.org/2000/svg" width={51} height={50} fill="none" > <mask id="a" width={51} height={50} x={0} y={0} maskUnits="userSpaceOnUse" style={{ maskType: "luminance", }} > <path fill="#fff" d="M50.5 0H.5v50h50V0Z" /> </mask> <g mask="url(#a)"> <path fill="#97BCFF" d="M12.728 7.055h24.66a4.23 4.23 0 0 1 4.229 4.228V40.77A4.23 4.23 0 0 1 37.389 45H12.728A4.23 4.23 0 0 1 8.5 40.771V11.282a4.23 4.23 0 0 1 4.228-4.227Z" /> <path fill="#3D79E7" d="M29.843 11.757h-9.566a3.145 3.145 0 0 1-3.145-3.145V5.961c0-.53.431-.961.96-.961h13.935c.53 0 .961.431.961.96v2.652a3.145 3.145 0 0 1-3.145 3.145Z" /> <path fill="#fff" d="M24.366 33c-.452 0-.886-.18-1.206-.506l-4.163-4.204A1.725 1.725 0 0 1 19 25.864a1.7 1.7 0 0 1 2.412.004l2.778 2.807 5.246-6.995a1.699 1.699 0 0 1 2.387-.334c.75.57.899 1.646.332 2.4l-6.43 8.573c-.299.398-.75.642-1.245.677h-.115V33Z" /> </g> </svg>
                        <span>자격분석</span>
                      </a>
                    </div>
                    <div className='item'>
                      <a href="javascript:;">
                        <svg xmlns="http://www.w3.org/2000/svg" width={50} height={50} fill="none" > <mask id="a" width={50} height={50} x={0} y={0} maskUnits="userSpaceOnUse" style={{ maskType: "luminance", }} > <path fill="#fff" d="M50 0H0v50h50V0Z" /> </mask> <g mask="url(#a)"> <path fill="#97BCFF" d="M33.09 20.334a9.314 9.314 0 0 1 1.257 4.667c0 5.16-4.18 9.347-9.347 9.347V45c11.045 0 20-8.955 20-20 0-3.638-.98-7.053-2.678-9.988l-9.233 5.33v-.008Z" /> <path fill="#97BCFF" d="M25 15.659c3.462 0 6.472 1.887 8.088 4.68l9.233-5.33C38.864 9.031 32.404 5 24.999 5 17.593 5 11.134 9.024 7.68 15.01l9.231 5.329c1.617-2.793 4.627-4.68 8.09-4.68Z" /> <path fill="#3D79E7" d="M15.652 25.004c0-1.698.46-3.287 1.258-4.667l-9.232-5.33A19.855 19.855 0 0 0 5 24.998c0 11.044 8.955 19.999 20 19.999V34.344c-5.161 0-9.348-4.187-9.348-9.347v.007Z" /> <path fill="#3D79E7" stroke="#3D79E7" strokeWidth={0.4} d="M30.403 23.695h-.718l.474-1.32a1.029 1.029 0 0 0-1.938-.692l-1.353 3.782-.906-3.523a1.027 1.027 0 0 0-1.992 0l-.905 3.523-1.354-3.782a1.03 1.03 0 0 0-1.937.692l.473 1.32h-.718a1.029 1.029 0 1 0 0 2.058h1.454l1.274 3.564a1.03 1.03 0 0 0 1.966-.09l.746-2.9.746 2.9c.113.437.5.751.95.772h.046c.432 0 .82-.273.97-.682l1.273-3.564h1.454a1.029 1.029 0 1 0 0-2.058h-.005Z" /> </g> </svg>
                        <span>연비분석</span>
                      </a>
                    </div>
                    <div className='item'>
                      <a href="javascript:;">
                        <svg xmlns="http://www.w3.org/2000/svg" width={51} height={50} fill="none" > <mask id="a" width={51} height={50} x={0} y={0} maskUnits="userSpaceOnUse" style={{ maskType: "luminance", }} > <path fill="#fff" d="M50.5 0H.5v50h50V0Z" /> </mask> <g mask="url(#a)"> <path fill="#3D79E7" d="M6.5 11a4 4 0 0 1 4-4h30a4 4 0 0 1 4 4h-38Z" /> <path fill="#97BCFF" d="M6.5 11h38v20h-38z" /> <path fill="#fff" d="M15.5 17.5v8a2 2 0 1 0 4 0v-8a2 2 0 1 0-4 0ZM23.5 19.5v6a2 2 0 1 0 4 0v-6a2 2 0 1 0-4 0ZM31.5 21.5v4a2 2 0 1 0 4 0v-4a2 2 0 1 0-4 0Z" /> <path fill="#3D79E7" d="M6.5 31h38a4 4 0 0 1-4 4h-30a4 4 0 0 1-4-4ZM19.5 35h12v4h-12z" /> <rect width={18} height={4} x={16.5} y={39} fill="#3D79E7" rx={2} /> </g> </svg>
                        <span>유가보조금관리시스템</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="main-contents">
              <div className="main-contents-box">
                <h1 className="contents-box-title">
                  부정수급 사례 공유
                  <div className="main-title-option">
                    <button
                      className="main-info-board-more-btn"
                      onClick={() => handleCartPubClick('./sup/notice')}
                      title="더보기 버튼"
                    ></button>
                  </div>
                </h1>
                <div className="contents-box-con">
                  <ul className="main-info-board-list">
                    <li>
                      <div
                        className="main-info-board-inner"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="main-notice-link-title">
                          서울시 부정수급 사례공유
                        </span>
                        <p className="main-notice-link-date">
                          <span className="info-month-date">
                            2025.08.14
                          </span>
                        </p>
                      </div>
                    </li>
                    <li>
                      <div
                        className="main-info-board-inner"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="main-notice-link-title">
                          서울시 부정수급 사례공유
                        </span>
                        <p className="main-notice-link-date">
                          <span className="info-month-date">
                            2025.08.14
                          </span>
                        </p>
                      </div>
                    </li>
                    <li>
                      <div
                        className="main-info-board-inner"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="main-notice-link-title">
                          서울시 부정수급 사례공유
                        </span>
                        <p className="main-notice-link-date">
                          <span className="info-month-date">
                            2025.08.14
                          </span>
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-container">
        <div className="main-container-inner">
          <div className="main-contents-group">
            <div className="main-contents">
              <div className="main-contents-box">
                <h1 className="contents-box-title">나의 할일</h1>

                <div className="contents-box-con">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      margin: 0,
                      padding: 0,
                      height: 15,
                    }}
                  >
                    <p className="oilps-info-date">
                      ({getFormattedDate() + '  기준 최근 한달'})
                    </p>
                  </div>
                  <div className="oilps-map-info-box-col-group">
                    {/* 카드발급요청 건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">카드발급요청</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        <p
                          className="oilps-info-con-value textB button"
                          onClick={() => handleCartPubClick('/stn/tcc')}
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                      </div>
                    </div>
                    {/* RFID발급요청 건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">RFID발급요청</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        <p
                          className="oilps-info-con-value textB button"
                          onClick={() => handleCartPubClick('/stn/tcc')}
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                      </div>
                    </div>
                    {/* 서면신청건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">서면신청</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        <p
                          className="oilps-info-con-value textB button"
                          onClick={() => handleCartPubClick('/stn/tcc')}
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                      </div>
                    </div>
                    {/* 청구확정건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">청구확정</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        <p
                          className="oilps-info-con-value textB button"
                          onClick={() => handleCartPubClick('/stn/tcc')}
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                      </div>
                    </div>
                    {/* 의심거래건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">의심거래</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        <p
                          className="oilps-info-con-value textB button"
                          onClick={() => handleCartPubClick('/stn/tcc')}
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                      </div>
                    </div>
                    {/* 탱크용량신청건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">탱크용량</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        <p
                          className="oilps-info-con-value textB button"
                          onClick={() => handleCartPubClick('/stn/tcc')}
                        >
                          12
                          <span className="info-value-small">건</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="main-contents">
              <div className="main-contents-box">
                <h1 className="contents-box-title">
                  공지사항
                  <div className="main-title-option">
                    <button
                      className="main-info-board-more-btn"
                      onClick={() => handleCartPubClick('./sup/notice')}
                      title="더보기 버튼"
                    ></button>
                  </div>
                </h1>
                <div className="contents-box-con">
                  <ul className="main-info-board-list">
                    <li>
                      <div
                        className="main-info-board-inner"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="main-notice-link-title">
                          [긴급][화물]테스트 공지사항입니다.
                        </span>
                        <p className="main-notice-link-date">
                          <span className="info-month-date">
                            2025.08.14
                          </span>
                        </p>
                      </div>
                    </li>
                    <li>
                      <div
                        className="main-info-board-inner"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="main-notice-link-title">
                          [긴급][화물]테스트 공지사항입니다.
                        </span>
                        <p className="main-notice-link-date">
                          <span className="info-month-date">
                            2025.08.14
                          </span>
                        </p>
                      </div>
                    </li>
                    <li>
                      <div
                        className="main-info-board-inner"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="main-notice-link-title">
                          [긴급][화물]테스트 공지사항입니다.
                        </span>
                        <p className="main-notice-link-date">
                          <span className="info-month-date">
                            2025.08.14
                          </span>
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-container">
        <div className="main-container-inner">
          <div className="main-contents-group">
            <div className="main-contents">
              <div className="main-contents-box">
                <h1 className="contents-box-title">주요 서비스</h1>
                <div className="contents-box-con">
                  <div className="main-service-box">
                    <div className='item'>
                      <a href="javascript:;">
                        <svg width={50} height={50} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" > <mask id="mask0_180_2864" style={{ maskType: "luminance", }} maskUnits="userSpaceOnUse" x={0} y={0} width={50} height={50} > <path d="M50 0H0V50H50V0Z" fill="white" /> </mask> <g mask="url(#mask0_180_2864)"> <path d="M15.7583 5H35.7918C38.001 5 39.7918 6.79086 39.7918 9V41C39.7918 43.2091 38.0147 45 35.8056 45C29.2975 45 16.501 45 9.99771 45C7.78857 45 6 43.2091 6 41V14.7544L15.7583 5Z" fill="#97BCFF" /> <path d="M15.7543 10.7544C15.7543 12.9635 13.9635 14.7544 11.7543 14.7544H6L15.7543 5V10.7544Z" fill="#3D79E7" /> <path d="M26.5 20H13.5C12.6716 20 12 20.6716 12 21.5C12 22.3284 12.6716 23 13.5 23H26.5C27.3284 23 28 22.3284 28 21.5C28 20.6716 27.3284 20 26.5 20Z" fill="white" /> <path d="M21.5 27H13.5C12.6716 27 12 27.6716 12 28.5C12 29.3284 12.6716 30 13.5 30H21.5C22.3284 30 23 29.3284 23 28.5C23 27.6716 22.3284 27 21.5 27Z" fill="white" /> <path d="M19.5 34H13.5C12.6716 34 12 34.6716 12 35.5C12 36.3284 12.6716 37 13.5 37H19.5C20.3284 37 21 36.3284 21 35.5C21 34.6716 20.3284 34 19.5 34Z" fill="white" /> <path d="M41.7143 43.0003C41.3536 43.0003 40.993 42.8508 40.7335 42.5605L37.5449 39.0069C37.0567 38.4659 37.1051 37.6303 37.6461 37.1421C38.187 36.6539 39.0227 36.7023 39.5108 37.2432L42.6994 40.7969C43.1876 41.3378 43.1392 42.1735 42.5983 42.6617C42.3476 42.886 42.0309 43.0003 41.7187 43.0003H41.7143Z" fill="#3D79E7" stroke="#3D79E7" strokeWidth={0.8} /> <path d="M34.0704 41.1321C29.6196 41.1321 26 37.5125 26 33.0661C26 28.6196 29.6196 25 34.0704 25C38.5213 25 42.1365 28.6196 42.1365 33.0661C42.1365 37.5125 38.5169 41.1321 34.0704 41.1321ZM34.0704 27.6388C31.0754 27.6388 28.6388 30.0754 28.6388 33.0661C28.6388 36.0568 31.0754 38.4933 34.0704 38.4933C37.0655 38.4933 39.4976 36.0568 39.4976 33.0661C39.4976 30.0754 37.0611 27.6388 34.0704 27.6388Z" fill="#3D79E7" stroke="#3D79E7" strokeWidth={0.8} /> </g> </svg>
                        <span>자격정보</span>
                      </a>
                    </div>
                    <div className='item'>
                      <a href="javascript:;">
                        <svg xmlns="http://www.w3.org/2000/svg" width={51} height={50} fill="none" > <mask id="a" width={51} height={50} x={0} y={0} maskUnits="userSpaceOnUse" style={{ maskType: "luminance", }} > <path fill="#fff" d="M50.5 0H.5v50h50V0Z" /> </mask> <g mask="url(#a)"> <path fill="#97BCFF" d="M12.728 7.055h24.66a4.23 4.23 0 0 1 4.229 4.228V40.77A4.23 4.23 0 0 1 37.389 45H12.728A4.23 4.23 0 0 1 8.5 40.771V11.282a4.23 4.23 0 0 1 4.228-4.227Z" /> <path fill="#3D79E7" d="M29.843 11.757h-9.566a3.145 3.145 0 0 1-3.145-3.145V5.961c0-.53.431-.961.96-.961h13.935c.53 0 .961.431.961.96v2.652a3.145 3.145 0 0 1-3.145 3.145Z" /> <path fill="#fff" d="M24.366 33c-.452 0-.886-.18-1.206-.506l-4.163-4.204A1.725 1.725 0 0 1 19 25.864a1.7 1.7 0 0 1 2.412.004l2.778 2.807 5.246-6.995a1.699 1.699 0 0 1 2.387-.334c.75.57.899 1.646.332 2.4l-6.43 8.573c-.299.398-.75.642-1.245.677h-.115V33Z" /> </g> </svg>
                        <span>자격분석</span>
                      </a>
                    </div>
                    <div className='item'>
                      <a href="javascript:;">
                        <svg xmlns="http://www.w3.org/2000/svg" width={50} height={50} fill="none" > <mask id="a" width={50} height={50} x={0} y={0} maskUnits="userSpaceOnUse" style={{ maskType: "luminance", }} > <path fill="#fff" d="M50 0H0v50h50V0Z" /> </mask> <g mask="url(#a)"> <path fill="#97BCFF" d="M33.09 20.334a9.314 9.314 0 0 1 1.257 4.667c0 5.16-4.18 9.347-9.347 9.347V45c11.045 0 20-8.955 20-20 0-3.638-.98-7.053-2.678-9.988l-9.233 5.33v-.008Z" /> <path fill="#97BCFF" d="M25 15.659c3.462 0 6.472 1.887 8.088 4.68l9.233-5.33C38.864 9.031 32.404 5 24.999 5 17.593 5 11.134 9.024 7.68 15.01l9.231 5.329c1.617-2.793 4.627-4.68 8.09-4.68Z" /> <path fill="#3D79E7" d="M15.652 25.004c0-1.698.46-3.287 1.258-4.667l-9.232-5.33A19.855 19.855 0 0 0 5 24.998c0 11.044 8.955 19.999 20 19.999V34.344c-5.161 0-9.348-4.187-9.348-9.347v.007Z" /> <path fill="#3D79E7" stroke="#3D79E7" strokeWidth={0.4} d="M30.403 23.695h-.718l.474-1.32a1.029 1.029 0 0 0-1.938-.692l-1.353 3.782-.906-3.523a1.027 1.027 0 0 0-1.992 0l-.905 3.523-1.354-3.782a1.03 1.03 0 0 0-1.937.692l.473 1.32h-.718a1.029 1.029 0 1 0 0 2.058h1.454l1.274 3.564a1.03 1.03 0 0 0 1.966-.09l.746-2.9.746 2.9c.113.437.5.751.95.772h.046c.432 0 .82-.273.97-.682l1.273-3.564h1.454a1.029 1.029 0 1 0 0-2.058h-.005Z" /> </g> </svg>
                        <span>연비분석</span>
                      </a>
                    </div>
                    <div className='item'>
                      <a href="javascript:;">
                        <svg xmlns="http://www.w3.org/2000/svg" width={51} height={50} fill="none" > <mask id="a" width={51} height={50} x={0} y={0} maskUnits="userSpaceOnUse" style={{ maskType: "luminance", }} > <path fill="#fff" d="M50.5 0H.5v50h50V0Z" /> </mask> <g mask="url(#a)"> <path fill="#3D79E7" d="M6.5 11a4 4 0 0 1 4-4h30a4 4 0 0 1 4 4h-38Z" /> <path fill="#97BCFF" d="M6.5 11h38v20h-38z" /> <path fill="#fff" d="M15.5 17.5v8a2 2 0 1 0 4 0v-8a2 2 0 1 0-4 0ZM23.5 19.5v6a2 2 0 1 0 4 0v-6a2 2 0 1 0-4 0ZM31.5 21.5v4a2 2 0 1 0 4 0v-4a2 2 0 1 0-4 0Z" /> <path fill="#3D79E7" d="M6.5 31h38a4 4 0 0 1-4 4h-30a4 4 0 0 1-4-4ZM19.5 35h12v4h-12z" /> <rect width={18} height={4} x={16.5} y={39} fill="#3D79E7" rx={2} /> </g> </svg>
                        <span>유가보조금관리시스템</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="main-contents">
              <div className="main-contents-box">
                <h1 className="contents-box-title">
                  부정수급 사례 공유
                  <div className="main-title-option">
                    <button
                      className="main-info-board-more-btn"
                      onClick={() => handleCartPubClick('./sup/notice')}
                      title="더보기 버튼"
                    ></button>
                  </div>
                </h1>
                <div className="contents-box-con">
                  <ul className="main-info-board-list">
                    <li>
                      <div
                        className="main-info-board-inner"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="main-notice-link-title">
                          서울시 부정수급 사례공유
                        </span>
                        <p className="main-notice-link-date">
                          <span className="info-month-date">
                            2025.08.14
                          </span>
                        </p>
                      </div>
                    </li>
                    <li>
                      <div
                        className="main-info-board-inner"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="main-notice-link-title">
                          서울시 부정수급 사례공유
                        </span>
                        <p className="main-notice-link-date">
                          <span className="info-month-date">
                            2025.08.14
                          </span>
                        </p>
                      </div>
                    </li>
                    <li>
                      <div
                        className="main-info-board-inner"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="main-notice-link-title">
                          서울시 부정수급 사례공유
                        </span>
                        <p className="main-notice-link-date">
                          <span className="info-month-date">
                            2025.08.14
                          </span>
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="main-container">
        <div className="main-container-inner">
          <div className="main-contents-group row-full">
            <div className="main-contents">
              <div className="main-contents-box">
                <h1 className="contents-box-title">유가보조금 단가 정보</h1>
                <div className="contents-box-con box-con-col-group">
                  <div className="oilps-map-info-box-col-group box-con-col">
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title info-title-type1">
                        경유
                        <HtmlTooltip
                          className="help-tooltip"
                          title={
                            <React.Fragment>
                              {/* <div className="tooltip-title">경유</div> */}
                              <div className="tooltip-content">
                                경유 단가 정보입니다.
                              </div>
                            </React.Fragment>
                          }
                        >
                          <Button className="icon icon-help tooltips">
                            도움말
                          </Button>
                        </HtmlTooltip>
                      </div>
                      <p className="oilps-info-con-title info-value-small">
                        단가 (ℓ)
                      </p>
                      <div className="oilps-info-con">
                        <p className="oilps-info-con-value textB">
                          {fuelSubsidyRates !== undefined
                            ? getNumtoWon(fuelSubsidyRates.koiD)
                            : '데이터 없음'}
                          <span className="info-value-small">원</span>
                        </p>
                        <p className="oilps-info-con-value info-value-small">
                          {fuelSubsidyRates !== undefined &&
                          fuelSubsidyRates.koiD10
                            ? `(${getNumtoWon(fuelSubsidyRates.koiD10)})원`
                            : '(데이터 없음)'}
                        </p>
                      </div>
                    </div>

                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title info-title-type3">
                        CNG
                        <HtmlTooltip
                          className="help-tooltip"
                          title={
                            <React.Fragment>
                              {/* <div className="tooltip-title">CNG</div> */}
                              <div className="tooltip-content">
                                CNG 단가 정보입니다.
                              </div>
                            </React.Fragment>
                          }
                        >
                          <Button className="icon icon-help tooltips">
                            도움말
                          </Button>
                        </HtmlTooltip>
                      </div>
                      <p className="oilps-info-con-title info-value-small">
                        단가 (㎥)
                      </p>
                      <div className="oilps-info-con">
                        <p className="oilps-info-con-value textB">
                          {fuelSubsidyRates !== undefined
                            ? getNumtoWon(fuelSubsidyRates.koiC)
                            : '데이터 없음'}
                          <span className="info-value-small">원</span>
                        </p>
                        <p className="oilps-info-con-value info-value-small">
                          {fuelSubsidyRates !== undefined &&
                          fuelSubsidyRates.koiC13
                            ? `(${getNumtoWon(fuelSubsidyRates.koiC13)})원`
                            : '데이터 없음'}
                        </p>
                      </div>
                    </div>
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title info-title-type4">
                        수소
                        <HtmlTooltip
                          className="help-tooltip"
                          title={
                            <React.Fragment>
                              {/* <div className="tooltip-title">수소</div> */}
                              <div className="tooltip-content">
                                수소 단가 정보입니다.
                              </div>
                            </React.Fragment>
                          }
                        >
                          <Button className="icon icon-help tooltips">
                            도움말
                          </Button>
                        </HtmlTooltip>
                      </div>
                      <div className="oilps-info-con">
                        <p className="oilps-info-con-title info-value-small">
                          단가 (㎏)
                        </p>
                        <div className="oilps-info-sub-value">
                          <div className="color-blue">
                            {fuelSubsidyRates !== undefined
                              ? getNumtoWon(fuelSubsidyRates.koiHtr)
                              : '데이터 없음'}
                            <span className="info-value-small">원</span>
                          </div>
                        </div>
                        <div className="oilps-info-sub-value">
                          <div className="color-orange">
                            {fuelSubsidyRates !== undefined
                              ? getNumtoWon(fuelSubsidyRates?.koiHtx)
                              : '데이터 없음'}
                            <span className="info-value-small">원</span>
                          </div>
                        </div>
                        <div className="oilps-info-sub-value">
                          <div className="color-gray">
                            {fuelSubsidyRates !== undefined
                              ? getNumtoWon(fuelSubsidyRates?.koiHbs)
                              : '데이터 없음'}
                            <span className="info-value-small">원</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title info-title-type2">
                        LPG
                        <HtmlTooltip
                          className="help-tooltip"
                          title={
                            <React.Fragment>
                              {/* <div className="tooltip-title">LPG</div> */}
                              <div className="tooltip-content">
                                LPG 단가 정보입니다.
                              </div>
                            </React.Fragment>
                          }
                        >
                          <Button className="icon icon-help tooltips">
                            도움말
                          </Button>
                        </HtmlTooltip>
                      </div>
                      <p className="oilps-info-con-title info-value-small">
                        단가 (ℓ)
                      </p>
                      <div className="oilps-info-con">
                        <p className="oilps-info-con-value textB">
                          {fuelSubsidyRates !== undefined
                            ? getNumtoWon(fuelSubsidyRates.koiL)
                            : '데이터 없음'}
                          <span className="info-value-small">원</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="box-con-col box-auto">
                    <div className="contents-explanation">
                      <div className="contents-explanation-inner">
                        <div className="contents-explanation-text">
                          경유의 경우 고속우등버스가 아닌 경우 괄호안의 단가를
                          적용 받습니다.
                        </div>
                      </div>
                    </div>
                    <div className="contents-explanation">
                      <div className="contents-explanation-inner">
                        <div className="contents-explanation-text">
                          CNG의 경우 전세버스인 경우 괄호 안의 단가를 적용
                          받습니다.
                        </div>
                      </div>
                    </div>
                    <div className="contents-explanation">
                      <div className="contents-explanation-inner">
                        <div className="contents-explanation-text">
                          수소의 경우{' '}
                          <strong className="color-blue">화물</strong> /{' '}
                          <strong className="color-orange">택시</strong> /{' '}
                          <strong className="color-gray">버스</strong>의 단가를
                          적용 받습니다.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="main-container">
        <div className="main-container-inner">
          <div className="main-contents-group">
            <MainContents
              contentTitle={'일별신청현황'}
              tabContextValue={valueTab3}
              tabListHandler={handleChangeTab3}
              tabListLabel={'유가보조금 청구현황 탭 그룹'}
              isAuthUser={isAuthUser}
            >
              <p className="oilps-info-date" style={{ margin: '10px 0 0 0' }}>
                ({getFormattedDate() + ''})
              </p>
              <div className="tab-content">
                <TabPanel key={1} value={String(1)}>
                  <div className="chart-group marT20">
                    {/* 화물  */}
                    <div className="chart-col">
                      <h4>카드발급 현황</h4>
                      {/* 차트 시작 */}
                      <XYChart01
                        id="chartdiv1"
                        key="chartdiv1"
                        cardPulist={freightDailyApplications}
                      />
                      {/* 차트 끝 */}
                    </div>
                    <div className="chart-col">
                      <h4>RFID발급 현황</h4>
                      {/* 차트 시작 */}
                      <XYChart02
                        id="chartdiv2"
                        key="chartdiv2"
                        rfidPulist={freightDailyApplications}
                      />
                      {/* 차트 끝 */}
                    </div>
                  </div>
                </TabPanel>
                <TabPanel key={2} value={String(2)}>
                  <div className="chart-group marT20">
                    {/* 택시  */}
                    <div className="chart-col">
                      <h4>카드발급 현황</h4>
                      {/* 차트 시작 */}
                      <XYChart01
                        id="chartdiv3"
                        key="chartdiv3"
                        cardPulist={taxiCardDailyApplications}
                      />
                      {/* 차트 끝 */}
                    </div>
                    <div className="chart-col">
                      <h4>RFID발급 현황</h4>
                      {/* 차트 시작 */}

                      <XYChart02
                        id="chartdiv4"
                        key="chartdiv4"
                        rfidPulist={[]}
                      />
                      {/* 차트 끝 */}
                    </div>
                  </div>
                </TabPanel>
                <TabPanel key={3} value={String(3)}>
                  <div className="chart-group marT20">
                    {/* 버스  */}
                    <div className="chart-col">
                      <h4>카드발급 현황</h4>
                      {/* 차트 시작 */}
                      <XYChart01
                        id="chartdiv5"
                        key="chartdiv5"
                        cardPulist={busCardDailyApplications}
                      />
                      {/* 차트 끝 */}
                    </div>
                    <div className="chart-col">
                      <h4>RFID발급 현황</h4>
                      {/* 차트 시작 */}
                      <XYChart02
                        id="chartdiv6"
                        key="chartdiv6"
                        rfidPulist={busRfidDailyApplications}
                      />
                      {/* 차트 끝 */}
                    </div>
                  </div>
                </TabPanel>
              </div>
            </MainContents>
            <MainContents
              contentTitle={'유가보조금 청구현황'}
              tabContextValue={valueTab1}
              tabListHandler={handleChangeTab1}
              tabListLabel={'유가보조금 청구현황 탭 그룹'}
              isAuthUser={isAuthUser}
            >
              <div className="tab-content">
                <Link href="./cal/sr" className="main-info-link">
                  <TabPanel key={1} value={String(1)}>
                    <div className="table-scrollable">
                      <table className="table table-bordered">
                        <caption>가이드 타이틀 테이블 요약</caption>
                        <colgroup>
                          <col style={{ width: '17%' }}></col>
                          <col style={{ width: '17%' }}></col>
                          <col style={{ width: '22%' }}></col>
                          <col style={{ width: '22%' }}></col>
                          <col style={{ width: '22%' }}></col>
                        </colgroup>
                        <thead>
                          <tr>
                            <th scope="col">청구월</th>
                            <th scope="col">거래건수</th>
                            <th scope="col">주유량(ℓ)</th>
                            <th scope="col">총거래금액</th>
                            <th scope="col">유가보조금</th>
                          </tr>
                        </thead>
                        <tbody>
                          {freightFuelSubsidyClaims &&
                          freightFuelSubsidyClaims.length > 0 ? (
                            freightFuelSubsidyClaims.map(
                              (freightFuelSubsidyClaim, index) => {
                                return (
                                  <tr key={'trrow2' + index}>
                                    <td className="t-center">
                                      {formatDate(
                                        freightFuelSubsidyClaim.clclnYm,
                                      )}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(
                                        freightFuelSubsidyClaim.cnt1,
                                      )}
                                    </td>
                                    <td className="t-right">
                                      {getCommaNumber(
                                        getNumtoWonAndDecimalPoint(
                                          freightFuelSubsidyClaim.cnt2,
                                        ),
                                      )}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(
                                        freightFuelSubsidyClaim.cnt3,
                                      )}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(
                                        freightFuelSubsidyClaim.cnt4,
                                      )}
                                    </td>
                                  </tr>
                                )
                              },
                            )
                          ) : (
                            <>
                              <NoneSubsidyClaimData />
                              <NoneSubsidyClaimData />
                              <NoneSubsidyClaimData />
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabPanel>
                </Link>
                <Link href="./cal/sr" className="main-info-link">
                  <TabPanel key={2} value={String(2)}>
                    <div className="table-scrollable">
                      <table className="table table-bordered">
                        <caption>가이드 타이틀 테이블 요약</caption>
                        <colgroup>
                          <col style={{ width: '17%' }}></col>
                          <col style={{ width: '17%' }}></col>
                          <col style={{ width: '22%' }}></col>
                          <col style={{ width: '22%' }}></col>
                          <col style={{ width: '22%' }}></col>
                        </colgroup>
                        <thead>
                          <tr>
                            <th scope="col">청구월</th>
                            <th scope="col">거래건수</th>
                            <th scope="col">주유량(ℓ)</th>
                            <th scope="col">총거래금액</th>
                            <th scope="col">유가보조금</th>
                          </tr>
                        </thead>
                        <tbody>
                          {taxiFuelSubsidyClaims &&
                          taxiFuelSubsidyClaims.length > 0 ? (
                            taxiFuelSubsidyClaims.map(
                              (taxiFuelSubsidyClaim, index) => {
                                return (
                                  <tr key={'trrow3' + index}>
                                    <td className="t-center">
                                      {formatDate(taxiFuelSubsidyClaim.clclnYm)}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(taxiFuelSubsidyClaim.cnt1)}
                                    </td>
                                    <td className="t-right">
                                      {getCommaNumber(
                                        formatToTwoDecimalPlaces(
                                          taxiFuelSubsidyClaim.cnt2,
                                        ),
                                      )}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(taxiFuelSubsidyClaim.cnt3)}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(taxiFuelSubsidyClaim.cnt4)}
                                    </td>
                                  </tr>
                                )
                              },
                            )
                          ) : (
                            <>
                              <NoneSubsidyClaimData />
                              <NoneSubsidyClaimData />
                              <NoneSubsidyClaimData />
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabPanel>
                </Link>
                <Link href="./cal/lpd" className="main-info-link">
                  <TabPanel key={3} value={String(3)}>
                    <div className="table-scrollable">
                      <table className="table table-bordered">
                        <caption>가이드 타이틀 테이블 요약</caption>
                        <colgroup>
                          <col style={{ width: '17%' }}></col>
                          <col style={{ width: '17%' }}></col>
                          <col style={{ width: '22%' }}></col>
                          <col style={{ width: '22%' }}></col>
                          <col style={{ width: '22%' }}></col>
                        </colgroup>
                        <thead>
                          <tr>
                            <th scope="col">청구월</th>
                            <th scope="col">거래건수</th>
                            <th scope="col">주유량(ℓ)</th>
                            <th scope="col">총거래금액</th>
                            <th scope="col">유가보조금</th>
                          </tr>
                        </thead>
                        <tbody>
                          {busFuelSubsidyClaims &&
                          busFuelSubsidyClaims.length > 0 ? (
                            busFuelSubsidyClaims.map(
                              (busFuelSubsidyClaim, index) => {
                                return (
                                  <tr key={'trrow4' + index}>
                                    <td className="t-center">
                                      {formatDate(busFuelSubsidyClaim.clclnYm)}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(busFuelSubsidyClaim.cnt1)}
                                    </td>
                                    <td className="t-right">
                                      {getCommaNumber(
                                        formatToTwoDecimalPlaces(
                                          busFuelSubsidyClaim.cnt2,
                                        ),
                                      )}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(busFuelSubsidyClaim.cnt3)}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(busFuelSubsidyClaim.cnt4)}
                                    </td>
                                  </tr>
                                )
                              },
                            )
                          ) : (
                            <>
                              <NoneSubsidyClaimData />
                              <NoneSubsidyClaimData />
                              <NoneSubsidyClaimData />
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabPanel>
                </Link>
              </div>
            </MainContents>
          </div>
        </div>
      </div>
      <div className="main-container">
        <div className="main-container-inner">
          <div className="main-contents-group">
            <div className="main-contents">
              <div className="main-contents-box">
                <h1 className="contents-box-title">
                  <span>월별보조금지급현황</span>
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-fname-select-01"
                  ></CustomFormLabel>
                  <div className="main-title-option">
                    <select
                      id="ft-fname-select-01"
                      className="custom-default-select"
                      value={select}
                      onChange={handleChangeSelect}
                    >
                      {selectData.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </h1>
                <div className="contents-box-con">
                  <TabContext value={valueTab4}>
                    <div className="tabs-round-type">
                      <TabList
                        className="tab-list"
                        onChange={handleChangeTab4}
                        aria-label="유가보조금 청구현황 탭 그룹"
                      >
                        <Tab
                          key={1}
                          label={'화물'}
                          value={String(1)}
                          disabled={!isAuthUser('TR')}
                        />
                        <Tab
                          key={2}
                          label={'택시'}
                          value={String(2)}
                          disabled={!isAuthUser('TX')}
                        />
                        <Tab
                          key={3}
                          label={'버스'}
                          value={String(3)}
                          disabled={!isAuthUser('BS')}
                        />
                      </TabList>
                      <p
                        className="oilps-info-date"
                        style={{ margin: '10px 0 0 0' }}
                      >
                        ({getFormattedDate() + ''})
                      </p>

                      <div className="tab-content">
                        <TabPanel key={1} value={String(1)}>
                          <div className="chart-con marT20">
                            {/* 차트 시작 */}
                            {freightMonthlySubsidies &&
                            freightMonthlySubsidies.length > 0 ? (
                              <XYChart03 monthly={freightMonthlySubsidies} />
                            ) : (
                              <div
                                style={{
                                  display: 'grid',
                                  placeItems: 'center',
                                  height: '100%',
                                }}
                              >
                                <h1 style={{ marginTop: '120px' }}>
                                  준비중입니다.
                                </h1>
                              </div>
                            )}
                            {/* 차트 끝 */}
                          </div>
                        </TabPanel>
                        <TabPanel key={2} value={String(2)}>
                          <div className="chart-con marT20">
                            {/* 차트 시작 */}
                            {taxiMonthlySubsidies &&
                            taxiMonthlySubsidies.length > 0 ? (
                              <XYChart03 monthly={taxiMonthlySubsidies} />
                            ) : (
                              <div
                                style={{
                                  display: 'grid',
                                  placeItems: 'center',
                                  height: '100%',
                                }}
                              >
                                <h1 style={{ marginTop: '120px' }}>
                                  준비중입니다.
                                </h1>
                              </div>
                            )}

                            {/* 차트 끝 */}
                          </div>
                        </TabPanel>
                        <TabPanel key={3} value={String(3)}>
                          <div className="chart-con marT20">
                            {/* 차트 시작 */}
                            {busMonthlySubsidies &&
                            busMonthlySubsidies.length > 0 ? (
                              <XYChart03 monthly={busMonthlySubsidies} />
                            ) : (
                              <div
                                style={{
                                  display: 'grid',
                                  placeItems: 'center',
                                  height: '100%',
                                }}
                              >
                                <h1 style={{ marginTop: '120px' }}>
                                  준비중입니다.
                                </h1>
                              </div>
                            )}
                            {/* 차트 끝 */}
                          </div>
                        </TabPanel>
                      </div>
                    </div>
                  </TabContext>
                </div>
              </div>
            </div>
            <MainContents
              contentTitle={'의심거래 적발현황'}
              tabContextValue={valueTab2}
              tabListHandler={handleChangeTab2}
              tabListLabel={'의심거래 적발현황 탭 그룹'}
              isAuthUser={isAuthUser}
            >
              <div className="tab-content">
                <TabPanel key={1} value={String(1)}>
                  <div className="table-scrollable">
                    <table className="table table-bordered">
                      <caption>의심거래 적발현황 테이블 요약</caption>
                      <colgroup>
                        <col style={{ width: '70%' }}></col>
                        <col style={{ width: '30%' }}></col>
                      </colgroup>
                      <thead>
                        <tr>
                          <th scope="col">구분</th>
                          <th scope="col">건수</th>
                        </tr>
                      </thead>
                      <tbody>
                        {freightSuspiciousDetections &&
                        freightSuspiciousDetections.length > 0 ? (
                          freightSuspiciousDetections.map(
                            (freightSuspiciousDetection, index) => {
                              return (
                                <tr key={'trrow' + index}>
                                  <td className="t-left">
                                    <Link
                                      href={
                                        freightSuspiciousDetection.url
                                          ? freightSuspiciousDetection.url?.replace(
                                              '/fsm',
                                              '.',
                                            )
                                          : ''
                                      }
                                      className="main-info-link"
                                    >
                                      {freightSuspiciousDetection.patternNm}
                                    </Link>
                                  </td>
                                  <td className="t-right">
                                    {getCommaNumber(
                                      Number(freightSuspiciousDetection.cnt),
                                    )}
                                  </td>
                                </tr>
                              )
                            },
                          )
                        ) : (
                          <DefaultSuspiciousDetections />
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabPanel>
                <TabPanel key={2} value={String(2)}>
                  <div className="table-scrollable">
                    <table className="table table-bordered">
                      <caption>의심거래 적발현황 테이블 요약</caption>
                      <colgroup>
                        <col style={{ width: '70%' }}></col>
                        <col style={{ width: '30%' }}></col>
                      </colgroup>
                      <thead>
                        <tr>
                          <th scope="col">구분</th>
                          <th scope="col">건수</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taxiSuspiciousDetections &&
                        taxiSuspiciousDetections.length > 0 ? (
                          taxiSuspiciousDetections.map(
                            (taxiSuspiciousDetections, index) => {
                              return (
                                <tr key={'trrow2' + index}>
                                  <td className="t-left">
                                    {taxiSuspiciousDetections.patternNm}
                                  </td>
                                  <td className="t-right">
                                    {getCommaNumber(
                                      Number(taxiSuspiciousDetections.cnt),
                                    )}
                                  </td>
                                </tr>
                              )
                            },
                          )
                        ) : (
                          <DefaultSuspiciousDetections />
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabPanel>
                <TabPanel key={3} value={String(3)}>
                  <div className="table-scrollable">
                    <table className="table table-bordered">
                      <caption>의심거래 적발현황 테이블 요약</caption>
                      <colgroup>
                        <col style={{ width: '70%' }}></col>
                        <col style={{ width: '30%' }}></col>
                      </colgroup>
                      <thead>
                        <tr>
                          <th scope="col">구분</th>
                          <th scope="col">건수</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="t-center" colSpan={2}>
                            해당없음
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabPanel>
              </div>
            </MainContents>
          </div>
        </div>
      </div>
      <div>
        {detailMoalFlag && selectedNotice && (
          <ModifyDialog
            size="lg"
            title="공지사항"
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedNotice}
            open={detailMoalFlag}
          ></ModifyDialog>
        )}{' '}
      </div>
      <MainIllegalityModal />
      <SurveyModal />
      <NoticeModalContainer />
    </PageContainer>
  )
}

const MainContents = ({
  contentTitle,
  tabContextValue,
  tabListHandler,
  tabListLabel,
  isAuthUser,
  children,
}: any) => {
  return (
    <div className="main-contents">
      <div className="main-contents-box">
        <h1 className="contents-box-title">
          <span>{contentTitle}</span>
          <div className="main-title-option">
            {/* <button className="main-info-board-more-btn" onClick={() => handleCartPubClick('./sta/ci')} title="더보기 버튼"></button> */}
          </div>
        </h1>
        <div className="contents-box-con">
          <TabContext value={tabContextValue}>
            <div className="tabs-round-type">
              <TabList
                className="tab-list"
                onChange={tabListHandler}
                aria-label={tabListLabel}
              >
                <Tab
                  key={1}
                  label={'화물'}
                  value={String(1)}
                  disabled={!isAuthUser('TR')}
                />
                <Tab
                  key={2}
                  label={'택시'}
                  value={String(2)}
                  disabled={!isAuthUser('TX')}
                />
                <Tab
                  key={3}
                  label={'버스'}
                  value={String(3)}
                  disabled={!isAuthUser('BS')}
                />
              </TabList>
              <>{children}</>
            </div>
          </TabContext>
        </div>
      </div>
    </div>
  )
}

const DefaultSuspiciousDetections = () => {
  return (
    <>
      <tr>
        <td className="t-left">주유 패턴이상</td>
        <td className="t-right">00,00</td>
      </tr>
      <tr>
        <td className="t-left">단시간 반복주유</td>
        <td className="t-right">00,00</td>
      </tr>
      <tr>
        <td className="t-left">1일 4회이상</td>
        <td className="t-right">00,00</td>
      </tr>
      <tr>
        <td className="t-left">탱크용량 초과주유</td>
        <td className="t-right">00,00</td>
      </tr>
      <tr>
        <td className="t-left">톤급별 평균대비 초과주유</td>
        <td className="t-right">00,00</td>
      </tr>
      <tr>
        <td className="t-left">거리대비 주유시간이상</td>
        <td className="t-right">00,00</td>
      </tr>
      <tr>
        <td className="t-left">유효하지 않은 사업자 의심 주유</td>
        <td className="t-right">00,00</td>
      </tr>
      <tr>
        <td className="t-left">주행거리 기반 주유량 의심 주유</td>
        <td className="t-right">00,00</td>
      </tr>
    </>
  )
}

const NoneSubsidyClaimData = () => {
  return (
    <tr>
      <td className="t-center">데이터 없음</td>
      <td className="t-right">00,000</td>
      <td className="t-right">00,000</td>
      <td className="t-right">00,000</td>
      <td className="t-right">00,000</td>
    </tr>
  )
}

const SubsidyAreaNoticeComment = ({ children }: any) => {
  return (
    <div className="contents-explanation">
      <div className="contents-explanation-inner">
        <div className="contents-explanation-text">{children}</div>
      </div>
    </div>
  )
}
