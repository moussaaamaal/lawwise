import { Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface Case {
  id: number;
  title: string;
  number: string;
  type: string;
  typeBg: string;
  typeColor: string;
  status: string;
  statusBg: string;
  statusColor: string;
  priority: 'Normal' | 'Medium' | 'Urgent';
  client: string;
  attorney: string;
  nextDate: string;
  nextDateLabel: string;
  docs: number;
  tasks: number;
  participants: number;
  updatedAgo: string;
  description: string;
}

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './cases-list.html',
})
export class CasesList {

  constructor(private router: Router) {}

  searchQuery  = signal('');
  activeFilter = signal('All');
  filters      = ['All', 'Active', 'Pending', 'Closed'];

  cases: Case[] = [
    { id:1, title:'Johnson vs. State Corporation', number:'CIV-2024-1847', type:'Civil Litigation', typeBg:'bg-blue-100',   typeColor:'text-blue-700',   status:'Urgent',      statusBg:'bg-red-100',    statusColor:'text-red-700',    priority:'Urgent',  client:'Johnson Corporation',   attorney:'Sarah Williams',  nextDate:'Nov 16',  nextDateLabel:'Hearing',    docs:12, tasks:5, participants:3, updatedAgo:'2h ago',  description:'Complex civil litigation regarding breach of contract and IP disputes. Hearing scheduled Nov 16.' },
    { id:2, title:'Martinez Family Trust',         number:'EST-2024-2156', type:'Estate Law',       typeBg:'bg-green-100',  typeColor:'text-green-700',  status:'Active',      statusBg:'bg-amber-100',  statusColor:'text-amber-700',  priority:'Normal',  client:'Martinez Family',       attorney:'Michael Chen',    nextDate:'Nov 18',  nextDateLabel:'Review',     docs:8,  tasks:3, participants:2, updatedAgo:'4h ago',  description:'Estate planning and trust management for the Martinez family.' },
    { id:3, title:'Thompson Real Estate Deal',     number:'RE-2024-3421',  type:'Real Estate',      typeBg:'bg-purple-100', typeColor:'text-purple-700', status:'In Progress', statusBg:'bg-blue-100',   statusColor:'text-blue-700',   priority:'Medium',  client:'Thompson Properties',   attorney:'David Morrison',  nextDate:'Nov 20',  nextDateLabel:'Closing',    docs:15, tasks:7, participants:4, updatedAgo:'6h ago',  description:'Real estate transaction for a commercial property portfolio.' },
    { id:4, title:'Anderson Employment Case',      number:'EMP-2024-1923', type:'Employment',       typeBg:'bg-indigo-100', typeColor:'text-indigo-700', status:'Active',      statusBg:'bg-green-100',  statusColor:'text-green-700',  priority:'Normal',  client:'James Anderson',        attorney:'Jennifer Lopez',  nextDate:'Nov 22',  nextDateLabel:'Mediation',  docs:9,  tasks:4, participants:2, updatedAgo:'1d ago',  description:'Employment discrimination and wrongful termination dispute.' },
    { id:5, title:'Wilson Medical Malpractice',    number:'MED-2024-2847', type:'Medical Law',      typeBg:'bg-red-100',    typeColor:'text-red-700',    status:'Discovery',   statusBg:'bg-amber-100',  statusColor:'text-amber-700',  priority:'Urgent',  client:'Linda Wilson',          attorney:'Robert Taylor',   nextDate:'Nov 25',  nextDateLabel:'Filing',     docs:18, tasks:8, participants:5, updatedAgo:'2d ago',  description:'Medical malpractice case involving surgical procedure complications.' },
    { id:6, title:'Greenfield Corporate Merger',   number:'CORP-2024-4128',type:'Corporate Law',    typeBg:'bg-cyan-100',   typeColor:'text-cyan-700',   status:'Negotiation', statusBg:'bg-blue-100',   statusColor:'text-blue-700',   priority:'Medium',  client:'Greenfield Industries', attorney:'Sarah Williams',  nextDate:'Nov 28',  nextDateLabel:'Meeting',    docs:24, tasks:11,participants:6, updatedAgo:'3d ago',  description:'Corporate merger and acquisition with complex regulatory requirements.' },
    { id:7, title:'Patterson Business Contract',   number:'CONT-2024-5012',type:'Contract Law',     typeBg:'bg-gray-100',   typeColor:'text-gray-700',   status:'Pending',     statusBg:'bg-gray-100',   statusColor:'text-gray-700',   priority:'Normal',  client:"Patterson & Sons",      attorney:'Michael Chen',    nextDate:'Dec 02',  nextDateLabel:'Signing',    docs:5,  tasks:2, participants:2, updatedAgo:'4d ago',  description:'Commercial contract review and negotiation for service agreement.' },
    { id:8, title:'Riverside Development Permit',  number:'ENV-2024-6234', type:'Real Estate',      typeBg:'bg-purple-100', typeColor:'text-purple-700', status:'Active',      statusBg:'bg-green-100',  statusColor:'text-green-700',  priority:'Medium',  client:'Riverside Development', attorney:'David Morrison',  nextDate:'Dec 05',  nextDateLabel:'Hearing',    docs:20, tasks:6, participants:4, updatedAgo:'5d ago',  description:'Environmental permit dispute for large-scale development project.' },
  ];

