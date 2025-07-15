'use client'
import { Box, Button, FormControlLabel } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpFileRequest,sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { getDateRange } from '@/utils/fsms/common/dateUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { HeadCell, Pageable2 } from 'table'
import DetailDataGrid from './_components/DetailDataGrid'
import ModalContent from './_components/ModalContent'
import { isNumber } from '@/utils/fsms/common/comm'

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
    to: '/sup/iidm',
    title: '개인정보열람사후관리',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'inqYmd',
    numeric: false,
    disablePadding: false,
    label: '열람일자',
    format: 'yyyymmdd',
  },
  {
    id: 'menuNm',
    numeric: false,
    disablePadding: false,
    label: '메뉴명',
  },
  {
    id: 'inclNm',
    numeric: false,
    disablePadding: false,
    label: '개인정보 유형',
  },
  {
    id: 'inqNocs',
    numeric: false,
    disablePadding: false,
    label: '조회건수',
    format: 'number',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '관할관청',
  },
  {
    id: 'userNm',
    numeric: false,
    disablePadding: false,
    label: '담당자명',
  },
  {
    id: 'actnNm',
    numeric: false,
    disablePadding: false,
    label: '확인여부',
  },
]

export interface Row {
  excelSn : string;
  inqYmd: string
  menuNm: string
  inclNm: string
  inqNocs: string
  locgovNm: string
  userNm: string
  actnNm: string
  inqRsnNm : string
  mdfrId : string
  mdfcnDt : string
  actnRsltCn : string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  bgngDt: string
  endDt: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  }) // 페이지객체
  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [selectedRow, setSelectedRow] = useState<Row | null>(null) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedIndex, setSelectedIndex] = useState<number>(-1) // 선택된 행의 인덱스

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    bgngDt: '', // 시작일
    endDt: '', // 종료일
  })

  const [open, setOpen] = useState<boolean>(false)
  const [type, setType] = useState<'create' | 'update'>('create')
  const [modalData, setModalData] = useState<Row | null>(null)

  // useEffect(() => {
  //   // 최초 검색 막기
  //   if (flag != null) {
  //     fetchData()
  //   }
  // }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag((prev) => !prev)
    const dateRange = getDateRange('d', 30)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      bgngDt: startDate,
      endDt: endDate,
    }))
  }, [])

    useEffect(() => {
      if (params.ctpvCd) {
        fetchData()
      }
    }, [flag])


  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedIndex(-1)
    setLoading(true)
    setExcelFlag(true)
    try {
      const searchObj = {
        ...params,
        page: params.page,
        size: params.size
      }

      let endpoint: string =
        `/fsm/sup/iidm/cm/getAllIndvInfoDownloadMng?page=${params.page}&size=${params.size}` +
        `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
        `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${ params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${ params.rgtrId ? '&rgtrId=' + params.rgtrId : ''}` +
        `${ params.actnYnCd ? '&actnYnCd=' + params.actnYnCd : ''}` +
        `${ params.userNm ? '&userNm=' + params.userNm : ''}` +
        `${ params.inclYnCd ? '&inclYnCd=' + params.inclYnCd : ''}`
        
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

        // 클릭이벤트 발생시키기
        handleRowClick(response.data.content[0], 0)
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
        setSelectedIndex(-1)
        setSelectedRow(null)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setTotalRows(0)
      setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
      setSelectedIndex(-1)
      setSelectedRow(null)
    } finally {
      setLoading(false)
    }
  }

    const excelDownload = async () => {
      if (rows.length == 0) {
        alert('엑셀파일을 다운로드할 데이터가 없습니다.')
        return
      }
  
      if (!excelFlag) {
        alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
        return
      }
  
      setIsExcelProcessing(true)
  
      try {
        let endpoint: string =
        `/fsm/sup/iidm/cm/getExcelIndvInfoDownloadMng?page=${params.page}&size=${params.size}` +
        `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
        `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${ params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${ params.rgtrId ? '&rgtrId=' + params.rgtrId : ''}` +
        `${ params.actnYnCd ? '&actnYnCd=' + params.actnYnCd : ''}` +
        `${ params.userNm ? '&userNm=' + params.userNm : ''}` +
        `${ params.inclYnCd ? '&inclYnCd=' + params.inclYnCd : ''}` +
          ``
  
        const response = await sendHttpFileRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })
        console.log(response)
        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', '개인정보열람사후관리.xlsx')
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
      }
      setIsExcelProcessing(false)
    }

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = () => {
    if (!params.ctpvCd) {
      alert('시도명을 입력해주세요.')
      return
    }
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
    fetchData();
  }
  

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setFlag((prev) => !prev)
    },
    [],
  )

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedIndex(index ?? -1)
  }, [])

  // 조회조건 변경시
  const handleSearchChange = ( event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> ) => {
    const { name, value } = event.target

    setParams((prev) => ({ ...prev, [name]: value }))
    setExcelFlag(false)    
  }
  

  const handleClick = () => {
    if(selectedRow?.actnNm=="확인"||selectedRow?.actnNm=="조치"){
      alert('이미 처리된 건입니다.')
      return;
    }
    setOpen(true)
    setModalData(selectedRow)
  }

  const handleConfirm = async () => {
    if(selectedRow?.actnNm=="확인"||selectedRow?.actnNm=="조치"){
      alert('이미 처리된 건입니다.')
      return;
    }
     if(confirm('확인 처리하시겠습니까?')) {
    
            try {
              setLoadingBackdrop(true);
    
                const endpoint: string = `/fsm/sup/iidm/cm/updateConfirmIndvInfoDownloadMng`;
                const body = {
                  excelSn: selectedRow?.excelSn,
                  confirmCd : "Y"
                };
      
                const response = await sendHttpRequest("PUT", endpoint, body, true, { cache: 'no-store'});
      
                if (response && response.resultType == 'success') {
                  alert('완료되었습니다.');              
                  setOpen(false);
                  handleAdvancedSearch();
                } else {
                  alert(response.message);
                }
    
            } catch(error) {
              console.error("ERROR ::: ", error);
            } finally {
              setLoadingBackdrop(false);
            }
      }          
  }

  const handleCancel = async () => {
    if(selectedRow?.actnNm=="미확인"){
      alert('마처리된 건입니다.')
      return;
    }
    if(confirm('취소 처리하시겠습니까?')) {
    
      try {
        setLoadingBackdrop(true);

          const endpoint: string = `/fsm/sup/iidm/cm/updateConfirmIndvInfoDownloadMng`;
          const body = {
            excelSn: selectedRow?.excelSn,
            confirmCd : "N"
          };

          const response = await sendHttpRequest("PUT", endpoint, body, true, { cache: 'no-store'});

          if (response && response.resultType == 'success') {
            alert('완료되었습니다.');              
            setOpen(false);
            handleAdvancedSearch();
          } else {
            alert(response.message);
          }

      } catch(error) {
        console.error("ERROR ::: ", error);
      } finally {
        setLoadingBackdrop(false);
      }
}
  }

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    handleAdvancedSearch()
  }

  return (
    <PageContainer title="개인정보열람 사후관리" description="개인정보열람 사후관리">
      {/* breadcrumb */}
      <Breadcrumb title="개인정보열람 사후관리" items={BCrumb} />

      <Box component="form" onSubmit={submitSearch} sx={{ mb: 2 }}>
        {/* 검색영역 시작 */}
        <Box className="sch-filter-box">
          <div className="filter-form">
          <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                거래년월일
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                거래년월일 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="bgngDt"
                onChange={handleSearchChange}
                inputProps={{ max: params.endDt }}
                value={params.bgngDt}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                거래년월일 종료
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="endDt"
                onChange={handleSearchChange}
                inputProps={{ min: params.bgngDt }}
                value={params.endDt}
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
                관할관청
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
                htmlFor="sch-inclYnCd"
                className="input-label-display"
              >
                개인정보유형
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="231"
                pValue={params.inclYnCd}
                handleChange={handleSearchChange}
                pName="inclYnCd"
                htmlFor={'sch-inclYnCd'}
                addText="전체"
              />
            </div>


          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-rgtrId"
              >
                ID
              </CustomFormLabel>
              <CustomTextField
                id="ft-rgtrId"
                name="rgtrId"
                value={params.rgtrId}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-userNm"
              >
                담당자명
              </CustomFormLabel>
              <CustomTextField
                id="ft-userNm"
                name="userNm"
                value={params.userNm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                htmlFor="sch-actnYnCd"
                className="input-label-display"
              >
                확인여부
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="232"
                pValue={params.actnYnCd}
                handleChange={handleSearchChange}
                pName="actnYnCd"
                htmlFor={'sch-actnYnCd'}
                addText="전체"
              />
            </div>
          </div>
        </Box>

        {/* 버튼영역 시작 */}
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              variant="contained"
              color="primary"
              // onClick={handleAdvancedSearch}
              type="submit"
            >
              검색
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => handleConfirm()}
            >
              확인
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => handleClick()}
            >
              조치
            </Button>

            
            <Button
              variant="contained"
              color="red"
              onClick={() => handleCancel()}
            >
              취소
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

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={headCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          selectedRowIndex={selectedIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          caption={"수소 가맹정 관리 목록 조회"}
        />
      </Box>

      {/* 상세영역 */}
      <>
        {selectedIndex > -1 && selectedRow ? (
          <Box>
            <DetailDataGrid selectedRow={selectedRow} />
          </Box>
        ) : null}
      </>

      {/* 등록수정모달 */}
      <>
        {open ? (
          <ModalContent
            open={open}
            setOpen={setOpen}
            row={modalData}
            handleAdvancedSearch={handleAdvancedSearch}
          />
        ) : null}
      </>
      <LoadingBackdrop open={isExcelProcessing} />
    </PageContainer>
  )
}

export default DataList
