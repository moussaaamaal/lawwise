import { Component, signal, computed, inject, effect } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../services/notification.service';

export type NotifCategory = 'deadline' | 'document' | 'assignment' | 'payment' | 'system';
export type NotifPriority = 'urgent' | 'high' | 'normal';

export interface Notif {
  id:           string;
  category:     NotifCategory;
  priority:     NotifPriority;
  title:        string;
  body:         string;
  meta:         string;
  time:         Date;
  read:         boolean;
  actionLabel?: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './notifications.html',
})
export class Notifications {

  private notifService = inject(NotificationService);

  // ── WEB-NOTIF-01 — Category tabs with per-category colors ─
  activeFilter = signal<NotifCategory | 'all'>('all');

  filterLabels: {
    value:        NotifCategory | 'all';
    label:        string;
    icon:         string;
    iconInactive: string;
    activeCls:    string;
    badgeCls:     string;
  }[] = [
    { value:'all',        label:'All',         icon:'fa-solid fa-bell',                  iconInactive:'text-gray-400', activeCls:'bg-gray-900 text-white',              badgeCls:'bg-gray-200 text-gray-600' },
    { value:'deadline',   label:'Deadlines',   icon:'fa-solid fa-hourglass-half',        iconInactive:'text-red-400',  activeCls:'bg-red-500 text-white',               badgeCls:'bg-red-100 text-red-600' },
    { value:'document',   label:'Documents',   icon:'fa-solid fa-file-lines',            iconInactive:'text-blue-400', activeCls:'bg-blue-500 text-white',              badgeCls:'bg-blue-100 text-blue-600' },
    { value:'assignment', label:'Assignments', icon:'fa-solid fa-briefcase',             iconInactive:'text-purple-400', activeCls:'bg-purple-500 text-white',          badgeCls:'bg-purple-100 text-purple-600' },
    { value:'payment',    label:'Payments',    icon:'fa-solid fa-circle-dollar-to-slot', iconInactive:'text-amber-500', activeCls:'bg-amber-500 text-white',            badgeCls:'bg-amber-100 text-amber-700' },
    { value:'system',     label:'System',      icon:'fa-solid fa-gear',                  iconInactive:'text-gray-400', activeCls:'bg-slate-600 text-white',             badgeCls:'bg-gray-200 text-gray-600' },
  ];

  setFilter(f: NotifCategory | 'all') { this.activeFilter.set(f); }

  // ── WEB-NOTIF-02 — Priority filter chips with colors ──────
  selectedPriority = signal<NotifPriority | 'all'>('all');
  priorityOptions: { value: NotifPriority | 'all'; label: string; activeCls: string }[] = [
    { value:'all',    label:'All Priority',  activeCls:'bg-gray-900 text-white border-gray-900' },
    { value:'urgent', label:'Urgent',        activeCls:'bg-red-500 text-white border-red-500' },
    { value:'high',   label:'High',          activeCls:'bg-amber-500 text-white border-amber-500' },
    { value:'normal', label:'Normal',        activeCls:'bg-green-500 text-white border-green-500' },
  ];

  // ── WEB-NOTIF-03 — Time period ────────────────────────────
  selectedPeriod = signal<'today' | '7days' | '30days'>('7days');
  periodOptions = [
    { value: 'today'  as const, label: 'Today' },
    { value: '7days'  as const, label: 'Last 7 Days' },
    { value: '30days' as const, label: 'Last 30 Days' },
  ];

  // ── Category config (full color palette) ─────────────────
  readonly catConfig: Record<NotifCategory, {
    dot: string; icon: string;
    iconBg: string; iconColor: string;
    pillBg: string; pillText: string;
    unreadBg: string;
    label: string;
    actionBtn: string;
  }> = {
    deadline: {
      dot:'bg-red-500', icon:'fa-solid fa-hourglass-half',
      iconBg:'bg-red-100', iconColor:'text-red-600',
      pillBg:'bg-red-100', pillText:'text-red-700',
      unreadBg:'#FFF5F5',
      label:'Deadline', actionBtn:'bg-red-500 hover:bg-red-600',
    },
    document: {
      dot:'bg-blue-500', icon:'fa-solid fa-file-lines',
      iconBg:'bg-blue-100', iconColor:'text-blue-600',
      pillBg:'bg-blue-100', pillText:'text-blue-700',
      unreadBg:'#EFF6FF',
      label:'Document', actionBtn:'bg-blue-500 hover:bg-blue-600',
    },
    assignment: {
      dot:'bg-purple-500', icon:'fa-solid fa-briefcase',
      iconBg:'bg-purple-100', iconColor:'text-purple-600',
      pillBg:'bg-purple-100', pillText:'text-purple-700',
      unreadBg:'#F5F3FF',
      label:'Assignment', actionBtn:'bg-purple-500 hover:bg-purple-600',
    },
    payment: {
      dot:'bg-amber-500', icon:'fa-solid fa-circle-dollar-to-slot',
      iconBg:'bg-amber-100', iconColor:'text-amber-600',
      pillBg:'bg-amber-100', pillText:'text-amber-700',
      unreadBg:'#FFFBEB',
      label:'Payment', actionBtn:'bg-amber-500 hover:bg-amber-600',
    },
    system: {
      dot:'bg-slate-400', icon:'fa-solid fa-gear',
      iconBg:'bg-slate-100', iconColor:'text-slate-500',
      pillBg:'bg-slate-100', pillText:'text-slate-600',
      unreadBg:'#F8FAFC',
      label:'System', actionBtn:'bg-slate-500 hover:bg-slate-600',
    },
  };

