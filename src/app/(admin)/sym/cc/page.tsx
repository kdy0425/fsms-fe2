'use client'
import { Box, Button, FormControlLabel, RadioGroup } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb, CustomRadio } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import FormModal from './_components/FormModal'

import { symCcHC, symCcCodeHC } from '@/utils/fsms/headCells'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '시스템관리',
  },
  {
    title: '시스템일반',
  },
  {
    to: '/sym/cc',
    title: '공통코드관리',
  },
]

export interface Row {
  cdGroupNm: string // 코드그룹명
  cdNm: string // 코드명
  cdKornNm: string // 코드그룹한글명
  cdExpln: string // 코드설명
  cdSeq: string | number // 코드 순서
  useYn: string // 사용여부
  cdSeNm: string // 코드구분명?
  comCdYn: string // 공통코드여부
  useNm?: string //사용여부 한글 (사용 / 미사용)
}

interface Row_code {
  cdGroupNm: string
  cdNm: string
  cdKornNm: string
  cdExpln: string
  cdSeq: string
  useYn: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  page_c: number
  size_c: number
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

  // 코드 그룹
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0) // 선택된 로우 인덱스
  const [selectedDetailRowIndex, setSelectedDetailRowIndex] =
    useState<number>(0) // 선택된 로우 인덱스

  // 공통 코드
  const [rows_c, setRows_c] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows_c, setTotalRows_c] = useState(0) // 총 수
  const [loading_c, setLoading_c] = useState(false) // 로딩여부

  const [open, setOpen] = useState<boolean>(false)
  const [open_c, setOpen_c] = useState<boolean>(false)
  const [modalType, setModalType] = useState<'create' | 'update'>('create')
  const [codeType, setCodeType] = useState<'group' | 'code'>('group')
  const [titleNm, setTitleNm] = useState('') // 총 수

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    page_c: 1, // 페이지 번호는 1부터 시작
    size_c: 10, // 기본 페이지 사이즈 설정
    useYn: 'Y',
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
  })

  const [detailParams, setDetailParams] = useState({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })
  const [pageable_c, setPageable_c] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  symCcHC[symCcHC.length - 1].button = {
    label: '수정',
    color: 'primary',
    onClick: (row: Row, index: number) => {
      setSelectedRowIndex(index ?? -1)
      setModalType('update')
      setCodeType('group')
      setTitleNm('코드그룹수정')
      const cdGroupNm: string = row.cdGroupNm
      if (cdGroupNm) {
        fetchCodeData(cdGroupNm)
      }
      setSelectedRowIndex(index ?? -1)
      setOpen(true)
    },
  }

  symCcCodeHC[symCcCodeHC.length - 1].button = {
    label: '수정',
    color: 'primary',
    onClick: (row_c: Row, index: number) => {
      setSelectedDetailRowIndex(index ?? -1)
      setModalType('update')
      setCodeType('code')
      setTitleNm('공통코드수정')
      setOpen_c(true)
    },
  }

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (params.cdNm_c || params.cdKornNm_c) {
      // 코드명/코드한글명을 조회하면 그룹 검색결과는 비움
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
      setSelectedRowIndex(0)
      setSelectedDetailRowIndex(0)
      fetchCodeData(null)
    } else {
      setSelectedRowIndex(0)
      setSelectedDetailRowIndex(0)
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    if (rows.length > 0) {
      fetchCodeData(rows[0].cdGroupNm)
    } else {
      setRows_c([])
      setTotalRows_c(0)
    }
  }, [rows])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag)
  }, [])

  useEffect(() => {
    fetchCodeData(
      rows[selectedRowIndex] ? rows[selectedRowIndex].cdGroupNm : '',
    )
  }, [detailParams])

  // 쿼리스트링, endpoint, 메서드(로딩), 페이지, 파싱할때 타입 (rowtype 채택한 타입으로 아무거나 되게 )
  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setSelectedRowIndex(0)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sym/cc/cm/getAllCmmnCdGroup?page=${params.page}&size=${params.size}` +
        `${params.cdGroupNm ? '&cdGroupNm=' + params.cdGroupNm : ''}` +
        `${params.cdKornNm ? '&cdKornNm=' + params.cdKornNm : ''}` +
        `${params.cdNm ? '&cdNm=' + params.cdNm : ''}` +
        `${params.useYn ? '&useYn=' + params.useYn : ''}`

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

  const fetchCodeData = async (cdGroupNm: string | null) => {
    setLoading_c(true)
    try {
      let endpoint: string =
        `/fsm/sym/cc/cm/getAllCmmnCd?page=${detailParams.page}&size=${detailParams.size}` +
        `${cdGroupNm ? '&cdGroupNm=' + cdGroupNm : ''}` +
        `${params.cdNm_c ? '&cdNm=' + params.cdNm_c : ''}` +
        `${params.cdKornNm_c ? '&cdKornNm=' + params.cdKornNm_c : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        // 데이터 조회 성공시
        setRows_c(response.data.content)
        setTotalRows_c(response.data.totalElements)
        setPageable_c({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setRows_c([])
        setTotalRows_c(0)
        setPageable_c({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows_c([])
      setTotalRows_c(0)
      setPageable_c({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading_c(false)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
    setSelectedRowIndex(0)
  }

  const handleReload = () => {
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setDetailParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
    setSelectedRowIndex(0)
  }

  const handleReload_c = () => {
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setDetailParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
    setSelectedRowIndex(0)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setSelectedRowIndex(0)
      setParams((prev) => ({
        ...prev,
        page: page,
        size: pageSize,
      }))
      setFlag((prev) => !prev)
    },
    [],
  )

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const detailhandlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setDetailParams((prev) => ({
        ...prev,
        page: page,
        size: pageSize,
      }))
    },
    [],
  )

  // 정렬시 데이터 갱신
  const handleSortModelChange = (sort: string) => {
    // 정렬 기준을 params에 업데이트
    setParams((prev) => ({ ...prev, sort: sort })) // 예: "ttl,asc"
    setFlag(!flag) // 정렬 기준이 변경되었으므로 데이터 재조회
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    //const rowData: Row = rows[index];
    const cdGroupNm: string = row.cdGroupNm
    if (cdGroupNm) {
      fetchCodeData(cdGroupNm)
    }
    setSelectedRowIndex(index ?? -1)
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

    if (changedField === 'searchStDate') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  return (
    <PageContainer title="공통코드 관리" description="공통코드 관리">
      {/* breadcrumb */}
      <Breadcrumb title="공통코드 관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-cdGroupNm"
              >
                코드그룹명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-cdGroupNm"
                name="cdGroupNm"
                value={params.cdGroupNm || ''}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-cdKornNm"
              >
                코드그룹한글명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-cdKornNm"
                name="cdKornNm"
                value={params.cdKornNm || ''}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group" style={{ width: 'inherit' }}>
              <CustomFormLabel className="input-label-display">
                사용여부
              </CustomFormLabel>
              <RadioGroup
                row
                id="useYn"
                value={params.useYn || ''}
                onChange={handleSearchChange}
                className="mui-custom-radio-group"
              >
                <FormControlLabel
                  control={<CustomRadio id="chk_Y" name="useYn" value="Y" />}
                  label="사용"
                />
                <FormControlLabel
                  control={<CustomRadio id="chk_N" name="useYn" value="N" />}
                  label="미사용"
                />
              </RadioGroup>
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-cdNm-02"
              >
                코드명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-cdNm-02"
                name="cdNm_c"
                value={params.cdNm_c || ''}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-cdKornNm-02"
              >
                코드한글명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-cdKornNm-02"
                name="cdKornNm_c"
                value={params.cdKornNm_c || ''}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <CustomFormLabel className="input-label-display">
            <h3>코드그룹</h3>
          </CustomFormLabel>
          <div className="button-right-align">
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
            <Button
              onClick={() => {
                setModalType('create')
                setCodeType('group')
                setTitleNm('코드그룹등록')
                setOpen(true)
              }}
              variant="contained"
              color="primary"
            >
              등록
            </Button>
            {/* <FormModal
              buttonLabel='신규'
              title='코드그룹등록'
              dataType='group'
              formType="create"
              reloadFunc={handleReload}
            /> */}
          </div>
        </Box>
      </Box>
      {/* 검색영역 끝 */}

      {/* 코드그룹 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={symCcHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          selectedRowIndex={selectedRowIndex}
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
        />
      </Box>
      {/* 코드그룹 테이블영역 끝 */}

      {/* 공통코드 테이블영역 시작 */}

      <Box>
        <Box className="table-bottom-button-group">
          <CustomFormLabel className="input-label-display">
            <h3>공통코드</h3>
          </CustomFormLabel>
          <div className="button-right-align">
            <Button
              onClick={() => {
                setModalType('create')
                setOpen_c(true)
                setCodeType('code')
                setTitleNm('공통코드등록')
              }}
              variant="contained"
              color="primary"
            >
              등록
            </Button>
            <FormModal
              isOpen={open}
              setOpen={setOpen}
              title={titleNm}
              dataType={codeType}
              formType={modalType}
              data={rows[selectedRowIndex]}
              reloadFunc={handleReload}
            />
            <FormModal
              isOpen={open_c}
              setOpen={setOpen_c}
              title={titleNm}
              dataType={codeType}
              formType={modalType}
              data={rows_c[selectedDetailRowIndex]}
              groupNm={
                rows[selectedRowIndex] ? rows[selectedRowIndex].cdGroupNm : ''
              }
              reloadFunc={handleReload_c}
            />
          </div>
        </Box>
        <TableDataGrid
          headCells={symCcCodeHC} // 테이블 헤더 값
          rows={rows_c} // 목록 데이터
          loading={loading_c} // 로딩여부
          onPaginationModelChange={detailhandlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          totalRows={totalRows_c} // 총 로우 수
          pageable={pageable_c} // 현재 페이지 / 사이즈 정보
        />
      </Box>

      {/* 공통코드 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
