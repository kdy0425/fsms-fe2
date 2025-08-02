'use client'

/* React */
import React, { useState } from 'react'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'

import SearchRadioModal from './ReportModal/ReportModal'

const DataList = () => {
    const [openModal, setOpenModal] = useState<boolean>(false)
    return (
        <PageContainer title="보고서 생성" description="보고서 생성">
            <button onClick={() => setOpenModal(true)}>보고서 생성 팝업 열기</button>

            <SearchRadioModal
                      isOpen={openModal}
                      setClose={() => setOpenModal(false)}
                    />
        </PageContainer>
    )
}

export default DataList
