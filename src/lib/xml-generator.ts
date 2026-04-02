// ============================================================
// Coretax XML Generator v2
// Type-specific XML structures for different workflows
// ============================================================

import type { CoretaxTemplate } from './templates';
import type { ColumnMapping, ParsedData } from './store';

/**
 * Generate XML based on template workflow type
 */
export function generateXml(
  template: CoretaxTemplate,
  data: ParsedData,
  columnMapping: ColumnMapping[],
  headerMapping: Record<string, string>,
  lawanTransaksi?: Record<string, string>
): string {
  switch (template.workflowType) {
    case 'bupot':
      return generateBupotXml(template, data, columnMapping, headerMapping);
    case 'faktur':
      return generateFakturXml(template, data, columnMapping, headerMapping, lawanTransaksi);
    case 'spt_tahunan':
      return generateSptTahunanXml(template, data, columnMapping);
    case 'spt_masa_ppn':
      return generateSptMasaPpnXml(template, data, columnMapping, headerMapping);
    case 'bea_meterai':
      return generateBeaMeteraiXml(template, data, columnMapping, headerMapping);
    case 'daftar_harta':
      return generateDaftarHartaXml(template, data, columnMapping);
    default:
      return generateGenericXml(template, data, columnMapping, headerMapping);
  }
}

// ============================================================
// BUPOT XML: <RootTag><Header>...<Detail><PenerimaPenghasilan>...
// ============================================================
function generateBupotXml(
  template: CoretaxTemplate,
  data: ParsedData,
  columnMapping: ColumnMapping[],
  headerMapping: Record<string, string>
): string {
  const doc = document.implementation.createDocument('', '', null);
  const root = doc.createElement(template.xmlRootTag);
  root.setAttribute('xmlns', 'http://www.djp.go.id/coretax/xml');

  // Header
  if (template.headerFields) {
    const headerEl = doc.createElement(template.xmlHeaderTag || 'Header');
    for (const field of template.headerFields) {
      const value = headerMapping[field.name] || '';
      if (value.trim()) {
        const el = doc.createElement(field.name);
        el.textContent = formatXmlValue(value, field.type);
        headerEl.appendChild(el);
      }
    }
    root.appendChild(headerEl);
  }

  // Detail
  if (template.detailFields && data.rows.length > 0) {
    const detailEl = doc.createElement(template.xmlDetailTag || 'Detail');
    for (const row of data.rows) {
      const itemEl = doc.createElement(template.xmlItemTag || 'PenerimaPenghasilan');
      for (const field of template.detailFields) {
        let value = '';
        for (const m of columnMapping) {
          if (m.targetField === field.name) {
            value = row[m.sourceColumn] || '';
            break;
          }
        }
        if (value.trim()) {
          const el = doc.createElement(field.name);
          el.textContent = formatXmlValue(value, field.type);
          itemEl.appendChild(el);
        }
      }
      detailEl.appendChild(itemEl);
    }
    root.appendChild(detailEl);
  }

  return serializeAndPrettyPrint(doc, root);
}

// ============================================================
// FAKTUR XML: <FK><FK>...<Detil><DetilItem>...
// ============================================================
function generateFakturXml(
  template: CoretaxTemplate,
  data: ParsedData,
  columnMapping: ColumnMapping[],
  headerMapping: Record<string, string>,
  lawanTransaksi?: Record<string, string>
): string {
  const doc = document.implementation.createDocument('', '', null);
  const root = doc.createElement(template.xmlRootTag);
  root.setAttribute('xmlns', 'http://www.djp.go.id/coretax/xml');

  // Header (FK wrapper)
  const fkEl = doc.createElement(template.xmlHeaderTag || 'FK');
  if (template.headerFields) {
    for (const field of template.headerFields) {
      const value = headerMapping[field.name] || '';
      if (value.trim()) {
        const el = doc.createElement(field.name);
        el.textContent = formatXmlValue(value, field.type);
        fkEl.appendChild(el);
      }
    }
  }

  // Lawan Transaksi
  if (lawanTransaksi && template.lawanTransaksiFields) {
    const ltEl = doc.createElement('LawanTransaksi');
    for (const field of template.lawanTransaksiFields) {
      const value = lawanTransaksi[field.name] || '';
      if (value.trim()) {
        const el = doc.createElement(field.name);
        el.textContent = formatXmlValue(value, field.type);
        ltEl.appendChild(el);
      }
    }
    fkEl.appendChild(ltEl);
  }

  // Detail Items
  if (template.detailFields && data.rows.length > 0) {
    const detilEl = doc.createElement(template.xmlDetailTag || 'Detil');
    for (const row of data.rows) {
      const itemEl = doc.createElement(template.xmlItemTag || 'DetilItem');
      for (const field of template.detailFields) {
        let value = '';
        for (const m of columnMapping) {
          if (m.targetField === field.name) {
            value = row[m.sourceColumn] || '';
            break;
          }
        }
        if (value.trim()) {
          const el = doc.createElement(field.name);
          el.textContent = formatXmlValue(value, field.type);
          itemEl.appendChild(el);
        }
      }
      detilEl.appendChild(itemEl);
    }
    fkEl.appendChild(detilEl);
  }

  root.appendChild(fkEl);
  return serializeAndPrettyPrint(doc, root);
}

