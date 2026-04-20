'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import React from 'react';
import { Table, TableRow, TableCell } from '@/components/ui/table';

type ReportData = {
  Header: any;
  Columns: { Column: any[] };
  Rows: { Row: any[] };
  error?: string;
};

const ReportRow = ({ row, level = 0, columnsCount }: { row: any; level?: number; columnsCount: number }) => {
  const isHeader = !!row.Header;
  const isSummary = !!row.Summary;
  let content;
  let subRows;

  if (isHeader) {
    content = row.Header.ColData;
    subRows = row.Rows?.Row ? (Array.isArray(row.Rows.Row) ? row.Rows.Row : [row.Rows.Row]) : [];
  } else if (isSummary) {
    content = row.Summary.ColData;
  } else {
    content = row.ColData;
    subRows = row.Rows?.Row ? (Array.isArray(row.Rows.Row) ? row.Rows.Row : [row.Rows.Row]) : [];
  }

  const displayContent = Array.isArray(content) ? content : [content];
  
  const paddedContent = [
    ...displayContent,
    ...Array(Math.max(0, columnsCount - displayContent.length)).fill({ value: '' })
  ];

  return (
    <>
      <TableRow className={cn(isHeader && "bg-muted/60", isSummary && "bg-muted/80", !isHeader && !isSummary && "hover:bg-muted/40")}>
        {paddedContent.map((col: any, index: number) => (
          <TableCell
            key={index}
            className={cn(
              "p-2 whitespace-nowrap border-r last:border-r-0",
              (isHeader || isSummary) && "font-bold",
              index > 0 && "text-right font-mono"
            )}
            style={{ paddingLeft: index === 0 ? `${0.75 + level * 1.25}rem` : '0.5rem' }}
          >
            {col?.value}
          </TableCell>
        ))}
      </TableRow>
      {subRows?.map((subRow, i) => (
        <ReportRow key={i} row={subRow} level={level + 1} columnsCount={columnsCount} />
      ))}
    </>
  );
};


const ReportTable = ({ data }: { data: ReportData }) => {
  if (data.error) {
    return (
        <div className="h-full rounded-lg border flex items-center justify-center p-6">
            <p className="text-destructive text-center">Could not load report: {data.error}</p>
        </div>
    )
  }
    
  if (!data || !data.Columns?.Column || !data.Rows?.Row) {
      return (
          <div className="h-full rounded-lg border flex items-center justify-center p-6">
              <p>No data available for this report.</p>
          </div>
      )
  }
  
  const columns = Array.isArray(data.Columns.Column) ? data.Columns.Column : [data.Columns.Column];
  const rows = Array.isArray(data.Rows.Row) ? data.Rows.Row : [data.Rows.Row];

  return (
     <div className="h-full overflow-auto rounded-lg border">
      <Table className="min-w-max text-sm">
        <thead className="sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <TableRow className="hover:bg-transparent">
            {columns.map((col: any) => (
              <th key={col.ColTitle} className="p-2 border-b text-left font-semibold whitespace-nowrap border-r last:border-r-0">
                {col.ColTitle}
              </th>
            ))}
          </TableRow>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <ReportRow key={index} row={row} columnsCount={columns.length} />
          ))}
        </tbody>
      </Table>
    </div>
  );
};


export function ClientDashboard({ data }: { data: { pnl: ReportData; balance: ReportData; cashflow: ReportData } }) {
  return (
    <Tabs defaultValue="pnl" className="w-full h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pnl">Profit and Loss</TabsTrigger>
        <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
        <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
      </TabsList>
      <TabsContent value="pnl" className="flex-1 min-h-0 pt-6">
        <ReportTable data={data.pnl} />
      </TabsContent>
      <TabsContent value="balance" className="flex-1 min-h-0 pt-6">
        <ReportTable data={data.balance} />
      </TabsContent>
      <TabsContent value="cashflow" className="flex-1 min-h-0 pt-6">
        <ReportTable data={data.cashflow} />
      </TabsContent>
    </Tabs>
  );
}
