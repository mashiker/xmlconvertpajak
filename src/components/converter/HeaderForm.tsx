'use client';

import { useConverterStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TemplateField } from '@/lib/templates';

export function HeaderForm() {
  const selectedTemplate = useConverterStore((s) => s.selectedTemplate);
  const headerMapping = useConverterStore((s) => s.headerMapping);
  const setHeaderMapping = useConverterStore((s) => s.setHeaderMapping);
  const nextStep = useConverterStore((s) => s.nextStep);
  const prevStep = useConverterStore((s) => s.prevStep);

  if (!selectedTemplate?.headerFields) return null;

  const fields = selectedTemplate.headerFields;
  const filledRequired = fields.filter((f) => f.required && headerMapping[f.name]?.trim()).length;
  const totalRequired = fields.filter((f) => f.required).length;
  const canContinue = filledRequired === totalRequired;

  const handleNPWPInput = (name: string, value: string) => {
    // Auto-format NPWP: XX.XXX.XXX.X-XXX.XXX
    const cleaned = value.replace(/[^\d]/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2 && cleaned.length <= 5) formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2);
    else if (cleaned.length > 5 && cleaned.length <= 8) formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2, 5) + '.' + cleaned.slice(5);
    else if (cleaned.length > 8 && cleaned.length <= 9) formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2, 5) + '.' + cleaned.slice(5, 8) + '.' + cleaned.slice(8);
    else if (cleaned.length > 9 && cleaned.length <= 12) formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2, 5) + '.' + cleaned.slice(5, 8) + '.' + cleaned.slice(8, 9) + '-' + cleaned.slice(9);
    else if (cleaned.length > 12) formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2, 5) + '.' + cleaned.slice(5, 8) + '.' + cleaned.slice(8, 9) + '-' + cleaned.slice(9, 12) + '.' + cleaned.slice(12, 15);

    setHeaderMapping({ ...headerMapping, [name]: formatted });
  };

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
          Isi Data Header
        </h2>
        <p className="text-slate-500 text-sm">
          Lengkapi informasi header untuk template <span className="text-emerald-600 font-semibold">{selectedTemplate.code} — {selectedTemplate.name}</span>
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        <Badge variant="secondary" className="badge-glass text-xs">
          <FileText className="w-3 h-3 mr-1 text-emerald-600" />
          {filledRequired}/{totalRequired} field wajib terisi
        </Badge>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {fields.map((field) => (
            <FieldInput
              key={field.name}
              field={field}
              value={headerMapping[field.name] || ''}
              onChange={(val) => {
                if (field.type === 'npwp') {
                  handleNPWPInput(field.name, val);
                } else {
                  setHeaderMapping({ ...headerMapping, [field.name]: val });
                }
              }}
            />
          ))}
        </div>
      </div>

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
          Lanjut
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: TemplateField;
  value: string;
  onChange: (val: string) => void;
}) {
  const isNPWP = field.type === 'npwp';

  return (
    <div className={field.type === 'number' ? 'sm:col-span-1' : ''} >
      <Label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
        {field.label}
        {field.required && <span className="text-rose-500">*</span>}
      </Label>

      {field.type === 'select' && field.options ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="glass-input h-10 rounded-xl text-sm">
            <SelectValue placeholder={`Pilih ${field.label}...`} />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            {field.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-slate-700 focus:bg-emerald-50 focus:text-emerald-600">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          placeholder={field.description || field.label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'glass-input h-10 rounded-xl text-sm font-mono',
            isNPWP && 'tracking-wider',
          )}
          type={field.type === 'number' ? 'number' : 'text'}
        />
      )}

      {field.description && field.type !== 'npwp' && (
        <p className="text-[10px] text-slate-400 mt-1">{field.description}</p>
      )}
    </div>
  );
}

function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
