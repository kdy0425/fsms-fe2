/* React */
import React, { useCallback, useEffect, useState } from 'react'

/* mui component */
import { Box, Button, Dialog, DialogContent, DialogTitle } from '@mui/material'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'
import { rrNoFormatter } from '@/utils/fsms/common/util'

/* interface 선언 */
interface propsInterface {  
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  procData:any
}

const ShowRrnoModal = (props: propsInterface) => {

  const { open, setOpen, procData } = props

  const [inqRsnCn, setInqRsnCn] = useState<string>('');  
  const [openedData, setOpenedData] = useState<any[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const [rrno, setRrno] = useState<string>('');
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  useEffect(() => {
    if (!open) {
      setShow(false)
    } else {
      const temp = procData.rrno ? procData.rrno : procData.vonrRrnoD
      if(openedData.findIndex(item => item.rrno == temp) != -1) {
        setRrno(temp);
        setShow(true)
      }
    }
  }, [open])

  // 탈락
  const handleShow = async () => {
    
    if (!inqRsnCn) {
      alert('개인정보 조회사유를 선택하세요.')
      return
    }

    setLoadingBackdrop(true)
    
    try {
      
      const tempParamtrInfoCn = {
        vhclNo:procData.vhclNo,
        brno:procData.vhclNo,
        crdcoCd:procData.crdcoCd,
        rcptSeqNo:procData.rcptSeqNo ? procData.rcptSeqNo : procData.rcptSn,
      };

      const endPoint = '/fsm/cad/cijm/cm/saveReasonViewPersonalInfo'
      const body = {
        paramtrInfoCn:toQueryParameter(tempParamtrInfoCn).replace('?',''),
        inqScrnInfoCn:'CardReqComponent',
        inqRsnCn:'유류구매카드 발급심사',
        excelDwnldYn:'N',
        dataNocs:0,
      }

      const response = await sendHttpRequest('POST', endPoint, body, true, { cache: 'no-store' })

      if (response && response.resultType === 'success') {
        alert('완료되었습니다')
        
        const temp = openedData.slice();
        temp.push({rrno:procData.rrno ? procData.rrno : procData.vonrRrnoD});
        setOpenedData(temp);
        setShow(true);
        setRrno(procData.rrno ? procData.rrno : procData.vonrRrnoD);

      } else {
        alert('[발급실패] 관리자에게 문의부탁드립니다')
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'sm'} open={open}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              {!show ? (
                <h2>개인정보 조회사유 입력</h2>
              ) : (
                <h2>개인정보 조회 결과</h2>
              )}              
            </CustomFormLabel>

            {/* 버튼 */}
            <div className=" button-right-align">

              {!show ? (
                <Button variant="contained" color="primary" onClick={handleShow}>
                  저장
                </Button>
              ) : null}
              
              <Button variant="contained" color="dark" onClick={() => setOpen(false)}>
                닫기
              </Button>
            </div>
          </Box>
          
          <div id="alert-dialog-description1">
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>
                  {!show ? (
                    <>개인정보 조회사유 입력</>
                  ) : (
                    <>개인정보 조회 결과</>
                  )}
                  
                </caption>
                <colgroup>
                  <col style={{ width: '25%' }}></col>
                  <col style={{ width: '75%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      {!show ? (
                        <>조회사유선택</>
                      ) : (
                        <>조회 결과</>
                      )}                      
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {!show ? (
                          <>
                            <CustomFormLabel className="input-label-none" htmlFor="sch-inqRsnCn">조회사유선택</CustomFormLabel>
                            <CommSelect
                              cdGroupNm="500"
                              pValue={inqRsnCn}
                              handleChange={(event) => setInqRsnCn(event.target.value)}
                              pName="inqRsnCn"
                              htmlFor={"sch-inqRsnCn"}
                              defaultValue={'1'}
                              pDisabled={true}
                            />
                          </>
                        ) : (
                          <>
                            {rrNoFormatter(rrno)}
                          </>
                        )}                          
                      </div>
                    </td>
                  </tr>                  
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </div>
          {/* 로딩 */}
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ShowRrnoModal
