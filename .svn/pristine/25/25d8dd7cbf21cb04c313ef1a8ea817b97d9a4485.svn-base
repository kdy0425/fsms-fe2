'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'
import BlankCard from '@/app/components/shared/BlankCard'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { Pageable2 } from 'table'
import { getExcelFile } from '@/utils/fsms/common/comm'
import { supIidHC } from '@/utils/fsms/headCells'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import {
  getFormatToday,
  getToday,
  getDateRange,
} from '@/utils/fsms/common/dateUtils'

import { getUserInfo } from '@/utils/fsms/utils'
import { Grid } from '@mui/material'
import { formatDate } from '@/utils/fsms/common/convert'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '업무지원',
  },
  {
    title: '업무일반',
  },
  {
    to: '/sup/iid',
    title: '개인정보 엑셀 다운로드 현황',
  },
]

export interface Row {
  sn: string
  inqYmd: string
  menuTsid: string
  locgovCd: string
  inqNocs: string
  inqRsnCd: string
  inqRsnCn: string
  rrnoInclYn: string
  cardNoInclYn: string
  vhclNoInclYn: string
  flnmInclYn: string
  actnoInclYn: string
  brnoInclYn: string
  telnoInclYn: string
  addrInclYn: string
  emlAddrInclYn: string
  ipAddrInclYn: string
  actnYn: string
  actnRsltCn: string
  rgtrId: string
  regDt: string
  mdfrId: string
  mdfcnDt: string

  menuNm: string
  inclNm: string
  locgovNm: string
  userNm: string
  actnNm: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)
  const [excelFlag, setExcelFlag] = useState<boolean>(false)
  const selectedRowData =
    selectedRowIndex !== -1 ? rows[selectedRowIndex] : null

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchStDate: '', // 시작일
    searchEdDate: '', // 종료일
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag !== null) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('d', 30)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))
  }, [])

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0], 0)
    }
  }, [rows])

  const userInfo = getUserInfo()

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedRowIndex(-1)
    setLoading(true)

    try {
      if (userInfo.roles[0] == 'LOGV') {
        // 지자체 권한일때만 시도 및 관할관청 체크
        if (!params.ctpvCd) {
          alert('시도명을 선택해주세요.')
          return
        }

        if (!params.locgovCd) {
          alert('관할관청을 선택해주세요.')
          return
        }
      }

      if (!params.searchStDate || !params.searchEdDate) {
        alert('열람일자를 입력해주세요.')
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sup/iid/cm/getAllIndvInfoDownload?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&dlngBgngYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&dlngEndYmd=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.inclNm ? '&inclNm=' + params.inclNm : ''}` +
        `${params.actnYn ? '&actnYn=' + params.actnYn : ''}` +
        `${params.lgnId ? '&lgnId=' + params.lgnId : ''}` +
        `${params.userNm ? '&userNm=' + params.userNm : ''}`

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
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
      setExcelFlag(true)
    }
  }

  const excelDownload = async () => {
    if (rows.length === 0) {
      alert('엑셀파일을 다운로드 할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    if (userInfo.roles[0] == 'LOGV') {
      // 지자체 권한일때만 시도 및 관할관청 체크
      if (!params.ctpvCd) {
        alert('시도명을 선택해주세요.')
        return
      }

      if (!params.locgovCd) {
        alert('관할관청을 선택해주세요.')
        return
      }
    }

    if (!params.searchStDate || !params.searchEdDate) {
      alert('열람일자를 입력해주세요.')
      return
    }

    let endpoint: string =
      `/fsm/sup/iid/cm/getExcelIndvInfoDownload?` +
      `${params.searchStDate ? '&dlngBgngYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
      `${params.searchEdDate ? '&dlngEndYmd=' + params.searchEdDate.replaceAll('-', '') : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.inclNm ? '&inclNm=' + params.inclNm : ''}` +
      `${params.actnYn ? '&actnYn=' + params.actnYn : ''}` +
      `${params.lgnId ? '&lgnId=' + params.lgnId : ''}` +
      `${params.userNm ? '&userNm=' + params.userNm : ''}`

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page,
        size: pageSize,
      }))
      setFlag((prev) => !prev)
    },
    [],
  )

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedRowIndex(index ?? -1)
  }, [])
  // 페이지 이동 감지 종료 //

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  return (
    <PageContainer
      title="개인정보 엑셀 다운로드 현황"
      description="개인정보 엑셀 다운로드 현황"
    >
      {/* breadcrumb */}
      <Breadcrumb title="개인정보 엑셀 다운로드 현황" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                열람일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                열람년월일 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                inputProps={{
                  max: getFormatToday,
                }}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                열람년월일 종료
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                inputProps={{
                  min: params.searchStDate,
                  max: getFormatToday(),
                }}
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
                htmlFor="sch-locgov"
              >
                <span className="required-text">*</span>관할관청
              </CustomFormLabel>
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-taskSeCd"
              >
                개인정보유형
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="231"
                pValue={params.inclNm}
                handleChange={handleSearchChange}
                pName="inclNm"
                htmlFor={'sch-taskSeCd'}
                addText="전체"
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-koiCd"
              >
                확인여부
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="232"
                pValue={params.actnYn}
                handleChange={handleSearchChange}
                pName="actnYn"
                htmlFor={'sch-koiCd'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-vhclNo"
              >
                ID
              </CustomFormLabel>
              <CustomTextField
                id="sch-vhclNo"
                name="lgnId"
                value={params.lgnId}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-brno"
              >
                담당자명
              </CustomFormLabel>
              <CustomTextField
                id="sch-brno"
                name="userNm"
                value={params.userNm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              onClick={() => fetchData()}
              variant="contained"
              color="primary"
            >
              검색
            </Button>
            <Button
              onClick={() => excelDownload()}
              variant="contained"
              color="success"
            >
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={supIidHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          selectedRowIndex={selectedRowIndex}
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          caption={'개인정보 열람 조회 목록'}
        />
      </Box>
      {/* 테이블영역 끝 */}

      <Grid container spacing={2} className="card-container">
        <Grid item xs={12} sm={12} md={12}>
          <BlankCard className="contents-card" title="개인정보 열람 상세정보">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      열람일자
                    </th>
                    <td>{formatDate(selectedRowData?.inqYmd)}</td>
                    <th className="td-head" scope="row">
                      메뉴명
                    </th>
                    <td colSpan={3}>{selectedRowData?.menuNm}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      조회건수
                    </th>
                    <td>{selectedRowData?.inqNocs}</td>
                    <th className="td-head" scope="row">
                      개인정보유형
                    </th>
                    <td colSpan={3}>{selectedRowData?.inclNm}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      관할관청
                    </th>
                    <td>{selectedRowData?.locgovNm}</td>
                    <th className="td-head" scope="row">
                      담당자명
                    </th>
                    <td colSpan={3}>{selectedRowData?.userNm}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      열람목적
                    </th>
                    <td>{selectedRowData?.inqRsnCn}</td>
                    <th className="td-head" scope="row">
                      변경ID
                    </th>
                    <td>{selectedRowData?.mdfrId}</td>
                    <th className="td-head" scope="row">
                      변경일자
                    </th>
                    <td>{formatDate(selectedRowData?.mdfcnDt)}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      확인여부
                    </th>
                    <td>{selectedRowData?.actnNm}</td>
                    <th className="td-head" scope="row">
                      조치결과
                    </th>
                    <td colSpan={3}>{selectedRowData?.actnRsltCn}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </BlankCard>
        </Grid>
      </Grid>
    </PageContainer>
  )
}

export default DataList
