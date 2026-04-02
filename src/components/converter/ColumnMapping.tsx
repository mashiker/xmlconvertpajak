'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useConverterStore } from '@/lib/store';
import { fuzzyMatchField } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, CheckCircle2,
  AlertCircle, HelpCircle, Zap,
  ArrowRightLeft,
} from 'lucide-react';

export function ColumnMapping() {
  const selectedTemplate = useConverterStore((s) => s.selectedTemplate);
  const parsedData = useConverterStore((s) => s.parsedData);
  const columnMapping = useConverterStore((s) => s.columnMapping);
  const setColumnMapping = useConverterStore((s) => s.setColumnMapping);
  const nextStep = useConverterStore((s) => s.nextStep);
  const prevStep = useConverterStore((s) => s.prevStep);
  const setEditedData = useConverterStore((s) => s.setEditedData);

  const detailFields = useMemo(
    () => selectedTemplate?.detailFields || [],
    [selectedTemplate]
  );

  // Auto-map on mount
  useEffect(() => {
    if (!parsedData || !selectedTemplate || columnMapping.length > 0) return;

    const mapping: typeof columnMapping = [];
    for (const col of parsedData.headers) {
      const { field, confidence } = fuzzyMatchField(col, detailFields);
      mapping.push({
        sourceColumn: col,
        targetField: field?.name || '__none__',
        confidence,
      });
    }
    setColumnMapping(mapping);
    setEditedData(parsedData.rows);
  }, [parsedData, selectedTemplate, columnMapping.length, setColumnMapping, setEditedData, detailFields]);

  const updateMapping = useCallback((sourceColumn: string, targetField: string) => {
    const field = detailFields.find((f) => f.name === targetField);
    const confidence = field ? 'exact' as const : 'none' as const;
    setColumnMapping(
      columnMapping.map((m) =>
        m.sourceColumn === sourceColumn ? { ...m, targetField, confidence } : m
      )
    );
  }, [columnMapping, detailFields, setColumnMapping]);

  const mappedCount = columnMapping.filter((m) => m.targetField !== '__none__').length;
  const requiredFields = detailFields.filter((f) => f.required);
  const mappedRequiredCount = requiredFields.filter((f) =>
    columnMapping.some((m) => m.targetField === f.name)
  ).length;
  const canContinue = mappedRequiredCount === requiredFields.length && parsedData;

  const previewRows = useMemo(() => {
    if (!parsedData) return [];
    return parsedData.rows.slice(0, 3);
  }, [parsedData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl lg:text-4xl font-extrabold gradient-text">Peta Kolom</h2>
        <p className="text-slate-400 text-sm">
          Petakan kolom file Anda ke field XML{' '}
          <span className="text-emerald-400 font-semibold">{selectedTemplate?.code} — {selectedTemplate?.name}</span>
        </p>
      </div>

      {/* Status badges */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Badge variant="secondary" className="badge-glass text-xs gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          {mappedCount} kolom terpetakan
        </Badge>
        <Badge variant="secondary" className="badge-glass text-xs gap-1.5">
          {mappedRequiredCount}/{requiredFields.length} field wajib
        </Badge>
        {mappedRequiredCount === requiredFields.length && mappedRequiredCount > 0 && (
          <Badge className="text-xs gap-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <Zap className="w-3 h-3" />
            Siap konversi
          </Badge>
        )}
      </div>

      {/* Two-panel cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Source columns */}
        <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                </svg>
              </div>
              Kolom File ({parsedData?.headers.length || 0})
            </h3>
          </div>
          <ScrollArea className="max-h-[350px]">
            <div className="divide-y divide-white/[0.04]">
              {parsedData?.headers.map((col) => {
                const mapping = columnMapping.find((m) => m.sourceColumn === col);
                return (
                  <div key={col} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-mono text-slate-300 truncate block">{col}</span>
                      <span className="text-xs text-slate-600">
                        {parsedData.rows[0]?.[col] ? `Contoh: ${String(parsedData.rows[0][col]).substring(0, 30)}` : 'Kosong'}
                      </span>
                    </div>
                    <ConfidenceIcon confidence={mapping?.confidence || 'none'} />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right: Target fields */}
        <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              Field XML {selectedTemplate?.code} ({detailFields.length})
            </h3>
          </div>
          <ScrollArea className="max-h-[350px]">
            <div className="divide-y divide-white/[0.04]">
              {detailFields.map((field) => {
                const isMapped = columnMapping.some((m) => m.targetField === field.name);
                const mappedCol = columnMapping.find((m) => m.targetField === field.name);
                return (
                  <div key={field.name} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {field.required && <span className="text-rose-400 text-xs">*</span>}
                        <span className="text-sm font-medium text-slate-300">{field.label}</span>
                      </div>
                      <span className="text-xs text-slate-600 font-mono">{field.name}</span>
                    </div>
                    {isMapped ? (
                      <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {mappedCol?.sourceColumn}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] text-slate-500 bg-white/[0.04]">
                        {field.required ? 'Wajib' : 'Opsional'}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Manual mapping */}
      <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            Pemetaan Manual
          </h3>
        </div>
        <div className="p-4">
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2">
              {parsedData?.headers.map((col) => {
                const mapping = columnMapping.find((m) => m.sourceColumn === col);
                return (
                  <div key={col} className="flex items-center gap-3">
                    <span className="text-sm font-mono text-slate-400 min-w-[140px] truncate">{col}</span>
                    <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    <Select
                      value={mapping?.targetField || '__none__'}
                      onValueChange={(v) => updateMapping(col, v)}
                    >
                      <SelectTrigger className="flex-1 h-9 text-xs glass-input rounded-lg">
                        <SelectValue placeholder="Pilih field..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111a16] border-white/[0.1]">
                        <SelectItem value="__none__" className="text-slate-500">— Tidak dipetakan —</SelectItem>
                        {detailFields.map((f) => (
                          <SelectItem key={f.name} value={f.name} className="text-slate-300 focus:bg-emerald-500/10 focus:text-emerald-300">
                            {f.required ? '* ' : ''}{f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ConfidenceBadge confidence={mapping?.confidence || 'none'} />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Preview */}
      {previewRows.length > 0 && mappedCount > 0 && (
        <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-slate-300">Preview Data Terpetakan</h3>
          </div>
          <div className="p-4">
            <ScrollArea className="max-h-[200px]">
              <div className="divide-y divide-white/[0.04]">
                {previewRows.map((row, i) => (
                  <div key={i} className="px-2 py-2">
                    <div className="text-[10px] font-medium text-slate-600 mb-1.5 uppercase tracking-wider">Baris {i + 1}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {columnMapping
                        .filter((m) => m.targetField !== '__none__')
                        .map((m) => {
                          const field = detailFields.find((f) => f.name === m.targetField);
                          return (
                            <Badge key={m.targetField} variant="secondary" className="text-[10px] gap-1 bg-white/[0.04] text-slate-400">
                              <span className="text-emerald-400/70">{field?.label}:</span>
                              <span className="font-mono text-slate-300">{row[m.sourceColumn]}</span>
                            </Badge>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={prevStep} className="gap-2 text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
        <Button
          onClick={nextStep}
          disabled={!canContinue}
          className="gap-2 btn-primary-gradient btn-shine rounded-xl px-6 h-11 text-sm"
        >
          Lanjut Validasi
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function ConfidenceIcon({ confidence }: { confidence: 'exact' | 'partial' | 'none' }) {
  switch (confidence) {
    case 'exact':
      return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
    case 'partial':
      return <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
    default:
      return <HelpCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />;
  }
}

function ConfidenceBadge({ confidence }: { confidence: 'exact' | 'partial' | 'none' }) {
  switch (confidence) {
    case 'exact':
      return <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Cocok</Badge>;
    case 'partial':
      return <Badge className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">Sebagian</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px] text-slate-600 bg-white/[0.04]">—</Badge>;
  }
}
