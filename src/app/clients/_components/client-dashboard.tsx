'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import React from 'react';

type ReportData = {
  Header: any;
  Columns: { Column: any[] };
  Rows: { Row: any[] };
  error?: string;
};

const ReportRow = ({ row, level = 0 }: { row: any; level?: number }) => {
  const isHeader = !!row.Header;
  const isSummary = !!row.Summary;
  let content;
  let subRows;

  if (isHeader) {
    content = row.Header.ColData;
    // QuickBooks API can return a single object or an array for sub-rows
    subRows = row.Rows?.Row ? (Array.isArray(row.Rows.Row) ? row.Rows.Row : [row.Rows.Row]) : [];
  } else if (isSummary) {
    content = row.Summary.ColData;
  } else {
    content = row.ColData;
    subRows = row.Rows?.Row ? (Array.isArray(row.Rows.Row) ? row.Rows.Row : [row.Rows.Row]) : [];
  }
  
  // Ensure content is always an array for consistent mapping
  const displayContent = Array.isArray(content) ? content : [content];

  return (
    <>
      <TableRow className={cn((isHeader || isSummary) && 'bg-muted/50')}>
        {displayContent?.map((col: any, index: number) => (
          <TableCell
            key={index}
            className={cn(
              (isHeader || isSummary) && 'font-bold',
              'whitespace-nowrap'
            )}
            style={{ paddingLeft: index === 0 ? `${1 + level * 1.5}rem` : undefined }}
          >
            {col?.value}
          </TableCell>
        ))}
      </TableRow>
      {subRows?.map((subRow, i) => (
        <ReportRow key={i} row={subRow} level={level + 1} />
      ))}
    </>
  );
};


const ReportTable = ({ data }: { data: ReportData }) => {
  if (data.error) {
    return (
        <Card>
            <CardContent className="p-6">
                <p className="text-destructive">Could not load report: {data.error}</p>
            </CardContent>
        </Card>
    )
  }
    
  if (!data || !data.Columns?.Column || !data.Rows?.Row) {
      return (
          <Card>
              <CardContent className="p-6">
                  <p>No data available for this report.</p>
              </CardContent>
          </Card>
      )
  }
  
  const columns = Array.isArray(data.Columns.Column) ? data.Columns.Column : [data.Columns.Column];
  const rows = Array.isArray(data.Rows.Row) ? data.Rows.Row : [data.Rows.Row];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="relative overflow-x-auto">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
            <TableHeader>
                <TableRow>
                {columns.map((col: any) => (
                    <TableHead key={col.ColTitle} className="whitespace-nowrap">{col.ColTitle}</TableHead>
                ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row, index) => (
                    <ReportRow key={index} row={row} />
                ))}
            </TableBody>
            </Table>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};


export function ClientDashboard({ data }: { data: { pnl: ReportData; balance: ReportData; cashflow: ReportData } }) {
  return (
    <Tabs defaultValue="pnl" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pnl">Profit and Loss</TabsTrigger>
        <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
        <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
      </TabsList>
      <TabsContent value="pnl" className="pt-6">
        <ReportTable data={data.pnl} />
      </TabsContent>
      <TabsContent value="balance" className="pt-6">
        <ReportTable data={data.balance} />
      </TabsContent>
      <TabsContent value="cashflow" className="pt-6">
        <ReportTable data={data.cashflow} />
      </TabsContent>
    </Tabs>
  );
}
