// ============================================================
// Coretax Validators v2
// Enhanced validation with NPWP Luhn, NSFP, NITKU, etc.
// ============================================================

import type { TemplateField, CoretaxTemplate } from './templates';
import type { ColumnMapping, ParsedData, ValidationError } from './store';

/**
 * Validate all rows against template rules
 */
export function validateData(
  template: CoretaxTemplate,
  data: ParsedData,
  columnMapping: ColumnMapping[],
  headerMapping: Record<string, string>,
  lawanTransaksi?: Record<string, string>
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate header fields
  if (template.headerFields) {
    for (const field of template.headerFields) {
      const value = headerMapping[field.name] || '';
      const fieldErrors = validateField(field, value, -1);
      errors.push(...fieldErrors);
    }
  }

  // Validate lawan transaksi fields (Faktur)
  if (template.lawanTransaksiFields && lawanTransaksi) {
    for (const field of template.lawanTransaksiFields) {
      const value = lawanTransaksi[field.name] || '';
      const fieldErrors = validateField(field, value, -1);
      errors.push(...fieldErrors);
    }
  }

  // Validate detail rows
  for (let i = 0; i < data.rows.length; i++) {
    const row = data.rows[i];
    for (const field of template.detailFields) {
      let value = '';
      for (const m of columnMapping) {
        if (m.targetField === field.name) {
          value = row[m.sourceColumn] || '';
          break;
        }
      }
      const fieldErrors = validateField(field, value, i);
      errors.push(...fieldErrors);
    }
  }

  // Cross-field validation
  const crossErrors = validateCrossFields(template, data, columnMapping, headerMapping);
  errors.push(...crossErrors);

  return errors;
}

function validateField(field: TemplateField, value: string, row: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmed = value.trim();

  if (field.required && !trimmed) {
    errors.push({
      row,
      field: field.name,
      message: `${field.label} wajib diisi`,
      severity: 'error',
    });
    return errors;
  }

  if (!trimmed) return errors;

  switch (field.type) {
    case 'npwp':
      validateNpwp(trimmed, field, row, errors);
      break;
    case 'number':
      validateNumber(trimmed, field, row, errors);
      break;
    case 'currency':
      validateCurrency(trimmed, field, row, errors);
      break;
    case 'date':
      validateDate(trimmed, field, row, errors);
      break;
    case 'text':
      validateTextField(trimmed, field, row, errors);
      break;
  }

  return errors;
}

// ============================================================
// NPWP Validation (Luhn Algorithm)
// ============================================================
function validateNpwp(value: string, field: TemplateField, row: number, errors: ValidationError[]) {
  const cleaned = value.replace(/[\s.\-]/g, '');

  if (!/^\d+$/.test(cleaned)) {
    errors.push({
      row,
      field: field.name,
      message: `${field.label} harus berisi angka saja`,
      severity: 'error',
    });
    return;
  }

  if (cleaned.length < 15 || cleaned.length > 16) {
    errors.push({
      row,
      field: field.name,
      message: `${field.label} harus 15-16 digit (sekarang: ${cleaned.length} digit)`,
      severity: 'error',
    });
    return;
  }

  // NPWP Luhn check for 15-digit NPWP
  if (cleaned.length === 15) {
    const isValid = validateNpwpLuhn(cleaned);
    if (!isValid) {
      errors.push({
        row,
        field: field.name,
        message: `${field.label} tidak valid (digit cek Luhn tidak cocok)`,
        severity: 'warning',
      });
    }
  }
}

/**
 * NPWP Luhn Algorithm validation
 * Indonesian NPWP uses a modified Luhn algorithm
 */
export function validateNpwpLuhn(npwp: string): boolean {
  if (npwp.length !== 15) return false;
  const digits = npwp.split('').map(Number);

  // NPWP Luhn: Multiply each digit by its position weight (9-1 for first 9 digits)
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (9 - i);
  }

  const remainder = sum % 11;
  const checkDigit = remainder <= 1 ? 0 : 11 - remainder;

  return digits[9] === checkDigit;
}

// ============================================================
// NIK (Nomor Induk Kependudukan) Validation
// ============================================================
export function validateNIK(nik: string): { valid: boolean; message?: string } {
  const cleaned = nik.replace(/[\s.\-]/g, '');

  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, message: 'NIK harus berisi angka saja' };
  }

  if (cleaned.length !== 16) {
    return { valid: false, message: `NIK harus 16 digit (sekarang: ${cleaned.length} digit)` };
  }

  // Check province code (first 2 digits)
  const province = parseInt(cleaned.substring(0, 2), 10);
  if (province < 1 || province > 99) {
    return { valid: false, message: 'Kode provinsi NIK tidak valid' };
  }

  return { valid: true };
}

