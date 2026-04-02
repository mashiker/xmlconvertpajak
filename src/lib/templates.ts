// ============================================================
// Coretax XML Converter — Template Definitions v2
// Type-specific workflows with structured field definitions
// ============================================================

export type FieldType = 'text' | 'number' | 'date' | 'npwp' | 'currency' | 'select' | 'boolean';
export type WorkflowType = 'bupot' | 'faktur' | 'spt_tahunan' | 'spt_masa_ppn' | 'bea_meterai' | 'daftar_harta';
export type StepType = 'select_template' | 'header_form' | 'lawan_transaksi' | 'upload' | 'column_mapping' | 'validate_edit' | 'generate_xml';

export interface TemplateField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  description?: string;
  validation?: string;
  options?: { value: string; label: string }[];
  keywords?: string[];
  width?: 'sm' | 'md' | 'lg' | 'full';
}

export interface WizardStep {
  label: string;
  description: string;
  type: StepType;
  optional: boolean;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface CoretaxTemplate {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  popular?: boolean;
  icon: string;

  // TYPE-SPECIFIC
  workflowType: WorkflowType;

  // Steps definition
  steps: WizardStep[];

  // Header fields (null if no header section)
  headerFields: TemplateField[] | null;

  // Detail/line-item fields
  detailFields: TemplateField[];

  // Lawan Transaksi (only for Faktur)
  lawanTransaksiFields?: TemplateField[];

  // Multi-sheet support
  sheets?: { name: string; description: string }[];

  // Reference dropdowns
  dropdowns?: { field: string; options: { value: string; label: string }[] }[];

  // XML structure
  xmlRootTag: string;
  xmlHeaderTag?: string;
  xmlDetailTag?: string;
  xmlItemTag?: string;
}

// ============================================================
// Template Categories
// ============================================================
export const categories: TemplateCategory[] = [
  { id: 'bupot-pph', name: 'Bupot PPh', description: 'Bukti Potong Pajak Penghasilan', icon: 'FileText' },
  { id: 'faktur-pajak', name: 'Faktur Pajak', description: 'Faktur Pajak & Dokumen Lain', icon: 'Receipt' },
  { id: 'spt-tahunan-badan', name: 'SPT Tahunan Badan', description: 'SPT Tahunan Pajak Badan', icon: 'Building2' },
  { id: 'spt-tahunan-op', name: 'SPT Tahunan OP', description: 'SPT Tahunan Pajak Orang Pribadi', icon: 'User' },
  { id: 'spt-masa-ppn', name: 'SPT Masa PPN', description: 'SPT Masa Pajak Pertambahan Nilai', icon: 'Calculator' },
  { id: 'spt-bea-meterai', name: 'SPT Bea Meterai', description: 'SPT Masa Bea Meterai', icon: 'Stamp' },
  { id: 'daftar-harta', name: 'Daftar Harta', description: 'Daftar Harta & Penyelesaian Pajak', icon: 'ListChecks' },
];

// ============================================================
// Field builders
// ============================================================
const ff = (
  name: string, label: string, type: FieldType, required: boolean,
  opts?: Partial<TemplateField>
): TemplateField => ({ name, label, type, required, ...opts });

const npwpField = (prefix = '', required = true): TemplateField =>
  ff(`${prefix}NPWP`, `${prefix ? prefix + ' ' : ''}NPWP`, 'npwp', required, {
    description: 'Nomor Pokok Wajib Pajak (15-16 digit)',
    keywords: ['npwp', 'nomor pokok', 'no npwp', 'nik'],
  });

const masaPajakOpts = { value: 'MasaPajak', options: [
  { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' }, { value: '04', label: 'April' },
  { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' }, { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
]};

const statusPTKPOpts = { value: 'StatusPT', options: [
  { value: 'TK/0', label: 'TK/0' }, { value: 'TK/1', label: 'TK/1' },
  { value: 'TK/2', label: 'TK/2' }, { value: 'TK/3', label: 'TK/3' },
  { value: 'K/0', label: 'K/0' }, { value: 'K/1', label: 'K/1' },
  { value: 'K/2', label: 'K/2' }, { value: 'K/3', label: 'K/3' },
  { value: 'K/I/0', label: 'K/I/0' }, { value: 'K/I/1', label: 'K/I/1' },
  { value: 'K/I/2', label: 'K/I/2' }, { value: 'K/I/3', label: 'K/I/3' },
]};

const kodeObjekPajakOpts = { field: 'KodeObjekPajak', options: [
  { value: '21-100-01', label: '21-100-01 Pegawai Tetap' },
  { value: '21-100-02', label: '21-100-02 Pegawai Tidak Tetap' },
  { value: '21-100-03', label: '21-100-03 Tenaga Ahli' },
  { value: '21-100-04', label: '21-100-04 Dewan Komisaris/Direksi' },
  { value: '21-100-05', label: '21-100-05 Pensiun' },
  { value: '21-100-06', label: '21-100-06 Bunga Deposito' },
  { value: '21-100-07', label: '21-100-07 Hadiah Undian' },
  { value: '23-100-01', label: '23-100-01 Sewa' },
  { value: '23-100-02', label: '23-100-02 Jasa Teknik' },
  { value: '23-100-03', label: '23-100-03 Jasa Konsultasi' },
  { value: '23-100-04', label: '23-100-04 Jasa Lainnya' },
  { value: '15-100-01', label: '15-100-01 Dividen' },
  { value: '15-100-02', label: '15-100-02 Bunga' },
  { value: '15-100-03', label: '15-100-03 Royalti' },
  { value: '26-100-01', label: '26-100-01 Bunga' },
  { value: '26-100-02', label: '26-100-02 Royalti' },
  { value: '26-100-03', label: '26-100-03 Jasa' },
  { value: '26-100-04', label: '26-100-04 Hadiah' },
]};

// ============================================================
// COMMON WORKFLOW STEP DEFINITIONS
// ============================================================
const BUPOT_STEPS: WizardStep[] = [
  { label: 'Pilih Template', description: 'Pilih jenis Bukti Potong', type: 'select_template', optional: false },
  { label: 'Isi Header', description: 'Data Pemotong & Masa Pajak', type: 'header_form', optional: false },
  { label: 'Upload Data', description: 'Import file Excel/CSV', type: 'upload', optional: false },
  { label: 'Peta Kolom', description: 'Petakan kolom ke field XML', type: 'column_mapping', optional: false },
  { label: 'Validasi & Edit', description: 'Periksa & perbaiki data', type: 'validate_edit', optional: false },
  { label: 'Generate XML', description: 'Konversi ke XML Coretax', type: 'generate_xml', optional: false },
];

const FAKTUR_STEPS: WizardStep[] = [
  { label: 'Pilih Template', description: 'Pilih jenis Faktur Pajak', type: 'select_template', optional: false },
  { label: 'Isi Header', description: 'Data PKP & Faktur', type: 'header_form', optional: false },
  { label: 'Lawan Transaksi', description: 'Data Pembeli', type: 'lawan_transaksi', optional: false },
  { label: 'Upload Data', description: 'Import data barang/jasa', type: 'upload', optional: false },
  { label: 'Validasi & Edit', description: 'Periksa & perbaiki data', type: 'validate_edit', optional: false },
  { label: 'Generate XML', description: 'Konversi ke XML Coretax', type: 'generate_xml', optional: false },
];

const SPT_TAHUNAN_STEPS: WizardStep[] = [
  { label: 'Pilih Template', description: 'Pilih jenis lampiran', type: 'select_template', optional: false },
  { label: 'Upload Data', description: 'Import file Excel/CSV', type: 'upload', optional: false },
  { label: 'Peta Kolom', description: 'Petakan kolom ke field XML', type: 'column_mapping', optional: false },
  { label: 'Validasi & Edit', description: 'Periksa & perbaiki data', type: 'validate_edit', optional: false },
  { label: 'Generate XML', description: 'Konversi ke XML Coretax', type: 'generate_xml', optional: false },
];

const SPT_MASA_PPN_STEPS: WizardStep[] = [
  { label: 'Pilih Template', description: 'Pilih jenis lampiran', type: 'select_template', optional: false },
  { label: 'Isi Header', description: 'Data PKP & Masa Pajak', type: 'header_form', optional: false },
  { label: 'Upload Data', description: 'Import file Excel/CSV', type: 'upload', optional: false },
  { label: 'Peta Kolom', description: 'Petakan kolom ke field XML', type: 'column_mapping', optional: false },
  { label: 'Validasi & Edit', description: 'Periksa & perbaiki data', type: 'validate_edit', optional: false },
  { label: 'Generate XML', description: 'Konversi ke XML Coretax', type: 'generate_xml', optional: false },
];

const BEA_METERAI_STEPS: WizardStep[] = [
  { label: 'Pilih Template', description: 'Pilih jenis lampiran', type: 'select_template', optional: false },
  { label: 'Isi Header', description: 'Data Pemungut', type: 'header_form', optional: false },
  { label: 'Upload Data', description: 'Import data meterai', type: 'upload', optional: false },
  { label: 'Validasi & Edit', description: 'Periksa & perbaiki data', type: 'validate_edit', optional: false },
  { label: 'Generate XML', description: 'Konversi ke XML Coretax', type: 'generate_xml', optional: false },
];

const DAFTAR_HARTA_STEPS: WizardStep[] = [
  { label: 'Pilih Kategori', description: 'Pilih kategori harta', type: 'select_template', optional: false },
  { label: 'Upload Data', description: 'Import data harta', type: 'upload', optional: false },
  { label: 'Validasi & Edit', description: 'Periksa & perbaiki data', type: 'validate_edit', optional: false },
  { label: 'Generate XML', description: 'Konversi ke XML Coretax', type: 'generate_xml', optional: false },
];

// ============================================================
// BUPOT PPH TEMPLATES (Workflow Type A)
// ============================================================
const bupotHeader = (extraFields?: TemplateField[]): TemplateField[] => [
  npwpField('Pemotong'),
  ff('NamaPemotong', 'Nama Pemotong', 'text', true, { description: 'Nama Wajib Pajak yang memotong pajak', keywords: ['nama pemotong', 'nama perusahaan'] }),
  ff('MasaPajak', 'Masa Pajak', 'select', true, { ...masaPajakOpts, description: 'Masa pajak (bulan)', keywords: ['masa', 'bulan'] }),
  ff('TahunPajak', 'Tahun Pajak', 'number', true, { description: 'Tahun pajak (4 digit)', keywords: ['tahun'] }),
  ff('NITKU', 'NITKU', 'text', false, { description: 'Nomor Identitas Tempat Kegiatan Usaha', keywords: ['nitku', 'tempat kegiatan'] }),
  ...(extraFields || []),
];

const bupotDetail = (fields: TemplateField[]): TemplateField[] => [
  npwpField('', true),
  ff('Nama', 'Nama WP', 'text', true, { keywords: ['nama', 'nama wp', 'nama karyawan'] }),
  ff('Alamat', 'Alamat WP', 'text', false, { keywords: ['alamat'] }),
  ...fields,
];

const BPMP: CoretaxTemplate = {
  id: 'bpmp', code: 'BPMP', name: 'Bukti Potong PPh 21', category: 'bupot-pph',
  description: 'Bukti Potong PPh Pasal 21 untuk pegawai tetap & tidak tetap',
  popular: true, icon: 'FileText', workflowType: 'bupot', steps: BUPOT_STEPS,
  headerFields: bupotHeader(),
  detailFields: bupotDetail([
    ff('StatusPT', 'Status PTKP', 'select', true, { ...statusPTKPOpts, keywords: ['status', 'ptkp'] }),
    ff('Jabatan', 'Jabatan', 'text', false, { keywords: ['jabatan', 'posisi'] }),
    ff('PenghasilanBruto', 'Penghasilan Bruto', 'currency', true, { keywords: ['bruto', 'penghasilan bruto', 'gaji', 'gross'] }),
    ff('BiayaJabatan', 'Biaya Jabatan', 'currency', true, { keywords: ['biaya jabatan', 'bj'] }),
    ff('IuranPensiun', 'Iuran Pensiun', 'currency', true, { keywords: ['pensiun', 'iuran pensiun', 'jht'] }),
    ff('Neto', 'Penghasilan Neto', 'currency', true, { keywords: ['neto', 'penghasilan neto'] }),
    ff('PTKP', 'PTKP', 'currency', true, { keywords: ['ptkp', 'tkp', 'tidak kena pajak'] }),
    ff('PKP', 'PKP', 'currency', true, { keywords: ['pkp', 'kena pajak'] }),
    ff('PPh21', 'PPh Terutang', 'currency', true, { keywords: ['pph 21', 'pph', 'pajak terutang'] }),
  ]),
  dropdowns: [kodeObjekPajakOpts, statusPTKPOpts],
  xmlRootTag: 'BPMP', xmlHeaderTag: 'Header', xmlDetailTag: 'Detail', xmlItemTag: 'PenerimaPenghasilan',
};

const BP21: CoretaxTemplate = {
  id: 'bp21', code: 'BP21', name: 'Bukti Potong PPh 21 Final', category: 'bupot-pph',
  description: 'Bukti potong PPh 21 atas penghasilan bersifat final',
  icon: 'FileText', workflowType: 'bupot', steps: BUPOT_STEPS,
  headerFields: bupotHeader(),
  detailFields: bupotDetail([
    ff('JenisPenghasilan', 'Jenis Penghasilan', 'text', true, { keywords: ['jenis', 'penghasilan'] }),
    ff('Bruto', 'Penghasilan Bruto', 'currency', true, { keywords: ['bruto', 'gross'] }),
    ff('PPhFinal', 'PPh Final', 'currency', true, { keywords: ['pph final', 'pajak'] }),
  ]),
  dropdowns: [kodeObjekPajakOpts],
  xmlRootTag: 'BP21', xmlHeaderTag: 'Header', xmlDetailTag: 'Detail', xmlItemTag: 'PenerimaPenghasilan',
};

const BPA1: CoretaxTemplate = {
  id: 'bpa1', code: 'BPA1', name: 'Bukti Potong PPh 23', category: 'bupot-pph',
  description: 'Bukti potong Pajak Penghasilan Pasal 23',
  popular: true, icon: 'FileText', workflowType: 'bupot', steps: BUPOT_STEPS,
  headerFields: bupotHeader(),
  detailFields: bupotDetail([
    ff('JenisPenghasilan', 'Jenis Penghasilan', 'text', true, { keywords: ['jenis penghasilan'] }),
    ff('Bruto', 'Dasar Pengenaan Pajak', 'currency', true, { keywords: ['bruto', 'dpp', 'dasar pengenaan'] }),
    ff('Tarif', 'Tarif (%)', 'number', true, { keywords: ['tarif', 'rate'] }),
    ff('PPh23', 'PPh Pasal 23', 'currency', true, { keywords: ['pph 23', 'pajak', 'pph'] }),
  ]),
  dropdowns: [kodeObjekPajakOpts],
  xmlRootTag: 'BPA1', xmlHeaderTag: 'Header', xmlDetailTag: 'Detail', xmlItemTag: 'PenerimaPenghasilan',
};

const BPA2: CoretaxTemplate = {
  id: 'bpa2', code: 'BPA2', name: 'Bukti Potong PPh 4(2)', category: 'bupot-pph',
  description: 'Bukti potong Pajak Penghasilan Pasal 4 ayat (2)',
  icon: 'FileText', workflowType: 'bupot', steps: BUPOT_STEPS,
  headerFields: bupotHeader(),
  detailFields: bupotDetail([
    ff('JenisPenghasilan', 'Jenis Penghasilan', 'text', true),
    ff('Bruto', 'Penghasilan Bruto', 'currency', true),
    ff('PPh42', 'PPh 4(2)', 'currency', true),
  ]),
  xmlRootTag: 'BPA2', xmlHeaderTag: 'Header', xmlDetailTag: 'Detail', xmlItemTag: 'PenerimaPenghasilan',
};

const BP26: CoretaxTemplate = {
  id: 'bp26', code: 'BP26', name: 'Bukti Potong PPh 26', category: 'bupot-pph',
  description: 'Bukti potong PPh atas penghasilan WPLN',
  icon: 'FileText', workflowType: 'bupot', steps: BUPOT_STEPS,
  headerFields: bupotHeader(),
  detailFields: [
    ff('Nama', 'Nama WP', 'text', true),
    ff('Negara', 'Negara Domisili', 'text', true, { keywords: ['negara', 'country'] }),
    ff('JenisPenghasilan', 'Jenis Penghasilan', 'text', true),
    ff('Bruto', 'Penghasilan Bruto', 'currency', true),
    ff('PPh26', 'PPh Pasal 26', 'currency', true),
  ],
  xmlRootTag: 'BP26', xmlHeaderTag: 'Header', xmlDetailTag: 'Detail', xmlItemTag: 'PenerimaPenghasilan',
};

const BPPU: CoretaxTemplate = {
  id: 'bppu', code: 'BPPU', name: 'Bukti Potong PPh 15', category: 'bupot-pph',
  description: 'Bukti potong PPh atas dividen, bunga, royalti',
  icon: 'FileText', workflowType: 'bupot', steps: BUPOT_STEPS,
  headerFields: bupotHeader(),
  detailFields: bupotDetail([
    ff('JenisPenghasilan', 'Jenis Penghasilan', 'text', true),
    ff('Bruto', 'Penghasilan Bruto', 'currency', true),
    ff('Tarif', 'Tarif (%)', 'number', true),
    ff('PPh15', 'PPh Pasal 15', 'currency', true),
  ]),
  xmlRootTag: 'BPPU', xmlHeaderTag: 'Header', xmlDetailTag: 'Detail', xmlItemTag: 'PenerimaPenghasilan',
};

const BPNR: CoretaxTemplate = {
  id: 'bpnr', code: 'BPNR', name: 'Bukti Potong PPh PMSE', category: 'bupot-pph',
  description: 'Bukti potong PPh atas perdagangan melalui sistem elektronik',
  icon: 'FileText', workflowType: 'bupot', steps: BUPOT_STEPS,
  headerFields: bupotHeader(),
  detailFields: [
    ff('NamaPedagang', 'Nama Pedagang PMSE', 'text', true),
    ff('NegaraPedagang', 'Negara Pedagang', 'text', true),
    ff('Bruto', 'Nilai Transaksi', 'currency', true),
    ff('PPhPMSE', 'PPh PMSE', 'currency', true),
  ],
  xmlRootTag: 'BPNR', xmlHeaderTag: 'Header', xmlDetailTag: 'Detail', xmlItemTag: 'PenerimaPenghasilan',
};

const BPSP: CoretaxTemplate = {
  id: 'bpsp', code: 'BPSP', name: 'Bukti Potong PPh 22', category: 'bupot-pph',
  description: 'Bukti potong PPh atas impor dan penjualan barang mewah',
  icon: 'FileText', workflowType: 'bupot', steps: BUPOT_STEPS,
  headerFields: bupotHeader(),
  detailFields: [
    ff('NoDokumen', 'No. Dokumen Pabean', 'text', true),
    ff('TanggalDokumen', 'Tanggal Dokumen', 'date', true),
    ff('Bruto', 'Dasar Pengenaan', 'currency', true),
    ff('PPh22', 'PPh Pasal 22', 'currency', true),
  ],
  xmlRootTag: 'BPSP', xmlHeaderTag: 'Header', xmlDetailTag: 'Detail', xmlItemTag: 'PenerimaPenghasilan',
};

const DDBU: CoretaxTemplate = {
  id: 'ddbu', code: 'DDBU', name: 'Data Dasar Bupot', category: 'bupot-pph',
  description: 'Data dasar untuk pembuatan bukti potong secara massal',
  icon: 'FileText', workflowType: 'bupot', steps: BUPOT_STEPS,
  headerFields: bupotHeader([ff('JenisBupot', 'Jenis Bupot', 'text', true)]),
  detailFields: bupotDetail([
    ff('Bruto', 'Penghasilan Bruto', 'currency', true),
    ff('PPhDipotong', 'PPh Dipotong', 'currency', true),
  ]),
  xmlRootTag: 'DDBU', xmlHeaderTag: 'Header', xmlDetailTag: 'Detail', xmlItemTag: 'PenerimaPenghasilan',
};

// ============================================================
// FAKTUR PAJAK TEMPLATES (Workflow Type B)
// ============================================================
const fakturHeader: TemplateField[] = [
  npwpField('PKP'),
  ff('NamaPKP', 'Nama PKP', 'text', true, { keywords: ['nama pkp', 'nama pengusaha'] }),
  ff('AlamatPKP', 'Alamat PKP', 'text', true, { keywords: ['alamat pkp'] }),
  ff('NITKU', 'NITKU', 'text', false, { description: 'Nomor Identitas Tempat Kegiatan Usaha' }),
  ff('NSFP', 'No. Seri Faktur Pajak', 'text', false, { description: 'Nomor Seri Faktur Pajak 17 digit', keywords: ['nsfp', 'nomor seri', 'seri faktur'] }),
  ff('MasaPajak', 'Masa Pajak', 'select', true, { ...masaPajakOpts }),
  ff('TahunPajak', 'Tahun Pajak', 'number', true),
];

const fakturLawanTransaksi: TemplateField[] = [
  npwpField('Pembeli'),
  ff('NamaPembeli', 'Nama Pembeli', 'text', true, { keywords: ['nama pembeli', 'nama lawan transaksi'] }),
  ff('AlamatPembeli', 'Alamat Pembeli', 'text', false, { keywords: ['alamat pembeli'] }),
];

const FakturKeluaran: CoretaxTemplate = {
  id: 'faktur-keluaran', code: 'FK', name: 'Faktur Keluaran', category: 'faktur-pajak',
  description: 'Faktur Pajak Keluaran untuk transaksi PPN',
  popular: true, icon: 'Receipt', workflowType: 'faktur', steps: FAKTUR_STEPS,
  headerFields: fakturHeader,
  detailFields: [
    ff('NoFaktur', 'No. Faktur Pajak', 'text', true, { keywords: ['no faktur', 'nomor faktur', 'faktur'] }),
    ff('TanggalFaktur', 'Tanggal Faktur', 'date', true, { keywords: ['tanggal', 'tgl'] }),
    ff('JenisBarang', 'Jenis Barang/Jasa', 'text', true, { keywords: ['jenis barang', 'jenis jasa', 'nama barang'] }),
    ff('HargaJual', 'Harga Jual/Tarif', 'currency', true, { keywords: ['harga jual', 'tarif', 'harga'] }),
    ff('DPP', 'DPP', 'currency', true, { keywords: ['dpp', 'dasar pengenaan pajak'] }),
    ff('PPN', 'PPN', 'currency', true, { keywords: ['ppn', 'pajak pertambahan nilai'] }),
    ff('PPnBM', 'PPnBM', 'currency', false, { keywords: ['ppnbm', 'ppn bm'] }),
  ],
  lawanTransaksiFields: fakturLawanTransaksi,
  dropdowns: [{ field: 'KodePenyerahan', options: [
    { value: '01', label: '01 - Penyerahan BKP' },
    { value: '02', label: '02 - Penyerahan JKP' },
    { value: '03', label: '03 - Ekspor BKP' },
    { value: '04', label: '04 - Ekspor JKP' },
    { value: '07', label: '07 - Penyerahan BKP yang terutang PPN' },
    { value: '08', label: '08 - Penyerahan BKP yang PPn-nya dipungut oleh pemungut' },
  ]}],
  xmlRootTag: 'FK', xmlHeaderTag: 'FK', xmlDetailTag: 'Detil', xmlItemTag: 'DetilItem',
};

const ReturFakturMasukan: CoretaxTemplate = {
  id: 'retur-faktur-masukan', code: 'RFM', name: 'Retur Faktur Masukan', category: 'faktur-pajak',
  description: 'Faktur Pajak untuk retur pembelian barang/jasa',
  icon: 'Receipt', workflowType: 'faktur', steps: FAKTUR_STEPS,
  headerFields: fakturHeader,
  detailFields: [
    ff('NoRetur', 'No. Retur', 'text', true),
    ff('TanggalRetur', 'Tanggal Retur', 'date', true),
    ff('NoFakturAsal', 'No. Faktur Asal', 'text', true),
    ff('TanggalFakturAsal', 'Tanggal Faktur Asal', 'date', true),
    ff('HargaJual', 'Harga Jual', 'currency', true),
    ff('DPP', 'DPP', 'currency', true),
    ff('PPN', 'PPN', 'currency', true),
  ],
  lawanTransaksiFields: fakturLawanTransaksi,
  xmlRootTag: 'RFM', xmlHeaderTag: 'RFM', xmlDetailTag: 'Detil', xmlItemTag: 'DetilItem',
};

const FakturPengganti: CoretaxTemplate = {
  id: 'faktur-pengganti', code: 'FPG', name: 'Faktur Pengganti', category: 'faktur-pajak',
  description: 'Faktur Pajak Pengganti untuk pembetulan',
  icon: 'Receipt', workflowType: 'faktur', steps: FAKTUR_STEPS,
  headerFields: fakturHeader,
  detailFields: [
    ff('NoFakturPengganti', 'No. Faktur Pengganti', 'text', true),
    ff('TanggalFakturPengganti', 'Tanggal Faktur Pengganti', 'date', true),
    ff('NoFakturAsal', 'No. Faktur Asal', 'text', true),
    ff('JenisBarang', 'Jenis Barang/Jasa', 'text', true),
    ff('HargaJual', 'Harga Jual', 'currency', true),
    ff('DPP', 'DPP', 'currency', true),
    ff('PPN', 'PPN', 'currency', true),
  ],
  lawanTransaksiFields: fakturLawanTransaksi,
  xmlRootTag: 'FPG', xmlHeaderTag: 'FPG', xmlDetailTag: 'Detil', xmlItemTag: 'DetilItem',
};

const DokLainKeluaran: CoretaxTemplate = {
  id: 'dok-lain-keluaran', code: 'DLK', name: 'Dokumen Lain Keluaran', category: 'faktur-pajak',
  description: 'Dokumen lain yang dipersamakan dengan Faktur Pajak',
  icon: 'Receipt', workflowType: 'faktur', steps: FAKTUR_STEPS,
  headerFields: fakturHeader,
  detailFields: [
    ff('NoDokLain', 'No. Dokumen', 'text', true),
    ff('TanggalDokLain', 'Tanggal Dokumen', 'date', true),
    ff('JenisDokumen', 'Jenis Dokumen', 'text', true),
    ff('DPP', 'DPP', 'currency', true),
    ff('PPN', 'PPN', 'currency', true),
  ],
  lawanTransaksiFields: fakturLawanTransaksi,
  xmlRootTag: 'DLK', xmlHeaderTag: 'DLK', xmlDetailTag: 'Detil', xmlItemTag: 'DetilItem',
};

const ReturDokLain: CoretaxTemplate = {
  id: 'retur-dok-lain', code: 'RDL', name: 'Retur Dokumen Lain', category: 'faktur-pajak',
  description: 'Retur dokumen lain yang dipersamakan Faktur Pajak',
  icon: 'Receipt', workflowType: 'faktur', steps: FAKTUR_STEPS,
  headerFields: fakturHeader,
  detailFields: [
    ff('NoRetur', 'No. Retur', 'text', true),
    ff('TanggalRetur', 'Tanggal Retur', 'date', true),
    ff('NoDokAsal', 'No. Dokumen Asal', 'text', true),
    ff('DPP', 'DPP', 'currency', true),
    ff('PPN', 'PPN', 'currency', true),
  ],
  lawanTransaksiFields: fakturLawanTransaksi,
  xmlRootTag: 'RDL', xmlHeaderTag: 'RDL', xmlDetailTag: 'Detil', xmlItemTag: 'DetilItem',
};

// ============================================================
// SPT TAHUNAN BADAN TEMPLATES (Workflow Type C)
// ============================================================
const Lamp9Badan: CoretaxTemplate = {
  id: 'lamp-9-badan', code: 'L9B', name: 'Lampiran 9 - Pihak Terkait', category: 'spt-tahunan-badan',
  description: 'Daftar pihak terkait hubungan istimewa SPT Tahunan Badan',
  icon: 'Building2', workflowType: 'spt_tahunan', steps: SPT_TAHUNAN_STEPS,
  headerFields: null,
  detailFields: [
    ff('NamaPihakTerkait', 'Nama Pihak Terkait', 'text', true),
    ff('NPWPPihakTerkait', 'NPWP Pihak Terkait', 'npwp', false),
    ff('Negara', 'Negara Domisili', 'text', true),
    ff('Hubungan', 'Jenis Hubungan', 'text', true),
    ff('JenisTransaksi', 'Jenis Transaksi', 'text', true),
    ff('NilaiTransaksi', 'Nilai Transaksi', 'currency', true),
  ],
  xmlRootTag: 'Lampiran9', xmlDetailTag: 'DaftarPihakTerkait', xmlItemTag: 'PihakTerkait',
};

const Lamp10ABadan: CoretaxTemplate = {
  id: 'lamp-10a-badan', code: 'L10A', name: 'Lampiran 10A - Kompensasi Kerugian', category: 'spt-tahunan-badan',
  description: 'Data kompensasi kerugian SPT Tahunan Badan',
  icon: 'Building2', workflowType: 'spt_tahunan', steps: SPT_TAHUNAN_STEPS,
  headerFields: null,
  detailFields: [
    ff('TahunKerugian', 'Tahun Kerugian', 'number', true),
    ff('JumlahKerugian', 'Jumlah Kerugian', 'currency', true),
    ff('KompensasiSebelumnya', 'Kompensasi Sebelumnya', 'currency', false),
    ff('KompensasiTahunIni', 'Kompensasi Tahun Ini', 'currency', true),
    ff('SisaKompensasi', 'Sisa Kompensasi', 'currency', true),
  ],
  xmlRootTag: 'Lampiran10A', xmlDetailTag: 'DaftarKompensasi', xmlItemTag: 'Kompensasi',
};

const Lamp11ABadan: CoretaxTemplate = {
  id: 'lamp-11a-badan', code: 'L11A', name: 'Lampiran 11A - Biaya Operasional', category: 'spt-tahunan-badan',
  description: 'Rincian biaya operasional SPT Tahunan Badan',
  icon: 'Building2', workflowType: 'spt_tahunan', steps: SPT_TAHUNAN_STEPS,
  headerFields: null,
  sheets: [
    { name: 'Biaya Operasional', description: 'Biaya-biaya operasional perusahaan' },
    { name: 'Biaya Lainnya', description: 'Biaya-biaya lain-lain' },
    { name: 'Biaya Non-Operasional', description: 'Biaya di luar operasional' },
  ],
  detailFields: [
    ff('JenisBiaya', 'Jenis Biaya', 'text', true, { keywords: ['jenis biaya', 'nama biaya'] }),
    ff('Keterangan', 'Keterangan', 'text', false),
    ff('Jumlah', 'Jumlah', 'currency', true, { keywords: ['jumlah', 'nilai', 'total'] }),
  ],
  dropdowns: [{ field: 'KodeAset', options: [
    { value: '301', label: '301 - Tanah' },
    { value: '302', label: '302 - Bangunan Permanen' },
    { value: '303', label: '303 - Bangunan Tidak Permanen' },
    { value: '304', label: '304 - Konstruksi Dalam Pengerjaan' },
    { value: '305', label: '305 - Mesin' },
    { value: '306', label: '306 - Kapal' },
    { value: '307', label: '307 - Pesawat' },
    { value: '308', label: '308 - Kendaraan Bermotor' },
    { value: '309', label: '309 - Alat Berat' },
    { value: '310', label: '310 - Alat Teknik' },
    { value: '311', label: '311 - Alat Kantor' },
    { value: '312', label: '312 - Alat Olahraga' },
  ]}],
  xmlRootTag: 'Lampiran11A', xmlDetailTag: 'DaftarBiaya', xmlItemTag: 'Biaya',
};

// ============================================================
// SPT TAHUNAN ORANG PRIBADI TEMPLATES (Workflow Type C)
// ============================================================
const Lamp3COP: CoretaxTemplate = {
  id: 'lamp-3c-op', code: 'L3C', name: 'Lampiran 3C - Penghasilan Final', category: 'spt-tahunan-op',
  description: 'Daftar penghasilan bersifat final untuk OP',
  icon: 'User', workflowType: 'spt_tahunan', steps: SPT_TAHUNAN_STEPS,
  headerFields: null,
  detailFields: [
    ff('JenisPenghasilan', 'Jenis Penghasilan', 'text', true),
    ff('NamaSumber', 'Nama Sumber Penghasilan', 'text', true),
    ff('NPWPSumber', 'NPWP Sumber', 'npwp', false),
    ff('Bruto', 'Penghasilan Bruto', 'currency', true),
    ff('PPhFinal', 'PPh Final', 'currency', true),
  ],
  xmlRootTag: 'Lampiran3C', xmlDetailTag: 'DaftarPenghasilanFinal', xmlItemTag: 'Penghasilan',
};

const Lamp3DOP: CoretaxTemplate = {
  id: 'lamp-3d-op', code: 'L3D', name: 'Lampiran 3D - Penghasilan LN', category: 'spt-tahunan-op',
  description: 'Daftar penghasilan dari luar negeri untuk OP',
  icon: 'User', workflowType: 'spt_tahunan', steps: SPT_TAHUNAN_STEPS,
  headerFields: null,
  detailFields: [
    ff('JenisPenghasilan', 'Jenis Penghasilan', 'text', true),
    ff('Negara', 'Negara Sumber', 'text', true),
    ff('Bruto', 'Penghasilan Bruto', 'currency', true),
    ff('PPhDibayarLN', 'PPh Dibayar di Luar Negeri', 'currency', false),
    ff('PPhKredit', 'PPh yang Dapat Dikreditkan', 'currency', true),
  ],
  xmlRootTag: 'Lampiran3D', xmlDetailTag: 'DaftarPenghasilanLN', xmlItemTag: 'PenghasilanLN',
};

// ============================================================
// SPT MASA PPN TEMPLATES (Workflow Type D)
// ============================================================
const ppnHeader: TemplateField[] = [
  npwpField('PKP'),
  ff('NamaPKP', 'Nama PKP', 'text', true),
  ff('MasaPajak', 'Masa Pajak', 'select', true, { ...masaPajakOpts }),
  ff('TahunPajak', 'Tahun Pajak', 'number', true),
  ff('NITKU', 'NITKU', 'text', false),
];

const LampCPPN: CoretaxTemplate = {
  id: 'lamp-c-ppn', code: 'LC', name: 'Lampiran C - Faktur Keluaran', category: 'spt-masa-ppn',
  description: 'Daftar faktur pajak keluaran untuk SPT Masa PPN',
  popular: true, icon: 'Calculator', workflowType: 'spt_masa_ppn', steps: SPT_MASA_PPN_STEPS,
  headerFields: ppnHeader,
  detailFields: [
    ff('NoFaktur', 'No. Faktur Pajak', 'text', true, { keywords: ['no faktur', 'nomor faktur'] }),
    ff('TanggalFaktur', 'Tanggal Faktur', 'date', true, { keywords: ['tanggal', 'tgl'] }),
    ff('NPWPPembeli', 'NPWP Pembeli', 'npwp', true, { keywords: ['npwp pembeli'] }),
    ff('NamaPembeli', 'Nama Pembeli', 'text', true, { keywords: ['nama pembeli'] }),
    ff('DPP', 'DPP', 'currency', true),
    ff('PPN', 'PPN', 'currency', true),
    ff('PPnBM', 'PPnBM', 'currency', false),
    ff('Referensi', 'No. Faktur Referensi', 'text', false),
  ],
  xmlRootTag: 'SPTMasaPPN', xmlHeaderTag: 'Header', xmlDetailTag: 'LampiranC', xmlItemTag: 'FakturKeluaran',
};

const PPNDigunggung: CoretaxTemplate = {
  id: 'ppn-digunggung', code: 'PPN-DG', name: 'PPN Digunggung', category: 'spt-masa-ppn',
  description: 'Daftar PPN yang digunggung sendiri',
  icon: 'Calculator', workflowType: 'spt_masa_ppn', steps: SPT_MASA_PPN_STEPS,
  headerFields: ppnHeader,
  detailFields: [
    ff('JenisTransaksi', 'Jenis Transaksi', 'text', true),
    ff('NoDokumen', 'No. Dokumen', 'text', true),
    ff('TanggalDokumen', 'Tanggal Dokumen', 'date', true),
    ff('DPP', 'DPP', 'currency', true),
    ff('PPN', 'PPN Digunggung', 'currency', true),
  ],
  xmlRootTag: 'SPTMasaPPN', xmlHeaderTag: 'Header', xmlDetailTag: 'PPNDigunggung', xmlItemTag: 'Transaksi',
};

const DRKB: CoretaxTemplate = {
  id: 'drkb', code: 'DRKB', name: 'Retur & Kembalikan Barang', category: 'spt-masa-ppn',
  description: 'Daftar retur dan pembatalan faktur pajak keluaran',
  icon: 'Calculator', workflowType: 'spt_masa_ppn', steps: SPT_MASA_PPN_STEPS,
  headerFields: ppnHeader,
  detailFields: [
    ff('NoFakturRetur', 'No. Faktur Retur', 'text', true),
    ff('NoFakturAsal', 'No. Faktur Asal', 'text', true),
    ff('TanggalFakturAsal', 'Tanggal Faktur Asal', 'date', true),
    ff('DPP', 'DPP', 'currency', true),
    ff('PPN', 'PPN', 'currency', true),
  ],
  xmlRootTag: 'SPTMasaPPN', xmlHeaderTag: 'Header', xmlDetailTag: 'DRKB', xmlItemTag: 'Retur',
};

// ============================================================
// SPT BEA METERAI TEMPLATES (Workflow Type E)
// ============================================================
const meteraiHeader: TemplateField[] = [
  npwpField('Pemungut'),
  ff('NamaPemungut', 'Nama Pemungut', 'text', true),
  ff('MasaPajak', 'Masa Pajak', 'select', true, { ...masaPajakOpts }),
  ff('TahunPajak', 'Tahun Pajak', 'number', true),
];

const Lamp3Meterai: CoretaxTemplate = {
  id: 'lamp-3-meterai', code: 'LM3', name: 'Lampiran 3 - Cetak Meterai', category: 'spt-bea-meterai',
  description: 'Daftar cetak dan penyerahan meterai tempel',
  icon: 'Stamp', workflowType: 'bea_meterai', steps: BEA_METERAI_STEPS,
  headerFields: meteraiHeader,
  detailFields: [
    ff('NoSeri', 'No. Seri Meterai', 'text', true, { keywords: ['no seri', 'seri'] }),
    ff('TanggalPenggunaan', 'Tanggal Penggunaan', 'date', true),
    ff('NilaiNominal', 'Nilai Nominal', 'currency', true),
    ff('JenisDokumen', 'Jenis Dokumen', 'text', true),
    ff('NamaPihak', 'Nama Pihak', 'text', false),
  ],
  xmlRootTag: 'SPTBeaMeterai', xmlHeaderTag: 'Header', xmlDetailTag: 'Lampiran3', xmlItemTag: 'CetakMeterai',
};

const Lamp4Meterai: CoretaxTemplate = {
  id: 'lamp-4-meterai', code: 'LM4', name: 'Lampiran 4 - e-Meterai', category: 'spt-bea-meterai',
  description: 'Daftar penggunaan meterai elektronik (e-Meterai)',
  icon: 'Stamp', workflowType: 'bea_meterai', steps: BEA_METERAI_STEPS,
  headerFields: meteraiHeader,
  detailFields: [
    ff('NoSeri', 'No. Seri e-Meterai', 'text', true),
    ff('TanggalPenggunaan', 'Tanggal Penggunaan', 'date', true),
    ff('NilaiNominal', 'Nilai Nominal', 'currency', true),
    ff('JenisDokumen', 'Jenis Dokumen', 'text', true),
    ff('NamaPihak', 'Nama Pihak', 'text', false),
  ],
  xmlRootTag: 'SPTBeaMeterai', xmlHeaderTag: 'Header', xmlDetailTag: 'Lampiran4', xmlItemTag: 'EMeterai',
};

// ============================================================
// DAFTAR HARTA (Workflow Type F)
// ============================================================
const DaftarHarta: CoretaxTemplate = {
  id: 'daftar-harta', code: 'DH', name: 'Daftar Harta SPT', category: 'daftar-harta',
  description: 'Daftar harta untuk SPT Tahunan (L-1)',
  popular: true, icon: 'ListChecks', workflowType: 'daftar_harta', steps: DAFTAR_HARTA_STEPS,
  headerFields: null,
  detailFields: [
    ff('JenisHarta', 'Kategori Harta', 'select', true, {
      options: [
        { value: 'Tidak Bergerak', label: 'Tanah & Bangunan' },
        { value: 'Bergerak', label: 'Kendaraan & Mesin' },
        { value: 'Harta Bergerak Lain', label: 'Harta Bergerak Lain' },
        { value: 'Surat Berharga', label: 'Surat Berharga' },
        { value: 'Kas & Setara Kas', label: 'Kas & Setara Kas' },
        { value: 'Piutang', label: 'Piutang' },
        { value: 'Lainnya', label: 'Lainnya' },
        { value: 'Hutang', label: 'Hutang' },
      ],
    }),
    ff('KodeHarta', 'Kode Harta', 'text', true),
    ff('Keterangan', 'Keterangan', 'text', false),
    ff('TahunPerolehan', 'Tahun Perolehan', 'number', true),
    ff('NilaiPerolehan', 'Nilai Perolehan', 'currency', true),
    ff('NilaiPasca', 'Nilai Pasca Perolehan', 'currency', false),
  ],
  xmlRootTag: 'DaftarHarta', xmlDetailTag: 'DaftarHarta', xmlItemTag: 'Harta',
};

// ============================================================
// ALL TEMPLATES
// ============================================================
export const allTemplates: CoretaxTemplate[] = [
  // Bupot PPh (9)
  BPMP, BP21, BPA1, BPA2, BP26, BPPU, BPNR, BPSP, DDBU,
  // Faktur Pajak (5)
  FakturKeluaran, ReturFakturMasukan, FakturPengganti, DokLainKeluaran, ReturDokLain,
  // SPT Tahunan Badan (3)
  Lamp9Badan, Lamp10ABadan, Lamp11ABadan,
  // SPT Tahunan OP (2)
  Lamp3COP, Lamp3DOP,
  // SPT Masa PPN (3)
  LampCPPN, PPNDigunggung, DRKB,
  // SPT Bea Meterai (2)
  Lamp3Meterai, Lamp4Meterai,
  // Daftar Harta (1)
  DaftarHarta,
];

export function getTemplatesByCategory(categoryId: string): CoretaxTemplate[] {
  return allTemplates.filter(t => t.category === categoryId);
}

export function getTemplateById(id: string): CoretaxTemplate | undefined {
  return allTemplates.find(t => t.id === id);
}

export function getCategoryById(id: string): TemplateCategory | undefined {
  return categories.find(c => c.id === id);
}

export function getStepsForTemplate(template: CoretaxTemplate): WizardStep[] {
  return template.steps;
}
