'use client'

/* React */
import React, { useEffect, useState, useCallback } from 'react'

/* 공통js */
import { toQueryParameter } from '@/utils/fsms/utils'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

/* mui component */
import { Box, Button } from '@mui/material'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CommSelect, CtpvSelectAll } from '@/app/components/tx/commSelect/CommSelect'

/* 공통 type, interface */
import { HeadCell, Pageable2 } from 'table'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { stnbnoHeadCells } from '@/utils/fsms/headCells'
import { getFormatToday } from '@/utils/fsms/common/dateUtils'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '기준관리',
  },
  {
    title: '보조금지급시행기준',
  },
  {
    to: '/stn/bno',
    title: '지역별 고시유가관리',
  },
]

export interface Row {
  koiNm: string; // 유종명
  aplcnBgngYmd: string; // 고시기준일
  ancmntOilprcAmt: string; // 단가
  transSts: string; // 전송여부
  koiCd: string; 
  rgnNm: string 
  rgnCd: string;
}


/* interface 선언 */
interface listSearchObj {
  page:number,
  size:number,
  aplcnBgngYmd:string,
  rgnCd: string,
  koiCd:string,
}

const DataList = () => {
  
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [params, setParams] = useState<listSearchObj>({ page:1, size:10, aplcnBgngYmd:'', rgnCd:'', koiCd:'',}); // 조회조건
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 }); // 페이징객체
  
  useEffect(() =>{
    setParams((prev) => ({ ...prev, aplcnBgngYmd : getFormatToday()}));
  },[])

  useEffect(() => {
    fetchData();
  }, [flag]);

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    
    setLoading(true)
    setExcelFlag(true) // 엑셀기능 동작여부

    try {
      
      const searchObj = {
        ...params,
        page:params.page,
        size:params.size,        
        aplcnBgngYmd:params.aplcnBgngYmd ? params.aplcnBgngYmd.replaceAll('-','') : getToday(),
        rgnCd:params.rgnCd ? params.rgnCd + '000' : '',
      };

      const endpoint:string = '/fsm/stn/bno/cm/getAllByegNtfcOilprc' + toQueryParameter(searchObj);
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });

      if (response && response.resultType === 'success' && response.data.content.length != 0) {
        // 데이터 조회 성공시
        setRows(response.data.content);
        setTotalRows(response.data.totalElements);
        setPageable({
          pageNumber:response.data.pageable.pageNumber + 1,
          pageSize:response.data.pageable.pageSize,
          totalPages:response.data.totalPages,
        });
      } else {
        // 데이터가 없거나 실패
        alert(response.message)

        setRows([]);          
        setTotalRows(0);
        setPageable({
          pageNumber:1,
          pageSize:10,
          totalPages:1,
        });
      }
    } catch (error) {
      // 에러시
      
      console.error('Error fetching data:', error)
      setRows([]);
      setTotalRows(0);
      setPageable({
        pageNumber:1,
        pageSize:10,
        totalPages:1,
      });
    } finally {
      setLoading(false)
    }
  }

  //엑셀 다운르도 
  const excelDownload = async () => {

    if(rows.length == 0){
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return;
    }

    if(!excelFlag){
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }
    try{
      setLoadingBackdrop(true)

    const searchObj = {
      ...params,
      aplcnBgngYmd:params.aplcnBgngYmd.replaceAll('-',''),
      rgnCd:params.rgnCd ? params.rgnCd + '000' : '',
    };
    const endpoint:string = '/fsm/stn/bno/cm/getExcelByegNtfcOilprc' + toQueryParameter(searchObj);
    await  getExcelFile(
          endpoint,
          BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
        )
    }catch(error){
      console.error("ERROR :: ", error)
    }finally{
      setLoadingBackdrop(false)
    }
    
  }

  // 조회클릭시
  const handleAdvancedSearch = () => {
    setParams((prev) => ({ ...prev, page:1, size:10 }));
    setFlag(prev => !prev);
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    if(name === 'ctpvCd') return 
  
    setParams((prev) => {
      // 기존 값과 새 값이 다를 경우에만 setExcelFlag(false) 호출
      if (prev[name as keyof listSearchObj] !== value) {
        setExcelFlag(false);
      }
      return { ...prev, page: 1, [name]: value };
    });

  };

  // 페이징 이벤트
  const handlePaginationModelChange = useCallback((page:number, pageSize:number) => {
    setParams((prev) => ({ ...prev, page:page, size:pageSize }));
    setFlag(prev => !prev);
  }, []);

  return (
    <PageContainer title="지역별 고시유가관리" description="지역별 고시유가관리">
      
      {/* breadcrumb */}
      <Breadcrumb title="지역별 고시유가관리" items={BCrumb} />

      {/* 검색영역 시작 */}
      <Box component="form" sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                고시기준일
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                고시기준일 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="aplcnBgngYmd"
                value={params.aplcnBgngYmd}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-rgnCd"
              >
                시도명
              </CustomFormLabel>
              <CtpvSelectAll
                pValue={params.rgnCd}
                pName='rgnCd'
                handleChange={handleSearchChange}
                htmlFor={'sch-rgnCd'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-koiCd"
              >
                유종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="977"
                pValue={params.koiCd}
                handleChange={handleSearchChange}
                pName="koiCd"
                htmlFor={'sch-koiCd'}
                addText="전체"
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button
              onClick={() => handleAdvancedSearch()}
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
          headCells={stnbnoHeadCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          caption={"지역별 고시유가관리 목록 조회"}
        />
      </Box>

    </PageContainer>
  )
}

export default DataList