// ============================================================
// NSFP (Nomor Seri Faktur Pajak) Validation - 17 digit
// ============================================================
export function validateNSFP(nsfp: string): { valid: boolean; message?: string } {
  const cleaned = nsfp.replace(/[\s.\-]/g, '');

  if (!/^[\dA-Z]+$/.test(cleaned)) {
    return { valid: false, message: 'NSFP harus berisi angka dan huruf kapital' };
  }

  if (cleaned.length !== 17) {
    return { valid: false, message: `NSFP harus 17 karakter (sekarang: ${cleaned.length} karakter)` };
  }

  // Format: 3 digit (KPP) + 1 digit (kode) + 8 digit (tahun/bulan) + 5 digit (urut)
  // First 3 digits should be numeric (KPP code)
  if (!/^\d{3}/.test(cleaned)) {
    return { valid: false, message: '3 digit pertama NSFP harus angka (kode KPP)' };
  }

  return { valid: true };
}

// ============================================================
// NITKU Validation
// ============================================================
export function validateNITKU(nitku: string): { valid: boolean; message?: string } {
  const cleaned = nitku.trim();

  if (cleaned.length === 0) {
    return { valid: true }; // NITKU is optional
  }

  if (!/^[\d.\-]+$/.test(cleaned)) {
    return { valid: false, message: 'NITKU harus berisi angka' };
  }

  // NITKU format: typically 16 digits
  const digits = cleaned.replace(/[\.\-]/g, '');
  if (digits.length < 16 || digits.length > 20) {
    return { valid: false, message: `NITKU harus 16-20 digit (sekarang: ${digits.length} digit)` };
  }

  return { valid: true };
}

// ============================================================
// Kode Objek Pajak Validation
// ============================================================
export function validateKodeObjekPajak(kode: string): { valid: boolean; message?: string } {
  const pattern = /^\d{2}-\d{3}-\d{2}$/;
  if (!pattern.test(kode)) {
    return { valid: false, message: 'Format Kode Objek Pajak harus XX-XXX-XX (contoh: 21-100-01)' };
  }
  return { valid: true };
}

// ============================================================
// Kode Aset Validation
// ============================================================
export function validateKodeAset(kode: string): { valid: boolean; message?: string } {
  const pattern = /^\d{3}$/;
  if (!pattern.test(kode)) {
    return { valid: false, message: 'Kode Aset harus 3 digit (contoh: 301)' };
  }
  const num = parseInt(kode, 10);
  if (num < 301 || num > 312) {
    return { valid: false, message: 'Kode Aset tidak valid (harus antara 301-312)' };
  }
  return { valid: true };
}

// ============================================================
// StatusPTKP Validation
// ============================================================
const VALID_PTKP = ['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3', 'K/I/0', 'K/I/1', 'K/I/2', 'K/I/3'];

export function validateStatusPTKP(status: string): { valid: boolean; message?: string } {
  if (!VALID_PTKP.includes(status)) {
    return { valid: false, message: `Status PTKP tidak valid. Pilihan: ${VALID_PTKP.join(', ')}` };
  }
  return { valid: true };
}

// ============================================================
// Generic Field Validators
// ============================================================
function validateNumber(value: string, field: TemplateField, row: number, errors: ValidationError[]) {
  const cleaned = value.replace(/[,.\s]/g, '');
  if (!/^-?\d+$/.test(cleaned)) {
    errors.push({
      row,
      field: field.name,
      message: `${field.label} harus berupa angka`,
      severity: 'error',
    });
  }
}

function validateCurrency(value: string, field: TemplateField, row: number, errors: ValidationError[]) {
  const cleaned = value.replace(/[,.\s]/g, '');
  if (!/^-?\d+$/.test(cleaned)) {
    errors.push({
      row,
      field: field.name,
      message: `${field.label} harus berupa angka (mata uang)`,
      severity: 'error',
    });
    return;
  }

  const num = parseInt(cleaned, 10);
  if (num < 0) {
    errors.push({
      row,
      field: field.name,
      message: `${field.label} tidak boleh negatif`,
      severity: 'error',
    });
  }
}

function validateDate(value: string, field: TemplateField, row: number, errors: ValidationError[]) {
  // DD/MM/YYYY
  const dmy = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const d = parseInt(dmy[1], 10);
    const m = parseInt(dmy[2], 10);
    if (d < 1 || d > 31) {
      errors.push({ row, field: field.name, message: `${field.label}: hari tidak valid (1-31)`, severity: 'error' });
    }
    if (m < 1 || m > 12) {
      errors.push({ row, field: field.name, message: `${field.label}: bulan tidak valid (1-12)`, severity: 'error' });
    }
    return;
  }

  // YYYY-MM-DD
  const ymd = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) {
    const y = parseInt(ymd[1], 10);
    const m = parseInt(ymd[2], 10);
    if (y < 1900 || y > 2100) {
      errors.push({ row, field: field.name, message: `${field.label}: tahun tidak valid`, severity: 'error' });
    }
    if (m < 1 || m > 12) {
      errors.push({ row, field: field.name, message: `${field.label}: bulan tidak valid (1-12)`, severity: 'error' });
    }
    return;
  }

  errors.push({
    row,
    field: field.name,
    message: `${field.label}: format tanggal tidak valid (DD/MM/YYYY atau YYYY-MM-DD)`,
    severity: 'error',
  });
}

