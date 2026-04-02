'use client';

import { useMemo, useState } from 'react';
import { useConverterStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  ArrowLeft, Download, Copy, Check, RefreshCw,
  FileCode, ChevronDown, ChevronRight, Sparkles,
  PartyPopper,
} from 'lucide-react';
import { generateXml } from '@/lib/xml-generator';

export function ConvertDownload() {
  const selectedTemplate = useConverterStore((s) => s.selectedTemplate);
  const parsedData = useConverterStore((s) => s.parsedData);
  const columnMapping = useConverterStore((s) => s.columnMapping);
  const headerMapping = useConverterStore((s) => s.headerMapping);
  const lawanTransaksi = useConverterStore((s) => s.lawanTransaksi);
  const generatedXml = useConverterStore((s) => s.generatedXml);
  const setGeneratedXml = useConverterStore((s) => s.setGeneratedXml);
  const isConverting = useConverterStore((s) => s.isConverting);
  const setIsConverting = useConverterStore((s) => s.setIsConverting);
  const resetWizard = useConverterStore((s) => s.resetWizard);
  const prevStep = useConverterStore((s) => s.prevStep);

  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConvert = useMemo(() => {
    return () => {
      if (!selectedTemplate || !parsedData) return;
      setIsConverting(true);

      setTimeout(() => {
        try {
          const xml = generateXml(selectedTemplate, parsedData, columnMapping, headerMapping, lawanTransaksi);
          setGeneratedXml(xml);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        } catch {
          setGeneratedXml('<error>Gagal menghasilkan XML</error>');
        }
        setIsConverting(false);
      }, 1000);
    };
  }, [selectedTemplate, parsedData, columnMapping, headerMapping, lawanTransaksi, setGeneratedXml, setIsConverting]);

  const handleDownload = () => {
    if (!generatedXml) return;
    const blob = new Blob([generatedXml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate?.code || 'output'}_${new Date().toISOString().slice(0, 10)}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!generatedXml) return;
    try {
      await navigator.clipboard.writeText(generatedXml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = generatedXml;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl lg:text-4xl font-extrabold gradient-text">Konversi & Unduh</h2>
        <p className="text-slate-400 text-sm">
          Konversi data ke XML format DJP Coretax
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!generatedXml && !isConverting && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center mb-6"
            >
              <Sparkles className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">Siap Konversi?</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
              Data Anda akan dikonversi ke format XML {selectedTemplate?.code} yang sesuai dengan spesifikasi DJP Coretax
            </p>
            <Button
              onClick={handleConvert}
              size="lg"
              className="gap-2 btn-primary-gradient btn-shine rounded-2xl px-10 h-14 text-base"
            >
              <Sparkles className="w-5 h-5" />
              Konversi ke XML
            </Button>
          </motion.div>
        )}

        {isConverting && (
          <motion.div
            key="converting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center mb-6 animate-pulse">
              <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
            </div>
            <p className="text-lg font-semibold text-slate-200">Mengkonversi data...</p>
            <p className="text-sm text-slate-500 mt-1">Mohon tunggu sebentar</p>
          </motion.div>
        )}

        {generatedXml && !isConverting && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Success badge */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-5 py-1.5 text-sm gap-1.5">
                  <Check className="w-4 h-4" />
                  XML Berhasil Dibuat
                </Badge>
              </motion.div>
            </div>

            {/* Success particles */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 2 }}
                  className="pointer-events-none fixed inset-0 flex items-center justify-center z-50"
                >
                  <PartyPopper className="w-16 h-16 text-emerald-400 animate-float" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* XML Preview */}
            <XmlPreview xml={generatedXml} />

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button
                onClick={handleDownload}
                className="gap-2 btn-primary-gradient btn-shine rounded-xl px-6 h-11 text-sm"
              >
                <Download className="w-4 h-4" />
                Unduh .xml
              </Button>
              <Button
                variant="ghost"
                onClick={handleCopy}
                className="gap-2 btn-secondary-glass rounded-xl px-6 h-11 text-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Salin XML
                  </>
                )}
              </Button>
            </div>

            {/* Restart */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button variant="ghost" onClick={prevStep} className="gap-2 text-slate-500 hover:text-slate-300">
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Button>
              <Button variant="ghost" onClick={resetWizard} className="gap-2 text-slate-500 hover:text-emerald-400">
                <RefreshCw className="w-4 h-4" />
                Konversi Lagi
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function XmlPreview({ xml }: { xml: string }) {
  const [expanded, setExpanded] = useState(true);
  const lineCount = xml.split('\n').length;

  if (!xml) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-[#0a0f0d] border border-white/[0.08] overflow-hidden shadow-multi"
    >
      {/* Code editor header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#111a16]/80">
        <div className="flex items-center gap-3">
          {/* Traffic light dots */}
          <div className="traffic-light">
            <span className="red" />
            <span className="yellow" />
            <span className="green" />
          </div>
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-slate-300">Preview XML</span>
            <Badge variant="secondary" className="text-[10px] badge-glass">
              {lineCount} baris
            </Badge>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-white/[0.05]"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <ScrollArea className="max-h-[500px]">
          <SyntaxHighlighter
            language="xml"
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '1.25rem',
              background: 'transparent',
              fontSize: '0.8rem',
              lineHeight: '1.7',
            }}
            showLineNumbers
            lineNumberStyle={{
              color: '#475569',
              minWidth: '3em',
              paddingRight: '1em',
            }}
          >
            {xml}
          </SyntaxHighlighter>
        </ScrollArea>
      )}
    </motion.div>
  );
}
