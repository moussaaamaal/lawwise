import { Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface StaffMember {
  avatar: string;
  borderCls: string;
  name: string;
  id: string;
  title: string;
  dept: string;
  deptCls: string;
  phone: string;
  email: string;
  roleCls: string;
  roleLabel: string;
  statusCls: string;
  status: string;
  since: string;
  cases: number;
}

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './staff.html',
})
export class Staff {

  stats = [
    { icon: 'fa-solid fa-users',      iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   label: 'Total Staff',     value: '20', note: '12 lawyers, 8 support',     badgeCls: 'bg-blue-100 text-blue-700',   badge: 'All' },
    { icon: 'fa-solid fa-user-tie',   iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  label: 'Senior Partners', value: '2',  note: 'Managing the firm',          badgeCls: 'bg-amber-100 text-amber-700', badge: 'Partners' },
    { icon: 'fa-solid fa-user-check', iconBg: 'bg-green-100',  iconColor: 'text-green-600',  label: 'Active Members',  value: '17', note: '3 pending onboarding',       badgeCls: 'bg-green-100 text-green-700', badge: 'Active' },
    { icon: 'fa-solid fa-building',   iconBg: 'bg-purple-100', iconColor: 'text-purple-600', label: 'Departments',     value: '5',  note: 'Across all practice areas',   badgeCls: 'bg-purple-100 text-purple-700',badge: 'Depts' },
    { icon: 'fa-solid fa-briefcase',  iconBg: 'bg-red-100',    iconColor: 'text-red-600',    label: 'Active Cases',    value: '48', note: 'Assigned to staff',           badgeCls: 'bg-red-100 text-red-700',     badge: 'Cases' },
  ];

  deptStats = [
    { label: 'Civil Litigation', count: 4, color: 'bg-blue-500',   pct: 28 },
    { label: 'Estate Law',       count: 3, color: 'bg-green-500',  pct: 21 },
    { label: 'Corporate Law',    count: 3, color: 'bg-purple-500', pct: 21 },
    { label: 'Real Estate',      count: 2, color: 'bg-amber-500',  pct: 14 },
    { label: 'Employment Law',   count: 2, color: 'bg-red-500',    pct: 14 },
  ];

