'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useConverterStore } from '@/lib/store';
import type { CoretaxTemplate, TemplateField } from '@/lib/templates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Plus, Trash2, CheckCircle2, AlertTriangle,
  AlertCircle, Table2, ClipboardPaste, Download, Upload, X,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================
interface CellError {
  row: number;
  col: number;
  message: string;
  severity: 'error' | 'warning';
}

// ============================================================
// Validation helpers
// ============================================================
function validateNPWP(value: string): string | null {
  const cleaned = value.replace(/[\s.\-]/g, '');
  if (cleaned.length === 0) return 'NPWP wajib diisi';
  if (!/^\d+$/.test(cleaned)) return 'NPWP hanya boleh angka';
  if (cleaned.length < 15 || cleaned.length > 16) return 'NPWP harus 15-16 digit';
  return null;
}

function validateCurrency(value: string): string | null {
  if (!value.trim()) return 'Nilai wajib diisi';
  const num = parseFloat(value.replace(/[^\d.,\-]/g, '').replace(/,/g, ''));
  if (isNaN(num)) return 'Format angka tidak valid';
  if (num < 0) return 'Nilai tidak boleh negatif';
  return null;
}

function validateDate(value: string): string | null {
  if (!value.trim()) return 'Tanggal wajib diisi';
  const dmy = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const day = parseInt(dmy[1]);
    const month = parseInt(dmy[2]);
    if (day < 1 || day > 31) return 'Hari tidak valid';
    if (month < 1 || month > 12) return 'Bulan tidak valid';
    return null;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return 'Format: DD/MM/YYYY atau YYYY-MM-DD';
}

function validateRequired(value: string, field: TemplateField): string | null {
  if (!value || !value.trim()) {
    return `${field.label} wajib diisi`;
  }
  return null;
}

function validateCell(value: string, field: TemplateField, isRequired: boolean): string | null {
  if (!value || !value.trim()) {
    return isRequired ? validateRequired(value, field) : null;
  }
  switch (field.type) {
    case 'npwp':
      return validateNPWP(value);
    case 'currency':
      return validateCurrency(value);
    case 'number':
      if (!/^-?\d*\.?\d*$/.test(value.replace(/,/g, ''))) return 'Format angka tidak valid';
      return null;
    case 'date':
      return validateDate(value);
    default:
      return null;
  }
}

