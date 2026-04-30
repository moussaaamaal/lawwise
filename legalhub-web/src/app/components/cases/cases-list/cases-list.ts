import { Component, OnInit, signal, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CaseService } from '../../../services/case.service';
import { ClientService } from '../../../services/client.service';
import { Case, Client } from '../../../models';

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './cases-list.html',
})
export class CasesList implements OnInit {
  private router        = inject(Router);
  private caseService   = inject(CaseService);
  private clientService = inject(ClientService);

  searchQuery  = signal('');
  activeFilter = signal('All');
  filters      = ['All', 'Active', 'Pending', 'Closed'];
  isLoading    = signal(false);
  errorMsg     = signal('');

  // Advanced filters
  showFilterPanel = signal(false);
  filterStatus    = signal('');
  filterType      = signal('');
  filterPriority  = signal('');

  // Selection
  selectedIds = signal<Set<string>>(new Set());

  // Row context menu
  rowMenuOpen = signal('');

  get cases(): Case[]     { return this.caseService.cases(); }
  get clients(): Client[] { return this.clientService.clients(); }

  async ngOnInit() {
    this.isLoading.set(true);
    try {
      await Promise.all([
        this.caseService.loadCases(),
        this.clientService.loadClients(),
      ]);
    } catch {
      this.errorMsg.set('Failed to load cases. Make sure the backend is running.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ── CSS / label helpers ───────────────────────────────────

  typeBg(type: string): string {
    const map: Record<string, string> = {
      CRIMINAL: 'bg-red-100', CIVIL: 'bg-blue-100', CORPORATE: 'bg-cyan-100',
      FAMILY: 'bg-pink-100', REAL_ESTATE: 'bg-purple-100', IMMIGRATION: 'bg-teal-100',
      PERSONAL_INJURY: 'bg-orange-100', IP: 'bg-indigo-100', LABOR: 'bg-emerald-100', TAX: 'bg-yellow-100',
    };
    return map[type] ?? 'bg-gray-100';
  }

  typeColor(type: string): string {
    const map: Record<string, string> = {
      CRIMINAL: 'text-red-700', CIVIL: 'text-blue-700', CORPORATE: 'text-cyan-700',
      FAMILY: 'text-pink-700', REAL_ESTATE: 'text-purple-700', IMMIGRATION: 'text-teal-700',
      PERSONAL_INJURY: 'text-orange-700', IP: 'text-indigo-700', LABOR: 'text-emerald-700', TAX: 'text-yellow-700',
    };
    return map[type] ?? 'text-gray-700';
  }

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      CRIMINAL: 'Criminal', CIVIL: 'Civil', CORPORATE: 'Corporate',
      FAMILY: 'Family', REAL_ESTATE: 'Real Estate', IMMIGRATION: 'Immigration',
      PERSONAL_INJURY: 'Personal Injury', IP: 'IP', LABOR: 'Labor', TAX: 'Tax',
    };
    return map[type] ?? type;
  }

  statusBg(status: string): string {
    const map: Record<string, string> = {
      NEW: 'bg-gray-100', INVESTIGATION: 'bg-blue-100', PRE_TRIAL: 'bg-amber-100',
      TRIAL: 'bg-orange-100', APPEAL: 'bg-purple-100', SETTLED: 'bg-green-100', CLOSED: 'bg-gray-200',
    };
    return map[status] ?? 'bg-gray-100';
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      NEW: 'text-gray-700', INVESTIGATION: 'text-blue-700', PRE_TRIAL: 'text-amber-700',
      TRIAL: 'text-orange-700', APPEAL: 'text-purple-700', SETTLED: 'text-green-700', CLOSED: 'text-gray-500',
    };
    return map[status] ?? 'text-gray-700';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      NEW: 'New', INVESTIGATION: 'Investigation', PRE_TRIAL: 'Pre-Trial',
      TRIAL: 'Trial', APPEAL: 'Appeal', SETTLED: 'Settled', CLOSED: 'Closed',
    };
    return map[status] ?? status;
  }

  priorityClasses(priority: string): string {
    const map: Record<string, string> = {
      URGENT: 'bg-red-100 text-red-700', HIGH: 'bg-red-100 text-red-700',
      MEDIUM: 'bg-amber-100 text-amber-700', NORMAL: 'bg-green-100 text-green-700', LOW: 'bg-blue-100 text-blue-700',
    };
    return map[priority] ?? 'bg-gray-100 text-gray-700';
  }

  priorityLabel(priority: string): string {
    const map: Record<string, string> = {
      URGENT: 'Urgent', HIGH: 'High', MEDIUM: 'Medium', NORMAL: 'Normal', LOW: 'Low',
    };
    return map[priority] ?? priority;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '—';
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  }

  // ── Stats ─────────────────────────────────────────────────

  get stats() {
    const cs = this.cases;
    const activeStatuses = new Set(['NEW', 'INVESTIGATION', 'PRE_TRIAL', 'TRIAL', 'APPEAL']);
    return {
      total:   cs.length,
      active:  cs.filter(c => activeStatuses.has(c.status)).length,
      pending: cs.filter(c => c.status === 'SETTLED').length,
      urgent:  cs.filter(c => c.priority === 'URGENT' || c.priority === 'HIGH').length,
      closed:  cs.filter(c => c.status === 'CLOSED').length,
    };
  }

  // ── Filtering ─────────────────────────────────────────────

  get filteredCases(): Case[] {
    return this.cases.filter(c => {
      const activeStatuses = new Set(['NEW', 'INVESTIGATION', 'PRE_TRIAL', 'TRIAL', 'APPEAL']);
      const matchFilter =
        this.activeFilter() === 'All'
        || (this.activeFilter() === 'Active'  && activeStatuses.has(c.status))
        || (this.activeFilter() === 'Pending' && c.status === 'SETTLED')
        || (this.activeFilter() === 'Closed'  && c.status === 'CLOSED');
      const q = this.searchQuery().toLowerCase();
      const matchSearch = !q
        || c.title.toLowerCase().includes(q)
        || c.caseNumber.toLowerCase().includes(q)
        || c.client.toLowerCase().includes(q);
      const matchStatus   = !this.filterStatus()   || c.status === this.filterStatus();
      const matchType     = !this.filterType()     || c.type === this.filterType();
      const matchPriority = !this.filterPriority() || c.priority === this.filterPriority();
      return matchFilter && matchSearch && matchStatus && matchType && matchPriority;
    });
  }

  setFilter(f: string)     { this.activeFilter.set(f); }
  onSearchChange(q: string){ this.searchQuery.set(q); }
  onFilterChange()         { }

  get hasActiveFilters(): boolean {
    return !!this.filterStatus() || !!this.filterType() || !!this.filterPriority();
  }

  clearFilters() {
    this.filterStatus.set(''); this.filterType.set(''); this.filterPriority.set('');
  }

  readonly statusOptions   = ['NEW','INVESTIGATION','PRE_TRIAL','TRIAL','APPEAL','SETTLED','CLOSED'];
  readonly typeOptions     = ['CRIMINAL','CIVIL','CORPORATE','FAMILY','REAL_ESTATE','IMMIGRATION','PERSONAL_INJURY','IP','LABOR','TAX'];
  readonly priorityOptions = ['URGENT','HIGH','MEDIUM','NORMAL','LOW'];

  // ── Selection ─────────────────────────────────────────────

  get allSelected(): boolean {
    const p = this.filteredCases;
    return p.length > 0 && p.every((c: Case) => this.selectedIds().has(c.id));
  }

  get selectedCount(): number { return this.selectedIds().size; }

  toggleSelectAll() {
    const ids = new Set(this.selectedIds());
    if (this.allSelected) {
      this.filteredCases.forEach((c: Case) => ids.delete(c.id));
    } else {
      this.filteredCases.forEach((c: Case) => ids.add(c.id));
    }
    this.selectedIds.set(ids);
  }

  toggleSelect(id: string) {
    const ids = new Set(this.selectedIds());
    ids.has(id) ? ids.delete(id) : ids.add(id);
    this.selectedIds.set(ids);
  }

  isSelected(id: string): boolean { return this.selectedIds().has(id); }

  clearSelection() { this.selectedIds.set(new Set()); }

  // ── Row menu ──────────────────────────────────────────────

  toggleRowMenu(id: string, e: Event) {
    e.stopPropagation();
    this.rowMenuOpen.set(this.rowMenuOpen() === id ? '' : id);
  }

  closeRowMenu() { this.rowMenuOpen.set(''); }

  async deleteCase(id: string) {
    this.closeRowMenu();
    if (!confirm('Delete this case? This cannot be undone.')) return;
    try {
      await this.caseService.deleteCase(id);
    } catch {
      alert('Failed to delete case.');
    }
  }

  // ── Export ────────────────────────────────────────────────

  exportCsv() {
    const rows = [
      ['Case Number', 'Title', 'Client', 'Type', 'Status', 'Priority', 'Court', 'Next Hearing'],
      ...this.filteredCases.map(c => [
        c.caseNumber, c.title, c.client ?? '', this.typeLabel(c.type),
        this.statusLabel(c.status), this.priorityLabel(c.priority),
        c.court ?? '', this.formatDate(c.nextHearing),
      ]),
    ];
    const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'cases.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  goToDetail(id: string) { this.router.navigate(['/cases', id]); }

  // ── Modal — New Case (3 steps) ────────────────────────────

  showModal     = signal(false);
  modalStep     = signal<1 | 2 | 3 | 4>(1);
  isSubmitting  = signal(false);
  createdCaseId = signal('');

  f1 = signal({ title: '', number: '', caseType: '', practiceArea: '', priority: '', description: '' });
  f2 = signal({
    clientId: '', opposingParty: '', opposingCounsel: '',
    courtName: '', courtLocation: '', judgeName: '',
    filingDate: '', hearingDate: '', statute: '',
  });
  f3 = signal({
    billingType: '', caseValue: '',
    notificationsEnabled: true, aiAnalysis: true, confidential: false,
  });

  caseTypes     = ['Criminal Law','Civil Law','Corporate Law','Family Law','Real Estate Law','Immigration Law','Personal Injury','Intellectual Property','Labor Law','Tax Law'];
  practiceAreas = ['Assault & Battery','Contract Disputes','Divorce & Custody','Estate Planning','Employment Law','Tax Law'];
  billingTypes  = ['Hourly Rate','Flat Fee','Contingency','Retainer'];

  get step1Valid() { return this.f1().title.trim().length > 0 && this.f1().caseType.length > 0; }
  get step2Valid() { return this.f2().clientId.trim().length > 0; }
  get step3Valid() { return true; }
  get progressPct() { return ((this.modalStep() - 1) / 3) * 100; }

  get stepLabels() {
    const s = this.modalStep();
    return [
      { label: 'Case Info',      active: s === 1, done: s > 1 },
      { label: 'Client & Court', active: s === 2, done: s > 2 },
      { label: 'Financial',      active: s === 3, done: s > 3 },
    ];
  }

  setPriority(p: string) { this.f1.update(v => ({ ...v, priority: p })); }

  getF3Bool(key: string): boolean {
    return !!this.f3()[key as 'notificationsEnabled' | 'aiAnalysis' | 'confidential'];
  }

  setF3Bool(key: string, value: boolean) {
    const k = key as 'notificationsEnabled' | 'aiAnalysis' | 'confidential';
    this.f3.update(v => ({ ...v, [k]: value }));
  }

  openModal() {
    this.f1.set({ title: '', number: '', caseType: '', practiceArea: '', priority: '', description: '' });
    this.f2.set({ clientId: '', opposingParty: '', opposingCounsel: '', courtName: '', courtLocation: '', judgeName: '', filingDate: '', hearingDate: '', statute: '' });
    this.f3.set({ billingType: '', caseValue: '', notificationsEnabled: true, aiAnalysis: true, confidential: false });
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

  private readonly caseTypeMap: Record<string, string> = {
    'Criminal Law': 'CRIMINAL', 'Civil Law': 'CIVIL', 'Corporate Law': 'CORPORATE',
    'Family Law': 'FAMILY', 'Real Estate Law': 'REAL_ESTATE', 'Immigration Law': 'IMMIGRATION',
    'Personal Injury': 'PERSONAL_INJURY', 'Intellectual Property': 'IP',
    'Labor Law': 'LABOR', 'Tax Law': 'TAX',
  };

  private readonly billingTypeMap: Record<string, string> = {
    'Hourly Rate': 'HOURLY', 'Flat Fee': 'FLAT_FEE', 'Contingency': 'CONTINGENCY', 'Retainer': 'RETAINER',
  };

  private readonly priorityMap: Record<string, string> = {
    'Normal': 'NORMAL', 'Medium': 'MEDIUM', 'Urgent': 'URGENT',
  };

  async submitCase() {
    this.isSubmitting.set(true);
    try {
      const f1 = this.f1(); const f2 = this.f2(); const f3 = this.f3();
      const payload: Record<string, unknown> = {
        title:              f1.title,
        case_number:        f1.number || `CASE-${Date.now()}`,
        case_type:          this.caseTypeMap[f1.caseType] ?? 'CIVIL',
        practice_area:      f1.practiceArea || undefined,
        priority:           this.priorityMap[f1.priority] ?? 'NORMAL',
        description:        f1.description || undefined,
        client_id:          f2.clientId || undefined,
        opposing_party:     f2.opposingParty || undefined,
        opposing_counsel:   f2.opposingCounsel || undefined,
        court_name:         f2.courtName || undefined,
        court_location:     f2.courtLocation || undefined,
        judge_name:         f2.judgeName || undefined,
        filing_date:        f2.filingDate || undefined,
        first_hearing_date: f2.hearingDate || undefined,
        statute_of_limitations: f2.statute || undefined,
        billing_type:       f3.billingType ? (this.billingTypeMap[f3.billingType] ?? undefined) : undefined,
        estimated_value:    f3.caseValue ? Number(f3.caseValue) : undefined,
      };
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      await this.caseService.addCase(payload);
      this.createdCaseId.set(this.cases[0]?.id ?? '');
      this.modalStep.set(4);
    } catch (err) {
      console.error('Failed to create case:', err);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  goToNewCase() {
    this.closeModal();
    if (this.createdCaseId()) {
      this.router.navigate(['/cases', this.createdCaseId()]);
    }
  }
}
