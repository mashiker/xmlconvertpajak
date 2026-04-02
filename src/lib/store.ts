// ============================================================
// Coretax XML Converter — Enhanced Zustand Store v2
// Multi-workflow support with dynamic steps
// ============================================================

import { create } from 'zustand';
import type { CoretaxTemplate, WizardStep, WorkflowType } from './templates';

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  confidence: 'exact' | 'partial' | 'none';
}

export interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
  sheetName?: string;
  sheets?: string[];
}

// Step definitions per workflow type
const WORKFLOW_STEP_COUNTS: Record<WorkflowType, number> = {
  bupot: 6,
  faktur: 6,
  spt_tahunan: 5,
  spt_masa_ppn: 6,
  bea_meterai: 5,
  daftar_harta: 4,
};

// Step type to index mapping for each workflow type
const WORKFLOW_STEP_MAP: Record<WorkflowType, Record<string, number>> = {
  bupot: { select_template: 1, header_form: 2, upload: 3, column_mapping: 4, validate_edit: 5, generate_xml: 6 },
  faktur: { select_template: 1, header_form: 2, lawan_transaksi: 3, upload: 4, validate_edit: 5, generate_xml: 6 },
  spt_tahunan: { select_template: 1, upload: 2, column_mapping: 3, validate_edit: 4, generate_xml: 5 },
  spt_masa_ppn: { select_template: 1, header_form: 2, upload: 3, column_mapping: 4, validate_edit: 5, generate_xml: 6 },
  bea_meterai: { select_template: 1, header_form: 2, upload: 3, validate_edit: 4, generate_xml: 5 },
  daftar_harta: { select_template: 1, upload: 2, validate_edit: 3, generate_xml: 4 },
};

interface ConverterState {
  // Wizard state
  currentStep: number;
  maxStepReached: number;
  totalSteps: number;
  activeSteps: WizardStep[];

  // Step 1: Template
  selectedTemplate: CoretaxTemplate | null;
  searchQuery: string;

  // Step 2+: Header
  headerMapping: Record<string, string>;

  // Lawan Transaksi (Faktur only)
  lawanTransaksi: Record<string, string>;

  // Upload
  uploadedFile: File | null;
  parsedData: ParsedData | null;
  selectedSheet: string;
  pasteData: string;

  // Column Mapping
  columnMapping: ColumnMapping[];

  // Validation
  validationErrors: ValidationError[];
  showOnlyErrors: boolean;
  editedData: Record<string, string>[];

  // Convert
  generatedXml: string;
  isConverting: boolean;

  // Computed
  getActiveSteps: () => WizardStep[];
  getStepIndexByType: (type: string) => number;
  canNavigateTo: (step: number) => boolean;

  // Navigation
  setStep: (step: number) => void;
  goToStepByType: (type: string) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Actions
  setSelectedTemplate: (template: CoretaxTemplate | null) => void;
  setSearchQuery: (query: string) => void;
  setUploadedFile: (file: File | null) => void;
  setParsedData: (data: ParsedData | null) => void;
  setSelectedSheet: (sheet: string) => void;
  setPasteData: (data: string) => void;
  setColumnMapping: (mapping: ColumnMapping[]) => void;
  setHeaderMapping: (mapping: Record<string, string>) => void;
  setLawanTransaksi: (data: Record<string, string>) => void;
  updateColumnMapping: (sourceColumn: string, targetField: string, confidence: ColumnMapping['confidence']) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
  setShowOnlyErrors: (show: boolean) => void;
  setEditedData: (data: Record<string, string>[]) => void;
  updateCellData: (rowIndex: number, field: string, value: string) => void;
  setGeneratedXml: (xml: string) => void;
  setIsConverting: (converting: boolean) => void;

  // Reset
  resetWizard: () => void;
}

