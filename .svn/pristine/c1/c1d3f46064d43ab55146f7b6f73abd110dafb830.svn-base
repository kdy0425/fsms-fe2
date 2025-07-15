'use client'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Snackbar,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import { getLabelFromCode } from '@/utils/fsms/common/convert'
import { getDateRange } from '@/utils/fsms/common/comm'
import { supPmrHC } from '@/utils/fsms/headCells'

//ModalContent
import ModalContent from './_components/ModalContent'
import ModifyDialog from './_components/ModifyDialog'

// 시도코드, 관할관청 조회
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '업무지원',
  },
  {
    title: '예산관리',
  },
  {
    to: '/sup/pmr',
    title: '지급실적관리',
  },
]

export interface Row {
  locgovCd: string //관할관청
  crtrYm: string //기준년월
  carmdlCd: string //차종코드
  carmdlNm: string //업무구분
  anlrveAmt: string //월세입금액
  totalPayAmt: string //총지급금액
  totalPayLit: string //총유류사용량
  totalBalAmt: string //과,부족액
  cardGiveAmt: string //카드지급금액
  cardGiveAog: string //카드지급유류사용량
  orgLocgovCd: string //원관할관청
  orgCrtrYm: string //원거래년월
  orgCarmdlCd: string //원차종코드
  cardClmAmt: string //카드청구금액
  cardClmAog: string //카드청구주유량
  cardClmVhclCnt: string //카드청구차량대수
  cardGiveVhclCnt: string //카드지급차량대수
  docmntAplyClmAmt: string //서면청구금액
  docmntAplyClmLbrctQty: string //서면청구주유량
  docmntAplyClmVhclCnt: string //서면청구차량대수
  docmntAplyGiveAmt: string //서면지급금액
  docmntAplyGiveLbrctQty: string //서면지급주유량
  docmntAplyGiveVhclCnt: string //서면지급차량대수
  rgtrId: string //등록자아이디
  regDt: string //등록시간
  mdfrId: string //수정자아이디
  mdfcnDt: string //수정시간
  locgovNm: string
  ctpvNm: string

  ctpvCd: string //시도코드 표시용
}

