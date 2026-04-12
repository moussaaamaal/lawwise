import { Component, signal, computed, effect, AfterViewInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var Plotly: any;

interface Invoice {
  number: string; client: string; email: string;
  case: string; caseType: string; billingType: string;
  amount: string; issueDate: string; dueDate: string;
  dueNote: string; dueNoteColor: string;
  status: string; statusBg: string; statusColor: string;
  showRemind: boolean;
}
interface InvoiceItem { description: string; qty: number | null; rate: number | null; }

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './billing.html',
})
export class Billing implements AfterViewInit {

  // ── Modal ─────────────────────────────────────────────────
  showModal    = signal(false);
  modalStep    = signal<1|2>(1);
  isSubmitting = signal(false);

  openModal()  { this.resetForm(); this.modalStep.set(1); this.showModal.set(true); }
  closeModal() { this.showModal.set(false); }

  resetForm() {
    this.selectedClient.set('');
    this.selectedCase.set('');
    this.selectedBillingType.set('Hourly Rate');
    this.invoiceDate.set('2024-11-15');
    this.dueDate.set('2024-12-15');
    this.notes.set('');
    this.sendEmail.set(false);
    this.markSent.set(false);
    this.invoiceItems.set([
      { description: '', qty: null, rate: null },
      { description: '', qty: null, rate: null },
    ]);
  }

  submitInvoice() {
    this.isSubmitting.set(true);
    setTimeout(() => { this.isSubmitting.set(false); this.modalStep.set(2); }, 900);
  }

  // ── Form signals ──────────────────────────────────────────
  selectedClient      = signal('');
  selectedCase        = signal('');
  selectedBillingType = signal('Hourly Rate');
  invoiceDate         = signal('2024-11-15');
  dueDate             = signal('2024-12-15');
  notes               = signal('');
  sendEmail           = signal(false);
  markSent            = signal(false);
  invoiceItems        = signal<InvoiceItem[]>([
    { description: '', qty: null, rate: null },
    { description: '', qty: null, rate: null },
  ]);

  clients = ['Johnson Corporation','Martinez Family Trust','Thompson Properties LLC','Anderson Industries','Wilson Medical Group','Greenfield Industries'];
  cases   = ['Johnson vs. State Corp - Civil Litigation','Martinez Estate Planning','Thompson Real Estate Deal','Anderson Employment Case','Wilson Medical Malpractice'];

  // WEB-BILL-07 — Billing types per case
  billingTypes = ['Hourly Rate', 'Flat Fee', 'Contingency', 'Retainer'];

  getBillingTypeCls(type: string): string {
    const map: Record<string, string> = {
      'Hourly Rate': 'bg-blue-100 text-blue-700',
      'Flat Fee':    'bg-purple-100 text-purple-700',
      'Contingency': 'bg-amber-100 text-amber-700',
      'Retainer':    'bg-green-100 text-green-700',
    };
    return map[type] ?? 'bg-gray-100 text-gray-600';
  }

  getItemAmount(item: InvoiceItem): string {
    return item.qty && item.rate ? '$' + (item.qty * item.rate).toFixed(2) : '$0.00';
  }
  getSubtotal(): number { return this.invoiceItems().reduce((s,i) => s + (i.qty && i.rate ? i.qty * i.rate : 0), 0); }
  getTax(): number      { return this.getSubtotal() * 0.08; }
  getTotal(): string    { return '$' + (this.getSubtotal() + this.getTax()).toFixed(2); }
  addItem(): void       { this.invoiceItems.update(items => [...items, {description:'',qty:null,rate:null}]); }
  removeItem(i: number): void { this.invoiceItems.update(items => items.filter((_,idx) => idx !== i)); }
  get isFormValid() { return this.selectedClient().trim().length > 0; }

  // ── UI state ──────────────────────────────────────────────
  showExportMenu  = signal(false);
  private _selectedPeriod = signal('This Month');
  private _chartView      = signal('Monthly');