  staffMembers: StaffMember[] = [
    { avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg', borderCls:'border-blue-500',   name:'David Morrison', id:'EMP-001', title:'Managing Partner',  dept:'Leadership',     deptCls:'bg-blue-100 text-blue-700',   phone:'+216 98 123 456', email:'david.morrison@legalhub.tn',   roleCls:'bg-blue-100 text-blue-700',   roleLabel:'Senior Partner', statusCls:'bg-green-100 text-green-700', status:'Active',   since:'Jan 2018', cases:8  },
    { avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', borderCls:'border-green-500',  name:'Sarah Williams', id:'EMP-002', title:'Senior Associate',  dept:'Civil Litigation',deptCls:'bg-blue-100 text-blue-700',   phone:'+216 97 654 321', email:'sarah.williams@legalhub.tn',   roleCls:'bg-green-100 text-green-700', roleLabel:'Associate',      statusCls:'bg-green-100 text-green-700', status:'Active',   since:'Mar 2019', cases:12 },
    { avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', borderCls:'border-blue-500',   name:'Michael Chen',   id:'EMP-003', title:'Partner',           dept:'Estate Law',     deptCls:'bg-green-100 text-green-700', phone:'+216 99 876 543', email:'michael.chen@legalhub.tn',     roleCls:'bg-blue-100 text-blue-700',   roleLabel:'Senior Partner', statusCls:'bg-green-100 text-green-700', status:'Active',   since:'Jun 2018', cases:6  },
    { avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg', borderCls:'border-purple-500', name:'Jennifer Lopez', id:'EMP-004', title:'Legal Secretary',   dept:'Administration', deptCls:'bg-gray-100 text-gray-700',   phone:'+216 55 432 109', email:'jennifer.lopez@legalhub.tn',   roleCls:'bg-purple-100 text-purple-700',roleLabel:'Secretary',      statusCls:'bg-green-100 text-green-700', status:'Active',   since:'Feb 2020', cases:0  },
    { avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg', borderCls:'border-amber-500',  name:'Robert Taylor',  id:'EMP-005', title:'Paralegal',         dept:'Corporate Law',  deptCls:'bg-purple-100 text-purple-700',phone:'+216 98 765 432', email:'robert.taylor@legalhub.tn',    roleCls:'bg-amber-100 text-amber-700', roleLabel:'Paralegal',      statusCls:'bg-amber-100 text-amber-700', status:'Pending',  since:'Sep 2023', cases:5  },
    { avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', borderCls:'border-green-500',  name:'Amanda Foster',  id:'EMP-006', title:'Junior Associate',  dept:'Real Estate',    deptCls:'bg-amber-100 text-amber-700', phone:'+216 99 123 456', email:'amanda.foster@legalhub.tn',    roleCls:'bg-green-100 text-green-700', roleLabel:'Associate',      statusCls:'bg-green-100 text-green-700', status:'Active',   since:'Nov 2021', cases:4  },
    { avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg', borderCls:'border-red-400',    name:'Thomas Reed',    id:'EMP-007', title:'Of Counsel',        dept:'Employment Law', deptCls:'bg-red-100 text-red-700',     phone:'+216 97 876 543', email:'thomas.reed@legalhub.tn',      roleCls:'bg-gray-100 text-gray-700',   roleLabel:'Of Counsel',     statusCls:'bg-red-100 text-red-700',     status:'Inactive', since:'Aug 2017', cases:0  },
    { avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg', borderCls:'border-green-500',  name:'Lisa Park',      id:'EMP-008', title:'Office Manager',    dept:'Administration', deptCls:'bg-gray-100 text-gray-700',   phone:'+216 55 987 654', email:'lisa.park@legalhub.tn',        roleCls:'bg-gray-100 text-gray-700',   roleLabel:'Management',     statusCls:'bg-green-100 text-green-700', status:'Active',   since:'May 2019', cases:0  },
  ];

  activeFilter = signal('All');
  filters      = ['All', 'Active', 'Pending', 'Inactive'];
  setFilter(f: string) { this.activeFilter.set(f); }

  get filteredStaff() {
    if (this.activeFilter() === 'All') return this.staffMembers;
    return this.staffMembers.filter(s => s.status === this.activeFilter());
  }

  viewMode = signal<'grid' | 'list'>('grid');

  // ── Modal ─────────────────────────────────────────────────
  showModal    = signal(false);
  modalStep    = signal<1|2|3|4>(1);
  isSubmitting = signal(false);

  departments = ['Leadership','Civil Litigation','Estate Law','Corporate Law','Real Estate','Employment Law','Administration'];
  roles       = ['Senior Partner','Associate','Junior Associate','Paralegal','Secretary','Of Counsel','Management','Intern'];
  titles      = ['Managing Partner','Partner','Senior Associate','Junior Associate','Of Counsel','Paralegal','Legal Secretary','Office Manager'];

  // Step 1 — Personal Info
  f1 = signal({ firstName:'', lastName:'', dob:'', gender:'', phone:'', email:'', address:'', city:'' });
  // Step 2 — Professional Info
  f2 = signal({ title:'', role:'', dept:'', startDate:'', employeeId:'', barNumber:'', practiceAreas:'' });
  // Step 3 — Access & Settings
  f3 = signal({ status:'Active', systemAccess:true, caseAccess:true, billingAccess:false, emergencyName:'', emergencyPhone:'', notes:'' });

  get step1Valid() {
    const f = this.f1();
    return f.firstName.trim().length > 0 && f.lastName.trim().length > 0 && f.email.trim().length > 0;
  }
  get step2Valid() {
    const f = this.f2();
    return f.role.length > 0 && f.dept.length > 0;
  }
  get progressPct()  { return ((this.modalStep() - 1) / 3) * 100; }

  get stepLabels() {
    const s = this.modalStep();
    return [
      { label:'Personal Info',   active: s === 1, done: s > 1 },
      { label:'Professional',    active: s === 2, done: s > 2 },
      { label:'Access & Settings', active: s === 3, done: s > 3 },
    ];
  }

  setGender(g: string) { this.f1.update(v => ({ ...v, gender: g })); }

  getF3Bool(key: string): boolean {
    const f = this.f3();
    return !!f[key as 'systemAccess'|'caseAccess'|'billingAccess'];
  }
  setF3Bool(key: string, value: boolean) {
    const k = key as 'systemAccess'|'caseAccess'|'billingAccess';
    this.f3.update(v => ({ ...v, [k]: value }));
  }

  openModal() {
    this.f1.set({ firstName:'', lastName:'', dob:'', gender:'', phone:'', email:'', address:'', city:'' });
    this.f2.set({ title:'', role:'', dept:'', startDate:'', employeeId:'', barNumber:'', practiceAreas:'' });
    this.f3.set({ status:'Active', systemAccess:true, caseAccess:true, billingAccess:false, emergencyName:'', emergencyPhone:'', notes:'' });
    this.modalStep.set(1);
    this.showModal.set(true);
  }
  closeModal() { this.showModal.set(false); }
  nextStep() {
    const s = this.modalStep();
    if (s < 3) this.modalStep.set((s + 1) as 1|2|3|4);
    else this.submitStaff();
  }
  prevStep() {
    const s = this.modalStep();
    if (s > 1) this.modalStep.set((s - 1) as 1|2|3|4);
  }

  submitStaff() {
    this.isSubmitting.set(true);
    setTimeout(() => {
      const f1 = this.f1(); const f2 = this.f2(); const f3 = this.f3();
      const roleColors: Record<string, string> = {
        'Senior Partner':'bg-blue-100 text-blue-700', 'Associate':'bg-green-100 text-green-700',
        'Junior Associate':'bg-green-100 text-green-700', 'Paralegal':'bg-amber-100 text-amber-700',
        'Secretary':'bg-purple-100 text-purple-700', 'Of Counsel':'bg-gray-100 text-gray-700',
        'Management':'bg-gray-100 text-gray-700', 'Intern':'bg-pink-100 text-pink-700',
      };
      const deptColors: Record<string, string> = {
        'Civil Litigation':'bg-blue-100 text-blue-700', 'Estate Law':'bg-green-100 text-green-700',
        'Corporate Law':'bg-purple-100 text-purple-700', 'Real Estate':'bg-amber-100 text-amber-700',
        'Employment Law':'bg-red-100 text-red-700', 'Administration':'bg-gray-100 text-gray-700',
        'Leadership':'bg-blue-100 text-blue-700',
      };
      const newId = `EMP-${String(this.staffMembers.length + 1).padStart(3, '0')}`;
      const year = new Date().getFullYear();
      const month = new Date().toLocaleString('en-US', { month: 'short' });
      this.staffMembers.unshift({
        avatar: `https://ui-avatars.com/api/?name=${f1.firstName}+${f1.lastName}&background=f59e0b&color=fff`,
        borderCls: 'border-amber-500',
        name:  `${f1.firstName} ${f1.lastName}`,
        id:    newId,
        title: f2.title || f2.role,
        dept:  f2.dept,
        deptCls:   deptColors[f2.dept] || 'bg-gray-100 text-gray-700',
        phone: f1.phone,
        email: f1.email,
        roleCls:   roleColors[f2.role] || 'bg-gray-100 text-gray-700',
        roleLabel: f2.role,
        statusCls: f3.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700',
        status:    f3.status,
        since:     `${month} ${year}`,
        cases:     0,
      });
      this.isSubmitting.set(false);
      this.modalStep.set(4);
    }, 900);
  }
}