const rowData: Row[] = []

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  searchValue: string
  searchSelect: string
  bgngDt: string
  endDt: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell rowSpan={2}>기준년월</TableCell>
        <TableCell rowSpan={2}>월세입액</TableCell>
        <TableCell rowSpan={2}>업무구분</TableCell>
        <TableCell colSpan={3}>카드사 지급</TableCell>
        <TableCell colSpan={3}>서면신청 지급</TableCell>
        <TableCell rowSpan={2}>총 유류사용량</TableCell>
        <TableCell rowSpan={2}>총 지급금액</TableCell>
        <TableCell rowSpan={2}>과,부족액</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>지급대수</TableCell>
        <TableCell>유류사용량</TableCell>
        <TableCell>지급금액</TableCell>
        <TableCell>지급대수</TableCell>
        <TableCell>유류사용량</TableCell>
        <TableCell>지급금액</TableCell>
      </TableRow>
    </TableHead>
  )
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음
  const pathname = usePathname() // 현재 경로를 가져옴

  const [flag, setFlag] = useState<boolean>() // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터

  const [modifyRow, setModifyRows] = useState<Row>() // 수정할 행
  const [confirmOpen, setConfirmOpen] = useState(false) // 다이얼로그 상태
  const [snackbarOpen, setSnackbarOpen] = useState(false) // 스낵바 상태
  const [snackbarMessage, setSnackbarMessage] = useState('') // 스낵바 메시지
  const [confirmLoading, setConfirmLoading] = useState(false) // 로딩 인디케이터

  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [detailMoalFlag, setDetailModalFlag] = useState(false)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    bgngDt: String(allParams.bgngDt ?? ''), // 시작일
    endDt: String(allParams.endDt ?? ''), // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
    // locgovCd: '51150', //초기 검색값?
    // carmdlCd: '010',
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    console.log('useEffect [flag] : ', flag)
    if (params.bgngDt && params.endDt && params.locgovCd && params.carmdlCd) {
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    // console.log('useEffect flag : ', flag)
    const dateRange = getDateRange('m', 1)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({ ...prev, bgngDt: startDate, endDt: endDate }))
  }, [])

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    console.log('useEffect [params] : ', flag)
    setQString(toQueryString(params))
  }, [params])

  const handleReload = () => {
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
    console.log('handleReload flag : ', flag)
  }

  function formatDate(dateString: string) {
    // 입력 형식이 YYYY-MM인지 확인
    if (!/^\d{4}-\d{2}$/.test(dateString)) {
      throw new Error("Invalid format. Expected 'YYYY-MM'")
    }

    // "-" 제거하고 반환
    return dateString.replace('-', '')
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    console.log('fetchData flag : ', flag)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sup/pmr/cm/getAllPerfMng?page=${params.page}&size=${params.size}` +
        `${params.locgovCd ? '&' + 'locgovCd' + '=' + params.locgovCd : ''}` +
        `${params.carmdlCd ? '&' + 'carmdlCd' + '=' + params.carmdlCd : ''}` +
        `${params.bgngDt ? '&startAplcnYmd=' + params.bgngDt.replaceAll('-', '') : ''}` +
        `${params.endDt ? '&endAplcnYmd=' + params.endDt.replaceAll('-', '') : ''}`
      console.log(endpoint)
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      console.log(response)
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      setRows(rowData)
      setTotalRows(rowData.length)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()

    if (!params.ctpvCd || params.ctpvCd == '') {
      alert('시도군은 필수값입니다.')
      return
    }

    if (!params.locgovCd || params.locgovCd == '') {
      alert('관할관청은 필수값입니다.')
      return
    }

    if (!params.bgngDt || params.bgngDt == '') {
      alert('시작일은 필수값입니다.')
      return
    }

    if (!params.endDt || params.endDt == '') {
      alert('종료일은 필수값입니다.')
      return
    }

    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(!flag)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (modifyRow: Row) => {
    setModifyRows(modifyRow)
    setDetailModalFlag(true)
  }

  const handleConfirmClick = () => {
    // if (!modifyRow) return // modifyRow 수정할 데이터 없으면 취소
    // // 선택된 데이터가 확정 처리된 상태인지 확인
    // if (modifyRow.ddlnYn === 'Y') {
    //   setSnackbarMessage('이미 확정이 처리된 청구건 입니다')
    //   setSnackbarOpen(true)
    // } else {
    //   setConfirmOpen(true) // 미확정인 경우 확인 다이얼로그 열기
    // }
  }

  const ConfirmData = async (modifyRow: Row) => {
    setLoading(true)
    try {
      let endpoint: string = `/fsm/cal/pd/tx/updateCfmtnPymntDcsn`
      const response = await sendHttpRequest(
        'PUT',
        endpoint,
        {
          // crdcoCd: modifyRow.crdcoCd,
          // clclnYm: modifyRow.clclnYm,
          // clclnLocgovCd: modifyRow.clclnLocgovCd,
          // bzmnSeCd: modifyRow.bzmnSeCd,
          // koiCd: modifyRow.koiCd,
          // mdfrId: modifyRow.mdfrId,
          // Include any additional fields as necessary
        },
        true,
        {
          cache: 'no-store',
        },
      )
      if (response && response.resultType === 'success') {
        return 'success'
      } else {
      }
    } catch (error) {
      return 'false'
    } finally {
      setLoading(false)
    }
  }

  const handleDetailCloseModal = () => {
    setDetailModalFlag((prev) => false)
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    if (name === 'bgngDt' || name === 'endDt') {
      const otherDateField = name === 'bgngDt' ? 'endDt' : 'bgngDt'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
  }

  // 시작일과 종료일 비교
  const isValidDateRange = (
    changedField: string,
    changedValue: string,
    otherValue: string | undefined,
  ): boolean => {
    if (!otherValue) return true

    const changedDate = new Date(changedValue)
    const otherDate = new Date(otherValue)

    if (changedField === 'bgngDt') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  // 추후에 액셀 다운로드 API 나오면 연동!
  const excelDownload = async () => {
    if (rows.length == 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    try {
      let endpoint: string =
        `/fsm/sup/pmr/cm/perfMngExcel?page=${params.page}&size=${params.size}` +
        `${params.locgovCd ? '&' + 'locgovCd' + '=' + params.locgovCd : ''}` +
        `${params.carmdlCd ? '&' + 'carmdlCd' + '=' + params.carmdlCd : ''}` +
        `${params.bgngDt ? '&startAplcnYmd=' + params.bgngDt.replaceAll('-', '') : ''}` +
        `${params.endDt ? '&endAplcnYmd=' + params.endDt.replaceAll('-', '') : ''}`

      const response = await sendHttpFileRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', '지급실적관리.xlsx')
      document.body.appendChild(link)
      link.click()
      // if (response && response.resultType === 'success' && response.data) {
      //   // 데이터 조회 성공시

      // } else {
      //   // 데이터가 없거나 실패

      // }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setTotalRows(0)
    }
  }

  return (
    <PageContainer title="지급확정관리" description="지급확정관리">
      {/* breadcrumb */}
      <Breadcrumb title="지급확정관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                기준년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                기준 시작년월
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="bgngDt"
                value={params.bgngDt}
                onChange={handleSearchChange}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                기준 종료 년월
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-end"
                name="endDt"
                value={params.endDt}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
              >
                <span className="required-text">*</span>시도명
              </CustomFormLabel>
              <CtpvSelect
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpv'}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgovCd"
              >
                <span className="required-text">*</span>관할관청
              </CustomFormLabel>
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgovCd'}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-carmdlCd"
              >
                <span className="required-text">*</span>업무구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="801" // 필수 O, 가져올 코드 그룹명
                pValue={params.carmdlCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                pName="carmdlCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                htmlFor={'sch-carmdlCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
              />
              {/* // 다음줄  */}
            </div>
            {/* // 다음줄  */}
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button type="submit" variant="contained" color="primary">
              검색
            </Button>
            <Button
              onClick={() => excelDownload()}
              variant="contained"
              color="success"
            >
              엑셀
            </Button>
            <ModalContent
              reloadFunc={handleReload}
              size="lg"
              buttonLabel="등록"
              title="지급실적등록"
            />
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          customHeader={customHeader}
          headCells={supPmrHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
        />
      </Box>

      {/* 상세 모달 */}
      <div>
        {detailMoalFlag && modifyRow && (
          <ModifyDialog
            size="lg"
            title="지급실적수정"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={modifyRow}
            open={detailMoalFlag}
          ></ModifyDialog>
        )}
      </div>

      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
