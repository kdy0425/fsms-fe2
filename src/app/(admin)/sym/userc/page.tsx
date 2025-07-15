'use client'
import {
  Box,
  Button,
  FormControlLabel,
  RadioGroup,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb, CustomRadio } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  getDateRange
} from '@/utils/fsms/common/dateUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import { CtpvSelectAll, LocgovSelectAll } from '@/app/components/tx/commSelect/CommSelect'
import TableDataGrid from './_components/TableDataGrid'

// types
// import FormDialog from '@/app/components/bs/popup/ApvDetailDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { getLocalGovCodes } from '@/utils/fsms/common/code/getCode'
import { symUsercHC } from '@/utils/fsms/headCells'
import { SelectItem } from 'select'
import { Pageable2 } from 'table'

import { isNumber } from '@/utils/fsms/common/comm'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '시스템관리',
  },
  {
    title: '권한관리',
  },
  {
    to: '/sym/userc',
    title: '사용자정보변경관리',
  },
]

export interface Row {
  lgnId?: string    
  userNm?: string   
  locgovNm?: string 
  roleNm?: string   
  changeNm?: string 
  beInstNm?: string 
  beInstCd?: string 
  beDeptNm?: string 
  beDeptCd?: string 
  nowInstNm?: string
  nowInstCd?: string
  nowDeptNm?: string
  nowDeptCd?: string
  beMngNo?: string  
  nowMngNo?: string  

}

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

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [detailflag, setDetailFlag] = useState<number>(0) // 데이터 갱신을 위한 플래그 설정


  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row>();  // 선택된 Row를 저장할 state
  const [isModalOpen, setIsModalOpen] = useState(false);    // modal   오픈 상태 
  const [detailRows, setDetailRows] = useState<Row[]>([]);  // 거래내역에 대한 Row
  const [selectedIndex, setSelectedIndex] = useState<number>();

  const [open, setOpen] = useState<boolean>(false)
  const [modalRowData, setModalRowData] = useState<Row[]>([]);


  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    bgngDt: String(allParams.bgngDt ?? ''), // 시작일
    endDt: String(allParams.endDt ?? ''), // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })
  //

  // 조회하여 가져온 정보를 Table에 넘기는 객체
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


