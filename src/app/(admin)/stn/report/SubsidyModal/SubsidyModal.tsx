'use client'

import { CustomFormLabel, CustomRadio } from '@/utils/fsms/fsm/mui-imports'

import { IconX } from '@tabler/icons-react';
import {
  Button,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  FormControlLabel,
  IconButton,
  DialogProps,
  Grid,
  FormGroup,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField';
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { HeadCell } from 'table';
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  ResponsiveContainer,
  BarChart, Bar,
  XAxis, YAxis,
  Tooltip, Legend,
  CartesianGrid,
} from 'recharts'

const rows = [
  { month: '2025-01', truck: 12000, bus: 3500, taxi: 5100 ,aaa: 5100 ,bbb: 5100 ,ccc: 5100 },
  { month: '2025-02', truck: 12000, bus: 3600, taxi: 5200 ,aaa: 5100 ,bbb: 5100 ,ccc: 5100  },
  { month: '2025-03', truck: 12000, bus: 3400, taxi: 5300 ,aaa: 5100 ,bbb: 5100 ,ccc: 5100  },
  { month: '2025-04', truck: 12000, bus: 3700, taxi: 4900 ,aaa: 5100 ,bbb: 5100 ,ccc: 5100  },
  { month: '2025-05', truck: 12000, bus: 3550, taxi: 5000 ,aaa: 5100 ,bbb: 5100 ,ccc: 5100  },
  { month: '2025-06', truck: 12000, bus: 3600, taxi: 5150 ,aaa: 5100 ,bbb: 5100 ,ccc: 5100  },
  { month: '2025-07', truck: 12000, bus: 3650, taxi: 5250 ,aaa: 5100 ,bbb: 5100 ,ccc: 5100  },
];

const chartData = rows.map(r => ({
  month: r.month,
  truck: Number(r.truck),
  bus:   Number(r.bus),
  taxi:  Number(r.taxi),
  aaa:  Number(r.aaa),
  bbb:  Number(r.bbb),
  ccc:  Number(r.ccc),
}));
const headCells: HeadCell[] = [
  { id: 'month', numeric: false, disablePadding: false, label: '월',   style: { width: '25%' } },
  { id: 'truck', numeric: false, disablePadding: false, label: '화물', style: { width: '25%' } },
  { id: 'bus',   numeric: false, disablePadding: false, label: '버스', style: { width: '25%' } },
  { id: 'taxi',  numeric: false, disablePadding: false, label: '택시', style: { width: '25%' } },
];

interface FormModalProps {
  size?: DialogProps['maxWidth'] | 'lg'
  isOpen: boolean
  setClose: () => void
}



export default function SubsidyModal(props: FormModalProps) {
  const { size, isOpen, setClose } = props
  const handleClose = () => {
    setClose()
  }

  return (
    <>
    <style jsx global>{`
        @media print {
            body * { visibility: hidden !important; }
            .print_area{overflow: visible !important;}
            .print_area, .print_area * {
                visibility: visible !important;
            }
            .page-title-4depth, .sch-filter-box, .data-grid-wrapper .MuiTableHead-root .MuiTableRow-root .MuiTableCell-root{
            -webkit-print-color-adjust:exact;
            }
            @page {
                size: A4;
                margin: 12mm;
            }
        }
    `}</style>
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
            <div className="data-grid-top-toolbar">
                <div className="button-align">
                    <Button
                    variant="contained"
                    color="dark"
                    onClick={() => window.print()}  // ← 추가
                    >
                    출력
                    </Button>
                    <Button 
                        variant="contained"
                        sx={{ backgroundColor: '#007F68', '&:hover': { backgroundColor: '#006b58' } }}
                    >
                        엑셀
                    </Button>
                </div>
                <IconButton
                    className="custom-modal-close"
                    color="inherit"
                    sx={{
                        color: '#000',
                    }}
                    onClick={handleClose}
                    >
                    <IconX size="2rem" />
                </IconButton>
            </div>

            <div className="popup_inner_scroll print_area">
                <h2
                style={{ marginTop: 0 }} 
                >유가보조금 지급현황</h2>
                <Box className="sch-filter-box sm">
                    <div className="filter-form">
                        <div className="form-group">
                            <CustomFormLabel className="input-label-display normal">
                                기간 :
                            </CustomFormLabel>
                            <strong>2021년 ~ 2025년</strong>
                        </div>
                        <div className="form-group">
                            <CustomFormLabel className="input-label-display normal">
                                관할관청 :
                            </CustomFormLabel>
                            <strong>서울특별시</strong>
                        </div>
                    </div>
                </Box>

                <Box style={{ marginTop: 20 }}>
                    <TableDataGrid
                        headCells={headCells}
                        rows={rows}
                        loading={false}
                    />
                </Box>

                <Box style={{ marginTop: 40 }}>
                    <div className="page-title-4depth">
                        <b>월별 유가보조금 지급 현황 (화물/버스/택시)</b>
                    </div>
                    
                    <div className="bar_chart_area" style={{ width: '100%', height: 360 }}>
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barGap={8} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }}/>
                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v.toLocaleString()} />
                            <Bar dataKey="truck" name="화물" fill="#31C09C" />
                            <Bar dataKey="bus"   name="버스" fill="#FE7E56" />
                            <Bar dataKey="taxi"  name="택시" fill="#5F8EE2" />
                            <Bar dataKey="aaa"  name="aaa" fill="#fbb3fd" />
                            <Bar dataKey="bbb"  name="bbb" fill="#9577d7" />
                            <Bar dataKey="ccc"  name="ccc" fill="#e471b8" />
                        </BarChart>
                        </ResponsiveContainer>
                        <div className="legends">
                            <div><span className='color' style={{ border: "6px solid #31C09C" }}></span> 화물</div>
                            <div><span className='color' style={{ border: "6px solid #FE7E56" }}></span> 버스</div>
                            <div><span className='color' style={{ border: "6px solid #5F8EE2" }}></span> 택시</div>
                            <div><span className='color' style={{ border: "6px solid #fbb3fd" }}></span> aaa</div>
                            <div><span className='color' style={{ border: "6px solid #9577d7" }}></span> bbb</div>
                            <div><span className='color' style={{ border: "6px solid #e471b8" }}></span> ccc</div>
                        </div>
                    </div>
                </Box>
            </div>

        </DialogContent>
      </Dialog>
    </Box>
    </>
  )
}
