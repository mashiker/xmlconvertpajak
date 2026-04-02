'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useConverterStore } from '@/lib/store';
import { getTemplateById } from '@/lib/templates';
import { WizardSteps } from '@/components/converter/WizardSteps';
import { TemplateSelector } from '@/components/converter/TemplateSelector';
import { HeaderForm } from '@/components/converter/HeaderForm';
import { LawanTransaksiForm } from '@/components/converter/LawanTransaksiForm';
import { DataUpload } from '@/components/converter/DataUpload';
import { ColumnMapping } from '@/components/converter/ColumnMapping';
import { ValidationEditor } from '@/components/converter/ValidationEditor';
import { ConvertDownload } from '@/components/converter/ConvertDownload';
import { AnimatePresence, motion } from 'framer-motion';
import { Shield, Lock, Zap, ChevronRight, LayoutGrid } from 'lucide-react';

function getStepComponent(stepType: string | undefined) {
  switch (stepType) {
    case 'select_template': return <TemplateSelector />;
    case 'header_form': return <HeaderForm />;
    case 'lawan_transaksi': return <LawanTransaksiForm />;
    case 'upload': return <DataUpload />;
    case 'column_mapping': return <ColumnMapping />;
    case 'validate_edit': return <ValidationEditor />;
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="fixed inset-0 -z-10">
        {/* Base */}
        <div className="absolute inset-0 bg-[#0a0f0d]" />

        {/* Gradient blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/[0.07] rounded-full blur-[120px] mesh-blob" />
        <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] bg-teal-500/[0.05] rounded-full blur-[100px] mesh-blob-2" />
        <div className="absolute bottom-[-10%] left-[30%] w-[450px] h-[450px] bg-emerald-600/[0.04] rounded-full blur-[110px] mesh-blob-3" />
        <div className="absolute top-[60%] left-[10%] w-[300px] h-[300px] bg-amber-500/[0.03] rounded-full blur-[80px] mesh-blob" />

        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid-pattern" />

        {/* Top gradient fade */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a0f0d] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0f0d] to-transparent" />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="glass border-b border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-emerald-glow">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-100">
                  Coretax XML Converter
                </h1>
                <p className="text-[11px] text-slate-500">Konversi data Excel/CSV ke XML DJP Coretax</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => router.push('/converters')}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors group bg-white/[0.03] backdrop-blur-xl rounded-xl px-3 py-2 border border-white/[0.06] hover:border-emerald-500/20"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Semua Converter</span>
                <span className="sm:hidden">Converter</span>
                <ChevronRight className="w-3 h-3 opacity-50 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <div className="hidden sm:flex items-center gap-2.5 text-xs text-slate-500 bg-white/[0.03] backdrop-blur-xl rounded-xl px-4 py-2 border border-white/[0.06]">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Client-Side — Data aman di browser</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Wizard Steps (sticky) */}
      <div className="sticky top-0 z-50 bg-[#0a0f0d]/80 backdrop-blur-xl border-b border-white/[0.04]">
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
        <div className="border-t border-white/[0.04] bg-[#0a0f0d]/60 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Shield className="w-3.5 h-3.5 text-emerald-500/50" />
                <span>100% Client-Side — Data Anda tidak pernah meninggalkan browser</span>
              </div>
              <div className="text-xs text-slate-600">
                Coretax XML Converter &copy; {new Date().getFullYear()} — Dibuat untuk anak pajak Indonesia
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
