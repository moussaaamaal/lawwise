import { Component, signal, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type EventType = 'hearing' | 'meeting' | 'deadline' | 'consultation' | 'court_date';

export interface CalEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  locationType: 'physical' | 'video' | 'phone' | '';
  location: string;
  caseRef: string;
  participants: string[];
  notes: string;
  reminder: string;
  day: number;
}

interface NewEventForm {
  title: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  locationType: 'physical' | 'video' | 'phone' | '';
  location: string;
  caseRef: string;
  participants: string[];
  notes: string;
  reminder: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './calendar.html'
})
export class Calendar {

  // ── View ─────────────────────────────────────────────────
  currentView = signal<'day' | 'week' | 'month' | 'agenda'>('week');
  setView(v: string) { this.currentView.set(v.toLowerCase() as any); }

  // ── Week navigation ───────────────────────────────────────
  weekDays  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  private _today = new Date();
  private _dow   = this._today.getDay(); // 0=Sun..6=Sat
  todayIndex     = this._dow === 0 ? 6 : this._dow - 1; // Mon=0..Sun=6

  private _monday = (() => {
    const d = new Date(this._today);
    d.setDate(this._today.getDate() - this.todayIndex);
    return d;
  })();

  weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(this._monday);
    d.setDate(this._monday.getDate() + i);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  todayDayNum = this._today.getDate();
  monthLabel  = this._today.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Month grid
  private _firstOfMonth = new Date(this._today.getFullYear(), this._today.getMonth(), 1);
  private _lastOfMonth  = new Date(this._today.getFullYear(), this._today.getMonth() + 1, 0);
  private _firstDow     = this._firstOfMonth.getDay() === 0 ? 6 : this._firstOfMonth.getDay() - 1;
  private _daysInMonth  = this._lastOfMonth.getDate();
  private _prevLast     = new Date(this._today.getFullYear(), this._today.getMonth(), 0).getDate();

  monthGrid: number[][] = (() => {
    const grid: number[][] = [];
    let week: number[] = [];
    // fill leading days from prev month
    for (let i = this._firstDow - 1; i >= 0; i--) {
      week.push(this._prevLast - i);
    }
    for (let d = 1; d <= this._daysInMonth; d++) {
      week.push(d);
      if (week.length === 7) { grid.push(week); week = []; }
    }
    // trailing days from next month
    if (week.length > 0) {
      let next = 1;
      while (week.length < 7) { week.push(next++); }
      grid.push(week);
    }
    return grid;
  })();

  currentMonthDays = new Set(
    Array.from({ length: this._daysInMonth }, (_, i) => i + 1)
  );