  // ── Priority config ───────────────────────────────────────
  readonly prioConfig: Record<NotifPriority, { bar: string; badge: string; label: string }> = {
    urgent: { bar:'bg-red-500',   badge:'bg-red-100 text-red-700 border border-red-200',       label:'Urgent' },
    high:   { bar:'bg-amber-400', badge:'bg-amber-100 text-amber-700 border border-amber-200', label:'High' },
    normal: { bar:'bg-transparent', badge:'', label:'' },
  };

  // ── Delivery channels — colorful active state ─────────────
  channels: {
    key: string; icon: string; label: string; desc: string;
    activeBg: string; activeBorder: string;
    iconBgActive: string; iconColorActive: string;
    toggleColor: string; labelColor: string; descColor: string;
  }[] = [
    {
      key:'emailEnabled',   icon:'fa-solid fa-envelope',
      label:'Email Alerts', desc:'Receive via email',
      activeBg:'bg-blue-50',   activeBorder:'border-blue-300',
      iconBgActive:'bg-blue-500', iconColorActive:'text-white',
      toggleColor:'bg-blue-500', labelColor:'text-blue-800', descColor:'text-blue-500',
    },
    {
      key:'pushEnabled',    icon:'fa-solid fa-mobile-screen',
      label:'Push',         desc:'Instant mobile alerts',
      activeBg:'bg-green-50',  activeBorder:'border-green-300',
      iconBgActive:'bg-green-500', iconColorActive:'text-white',
      toggleColor:'bg-green-500', labelColor:'text-green-800', descColor:'text-green-500',
    },
    {
      key:'desktopEnabled', icon:'fa-solid fa-bell',
      label:'Desktop',      desc:'Browser notifications',
      activeBg:'bg-purple-50', activeBorder:'border-purple-300',
      iconBgActive:'bg-purple-500', iconColorActive:'text-white',
      toggleColor:'bg-purple-500', labelColor:'text-purple-800', descColor:'text-purple-500',
    },
    {
      key:'smsEnabled',     icon:'fa-solid fa-comment',
      label:'SMS',          desc:'Critical updates via text',
      activeBg:'bg-amber-50',  activeBorder:'border-amber-300',
      iconBgActive:'bg-amber-500', iconColorActive:'text-white',
      toggleColor:'bg-amber-500', labelColor:'text-amber-800', descColor:'text-amber-500',
    },
  ];

  // ── Notification data ─────────────────────────────────────
  private _now = new Date();
  private _h = (h: number) => new Date(this._now.getTime() - h * 3_600_000);
  private _d = (d: number) => new Date(this._now.getTime() - d * 86_400_000);