function validateTextField(value: string, field: TemplateField, row: number, errors: ValidationError[]) {
  // Special validations for specific field names
  if (field.name.includes('NSFP')) {
    const result = validateNSFP(value);
    if (!result.valid) {
      errors.push({ row, field: field.name, message: result.message || '', severity: 'error' });
    }
  }
  if (field.name.includes('NITKU')) {
    const result = validateNITKU(value);
    if (!result.valid) {
      errors.push({ row, field: field.name, message: result.message || '', severity: 'warning' });
    }
  }
  if (field.name === 'KodeObjekPajak') {
    const result = validateKodeObjekPajak(value);
    if (!result.valid) {
      errors.push({ row, field: field.name, message: result.message || '', severity: 'warning' });
    }
  }
  if (field.name === 'KodeAset') {
    const result = validateKodeAset(value);
    if (!result.valid) {
      errors.push({ row, field: field.name, message: result.message || '', severity: 'warning' });
    }
  }
  if (field.name === 'StatusPT' || field.name === 'StatusPTKP') {
    const result = validateStatusPTKP(value);
    if (!result.valid) {
      errors.push({ row, field: field.name, message: result.message || '', severity: 'error' });
    }
  }
}

// ============================================================
// Cross-field Validation
// ============================================================
function validateCrossFields(
  template: CoretaxTemplate,
  data: ParsedData,
  columnMapping: ColumnMapping[],
  headerMapping: Record<string, string>
): ValidationError[] {
  const errors: ValidationError[] = [];

  const getVal = (row: Record<string, string>, fieldName: string): string => {
    for (const m of columnMapping) {
      if (m.targetField === fieldName) return row[m.sourceColumn] || '';
    }
    return '';
  };

  const numVal = (v: string): number => {
    const cleaned = v.replace(/[,.\s]/g, '');
    const n = parseInt(cleaned, 10);
    return isNaN(n) ? 0 : n;
  };

  // BPMP: PPh21 should not exceed Penghasilan Bruto
  if (template.id === 'bpmp') {
    for (let i = 0; i < data.rows.length; i++) {
      const bruto = numVal(getVal(data.rows[i], 'PenghasilanBruto'));
      const pph21 = numVal(getVal(data.rows[i], 'PPh21'));
      if (bruto > 0 && pph21 > bruto) {
        errors.push({ row: i, field: 'PPh21', message: 'PPh 21 tidak boleh melebihi Penghasilan Bruto', severity: 'warning' });
      }
      // PTKP validation
      const neto = numVal(getVal(data.rows[i], 'Neto'));
      const pkp = numVal(getVal(data.rows[i], 'PKP'));
      if (neto > 0 && pkp > neto) {
        errors.push({ row: i, field: 'PKP', message: 'PKP tidak boleh melebihi Penghasilan Neto', severity: 'warning' });
      }
    }
  }

  // All Bupot: PPh fields should not be negative
  if (template.workflowType === 'bupot') {
    const pphFields = template.detailFields.filter((f) => f.name.includes('PPh'));
    for (const pphField of pphFields) {
      for (let i = 0; i < data.rows.length; i++) {
        const val = numVal(getVal(data.rows[i], pphField.name));
        if (val < 0) {
          errors.push({ row: i, field: pphField.name, message: `${pphField.label} tidak boleh negatif`, severity: 'error' });
        }
      }
    }
  }

  // Faktur: DPP and PPN checks
  if (template.workflowType === 'faktur') {
    for (let i = 0; i < data.rows.length; i++) {
      const dpp = numVal(getVal(data.rows[i], 'DPP'));
      const ppn = numVal(getVal(data.rows[i], 'PPN'));
      if (dpp > 0 && ppn > 0) {
        const expectedPPN = Math.round(dpp * 0.11);
        if (Math.abs(ppn - expectedPPN) > 1) {
          errors.push({
            row: i, field: 'PPN',
            message: `PPN (${ppn.toLocaleString('id-ID')}) tidak sesuai 11% dari DPP (${dpp.toLocaleString('id-ID')}). Diharapkan: ${expectedPPN.toLocaleString('id-ID')}`,
            severity: 'warning',
          });
        }
      }
    }
  }

  return errors;
}

// ============================================================
// Fuzzy Match
// ============================================================
export function fuzzyMatchField(
  sourceColumn: string,
  fields: TemplateField[]
): { field: TemplateField | null; confidence: 'exact' | 'partial' | 'none' } {
  const src = sourceColumn.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  // Exact match on field name
  const exactField = fields.find((f) => {
    const fname = f.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return fname === src;
  });
  if (exactField) return { field: exactField, confidence: 'exact' };

  // Match on keywords
  for (const field of fields) {
    if (!field.keywords) continue;
    for (const kw of field.keywords) {
      const kwNorm = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (src === kwNorm) return { field, confidence: 'exact' };
      if (src.includes(kwNorm) || kwNorm.includes(src)) {
        return { field, confidence: 'partial' };
      }
    }
  }

  // Partial match on field name
  for (const field of fields) {
    const fname = field.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (src.includes(fname) || fname.includes(src)) {
      return { field, confidence: 'partial' };
    }
  }

  return { field: null, confidence: 'none' };
}
