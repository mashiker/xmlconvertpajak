'use client';

import { useConverterStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LawanTransaksiForm() {
  const selectedTemplate = useConverterStore((s) => s.selectedTemplate);
  const lawanTransaksi = useConverterStore((s) => s.lawanTransaksi);
  const setLawanTransaksi = useConverterStore((s) => s.setLawanTransaksi);
  const nextStep = useConverterStore((s) => s.nextStep);
  const prevStep = useConverterStore((s) => s.prevStep);

  if (!selectedTemplate?.lawanTransaksiFields) return null;

  const fields = selectedTemplate.lawanTransaksiFields;
  const filledRequired = fields.filter((f) => f.required && lawanTransaksi[f.name]?.trim()).length;
  const totalRequired = fields.filter((f) => f.required).length;
  const canContinue = filledRequired === totalRequired;

  const handleNPWPInput = (name: string, value: string) => {
    const cleaned = value.replace(/[^\d]/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2 && cleaned.length <= 5) formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2);
    else if (cleaned.length > 5 && cleaned.length <= 8) formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2, 5) + '.' + cleaned.slice(5);
    else if (cleaned.length > 8 && cleaned.length <= 9) formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2, 5) + '.' + cleaned.slice(5, 8) + '.' + cleaned.slice(8);
    else if (cleaned.length > 9 && cleaned.length <= 12) formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2, 5) + '.' + cleaned.slice(5, 8) + '.' + cleaned.slice(8, 9) + '-' + cleaned.slice(9);
    else if (cleaned.length > 12) formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2, 5) + '.' + cleaned.slice(5, 8) + '.' + cleaned.slice(8, 9) + '-' + cleaned.slice(9, 12) + '.' + cleaned.slice(12, 15);

    setLawanTransaksi({ ...lawanTransaksi, [name]: formatted });
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
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <h2 className="text-3xl lg:text-4xl font-extrabold gradient-text">
          Lawan Transaksi
        </h2>
        <p className="text-slate-500 text-sm">
          Masukkan data pembeli / penerima barang/jasa untuk faktur pajak
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        <Badge variant="secondary" className="badge-glass text-xs">
          <Users className="w-3 h-3 mr-1 text-amber-600" />
          {filledRequired}/{totalRequired} field wajib terisi
        </Badge>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {fields.map((field) => (
            <div key={field.name} className={field.name.includes('Alamat') ? 'sm:col-span-2' : ''}>
              <Label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                {field.label}
                {field.required && <span className="text-rose-500">*</span>}
              </Label>

              {field.name.includes('Alamat') ? (
                <Textarea
                  placeholder={field.description || field.label}
                  value={lawanTransaksi[field.name] || ''}
                  onChange={(e) => setLawanTransaksi({ ...lawanTransaksi, [field.name]: e.target.value })}
                  className="glass-input rounded-xl text-sm min-h-[80px]"
                />
              ) : (
                <Input
                  placeholder={field.description || field.label}
                  value={lawanTransaksi[field.name] || ''}
                  onChange={(e) => {
                    if (field.type === 'npwp') {
                      handleNPWPInput(field.name, e.target.value);
                    } else {
                      setLawanTransaksi({ ...lawanTransaksi, [field.name]: e.target.value });
                    }
                  }}
                  className={`glass-input h-10 rounded-xl text-sm ${field.type === 'npwp' ? 'font-mono tracking-wider' : ''}`}
                />
              )}
            </div>
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
