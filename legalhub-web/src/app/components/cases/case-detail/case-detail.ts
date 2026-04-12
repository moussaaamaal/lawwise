import { Component, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Case } from '../cases-list/cases-list';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './case-detail.html',
})
export class CaseDetail implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router) {}

  activeTab = signal('overview');
  tabs = ['Overview','Timeline','Participants','Documents','Hearings','Tasks','Billing','AI Summary'];

  case = signal<Case | null>(null);

  // ── Same data as cases-list, indexed by id ───────────────
  private allCases: Record<number, Case> = {
    1: { id:1, title:'Johnson vs. State Corporation', number:'CIV-2024-1847', type:'Civil Litigation', typeBg:'bg-blue-100',   typeColor:'text-blue-700',   status:'Urgent',      statusBg:'bg-red-100',    statusColor:'text-red-700',    priority:'Urgent',  client:'Johnson Corporation',   attorney:'Sarah Williams',  nextDate:'Nov 16',  nextDateLabel:'Hearing',    docs:12, tasks:5, participants:3, updatedAgo:'2h ago',  description:'Complex civil litigation regarding breach of contract and IP disputes. Hearing scheduled Nov 16.' },
    2: { id:2, title:'Martinez Family Trust',         number:'EST-2024-2156', type:'Estate Law',       typeBg:'bg-green-100',  typeColor:'text-green-700',  status:'Active',      statusBg:'bg-amber-100',  statusColor:'text-amber-700',  priority:'Normal',  client:'Martinez Family',       attorney:'Michael Chen',    nextDate:'Nov 18',  nextDateLabel:'Review',     docs:8,  tasks:3, participants:2, updatedAgo:'4h ago',  description:'Estate planning and trust management for the Martinez family.' },
    3: { id:3, title:'Thompson Real Estate Deal',     number:'RE-2024-3421',  type:'Real Estate',      typeBg:'bg-purple-100', typeColor:'text-purple-700', status:'In Progress', statusBg:'bg-blue-100',   statusColor:'text-blue-700',   priority:'Medium',  client:'Thompson Properties',   attorney:'David Morrison',  nextDate:'Nov 20',  nextDateLabel:'Closing',    docs:15, tasks:7, participants:4, updatedAgo:'6h ago',  description:'Real estate transaction for a commercial property portfolio.' },
    4: { id:4, title:'Anderson Employment Case',      number:'EMP-2024-1923', type:'Employment',       typeBg:'bg-indigo-100', typeColor:'text-indigo-700', status:'Active',      statusBg:'bg-green-100',  statusColor:'text-green-700',  priority:'Normal',  client:'James Anderson',        attorney:'Jennifer Lopez',  nextDate:'Nov 22',  nextDateLabel:'Mediation',  docs:9,  tasks:4, participants:2, updatedAgo:'1d ago',  description:'Employment discrimination and wrongful termination dispute.' },
    5: { id:5, title:'Wilson Medical Malpractice',    number:'MED-2024-2847', type:'Medical Law',      typeBg:'bg-red-100',    typeColor:'text-red-700',    status:'Discovery',   statusBg:'bg-amber-100',  statusColor:'text-amber-700',  priority:'Urgent',  client:'Linda Wilson',          attorney:'Robert Taylor',   nextDate:'Nov 25',  nextDateLabel:'Filing',     docs:18, tasks:8, participants:5, updatedAgo:'2d ago',  description:'Medical malpractice case involving surgical procedure complications.' },
    6: { id:6, title:'Greenfield Corporate Merger',   number:'CORP-2024-4128',type:'Corporate Law',    typeBg:'bg-cyan-100',   typeColor:'text-cyan-700',   status:'Negotiation', statusBg:'bg-blue-100',   statusColor:'text-blue-700',   priority:'Medium',  client:'Greenfield Industries', attorney:'Sarah Williams',  nextDate:'Nov 28',  nextDateLabel:'Meeting',    docs:24, tasks:11,participants:6, updatedAgo:'3d ago',  description:'Corporate merger and acquisition with complex regulatory requirements.' },
    7: { id:7, title:'Patterson Business Contract',   number:'CONT-2024-5012',type:'Contract Law',     typeBg:'bg-gray-100',   typeColor:'text-gray-700',   status:'Pending',     statusBg:'bg-gray-100',   statusColor:'text-gray-700',   priority:'Normal',  client:"Patterson & Sons",      attorney:'Michael Chen',    nextDate:'Dec 02',  nextDateLabel:'Signing',    docs:5,  tasks:2, participants:2, updatedAgo:'4d ago',  description:'Commercial contract review and negotiation for service agreement.' },
    8: { id:8, title:'Riverside Development Permit',  number:'ENV-2024-6234', type:'Real Estate',      typeBg:'bg-purple-100', typeColor:'text-purple-700', status:'Active',      statusBg:'bg-green-100',  statusColor:'text-green-700',  priority:'Medium',  client:'Riverside Development', attorney:'David Morrison',  nextDate:'Dec 05',  nextDateLabel:'Hearing',    docs:20, tasks:6, participants:4, updatedAgo:'5d ago',  description:'Environmental permit dispute for large-scale development project.' },
  };

  timeline = [
    { icon:'fa-check',    iconBg:'bg-green-100',  iconColor:'text-green-600',  title:'Discovery documents reviewed and filed', time:'2h ago', desc:'All discovery materials reviewed and submitted to the court.', tag:'Document',   tagBg:'bg-blue-100',   tagColor:'text-blue-700' },
    { icon:'fa-file',     iconBg:'bg-blue-100',   iconColor:'text-blue-600',   title:'Motion for summary judgment filed',      time:'1d ago', desc:'Legal team submitted motion with supporting documentation.',    tag:'Filing',     tagBg:'bg-purple-100', tagColor:'text-purple-700' },
    { icon:'fa-calendar', iconBg:'bg-amber-100',  iconColor:'text-amber-600',  title:'Hearing scheduled',                      time:'3d ago', desc:'Court hearing confirmed for the upcoming date.',               tag:'Hearing',    tagBg:'bg-red-100',    tagColor:'text-red-700' },
    { icon:'fa-users',    iconBg:'bg-purple-100', iconColor:'text-purple-600', title:'Expert witness deposition completed',    time:'5d ago', desc:'Expert provided testimony on key case matters.',               tag:'Deposition', tagBg:'bg-green-100',  tagColor:'text-green-700' },
    { icon:'fa-envelope', iconBg:'bg-gray-100',   iconColor:'text-gray-600',   title:'Settlement offer received',              time:'1w ago', desc:'Opposing party submitted settlement offer. Client consulted.', tag:'Settlement', tagBg:'bg-amber-100',  tagColor:'text-amber-700' },
  ];

  documents = [
    { name:'Motion_Summary_Judgment_v3.pdf',  size:'2.4 MB',  ago:'2h ago', iconBg:'bg-red-100',    iconColor:'text-red-600',    icon:'fa-file-pdf' },
    { name:'Discovery_Response_Final.docx',    size:'1.8 MB',  ago:'1d ago', iconBg:'bg-blue-100',   iconColor:'text-blue-600',   icon:'fa-file-word' },
    { name:'Financial_Damages_Analysis.xlsx',  size:'3.2 MB',  ago:'3d ago', iconBg:'bg-green-100',  iconColor:'text-green-600',  icon:'fa-file-excel' },
    { name:'Evidence_Exhibits_Package.zip',    size:'12.5 MB', ago:'5d ago', iconBg:'bg-purple-100', iconColor:'text-purple-600', icon:'fa-file-zipper' },
  ];

  tasks = [
    { label:'Prepare opening statement',  due:'Due today',     dueColor:'text-red-600',   done:false },
    { label:'Review expert testimony',    due:'Due tomorrow',  dueColor:'text-amber-600', done:false },
    { label:'File response to motion',    due:'Due in 3 days', dueColor:'text-gray-600',  done:false },
    { label:'Submit discovery documents', due:'Completed',     dueColor:'text-green-600', done:true  },
  ];

  notes = [
    { author:'Sarah Williams', time:'2 hours ago', text:'Completed review of all discovery documents. Key findings support our motion for summary judgment. Client has been briefed on the upcoming hearing.' },
    { author:'David Morrison',  time:'1 day ago',   text:'Reviewed settlement offer from opposing counsel. Amount is below expectations but within negotiation range. Scheduled conference call with client.' },
  ];

  billingEntries = [
    { date:'Nov 15, 2024', attorney:'Sarah Williams', desc:'Discovery document review', hours:'4.5', rate:'$350/hr', amount:'$1,575.00' },
    { date:'Nov 14, 2024', attorney:'David Morrison',  desc:'Client consultation',       hours:'2.0', rate:'$450/hr', amount:'$900.00' },
    { date:'Nov 13, 2024', attorney:'Sarah Williams', desc:'Motion preparation',          hours:'6.0', rate:'$350/hr', amount:'$2,100.00' },
    { date:'Nov 12, 2024', attorney:'Sarah Williams', desc:'Legal research',              hours:'3.5', rate:'$350/hr', amount:'$1,225.00' },
  ];

  attorneys    = ['Sarah Williams','Michael Chen','David Morrison','Jennifer Lopez','Robert Taylor'];
  caseTypes    = ['Criminal Law','Civil Law','Corporate Law','Family Law','Real Estate Law','Immigration Law','Personal Injury','Intellectual Property'];
  statusList   = ['Active','Pending','In Progress','Discovery','Negotiation','Closed'];
  priorityList = ['Normal','Medium','Urgent'];

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // ✅ Load the correct case from the map by route id
    this.case.set(this.allCases[id] ?? this.allCases[1]);
    this.initEditForm();
  }

  setTab(t: string) { this.activeTab.set(t); }
  goBack()          { this.router.navigate(['/cases']); }
  toggleTask(t: any){ t.done = !t.done; }

  // ── Edit Modal ────────────────────────────────────────────
  showEditModal = signal(false);
  editStep      = signal<1|2>(1);
  isSaving      = signal(false);

  editF1 = signal({
    title: '', number: '', type: '', status: '', priority: '',
    client: '', attorney: '', description: '',
  });
  editF2 = signal({
    courtName: '', courtLocation: '', judgeName: '',
    nextDate: '', hearingTime: '', billingType: '', caseValue: '', tags: '',
  });

  get editStep1Valid() {
    const f = this.editF1();
    return f.title.trim().length > 0 && f.type.length > 0 && f.status.length > 0;
  }

  get editProgressPct() { return (this.editStep() - 1) * 100; }

  get editStepLabels() {
    const s = this.editStep();
    return [
      { label:'Case Details', active: s === 1, done: s > 1 },
      { label:'Court & More', active: s === 2, done: s > 2 },
    ];
  }

  initEditForm() {
    const c = this.case();
    if (!c) return;
    this.editF1.set({
      title:       c.title,
      number:      c.number,
      type:        c.type,
      status:      c.status,
      priority:    c.priority,
      client:      c.client,
      attorney:    c.attorney,
      description: c.description,
    });
    this.editF2.set({
      courtName:    'District Court 4B',
      courtLocation:'Courtroom 4B, Downtown',
      judgeName:    'Hon. Patricia Moore',
      nextDate:     c.nextDate,
      hearingTime:  '10:00',
      billingType:  'Hourly Rate',
      caseValue:    '2500000',
      tags:         'civil, litigation, IP',
    });
  }

  openEditModal() {
    this.initEditForm();
    this.editStep.set(1);
    this.showEditModal.set(true);
  }

  closeEditModal() { this.showEditModal.set(false); }

  editNextStep() {
    if (this.editStep() === 1) this.editStep.set(2);
    else this.saveCase();
  }

  editPrevStep() {
    if (this.editStep() === 2) this.editStep.set(1);
  }

  saveCase() {
    this.isSaving.set(true);
    setTimeout(() => {
      const f1 = this.editF1();
      const typeColors: Record<string, { bg:string; color:string }> = {
        'Civil Law':            { bg:'bg-blue-100',   color:'text-blue-700' },
        'Corporate Law':        { bg:'bg-cyan-100',   color:'text-cyan-700' },
        'Criminal Law':         { bg:'bg-red-100',    color:'text-red-700' },
        'Family Law':           { bg:'bg-pink-100',   color:'text-pink-700' },
        'Real Estate Law':      { bg:'bg-purple-100', color:'text-purple-700' },
        'Personal Injury':      { bg:'bg-orange-100', color:'text-orange-700' },
        'Immigration Law':      { bg:'bg-teal-100',   color:'text-teal-700' },
        'Intellectual Property':{ bg:'bg-indigo-100', color:'text-indigo-700' },
        'Civil Litigation':     { bg:'bg-blue-100',   color:'text-blue-700' },
        'Estate Law':           { bg:'bg-green-100',  color:'text-green-700' },
        'Real Estate':          { bg:'bg-purple-100', color:'text-purple-700' },
        'Employment':           { bg:'bg-indigo-100', color:'text-indigo-700' },
        'Medical Law':          { bg:'bg-red-100',    color:'text-red-700' },
        'Contract Law':         { bg:'bg-gray-100',   color:'text-gray-700' },
      };
      const statusColors: Record<string, { bg:string; color:string }> = {
        'Active':      { bg:'bg-green-100',  color:'text-green-700' },
        'Pending':     { bg:'bg-gray-100',   color:'text-gray-700' },
        'In Progress': { bg:'bg-blue-100',   color:'text-blue-700' },
        'Discovery':   { bg:'bg-amber-100',  color:'text-amber-700' },
        'Negotiation': { bg:'bg-blue-100',   color:'text-blue-700' },
        'Urgent':      { bg:'bg-red-100',    color:'text-red-700' },
        'Closed':      { bg:'bg-gray-200',   color:'text-gray-600' },
      };
      const tc = typeColors[f1.type]     || { bg:'bg-gray-100',  color:'text-gray-700' };
      const sc = statusColors[f1.status] || { bg:'bg-green-100', color:'text-green-700' };
      this.case.update(c => c ? {
        ...c,
        title:       f1.title,
        number:      f1.number,
        type:        f1.type,
        typeBg:      tc.bg,
        typeColor:   tc.color,
        status:      f1.status,
        statusBg:    sc.bg,
        statusColor: sc.color,
        priority:    f1.priority as 'Normal'|'Medium'|'Urgent',
        client:      f1.client,
        attorney:    f1.attorney,
        description: f1.description,
        updatedAgo:  'Just now',
      } : c);
      this.isSaving.set(false);
      this.closeEditModal();
    }, 800);
  }
}