  allNotifications = signal<Notif[]>([
    { id:'n1',  category:'deadline',   priority:'urgent', title:'Motion Filing Deadline Today',              body:'Summary judgment must be filed by 5:00 PM for Johnson vs. State Corp.',          meta:'CASE-2024-001 · Sarah Williams',   time:this._h(1),   read:false, actionLabel:'View Case' },
    { id:'n2',  category:'deadline',   priority:'urgent', title:'Court submission overdue',                  body:'Expert Witness List for Wilson Medical Malpractice was due yesterday.',           meta:'CASE-2024-009 · Robert Taylor',    time:this._h(26),  read:false, actionLabel:'View Case' },
    { id:'n3',  category:'deadline',   priority:'high',   title:'Hearing Tomorrow: Martinez Family Trust',   body:'Estate planning document review hearing at 2:30 PM. Prepare all materials.',       meta:'CASE-2024-003 · Michael Chen',     time:this._h(5),   read:false, actionLabel:'View Case' },
    { id:'n4',  category:'deadline',   priority:'normal', title:'Contract review due in 5 days',             body:'Thompson Real Estate contract review must be completed by Mar 15.',               meta:'CASE-2024-007 · David Morrison',   time:this._d(2),   read:true,  actionLabel:'Open Document' },
    { id:'n5',  category:'document',   priority:'high',   title:'New Document: Contract_Amendment_v3.pdf',   body:'Uploaded to Johnson vs. State Corp by Sarah Williams · 2.4 MB',                   meta:'CASE-2024-001',                    time:this._h(2),   read:false, actionLabel:'Review' },
    { id:'n6',  category:'document',   priority:'normal', title:'New Document: Witness_Statement_Final.docx',body:'Uploaded to Martinez Family Trust by Michael Chen · 1.8 MB',                     meta:'CASE-2024-003',                    time:this._h(4),   read:false, actionLabel:'Open' },
    { id:'n7',  category:'document',   priority:'normal', title:'Client signed NDA',                         body:'Anderson Industries electronically signed the Non-Disclosure Agreement.',         meta:'CASE-2024-005',                    time:this._d(1),   read:true,  actionLabel:'Download' },
    { id:'n8',  category:'document',   priority:'normal', title:'Court order received',                      body:'Order re: Motion to Compel Discovery received from District Court.',               meta:'CASE-2024-009',                    time:this._d(3),   read:true },
    { id:'n9',  category:'assignment', priority:'urgent', title:'New Case: Peterson vs. Metro Transit',       body:'Assigned to Sarah Williams by David Morrison — pending acceptance.',               meta:'CASE-2024-015 · Civil Litigation',  time:this._h(1),  read:false, actionLabel:'Accept' },
    { id:'n10', category:'assignment', priority:'high',   title:'Case Reassignment: Davis Employment',       body:'Reassigned to David Morrison from Jennifer Lopez.',                                meta:'CASE-2024-012 · Employment Law',    time:this._h(9),  read:false, actionLabel:'View Case' },
    { id:'n11', category:'assignment', priority:'normal', title:'New Case: Roberts Estate Planning',         body:'Assigned to Michael Chen by Jennifer Lopez — accepted.',                           meta:'CASE-2024-016 · Estate Law',        time:this._h(3),  read:true },
    { id:'n12', category:'payment',    priority:'urgent', title:'Payment Overdue: INV-2845 — $12,500',       body:'Invoice for Johnson Corp is 5 days overdue. Immediate follow-up required.',        meta:'INV-2845 · Johnson Corp',           time:this._h(4),  read:false, actionLabel:'Send Reminder' },
    { id:'n13', category:'payment',    priority:'urgent', title:'Payment Overdue: INV-2832 — $8,750',        body:'Invoice for Wilson Medical is 7 days overdue. Consider escalation.',               meta:'INV-2832 · Wilson Medical',         time:this._h(6),  read:false, actionLabel:'View Invoice' },
    { id:'n14', category:'payment',    priority:'high',   title:'Invoice due in 5 days — $8,750',            body:'INV-2846 for Martinez Family Trust is due Nov 20.',                                meta:'INV-2846 · Martinez Family',        time:this._h(12), read:false, actionLabel:'View Invoice' },
    { id:'n15', category:'payment',    priority:'normal', title:'Payment received — $15,200',                body:'Thompson Properties made full payment for INV-2840. Receipt generated.',            meta:'INV-2840 · Thompson Properties',    time:this._d(1),  read:true,  actionLabel:'View Receipt' },
    { id:'n16', category:'system',     priority:'normal', title:'System Update Scheduled',                   body:'LegalFlow maintenance Nov 17 from 2:00–4:00 AM EST. Save your work beforehand.',  meta:'System',                            time:this._d(1),  read:true },
    { id:'n17', category:'system',     priority:'normal', title:'New Feature: AI Document Summarization',    body:'Upload any legal document to get instant summaries and key point extraction.',     meta:'System',                            time:this._d(2),  read:true },
    { id:'n18', category:'system',     priority:'high',   title:'Security Update Applied',                   body:'Account security enhanced with latest encryption protocols. No action required.',  meta:'Settings · Security',               time:this._d(3),  read:true },
    { id:'n19', category:'system',     priority:'normal', title:'Storage Limit Approaching',                 body:'Tenant storage is at 67% capacity. Consider upgrading or archiving old files.',    meta:'Settings · Storage',                time:this._d(5),  read:true },
  ]);

