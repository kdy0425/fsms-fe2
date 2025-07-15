import React from 'react';

import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow
} from '@mui/material';
// MUI 그리드 한글화 import
import BlankCard from '@/app/components/shared/BlankCard';
import { brNoFormatter, getDateTimeString } from '../../../../../utils/fsms/common/util';
import { Row } from '../page';
import { getDateYYYYMMDD } from '@/utils/fsms/common/comm';
import {
  getCommaNumber,
} from '@/utils/fsms/common/util'

interface DetailDataGridProps {
  selectedRow:Row|null // row 속성을 선택적 속성으로 변경
}

const DetailDataGrid = (props:DetailDataGridProps) => {
  
  const { selectedRow } = props;
  
  return (
    <Grid container spacing={2} className="card-container">
    <Grid item xs={12} sm={12} md={12}>
      <BlankCard className="contents-card" title="상세 정보">
        <>
          {/* 테이블영역 시작 */}
          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>상세 내용 시작</caption>
              <colgroup>
                <col style={{ width: '13%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '20%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <th className="td-head" scope="row">
                    열람일자
                  </th>
                  <td>
                    {selectedRow?.inqYmd ? getDateYYYYMMDD(selectedRow?.inqYmd) : ''}
                  </td>
                  <th className="td-head" scope="row">
                    메뉴명
                  </th>
                  <td colSpan={3}>
                    {selectedRow?.menuNm}
                  </td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    조회건수
                  </th>
                  <td>
                    {getCommaNumber(selectedRow?.inqNocs ?? 0)}
                  </td>
                  <th className="td-head" scope="row">
                    개인정보유형
                  </th>
                  <td colSpan={3}>
                    {selectedRow?.inclNm}
                  </td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    관할관청
                  </th>
                  <td>
                    {selectedRow?.locgovNm}
                  </td>
                  <th className="td-head" scope="row">
                    담당자명
                  </th>
                  <td colSpan={3}>
                    {selectedRow?.userNm}
                  </td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    열람목적
                  </th>
                  <td>
                    {selectedRow?.inqRsnNm}
                  </td>
                  <th className="td-head" scope="row">
                    변경ID
                  </th>
                  <td>
                    {selectedRow?.mdfrId}
                  </td>
                  <th className="td-head" scope="row">
                    변경일자
                  </th>
                  <td>
                  {selectedRow?.mdfcnDt ? getDateYYYYMMDD(selectedRow?.mdfcnDt) : ''}
                  </td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    확인여부
                  </th>
                  <td>
                    {selectedRow?.actnNm}
                  </td>
                  <th className="td-head" scope="row">
                    조치결과
                  </th>
                  <td colSpan={3}>
                    {selectedRow?.actnRsltCn}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* 테이블영역 끝 */}
        </>
      </BlankCard>
    </Grid>
  </Grid>
    
  );
};

export default DetailDataGrid;
