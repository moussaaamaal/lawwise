import { Component, signal, computed, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadModalService } from '../../../shared/upload-modal/upload-modal.sevice';
import { UploadModal } from '../../../shared/upload-modal/upload-modal';

// WEB-DOC-05 — document status workflow
type DocStatus = 'Pending Review' | 'Approved' | 'Rejected';

interface DocFile {
  name: string; desc: string; case: string; type: string;
  typeBg: string; typeColor: string; iconBg: string; icon: string;
  iconColor: string; size: string; avatar: string; uploader: string;
  modified: string;
  // WEB-DOC-05
  status: DocStatus;
  // WEB-DOC-06
  isVoiceNote?: boolean;
  duration?: string;        // ex: "2:34"
  transcribed?: boolean;
}

interface Folder {
  name: string; type: string; files: string; size: string;
  avatar: string; owner: string; folderBg: string; folderColor: string;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [NgClass, FormsModule, UploadModal],
  templateUrl: './documents.html',
})
export class Documents {
  upload = inject(UploadModalService);

  searchQuery   = signal('');
  // WEB-DOC-09 — filters aligned to spec
  activeFilter  = signal<'all' | 'by-case' | 'pending' | 'approved' | 'voice-notes'>('all');
  viewMode      = signal<'grid' | 'list'>('list');

  // WEB-DOC-05 — bulk selection for AI summarize
  selectedDocs  = signal<Set<string>>(new Set());
  showBulkBar   = computed(() => this.selectedDocs().size > 0);

  // WEB-DOC-06 — voice recording state
  isRecording   = signal(false);
  recordSeconds = signal(0);
  private _recInterval: any;

  // Filter labels → WEB-DOC-09
  filters: { key: 'all'|'by-case'|'pending'|'approved'|'voice-notes'; label: string; icon: string }[] = [
    { key:'all',         label:'All Files',      icon:'fa-solid fa-layer-group' },
    { key:'by-case',     label:'By Case',        icon:'fa-solid fa-briefcase' },
    { key:'pending',     label:'Pending Review', icon:'fa-solid fa-clock' },
    { key:'approved',    label:'Approved',       icon:'fa-solid fa-circle-check' },
    { key:'voice-notes', label:'Voice Notes',    icon:'fa-solid fa-microphone' },
  ];

  // WEB-DOC-01 — stats
  stats = [
    { icon:'fa-solid fa-folder',   iconBg:'bg-blue-100',   iconColor:'text-blue-600',   value:'247',    label:'Total Folders',   badge:'+8',     badgeColor:'text-green-600 bg-green-100',   note:'24 cases organized' },
    { icon:'fa-solid fa-file',     iconBg:'bg-purple-100', iconColor:'text-purple-600', value:'3,847',  label:'Total Documents', badge:'+142',   badgeColor:'text-green-600 bg-green-100',   note:'142 added this month' },
    { icon:'fa-solid fa-robot',    iconBg:'bg-amber-100',  iconColor:'text-amber-600',  value:'1,284',  label:'AI Summaries',    badge:'AI',     badgeColor:'text-purple-600 bg-purple-100', note:'Auto-generated' },
    { icon:'fa-solid fa-hourglass-half', iconBg:'bg-orange-100', iconColor:'text-orange-600', value:'38', label:'Pending Review', badge:'Review', badgeColor:'text-orange-600 bg-orange-100', note:'Awaiting approval' },
    { icon:'fa-solid fa-microphone', iconBg:'bg-pink-100', iconColor:'text-pink-600',   value:'24',     label:'Voice Notes',     badge:'New',    badgeColor:'text-pink-600 bg-pink-100',     note:'12 transcribed' },
  ];