  // ── Filtering ─────────────────────────────────────────────
  filteredNotifications = computed(() => {
    const ms: Record<string, number> = { today:86_400_000, '7days':7*86_400_000, '30days':30*86_400_000 };
    const cutoff = Date.now() - ms[this.selectedPeriod()];
    return this.allNotifications().filter(n => {
      const catOk  = this.activeFilter() === 'all' || n.category === this.activeFilter();
      const prioOk = this.selectedPriority() === 'all' || n.priority === this.selectedPriority();
      return catOk && prioOk && n.time.getTime() >= cutoff;
    });
  });

  groupedNotifications = computed(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const yest  = new Date(today.getTime() - 86_400_000);
    const buckets: Record<string, Notif[]> = {};
    for (const n of this.filteredNotifications()) {
      const d = new Date(n.time); d.setHours(0,0,0,0);
      const key = d >= today ? 'Today' : d >= yest ? 'Yesterday' : 'Earlier';
      (buckets[key] ??= []).push(n);
    }
    return (['Today','Yesterday','Earlier'] as const)
      .filter(k => buckets[k]?.length)
      .map(k => ({ label: k, items: buckets[k] }));
  });

  // ── Read / dismiss ────────────────────────────────────────
  countUnread(cat: NotifCategory | 'all' = 'all') {
    return this.allNotifications().filter(n => !n.read && (cat === 'all' || n.category === cat)).length;
  }
  get totalUnread() { return this.countUnread('all'); }

  markAllRead() { this.allNotifications.update(l => l.map(n => ({ ...n, read: true }))); }
  markRead(id: string) { this.allNotifications.update(l => l.map(n => n.id === id ? { ...n, read: true } : n)); }
  dismiss(id: string)  { this.allNotifications.update(l => l.filter(n => n.id !== id)); }

  private _sync = effect(() => { this.notifService.setUnreadCount(this.totalUnread); });

  // ── WEB-NOTIF-05 — Settings ───────────────────────────────
  showSettings = signal(false);

  settingValues = signal<Record<string, boolean>>({
    deadlineUrgent:true, deadlineHigh:true, deadlineNormal:false,
    documentUploaded:true, documentSigned:true,
    assignmentNew:true, assignmentChanged:true,
    paymentOverdue:true, paymentDueSoon:true, paymentReceived:true,
    systemUpdates:false, systemSecurity:true, systemStorage:true,
    emailEnabled:true, pushEnabled:true, desktopEnabled:false, smsEnabled:true,
  });
  getSetting(k: string) { return this.settingValues()[k] ?? false; }
  toggleSetting(k: string) { this.settingValues.update(s => ({ ...s, [k]: !s[k] })); }

  settingGroups = [
    { label:'Deadline Alerts', icon:'fa-solid fa-hourglass-half',       iconBg:'bg-red-50',    iconColor:'text-red-600',
      items:[{key:'deadlineUrgent',label:'Urgent (within 24h)'},{key:'deadlineHigh',label:'High (3 days before)'},{key:'deadlineNormal',label:'Normal (7 days before)'}] },
    { label:'Documents',       icon:'fa-solid fa-file-lines',            iconBg:'bg-blue-50',   iconColor:'text-blue-600',
      items:[{key:'documentUploaded',label:'Document uploaded'},{key:'documentSigned',label:'Document signed'}] },
    { label:'Assignments',     icon:'fa-solid fa-briefcase',             iconBg:'bg-purple-50', iconColor:'text-purple-600',
      items:[{key:'assignmentNew',label:'New case assigned'},{key:'assignmentChanged',label:'Role or team changed'}] },
    { label:'Payments',        icon:'fa-solid fa-circle-dollar-to-slot', iconBg:'bg-amber-50',  iconColor:'text-amber-600',
      items:[{key:'paymentOverdue',label:'Invoice overdue'},{key:'paymentDueSoon',label:'Due soon (3 days)'},{key:'paymentReceived',label:'Payment received'}] },
    { label:'System',          icon:'fa-solid fa-gear',                  iconBg:'bg-slate-50',  iconColor:'text-slate-500',
      items:[{key:'systemUpdates',label:'Updates & maintenance'},{key:'systemSecurity',label:'Security alerts'},{key:'systemStorage',label:'Storage warnings'}] },
  ];

  timeAgo(date: Date): string {
    const diff = Date.now() - date.getTime();
    const m = Math.floor(diff / 60_000);
    const h = Math.floor(diff / 3_600_000);
    const d = Math.floor(diff / 86_400_000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  }
}