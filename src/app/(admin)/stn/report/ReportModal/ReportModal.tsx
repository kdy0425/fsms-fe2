'use client'

import { CustomFormLabel, CustomRadio } from '@/utils/fsms/fsm/mui-imports'
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  FormControlLabel,
  RadioGroup,
  DialogProps,
  Grid,
  FormGroup
} from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField';
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'

interface FormModalProps {
  size?: DialogProps['maxWidth'] | 'lg'
  isOpen: boolean
  setClose: () => void
}

export default function SearchRadioModal(props: FormModalProps) {
  const { size, isOpen, setClose } = props
  const [reportName, setReportName] = useState('년도별 화물차 톤수 유가보조금 지급액');
  const handleClose = () => {
    setClose()
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        open={isOpen}
        maxWidth={size || 'md'}
        onClose={handleClose}
      >
        <DialogContent
        style={{ width: 800 }}
            >
            <Box className="table-bottom-button-group">
                <CustomFormLabel className="input-label-display">
                <h2>보고서 생성</h2>
                </CustomFormLabel>
                <div className="button-right-align">
                <Button variant="contained" color="dark" onClick={handleClose}>
                    닫기
                </Button>
                </div>
            </Box>
            <Box
                sx={{
                border: '1px solid #D2D8DD',
                borderRadius: '8px',
                padding: '20px',
                marginTop: '8px',
                }}
            >
                <table className="table">
                    <colgroup>
                        <col style={{ width: '130px' }} />
                        <col/>
                    </colgroup>
                    <tbody>
                        <tr>
                            <th style={{ textAlign: 'left', padding:'8px 0' }}>
                                <CustomFormLabel className="input-label-display" htmlFor="input-01"><strong>보고서명</strong></CustomFormLabel>
                            </th>
                            <td style={{ padding:'8px 0' }}>
                                <CustomTextField
                                    type="text"
                                    id="input-01"
                                    fullWidth
                                    value={reportName}
                                    onChange={(e) => setReportName(e.target.value)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <th style={{ textAlign: 'left', padding:'8px 0' }}>
                                <CustomFormLabel className="input-label-display"><strong>분류 코드 선택</strong></CustomFormLabel>
                            </th>
                            <td style={{ padding:'8px 0' }}>
                                <FormGroup row sx={{ gap: '2px 14px', background: '#F7F9FA', padding: '9px 14px', borderRadius: '8px' }}>
                                {[
                                    '화물',
                                    '화물 톤별',
                                    '화물 유종별',
                                    '택시',
                                    '사업자구분',
                                    '유종별',
                                    '버스',
                                    '면허업종별',
                                    '전체(화물, 택시, 버스)',
                                    '카드사청구',
                                    '서면청구',
                                    '카드사+서면청구',
                                ].map((label) => (
                                    <FormControlLabel
                                    key={label}
                                    control={<CustomCheckbox />}
                                    label={label}
                                    style={{ color: '#555' }}
                                    />
                                ))}
                                </FormGroup>
                            </td>
                        </tr>
                        <tr>
                            <th style={{ textAlign: 'left', padding:'8px 0' }}>
                                <CustomFormLabel className="input-label-display"><strong>집계 값 선택</strong></CustomFormLabel>
                            </th>
                            <td style={{ padding:'8px 0' }}>
                                <FormGroup row sx={{ gap: '2px 14px', background: '#F7F9FA', padding: '9px 14px', borderRadius: '8px' }}>
                                {[
                                    '지급액',
                                    '지급대수',
                                    '보조리터',
                                    '전체',
                                ].map((label) => (
                                    <FormControlLabel
                                    key={label}
                                    control={<CustomCheckbox />}
                                    label={label}
                                    style={{ color: '#555' }}
                                    />
                                ))}
                                </FormGroup>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <DialogActions style={{ padding: '0', marginTop: '12px'}}>
                <Button variant="contained" color="primary">분류기준 선택</Button>
                {/* <Button variant="contained" color="dark">취소</Button> */}
                </DialogActions>
            </Box>

            <Box
                sx={{
                marginTop: '20px',
                }}
            >
                <CustomFormLabel className="input-label-display" style={{ marginLeft: 0 }}><strong>분류기준</strong></CustomFormLabel>
                <FormGroup row sx={{ gap: '8px', background: '#F7F9FA', padding: '12px', borderRadius: '8px' }}>
                    {[
                    '화물 톤별',
                    '화물 유종별',
                    '화물',
                    '화물 유종별',
                    '화물 톤별',
                    '화물 유종별',
                    '화물',
                    '화물 유종별',
                    '화물 톤별',
                    '화물 유종별',
                    '화물',
                    '화물 유종별',
                    '화물 톤별',
                    '화물 유종별',
                    '화물',
                    '화물 유종별',
                    ].map((label) => (
                        <button
                            type="button"
                            key={label}
                            className="dropdown-button"
                        >
                            {label}
                        </button>
                    ))}
                </FormGroup>
            </Box>
            
            <Box
                sx={{
                    mt: 2,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                }}
            >
                <Box
                    sx={{ display: 'flex', flexDirection: 'column'}}
                >
                    <CustomFormLabel className="input-label-display" style={{ marginLeft: 0 }}><strong>행</strong></CustomFormLabel>
                    <FormGroup row sx={{ gap: '8px', background: '#F7F9FA', padding: '12px', borderRadius: '8px', flex: '1 1 auto', alignContent: 'start' }}>
                        {[
                        '화물 톤별',
                        '화물 유종별',
                        '화물',
                        '화물 유종별',
                        '화물',
                        '화물 유종별',
                        '화물',
                        '화물',
                        '화물 유종별',
                        ].map((label) => (
                            <button
                                type="button"
                                key={label}
                                className="dropdown-button"
                            >
                                {label}
                            </button>
                        ))}
                    </FormGroup>
                </Box>
                <Box
                    sx={{ display: 'flex', flexDirection: 'column'}}
                >
                    <CustomFormLabel className="input-label-display" style={{ marginLeft: 0 }}><strong>열</strong></CustomFormLabel>
                    <FormGroup row sx={{ gap: '8px', background: '#F7F9FA', padding: '12px', borderRadius: '8px' }}>
                        {[
                        '화물 톤별',
                        '화물 유종별',
                        '화물',
                        '화물 유종별',
                        '화물 유종별',
                        '화물 톤별',
                        '화물',
                        '화물 유종별',
                        '화물 유종별',
                        '화물 톤별', '화물',
                        '화물 유종별',
                        '화물 유종별',
                        '화물 톤별',
                        '화물 유종별',
                        ].map((label) => (
                            <button
                                type="button"
                                key={label}
                                className="dropdown-button"
                            >
                                {label}
                            </button>
                        ))}
                    </FormGroup>
                </Box>
            </Box>

            <DialogActions style={{ padding: '0', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #D2D8DD' }}>
                <Button variant="contained" color="dark">미리보기</Button>
                <Button variant="contained" color="primary">보고서생성</Button>
            </DialogActions>
        
        </DialogContent>
      </Dialog>
    </Box>
  )
}
