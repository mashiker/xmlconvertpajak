'use client';

import { useState } from 'react';
import { useConverterStore } from '@/lib/store';
import { categories, getTemplatesByCategory } from '@/lib/templates';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Receipt, Building2, User, Calculator,
  Stamp, ListChecks, Search, Star, ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CoretaxTemplate } from '@/lib/templates';

const iconMap: Record<string, LucideIcon> = {
  FileText, Receipt, Building2, User, Calculator, Stamp, ListChecks,
};

const workflowLabels: Record<string, string> = {
  bupot: 'Bupot',
  faktur: 'Faktur',
  spt_tahunan: 'SPT Thn',
  spt_masa_ppn: 'PPN',
  bea_meterai: 'Meterai',
  daftar_harta: 'Harta',
};

const workflowColors: Record<string, string> = {
  bupot: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  faktur: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  spt_tahunan: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  spt_masa_ppn: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  bea_meterai: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  daftar_harta: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
};

export function TemplateSelector() {
  const [searchQuery, setSearchQuery] = useState('');
  const selectedTemplate = useConverterStore((s) => s.selectedTemplate);
  const setSelectedTemplate = useConverterStore((s) => s.setSelectedTemplate);
  const nextStep = useConverterStore((s) => s.nextStep);

  const filteredTemplates = searchQuery
    ? categories.flatMap((cat) =>
        getTemplatesByCategory(cat.id).filter(
          (t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : [];

  const handleSelect = (template: CoretaxTemplate) => {
    setSelectedTemplate(template);
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* Hero Section */}
      <div className="text-center space-y-4 relative">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold gradient-text inline-block">
            Pilih Template XML
          </h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-sm lg:text-base max-w-lg mx-auto"
        >
          Pilih template sesuai jenis dokumen perpajakan yang ingin Anda buat.
          Mendukung {categories.reduce((a, c) => a + getTemplatesByCategory(c.id).length, 0)} template DJP Coretax.
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative max-w-md mx-auto"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Cari template (nama, kode, deskripsi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 glass-input h-11 rounded-xl text-sm"
          />
        </motion.div>
      </div>

      {/* Search Results */}
      <AnimatePresence mode="wait">
        {searchQuery ? (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template, i) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                  >
                    <TemplateCard
                      template={template}
                      isSelected={selectedTemplate?.id === template.id}
                      onClick={() => handleSelect(template)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-500">Tidak ada template yang cocok dengan &ldquo;{searchQuery}&rdquo;</p>
              </div>
            )}
          </motion.div>
        ) : (
          /* Category Tabs */
          <motion.div key="tabs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Tabs defaultValue={categories[0].id} className="w-full">
              <div className="flex justify-center mb-6">
                <TabsList className="flex flex-wrap h-auto gap-1.5 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-2 rounded-2xl max-w-3xl">
                  {categories.map((cat) => {
                    const Icon = iconMap[cat.icon] || FileText;
                    const count = getTemplatesByCategory(cat.id).length;
                    return (
                      <TabsTrigger
                        key={cat.id}
                        value={cat.id}
                        className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-300 data-[state=active]:border-emerald-500/30 data-[state=active]:shadow-[0_0_12px_rgba(16,185,129,0.1)] data-[state=active]:border rounded-lg px-3 py-2 transition-all duration-200 border border-transparent text-slate-500 hover:text-slate-300"
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{cat.name}</span>
                        <span className="sm:hidden">{cat.name.split(' ')[0]}</span>
                        <Badge variant="secondary" className="text-[10px] bg-white/[0.06] text-slate-400 px-1.5 py-0 border-0">
                          {count}
                        </Badge>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              {categories.map((cat) => (
                <TabsContent key={cat.id} value={cat.id} className="mt-2">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-200">{cat.name}</h3>
                      <span className="text-sm text-slate-500">{cat.description}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getTemplatesByCategory(cat.id).map((template, i) => (
                        <motion.div
                          key={template.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.3 }}
                        >
                          <TemplateCard
                            template={template}
                            isSelected={selectedTemplate?.id === template.id}
                            onClick={() => handleSelect(template)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TemplateCard({
  template,
  isSelected,
  onClick,
}: {
  template: CoretaxTemplate;
  isSelected: boolean;
  onClick: () => void;
}) {
  const catInfo = categories.find((c) => c.id === template.category);
  const Icon = catInfo ? (iconMap[catInfo.icon] || FileText) : FileText;
  const wfColor = workflowColors[template.workflowType] || workflowColors.bupot;
  const wfLabel = workflowLabels[template.workflowType] || template.workflowType;
  const stepCount = template.steps.length;

  return (
    <div
      className={cn(
        'group relative rounded-2xl p-[1px] cursor-pointer transition-all duration-300 card-hover-lift',
        'hover:shadow-emerald-glow',
      )}
      onClick={onClick}
    >
      {/* Gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/50 via-teal-500/30 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] group-hover:from-white/[0.12] group-hover:to-white/[0.05] transition-all duration-300" />

      <div className="relative rounded-2xl bg-[#111a16]/90 backdrop-blur-xl border border-white/[0.08] group-hover:border-white/[0.15] p-4 flex gap-3.5">
        <div className={cn(
          'flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300',
          isSelected
            ? 'bg-emerald-500 text-black shadow-[0_0_16px_rgba(16,185,129,0.3)]'
            : 'bg-white/[0.06] text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-400'
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 bg-white/[0.06] text-slate-400 border-0">
              {template.code}
            </Badge>
            {template.popular && (
              <Badge className="text-[10px] px-1.5 py-0 bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:bg-amber-500/15">
                <Star className="w-2.5 h-2.5 mr-0.5 fill-amber-400" />
                Populer
              </Badge>
            )}
            <Badge className={cn('text-[10px] px-1.5 py-0 border', wfColor)}>
              {wfLabel} · {stepCount} langkah
            </Badge>
          </div>
          <h4 className="font-semibold text-sm text-slate-200 truncate group-hover:text-emerald-300 transition-colors">
            {template.name}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 group-hover:text-slate-400 transition-colors">
            {template.description}
          </p>
        </div>
        <ChevronRight className={cn(
          'w-4 h-4 self-center flex-shrink-0 transition-all duration-300',
          isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-slate-600 group-hover:text-emerald-500/60 group-hover:translate-x-0.5'
        )} />
      </div>
    </div>
  );
}