  get selectedPeriod() { return this._selectedPeriod; }
  get chartView()      { return this._chartView; }

  setPeriod(p: string) {
    this._selectedPeriod.set(p);
    // Reset to default view for the new period
    const d = this.chartData[p];
    this._chartView.set(d?.barLabel ?? 'Monthly');
    this.renderTrendChart();
    this.renderMonthlyChart();
  }
  setChartView(v: string) { this._chartView.set(v); this.renderMonthlyChart(); }

  // WEB-BILL-06 — Period options
  periods = ['This Week', 'This Month', 'This Quarter', 'This Year'];

  // WEB-BILL-01 — KPI Metrics
  metrics = [
    { icon:'fa-solid fa-dollar-sign',          iconBg:'bg-green-100',  iconColor:'text-green-600',  value:'$124.5K', label:'Total Revenue',   badge:'+18%',   badgeCls:'text-green-600 bg-green-100',  note:'This month' },
    { icon:'fa-solid fa-clock',                iconBg:'bg-amber-100',  iconColor:'text-amber-600',  value:'$48.2K',  label:'Outstanding',     badge:'Pending',badgeCls:'text-amber-600 bg-amber-100',  note:'15 invoices' },
    { icon:'fa-solid fa-triangle-exclamation', iconBg:'bg-red-100',    iconColor:'text-red-600',    value:'$18.7K',  label:'Overdue',         badge:'Alert',  badgeCls:'text-red-600 bg-red-100',      note:'6 invoices' },
    { icon:'fa-solid fa-file-invoice',         iconBg:'bg-blue-100',   iconColor:'text-blue-600',   value:'42',      label:'Total Invoices',  badge:'Active', badgeCls:'text-blue-600 bg-blue-100',    note:'This month' },
    { icon:'fa-solid fa-percent',              iconBg:'bg-purple-100', iconColor:'text-purple-600', value:'87%',     label:'Collection Rate', badge:'Good',   badgeCls:'text-green-600 bg-green-100',  note:'Last 90 days' },
  ];

  // WEB-BILL-03 — Invoice tabs
  activeTab = signal<string>('All');

  get invoiceTabs() {
    return [
      { key:'All',     label:'All',     count: this.allInvoices.length,
        activeCls:'border-gray-900 text-gray-900',           badgeActiveCls:'bg-gray-900 text-white' },
      { key:'Paid',    label:'Paid',    count: this.allInvoices.filter(i => i.status === 'Paid').length,
        activeCls:'border-green-500 text-green-600',         badgeActiveCls:'bg-green-100 text-green-700' },
      { key:'Pending', label:'Pending', count: this.allInvoices.filter(i => i.status === 'Pending').length,
        activeCls:'border-amber-500 text-amber-600',         badgeActiveCls:'bg-amber-100 text-amber-700' },
      { key:'Overdue', label:'Overdue', count: this.allInvoices.filter(i => i.status === 'Overdue').length,
        activeCls:'border-red-500 text-red-600',             badgeActiveCls:'bg-red-100 text-red-700' },
      { key:'Sent',    label:'Sent',    count: this.allInvoices.filter(i => i.status === 'Sent').length,
        activeCls:'border-blue-500 text-blue-600',           badgeActiveCls:'bg-blue-100 text-blue-700' },
      { key:'Draft',   label:'Draft',   count: this.allInvoices.filter(i => i.status === 'Draft').length,
        activeCls:'border-slate-400 text-slate-500',         badgeActiveCls:'bg-slate-100 text-slate-600' },
    ];
  }

  get overdueCount() { return this.allInvoices.filter(i => i.status === 'Overdue').length; }

  // WEB-BILL-03 — Filter computed
  filteredInvoices = computed(() => {
    const tab = this.activeTab();
    if (tab === 'All') return this.allInvoices;
    return this.allInvoices.filter(inv => inv.status === tab);
  });