// ============================================================
// Main Component
// ============================================================
export function SpreadsheetEditor() {
  const selectedTemplate = useConverterStore((s) => s.selectedTemplate);
  const spreadsheetData = useConverterStore((s) => s.spreadsheetData);
  const setSpreadsheetData = useConverterStore((s) => s.setSpreadsheetData);
  const cellValidationErrors = useConverterStore((s) => s.cellValidationErrors);
  const setCellValidationErrors = useConverterStore((s) => s.setCellValidationErrors);
  const nextStep = useConverterStore((s) => s.nextStep);
  const prevStep = useConverterStore((s) => s.prevStep);

  const tableRef = useRef<HTMLDivElement>(null);
  const editingCellRef = useRef<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [cellErrors, setCellErrors] = useState<CellError[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [validationDone, setValidationDone] = useState(false);
  const [lastFocusedCell, setLastFocusedCell] = useState<{ row: number; col: number } | null>(null);

  const fields = useMemo(() => selectedTemplate?.detailFields || [], [selectedTemplate]);
  const totalCols = fields.length;
  const INITIAL_ROWS = 50;

  // Initialize spreadsheet data if empty
  const data = useMemo(() => {
    if (spreadsheetData.length > 0) return spreadsheetData;
    // Create empty rows: [field1, field2, ...] for each row
    return Array.from({ length: INITIAL_ROWS }, () =>
      Array.from({ length: totalCols }, () => null)
    );
  }, [spreadsheetData, totalCols]);

  // Sync data to store on change
  useEffect(() => {
    if (data !== spreadsheetData) {
      setSpreadsheetData(data);
    }
  }, [data, spreadsheetData, setSpreadsheetData]);

  // Get cell error for a specific cell
  const getCellError = useCallback((row: number, col: number) => {
    return cellErrors.find(e => e.row === row && e.col === col);
  }, [cellErrors]);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    if (editingCell && editingCell.row === row && editingCell.col === col) return;
    setSelectedCell({ row, col });
    setLastFocusedCell({ row, col });
  }, [editingCell]);

  // Handle cell double-click to edit
  const handleCellDoubleClick = useCallback((row: number, col: number) => {
    const currentValue = data[row]?.[col];
    setEditValue(currentValue != null ? String(currentValue) : '');
    setEditingCell({ row, col });
    editingCellRef.current = { row, col };
  }, [data]);

  // Save cell edit
  const saveCellEdit = useCallback(() => {
    if (!editingCell) return;
    const newData = data.map(r => [...r]);
    if (newData[editingCell.row]) {
      newData[editingCell.row][editingCell.col] = editValue || null;
    }
    setSpreadsheetData(newData);
    setEditingCell(null);
    editingCellRef.current = null;
    // Clear error for this cell if validation was done
    if (validationDone) {
      setCellErrors(prev => prev.filter(e =>
        !(e.row === editingCell.row && e.col === editingCell.col)
      ));
    }
  }, [editingCell, editValue, data, setSpreadsheetData, validationDone]);

  // Cancel cell edit
  const cancelCellEdit = useCallback(() => {
    setEditingCell(null);
    editingCellRef.current = null;
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!editingCell) {
      // Arrow key navigation
      if (lastFocusedCell) {
        let { row, col } = lastFocusedCell;
        if (e.key === 'ArrowDown') { row = Math.min(row + 1, data.length - 1); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { row = Math.max(row - 1, 0); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { col = Math.min(col + 1, totalCols - 1); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { col = Math.max(col - 1, 0); e.preventDefault(); }
        else if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'F2') {
          e.preventDefault();
          handleCellDoubleClick(row, col);
          return;
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          const newData = data.map(r => [...r]);
          if (newData[row]) newData[row][col] = null;
          setSpreadsheetData(newData);
          return;
        } else {
          return; // Don't handle other keys when not editing
        }
        setSelectedCell({ row, col });
        setLastFocusedCell({ row, col });
      }
    } else {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveCellEdit();
        // Move down
        const nextRow = Math.min(editingCell.row + 1, data.length - 1);
        setTimeout(() => {
          handleCellDoubleClick(nextRow, editingCell.col);
        }, 10);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        saveCellEdit();
        const nextCol = e.shiftKey
          ? Math.max(editingCell.col - 1, 0)
          : Math.min(editingCell.col + 1, totalCols - 1);
        setTimeout(() => {
          handleCellDoubleClick(editingCell.row, nextCol);
        }, 10);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelCellEdit();
      }
    }
  }, [editingCell, lastFocusedCell, data, totalCols, saveCellEdit, cancelCellEdit, handleCellDoubleClick, setSpreadsheetData]);

  // Handle paste (from Excel/Google Sheets)
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (editingCell) return; // Don't intercept when editing a cell
    e.preventDefault();
    const paste = e.clipboardData.getData('text/plain');
    if (!paste.trim()) return;

    const lines = paste.trim().split('\n');
    if (!selectedCell) return;

    const newData = data.map(r => [...r]);
    let startRow = selectedCell.row;
    let startCol = selectedCell.col;

    for (let i = 0; i < lines.length; i++) {
      const cells = lines[i].split('\t');
      for (let j = 0; j < cells.length; j++) {
        const targetRow = startRow + i;
        const targetCol = startCol + j;
        if (targetRow >= newData.length) {
          // Add rows if needed
          newData.push(Array.from({ length: totalCols }, () => null));
        }
        if (targetCol < totalCols) {
          const val = cells[j].trim();
          newData[targetRow][targetCol] = val || null;
        }
      }
    }

    setSpreadsheetData(newData);
    setValidationDone(false);
    setCellErrors([]);
  }, [data, selectedCell, totalCols, editingCell, setSpreadsheetData]);

  // Add row
  const addRow = useCallback((afterIndex?: number) => {
    const newData = data.map(r => [...r]);
    const insertAt = afterIndex !== undefined ? afterIndex + 1 : newData.length;
    newData.splice(insertAt, 0, Array.from({ length: totalCols }, () => null));
    setSpreadsheetData(newData);
  }, [data, totalCols, setSpreadsheetData]);

  // Delete row
  const deleteRow = useCallback((rowIndex: number) => {
    if (data.length <= 1) return; // Keep at least 1 row
    const newData = data.filter((_, i) => i !== rowIndex);
    setSpreadsheetData(newData);
    setCellErrors(prev => prev.filter(e => e.row !== rowIndex).map(e => ({
      ...e,
      row: e.row > rowIndex ? e.row - 1 : e.row,
    })));
  }, [data, setSpreadsheetData]);

  // Clear all data
  const clearAll = useCallback(() => {
    const newData = Array.from({ length: INITIAL_ROWS }, () =>
      Array.from({ length: totalCols }, () => null)
    );
    setSpreadsheetData(newData);
    setCellErrors([]);
    setValidationDone(false);
  }, [totalCols, setSpreadsheetData]);

  // Validate all data
  const validateAll = useCallback(() => {
    const errors: CellError[] = [];
    let hasData = false;

    for (let row = 0; row < data.length; row++) {
      // Skip completely empty rows
      const rowHasData = data[row]?.some(cell => cell != null && String(cell).trim() !== '');
      if (!rowHasData) continue;
      hasData = true;

      for (let col = 0; col < fields.length; col++) {
        const value = data[row]?.[col] != null ? String(data[row][col]) : '';
        const field = fields[col];
        const error = validateCell(value, field, field.required);
        if (error) {
          errors.push({ row, col, message: error, severity: 'error' });
        }
      }
    }

    setCellErrors(errors);
    setCellValidationErrors(errors);
    setValidationDone(true);
    return errors;
  }, [data, fields, setCellValidationErrors]);

  // Count non-empty rows
  const dataRowCount = useMemo(() => {
    return data.filter(row => row.some(cell => cell != null && String(cell).trim() !== '')).length;
  }, [data]);

  const errorCount = cellErrors.length;
  const canContinue = dataRowCount > 0 && (validationDone ? errorCount === 0 : true);

  // Handle continue with validation
  const handleContinue = useCallback(() => {
    if (!validationDone) {
      const errors = validateAll();
      if (errors.length > 0) return; // Don't proceed with errors
    } else if (errorCount > 0) {
      return; // Don't proceed with errors
    }
    nextStep();
  }, [validationDone, validateAll, errorCount, nextStep]);

  // Column width based on field type
  const getColWidth = useCallback((field: TemplateField, index: number) => {
    if (field.type === 'currency' || field.type === 'number') return 'w-[140px]';
    if (field.type === 'npwp') return 'w-[170px]';
    if (field.type === 'date') return 'w-[130px]';
    if (field.type === 'select' && field.options) return 'w-[150px]';
    if (field.label.length > 20) return 'w-[200px]';
    if (field.label.length > 14) return 'w-[160px]';
    return 'w-[130px]';
  }, []);

  // Select options for dropdown fields
  const getFieldOptions = useCallback((field: TemplateField) => {
    if (field.type !== 'select' || !field.options) return null;
    return field.options;
  }, []);

  if (!selectedTemplate) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl lg:text-4xl font-extrabold gradient-text">
            Isi Data
          </h2>
          <p className="text-slate-500 text-sm">
            Entry data di spreadsheet — paste dari Excel/Google Sheets langsung
            {selectedTemplate && (
              <span className="text-emerald-600 font-semibold"> — {selectedTemplate.code}</span>
            )}
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addRow()}
              className="gap-1.5 text-xs text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Baris
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => lastFocusedCell && deleteRow(lastFocusedCell.row)}
              disabled={!lastFocusedCell || data.length <= 1}
              className="gap-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus Baris
            </Button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="gap-1.5 text-xs text-slate-600 hover:text-amber-600 hover:bg-amber-50"
            >
              <X className="w-3.5 h-3.5" />
              Bersihkan
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-200 font-medium">
                <Table2 className="w-3 h-3 mr-1" />
                {dataRowCount} data
              </Badge>
              {validationDone && errorCount > 0 && (
                <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-rose-200 font-medium animate-in fade-in">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errorCount} error
                </Badge>
              )}
              {validationDone && errorCount === 0 && dataRowCount > 0 && (
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-200 font-medium animate-in fade-in">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Valid
                </Badge>
              )}
            </div>
            {/* Validate button */}
            <Button
              variant="outline"
              size="sm"
              onClick={validateAll}
              className="gap-1.5 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Validasi
            </Button>
          </div>
        </div>

        {/* Spreadsheet */}
        <div
          ref={tableRef}
          className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => {
            if (!lastFocusedCell) {
              setLastFocusedCell({ row: 0, col: 0 });
              setSelectedCell({ row: 0, col: 0 });
            }
          }}
        >
          <ScrollArea className="max-h-[520px]">
            <div className="min-w-full overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {/* Row number header */}
                    <th className="w-[50px] min-w-[50px] text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2.5 px-2 border-r border-gray-200 bg-gray-100">
                      #
                    </th>
                    {/* Column headers */}
                    {fields.map((field, col) => {
                      const colErrorCount = cellErrors.filter(e => e.col === col).length;
                      return (
                        <th
                          key={field.name}
                          className={`${getColWidth(field, col)} min-w-[100px] text-left text-xs font-semibold py-2.5 px-3 border-r border-gray-200 last:border-r-0 ${
                            field.required
                              ? 'text-emerald-700 bg-emerald-50/70'
                              : 'text-slate-600 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {field.required && (
                              <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                            )}
                            <span className={field.required ? 'font-bold' : ''}>
                              {field.label}
                            </span>
                            {colErrorCount > 0 && (
                              <span className="ml-auto text-[10px] text-rose-500 font-medium">
                                ({colErrorCount})
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIdx) => {
                    const isRowEmpty = row.every(cell => cell == null || String(cell).trim() === '');
                    return (
                      <tr
                        key={rowIdx}
                        className={`
                          border-b border-gray-100 transition-colors
                          ${selectedCell?.row === rowIdx ? 'bg-emerald-50/40' : ''}
                          ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                          hover:bg-blue-50/30
                        `}
                        onMouseDown={() => handleCellClick(rowIdx, 0)}
                      >
                        {/* Row number */}
                        <td className="text-center text-[11px] font-mono text-slate-400 py-0 px-2 border-r border-gray-200 bg-gray-50/80 select-none">
                          {rowIdx + 1}
                        </td>
                        {/* Data cells */}
                        {fields.map((field, colIdx) => {
                          const cellVal = row[colIdx];
                          const displayVal = cellVal != null ? String(cellVal) : '';
                          const error = getCellError(rowIdx, colIdx);
                          const isEditing = editingCell?.row === rowIdx && editingCell?.col === colIdx;
                          const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
                          const options = getFieldOptions(field);

                          let cellClassName = `
                            py-0 px-2 border-r border-gray-100 last:border-r-0
                            text-xs font-mono
                            transition-colors cursor-cell
                          `;

                          if (error) {
                            cellClassName += ' bg-rose-50';
                          } else if (isEditing) {
                            cellClassName += ' bg-white ring-2 ring-emerald-400 ring-inset';
                          } else if (isSelected) {
                            cellClassName += ' bg-emerald-50/60 ring-1 ring-emerald-300 ring-inset';
                          }

                          if (field.type === 'currency' || field.type === 'number') {
                            cellClassName += ' text-right';
                          } else {
                            cellClassName += ' text-left';
                          }

                          return (
                            <td
                              key={`${rowIdx}-${colIdx}`}
                              className={cellClassName}
                              onDoubleClick={() => handleCellDoubleClick(rowIdx, colIdx)}
                              onClick={() => handleCellClick(rowIdx, colIdx)}
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              {isEditing ? (
                                options ? (
                                  // Dropdown for select fields
                                  <select
                                    autoFocus
                                    value={editValue}
                                    onChange={(e) => {
                                      setEditValue(e.target.value);
                                      const newData = data.map(r => [...r]);
                                      newData[rowIdx][colIdx] = e.target.value || null;
                                      setSpreadsheetData(newData);
                                    }}
                                    onBlur={saveCellEdit}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') { e.preventDefault(); saveCellEdit(); }
                                      if (e.key === 'Escape') { e.preventDefault(); cancelCellEdit(); }
                                    }}
                                    className="w-full h-full py-1.5 px-2 text-xs font-mono bg-white border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                  >
                                    <option value="">— Pilih —</option>
                                    {options.map(opt => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  // Text input for other fields
                                  <input
                                    autoFocus
                                    type={field.type === 'number' || field.type === 'currency' ? 'text' : 'text'}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={saveCellEdit}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') { e.preventDefault(); saveCellEdit(); }
                                      if (e.key === 'Escape') { e.preventDefault(); cancelCellEdit(); }
                                      if (e.key === 'Tab') { e.preventDefault(); saveCellEdit(); }
                                    }}
                                    placeholder={field.type === 'currency' ? '0' : field.type === 'date' ? 'DD/MM/YYYY' : ''}
                                    className={`
                                      w-full h-full py-1.5 px-2 text-xs font-mono
                                      bg-white border border-emerald-300 rounded
                                      focus:outline-none focus:ring-2 focus:ring-emerald-400
                                      ${field.type === 'currency' || field.type === 'number' ? 'text-right' : 'text-left'}
                                      ${error ? 'border-rose-400 bg-rose-50' : ''}
                                    `}
                                  />
                                )
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={`
                                        py-1.5 px-2 min-h-[32px] flex items-center
                                        ${!displayVal ? 'text-slate-300 italic' : ''}
                                        ${error ? 'text-rose-700' : 'text-slate-700'}
                                        ${field.type === 'currency' || field.type === 'number' ? 'justify-end' : ''}
                                      `}
                                    >
                                      {displayVal || (field.required ? '—' : '')}
                                    </div>
                                  </TooltipTrigger>
                                  {error && (
                                    <TooltipContent
                                      side="top"
                                      className="bg-rose-600 text-white text-xs border-0 max-w-[250px]"
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <AlertCircle className="w-3 h-3" />
                                        {error.message}
                                      </div>
                                    </TooltipContent>
                                  )}
                                  {!error && field.required && !displayVal && (
                                    <TooltipContent side="top" className="text-xs">
                                      {field.description || `${field.label} (wajib diisi)`}
                                    </TooltipContent>
                                  )}
                                  {!error && displayVal && field.description && (
                                    <TooltipContent side="top" className="text-xs max-w-[250px]">
                                      {field.description}
                                      {field.type === 'select' && field.keywords && (
                                        <div className="text-slate-400 mt-1">
                                          Contoh: {field.keywords.slice(0, 3).join(', ')}
                                        </div>
                                      )}
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </div>

        {/* Tips */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">Double-click</kbd>
            Edit sel
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">Ctrl+V</kbd>
            Paste dari Excel
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">Tab</kbd>
            Sel berikutnya
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">Enter</kbd>
            Baris berikutnya
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            = Wajib diisi
          </span>
        </div>

        {/* Error summary */}
        <AnimatePresence>
          {validationDone && cellErrors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                <AlertCircle className="w-4 h-4" />
                {cellErrors.length} kesalahan ditemukan — perbaiki sebelum lanjut
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {cellErrors.slice(0, 10).map((err, i) => (
                  <div key={i} className="text-xs text-rose-600 flex items-center gap-2">
                    <span className="font-mono bg-rose-100 px-1.5 py-0.5 rounded">
                      Baris {err.row + 1}, {fields[err.col]?.label}
                    </span>
                    <span>{err.message}</span>
                  </div>
                ))}
                {cellErrors.length > 10 && (
                  <div className="text-xs text-rose-400 italic">
                    ...dan {cellErrors.length - 10} kesalahan lainnya
                  </div>
                )}
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
            onClick={handleContinue}
            disabled={!canContinue}
            className="gap-2 btn-primary-gradient btn-shine rounded-xl px-6 h-11 text-sm"
          >
            {validationDone && errorCount > 0 ? (
              <>
                <AlertCircle className="w-4 h-4" />
                Perbaiki {errorCount} Error
              </>
            ) : !validationDone && dataRowCount > 0 ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Validasi & Lanjut
              </>
            ) : (
              <>
                Lanjut Generate XML
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
