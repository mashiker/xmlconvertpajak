'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useConverterStore } from '@/lib/store';
import { validateData } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2,
  XCircle, Filter, AlertCircle,
} from 'lucide-react';
import type { ValidationError } from '@/lib/store';

export function ValidationEditor() {
  const selectedTemplate = useConverterStore((s) => s.selectedTemplate);
  const parsedData = useConverterStore((s) => s.parsedData);
  const columnMapping = useConverterStore((s) => s.columnMapping);
  const headerMapping = useConverterStore((s) => s.headerMapping);
  const lawanTransaksi = useConverterStore((s) => s.lawanTransaksi);
  const validationErrors = useConverterStore((s) => s.validationErrors);
  const setValidationErrors = useConverterStore((s) => s.setValidationErrors);
  const showOnlyErrors = useConverterStore((s) => s.showOnlyErrors);
  const setShowOnlyErrors = useConverterStore((s) => s.setShowOnlyErrors);
  const editedData = useConverterStore((s) => s.editedData);
  const setEditedData = useConverterStore((s) => s.setEditedData);
  const updateCellData = useConverterStore((s) => s.updateCellData);
  const nextStep = useConverterStore((s) => s.nextStep);
  const prevStep = useConverterStore((s) => s.prevStep);

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const runValidation = useCallback(() => {
    if (!selectedTemplate || !parsedData) return;
    const errors = validateData(selectedTemplate, parsedData, columnMapping, headerMapping, lawanTransaksi);
    setValidationErrors(errors);
  }, [selectedTemplate, parsedData, columnMapping, headerMapping, lawanTransaksi, setValidationErrors]);

  useEffect(() => {
    runValidation();
  }, [runValidation]);

  useEffect(() => {
    if (parsedData && editedData.length === 0) {
      setEditedData(parsedData.rows);
    }
  }, [parsedData, editedData.length, setEditedData]);

  const handleCellEdit = useCallback((rowIndex: number, sourceCol: string, value: string) => {
    const mapping = columnMapping.find((m) => m.sourceColumn === sourceCol);
    if (!mapping || mapping.targetField === '__none__') return;
    updateCellData(rowIndex, sourceCol, value);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(runValidation, 500);
    setDebounceTimer(timer);
  }, [columnMapping, updateCellData, runValidation, debounceTimer]);

  const errorCount = useMemo(() => validationErrors.filter((e) => e.severity === 'error').length, [validationErrors]);
  const warningCount = useMemo(() => validationErrors.filter((e) => e.severity === 'warning').length, [validationErrors]);
  const validCount = useMemo(() => {
    if (!parsedData) return 0;
    return parsedData.rows.length - new Set(
      validationErrors.filter((e) => e.severity === 'error' && e.row >= 0).map((e) => e.row)
    ).size;
  }, [parsedData, validationErrors]);

  const errorMap = useMemo(() => {
    const map = new Map<string, ValidationError[]>();
    for (const err of validationErrors) {
      if (err.row < 0) continue;
      const key = `${err.row}-${err.field}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(err);
    }
    return map;
  }, [validationErrors]);

  const rowsWithError = useMemo(() => {
    const rows = new Set<number>();
    for (const err of validationErrors) {
      if (err.row >= 0) rows.add(err.row);
    }
    return rows;
  }, [validationErrors]);

  const displayRows = useMemo(() => {
    if (!editedData.length) return [];
    if (showOnlyErrors) {
      return editedData.map((row, i) => ({ row, index: i })).filter(({ index }) => rowsWithError.has(index));
    }
    return editedData.map((row, i) => ({ row, index: i }));
  }, [editedData, showOnlyErrors, rowsWithError]);

  const detailFields = useMemo(
    () => selectedTemplate?.detailFields || [],
    [selectedTemplate]
  );

  const mappedColumns = useMemo(() => {
    return columnMapping.filter((m) => m.targetField !== '__none__');
  }, [columnMapping]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl lg:text-4xl font-extrabold gradient-text">Validasi & Edit</h2>
        <p className="text-slate-400 text-sm">
          Periksa dan perbaiki data sebelum konversi ke XML
        </p>
      </div>

      {/* Stat cards */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="rounded-xl px-5 py-3 border-2 border-rose-500/20 bg-rose-500/5 flex items-center gap-3"
        >
          <XCircle className="w-6 h-6 text-rose-400" />
          <div>
            <p className="text-xl font-bold text-rose-400">{errorCount}</p>
            <p className="text-[10px] text-rose-400/60 uppercase tracking-wider">Error</p>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="rounded-xl px-5 py-3 border-2 border-amber-500/20 bg-amber-500/5 flex items-center gap-3"
        >
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          <div>
            <p className="text-xl font-bold text-amber-400">{warningCount}</p>
            <p className="text-[10px] text-amber-400/60 uppercase tracking-wider">Peringatan</p>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="rounded-xl px-5 py-3 border-2 border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3"
        >
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <div>
            <p className="text-xl font-bold text-emerald-400">{validCount}</p>
            <p className="text-[10px] text-emerald-400/60 uppercase tracking-wider">Valid</p>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Switch
            id="error-filter"
            checked={showOnlyErrors}
            onCheckedChange={setShowOnlyErrors}
            className="data-[state=checked]:bg-emerald-500"
          />
          <Label htmlFor="error-filter" className="text-sm flex items-center gap-1.5 cursor-pointer text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            Tampilkan hanya error
          </Label>
        </div>
        <Button variant="ghost" size="sm" onClick={runValidation} className="gap-1.5 text-slate-400 hover:text-emerald-400">
          <AlertCircle className="w-3.5 h-3.5" />
          Validasi Ulang
        </Button>
      </div>

      {/* Data Grid */}
      <TooltipProvider delayDuration={200}>
        <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
          <ScrollArea className="max-h-[500px]">
            <Table className="dark-table">
              <TableHeader>
                <TableRow className="sticky top-0 z-10">
                  <TableHead className="w-12 text-center">#</TableHead>
                  {mappedColumns.map((m) => {
                    const field = detailFields.find((f) => f.name === m.targetField);
                    return (
                      <TableHead key={m.sourceColumn} className="min-w-[140px]">
                        <div className="flex items-center gap-1">
                          {field?.required && <span className="text-rose-400">*</span>}
                          {field?.label || m.sourceColumn}
                        </div>
                        <div className="text-[10px] text-slate-600 font-normal normal-case mt-0.5">{m.sourceColumn}</div>
                      </TableHead>
                    );
                  })}
                  <TableHead className="w-10">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.map(({ row, index }) => {
                  const rowErrors = validationErrors.filter((e) => e.row === index);
                  const hasRowError = rowErrors.some((e) => e.severity === 'error');
                  const hasRowWarning = rowErrors.some((e) => e.severity === 'warning');

                  return (
                    <TableRow key={index} className={hasRowError ? 'bg-rose-500/[0.03]' : ''}>
                      <TableCell className="text-center text-xs text-slate-500 font-mono">
                        {index + 1}
                      </TableCell>
                      {mappedColumns.map((m) => {
                        const field = detailFields.find((f) => f.name === m.targetField);
                        const cellErrors = errorMap.get(`${index}-${field?.name}`) || [];
                        const hasCellError = cellErrors.some((e) => e.severity === 'error');

                        return (
                          <TableCell key={m.sourceColumn} className="p-1.5">
                            {hasCellError ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Input
                                      defaultValue={row[m.sourceColumn] || ''}
                                      onChange={(e) => handleCellEdit(index, m.sourceColumn, e.target.value)}
                                      className="h-7 text-xs font-mono bg-rose-500/[0.06] border-rose-500/30 text-slate-300 focus:bg-rose-500/[0.1] rounded-lg"
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="bg-[#1a2b23] border-white/[0.1] max-w-xs">
                                  <div className="space-y-1">
                                    {cellErrors.map((ce, ci) => (
                                      <p key={ci} className="text-xs text-rose-300">{ce.message}</p>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Input
                                defaultValue={row[m.sourceColumn] || ''}
                                onChange={(e) => handleCellEdit(index, m.sourceColumn, e.target.value)}
                                className="h-7 text-xs font-mono bg-white/[0.02] border-white/[0.06] text-slate-400 focus:border-emerald-500/30 rounded-lg"
                              />
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="p-1.5 text-center">
                        {hasRowError ? (
                          <XCircle className="w-4 h-4 text-rose-400 mx-auto" />
                        ) : hasRowWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </TooltipProvider>

      {/* Header errors */}
      {validationErrors.some((e) => e.row < 0) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Peringatan Header</span>
          </div>
          <ul className="text-xs text-amber-400/80 space-y-1">
            {validationErrors
              .filter((e) => e.row < 0)
              .map((e, i) => (
                <li key={i}>• {e.message}</li>
              ))}
          </ul>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={prevStep} className="gap-2 text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
        <Button
          onClick={nextStep}
          className="gap-2 btn-primary-gradient btn-shine rounded-xl px-6 h-11 text-sm"
        >
          Lanjut Konversi
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