// useEffect 내에서 조건 추가
useEffect(() => {
  if (detailflag > 0) { // detailflag가 1 이상일 때만 실행
    //fetchDetails(selectedRow);
  }
}, [detailflag]);


  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag)

    const dateRange = getDateRange('m', 1)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      bgngDt: startDate,
      endDt: endDate,
    }))

  }, [])

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])

  useEffect(() => {
    let locgovCodes: SelectItem[] = [
      {
        label: '전체',
        value: '',
      },
    ]

    // 관할관청 select item setting
    getLocalGovCodes(params.ctpvCd).then((res) => {
      if (res) {
        res.map((code: any) => {
          let item: SelectItem = {
            label: code['locgovNm'],
            value: code['locgovCd'],
          }

          locgovCodes.push(item)
        })
      }
    })
  }, [params.ctpvCd])

  function formatDate(dateString:string) {
    // 입력 형식이 YYYY-MM인지 확인
    if (!/^\d{4}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // "-" 제거하고 반환
    return dateString.replace("-", "");
  }


  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedIndex(-1);
    setSelectedRow(undefined);
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sym/user/cm/getAllUserChange?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.userNm ? '&userNm=' + params.userNm : ''}` +
        `${params.lgnId ? '&lgnId=' + params.lgnId : ''}` +
        `${params.changeNm ? '&changeNm=' + params.changeNm : ''}`

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
  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag((prev) => !prev)
  },[]
  )

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((selectedRow: Row, index?: number) => {
      setSelectedRow(selectedRow);
      setSelectedIndex(index);
  },[]
  )

  const userChange = async () => {
    if (!selectedRow) {
      alert('사용자정보를 먼저 선택하세요.');
      return;
    }
    if (selectedRow.changeNm==='동일') {
      alert('변경된 데이터가 없습니다.');
      return;
    }
   
    let endpoint: string =  `/fsm/sym/user/cm/changeUser`;
   
    const userConfirm = confirm("선택된 사용자정보를 현재정보로 변경 하시겠습니까?");

    if(userConfirm) {
      let body = {
        lgnId: selectedRow.lgnId,
        mngNo: selectedRow.nowMngNo
      }

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        fetchData();
        alert(response.message);
      } else {
        alert(response.message);
      }

    }else{
      return;
    }
  };

  const userDelete = async () => {
    if (!selectedRow) {
      setOpen(false)
      alert('사용자정보를 먼저 선택하세요.');
      return;
    }
   
    let endpoint: string =  `/fsm/sym/user/cm/changeUserStop`;
   
    const userConfirm = confirm("선택된 사용자정보를 정지 처리 하시겠습니까?");

    if(userConfirm) {
      let body = {
        lgnId: selectedRow.lgnId,
        mngNo: selectedRow.nowMngNo
      }

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        fetchData();
        alert("정지처리 되었습니다.");
      } else {
        alert(response.message);
      }

    }else{
      return;
    }
  };


  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    //setParams((prev) => ({ ...prev, [name]: value }))
    if(isNumber(value)||name!=='brno') {
      setParams((prev: any) => ({ ...prev, [name]: value })) 
    } else {
      event.target.value = value.substring(0, value.length - 1);
    }
  }

  const customHeader = (): React.ReactNode => {
    return (
      <TableHead>
        <TableRow>
          <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
            아이디
          </TableCell>
          <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
            사용자명
          </TableCell>
          <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
            관할관청
          </TableCell>
          <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
            권한
          </TableCell>
          <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
            변경여부
          </TableCell>
          <TableCell colSpan={4}>이전정보</TableCell>
          <TableCell colSpan={4}>현재정보</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ whiteSpace: 'nowrap' }}>
            전체기관명
          </TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>기관코드</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>부서명</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>부서코드</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>
            전체기관명
          </TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>기관코드</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>부서명</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>부서코드</TableCell>
        </TableRow>
      </TableHead>
    )
  }

  return (
    <PageContainer title="사용자정보변경관리" description="사용자정보변경관리">
      {/* breadcrumb */}
      <Breadcrumb title="사용자정보변경관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
                <CustomFormLabel className="input-label-display" htmlFor="sch-ctpv">
                  시도명
                </CustomFormLabel>
                <CtpvSelectAll
                  pValue={params.ctpvCd}              
                  handleChange={handleSearchChange}  
                  htmlFor={'sch-ctpv'}               
                />
              </div>

              <div className="form-group">
                <CustomFormLabel className="input-label-display" htmlFor="sch-locgov">
                  관할관청
                </CustomFormLabel>              
                <LocgovSelectAll
                  ctpvCd={params.ctpvCd}              
                  pValue={params.locgovCd}            
                  handleChange={handleSearchChange}                            
                  htmlFor={'sch-locgov'}              
                />
              </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-car-name"
  
              >
                사용자명
              </CustomFormLabel>
              <CustomTextField  name="userNm"
                value={params.userNm}
                onChange={handleSearchChange}  type="text" id="ft-car-name" fullWidth />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-car-name"
  
              >
                아이디
              </CustomFormLabel>
              <CustomTextField  name="lgnId"
                value={params.lgnId}
                onChange={handleSearchChange}  type="text" id="ft-car-name" fullWidth />
            </div>
          </div><hr></hr>
          <div className="filter-form">
            <div className="form-group">
                <CustomFormLabel className="input-label-display">
                  변경여부
                </CustomFormLabel>
                <RadioGroup
                  row
                  id="ft-changeNm-radio"
                  name="changeNm"
                  value={params.changeNm || ""}
                  onChange={handleSearchChange}
                  className="mui-custom-radio-group"
                >
                  <FormControlLabel
                      control={<CustomRadio id="chk_All" name="changeNm" value="" />}
                      label="전체"
                  />
                  <FormControlLabel
                      control={<CustomRadio id="chk_Y" name="changeNm" value="변경" />}
                      label="변경"
                  />
                  <FormControlLabel
                      control={<CustomRadio id="chk_N" name="changeNm" value="동일" />}
                      label="동일"
                  />
                </RadioGroup>
              </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
          <Button onClick={() => fetchData()} type="submit" variant="contained" color="primary">
              검색
          </Button>
          <Button onClick={userChange} variant="contained" color="primary">
            변경
          </Button>
          <Button onClick={userDelete} variant="contained" color="error">
            정지
          </Button>
                {/* 테이블영역 끝 */}
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={symUsercHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          selectedRowIndex={selectedIndex}
          customHeader={customHeader}
          caption={"사용자정보변경관리"}
        />
      </Box>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