// ============================================================
// SPT TAHUNAN XML: <RootTag><DaftarXXX><XXX>...
// ============================================================
function generateSptTahunanXml(
  template: CoretaxTemplate,
  data: ParsedData,
  columnMapping: ColumnMapping[]
): string {
  const doc = document.implementation.createDocument('', '', null);
  const root = doc.createElement(template.xmlRootTag);
  root.setAttribute('xmlns', 'http://www.djp.go.id/coretax/xml');

  if (template.detailFields && data.rows.length > 0) {
    const detailEl = doc.createElement(template.xmlDetailTag || 'Detail');
    for (const row of data.rows) {
      const itemEl = doc.createElement(template.xmlItemTag || 'Item');
      for (const field of template.detailFields) {
        let value = '';
        for (const m of columnMapping) {
          if (m.targetField === field.name) {
            value = row[m.sourceColumn] || '';
            break;
          }
        }
        if (value.trim()) {
          const el = doc.createElement(field.name);
          el.textContent = formatXmlValue(value, field.type);
          itemEl.appendChild(el);
        }
      }
      detailEl.appendChild(itemEl);
    }
    root.appendChild(detailEl);
  }

  return serializeAndPrettyPrint(doc, root);
}

// ============================================================
// SPT MASA PPN XML: <SPTMasaPPN><Header>...<LampiranC>...
// ============================================================
function generateSptMasaPpnXml(
  template: CoretaxTemplate,
  data: ParsedData,
  columnMapping: ColumnMapping[],
  headerMapping: Record<string, string>
): string {
  const doc = document.implementation.createDocument('', '', null);
  const root = doc.createElement(template.xmlRootTag);
  root.setAttribute('xmlns', 'http://www.djp.go.id/coretax/xml');

  // Header
  if (template.headerFields) {
    const headerEl = doc.createElement(template.xmlHeaderTag || 'Header');
    for (const field of template.headerFields) {
      const value = headerMapping[field.name] || '';
      if (value.trim()) {
        const el = doc.createElement(field.name);
        el.textContent = formatXmlValue(value, field.type);
        headerEl.appendChild(el);
      }
    }
    root.appendChild(headerEl);
  }

  // Detail
  if (template.detailFields && data.rows.length > 0) {
    const detailEl = doc.createElement(template.xmlDetailTag || 'Detail');
    for (const row of data.rows) {
      const itemEl = doc.createElement(template.xmlItemTag || 'Item');
      for (const field of template.detailFields) {
        let value = '';
        for (const m of columnMapping) {
          if (m.targetField === field.name) {
            value = row[m.sourceColumn] || '';
            break;
          }
        }
        if (value.trim()) {
          const el = doc.createElement(field.name);
          el.textContent = formatXmlValue(value, field.type);
          itemEl.appendChild(el);
        }
      }
      detailEl.appendChild(itemEl);
    }
    root.appendChild(detailEl);
  }

  return serializeAndPrettyPrint(doc, root);
}

// ============================================================
// BEA METERAI XML: <SPTBeaMeterai><Header>...<Lampiran3/4>...
// ============================================================
function generateBeaMeteraiXml(
  template: CoretaxTemplate,
  data: ParsedData,
  columnMapping: ColumnMapping[],
  headerMapping: Record<string, string>
): string {
  const doc = document.implementation.createDocument('', '', null);
  const root = doc.createElement(template.xmlRootTag);
  root.setAttribute('xmlns', 'http://www.djp.go.id/coretax/xml');

  // Header
  if (template.headerFields) {
    const headerEl = doc.createElement(template.xmlHeaderTag || 'Header');
    for (const field of template.headerFields) {
      const value = headerMapping[field.name] || '';
      if (value.trim()) {
        const el = doc.createElement(field.name);
        el.textContent = formatXmlValue(value, field.type);
        headerEl.appendChild(el);
      }
    }
    root.appendChild(headerEl);
  }

  // Detail
  if (template.detailFields && data.rows.length > 0) {
    const detailEl = doc.createElement(template.xmlDetailTag || 'Detail');
    for (const row of data.rows) {
      const itemEl = doc.createElement(template.xmlItemTag || 'Item');
      for (const field of template.detailFields) {
        let value = '';
        for (const m of columnMapping) {
          if (m.targetField === field.name) {
            value = row[m.sourceColumn] || '';
            break;
          }
        }
        if (value.trim()) {
          const el = doc.createElement(field.name);
          el.textContent = formatXmlValue(value, field.type);
          itemEl.appendChild(el);
        }
      }
      detailEl.appendChild(itemEl);
    }
    root.appendChild(detailEl);
  }

  return serializeAndPrettyPrint(doc, root);
}

