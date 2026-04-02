'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Download,
  Rocket,
  ArrowLeft,
  Shield,
  Lock,
  Zap,
  Star,
  ChevronRight,
  FileText,
  Receipt,
  Building2,
  User,
  Calculator,
  Stamp,
  ListChecks,
  Layers,
  Hash,
  Clock,
  CheckCircle2,
  Database,
  Grid3X3,
  Sparkles,
} from 'lucide-react';
import {
  allTemplates,
  categories,
  type CoretaxTemplate,
  type WorkflowType,
} from '@/lib/templates';
import { Badge } from '@/components/ui/badge';

// ============================================================
// Workflow type config
// ============================================================
const workflowConfig: Record<WorkflowType, { label: string; color: string; bgColor: string; borderColor: string }> = {
  bupot: {
    label: 'Bukti Potong',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  faktur: {
    label: 'Faktur Pajak',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  spt_tahunan: {
    label: 'SPT Tahunan',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
  },
  spt_masa_ppn: {
    label: 'SPT Masa PPN',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
  },
  bea_meterai: {
    label: 'Bea Meterai',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
  },
  daftar_harta: {
    label: 'Daftar Harta',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
  },
};

// ============================================================
// Icon mapping
// ============================================================
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Receipt,
  Building2,
  User,
  Calculator,
  Stamp,
  ListChecks,
};

// ============================================================
// Animation variants
// ============================================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// ============================================================
// Main Page
// ============================================================
export default function ConvertersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((t) => {
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        t.name.toLowerCase().includes(query) ||
        t.code.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query) ||
        t.detailFields.some(
          (f) =>
            f.label.toLowerCase().includes(query) ||
            f.name.toLowerCase().includes(query)
        );
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  // Stats
  const stats = useMemo(() => {
    const categoryCount = categories.length;
    const workflowTypes = new Set(allTemplates.map((t) => t.workflowType));
    const popularCount = allTemplates.filter((t) => t.popular).length;
    return {
      templates: allTemplates.length,
      categories: categoryCount,
      workflows: workflowTypes.size,
      popular: popularCount,
    };
  }, []);

  // Handle download
  const handleDownload = async (template: CoretaxTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(template.id);
    try {
      const response = await fetch(`/api/template/${template.id}/download`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = template.name.replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `Template_${template.code}_${safeName}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silent fail
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle start conversion
  const handleStartConvert = (template: CoretaxTemplate) => {
    router.push(`/?template=${template.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0a0f0d]" />
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/[0.07] rounded-full blur-[120px] mesh-blob" />
        <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] bg-teal-500/[0.05] rounded-full blur-[100px] mesh-blob-2" />
        <div className="absolute bottom-[-10%] left-[30%] w-[450px] h-[450px] bg-emerald-600/[0.04] rounded-full blur-[110px] mesh-blob-3" />
        <div className="absolute top-[60%] left-[10%] w-[300px] h-[300px] bg-amber-500/[0.03] rounded-full blur-[80px] mesh-blob" />
        <div className="absolute inset-0 dot-grid-pattern" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a0f0d] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0f0d] to-transparent" />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="glass border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
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
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5 text-xs text-slate-500 bg-white/[0.03] backdrop-blur-xl rounded-xl px-4 py-2 border border-white/[0.06]">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Client-Side</span>
              </div>
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Kembali ke Converter</span>
                <span className="sm:hidden">Kembali</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Download template & mulai konversi</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              <span className="gradient-text">Semua Converter XML</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Pilih dari <span className="text-emerald-400 font-semibold">25 template</span> converter XML Coretax DJP.
              Download template Excel siap pakai, isi data, dan konversi ke XML dengan mudah.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          >
            {[
              { icon: Database, label: 'Template', value: stats.templates, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { icon: Grid3X3, label: 'Kategori', value: stats.categories, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
              { icon: Layers, label: 'Workflow', value: stats.workflows, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
              { icon: CheckCircle2, label: 'Gratis', value: '100%', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`glass rounded-2xl p-4 flex items-center gap-3 ${stat.border} border`}
              >
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Search + Filter */}
      <section className="relative z-10 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            {/* Search input */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                placeholder="Cari template... (contoh: PPh 21, Faktur, SPT)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input rounded-xl pl-11 pr-4 py-3 text-sm"
              />
            </div>

            {/* Category filter tabs */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  activeCategory === 'all'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-glow'
                    : 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:bg-white/[0.06] hover:text-slate-300'
                }`}
              >
                Semua ({allTemplates.length})
              </button>
              {categories.map((cat) => {
                const CatIcon = iconMap[cat.icon] || FileText;
                const count = allTemplates.filter((t) => t.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                      activeCategory === cat.id
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-glow'
                        : 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:bg-white/[0.06] hover:text-slate-300'
                    }`}
                  >
                    <CatIcon className="w-3.5 h-3.5" />
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results count */}
      <section className="relative z-10 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs text-slate-500">
            Menampilkan <span className="text-emerald-400 font-medium">{filteredTemplates.length}</span> template
            {activeCategory !== 'all' && (
              <span> dalam <span className="text-slate-300">{categories.find((c) => c.id === activeCategory)?.name}</span></span>
            )}
            {searchQuery && (
              <span> untuk &ldquo;<span className="text-slate-300">{searchQuery}</span>&rdquo;</span>
            )}
          </p>
        </div>
      </section>

      {/* Template Grid */}
      <section className="relative z-10 flex-1 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {filteredTemplates.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-400 mb-2">Template tidak ditemukan</h3>
                <p className="text-sm text-slate-500">Coba ubah kata kunci atau filter kategori</p>
              </motion.div>
            ) : (
              <motion.div
                key={`${activeCategory}-${searchQuery}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    workflowCfg={workflowConfig[template.workflowType]}
                    onDownload={handleDownload}
                    onStartConvert={handleStartConvert}
                    isDownloading={downloadingId === template.id}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10">
        <div className="border-t border-white/[0.04] bg-[#0a0f0d]/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
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

// ============================================================
// Template Card Component
// ============================================================
function TemplateCard({
  template,
  workflowCfg,
  onDownload,
  onStartConvert,
  isDownloading,
}: {
  template: CoretaxTemplate;
  workflowCfg: { label: string; color: string; bgColor: string; borderColor: string };
  onDownload: (template: CoretaxTemplate, e: React.MouseEvent) => void;
  onStartConvert: (template: CoretaxTemplate) => void;
  isDownloading: boolean;
}) {
  const IconComponent = iconMap[template.icon] || FileText;
  const categoryObj = categories.find((c) => c.id === template.category);
  const headerCount = template.headerFields?.length ?? 0;
  const detailCount = template.detailFields.length;

  // Show first 5 detail field names
  const previewFields = template.detailFields.slice(0, 5);
  const moreCount = template.detailFields.length - 5;

  return (
    <motion.div
      variants={cardVariants}
      className="group relative rounded-2xl overflow-hidden card-hover-lift"
    >
      {/* Gradient border overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-[1] blur-sm" />

      <div className="relative h-full glass rounded-2xl border border-white/[0.08] group-hover:border-emerald-500/20 transition-colors duration-300 overflow-hidden flex flex-col">
        {/* Top accent line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="p-5 flex flex-col flex-1">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className={`w-11 h-11 rounded-xl ${workflowCfg.bgColor} ${workflowCfg.borderColor} border flex items-center justify-center shrink-0`}>
                <IconComponent className={`w-5 h-5 ${workflowCfg.color}`} />
              </div>
              <div className="min-w-0">
                {/* Code badge */}
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[11px] font-bold tracking-wider ${workflowCfg.color} ${workflowCfg.bgColor} px-2 py-0.5 rounded-md border ${workflowCfg.borderColor}`}>
                    {template.code}
                  </span>
                  {template.popular && (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      Populer
                    </span>
                  )}
                </div>
                {/* Name */}
                <h3 className="text-sm font-bold text-slate-100 truncate group-hover:text-emerald-300 transition-colors">
                  {template.name}
                </h3>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
            {template.description}
          </p>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Category */}
            <span className="text-[10px] text-slate-400 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-md">
              {categoryObj?.name}
            </span>
            {/* Workflow type */}
            <span className={`text-[10px] font-medium ${workflowCfg.color} ${workflowCfg.bgColor} ${workflowCfg.borderColor} border px-2 py-0.5 rounded-md`}>
              {workflowCfg.label}
            </span>
            {/* Steps count */}
            <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-md">
              <Clock className="w-2.5 h-2.5" />
              {template.steps.length} langkah
            </span>
          </div>

          {/* Field preview */}
          <div className="flex-1 mb-4">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Field utama
            </div>
            <div className="flex flex-wrap gap-1.5">
              {previewFields.map((field) => (
                <span
                  key={field.name}
                  className="text-[10px] text-slate-400 bg-white/[0.03] border border-white/[0.05] px-1.5 py-0.5 rounded"
                >
                  {field.label}
                  {field.required && <span className="text-rose-400 ml-0.5">*</span>}
                </span>
              ))}
              {moreCount > 0 && (
                <span className="text-[10px] text-emerald-400/70 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded">
                  +{moreCount} lainnya
                </span>
              )}
            </div>
          </div>

          {/* Field counts */}
          <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-4 pb-4 border-b border-white/[0.04]">
            {headerCount > 0 && (
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {headerCount} header field
              </span>
            )}
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              {detailCount} detail field
            </span>
            {template.lawanTransaksiFields && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Lawan Transaksi
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5">
            <button
              onClick={(e) => onDownload(template, e)}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl btn-primary-gradient btn-shine text-xs font-semibold disabled:opacity-50 disabled:cursor-wait"
            >
              {isDownloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Excel</span>
                </>
              )}
            </button>
            <button
              onClick={() => onStartConvert(template)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl btn-secondary-glass text-xs font-medium"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mulai Konversi</span>
              <ChevronRight className="w-3.5 h-3.5 sm:hidden" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
