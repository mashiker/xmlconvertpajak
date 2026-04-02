import { NextRequest, NextResponse } from 'next/server';
import { getTemplateById } from '@/lib/templates';
import type { TemplateField } from '@/lib/templates';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const XLSX = require('xlsx');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = getTemplateById(id);

  if (!template) {
    return NextResponse.json(
      { error: 'Template tidak ditemukan', templateId: id },
      { status: 404 }
    );
  }

  try {
    const wb = XLSX.utils.book_new();

    // ---- Sheet: Header (if template has headerFields) ----
    if (template.headerFields && template.headerFields.length > 0) {
      const headerRow = template.headerFields.map((f) => f.label);
      const exampleRow = template.headerFields.map((f) => getPlaceholderValue(f));

      const wsData = [headerRow, exampleRow];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Style: column widths
      ws['!cols'] = template.headerFields.map((f) => ({
        wch: Math.max(f.label.length + 4, 16),
      }));

      // Style header row with emerald background
      styleHeaderRow(ws, headerRow.length);

      XLSX.utils.book_append_sheet(wb, ws, 'Header');
    }

    // ---- Sheet: Detail ----
    if (template.detailFields && template.detailFields.length > 0) {
      const detailHeaderRow = template.detailFields.map((f) => f.label);
      const detailExampleRow = template.detailFields.map((f) => getPlaceholderValue(f));
      // Empty row for data entry
      const emptyRow = template.detailFields.map(() => '');

      const wsData = [detailHeaderRow, detailExampleRow, emptyRow];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      ws['!cols'] = template.detailFields.map((f) => ({
        wch: Math.max(f.label.length + 4, 16),
      }));

      styleHeaderRow(ws, detailHeaderRow.length);

      XLSX.utils.book_append_sheet(wb, ws, 'Detail');
    }

    // ---- Sheet: Lawan Transaksi (if present) ----
    if (
      template.lawanTransaksiFields &&
      template.lawanTransaksiFields.length > 0
    ) {
      const ltHeaderRow = template.lawanTransaksiFields.map((f) => f.label);
      const ltExampleRow = template.lawanTransaksiFields.map((f) =>
        getPlaceholderValue(f)
      );
      const emptyRow = template.lawanTransaksiFields.map(() => '');

      const wsData = [ltHeaderRow, ltExampleRow, emptyRow];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      ws['!cols'] = template.lawanTransaksiFields.map((f) => ({
        wch: Math.max(f.label.length + 4, 18),
      }));

      styleHeaderRow(ws, ltHeaderRow.length);

      XLSX.utils.book_append_sheet(wb, ws, 'Lawan Transaksi');
    }

    // ---- Sheet: Referensi (if template has dropdowns) ----
    if (template.dropdowns && template.dropdowns.length > 0) {
      const refData: string[][] = [];

      for (const dropdown of template.dropdowns) {
        // Section header row
        refData.push([dropdown.field, 'Kode', 'Label']);
        // Options
        for (const opt of dropdown.options) {
          refData.push([dropdown.field, opt.value, opt.label]);
        }
        // Empty separator row
        refData.push([]);
      }

      const ws = XLSX.utils.aoa_to_sheet(refData);
      ws['!cols'] = [{ wch: 22 }, { wch: 18 }, { wch: 40 }];

      // Style all section headers (first col, field name rows)
      let currentRow = 0;
      for (const dropdown of template.dropdowns) {
        const cellAddr = XLSX.utils.encode_cell({ r: currentRow, c: 0 });
        if (ws[cellAddr]) {
          ws[cellAddr].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '059669' } },
          };
        }
        for (let ci = 1; ci <= 2; ci++) {
          const cAddr = XLSX.utils.encode_cell({ r: currentRow, c: ci });
          if (ws[cAddr]) {
            ws[cAddr].s = {
              font: { bold: true, color: { rgb: 'FFFFFF' } },
              fill: { fgColor: { rgb: '059669' } },
            };
          }
        }
        currentRow += dropdown.options.length + 2;
      }

      XLSX.utils.book_append_sheet(wb, ws, 'Referensi');
    }

    // ---- Generate buffer ----
    const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }) as Buffer;

    // Clean filename: replace spaces and special chars
    const safeName = template.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Template_${template.code}_${safeName}.xlsx`;

    return new NextResponse(wbOut, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating Excel template:', error);
    return NextResponse.json(
      { error: 'Gagal membuat template Excel' },
      { status: 500 }
    );
  }
}

// ============================================================
// Helper: Get placeholder value based on field type
// ============================================================
function getPlaceholderValue(field: TemplateField): string {
  switch (field.type) {
    case 'npwp':
      return '000000000000000';
    case 'date':
      return '01/01/2025';
    case 'number':
      return '0';
    case 'currency':
      return '0';
    case 'boolean':
      return 'Ya';
    case 'select':
      return field.options && field.options.length > 0
        ? field.options[0].value
        : field.label;
    case 'text':
    default:
      return field.label;
  }
}

// ============================================================
// Helper: Style the header row (row 0) with emerald background
// ============================================================
function styleHeaderRow(
  ws: Record<string, { s?: Record<string, unknown> }>,
  colCount: number
) {
  for (let c = 0; c < colCount; c++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[cellAddr]) {
      ws[cellAddr].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
        fill: { fgColor: { rgb: '10B981' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '059669' } },
          bottom: { style: 'thin', color: { rgb: '059669' } },
          left: { style: 'thin', color: { rgb: '059669' } },
          right: { style: 'thin', color: { rgb: '059669' } },
        },
      };
    }
  }

  // Style example row (row 1) with light background
  for (let c = 0; c < colCount; c++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 1, c });
    if (ws[cellAddr]) {
      ws[cellAddr].s = {
        font: { color: { rgb: '94A3B8' }, italic: true, sz: 10 },
        fill: { fgColor: { rgb: '1A2B23' } },
        border: {
          bottom: { style: 'dotted', color: { rgb: '334155' } },
        },
      };
    }
  }
}
