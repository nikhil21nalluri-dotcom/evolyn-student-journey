import React, { useState, useEffect, useRef } from 'react';
import {
  DatasetCategory,
  DATASET_CATEGORIES_META,
  ValidationSummary,
  ValidatedRow,
  CommitResult,
  ImportAuditRecord,
  parseCsvString,
  validateCsvDataset,
  commitValidatedDataset,
  getImportAuditHistory,
  fetchRemoteAuditHistory,
  triggerCsvDownload,
} from '../../data/dataIntegrationEngine';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Database,
  ArrowRight,
  RefreshCw,
  Clock,
  ShieldCheck,
  Lock,
  Layers,
  Sparkles,
  Info,
  Check,
  X,
  FileSpreadsheet,
  Building2,
  GraduationCap,
  ChevronDown,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface DataIntegrationWorkspaceProps {
  onBackToLanding?: () => void;
  onNavigate?: (view: any) => void;
}

export const DataIntegrationWorkspace: React.FC<DataIntegrationWorkspaceProps> = ({
  onBackToLanding,
  onNavigate,
}) => {
  const { user, userProfile } = useAuth();
  const { activeWorkspace, setActiveWorkspace, setSelectedStudentId, openRoleModal } = useWorkspace();

  // Active top-level subtab: 'import' or 'audit-history' or 'schema-docs'
  const [activeSubTab, setActiveSubTab] = useState<'import' | 'audit-history' | 'schema-docs'>('import');

  // Selected dataset category
  const [selectedCategory, setSelectedCategory] = useState<DatasetCategory>('academic');

  // CSV input modes: 'file' or 'paste'
  const [inputMode, setInputMode] = useState<'file' | 'paste'>('file');
  const [pastedCsv, setPastedCsv] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation State
  const [validation, setValidation] = useState<ValidationSummary | null>(null);
  const [filterPreviewStatus, setFilterPreviewStatus] = useState<'ALL' | 'VALID' | 'ERROR' | 'WARNING'>('ALL');
  const [allowUnknownStudents, setAllowUnknownStudents] = useState<boolean>(false);

  // Commit & Status State
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [commitResult, setCommitResult] = useState<CommitResult | null>(null);
  const [auditHistory, setAuditHistory] = useState<ImportAuditRecord[]>([]);

  // Selected audit record for detail view
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<ImportAuditRecord | null>(null);

  // Current category metadata
  const currentMeta = DATASET_CATEGORIES_META[selectedCategory];

  // Refresh audit records on load (cached + remote sync)
  useEffect(() => {
    setAuditHistory(getImportAuditHistory());
    fetchRemoteAuditHistory().then((remote) => {
      if (remote && remote.length > 0) {
        setAuditHistory(remote);
      }
    });
  }, []);

  // When category changes, reset pending validation if not matching
  const handleCategoryChange = (cat: DatasetCategory) => {
    setSelectedCategory(cat);
    setValidation(null);
    setCommitResult(null);
    setPastedCsv('');
    setUploadedFileName('');
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setCommitResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processAndValidateCsv(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  // Drag and drop handler
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setCommitResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processAndValidateCsv(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  // Process and validate CSV text
  const processAndValidateCsv = (csvText: string, fileName: string) => {
    const parsed = parseCsvString(csvText);
    const result = validateCsvDataset(selectedCategory, parsed, fileName, {
      allowUnknownStudents,
    });
    setValidation(result);
  };

  // Trigger demo valid sample
  const handleLoadDemoValid = () => {
    const fileName = `demo_${selectedCategory}_valid.csv`;
    setUploadedFileName(fileName);
    setPastedCsv(currentMeta.sampleCsv);
    setCommitResult(null);
    processAndValidateCsv(currentMeta.sampleCsv, fileName);
  };

  // Trigger demo invalid sample (with deliberate errors to demonstrate validation)
  const handleLoadDemoInvalid = () => {
    let invalidCsv = '';
    if (selectedCategory === 'academic') {
      invalidCsv = `student_id,student_name,department,branch,year,cgpa,backlogs,record_date
CS-2022-084,Arjun Kumar,Computer Science,CSE,3rd Year,8.5,0,2026-10-01
UNKNOWN-999,Ghost Student,Mechanical,MECH,2nd Year,7.2,0,2026-10-01
CS-2022-109,Priya Sharma,Computer Science,CSE,2nd Year,12.5,0,2026-10-01
EE-2023-031,Rahul Verma,Electrical Engineering,EEE,2nd Year,not_a_number,-2,2026-10-01
CS-2022-084,Arjun Kumar Duplicate,Computer Science,CSE,3rd Year,8.4,0,2026-10-01`;
    } else if (selectedCategory === 'attendance') {
      invalidCsv = `student_id,attendance_percentage,classes_attended,total_classes,record_date
CS-2022-084,89.5,31,35,2026-10-05
CS-2022-109,145.0,40,35,2026-10-05
EE-2023-031,-10.0,20,30,2026-10-05
,75.0,25,30,2026-10-05`;
    } else {
      invalidCsv = `student_id,assessment_type,score,max_score,assessment_date
CS-2022-084,Algorithms Review,85,100,2026-10-07
CS-2022-109,System Design Test,150,100,2026-10-07
,Missing ID Test,80,100,2026-10-07`;
    }

    const fileName = `demo_${selectedCategory}_with_errors.csv`;
    setUploadedFileName(fileName);
    setPastedCsv(invalidCsv);
    setCommitResult(null);
    processAndValidateCsv(invalidCsv, fileName);
  };

  // Execute commitment of validated dataset
  const handleCommitImport = async () => {
    if (!validation || !validation.isCommitReady) return;

    setIsCommitting(true);
    const uploaderName = userProfile?.displayName || user?.displayName || 'Prof. Elena Vance';
    const uploaderEmail = userProfile?.email || user?.email || 'advisor@evolyn.internal';

    try {
      const result = await commitValidatedDataset(
        validation,
        { name: uploaderName, email: uploaderEmail },
        { skipUnknown: !allowUnknownStudents }
      );

      setCommitResult(result);
      setAuditHistory(getImportAuditHistory());
    } catch (err) {
      console.error('Commit error:', err);
    } finally {
      setIsCommitting(false);
    }
  };

  // Reset import flow
  const handleResetImport = () => {
    setValidation(null);
    setCommitResult(null);
    setPastedCsv('');
    setUploadedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download template
  const handleDownloadTemplate = () => {
    triggerCsvDownload(currentMeta.templateFileName, currentMeta.sampleCsv);
  };

  // Role permissions check: Faculty and Admin have full access.
  const isStudentRole = userProfile?.role === 'student' || activeWorkspace === 'student';

  const previewRowsToDisplay: ValidatedRow[] = (validation?.rows || []).filter((r) => {
    if (filterPreviewStatus === 'ALL') return true;
    if (filterPreviewStatus === 'VALID') return r.status === 'VALID';
    if (filterPreviewStatus === 'ERROR') return r.status === 'ERROR';
    if (filterPreviewStatus === 'WARNING') return r.status === 'WARNING';
    return true;
  });

  return (
    <div className="relative min-h-screen w-full pt-20 pb-24 px-4 sm:px-8 max-w-7xl mx-auto text-[#f0f1ff]">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[rgba(140,150,255,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-slate-950 shadow-md shadow-[#38bdf8]/20 font-bold">
            <UploadCloud className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-baskerville text-xl sm:text-2xl font-bold text-white">
                Data Integration &amp; CSV Import Workspace
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#38bdf8]/15 border border-[#38bdf8]/30 font-mono text-[10px] font-bold text-[#7dd3fc]">
                STEP 11 INTEGRATED
              </span>
            </div>
            <p className="text-xs text-[#a4a9d0]">
              Batch ingestion for 7 telemetry categories with client-side schema validation, duplicate detection, and direct connection to Evolyn Intelligence.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openRoleModal}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#c2d1ff] transition-colors cursor-pointer flex items-center gap-1.5 font-mono"
          >
            <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Switch Role ({activeWorkspace})</span>
          </button>
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#a4a9d0] hover:text-white transition-colors cursor-pointer"
            >
              Platform Overview
            </button>
          )}
        </div>
      </div>

      {/* Role Access Restriction Gate (for Student Persona) */}
      {isStudentRole ? (
        <div className="p-8 rounded-3xl bg-[#090b22] border border-[#2b356d] text-center space-y-4 max-w-2xl mx-auto my-12">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-baskerville text-xl font-bold text-white">
            Administrative Data Import Protected
          </h2>
          <p className="text-xs text-[#a4a9d0] leading-relaxed">
            Data integration and batch CSV synchronization operations are restricted to authorized Faculty Advisors and Institutional Administrators. Student accounts can view their own learning journey, skills, and progress in the Student Workspace.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setActiveWorkspace('faculty');
                if (onNavigate) onNavigate('faculty-workspace');
              }}
              className="px-4 py-2 rounded-xl bg-[#ff6a2b] hover:bg-[#ff8a50] text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-[#ff6a2b]/25"
            >
              Switch to Faculty Role
            </button>
            <button
              onClick={() => {
                setActiveWorkspace('admin');
                if (onNavigate) onNavigate('admin-workspace');
              }}
              className="px-4 py-2 rounded-xl bg-[#a855f7] hover:bg-[#c084fc] text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-[#a855f7]/25"
            >
              Switch to Admin Role
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Main Top Navigation Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3 text-xs font-mono">
            <button
              onClick={() => setActiveSubTab('import')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeSubTab === 'import'
                  ? 'bg-[#38bdf8] text-slate-950 font-bold shadow-md shadow-[#38bdf8]/20'
                  : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import &amp; Validate CSV</span>
            </button>

            <button
              onClick={() => setActiveSubTab('audit-history')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeSubTab === 'audit-history'
                  ? 'bg-[#38bdf8] text-slate-950 font-bold shadow-md shadow-[#38bdf8]/20'
                  : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Import History &amp; Audit Log ({auditHistory.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('schema-docs')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeSubTab === 'schema-docs'
                  ? 'bg-[#38bdf8] text-slate-950 font-bold shadow-md shadow-[#38bdf8]/20'
                  : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>CSV Schemas &amp; Templates</span>
            </button>
          </div>

          {/* =========================================================
              VIEW 1: IMPORT & VALIDATE CSV
          ========================================================= */}
          {activeSubTab === 'import' && (
            <div className="space-y-6">
              {/* Category Selection Bar: 7 Categories */}
              <div className="p-4 rounded-2xl bg-[#090b22] border border-[#222955] shadow-lg">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#38bdf8]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      1. Choose Target Dataset Stream
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8e96c8] font-mono">
                    7 Independent Supported Formats
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {(Object.keys(DATASET_CATEGORIES_META) as DatasetCategory[]).map((cat) => {
                    const meta = DATASET_CATEGORIES_META[cat];
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#38bdf8]/15 border-[#38bdf8] shadow-md shadow-[#38bdf8]/15'
                            : 'bg-black/20 border-white/10 hover:border-white/20 text-[#cbd5e1]'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-white truncate font-baskerville">
                          {meta.name}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 font-mono text-[9px]">
                          <span className={isSelected ? 'text-[#38bdf8] font-bold' : 'text-[#8e96c8]'}>
                            {meta.badgeLabel}
                          </span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Category Explainer & Template Quick Action */}
                <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                    <span className="text-[#cbd5e1] text-[11px]">
                      {currentMeta.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadTemplate}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-[11px] font-mono text-[#7dd3fc] flex items-center gap-1.5 cursor-pointer"
                      title="Download clean CSV template"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Template ({currentMeta.templateFileName})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Input & Dropzone Box */}
              {!validation && !commitResult && (
                <div className="p-6 rounded-2xl bg-[#0b0e2d] border border-[#222955] shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#38bdf8]" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                        2. Upload or Paste CSV Dataset
                      </span>
                    </div>

                    {/* Mode Switcher & Quick Demo Buttons */}
                    <div className="flex items-center gap-2">
                      <div className="inline-flex rounded-lg bg-black/40 p-0.5 border border-white/10 text-[11px] font-mono">
                        <button
                          onClick={() => setInputMode('file')}
                          className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                            inputMode === 'file' ? 'bg-[#38bdf8] text-slate-950 font-bold' : 'text-[#a4a9d0]'
                          }`}
                        >
                          File Upload
                        </button>
                        <button
                          onClick={() => setInputMode('paste')}
                          className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                            inputMode === 'paste' ? 'bg-[#38bdf8] text-slate-950 font-bold' : 'text-[#a4a9d0]'
                          }`}
                        >
                          Paste Text
                        </button>
                      </div>

                      <button
                        onClick={handleLoadDemoValid}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono flex items-center gap-1 cursor-pointer"
                        title="Load valid test rows for immediate testing"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>Demo Valid CSV</span>
                      </button>

                      <button
                        onClick={handleLoadDemoInvalid}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-[11px] text-rose-300 font-mono flex items-center gap-1 cursor-pointer"
                        title="Load CSV with simulated out-of-range & duplicate errors"
                      >
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span>Demo CSV with Errors</span>
                      </button>
                    </div>
                  </div>

                  {/* Input Mode A: File Drag & Drop Zone */}
                  {inputMode === 'file' ? (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#2b356d] hover:border-[#38bdf8] transition-colors rounded-2xl p-8 text-center cursor-pointer bg-black/25 flex flex-col items-center justify-center gap-3"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,text/csv"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <div className="w-12 h-12 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          Click to select a CSV file or drag and drop here
                        </div>
                        <div className="text-[11px] text-[#8e96c8] mt-1 font-mono">
                          Format: CSV (.csv) · Standard UTF-8 encoding
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Input Mode B: Paste CSV Directly */
                    <div className="space-y-3">
                      <textarea
                        rows={7}
                        value={pastedCsv}
                        onChange={(e) => setPastedCsv(e.target.value)}
                        placeholder={`Paste raw CSV here with header row:\n${currentMeta.sampleCsv}`}
                        className="w-full bg-[#05071a] border border-[#222955] rounded-xl p-3 text-xs font-mono text-white placeholder-white/20 focus:outline-none focus:border-[#38bdf8]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            if (pastedCsv.trim()) {
                              processAndValidateCsv(pastedCsv, `pasted_${selectedCategory}.csv`);
                            }
                          }}
                          disabled={!pastedCsv.trim()}
                          className="px-4 py-2 rounded-xl bg-[#38bdf8] hover:bg-[#7dd3fc] text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-40"
                        >
                          Validate Pasted CSV
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================
                  PREVIEW & VALIDATION RESULTS (BEFORE COMMIT)
              ========================================================= */}
              {validation && !commitResult && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Top Validation Scorecard */}
                  <div className="p-5 rounded-2xl bg-[#090b22] border border-[#222955] shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#8e96c8]">Active Validation:</span>
                        <span className="font-bold text-white text-sm font-mono">{validation.fileName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#cbd5e1]">
                          Category: {currentMeta.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleResetImport}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#a4a9d0] transition-colors cursor-pointer"
                        >
                          Cancel / Reset
                        </button>
                        <button
                          onClick={handleCommitImport}
                          disabled={!validation.isCommitReady || isCommitting}
                          className="px-4 py-1.5 rounded-xl bg-[#38bdf8] hover:bg-[#7dd3fc] text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-[#38bdf8]/20 disabled:opacity-40 flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {isCommitting
                              ? 'Committing Records...'
                              : `Confirm & Commit (${validation.validRowsCount} Valid Rows)`}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* KPI Tiles */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                      <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                        <span className="text-[10px] text-[#8e96c8] block">Total Rows Detected</span>
                        <span className="text-2xl font-bold text-white">{validation.totalRows}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                        <span className="text-[10px] text-emerald-400 block">Valid Ready Rows</span>
                        <span className="text-2xl font-bold text-emerald-300">{validation.validRowsCount}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
                        <span className="text-[10px] text-rose-400 block">Rows with Errors</span>
                        <span className="text-2xl font-bold text-rose-300">{validation.errorRowsCount}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
                        <span className="text-[10px] text-amber-400 block">Warnings / Notices</span>
                        <span className="text-2xl font-bold text-amber-300">{validation.warningRowsCount}</span>
                      </div>
                    </div>

                    {/* Missing Required Columns or Critical Header Errors */}
                    {validation.missingRequiredColumns.length > 0 && (
                      <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Missing Required Columns</strong>
                          <span>
                            The uploaded CSV is missing critical headers:{' '}
                            <code className="px-1 py-0.5 rounded bg-black/40 text-white font-mono">
                              {validation.missingRequiredColumns.join(', ')}
                            </code>
                            . Please ensure the CSV header row matches the category specification.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Commit Options & Settings Bar */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={allowUnknownStudents}
                          onChange={(e) => {
                            setAllowUnknownStudents(e.target.checked);
                            // Re-validate with new option
                            if (pastedCsv) {
                              processAndValidateCsv(pastedCsv, validation.fileName);
                            }
                          }}
                          className="rounded border-[#2b356d] bg-black/40 text-[#38bdf8] focus:ring-0"
                        />
                        <span className="text-[#cbd5e1] font-mono text-[11px]">
                          Create new cohort profiles for unrecognized student IDs
                        </span>
                      </label>

                      <div className="text-[11px] text-[#8e96c8] font-mono">
                        Validated at {validation.validationTimestamp}
                      </div>
                    </div>
                  </div>

                  {/* Filterable Data Preview Table */}
                  <div className="p-5 rounded-2xl bg-[#06081c] border border-[#1f2552] shadow-xl space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="font-baskerville font-bold text-sm text-white">
                          Pre-Import Row Inspection Table
                        </span>
                        <span className="text-xs text-[#8e96c8] font-mono">
                          ({previewRowsToDisplay.length} Rows Displayed)
                        </span>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-xs">
                        <button
                          onClick={() => setFilterPreviewStatus('ALL')}
                          className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                            filterPreviewStatus === 'ALL'
                              ? 'bg-white/20 text-white font-bold'
                              : 'text-[#8e96c8] hover:text-white'
                          }`}
                        >
                          All ({validation.rows.length})
                        </button>
                        <button
                          onClick={() => setFilterPreviewStatus('VALID')}
                          className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                            filterPreviewStatus === 'VALID'
                              ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                              : 'text-[#8e96c8] hover:text-emerald-300'
                          }`}
                        >
                          Valid ({validation.validRowsCount})
                        </button>
                        <button
                          onClick={() => setFilterPreviewStatus('ERROR')}
                          className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                            filterPreviewStatus === 'ERROR'
                              ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
                              : 'text-[#8e96c8] hover:text-rose-300'
                          }`}
                        >
                          Errors ({validation.errorRowsCount})
                        </button>
                        <button
                          onClick={() => setFilterPreviewStatus('WARNING')}
                          className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                            filterPreviewStatus === 'WARNING'
                              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                              : 'text-[#8e96c8] hover:text-amber-300'
                          }`}
                        >
                          Warnings ({validation.warningRowsCount})
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-white/10">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-[#8e96c8] font-mono bg-black/40">
                            <th className="p-2.5 w-14">Row</th>
                            <th className="p-2.5 w-24">Status</th>
                            <th className="p-2.5 w-36">Student ID</th>
                            <th className="p-2.5">Matched Profile</th>
                            <th className="p-2.5">Extracted Data Payload</th>
                            <th className="p-2.5">Diagnostics / Issues</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                          {previewRowsToDisplay.map((row) => {
                            const isErr = row.status === 'ERROR';
                            const isWarn = row.status === 'WARNING';
                            return (
                              <tr
                                key={row.rowNumber}
                                className={`transition-colors ${
                                  isErr
                                    ? 'bg-rose-950/20 hover:bg-rose-950/30'
                                    : isWarn
                                    ? 'bg-amber-950/20 hover:bg-amber-950/30'
                                    : 'hover:bg-white/[0.03]'
                                }`}
                              >
                                <td className="p-2.5 text-[#8e96c8]">#{row.rowNumber}</td>
                                <td className="p-2.5">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      isErr
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                        : isWarn
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    }`}
                                  >
                                    {isErr ? (
                                      <>
                                        <X className="w-3 h-3" /> Error
                                      </>
                                    ) : isWarn ? (
                                      <>
                                        <AlertTriangle className="w-3 h-3" /> Warn
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-3 h-3" /> Valid
                                      </>
                                    )}
                                  </span>
                                </td>
                                <td className="p-2.5 font-bold text-white">
                                  {row.rawRecord['student_id'] || <span className="text-rose-400 italic">Missing</span>}
                                </td>
                                <td className="p-2.5 text-[#cbd5e1]">
                                  {row.isExistingStudent ? (
                                    <span className="text-emerald-300 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                      <span>{row.matchedStudentName}</span>
                                    </span>
                                  ) : (
                                    <span className="text-[#a4a9d0] italic">
                                      Unenrolled / New ({row.matchedStudentName || 'N/A'})
                                    </span>
                                  )}
                                </td>
                                <td className="p-2.5 text-white">
                                  <div className="flex flex-wrap gap-1 max-w-sm">
                                    {Object.entries(row.normalizedData)
                                      .filter(([k]) => k !== 'student_id')
                                      .map(([k, v]) => (
                                        <span
                                          key={k}
                                          className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[10px]"
                                        >
                                          <strong className="text-[#7dd3fc]">{k}:</strong> {String(v)}
                                        </span>
                                      ))}
                                  </div>
                                </td>
                                <td className="p-2.5 text-xs">
                                  {row.errors.length > 0 && (
                                    <div className="text-rose-300 space-y-0.5">
                                      {row.errors.map((err, i) => (
                                        <div key={i} className="flex items-center gap-1">
                                          <X className="w-3 h-3 text-rose-400 shrink-0" />
                                          <span>{err}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {row.warnings.length > 0 && (
                                    <div className="text-amber-300 space-y-0.5 mt-1">
                                      {row.warnings.map((warn, i) => (
                                        <div key={i} className="flex items-center gap-1">
                                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                          <span>{warn}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {row.errors.length === 0 && row.warnings.length === 0 && (
                                    <span className="text-emerald-400/80">No issues detected</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  POST-COMMIT SUCCESS & INTELLIGENCE REFRESH SUMMARY
              ========================================================= */}
              {commitResult && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c133a] to-[#080d26] border border-emerald-500/40 shadow-2xl space-y-5 animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-baskerville text-lg font-bold text-white">
                          Import Completed &amp; Intelligence Re-Calibrated
                        </h3>
                        <p className="text-xs text-[#a4a9d0]">
                          Import ID: <code className="font-mono text-emerald-300">{commitResult.importId}</code> · File: {commitResult.fileName}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleResetImport}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white font-mono cursor-pointer transition-colors"
                    >
                      Import Another Dataset
                    </button>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-[10px] text-[#8e96c8] block">Imported Records</span>
                      <span className="text-xl font-bold text-emerald-400">
                        {commitResult.successfullyImported}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-[10px] text-[#8e96c8] block">Skipped / Ignored</span>
                      <span className="text-xl font-bold text-amber-400">
                        {commitResult.skipped}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-[10px] text-[#8e96c8] block">Success Scores</span>
                      <span className="text-xl font-bold text-[#ffb27a]">
                        {commitResult.refreshedIndicators.successScoresRecalculated}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-[10px] text-[#8e96c8] block">Risk Profiles</span>
                      <span className="text-xl font-bold text-[#d8b4fe]">
                        {commitResult.refreshedIndicators.riskProfilesRefreshed}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-[10px] text-[#8e96c8] block">Silent Struggle</span>
                      <span className="text-xl font-bold text-cyan-300">
                        {commitResult.refreshedIndicators.silentStruggleUpdated || commitResult.successfullyImported}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-[10px] text-[#8e96c8] block">Growth Tracks</span>
                      <span className="text-xl font-bold text-teal-300">
                        {commitResult.refreshedIndicators.growthTrackUpdated || commitResult.successfullyImported}
                      </span>
                    </div>
                  </div>

                  {/* Persistence Architecture & Audit Status Banner */}
                  <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                    commitResult.persistence?.mode === 'cloud_firestore'
                      ? 'bg-sky-500/[0.08] border-sky-500/30'
                      : 'bg-indigo-950/40 border-indigo-500/30'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-bold flex items-center gap-1.5 font-mono text-white">
                        <Database className="w-4 h-4 text-[#38bdf8]" />
                        <span>Persistence Architecture Status</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        commitResult.persistence?.mode === 'cloud_firestore'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {commitResult.persistence?.mode === 'cloud_firestore'
                          ? 'Cloud Firestore Synced (Permanent)'
                          : 'Local Application Storage (Explicit Session Fallback)'}
                      </span>
                    </div>
                    <p className="text-[#a4a9d0] leading-relaxed">
                      {commitResult.persistence?.message || 'Import audit record retained in persistent storage.'}
                    </p>
                  </div>

                  {/* Connected Intelligence Verification Notice */}
                  <div className="p-4 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/25 text-xs space-y-2">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Evolyn Multi-Dimensional Sync Complete</span>
                    </div>
                    <p className="text-[#cbd5e1] leading-relaxed">
                      All imported data has been merged into canonical student records. The 7-dimension Student Success Score formulas, Early Signal classifiers, Silent Struggle vectors, and Student Segments have been automatically updated without modifying baseline models.
                    </p>
                  </div>

                  {/* Direct Shortcuts to inspect affected records */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        if (commitResult.affectedStudentIds[0]) {
                          setSelectedStudentId(commitResult.affectedStudentIds[0]);
                        }
                        if (onNavigate) onNavigate('faculty-workspace');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#ff6a2b] hover:bg-[#ff8a50] text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Inspect Affected Students in Faculty Roster</span>
                    </button>

                    <button
                      onClick={() => {
                        if (commitResult.affectedStudentIds[0]) {
                          setSelectedStudentId(commitResult.affectedStudentIds[0]);
                        }
                        if (onNavigate) onNavigate('growth-track');
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>View Updated Growth Track</span>
                    </button>

                    <button
                      onClick={() => setActiveSubTab('audit-history')}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#a855f7]" />
                      <span>Inspect Audit Log</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              VIEW 2: IMPORT HISTORY & AUDITABILITY
          ========================================================= */}
          {activeSubTab === 'audit-history' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#0b0e2d] border border-[#222955] shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4">
                  <div>
                    <h3 className="font-baskerville text-lg font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#38bdf8]" />
                      <span>Institutional CSV Import Audit Trail</span>
                    </h3>
                    <p className="text-xs text-[#a4a9d0]">
                      Immutable audit records tracking dataset category, authorized uploader, imported rows, and validation logs.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#8e96c8]">
                    {auditHistory.length} Recorded Ingestion Batches
                  </span>
                </div>

                {auditHistory.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-[#8e96c8] font-mono bg-black/40">
                          <th className="p-3">Import ID</th>
                          <th className="p-3">Stream Category</th>
                          <th className="p-3">File Name</th>
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">Uploader</th>
                          <th className="p-3 text-center">Imported / Total</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                        {auditHistory.map((rec) => (
                          <tr key={rec.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="p-3 font-bold text-[#7dd3fc]">{rec.id}</td>
                            <td className="p-3 capitalize font-bold text-white">{rec.category}</td>
                            <td className="p-3 text-[#cbd5e1]">{rec.fileName}</td>
                            <td className="p-3 text-[#8e96c8]">{rec.importDate}</td>
                            <td className="p-3 text-white">
                              <div>{rec.uploaderName}</div>
                              <div className="text-[10px] text-[#8e96c8]">{rec.uploaderEmail}</div>
                            </td>
                            <td className="p-3 text-center">
                              <span className="text-emerald-400 font-bold">{rec.importedRows}</span> / {rec.totalRows}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  rec.status === 'COMPLETED'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : rec.status === 'PARTIALLY_IMPORTED'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                }`}
                              >
                                {rec.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSelectedAuditRecord(rec)}
                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-[11px] text-[#cbd5e1] cursor-pointer transition-colors"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-[#8e96c8]">
                    No import batches logged yet. Perform a CSV import to generate audit records.
                  </div>
                )}
              </div>

              {/* Audit Detail Modal / Drawer */}
              {selectedAuditRecord && (
                <div className="p-5 rounded-2xl bg-[#090b22] border border-[#38bdf8]/40 shadow-2xl space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
                      <h4 className="font-baskerville font-bold text-white text-base">
                        Audit Batch Detail · {selectedAuditRecord.id}
                      </h4>
                    </div>
                    <button
                      onClick={() => setSelectedAuditRecord(null)}
                      className="p-1 text-[#8e96c8] hover:text-white rounded hover:bg-white/5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-[10px] text-[#8e96c8] block">Dataset</span>
                      <span className="font-bold text-white capitalize">{selectedAuditRecord.category}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-[10px] text-[#8e96c8] block">File Name</span>
                      <span className="font-bold text-white">{selectedAuditRecord.fileName}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-[10px] text-[#8e96c8] block">Uploader</span>
                      <span className="font-bold text-white">{selectedAuditRecord.uploaderName}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-[10px] text-[#8e96c8] block">Timestamp</span>
                      <span className="font-bold text-white">{selectedAuditRecord.importDate}</span>
                    </div>
                  </div>

                  {/* Affected Students List */}
                  <div>
                    <span className="text-xs font-mono text-[#8e96c8] block mb-1">
                      Affected Student Profiles ({selectedAuditRecord.affectedStudentIds.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                      {selectedAuditRecord.affectedStudentIds.map((id) => (
                        <span key={id} className="px-2 py-0.5 rounded bg-[#38bdf8]/15 border border-[#38bdf8]/30 text-[#7dd3fc]">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Audit Notes */}
                  {selectedAuditRecord.notes.length > 0 && (
                    <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-xs text-[#cbd5e1] font-mono space-y-1">
                      <span className="font-bold text-white block">Audit Notes:</span>
                      {selectedAuditRecord.notes.map((note, i) => (
                        <div key={i} className="text-[11px] text-[#8e96c8] flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[#38bdf8]" />
                          <span>{note}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              VIEW 3: SCHEMAS & TEMPLATES DOCUMENTATION
          ========================================================= */}
          {activeSubTab === 'schema-docs' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#0b0e2d] border border-[#222955] shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="font-baskerville text-lg font-bold text-white flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-[#38bdf8]" />
                      <span>Supported CSV Schemas &amp; Field Ranges</span>
                    </h3>
                    <p className="text-xs text-[#a4a9d0]">
                      Deterministic column specifications, expected types, and validation boundaries for all 7 telemetry streams.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {(Object.keys(DATASET_CATEGORIES_META) as DatasetCategory[]).map((cat) => {
                    const meta = DATASET_CATEGORIES_META[cat];
                    return (
                      <div
                        key={cat}
                        className="p-4 rounded-xl bg-black/25 border border-white/10 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#38bdf8]/15 border border-[#38bdf8]/30 font-mono text-[10px] font-bold text-[#7dd3fc]">
                              {meta.badgeLabel}
                            </span>
                            <h4 className="font-baskerville font-bold text-white text-base">
                              {meta.name}
                            </h4>
                          </div>

                          <button
                            onClick={() => triggerCsvDownload(meta.templateFileName, meta.sampleCsv)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-[11px] font-mono text-[#7dd3fc] flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download {meta.templateFileName}</span>
                          </button>
                        </div>

                        <p className="text-xs text-[#cbd5e1]">{meta.description}</p>

                        {/* Column Table */}
                        <div className="overflow-x-auto rounded-lg border border-white/5">
                          <table className="w-full text-left text-xs font-mono">
                            <thead>
                              <tr className="border-b border-white/10 text-[#8e96c8] bg-black/30 text-[10px]">
                                <th className="p-2">Column Name</th>
                                <th className="p-2">Type</th>
                                <th className="p-2">Required?</th>
                                <th className="p-2">Valid Range</th>
                                <th className="p-2">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-[11px]">
                              {Object.entries(meta.columnDescriptions).map(([col, desc]) => (
                                <tr key={col} className="hover:bg-white/[0.02]">
                                  <td className="p-2 font-bold text-white">
                                    <code>{col}</code>
                                  </td>
                                  <td className="p-2 text-[#7dd3fc]">{desc.type}</td>
                                  <td className="p-2">
                                    {desc.required ? (
                                      <span className="text-amber-400 font-bold">Yes</span>
                                    ) : (
                                      <span className="text-[#8e96c8]">Optional</span>
                                    )}
                                  </td>
                                  <td className="p-2 text-emerald-300">{desc.range || 'Any non-empty'}</td>
                                  <td className="p-2 text-[#cbd5e1]">{desc.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
