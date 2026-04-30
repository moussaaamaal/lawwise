import { Component, signal, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Client } from '../../../models';
import { ClientService } from '../../../services/client.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './clients-list.html',
})
export class ClientsList implements OnInit {
  private clientService = inject(ClientService);
  constructor(private router: Router) {}

  searchQuery  = signal('');
  activeFilter = signal('All');
  viewMode     = signal<'grid' | 'list'>('list');
  filters      = ['All', 'Active', 'Inactive', 'Pending'];
  isLoading    = signal(false);
  error        = signal<string | null>(null);

  ngOnInit() {
    this.loadClients();
  }

  private async loadClients() {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      await this.clientService.loadClients();
    } catch {
      this.error.set('Erreur lors du chargement des clients');
    } finally {
      this.isLoading.set(false);
    }
  }

  get stats() {
    const clients = this.clientService.clients();
    return {
      total:       clients.length,
      active:      clients.filter(c => c.status === 'Active').length,
      inactive:    clients.filter(c => c.status === 'Inactive').length,
      pending:     clients.filter(c => c.status === 'Pending').length,
      totalBilled: '$0',
    };
  }

  get clients(): Client[] {
    return this.clientService.clients();
  }

  get filteredClients(): Client[] {
    const clients = this.clientService.clients();
    return clients.filter(c => {
      const matchFilter = this.activeFilter() === 'All' || c.status === this.activeFilter();
      const q = this.searchQuery().toLowerCase();
      const matchSearch = !q
        || c.name.toLowerCase().includes(q)
        || c.company.toLowerCase().includes(q)
        || c.email.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }

  setFilter(f: string)        { this.activeFilter.set(f); }
  setView(v: 'grid' | 'list') { this.viewMode.set(v); }
  goToDetail(id: string)      { this.router.navigate(['/clients', id]); }

  // ── Modal ─────────────────────────────────────────────────
  showModal    = signal(false);
  modalStep    = signal<1 | 2 | 3 | 4>(1);
  isSubmitting = signal(false);
  submitError  = signal<string | null>(null);
  private _newClientId = signal<string | null>(null);

  // Step 1 – Personal Info
  f1 = signal({ fullName:'', dob:'', gender:'', idNumber:'', nationality:'', occupation:'' });
  // Step 2 – Contact Info
  f2 = signal({ phoneCode:'+1', phone:'', phoneCode2:'+1', phone2:'', email:'', contactPref:'', waCode:'+1', whatsapp:'' });
  // Step 3 – Address + Case + Additional
  f3 = signal({
    address:'', city:'', state:'', zip:'', country:'USA',
    caseType:'', priority:'', caseDesc:'', referral:'',
    emergencyName:'', emergencyPhone:'', relationship:'', notes:'', tags:'',
    consentData:false, consentComm:false, consentTerms:false,
    clientType:'Standard Client', attorney:'',
  });

  attorneys   = ['Sarah Williams', 'Michael Chen', 'David Morrison', 'Jennifer Lopez', 'Robert Taylor'];
  clientTypes = ['Standard Client', 'Premium Client', 'VIP Client'];

  get step1Valid() { return this.f1().fullName.trim().length > 0; }
  get step2Valid() { return this.f2().email.trim().length > 0 && this.f2().phone.trim().length > 0; }
  get step3Valid() { return true; }

  get progressPct() { return ((this.modalStep() - 1) / 3) * 100; }

  get stepLabels() {
    const s = this.modalStep();
    return [
      { label: 'Personal Info', active: s === 1, done: s > 1 },
      { label: 'Contact Info',  active: s === 2, done: s > 2 },
      { label: 'Additional',    active: s === 3, done: s > 3 },
    ];
  }

  updateConsent(key: string, value: boolean) {
    this.f3.update(v => ({ ...v, [key]: value }));
  }

  setGender(g: string)      { this.f1.update(v => ({ ...v, gender: g })); }
  setContactPref(p: string) { this.f2.update(v => ({ ...v, contactPref: p })); }
  setPriority(p: string)    { this.f3.update(v => ({ ...v, priority: p })); }

  getF3Bool(key: string): boolean {
    const f = this.f3();
    return !!f[key as 'consentData' | 'consentComm' | 'consentTerms'];
  }

  openModal() {
    this.submitError.set(null);
    this.f1.set({ fullName:'', dob:'', gender:'', idNumber:'', nationality:'', occupation:'' });
    this.f2.set({ phoneCode:'+1', phone:'', phoneCode2:'+1', phone2:'', email:'', contactPref:'', waCode:'+1', whatsapp:'' });
    this.f3.set({ address:'', city:'', state:'', zip:'', country:'USA', caseType:'', priority:'', caseDesc:'', referral:'', emergencyName:'', emergencyPhone:'', relationship:'', notes:'', tags:'', consentData:false, consentComm:false, consentTerms:false, clientType:'Standard Client', attorney:'' });
    this._newClientId.set(null);
    this.modalStep.set(1);
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  nextStep() {
    const s = this.modalStep();
    if (s < 3) this.modalStep.set((s + 1) as 1|2|3|4);
    else this.submitClient();
  }

  prevStep() {
    const s = this.modalStep();
    if (s > 1) this.modalStep.set((s - 1) as 1|2|3|4);
  }

  async submitClient() {
    this.isSubmitting.set(true);
    this.submitError.set(null);
    const f1 = this.f1(); const f2 = this.f2(); const f3 = this.f3();

    const parts      = f1.fullName.trim().split(' ');
    const first_name = parts[0] || '';
    const last_name  = parts.slice(1).join(' ') || undefined;

    const clientTypeMap: Record<string, string> = {
      'Standard Client': 'INDIVIDUAL',
      'Premium Client':  'INDIVIDUAL',
      'VIP Client':      'INDIVIDUAL',
    };

    const payload: Record<string, unknown> = {
      first_name,
      email: f2.email,
      client_type: clientTypeMap[f3.clientType] ?? 'INDIVIDUAL',
      tag: 'ACTIVE',
    };
    if (last_name)     payload['last_name']        = last_name;
    if (f2.phone)      payload['phone']            = `${f2.phoneCode} ${f2.phone}`.trim();
    if (f2.whatsapp)   payload['whatsapp_number']  = `${f2.waCode} ${f2.whatsapp}`;
    if (f1.dob)        payload['date_of_birth']    = f1.dob;
    if (f1.gender)     payload['gender']           = f1.gender;
    if (f1.idNumber)   payload['national_id']      = f1.idNumber;
    if (f1.nationality)payload['nationality']      = f1.nationality;
    if (f1.occupation) payload['occupation']       = f1.occupation;
    if (f3.notes)      payload['notes']            = f3.notes;
    const addressParts = [f3.address, f3.city, f3.state, f3.zip, f3.country].filter(Boolean);
    if (addressParts.length) payload['address'] = addressParts.join(', ');

    try {
      const newClient = await this.clientService.addClient(payload);
      this._newClientId.set(newClient.id);
      this.modalStep.set(4);
    } catch (err: unknown) {
      console.error('[submitClient] error:', err);
      const msg = (err as { error?: { detail?: string } })?.error?.detail
               ?? 'Erreur lors de la création du client';
      this.submitError.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  goToNewClient() {
    const id = this._newClientId();
    this.closeModal();
    if (id) this.router.navigate(['/clients', id]);
  }
}