  // Invoice data with WEB-BILL-07 billingType
  allInvoices: Invoice[] = [
    { number:'INV-2845', client:'Johnson Corporation',     email:'billing@johnson.com',    case:'Johnson vs. State Corp',   caseType:'Civil Litigation', billingType:'Hourly Rate', amount:'$12,500.00', issueDate:'Oct 25, 2024', dueDate:'Nov 10, 2024', dueNote:'5 days overdue',  dueNoteColor:'text-red-600',   status:'Overdue', statusBg:'bg-red-100',    statusColor:'text-red-700',   showRemind:true  },
    { number:'INV-2846', client:'Martinez Family Trust',   email:'martinez@trust.com',     case:'Estate Planning',          caseType:'Estate Law',       billingType:'Flat Fee',    amount:'$8,750.00',  issueDate:'Nov 05, 2024', dueDate:'Nov 20, 2024', dueNote:'Due in 5 days',   dueNoteColor:'text-gray-500',  status:'Pending', statusBg:'bg-amber-100',  statusColor:'text-amber-700', showRemind:true  },
    { number:'INV-2847', client:'Thompson Properties LLC', email:'billing@thompson.com',   case:'Real Estate Transaction',  caseType:'Real Estate Law',  billingType:'Retainer',    amount:'$15,200.00', issueDate:'Nov 10, 2024', dueDate:'Nov 25, 2024', dueNote:'Due in 10 days',  dueNoteColor:'text-gray-500',  status:'Sent',    statusBg:'bg-blue-100',   statusColor:'text-blue-700',  showRemind:true  },
    { number:'INV-2848', client:'Anderson Industries',     email:'billing@anderson.com',   case:'Employment Dispute',       caseType:'Employment Law',   billingType:'Flat Fee',    amount:'$6,300.00',  issueDate:'Nov 12, 2024', dueDate:'Dec 01, 2024', dueNote:'Due in 16 days',  dueNoteColor:'text-gray-500',  status:'Sent',    statusBg:'bg-blue-100',   statusColor:'text-blue-700',  showRemind:true  },
    { number:'INV-2849', client:'Wilson Medical Group',    email:'accounts@wilson.com',    case:'Medical Malpractice',      caseType:'Healthcare Law',   billingType:'Contingency', amount:'$22,400.00', issueDate:'Oct 28, 2024', dueDate:'Nov 12, 2024', dueNote:'3 days overdue',  dueNoteColor:'text-red-600',   status:'Overdue', statusBg:'bg-red-100',    statusColor:'text-red-700',   showRemind:true  },
    { number:'INV-2850', client:'Greenfield Industries',   email:'finance@greenfield.com', case:'Corporate Merger',         caseType:'Corporate Law',    billingType:'Hourly Rate', amount:'$18,900.00', issueDate:'Nov 08, 2024', dueDate:'Nov 22, 2024', dueNote:'Due in 7 days',   dueNoteColor:'text-gray-500',  status:'Sent',    statusBg:'bg-blue-100',   statusColor:'text-blue-700',  showRemind:true  },
    { number:'INV-2851', client:"Patterson & Sons",        email:'billing@patterson.com',  case:'Contract Negotiation',     caseType:'Business Law',     billingType:'Retainer',    amount:'$9,850.00',  issueDate:'Nov 01, 2024', dueDate:'Nov 08, 2024', dueNote:'7 days overdue',  dueNoteColor:'text-red-600',   status:'Overdue', statusBg:'bg-red-100',    statusColor:'text-red-700',   showRemind:true  },
    { number:'INV-2852', client:'Riverside Development',   email:'info@riverside.com',     case:'Property Acquisition',     caseType:'Real Estate Law',  billingType:'Flat Fee',    amount:'$14,200.00', issueDate:'Oct 20, 2024', dueDate:'Nov 05, 2024', dueNote:'Paid',            dueNoteColor:'text-green-600', status:'Paid',    statusBg:'bg-green-100',  statusColor:'text-green-700', showRemind:false },
  ];

