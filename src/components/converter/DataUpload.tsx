'use client';

import { useCallback, useRef, useState } from 'react';
import { useConverterStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, ArrowRight, ArrowLeft,
  Clipboard, FileSpreadsheet, CheckCircle2, AlertCircle,
  FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { ParsedData } from '@/lib/store';

export function DataUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetOptions, setSheetOptions] = useState<string[]>([]);
  const workbookRef = useRef<XLSX.WorkBook | null>(null);

  const selectedTemplate = useConverterStore((s) => s.selectedTemplate);
  const parsedData = useConverterStore((s) => s.parsedData);
  const setParsedData = useConverterStore((s) => s.setParsedData);
  const selectedSheet = useConverterStore((s) => s.selectedSheet);
  const setSelectedSheet = useConverterStore((s) => s.setSelectedSheet);
  const nextStep = useConverterStore((s) => s.nextStep);
  const prevStep = useConverterStore((s) => s.prevStep);

  const parseSheet = useCallback((workbook: XLSX.WorkBook, sheetName: string) => {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
    if (jsonData.length === 0) {
      setError('File kosong atau tidak ada data yang dapat dibaca.');
      return;
    }
    const headers = Object.keys(jsonData[0]);
    const parsed: ParsedData = {
      headers,
      rows: jsonData,
      sheetName,
      sheets: workbook.SheetNames,
    };
    setParsedData(parsed);
  }, [setParsedData]);

  const parseExcelFile = useCallback((file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        workbookRef.current = workbook;

        if (workbook.SheetNames.length > 1) {
          setSheetOptions(workbook.SheetNames);
          const firstSheet = workbook.SheetNames[0];
          setSelectedSheet(firstSheet);
          parseSheet(workbook, firstSheet);
        } else {
          setSheetOptions([]);
          parseSheet(workbook, workbook.SheetNames[0]);
        }
      } catch {
        setError('Gagal membaca file Excel. Pastikan file format benar.');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [parseSheet, setSelectedSheet]);

  const parseCsvFile = useCallback((file: File) => {
    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          return;
        }
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];
        if (rows.length === 0) {
          setError('File CSV kosong.');
          return;
        }
        setParsedData({ headers, rows });
      },
      error: (err) => {
        setError(`Error parsing CSV: ${err.message}`);
      },
    });
  }, [setParsedData]);

  const handleFile = useCallback((file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      parseExcelFile(file);
    } else if (ext === 'csv') {
      parseCsvFile(file);
    } else {
      setError('Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv');
    }
  }, [parseExcelFile, parseCsvFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handlePaste = useCallback((value: string) => {
    if (!value.trim()) return;
    setError(null);
    try {
      const lines = value.trim().split('\n');
      if (lines.length < 2) {
        setError('Data tidak cukup. Minimal butuh header + 1 baris data.');
        return;
      }
      const firstLine = lines[0];
      let separator = '\t';
      if (!firstLine.includes('\t')) {
        separator = firstLine.includes(',') ? ',' : '|';
      }

      const result = Papa.parse(value, {
        header: true,
        delimiter: separator,
        skipEmptyLines: true,
      });

      const headers = result.meta.fields || [];
      const rows = result.data as Record<string, string>[];
      if (rows.length === 0) {
        setError('Tidak dapat membaca data dari clipboard.');
        return;
      }
      setParsedData({ headers, rows });
    } catch {
      setError('Gagal membaca data dari clipboard.');
    }
  }, [setParsedData]);

  const handleSheetChange = useCallback((sheetName: string) => {
    setSelectedSheet(sheetName);
    if (workbookRef.current) {
      parseSheet(workbookRef.current, sheetName);
    }
  }, [setSelectedSheet, parseSheet]);

  const canContinue = parsedData && parsedData.rows.length > 0;

  // Determine next step label
  const template = selectedTemplate;
  const nextStepLabel = template?.workflowType === 'bea_meterai' || template?.workflowType === 'daftar_harta'
    ? 'Lanjut Validasi'
    : template?.workflowType === 'faktur'
    ? 'Lanjut Validasi'
    : 'Lanjut Pemetaan';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl lg:text-4xl font-extrabold gradient-text">
          Upload Data
        </h2>
        <p className="text-slate-500 text-sm">
          Unggah file Excel/CSV atau tempel data dari spreadsheet
          {selectedTemplate && (
            <span className="text-emerald-600 font-semibold"> — {selectedTemplate.code}</span>
          )}
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer overflow-hidden
          ${isDragging
            ? 'border-emerald-400 bg-emerald-50 scale-[1.01] shadow-md'
            : 'border-gray-300 bg-gray-50/50 hover:border-emerald-300 hover:bg-emerald-50/50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="relative space-y-4">
          <motion.div
            animate={isDragging ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-emerald-50 border border-emerald-200"
          >
            <Upload className="w-7 h-7 text-emerald-600" />
          </motion.div>
          <div>
            <p className="font-semibold text-slate-800">
              {isDragging ? 'Lepaskan file di sini...' : 'Seret & lepas file di sini'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              atau <span className="text-emerald-600 font-medium cursor-pointer hover:underline">klik untuk memilih file</span>
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Mendukung .xlsx, .xls, .csv — Maks 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">atau tempel data</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Paste area */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Clipboard className="w-4 h-4" />
          Tempel data dari Excel
        </label>
        <Textarea
          placeholder="Tempel data dari Excel/Google Sheets di sini...&#10;&#10;Contoh:&#10;NPWP&#9;Nama&#9;Gaji&#10;123456789012000&#9;Joko&#9;10000000"
          className="min-h-[120px] font-mono text-xs glass-input rounded-xl"
          onChange={(e) => handlePaste(e.target.value)}
        />
        <p className="text-xs text-slate-400">
          Data dipisahkan tab, koma, atau pipe. Baris pertama sebagai header kolom.
        </p>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sheet Selector */}
      {sheetOptions.length > 1 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600">Sheet:</label>
          <Select value={selectedSheet} onValueChange={handleSheetChange}>
            <SelectTrigger className="w-64 glass-input rounded-xl">
              <SelectValue placeholder="Pilih sheet" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              {sheetOptions.map((s) => (
                <SelectItem key={s} value={s} className="text-slate-700 focus:bg-emerald-50 focus:text-emerald-600">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Data Preview */}
      <AnimatePresence>
        {parsedData && parsedData.rows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">
                Data berhasil dibaca — {parsedData.rows.length} baris, {parsedData.headers.length} kolom
              </span>
            </div>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-slate-800">Preview Data (5 baris pertama)</span>
                {parsedData.sheetName && (
                  <Badge variant="secondary" className="text-[10px] badge-glass ml-auto">
                    {parsedData.sheetName}
                  </Badge>
                )}
              </div>
              <ScrollArea className="max-h-[240px]">
                <Table className="dark-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">#</TableHead>
                      {parsedData.headers.map((h) => (
                        <TableHead key={h} className="whitespace-nowrap">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.rows.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-center text-xs text-slate-400 font-mono">{i + 1}</TableCell>
                        {parsedData.headers.map((h) => (
                          <TableCell key={h} className="text-xs font-mono whitespace-nowrap max-w-[200px] truncate text-slate-600">
                            {row[h] || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={prevStep} className="gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
        <Button
          onClick={nextStep}
          disabled={!canContinue}
          className="gap-2 btn-primary-gradient btn-shine rounded-xl px-6 h-11 text-sm"
        >
          {nextStepLabel}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