const initialState = {
  currentStep: 1,
  maxStepReached: 1,
  totalSteps: 6,
  activeSteps: [] as WizardStep[],
  selectedTemplate: null,
  searchQuery: '',
  headerMapping: {} as Record<string, string>,
  lawanTransaksi: {} as Record<string, string>,
  uploadedFile: null,
  parsedData: null,
  selectedSheet: '',
  pasteData: '',
  columnMapping: [] as ColumnMapping[],
  validationErrors: [] as ValidationError[],
  showOnlyErrors: false,
  editedData: [] as Record<string, string>[],
  generatedXml: '',
  isConverting: false,
};

export const useConverterStore = create<ConverterState>((set, get) => ({
  ...initialState,

  // Computed
  getActiveSteps: () => {
    const template = get().selectedTemplate;
    if (!template) return [];
    return template.steps;
  },
  getStepIndexByType: (type: string) => {
    const template = get().selectedTemplate;
    if (!template) return 1;
    const map = WORKFLOW_STEP_MAP[template.workflowType];
    return map[type] ?? 1;
  },
  canNavigateTo: (step: number) => {
    const state = get();
    return step <= state.maxStepReached;
  },

  // Navigation
  setStep: (step) => {
    const state = get();
    const max = state.totalSteps;
    const clamped = Math.max(1, Math.min(max, step));
    set({
      currentStep: clamped,
      maxStepReached: Math.max(state.maxStepReached, clamped),
    });
  },
  goToStepByType: (type: string) => {
    const idx = get().getStepIndexByType(type);
    get().setStep(idx);
  },
  nextStep: () => {
    const state = get();
    const next = Math.min(state.totalSteps, state.currentStep + 1);
    set({
      currentStep: next,
      maxStepReached: Math.max(state.maxStepReached, next),
    });
  },
  prevStep: () => {
    const state = get();
    set({ currentStep: Math.max(1, state.currentStep - 1) });
  },

  // Step 1
  setSelectedTemplate: (template) => {
    const totalSteps = template ? WORKFLOW_STEP_COUNTS[template.workflowType] : 6;
    set({
      selectedTemplate: template,
      totalSteps,
      currentStep: 1,
      maxStepReached: 1,
      activeSteps: template?.steps || [],
      headerMapping: {},
      lawanTransaksi: {},
      uploadedFile: null,
      parsedData: null,
      selectedSheet: '',
      pasteData: '',
      columnMapping: [],
      validationErrors: [],
      showOnlyErrors: false,
      editedData: [],
      generatedXml: '',
      isConverting: false,
    });
  },
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Upload
  setUploadedFile: (file) => set({ uploadedFile: file }),
  setParsedData: (data) => set({ parsedData: data, editedData: data?.rows || [] }),
  setSelectedSheet: (sheet) => set({ selectedSheet: sheet }),
  setPasteData: (data) => set({ pasteData: data }),

  // Mapping
  setColumnMapping: (mapping) => set({ columnMapping: mapping }),
  setHeaderMapping: (mapping) => set({ headerMapping: mapping }),
  setLawanTransaksi: (data) => set({ lawanTransaksi: data }),
  updateColumnMapping: (sourceColumn, targetField, confidence) =>
    set((s) => ({
      columnMapping: s.columnMapping.map((m) =>
        m.sourceColumn === sourceColumn ? { ...m, targetField, confidence } : m
      ),
    })),

  // Validation
  setValidationErrors: (errors) => set({ validationErrors: errors }),
  setShowOnlyErrors: (show) => set({ showOnlyErrors: show }),
  setEditedData: (data) => set({ editedData: data }),
  updateCellData: (rowIndex, field, value) =>
    set((s) => {
      const newData = [...s.editedData];
      if (newData[rowIndex]) {
        newData[rowIndex] = { ...newData[rowIndex], [field]: value };
      }
      return { editedData: newData };
    }),

  // Convert
  setGeneratedXml: (xml) => set({ generatedXml: xml }),
  setIsConverting: (converting) => set({ isConverting: converting }),

  // Reset
  resetWizard: () => set({ ...initialState }),
}));