// ============================================================
// DAFTAR HARTA XML: <DaftarHarta><DaftarHarta><Harta>...
// ============================================================
function generateDaftarHartaXml(
  template: CoretaxTemplate,
  data: ParsedData,
  columnMapping: ColumnMapping[]
): string {
  const doc = document.implementation.createDocument('', '', null);
  const root = doc.createElement(template.xmlRootTag);
  root.setAttribute('xmlns', 'http://www.djp.go.id/coretax/xml');

  if (template.detailFields && data.rows.length > 0) {
    const detailEl = doc.createElement(template.xmlDetailTag || 'DaftarHarta');
    for (const row of data.rows) {
      const itemEl = doc.createElement(template.xmlItemTag || 'Harta');
      for (const field of template.detailFields) {
        let value = '';
        for (const m of columnMapping) {
          if (m.targetField === field.name) {
            value = row[m.sourceColumn] || '';
            break;
          }
        }
        if (value.trim()) {
          const el = doc.createElement(field.name);
          el.textContent = formatXmlValue(value, field.type);
          itemEl.appendChild(el);
        }
      }
      detailEl.appendChild(itemEl);
    }
    root.appendChild(detailEl);
  }

  return serializeAndPrettyPrint(doc, root);
}

// ============================================================
// Generic fallback
// ============================================================
function generateGenericXml(
  template: CoretaxTemplate,
  data: ParsedData,
  columnMapping: ColumnMapping[],
  headerMapping: Record<string, string>
): string {
  const doc = document.implementation.createDocument('', '', null);
  const root = doc.createElement(template.xmlRootTag);
  root.setAttribute('xmlns', 'http://www.djp.go.id/coretax/xml');

  if (template.headerFields) {
    const headerEl = doc.createElement('Header');
    for (const field of template.headerFields) {
      const value = headerMapping[field.name] || '';
      if (value.trim()) {
        const el = doc.createElement(field.name);
        el.textContent = formatXmlValue(value, field.type);
        headerEl.appendChild(el);
      }
    }
    root.appendChild(headerEl);
  }

  if (template.detailFields && data.rows.length > 0) {
    const detailEl = doc.createElement('Detail');
    for (const row of data.rows) {
      const itemEl = doc.createElement('Record');
      for (const field of template.detailFields) {
        let value = '';
        for (const m of columnMapping) {
          if (m.targetField === field.name) {
            value = row[m.sourceColumn] || '';
            break;
          }
        }
        if (value.trim()) {
          const el = doc.createElement(field.name);
          el.textContent = formatXmlValue(value, field.type);
          itemEl.appendChild(el);
        }
      }
      detailEl.appendChild(itemEl);
    }
    root.appendChild(detailEl);
  }

  return serializeAndPrettyPrint(doc, root);
}

// ============================================================
// Utility functions
// ============================================================
function formatXmlValue(value: string, type: string): string {
  switch (type) {
    case 'currency':
    case 'number':
      return value.replace(/[^\d.,\-]/g, '');
    case 'npwp':
      return value.replace(/[\s.\-]/g, '');
    case 'date':
      return normalizeDate(value);
    default:
      return value.trim();
  }
}

function normalizeDate(value: string): string {
  const dmy = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.substring(0, 10);
  }
  return value.trim();
}

function serializeAndPrettyPrint(doc: Document, root: Element): string {
  doc.appendChild(root);
  const serializer = new XMLSerializer();
  let xmlString = serializer.serializeToString(root);
  xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlString;
  return prettyPrintXml(xmlString);
}

function prettyPrintXml(xml: string): string {
  const PADDING = '  ';
  let formatted = '';
  let indent = 0;

  const tokens = xml.replace(/>\s*</g, '>\n<').split('\n');

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('<?')) {
      formatted += trimmed + '\n';
    } else if (trimmed.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      formatted += PADDING.repeat(indent) + trimmed + '\n';
    } else if (trimmed.startsWith('<') && trimmed.endsWith('/>')) {
      formatted += PADDING.repeat(indent) + trimmed + '\n';
    } else if (trimmed.startsWith('<') && !trimmed.startsWith('</')) {
      formatted += PADDING.repeat(indent) + trimmed + '\n';
      if (!trimmed.includes('</') && !trimmed.endsWith('/>')) {
        indent++;
      }
    } else {
      formatted += PADDING.repeat(indent) + trimmed + '\n';
    }
  }

  return formatted.trimEnd();
}
