import { Component, signal, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../../../models';
import { ClientService } from '../../../services/client.service';
import { UploadModalService } from '../../../shared/upload-modal/upload-modal.sevice';
import { UploadModal } from '../../../shared/upload-modal/upload-modal';


@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [NgClass, FormsModule, UploadModal],
  templateUrl: './client-detail.html',
})
export class ClientDetail implements OnInit {
  private clientService = inject(ClientService);
  constructor(private route: ActivatedRoute, private router: Router) {}
  upload = inject(UploadModalService);

  activeTab = signal('Overview');
  tabs = ['Overview', 'Cases', 'Documents', 'Payments', 'Communication', 'Notes', 'Activity Log'];

  client    = signal<Client | null>(null);
  isLoading = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.isLoading.set(true);
    this.clientService.fetchClientById(id).then(client => {
      this.client.set(client);
      if (client) this.initEditForm();
    }).finally(() => this.isLoading.set(false));
  }

  setTab(t: string) { this.activeTab.set(t); }
  goBack()         { this.router.navigate(['/clients']); }

  // ── Static detail data ────────────────────────────────────
  stats = [
    { iconBg:'bg-blue-100',   icon:'fa-solid fa-briefcase',      iconColor:'text-blue-600',   value:'5',     label:'Active Cases',    note:'2 pending hearings' },
    { iconBg:'bg-green-100',  icon:'fa-solid fa-check-circle',   iconColor:'text-green-600',  value:'12',    label:'Closed Cases',    note:'92% success rate' },
    { iconBg:'bg-purple-100', icon:'fa-solid fa-folder',         iconColor:'text-purple-600', value:'87',    label:'Documents',       note:'12 added this month' },
    { iconBg:'bg-amber-100',  icon:'fa-solid fa-dollar-sign',    iconColor:'text-amber-600',  value:'$5.2K', label:'Pending Payment', note:'1 invoice overdue' },
    { iconBg:'bg-red-100',    icon:'fa-solid fa-calendar-check', iconColor:'text-red-600',    value:'3',     label:'Upcoming Events', note:'Next: Nov 18' },
  ];

  cases = [
    { title:'Johnson vs. State Corp', type:'Civil Litigation', typeBg:'bg-blue-100', typeColor:'text-blue-700', desc:'Employment discrimination case - Discovery phase', attorney:'Sarah Williams', filed:'Jan 15, 2024', next:'Next Hearing: Nov 16', nextIcon:'fa-gavel', statusLabel:'In Progress', statusBg:'bg-amber-100', statusColor:'text-amber-700', progress:65, progressColor:'bg-amber-500', docs:24 },
    { title:'Estate Planning - Johnson Family Trust', type:'Estate Law', typeBg:'bg-green-100', typeColor:'text-green-700', desc:'Comprehensive estate planning and trust establishment', attorney:'Michael Chen', filed:'Mar 20, 2024', next:'Review: Nov 25', nextIcon:'fa-check', statusLabel:'Review', statusBg:'bg-blue-100', statusColor:'text-blue-700', progress:85, progressColor:'bg-green-500', docs:18 },
    { title:'Real Estate Transaction - Commercial Property', type:'Real Estate', typeBg:'bg-purple-100', typeColor:'text-purple-700', desc:'Commercial property acquisition and contract review', attorney:'Michael Chen', filed:'Aug 10, 2024', next:'Closing: Dec 5', nextIcon:'fa-file-signature', statusLabel:'Due Diligence', statusBg:'bg-green-100', statusColor:'text-green-700', progress:45, progressColor:'bg-purple-500', docs:32 },
  ];

  documents = [
    { iconBg:'bg-red-100',    icon:'fa-solid fa-file-pdf',   iconColor:'text-red-600',    name:'Employment_Contract_Amendment.pdf', case:'Johnson vs. State Corp',  size:'2.4 MB',  when:'2 hours ago' },
    { iconBg:'bg-blue-100',   icon:'fa-solid fa-file-word',  iconColor:'text-blue-600',   name:'Trust_Agreement_Draft_v3.docx',     case:'Estate Planning',         size:'1.8 MB',  when:'5 hours ago' },
    { iconBg:'bg-green-100',  icon:'fa-solid fa-file-excel', iconColor:'text-green-600',  name:'Property_Financial_Analysis.xlsx',  case:'Real Estate Transaction', size:'3.2 MB',  when:'Yesterday' },
    { iconBg:'bg-purple-100', icon:'fa-solid fa-file-image', iconColor:'text-purple-600', name:'Evidence_Photos_Workplace.zip',     case:'Johnson vs. State Corp',  size:'15.7 MB', when:'2 days ago' },
    { iconBg:'bg-red-100',    icon:'fa-solid fa-file-pdf',   iconColor:'text-red-600',    name:'Purchase_Agreement_Commercial.pdf', case:'Real Estate Transaction', size:'4.1 MB',  when:'3 days ago' },
  ];

  invoices = [
    { number:'INV-2892', case:'Johnson vs. State Corp',  date:'Nov 01, 2024', amount:'$5,250.00',  statusLabel:'Overdue', statusBg:'bg-red-100',   statusColor:'text-red-700',   canRemind:true },
    { number:'INV-2867', case:'Estate Planning',         date:'Oct 15, 2024', amount:'$8,500.00',  statusLabel:'Paid',    statusBg:'bg-green-100', statusColor:'text-green-700', canRemind:false },
    { number:'INV-2843', case:'Real Estate Transaction', date:'Sep 20, 2024', amount:'$12,750.00', statusLabel:'Paid',    statusBg:'bg-green-100', statusColor:'text-green-700', canRemind:false },
    { number:'INV-2821', case:'Johnson vs. State Corp',  date:'Aug 15, 2024', amount:'$6,800.00',  statusLabel:'Paid',    statusBg:'bg-green-100', statusColor:'text-green-700', canRemind:false },
    { number:'INV-2798', case:'Estate Planning',         date:'Jul 10, 2024', amount:'$7,450.00',  statusLabel:'Paid',    statusBg:'bg-green-100', statusColor:'text-green-700', canRemind:false },
  ];

  communications = [
    { iconBg:'bg-blue-100',   icon:'fa-solid fa-envelope', iconColor:'text-blue-600',   title:'Email Sent: Case Update',                 by:'Sent by Sarah Williams',                              when:'2 hours ago', body:'Updated client on discovery progress. Discussed upcoming hearing preparation and witness list.', tag:'Email',     tagBg:'bg-blue-100 text-blue-700',   case:'Johnson vs. State Corp' },
    { iconBg:'bg-green-100',  icon:'fa-solid fa-phone',    iconColor:'text-green-600',  title:'Phone Call: Trust Agreement Discussion',  by:'Call with Michael Chen - Duration: 45 minutes',      when:'Yesterday',   body:'Discussed beneficiary designations and trust provisions. Client requested modifications.',        tag:'Phone Call', tagBg:'bg-green-100 text-green-700', case:'Estate Planning' },
    { iconBg:'bg-purple-100', icon:'fa-solid fa-users',    iconColor:'text-purple-600', title:'In-Person Meeting: Property Acquisition', by:'Meeting with Michael Chen - Office Conference Room',  when:'2 days ago',  body:'Reviewed purchase agreement for commercial property. Client approved terms.',                   tag:'In-Person', tagBg:'bg-purple-100 text-purple-700',case:'Real Estate Transaction' },
    { iconBg:'bg-amber-100',  icon:'fa-solid fa-file-alt', iconColor:'text-amber-600',  title:'Document Received: Evidence Submission',  by:'Received from client via email',                      when:'3 days ago',  body:'Client submitted additional workplace documentation and witness contact information.',           tag:'Document',  tagBg:'bg-amber-100 text-amber-700', case:'Johnson vs. State Corp' },
  ];

  notes = [
    { avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', author:'Sarah Williams', when:'3 hours ago', body:'Client is very detail-oriented and prefers frequent updates. Responds quickly to emails.', tagBg:'bg-blue-100 text-blue-700',   tag:'Client Management' },
    { avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', author:'Michael Chen',   when:'Yesterday',   body:'Client has complex estate planning needs with multiple business interests.', tagBg:'bg-green-100 text-green-700',  tag:'Estate Planning' },
    { avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', author:'Michael Chen',   when:'2 days ago',  body:'Client is considering additional commercial property investments.',             tagBg:'bg-purple-100 text-purple-700', tag:'Business Development' },
  ];

  timeline = [
    { bg:'bg-blue-500',   icon:'fa-solid fa-file-upload',   title:'Documents Uploaded',     desc:'Sarah Williams uploaded 3 files',                    when:'2 hours ago',  tagBg:'bg-blue-100 text-blue-700',    tag:'Documents' },
    { bg:'bg-green-500',  icon:'fa-solid fa-check',         title:'Payment Received',        desc:'Invoice INV-2867 paid - $8,500.00',                   when:'Yesterday',    tagBg:'bg-green-100 text-green-700',  tag:'Payment' },
    { bg:'bg-purple-500', icon:'fa-solid fa-users',         title:'Meeting Completed',       desc:'In-person meeting with Michael Chen',                 when:'2 days ago',   tagBg:'bg-purple-100 text-purple-700',tag:'Meeting' },
    { bg:'bg-amber-500',  icon:'fa-solid fa-calendar-plus', title:'Hearing Scheduled',       desc:'Court hearing scheduled for November 16, 2024',       when:'3 days ago',   tagBg:'bg-amber-100 text-amber-700',  tag:'Calendar' },
    { bg:'bg-red-500',    icon:'fa-solid fa-briefcase',     title:'Case Created',            desc:'New case opened: Real Estate Transaction',            when:'1 week ago',   tagBg:'bg-red-100 text-red-700',      tag:'Case' },
    { bg:'bg-indigo-500', icon:'fa-solid fa-user-plus',     title:'Client Profile Created',  desc:'Client added as new client',                          when:'',             tagBg:'bg-indigo-100 text-indigo-700',tag:'Client' },
  ];

  team = [
    { avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', border:'border-blue-500',   name:'Sarah Williams',  role:'Lead Attorney' },
    { avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', border:'border-green-500',  name:'Michael Chen',    role:'Estate Attorney' },
    { avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', border:'border-purple-500', name:'Michael Chen',    role:'Real Estate Attorney' },
    { avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg', border:'border-gray-300',   name:'Jessica Martinez',role:'Paralegal' },
  ];

  events = [
    { monthBg:'bg-red-100',   monthColor:'text-red-600',   dayColor:'text-red-700',   month:'Nov', day:'16', title:'Court Hearing',  sub:'Johnson vs. State Corp', time:'10:00 AM - Courtroom 4B' },
    { monthBg:'bg-amber-100', monthColor:'text-amber-600', dayColor:'text-amber-700', month:'Nov', day:'18', title:'Client Meeting', sub:'Estate Planning Review', time:'2:00 PM - Office' },
    { monthBg:'bg-blue-100',  monthColor:'text-blue-600',  dayColor:'text-blue-700',  month:'Nov', day:'25', title:'Document Review',sub:'Trust Agreement Final',   time:'11:00 AM - Video Call' },
  ];

  // ── Edit Modal ────────────────────────────────────────────
  showEditModal = signal(false);
  editStep      = signal<1|2|3>(1);
  isSaving      = signal(false);

  attorneys   = ['Sarah Williams','Michael Chen','Jennifer Lopez','Robert Taylor'];
  clientTypes = ['Premium Client','Standard Client','VIP Client','Corporate Client'];
  statusList  = ['Active','Pending','Inactive'];

  eF1 = signal({ name:'', email:'', phone:'', mobile:'', company:'', address:'', city:'', taxId:'' });
  eF2 = signal({ type:'', status:'', attorney:'', since:'', tags:'' });
  eF3 = signal({ notes:'', priority:'', preferredContact:'' });

  get editStep1Valid() {
    const f = this.eF1();
    return f.name.trim().length > 0 && f.email.trim().length > 0;
  }

  get editProgressPct() {
    return ((this.editStep() - 1) / 2) * 100;
  }

  get editStepLabels() {
    const s = this.editStep();
    return [
      { label: 'Identity',       active: s === 1, done: s > 1 },
      { label: 'Classification', active: s === 2, done: s > 2 },
      { label: 'Notes',          active: s === 3, done: s > 3 },
    ];
  }

  initEditForm() {
    const c = this.client();
    if (!c) return;
    this.eF1.set({
      name:    c.name,
      email:   c.email,
      phone:   c.phone,
      mobile:  '',
      company: c.company,
      address: c.address ?? '',
      city:    '',
      taxId:   '',
    });
    this.eF2.set({
      type:     c.type,
      status:   c.status,
      attorney: c.attorney,
      since:    c.since,
      tags:     c.tags.join(', '),
    });
    this.eF3.set({ notes: c.notes ?? '', priority: 'Normal', preferredContact: 'Email' });
  }

  openEditModal() {
    this.initEditForm();
    this.editStep.set(1);
    this.showEditModal.set(true);
  }

  closeEditModal() { this.showEditModal.set(false); }

  editNext() {
    const s = this.editStep();
    if (s < 3) this.editStep.set((s + 1) as 1|2|3);
    else this.saveClient();
  }

  editPrev() {
    const s = this.editStep();
    if (s > 1) this.editStep.set((s - 1) as 1|2|3);
  }

  async saveClient() {
    const c = this.client();
    if (!c) return;
    this.isSaving.set(true);

    const f1 = this.eF1(); const f2 = this.eF2(); const f3 = this.eF3();

    const parts      = f1.name.trim().split(' ');
    const first_name = parts[0] || '';
    const last_name  = parts.slice(1).join(' ') || '';

    const clientTypeMap: Record<string, string> = {
      'Corporate Client': 'CORPORATE',
      'Standard Client':  'INDIVIDUAL',
      'Premium Client':   'INDIVIDUAL',
      'VIP Client':       'INDIVIDUAL',
    };
    const tagMap: Record<string, string> = {
      'Active':   'ACTIVE',
      'Inactive': 'INACTIVE',
      'Pending':  'PENDING',
    };

    const payload: Record<string, unknown> = { first_name, last_name, email: f1.email, phone: f1.phone };
    if (f1.company && f1.company !== '—') payload['company_name'] = f1.company;
    const addr = [f1.address, f1.city].filter(Boolean).join(', ');
    if (addr) payload['address'] = addr;
    if (f2.type)   payload['client_type'] = clientTypeMap[f2.type]   ?? 'INDIVIDUAL';
    if (f2.status) payload['tag']         = tagMap[f2.status]        ?? 'ACTIVE';
    if (f3.notes)  payload['notes']       = f3.notes;

    try {
      const updated = await this.clientService.updateClient(c.id, payload);
      this.client.set(updated);
      this.closeEditModal();
    } catch {
      // Error handling can be added here
    } finally {
      this.isSaving.set(false);
    }
  }
}
