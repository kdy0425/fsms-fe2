'use client'

/* React */
import React, { useState } from 'react'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'

import SearchRadioModal from './ReportModal/ReportModal'
import SubsidyModal from './SubsidyModal/SubsidyModal'

const DataList = () => {
    const [openReportModal, setOpenReportModal] = useState<boolean>(false)
    const [openOilModal, setOpenOilModal] = useState<boolean>(false)
    return (
        <PageContainer title="보고서 생성" description="보고서 생성">
            <button onClick={() => setOpenReportModal(true)}>보고서 생성 팝업 열기</button>

            <SearchRadioModal
                isOpen={openReportModal}
                setClose={() => setOpenReportModal(false)}
            />


            <br/> 


            <button onClick={() => setOpenOilModal(true)}>유가보조금 지급현황 팝업 열기</button>

            <SubsidyModal
                isOpen={openOilModal}
                setClose={() => setOpenOilModal(false)}
            />

        </PageContainer>
    )
}

export default DataList
