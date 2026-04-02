'use client';

import { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { useConverterStore } from '@/lib/store';
import { getTemplateById } from '@/lib/templates';
import { WizardSteps } from '@/components/converter/WizardSteps';
import { TemplateSelector } from '@/components/converter/TemplateSelector';
import { HeaderForm } from '@/components/converter/HeaderForm';
import { LawanTransaksiForm } from '@/components/converter/LawanTransaksiForm';
import { ConvertDownload } from '@/components/converter/ConvertDownload';
import { AnimatePresence, motion } from 'framer-motion';
import { Shield, Lock, Zap, ChevronRight, LayoutGrid } from 'lucide-react';

// Dynamically import SpreadsheetEditor (client-only)
const SpreadsheetEditor = dynamic(
  () => import('@/components/converter/SpreadsheetEditor').then(m => ({ default: m.SpreadsheetEditor })),
  { ssr: false, loading: () => <SpreadsheetLoading /> }
);

function SpreadsheetLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center animate-pulse">
          <Zap className="w-6 h-6 text-emerald-600" />
        </div>
        <p className="text-sm text-slate-500">Memuat spreadsheet...</p>
      </div>
    </div>
  );
}

function getStepComponent(stepType: string | undefined) {
  switch (stepType) {
    case 'select_template': return <TemplateSelector />;
    case 'header_form': return <HeaderForm />;
    case 'lawan_transaksi': return <LawanTransaksiForm />;
    case 'spreadsheet': return <SpreadsheetEditor />;
    case 'generate_xml': return <ConvertDownload />;
    default: return <TemplateSelector />;
  }
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = useConverterStore((s) => s.currentStep);
  const selectedTemplate = useConverterStore((s) => s.selectedTemplate);
  const totalSteps = useConverterStore((s) => s.totalSteps);
  const setSelectedTemplate = useConverterStore((s) => s.setSelectedTemplate);
  const setStep = useConverterStore((s) => s.setStep);

  // Auto-select template from ?template=ID query param
  useEffect(() => {
    const templateId = searchParams.get('template');
    if (templateId && !selectedTemplate) {
      const template = getTemplateById(templateId);
      if (template) {
        setSelectedTemplate(template);
        // Skip to step 2 (past template selection)
        setStep(2);
      }
    }
  }, [searchParams, selectedTemplate, setSelectedTemplate, setStep]);

  const currentStepDef = selectedTemplate?.steps?.[currentStep - 1];
  const stepComponent = getStepComponent(currentStepDef?.type);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Clean background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-white" />
        {/* Subtle radial gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.06),transparent)]" />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-900">
                  Coretax XML Converter
                </h1>
                <p className="text-[11px] text-slate-500">Konversi data Excel/CSV ke XML DJP Coretax</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => router.push('/converters')}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-600 transition-colors group bg-white rounded-xl px-3 py-2 border border-gray-200 hover:border-gray-300"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Semua Converter</span>
                <span className="sm:hidden">Converter</span>
                <ChevronRight className="w-3 h-3 opacity-50 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <div className="hidden sm:flex items-center gap-2.5 text-xs text-slate-600 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Client-Side — Data aman di browser</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Wizard Steps (sticky) */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <WizardSteps />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 lg:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {stepComponent}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10">
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Client-Side — Data Anda tidak pernah meninggalkan browser</span>
              </div>
              <div className="text-xs text-slate-500">
                Coretax XML Converter &copy; {new Date().getFullYear()} — Dibuat untuk anak pajak Indonesia
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