  payments = [
    { icon:'fa-solid fa-circle-check', iconBg:'bg-green-100', iconColor:'text-green-600', cardBg:'bg-green-50', cardBorder:'border-green-200', title:'Payment Received - INV-2852', client:'Riverside Development',  amount:'$14,200.00', amountColor:'text-green-600', date:'Nov 05, 2024', method:'Bank Transfer', ref:'TXN-847392', remaining:'' },
    { icon:'fa-solid fa-clock',        iconBg:'bg-gray-100',  iconColor:'text-gray-600',  cardBg:'bg-gray-50',  cardBorder:'border-gray-200',  title:'Partial Payment - INV-2845',  client:'Johnson Corporation',    amount:'$5,000.00',  amountColor:'text-gray-900',  date:'Nov 12, 2024', method:'Credit Card',  ref:'',          remaining:'Remaining: $7,500.00' },
    { icon:'fa-solid fa-circle-check', iconBg:'bg-green-100', iconColor:'text-green-600', cardBg:'bg-green-50', cardBorder:'border-green-200', title:'Payment Received - INV-2843', client:'Sterling Enterprises',   amount:'$11,750.00', amountColor:'text-green-600', date:'Nov 03, 2024', method:'Wire Transfer',ref:'TXN-845221', remaining:'' },
    { icon:'fa-solid fa-circle-check', iconBg:'bg-green-100', iconColor:'text-green-600', cardBg:'bg-green-50', cardBorder:'border-green-200', title:'Payment Received - INV-2840', client:'Oakmont Holdings',       amount:'$8,500.00',  amountColor:'text-green-600', date:'Oct 28, 2024', method:'Check',        ref:'CHK-4782',  remaining:'' },
  ];

  paymentMethods = [
    { icon:'fa-solid fa-building-columns', iconBg:'bg-blue-100',   iconColor:'text-blue-600',   label:'Bank Transfer', pct:'45% of payments', amount:'$56K' },
    { icon:'fa-solid fa-credit-card',      iconBg:'bg-purple-100', iconColor:'text-purple-600', label:'Credit Card',   pct:'35% of payments', amount:'$43.5K' },
    { icon:'fa-solid fa-money-check',      iconBg:'bg-green-100',  iconColor:'text-green-600',  label:'Check',         pct:'20% of payments', amount:'$25K' },
  ];

  reminderSettings = [
    { label:'First Reminder',   desc:'3 days before due date' },
    { label:'Second Reminder',  desc:'On due date' },
    { label:'Overdue Reminder', desc:'3 days after due date' },
    { label:'Final Notice',     desc:'7 days after due date' },
  ];

  channels = [
    { icon:'fa-solid fa-envelope',    iconBg:'bg-blue-100',   iconColor:'text-blue-600',   label:'Email Reminders', desc:'Send via email',    checked:true  },
    { icon:'fa-brands fa-whatsapp',   iconBg:'bg-green-100',  iconColor:'text-green-600',  label:'WhatsApp',        desc:'Send via WhatsApp', checked:true  },
    { icon:'fa-solid fa-comment-sms', iconBg:'bg-purple-100', iconColor:'text-purple-600', label:'SMS Alerts',      desc:'Send text messages',checked:false },
    { icon:'fa-solid fa-bell',        iconBg:'bg-amber-100',  iconColor:'text-amber-600',  label:'In-App Alerts',   desc:'Dashboard alerts',  checked:true  },
  ];