  // Agenda: next 7 days starting today
  agendaDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(this._today);
    d.setDate(this._today.getDate() + i);
    const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const label  = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : '';
    const date   = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return { label, date, dayIdx };
  });

  hours = Array.from({ length: 12 }, (_, i) => {
    const h = i + 7;
    return { label: `${h > 12 ? h - 12 : h}:00 ${h < 12 ? 'AM' : 'PM'}`, hour: h };
  });

  // ── Event type config (WEB-CAL-02) ───────────────────────
  typeConfig: Record<EventType, {
    label: string; icon: string;
    dot: string; cardCls: string; badgeCls: string;
    activeBorder: string; activeBg: string; iconBg: string; labelCls: string;
  }> = {
    hearing: {
      label: 'Hearing', icon: 'fa-solid fa-gavel',
      dot: 'bg-red-500', cardCls: 'bg-red-50 border-l-red-400 text-red-900',
      badgeCls: 'bg-red-100 text-red-700',
      activeBorder: 'border-red-400', activeBg: 'bg-red-50', iconBg: 'bg-red-500', labelCls: 'text-red-700'
    },
    meeting: {
      label: 'Meeting', icon: 'fa-solid fa-users',
      dot: 'bg-blue-500', cardCls: 'bg-blue-50 border-l-blue-400 text-blue-900',
      badgeCls: 'bg-blue-100 text-blue-700',
      activeBorder: 'border-blue-400', activeBg: 'bg-blue-50', iconBg: 'bg-blue-500', labelCls: 'text-blue-700'
    },
    deadline: {
      label: 'Deadline', icon: 'fa-solid fa-hourglass-half',
      dot: 'bg-amber-500', cardCls: 'bg-amber-50 border-l-amber-400 text-amber-900',
      badgeCls: 'bg-amber-100 text-amber-700',
      activeBorder: 'border-amber-400', activeBg: 'bg-amber-50', iconBg: 'bg-amber-500', labelCls: 'text-amber-700'
    },
    consultation: {
      label: 'Consultation', icon: 'fa-solid fa-comments',
      dot: 'bg-purple-500', cardCls: 'bg-purple-50 border-l-purple-400 text-purple-900',
      badgeCls: 'bg-purple-100 text-purple-700',
      activeBorder: 'border-purple-400', activeBg: 'bg-purple-50', iconBg: 'bg-purple-500', labelCls: 'text-purple-700'
    },
    court_date: {
      label: 'Court Date', icon: 'fa-solid fa-landmark',
      dot: 'bg-emerald-500', cardCls: 'bg-emerald-50 border-l-emerald-400 text-emerald-900',
      badgeCls: 'bg-emerald-100 text-emerald-700',
      activeBorder: 'border-emerald-400', activeBg: 'bg-emerald-50', iconBg: 'bg-emerald-500', labelCls: 'text-emerald-700'
    }
  };

  typeKeys: EventType[] = ['hearing', 'meeting', 'deadline', 'consultation', 'court_date'];

  // ── Filters (WEB-CAL-05) ──────────────────────────────────
  activeFilters = signal<Set<EventType>>(new Set(['hearing','meeting','deadline','consultation','court_date']));

  isFilterActive(type: EventType): boolean { return this.activeFilters().has(type); }

  toggleFilter(type: EventType) {
    this.activeFilters.update(s => {
      const next = new Set(s);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }

  resetFilters() {
    this.activeFilters.set(new Set(this.typeKeys));
  }

  // ── Events ────────────────────────────────────────────────
  allEvents: CalEvent[] = [
    { id:'1',  title:'Smith vs. Johnson — Hearing',     type:'hearing',      date:'2026-03-10', startTime:'09:00', endTime:'11:00', allDay:false, locationType:'physical', location:'Superior Court, Room 4B',   caseRef:'CASE-2024-001', participants:['David Morrison','Sarah Williams'], notes:'', reminder:'60',   day:1 },
    { id:'2',  title:'Client Consultation — Williams',  type:'consultation', date:'2026-03-09', startTime:'14:00', endTime:'15:00', allDay:false, locationType:'video',    location:'Zoom',                      caseRef:'',              participants:['David Morrison'], notes:'', reminder:'15',   day:0 },
    { id:'3',  title:'Anderson Filing Deadline',        type:'deadline',     date:'2026-03-10', startTime:'17:00', endTime:'17:00', allDay:false, locationType:'',         location:'',                          caseRef:'CASE-2024-005', participants:[], notes:'', reminder:'1440', day:1 },
    { id:'4',  title:'Team Weekly Meeting',             type:'meeting',      date:'2026-03-11', startTime:'10:00', endTime:'11:00', allDay:false, locationType:'physical', location:'Conference Room B',          caseRef:'',              participants:['David Morrison','Michael Chen','Sarah Williams'], notes:'', reminder:'30', day:2 },
    { id:'5',  title:'NexGen — Contract Review',        type:'meeting',      date:'2026-03-12', startTime:'15:00', endTime:'16:30', allDay:false, locationType:'video',    location:'Microsoft Teams',           caseRef:'CASE-2024-007', participants:['Michael Chen'], notes:'', reminder:'15',   day:3 },
    { id:'6',  title:'Davis Employment — Mediation',    type:'court_date',   date:'2026-03-10', startTime:'11:00', endTime:'14:00', allDay:false, locationType:'physical', location:'Mediation Center, Suite 3', caseRef:'CASE-2024-012', participants:['Sarah Williams','David Morrison'], notes:'', reminder:'60', day:1 },
    { id:'7',  title:'Martinez — Probate Hearing',      type:'hearing',      date:'2026-03-11', startTime:'13:00', endTime:'15:00', allDay:false, locationType:'physical', location:'Probate Court, Room 7',     caseRef:'CASE-2024-003', participants:['David Morrison'], notes:'', reminder:'60',   day:2 },
    { id:'8',  title:'Wilson — Medical Malpractice',    type:'court_date',   date:'2026-03-13', startTime:'08:00', endTime:'10:00', allDay:false, locationType:'physical', location:'District Court',            caseRef:'CASE-2024-009', participants:['Michael Chen'], notes:'', reminder:'60',   day:4 },
    { id:'9',  title:'Thompson — Real Estate Closing',  type:'consultation', date:'2026-03-14', startTime:'09:00', endTime:'10:00', allDay:false, locationType:'physical', location:'Office Suite 12',           caseRef:'CASE-2024-007', participants:['Sarah Williams'], notes:'', reminder:'30',  day:5 },
    { id:'10', title:'Q1 Reports Submission',           type:'deadline',     date:'2026-03-12', startTime:'18:00', endTime:'18:00', allDay:false, locationType:'',         location:'',                          caseRef:'',              participants:[], notes:'', reminder:'1440', day:3 },
  ];

  get visibleEvents(): CalEvent[] {
    return this.allEvents.filter(e => this.activeFilters().has(e.type));
  }

  getEventsForDay(dayIndex: number): CalEvent[] {
    return this.visibleEvents.filter(e => e.day === dayIndex);
  }

  getEventsForMonthDay(day: number): CalEvent[] {
    if (!this.currentMonthDays.has(day)) return [];
    return this.visibleEvents.filter(e => parseInt(e.date.split('-')[2]) === day);
  }

  countByType(type: EventType): number {
    return this.allEvents.filter(e => e.type === type).length;
  }

  getEventAtHour(dayIndex: number, hour: number): CalEvent | null {
    return this.visibleEvents.find(e =>
      e.day === dayIndex && parseInt(e.startTime.split(':')[0]) === hour
    ) ?? null;
  }

  getDayEvents(dayIndex: number): CalEvent[] {
    return this.visibleEvents.filter(e => e.day === dayIndex)
      .sort((a,b) => a.startTime.localeCompare(b.startTime));
  }

  // ── Upcoming sidebar (WEB-CAL-06) ────────────────────────
  upcomingEvents = computed(() =>
    [...this.visibleEvents]
      .sort((a, b) => {
        const da = a.day * 100 + parseInt(a.startTime.replace(':',''));
        const db = b.day * 100 + parseInt(b.startTime.replace(':',''));
        return da - db;
      })
      .slice(0, 8)
  );

  getUpcomingDateLabel(e: CalEvent): string {
    const diff = e.day - this.todayIndex;
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return this.weekDays[e.day].slice(0,3) + ' ' + this.weekDates[e.day];
  }

  // ── Sync (WEB-CAL-04) ────────────────────────────────────
  googleSynced  = signal(true);
  outlookSynced = signal(false);
  isSyncing     = signal(false);
  showSyncPanel = signal(false);

  triggerSync() {
    this.isSyncing.set(true);
    setTimeout(() => this.isSyncing.set(false), 1800);
  }

  // ── Modal (WEB-CAL-03) ───────────────────────────────────
  showModal    = signal(false);
  modalStep    = signal<1 | 2>(1);
  isSubmitting = signal(false);
  participantInput = signal('');

  newEvent: NewEventForm = this.emptyForm();

  locationTypes: { value: 'physical'|'video'|'phone'|''; label: string; icon: string }[] = [
    { value: 'physical', label: 'In-Person', icon: 'fa-solid fa-location-dot' },
    { value: 'video',    label: 'Video',     icon: 'fa-solid fa-video' },
    { value: 'phone',    label: 'Phone',     icon: 'fa-solid fa-phone' },
    { value: '',         label: 'N/A',       icon: 'fa-solid fa-ban' },
  ];

  cases = [
    'CASE-2024-001 — Smith vs. Johnson',
    'CASE-2024-003 — Martinez Family Trust',
    'CASE-2024-005 — Anderson Filing',
    'CASE-2024-007 — Thompson Real Estate',
    'CASE-2024-009 — Wilson Medical Malpractice',
    'CASE-2024-012 — Davis Employment',
  ];

  teamMembers = ['David Morrison','Sarah Williams','Michael Chen','Jennifer Lopez','Robert Taylor','Amanda Foster'];

  reminderOptions = [
    { value:'0',    label:'No reminder' },
    { value:'15',   label:'15 minutes before' },
    { value:'30',   label:'30 minutes before' },
    { value:'60',   label:'1 hour before' },
    { value:'1440', label:'1 day before' },
  ];

  get selectedTypeCfg() { return this.typeConfig[this.newEvent.type]; }
  get isFormValid() { return this.newEvent.title.trim().length > 0 && this.newEvent.date.length > 0; }

  emptyForm(): NewEventForm {
    const today = new Date().toISOString().split('T')[0];
    return {
      title:'', type:'meeting', date: today,
      startTime:'09:00', endTime:'10:00', allDay:false,
      locationType:'physical', location:'', caseRef:'',
      participants:[], notes:'', reminder:'15'
    };
  }

  openModal()  { this.newEvent = this.emptyForm(); this.participantInput.set(''); this.modalStep.set(1); this.isSubmitting.set(false); this.showModal.set(true); }
  closeModal() { this.showModal.set(false); }
  addAnother() { this.newEvent = this.emptyForm(); this.participantInput.set(''); this.modalStep.set(1); }

  addParticipant(name: string) {
    const n = name.trim();
    if (n && !this.newEvent.participants.includes(n)) {
      this.newEvent.participants = [...this.newEvent.participants, n];
    }
    this.participantInput.set('');
  }

  removeParticipant(i: number) {
    this.newEvent.participants = this.newEvent.participants.filter((_,idx) => idx !== i);
  }

  submitEvent() {
    if (!this.isFormValid) return;
    this.isSubmitting.set(true);
    setTimeout(() => { this.isSubmitting.set(false); this.modalStep.set(2); }, 900);
  }

  formatTime(t: string): string {
    const [h, m] = t.split(':').map(Number);
    return `${h > 12 ? h - 12 : h}:${m.toString().padStart(2,'0')} ${h < 12 ? 'AM' : 'PM'}`;
  }
}