import { Component, signal, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface Client {
  id: number;
  name: string;
  avatar: string;
  company: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Pending';
  statusBg: string;
  statusColor: string;
  type: string;
  typeBg: string;
  typeColor: string;
  since: string;
  lastContact: string;
  totalBilled: string;
  activeCases: number;
  tags: string[];
  attorney: string;
}

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './clients-list.html',
})
export class ClientsList {

  constructor(private router: Router) {}

  searchQuery  = signal('');
  activeFilter = signal('All');
  viewMode     = signal<'grid' | 'list'>('list');
  filters      = ['All', 'Active', 'Inactive', 'Pending'];

  clients: Client[] = [
    { id:1, name:'Sarah Johnson',      avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg', company:'Johnson & Associates LLC',  email:'sarah@johnson.com',    phone:'+1 (555) 123-4567', status:'Active',   statusBg:'bg-green-100', statusColor:'text-green-700', type:'Premium Client',  typeBg:'bg-blue-100',  typeColor:'text-blue-700',  since:'Jan 15, 2023', lastContact:'Nov 12, 2024', totalBilled:'$48,750',  activeCases:5, tags:['Corporate','Litigation','Real Estate'],   attorney:'Sarah Williams' },
    { id:2, name:'Robert Martinez',    avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg', company:'Martinez Family Trust',     email:'robert@martinez.com',  phone:'+1 (555) 234-5678', status:'Active',   statusBg:'bg-green-100', statusColor:'text-green-700', type:'Standard Client', typeBg:'bg-gray-100',  typeColor:'text-gray-700',  since:'Mar 20, 2023', lastContact:'Nov 10, 2024', totalBilled:'$22,400',  activeCases:2, tags:['Estate Planning','Trust'],              attorney:'Michael Chen' },
    { id:3, name:'Emily Thompson',     avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', company:'Thompson Properties LLC',   email:'emily@thompson.com',   phone:'+1 (555) 345-6789', status:'Active',   statusBg:'bg-green-100', statusColor:'text-green-700', type:'Premium Client',  typeBg:'bg-blue-100',  typeColor:'text-blue-700',  since:'Jun 05, 2022', lastContact:'Nov 08, 2024', totalBilled:'$67,200',  activeCases:4, tags:['Real Estate','Corporate'],              attorney:'David Morrison' },
    { id:4, name:'James Anderson',     avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg', company:'Anderson Industries',       email:'james@anderson.com',   phone:'+1 (555) 456-7890', status:'Pending',  statusBg:'bg-amber-100', statusColor:'text-amber-700', type:'Standard Client', typeBg:'bg-gray-100',  typeColor:'text-gray-700',  since:'Oct 01, 2024', lastContact:'Oct 28, 2024', totalBilled:'$6,300',   activeCases:1, tags:['Employment Law'],                      attorney:'Jennifer Lopez' },
    { id:5, name:'Linda Wilson',       avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg', company:'Wilson Medical Group',      email:'linda@wilson.com',     phone:'+1 (555) 567-8901', status:'Active',   statusBg:'bg-green-100', statusColor:'text-green-700', type:'Premium Client',  typeBg:'bg-blue-100',  typeColor:'text-blue-700',  since:'Feb 14, 2021', lastContact:'Nov 11, 2024', totalBilled:'$95,800',  activeCases:3, tags:['Healthcare','Malpractice'],             attorney:'Robert Taylor' },
    { id:6, name:'Michael Greenfield', avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', company:'Greenfield Industries',     email:'michael@greenfield.com',phone:'+1 (555) 678-9012', status:'Active',   statusBg:'bg-green-100', statusColor:'text-green-700', type:'Standard Client', typeBg:'bg-gray-100',  typeColor:'text-gray-700',  since:'Aug 22, 2023', lastContact:'Nov 05, 2024', totalBilled:'$18,900',  activeCases:1, tags:['Corporate','Merger'],                  attorney:'Sarah Williams' },
    { id:7, name:'Patricia Patterson', avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg', company:"Patterson & Sons",          email:'patricia@patterson.com',phone:'+1 (555) 789-0123', status:'Inactive', statusBg:'bg-red-100',   statusColor:'text-red-700',   type:'Standard Client', typeBg:'bg-gray-100',  typeColor:'text-gray-700',  since:'Apr 10, 2022', lastContact:'Aug 15, 2024', totalBilled:'$31,500',  activeCases:0, tags:['Business Law','Contract'],            attorney:'Michael Chen' },
    { id:8, name:'Thomas Riverside',   avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg', company:'Riverside Development',     email:'thomas@riverside.com', phone:'+1 (555) 890-1234', status:'Active',   statusBg:'bg-green-100', statusColor:'text-green-700', type:'Premium Client',  typeBg:'bg-blue-100',  typeColor:'text-blue-700',  since:'Jan 08, 2020', lastContact:'Nov 13, 2024', totalBilled:'$142,600', activeCases:6, tags:['Real Estate','Development','Corporate'], attorney:'David Morrison' },
  ];

  get stats() {
    return {
      total:       this.clients.length,
      active:      this.clients.filter(c => c.status === 'Active').length,
      inactive:    this.clients.filter(c => c.status === 'Inactive').length,
      pending:     this.clients.filter(c => c.status === 'Pending').length,
      totalBilled: '$433.5K',
    };
  }

  get filteredClients(): Client[] {
    return this.clients.filter(c => {
      const matchFilter = this.activeFilter() === 'All' || c.status === this.activeFilter();
      const q = this.searchQuery().toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }

  setFilter(f: string)        { this.activeFilter.set(f); }
  setView(v: 'grid' | 'list') { this.viewMode.set(v); }
  goToDetail(id: number)      { this.router.navigate(['/clients', id]); }

  // ── Modal ─────────────────────────────────────────────────
  showModal    = signal(false);
  modalStep    = signal<1 | 2 | 3 | 4>(1); // 1-3 = form steps, 4 = success
  isSubmitting = signal(false);

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
  get step3Valid() { return true; } // all optional on step 3

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
    this.f1.set({ fullName:'', dob:'', gender:'', idNumber:'', nationality:'', occupation:'' });
    this.f2.set({ phoneCode:'+1', phone:'', phoneCode2:'+1', phone2:'', email:'', contactPref:'', waCode:'+1', whatsapp:'' });
    this.f3.set({ address:'', city:'', state:'', zip:'', country:'USA', caseType:'', priority:'', caseDesc:'', referral:'', emergencyName:'', emergencyPhone:'', relationship:'', notes:'', tags:'', consentData:false, consentComm:false, consentTerms:false, clientType:'Standard Client', attorney:'' });
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

  submitClient() {
    this.isSubmitting.set(true);
    setTimeout(() => {
      const f1 = this.f1(); const f2 = this.f2(); const f3 = this.f3();
      const newId = Math.max(...this.clients.map(c => c.id)) + 1;
      const statusMap: Record<string, {bg:string;color:string}> = {
        'Active':  {bg:'bg-green-100',color:'text-green-700'},
        'Pending': {bg:'bg-amber-100',color:'text-amber-700'},
        'Inactive':{bg:'bg-red-100',  color:'text-red-700'},
      };
      const typeMap: Record<string, {bg:string;color:string}> = {
        'Standard Client':{bg:'bg-gray-100',  color:'text-gray-700'},
        'Premium Client': {bg:'bg-blue-100',  color:'text-blue-700'},
        'VIP Client':     {bg:'bg-purple-100',color:'text-purple-700'},
      };
      const today = new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'});
      this.clients.unshift({
        id: newId,
        name:       f1.fullName,
        avatar:     `https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-${(newId % 9) + 1}.jpg`,
        company:    f1.occupation || '—',
        email:      f2.email,
        phone:      f2.phoneCode + ' ' + f2.phone,
        status:     'Active',
        statusBg:   statusMap['Active'].bg,
        statusColor:statusMap['Active'].color,
        type:       f3.clientType,
        typeBg:     typeMap[f3.clientType].bg,
        typeColor:  typeMap[f3.clientType].color,
        since:      today,
        lastContact:today,
        totalBilled:'$0',
        activeCases:0,
        tags:       f3.tags ? f3.tags.split(',').map(t=>t.trim()).filter(Boolean) : [],
        attorney:   f3.attorney || '—',
      });
      this.isSubmitting.set(false);
      this.modalStep.set(4);
    }, 900);
  }

  goToNewClient() {
    this.closeModal();
    this.router.navigate(['/clients', this.clients[0].id]);
  }
}