  reminders = [
    { iconBg:'bg-amber-100', iconColor:'text-amber-600', title:'Overdue Notice - INV-2845',       client:'Johnson Corporation',     channels:[{l:'Email',c:'bg-blue-100 text-blue-700'},{l:'WhatsApp',c:'bg-green-100 text-green-700'}],                                              time:'Nov 14, 2024 at 9:00 AM',  badge:'Overdue',      badgeCls:'bg-amber-100 text-amber-700' },
    { iconBg:'bg-blue-100',  iconColor:'text-blue-600',  title:'Payment Due Reminder - INV-2846', client:'Martinez Family Trust',   channels:[{l:'Email',c:'bg-blue-100 text-blue-700'}],                                                                                          time:'Nov 13, 2024 at 10:30 AM', badge:'Due Soon',     badgeCls:'bg-blue-100 text-blue-700' },
    { iconBg:'bg-amber-100', iconColor:'text-amber-600', title:'Overdue Notice - INV-2849',       client:'Wilson Medical Group',    channels:[{l:'Email',c:'bg-blue-100 text-blue-700'},{l:'WhatsApp',c:'bg-green-100 text-green-700'}],                                              time:'Nov 13, 2024 at 8:45 AM',  badge:'Overdue',      badgeCls:'bg-red-100 text-red-700' },
    { iconBg:'bg-blue-100',  iconColor:'text-blue-600',  title:'Upcoming Payment - INV-2847',     client:'Thompson Properties LLC', channels:[{l:'Email',c:'bg-blue-100 text-blue-700'}],                                                                                          time:'Nov 12, 2024 at 9:15 AM',  badge:'Sent',         badgeCls:'bg-blue-100 text-blue-700' },
    { iconBg:'bg-red-100',   iconColor:'text-red-600',   title:'Final Notice - INV-2851',         client:"Patterson & Sons",        channels:[{l:'Email',c:'bg-blue-100 text-blue-700'},{l:'WhatsApp',c:'bg-green-100 text-green-700'},{l:'SMS',c:'bg-purple-100 text-purple-700'}],time:'Nov 11, 2024 at 2:00 PM',  badge:'Final Notice', badgeCls:'bg-red-100 text-red-700' },
  ];

  // ── Charts ────────────────────────────────────────────────
  // ── Chart data — cohérent par période ────────────────────
  private readonly chartData: Record<string, {
    barX: string[]; barY: number[];
    qtrX: string[];  qtrY: number[];
    trendX: string[]; trendY: number[];
    showToggle: boolean;
    barLabel: string;
  }> = {
    'This Week': {
      barX:   ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      barY:   [4200, 5800, 3100, 6700, 4900, 2200, 1800],
      qtrX: [], qtrY: [],
      trendX: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      trendY: [4200, 5800, 3100, 6700, 4900, 2200, 1800],
      showToggle: false, barLabel: 'Daily',
    },
    'This Month': {
      barX:   ['Week 1','Week 2','Week 3','Week 4'],
      barY:   [28500, 31200, 34800, 30000],
      qtrX:   ['Q1 2024','Q2 2024','Q3 2024','Q4 2024'],
      qtrY:   [265000, 315000, 351000, 124500],
      trendX: ['Week 1','Week 2','Week 3','Week 4'],
      trendY: [28500, 31200, 34800, 30000],
      showToggle: true, barLabel: 'Weekly',
    },
    'This Quarter': {
      barX:   ['January','February','March'],
      barY:   [105000, 118000, 124500],
      qtrX:   ['Q1 2024','Q2 2024','Q3 2024','Q4 2024 (YTD)'],
      qtrY:   [265000, 315000, 351000, 347500],
      trendX: ['Jan','Feb','Mar'],
      trendY: [105000, 118000, 124500],
      showToggle: true, barLabel: 'Monthly',
    },
    'This Year': {
      barX:   ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      barY:   [85000,92000,88000,105000,98000,112000,108000,125000,118000,132000,124500,130000],
      qtrX:   ['Q1 2024','Q2 2024','Q3 2024','Q4 2024'],
      qtrY:   [265000, 315000, 351000, 386500],
      trendX: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      trendY: [85000,92000,88000,105000,98000,112000,108000,125000,118000,132000,124500,130000],
      showToggle: true, barLabel: 'Monthly',
    },
  };

  get showChartToggle(): boolean {
    return this.chartData[this._selectedPeriod()]?.showToggle ?? true;
  }

  get chartViewLabels(): string[] {
    const d = this.chartData[this._selectedPeriod()];
    if (!d?.showToggle) return [];
    return [d.barLabel, 'Quarterly'];
  }

