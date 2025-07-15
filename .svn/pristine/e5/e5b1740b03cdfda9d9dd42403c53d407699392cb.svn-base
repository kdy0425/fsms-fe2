'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { getDateRange } from '@/utils/fsms/common/comm'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '시스템관리',
  },
  {
    title: '연계정보관리',
  },
  {
    to: '/sym/mci',
    title: '행정안전부 연계 송수신정보',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'procNm',
    numeric: false,
    disablePadding: false,
    label: '프로세스명',
  },
  {
    id: 'procKornNm',
    numeric: false,
    disablePadding: false,
    label: '전문내용',
  },
  {
    id: 'dlngNm',
    numeric: false,
    disablePadding: false,
    label: '송수신여부',
  },
  {
    id: 'excnBgngYmd',
    numeric: false,
    disablePadding: false,
    label: '실행시작일자',
    format: 'yyyymmdd',
  },
  {
    id: 'schdulExcnTm',
    numeric: false,
    disablePadding: false,
    label: '실행시작시간',
    format: 'hh24miss',
  },
  {
    id: 'excnEndYmd',
    numeric: false,
    disablePadding: false,
    label: '실행종료일자',
    format: 'yyyymmdd',
  },
  {
    id: 'excnEndTm',
    numeric: false,
    disablePadding: false,
    label: '실행종료시간',
    format: 'hh24miss',
  },
  {
    id: 'schdulPrgrsSttsNm',
    numeric: false,
    disablePadding: false,
    label: '오류내용',
  },
  {
    id: 'prcsNocs',
    numeric: false,
    disablePadding: false,
    label: '처리건수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'errorNocs',
    numeric: false,
    disablePadding: false,
    label: '오류건수',
    format: 'number',
    align: 'td-right',
  },
]

export interface Row {
  procNm: string // 프로세스명
  procKornNm: string // 전문내용
  dlngCd: string // 송수신여부
  dlngNm: string // 송수신여부 한글명
  useYn: string // 사용여부
  schdulSeCd: string // 스케줄 구분코드
  schdulExcnYmd: string // 스케줄 실행일자
  schdulExcnTm: string // 스케줄 실행시각
  excnBgngYmd: string // 실행 시작일자
  excnBgngTm: string // 실행 시작시간
  excnEndYmd: string // 실행 종료일자
  excnEndTm: string // 실행 종료시간
  excnNocs: string // 실행건수
  schdulPrgrsSttsCd: string // 스케줄진행사항코드
  schdulPrgrsSttsNm: string // 오류내용
  prcsNocs: string // 처리건수
  errorNocs: string // 오류건수
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const dateRange = getDateRange('d', 30)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? dateRange.startDate, // 시작일
    searchEdDate: allParams.searchEdDate ?? dateRange.endDate, // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    fetchData()
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sym/mci/cm/getAllMoisCntcInfo?page=${params.page}&size=${params.size}` +
        `${params.dlngCd ? '&dlngCd=' + params.dlngCd : ''}` +
        `${params.procNm ? '&procNm=' + params.procNm : ''}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replace(/-/g, '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replace(/-/g, '') : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
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
      console.error('Error fetching data:', error)
      setRows([])
      setTotalRows(0)
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

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'searchStDate' || name === 'searchEdDate') {
      const otherDateField =
        name === 'searchStDate' ? 'searchEdDate' : 'searchStDate'
      const otherDate = params[otherDateField]

      if (name === 'searchStDate') {
        let stDate = value

        if (!isValidDateIn3Month(stDate)) {
          alert('실행일자는 3개월 이내만 조회 가능합니다.')
          return
        }
      }

      if (isValidDateRange(name, value, otherDate)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
        return
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

    if (changedField === 'searchStDate') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  const isValidDateIn3Month = (startDate: string): boolean => {
    const st: Date = new Date(startDate)
    const before3Month: Date = new Date()
    before3Month.setMonth(before3Month.getMonth() - 3)

    const isOut3Month: boolean = st.getTime() - before3Month.getTime() > 0
    console.log(isOut3Month)

    return isOut3Month
  }

  return (
    <PageContainer
      title="행정안전부 연계 송수신정보"
      description="행정안전부 연계 송수신정보"
    >
      {/* breadcrumb */}
      <Breadcrumb title="행정안전부 연계 송수신정보" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                실행일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                실행시작일자
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                fullWidth
              />
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                실행종료일자
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-procNm"
              >
                프로세스명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-procNm"
                name="procNm"
                value={params.procNm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-dlngCd">
                송수신여부
              </CustomFormLabel>
              <CommSelect
                cdGroupNm={'899'}
                pValue={params.dlngCd}
                handleChange={handleSearchChange}
                pName={'dlngCd'}
                addText="전체"
                htmlFor={'ft-dlngCd'}
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button type="submit" variant="contained" color="primary">
              검색
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={headCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
        />
      </Box>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
