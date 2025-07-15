import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { getUserInfo, toQueryParameter } from '@/utils/fsms/utils';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import React, { useEffect, useState } from 'react';
import { SelectItem } from 'select';
import { Row } from '../page';
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
/* 공통 js */
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
interface formDataInterface {
  excelSn:string,
  actnRsltCn:string
}

interface ReqItem {
  crdcoCd: string,
  crdcoNm: string,
  frcsNo: string,
  sttsCd: string,
  sttsNm: string
} 

interface ModalProps {
  open:boolean,
  setOpen:React.Dispatch<React.SetStateAction<boolean>>
  row:Row|null,
  handleAdvancedSearch:() => void,
}

const RegisterModalForm = (props:ModalProps) => {
  
  const { open, setOpen, row, handleAdvancedSearch } = props;

  const userInfo = getUserInfo();
  const [formData, setFormData] = useState<formDataInterface>({ excelSn:'',actnRsltCn:''});
  const [reqList, setReqList] = useState<ReqItem[]>([]); // 처리데이터(다건)
  const [actnRsltCn, setActnRsltCn] = useState<string>('')
  
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 모달창 오픈시 로직처리
  useEffect(() => {
    if(open) {      
      settingFormData();      
    }
  }, [open]);


  const settingFormData = () => {    
    setFormData({
      excelSn:row?.excelSn ?? '',
      actnRsltCn : row?.actnRsltCn ?? ''
    });
  };

   const handleDataChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;    
    setFormData((prev: any) => ({ ...prev, [name]:value }));
   };

  
  const sendData = async () => {
    if(actnRsltCn.length==0) {
      alert("조치결과를 입력해 주세요")
      return;
    }
      
      if(confirm('조치결과를 입력하시겠습니까?')) {

        try {
          setLoadingBackdrop(true);

            const endpoint: string = `/fsm/sup/iidm/cm/updateConfirmIndvInfoDownloadMng`;
            const body = {
              excelSn: formData.excelSn,
              actnRsltCn : actnRsltCn,
              confirmCd : "C"
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

  return (
    <React.Fragment>
      <Dialog fullWidth={true} maxWidth={'sm'} open={open}>
                <DialogContent>
                  <Box className="table-bottom-button-group">
                    <CustomFormLabel className="input-label-display">
                      <h2>조치결과</h2>
                    </CustomFormLabel>
                    <div className=" button-right-align">
                      <Button variant="contained" color="primary" onClick={sendData}>
                        저장
                      </Button>
                      <Button
                        variant="contained"
                        color="dark"
                        onClick={() => setOpen(false)}
                      >
                        닫기
                      </Button>
                    </div>
                  </Box>
                  {/* 모달팝업 내용 시작 */}
                  <div id="alert-dialog-description1">
                    {/* 테이블영역 시작 */}
                    <div className="table-scrollable">
                      <table className="table table-bordered">
                        <caption>조치결과</caption>
                        <colgroup>
                          <col style={{ width: '25%' }}></col>
                          <col style={{ width: '75%' }}></col>
                        </colgroup>
                        <tbody>
                          <tr>
                            <th className="td-head" scope="row">
                              조치결과
                            </th>
                            <td>
                              <CustomFormLabel
                                className="input-label-none"
                                htmlFor="fr-flRsnCn"
                              >
                                조치결과
                              </CustomFormLabel>
                              <textarea
                                className="MuiTextArea-custom"
                                id="actnRsltCn"
                                name="actnRsltCn"
                                // multiline
                                rows={6}
                                // fullWidth
                                onChange={(
                                  event: React.ChangeEvent<
                                    | HTMLInputElement
                                    | HTMLSelectElement
                                    | HTMLTextAreaElement
                                  >,
                                ) => setActnRsltCn(event.target.value)}
                                value={actnRsltCn}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {/* 테이블영역 끝 */}
                  </div>
                  {/* 모달팝업 내용 끝 */}
                </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

export default RegisterModalForm;