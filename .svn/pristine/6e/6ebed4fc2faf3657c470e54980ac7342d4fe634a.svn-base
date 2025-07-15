import { sendHttpRequest } from "../apiUtils";

export const getCityCodes = async (ctpvCd?: string) => { // 시도 조회
  try {
    let endpoint: string = `/fsm/cmm/cmmn/cm/getAllLocgovCd?locgovSeCd=0` 
                          + `${ctpvCd ? '&ctpvCd=' + ctpvCd : ''}`
                          +'&page=1&size=2000';

    const response = await sendHttpRequest('GET', endpoint, null, false);

    if (response && response.resultType === 'success' && response.data) {
      return response.data.content;
    }
  }catch(error) {
    console.error('Error get City Code data:', error);
  }
}

export const getLocalGovCodes = async (ctpvCd?: string | number, locgovCd?: string) => { // 관할관청 코드 조회
  try {
    let endpoint: string = `/fsm/cmm/cmmn/cm/getAllLocgovCd?locgovSeCd=1` 
                          + `${ctpvCd ? '&ctpvCd=' + ctpvCd : ''}`
                          + `${locgovCd ? '&locgovCd=' + locgovCd : ''}`
                          +'&page=1&size=2000';

    const response = await sendHttpRequest('GET', endpoint, null, false);

    if (response && response.resultType === 'success' && response.data) {
      return response.data.content;
    }
  }catch(error) {
    console.error('Error get Local Gov Code data:', error);
  }
} 

export const getCodesByGroupNm = async (cdGroupNm: string) => {
  try {
    let endpoint: string = `/fsm/cmm/cmmn/cm/getAllCmmnCd?cdGroupNm=${cdGroupNm}&page=1&size=2000`

    const response = await sendHttpRequest('GET', endpoint, null, false);

    if (response && response.resultType === 'success' && response.data) {
      return response.data;
    }

  }catch(error) {
    console.error('Error get Code Group Data: ', error);
  }
}