  ngAfterViewInit(): void {
    this.loadPlotly().then(() => this.renderCharts());
  }

  private loadPlotly(): Promise<void> {
    return new Promise(resolve => {
      if (typeof Plotly !== 'undefined') { resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://cdn.plot.ly/plotly-3.1.1.min.js';
      s.onload = () => resolve();
      document.head.appendChild(s);
    });
  }

  private get lightLayout() {
    return { plot_bgcolor:'#fff', paper_bgcolor:'#fff', font:{color:'#374151'}, showlegend:false };
  }
  private readonly gridColor = '#f3f4f6';

  private renderCharts(): void {
    // Petit délai pour que le DOM Angular soit stabilisé
    setTimeout(() => {
      this.renderTrendChart();
      this.renderBreakdownChart();
      this.renderMonthlyChart();
    }, 50);
  }

  private renderBreakdownChart(): void {
    try {
      const el = document.getElementById('revenue-breakdown-chart');
      if (!el) { console.warn('revenue-breakdown-chart not found'); return; }
      Plotly.newPlot('revenue-breakdown-chart',
        [{ type:'pie',
           labels:['Civil Litigation','Real Estate','Corporate Law','Estate Planning','Employment Law','Healthcare Law'],
           values:[28, 22, 18, 15, 10, 7],
           marker:{ colors:['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4'] },
           textinfo:'percent', textfont:{size:11}, hole:0.35,
           hovertemplate:'<b>%{label}</b><br>%{percent}<extra></extra>' }],
        { plot_bgcolor:'#fff', paper_bgcolor:'#fff', font:{color:'#374151'},
          showlegend: true,
          legend:{ orientation:'v', x:1.02, y:0.5, font:{size:11}, bgcolor:'transparent' },
          margin:{ t:20, r:160, b:20, l:20 } },
        { responsive:true, displayModeBar:false });
    } catch(e) { console.error('Breakdown chart error:', e); }
  }

  private renderTrendChart(): void {
    const d = this.chartData[this._selectedPeriod()] ?? this.chartData['This Month'];
    try {
      Plotly.react('revenue-trend-chart',
        [{ type:'scatter', mode:'lines+markers', x: d.trendX, y: d.trendY,
           line:{color:'#f59e0b',width:3}, fill:'tozeroy', fillcolor:'rgba(245,158,11,0.08)',
           marker:{color:'#f59e0b',size:5} }],
        { ...this.lightLayout, margin:{t:10,r:10,b:35,l:55},
          xaxis:{showgrid:false, color:'#9ca3af', tickfont:{size:11}},
          yaxis:{showgrid:true, gridcolor:this.gridColor, color:'#9ca3af', tickfont:{size:11},
                 tickformat:'$,.0f'} },
        {responsive:true,displayModeBar:false});
    } catch(e) { console.error('Trend chart error:', e); }
  }

  private renderMonthlyChart(): void {
    const d       = this.chartData[this._selectedPeriod()] ?? this.chartData['This Month'];
    const useQtr  = this._chartView() === 'Quarterly' && d.showToggle;
    const x = useQtr ? d.qtrX : d.barX;
    const y = useQtr ? d.qtrY : d.barY;
    // Highlight last bar
    const colors = y.map((_,i) => i === y.length-1 ? '#f59e0b' : '#fbbf24');
    try {
      Plotly.react('monthly-revenue-chart',
        [{ type:'bar', x, y, marker:{color:colors, opacity:0.9},
           hovertemplate:'<b>%{x}</b><br>$%{y:,.0f}<extra></extra>' }],
        { ...this.lightLayout,
          margin:{t:20,r:20,b:35,l:65},
          xaxis:{showgrid:false, color:'#9ca3af', tickfont:{size:11}},
          yaxis:{showgrid:true, gridcolor:this.gridColor, color:'#9ca3af', tickfont:{size:11},
                 tickformat:'$,.0f'} },
        {responsive:true,displayModeBar:false});
    } catch(e) { console.error('Bar chart error:', e); }
  }
}