  folders: Folder[] = [
    { name:'Johnson vs. State Corp',  type:'Civil Litigation',     files:'127 files', size:'12.4 GB', avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', owner:'Sarah Williams',  folderBg:'bg-blue-100',   folderColor:'text-blue-600' },
    { name:'Martinez Family Trust',   type:'Estate Law',            files:'89 files',  size:'8.7 GB',  avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', owner:'Michael Chen',    folderBg:'bg-green-100',  folderColor:'text-green-600' },
    { name:'Thompson Real Estate',    type:'Real Estate Law',       files:'64 files',  size:'5.2 GB',  avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg', owner:'David Morrison',  folderBg:'bg-amber-100',  folderColor:'text-amber-600' },
    { name:'Anderson Employment',     type:'Employment Law',        files:'52 files',  size:'4.1 GB',  avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg', owner:'Jennifer Lopez',  folderBg:'bg-purple-100', folderColor:'text-purple-600' },
    { name:'Wilson Medical Case',     type:'Medical Malpractice',   files:'98 files',  size:'11.3 GB', avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', owner:'Robert Taylor',   folderBg:'bg-red-100',    folderColor:'text-red-600' },
    { name:'Greenfield Industries',   type:'Corporate Law',         files:'143 files', size:'18.9 GB', avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg', owner:'Emily Rodriguez', folderBg:'bg-indigo-100', folderColor:'text-indigo-600' },
    { name:'Davis Divorce Case',      type:'Family Law',            files:'76 files',  size:'6.8 GB',  avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg', owner:'Lisa Anderson',   folderBg:'bg-pink-100',   folderColor:'text-pink-600' },
    { name:'Parker IP Portfolio',     type:'Intellectual Property', files:'211 files', size:'22.6 GB', avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg', owner:'James Wilson',    folderBg:'bg-teal-100',   folderColor:'text-teal-600' },
  ];

  // WEB-DOC-03, 05, 06 — documents with status + voice notes
  allDocuments: DocFile[] = [
    { name:'Contract_Amendment_Final_v3.pdf',   desc:'Legal contract document',  case:'Johnson vs. State Corp', type:'PDF',  typeBg:'bg-red-100',    typeColor:'text-red-700',    iconBg:'bg-red-100',    icon:'fa-solid fa-file-pdf',    iconColor:'text-red-600',    size:'2.4 MB',  avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', uploader:'Sarah Williams',  modified:'2 hours ago',  status:'Pending Review' },
    { name:'Witness_Statement_Deposition.docx', desc:'Testimony transcript',     case:'Martinez Family Trust',  type:'DOCX', typeBg:'bg-blue-100',   typeColor:'text-blue-700',   iconBg:'bg-blue-100',   icon:'fa-solid fa-file-word',   iconColor:'text-blue-600',   size:'1.8 MB',  avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', uploader:'Michael Chen',    modified:'4 hours ago',  status:'Approved' },
    { name:'Financial_Analysis_Q3_2024.xlsx',   desc:'Financial breakdown',      case:'Thompson Real Estate',   type:'XLSX', typeBg:'bg-green-100',  typeColor:'text-green-700',  iconBg:'bg-green-100',  icon:'fa-solid fa-file-excel',  iconColor:'text-green-600',  size:'3.2 MB',  avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg', uploader:'David Morrison',  modified:'6 hours ago',  status:'Approved' },
    { name:'Medical_Records_Confidential.pdf',  desc:'Protected health info',    case:'Wilson Medical Case',    type:'PDF',  typeBg:'bg-red-100',    typeColor:'text-red-700',    iconBg:'bg-red-100',    icon:'fa-solid fa-file-pdf',    iconColor:'text-red-600',    size:'8.7 MB',  avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', uploader:'Robert Taylor',   modified:'1 day ago',    status:'Pending Review' },
    { name:'Corporate_Bylaws_Amendment.docx',   desc:'Legal document draft',     case:'Greenfield Industries',  type:'DOCX', typeBg:'bg-blue-100',   typeColor:'text-blue-700',   iconBg:'bg-blue-100',   icon:'fa-solid fa-file-word',   iconColor:'text-blue-600',   size:'4.1 MB',  avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg', uploader:'Emily Rodriguez', modified:'1 day ago',    status:'Rejected' },
    { name:'Evidence_Photos_Bundle.zip',        desc:'Photographic evidence',    case:'Anderson Employment',    type:'ZIP',  typeBg:'bg-amber-100',  typeColor:'text-amber-700',  iconBg:'bg-amber-100',  icon:'fa-solid fa-file-zipper', iconColor:'text-amber-600',  size:'24.6 MB', avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg', uploader:'Jennifer Lopez',  modified:'2 days ago',   status:'Approved' },
    { name:'Court_Hearing_Notes_Nov14.pdf',     desc:'Court proceedings notes',  case:'Johnson vs. State Corp', type:'PDF',  typeBg:'bg-red-100',    typeColor:'text-red-700',    iconBg:'bg-red-100',    icon:'fa-solid fa-file-pdf',    iconColor:'text-red-600',    size:'1.1 MB',  avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', uploader:'Sarah Williams',  modified:'3 days ago',   status:'Pending Review' },
    // WEB-DOC-06 — voice notes
    { name:'Client_Interview_Martinez.m4a',     desc:'Voice note — auto-transcribed', case:'Martinez Family Trust', type:'AUDIO', typeBg:'bg-pink-100', typeColor:'text-pink-700', iconBg:'bg-pink-100', icon:'fa-solid fa-microphone', iconColor:'text-pink-600', size:'4.8 MB', avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', uploader:'Michael Chen',   modified:'5 hours ago',  status:'Approved', isVoiceNote:true, duration:'3:42', transcribed:true },
    { name:'Deposition_Prep_Notes.m4a',         desc:'Voice note — pending transcription', case:'Wilson Medical Case', type:'AUDIO', typeBg:'bg-pink-100', typeColor:'text-pink-700', iconBg:'bg-pink-100', icon:'fa-solid fa-microphone', iconColor:'text-pink-600', size:'2.3 MB', avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', uploader:'Robert Taylor',  modified:'Yesterday',    status:'Pending Review', isVoiceNote:true, duration:'1:58', transcribed:false },
  ];

  // WEB-DOC-09 — filter computed
  filteredDocuments = computed(() => {
    const f = this.activeFilter();
    const q = this.searchQuery().toLowerCase();
    let docs = this.allDocuments;
    if (f === 'pending')     docs = docs.filter(d => d.status === 'Pending Review');
    if (f === 'approved')    docs = docs.filter(d => d.status === 'Approved');
    if (f === 'voice-notes') docs = docs.filter(d => d.isVoiceNote);
    if (q) docs = docs.filter(d => d.name.toLowerCase().includes(q) || d.case.toLowerCase().includes(q));
    return docs;
  });

  // WEB-DOC-05 — counts for filter badges
  get pendingCount() { return this.allDocuments.filter(d => d.status === 'Pending Review').length; }
  get approvedCount() { return this.allDocuments.filter(d => d.status === 'Approved').length; }
  get voiceCount()   { return this.allDocuments.filter(d => d.isVoiceNote).length; }

  // WEB-DOC-03 — AI categories (simplified per spec)
  categories = [
    { icon:'fa-solid fa-file-contract',  iconBg:'bg-red-100',    iconColor:'text-red-600',    label:'Contracts',          count:'487', unit:'documents', pct: 25 },
    { icon:'fa-solid fa-gavel',          iconBg:'bg-blue-100',   iconColor:'text-blue-600',   label:'Court Documents',    count:'413', unit:'documents', pct: 21 },
    { icon:'fa-solid fa-image',          iconBg:'bg-purple-100', iconColor:'text-purple-600', label:'Evidence',           count:'892', unit:'files',      pct: 46 },
    { icon:'fa-solid fa-file-invoice',   iconBg:'bg-amber-100',  iconColor:'text-amber-600',  label:'Financial Docs',     count:'276', unit:'documents', pct: 14 },
    { icon:'fa-solid fa-user',           iconBg:'bg-green-100',  iconColor:'text-green-600',  label:'Client Documents',   count:'654', unit:'documents', pct: 34 },
  ];

  // WEB-DOC-07 — storage tracker
  storageUsed   = 234;   // GB
  storageTotal  = 350;   // GB
  get storagePercent() { return Math.round((this.storageUsed / this.storageTotal) * 100); }
  get storageColor()   {
    const p = this.storagePercent;
    if (p >= 85) return { bar:'bg-red-500', text:'text-red-600', badge:'text-red-600 bg-red-100' };
    if (p >= 65) return { bar:'bg-amber-500', text:'text-amber-600', badge:'text-amber-600 bg-amber-100' };
    return { bar:'bg-green-500', text:'text-green-600', badge:'text-green-600 bg-green-100' };
  }

  // ── Selection helpers (WEB-DOC-04) ───────────────────────
  toggleDoc(name: string): void {
    this.selectedDocs.update(s => {
      const next = new Set(s);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }
  isSelected(name: string): boolean { return this.selectedDocs().has(name); }
  toggleAll(): void {
    const docs = this.filteredDocuments();
    const all  = docs.every(d => this.selectedDocs().has(d.name));
    this.selectedDocs.set(all ? new Set() : new Set(docs.map(d => d.name)));
  }
  get allSelected(): boolean {
    const docs = this.filteredDocuments();
    return docs.length > 0 && docs.every(d => this.selectedDocs().has(d.name));
  }
  clearSelection(): void { this.selectedDocs.set(new Set()); }
  bulkSummarize(): void { /* triggers AI summarize flow */ alert(`Summarizing ${this.selectedDocs().size} document(s)…`); }

  // ── WEB-DOC-05 — inline status change ────────────────────
  approveDoc(name: string): void {
    const idx = this.allDocuments.findIndex(d => d.name === name);
    if (idx >= 0) this.allDocuments[idx].status = 'Approved';
  }
  rejectDoc(name: string): void {
    const idx = this.allDocuments.findIndex(d => d.name === name);
    if (idx >= 0) this.allDocuments[idx].status = 'Rejected';
  }

  // ── WEB-DOC-06 — voice recording ─────────────────────────
  startRecording(): void {
    this.isRecording.set(true);
    this.recordSeconds.set(0);
    this._recInterval = setInterval(() => this.recordSeconds.update(s => s + 1), 1000);
  }
  stopRecording(): void {
    this.isRecording.set(false);
    clearInterval(this._recInterval);
  }
  get recordTime(): string {
    const s = this.recordSeconds();
    return `${Math.floor(s / 60).toString().padStart(2,'0')}:${(s % 60).toString().padStart(2,'0')}`;
  }

  // ── Status helpers ────────────────────────────────────────
  getStatusCls(status: DocStatus): string {
    const map: Record<DocStatus, string> = {
      'Pending Review': 'bg-orange-100 text-orange-700',
      'Approved':       'bg-green-100 text-green-700',
      'Rejected':       'bg-red-100 text-red-700',
    };
    return map[status];
  }
  getStatusIcon(status: DocStatus): string {
    const map: Record<DocStatus, string> = {
      'Pending Review': 'fa-solid fa-clock',
      'Approved':       'fa-solid fa-circle-check',
      'Rejected':       'fa-solid fa-circle-xmark',
    };
    return map[status];
  }

  setFilter(key: 'all'|'by-case'|'pending'|'approved'|'voice-notes'): void {
    this.activeFilter.set(key);
    this.clearSelection();
  }
  setView(mode: 'grid'|'list'): void { this.viewMode.set(mode); }
}