  get stats() {
    return {
      total:    this.cases.length,
      active:   this.cases.filter(c => ['Active','In Progress','Discovery','Negotiation'].includes(c.status)).length,
      pending:  this.cases.filter(c => c.status === 'Pending').length,
      urgent:   this.cases.filter(c => c.priority === 'Urgent').length,
      closed:   0,
    };
  }

  get filteredCases(): Case[] {
    return this.cases.filter(c => {
      const matchFilter = this.activeFilter() === 'All'
        || (this.activeFilter() === 'Active'  && ['Active','In Progress','Discovery','Negotiation'].includes(c.status))
        || (this.activeFilter() === 'Pending' && c.status === 'Pending')
        || (this.activeFilter() === 'Closed'  && c.status === 'Closed');
      const q = this.searchQuery().toLowerCase();
      const matchSearch = !q || c.title.toLowerCase().includes(q) || c.number.toLowerCase().includes(q) || c.client.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }

  setFilter(f: string) { this.activeFilter.set(f); }
  goToDetail(id: number) { this.router.navigate(['/cases', id]); }

  // ── Modal ─────────────────────────────────────────────────
  showModal    = signal(false);
  modalStep    = signal<1 | 2 | 3 | 4>(1);
  isSubmitting = signal(false);

  // Step 1 – Case Info
  f1 = signal({
    title: '', number: '', caseType: '', practiceArea: '', priority: '', description: '',
  });
  // Step 2 – Client + Court
  f2 = signal({
    clientSearch: '', opposingParty: '', opposingCounsel: '',
    courtName: '', courtLocation: '', judgeName: '',
    filingDate: '', hearingDate: '', hearingTime: '', statute: '',
  });
  // Step 3 – Financial + Team + Settings
  f3 = signal({
    billingType: '', hourlyRate: '', caseValue: '', retainer: '',
    leadAttorney: '', tags: '',
    notificationsEnabled: true, aiAnalysis: true, confidential: false,
  });

  attorneys    = ['Sarah Williams', 'Michael Chen', 'David Morrison', 'Jennifer Lopez', 'Robert Taylor'];
  caseTypes    = ['Criminal Law','Civil Law','Corporate Law','Family Law','Real Estate Law','Immigration Law','Personal Injury','Intellectual Property'];
  practiceAreas= ['Assault & Battery','Contract Disputes','Divorce & Custody','Estate Planning','Employment Law','Tax Law'];
  billingTypes = ['Hourly Rate','Flat Fee','Contingency','Retainer'];

  get step1Valid() { return this.f1().title.trim().length > 0 && this.f1().caseType.length > 0; }
  get step2Valid() { return this.f2().clientSearch.trim().length > 0; }
  get step3Valid() { return true; }
  get progressPct() { return ((this.modalStep() - 1) / 3) * 100; }

  get stepLabels() {
    const s = this.modalStep();
    return [
      { label: 'Case Info',    active: s === 1, done: s > 1 },
      { label: 'Client & Court', active: s === 2, done: s > 2 },
      { label: 'Financial',    active: s === 3, done: s > 3 },
    ];
  }

  setPriority(p: string) { this.f1.update(v => ({ ...v, priority: p })); }

  getF3Bool(key: string): boolean {
    const f = this.f3();
    return !!f[key as "notificationsEnabled" | "aiAnalysis" | "confidential"];
  }

  setF3Bool(key: string, value: boolean) {
    const k = key as "notificationsEnabled" | "aiAnalysis" | "confidential";
    this.f3.update(v => ({ ...v, [k]: value }));
  }

  openModal() {
    this.f1.set({ title:'', number:'', caseType:'', practiceArea:'', priority:'', description:'' });
    this.f2.set({ clientSearch:'', opposingParty:'', opposingCounsel:'', courtName:'', courtLocation:'', judgeName:'', filingDate:'', hearingDate:'', hearingTime:'', statute:'' });
    this.f3.set({ billingType:'', hourlyRate:'', caseValue:'', retainer:'', leadAttorney:'', tags:'', notificationsEnabled:true, aiAnalysis:true, confidential:false });
    this.modalStep.set(1);
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  nextStep() {
    const s = this.modalStep();
    if (s < 3) this.modalStep.set((s + 1) as 1|2|3|4);
    else this.submitCase();
  }

  prevStep() {
    const s = this.modalStep();
    if (s > 1) this.modalStep.set((s - 1) as 1|2|3|4);
  }

  submitCase() {
    this.isSubmitting.set(true);
    setTimeout(() => {
      const f1 = this.f1(); const f2 = this.f2(); const f3 = this.f3();
      const newId = Math.max(...this.cases.map(c => c.id)) + 1;
      const today = new Date().toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' });
      const typeColors: Record<string, { bg:string; color:string }> = {
        'Criminal Law':         { bg:'bg-red-100',    color:'text-red-700' },
        'Civil Law':            { bg:'bg-blue-100',   color:'text-blue-700' },
        'Corporate Law':        { bg:'bg-cyan-100',   color:'text-cyan-700' },
        'Family Law':           { bg:'bg-pink-100',   color:'text-pink-700' },
        'Real Estate Law':      { bg:'bg-purple-100', color:'text-purple-700' },
        'Immigration Law':      { bg:'bg-teal-100',   color:'text-teal-700' },
        'Personal Injury':      { bg:'bg-orange-100', color:'text-orange-700' },
        'Intellectual Property':{ bg:'bg-indigo-100', color:'text-indigo-700' },
      };
      const tc = typeColors[f1.caseType] || { bg:'bg-gray-100', color:'text-gray-700' };
      this.cases.unshift({
        id: newId,
        title:        f1.title,
        number:       f1.number || `CASE-${newId}-${new Date().getFullYear()}`,
        type:         f1.caseType,
        typeBg:       tc.bg,
        typeColor:    tc.color,
        status:       'Active',
        statusBg:     'bg-green-100',
        statusColor:  'text-green-700',
        priority:     (f1.priority || 'Normal') as 'Normal'|'Medium'|'Urgent',
        client:       f2.clientSearch,
        attorney:     f3.leadAttorney || '—',
        nextDate:     f2.hearingDate || '—',
        nextDateLabel:'Hearing',
        docs:         0,
        tasks:        0,
        participants: 1,
        updatedAgo:   'Just now',
        description:  f1.description,
      });
      this.isSubmitting.set(false);
      this.modalStep.set(4);
    }, 900);
  }

  goToNewCase() {
    this.closeModal();
    this.router.navigate(['/cases', this.cases[0].id]);
  }
}