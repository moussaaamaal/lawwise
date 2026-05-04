import { Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TeamMember {
  avatar: string; avatarBorder: string;
  name: string; id: string;
  roleCls: string; roleLabel: string;
  email: string; cases: string;
  statusCls: string; statusLabel: string;
  lastActive: string;
}

interface PermRow {
  feature: string;
  partner: 'check' | 'partial' | 'none';
  associate: 'check' | 'partial' | 'none';
  secretary: 'check' | 'partial' | 'none';
  paralegal: 'check' | 'partial' | 'none';
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './settings.html',
})
export class Settings {

  // ── Nav tabs ─────────────────────────────────────────────
  activeTab = signal('Office Profile');
  tabs = [
    { label: 'Office Profile',      icon: 'fa-solid fa-building' },
    { label: 'Subscription',        icon: 'fa-solid fa-crown' },
    { label: 'Roles & Permissions', icon: 'fa-solid fa-user-shield' },
    { label: 'Branding',            icon: 'fa-solid fa-palette' },
    { label: 'Team Members',        icon: 'fa-solid fa-users' },
    { label: 'Notifications',       icon: 'fa-solid fa-bell' },
    { label: 'Security',            icon: 'fa-solid fa-shield-halved' },
    { label: 'Integrations',        icon: 'fa-solid fa-plug' },
    { label: 'Storage',             icon: 'fa-solid fa-database' },
  ];
  setTab(t: string) { this.activeTab.set(t); }

  // ── Office Profile ────────────────────────────────────────
  officeName   = signal('Morrison & Associates');
  entityType   = signal('LLP');
  regNumber    = signal('LLP-2018-45892');
  taxId        = signal('XX-XXXXXXX89');
  address      = signal('1250 Broadway, Suite 2700');
  city         = signal('New York');
  state        = signal('NY');
  zip          = signal('10001');
  phone        = signal('+1 (212) 555-0198');
  email        = signal('contact@morrisonlaw.com');
  description  = signal('Morrison & Associates is a full-service law firm established in 2018, providing exceptional legal services across multiple practice areas.');
  practiceAreas       = signal(['Civil Litigation', 'Estate Law', 'Real Estate', 'Employment Law', 'Corporate Law']);
  practiceAreaColors  = ['bg-blue-100 text-blue-700','bg-green-100 text-green-700','bg-amber-100 text-amber-700','bg-purple-100 text-purple-700','bg-red-100 text-red-700'];
  newPracticeArea     = signal('');
  entityTypes         = ['LLP – Limited Liability Partnership','PC – Professional Corporation','Sole Proprietorship','Partnership'];

  addPracticeArea() {
    const v = this.newPracticeArea().trim();
    if (v) { this.practiceAreas.update(a => [...a, v]); this.newPracticeArea.set(''); }
  }
  removePracticeArea(i: number) { this.practiceAreas.update(a => a.filter((_, idx) => idx !== i)); }

  quickStats = [
    { label: 'Active Lawyers',    value: '12' },
    { label: 'Support Staff',     value: '8' },
    { label: 'Total Clients',     value: '342' },
    { label: 'Years Established', value: '6' },
  ];

  // ── Subscription ─────────────────────────────────────────
  plans = [
    { badge: 'Basic',        badgeCls: 'bg-gray-100 text-gray-700',    price: '$49',    sub: 'For small practices',  current: false, features: ['Up to 3 users','50 active cases','10GB storage','Basic support'] },
    { badge: 'Professional', badgeCls: 'bg-blue-100 text-blue-700',    price: '$149',   sub: 'For growing firms',    current: false, features: ['Up to 10 users','200 active cases','100GB storage','Priority support'] },
    { badge: 'Enterprise',   badgeCls: 'bg-amber-100 text-amber-700',  price: '$399',   sub: 'For large practices',  current: true,  features: ['Unlimited users','Unlimited cases','1TB storage','24/7 support'] },
    { badge: 'Custom',       badgeCls: 'bg-purple-100 text-purple-700',price: 'Custom', sub: 'Tailored solution',    current: false, features: ['Custom users','Custom cases','Custom storage','Dedicated support'] },
  ];
  usageBars = [
    { label: 'Active Users', value: '12 / Unlimited', pct: 45, color: 'bg-green-500' },
    { label: 'Active Cases', value: '24 / Unlimited', pct: 30, color: 'bg-blue-500' },
    { label: 'Storage Used', value: '670GB / 1TB',    pct: 67, color: 'bg-amber-500' },
  ];
  billingHistory = [
    { month: 'Nov 2024', paid: 'Paid Nov 15', amount: '$399.00' },
    { month: 'Oct 2024', paid: 'Paid Oct 15', amount: '$399.00' },
    { month: 'Sep 2024', paid: 'Paid Sep 15', amount: '$399.00' },
  ];

  // ── Roles & Permissions ───────────────────────────────────
  permMatrix: PermRow[] = [
    { feature: 'Dashboard Access',   partner: 'check',   associate: 'check',   secretary: 'check',   paralegal: 'check' },
    { feature: 'Create Cases',       partner: 'check',   associate: 'check',   secretary: 'none',    paralegal: 'check' },
    { feature: 'Edit All Cases',     partner: 'check',   associate: 'partial', secretary: 'none',    paralegal: 'partial' },
    { feature: 'Delete Cases',       partner: 'check',   associate: 'none',    secretary: 'none',    paralegal: 'none' },
    { feature: 'Client Management',  partner: 'check',   associate: 'check',   secretary: 'check',   paralegal: 'check' },
    { feature: 'Document Upload',    partner: 'check',   associate: 'check',   secretary: 'check',   paralegal: 'check' },
    { feature: 'Billing & Invoices', partner: 'check',   associate: 'partial', secretary: 'none',    paralegal: 'none' },
    { feature: 'Financial Reports',  partner: 'check',   associate: 'none',    secretary: 'none',    paralegal: 'none' },
    { feature: 'AI Assistant',       partner: 'check',   associate: 'check',   secretary: 'partial', paralegal: 'check' },
    { feature: 'User Management',    partner: 'check',   associate: 'none',    secretary: 'none',    paralegal: 'none' },
    { feature: 'System Settings',    partner: 'check',   associate: 'none',    secretary: 'none',    paralegal: 'none' },
  ];
  permIcon(v: 'check'|'partial'|'none') {
    if (v === 'check')   return 'fa-solid fa-check-circle text-green-500';
    if (v === 'partial') return 'fa-solid fa-minus-circle text-amber-500';
    return 'fa-solid fa-times-circle text-red-500';
  }

  // ── Branding ─────────────────────────────────────────────
  primaryColor   = signal('#f59e0b');
  secondaryColor = signal('#1e293b');
  accentColor    = signal('#3b82f6');
  bgColor        = signal('#f9fafb');
  firmDisplayName = signal('Morrison & Associates');
  emailSignature  = signal('Morrison & Associates LLP\n1250 Broadway, Suite 2700\nNew York, NY 10001\n\nPhone: +1 (212) 555-0198\nEmail: contact@morrisonlaw.com\nwww.morrisonlaw.com');

  // ── Team Members ─────────────────────────────────────────
  teamMembers: TeamMember[] = [
    { avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', avatarBorder: 'border-green-500',  name: 'Sarah Williams', id: 'EMP-002', roleCls: 'bg-green-100 text-green-700',  roleLabel: 'Associate',      email: 's.williams@morrisonlaw.com', cases: '12', statusCls: 'bg-green-100 text-green-700',  statusLabel: 'Active',  lastActive: '30 mins ago' },
    { avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', avatarBorder: 'border-green-500',  name: 'Michael Chen',   id: 'EMP-003', roleCls: 'bg-blue-100 text-blue-700',    roleLabel: 'Senior Partner', email: 'm.chen@morrisonlaw.com',     cases: '6',  statusCls: 'bg-green-100 text-green-700',  statusLabel: 'Active',  lastActive: '1 hour ago' },
    { avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg', avatarBorder: 'border-green-500',  name: 'Jennifer Lopez', id: 'EMP-004', roleCls: 'bg-purple-100 text-purple-700',roleLabel: 'Secretary',      email: 'j.lopez@morrisonlaw.com',    cases: '-',  statusCls: 'bg-green-100 text-green-700',  statusLabel: 'Active',  lastActive: '3 hours ago' },
    { avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg', avatarBorder: 'border-amber-500',  name: 'Robert Taylor',  id: 'EMP-005', roleCls: 'bg-amber-100 text-amber-700',  roleLabel: 'Paralegal',      email: 'r.taylor@morrisonlaw.com',   cases: '5',  statusCls: 'bg-amber-100 text-amber-700',  statusLabel: 'Pending', lastActive: 'Yesterday' },
  ];

  // ── Notifications ─────────────────────────────────────────
  emailNotifs = [
    { label: 'New Case Assignments',  desc: 'When a new case is assigned to you',     checked: true },
    { label: 'Upcoming Hearings',     desc: 'Reminders for scheduled hearings',        checked: true },
    { label: 'Document Uploads',      desc: 'When documents are added to your cases', checked: true },
    { label: 'Payment Received',      desc: 'Invoice payment confirmations',          checked: false },
    { label: 'Client Messages',       desc: 'New messages from clients',              checked: true },
    { label: 'Task Assignments',      desc: 'When tasks are assigned to you',         checked: true },
    { label: 'Deadline Reminders',    desc: 'Approaching case deadlines',             checked: true },
    { label: 'Weekly Summary',        desc: 'Weekly digest of office activities',     checked: true },
  ];
  smsNotifs = [
    { label: 'Urgent Hearing Alerts', desc: 'Same-day hearing reminders',             checked: true },
    { label: 'Payment Overdue',       desc: 'Overdue invoice alerts',                 checked: true },
    { label: 'Client Emergency',      desc: 'Urgent client requests',                 checked: false },
  ];
  pushNotifs = [
    { label: 'System Updates',    desc: 'Platform updates and announcements', checked: false },
    { label: 'Team Mentions',     desc: 'When someone mentions you',          checked: true },
    { label: 'Case Status Change',desc: 'When case status is updated',        checked: true },
  ];
  toggleNotif(arr: {checked: boolean}[], i: number) { arr[i].checked = !arr[i].checked; }

  // ── Security ─────────────────────────────────────────────
  enforce2FA        = signal(true);
  sessionTimeout    = signal('30');
  ipWhitelistEnabled = signal(false);
  ipWhitelist       = signal('192.168.1.0/24\n10.0.0.0/8');
  passwordMinLength = signal('12');
  passwordRequireUppercase = signal(true);
  passwordRequireNumbers   = signal(true);
  passwordRequireSymbols   = signal(true);
  passwordExpiry    = signal('90');
  loginAttempts     = signal('5');
  auditLog          = signal(true);

  securityEvents = [
    { icon: 'fa-solid fa-right-to-bracket', iconBg: 'bg-green-100', iconColor: 'text-green-600', title: 'Successful Login', user: 'Sarah Williams', when: '2 min ago', ip: '192.168.1.45' },
    { icon: 'fa-solid fa-shield-halved',    iconBg: 'bg-blue-100',  iconColor: 'text-blue-600',  title: '2FA Verified',     user: 'Sarah Williams', when: '15 min ago', ip: '10.0.0.12' },
    { icon: 'fa-solid fa-triangle-exclamation', iconBg: 'bg-red-100', iconColor: 'text-red-600', title: 'Failed Login Attempt', user: 'Unknown',     when: '1 hour ago', ip: '203.0.113.42' },
    { icon: 'fa-solid fa-key',              iconBg: 'bg-amber-100', iconColor: 'text-amber-600', title: 'Password Changed', user: 'Michael Chen',   when: '3 hours ago', ip: '192.168.1.88' },
  ];

  // ── Integrations ─────────────────────────────────────────
  integrations = [
    {
      category: 'Calendar & Scheduling',
      items: [
        { icon: 'fa-brands fa-google',    iconBg: 'bg-red-100',    iconColor: 'text-red-600',    name: 'Google Calendar',    desc: 'Sync hearings, meetings and deadlines with Google Calendar', connected: true,  connectedAs: 'contact@morrisonlaw.com', statusCls: 'bg-green-100 text-green-700' },
        { icon: 'fa-solid fa-envelope',   iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   name: 'Microsoft Outlook',  desc: 'Sync calendar events and emails with Outlook / Office 365',  connected: false, connectedAs: '',                        statusCls: 'bg-gray-100 text-gray-600' },
      ]
    },
    {
      category: 'Messaging',
      items: [
        { icon: 'fa-brands fa-whatsapp', iconBg: 'bg-green-100',  iconColor: 'text-green-600',  name: 'WhatsApp Business',  desc: 'Send automated notifications and communicate with clients',  connected: true,  connectedAs: '+1 (212) 555-0198',        statusCls: 'bg-green-100 text-green-700' },
      ]
    },
    {
      category: 'Payments & Billing',
      items: [
        { icon: 'fa-brands fa-stripe',   iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', name: 'Stripe',             desc: 'Accept credit cards, ACH, and international payments',       connected: true,  connectedAs: 'acct_1234...abcd',         statusCls: 'bg-green-100 text-green-700' },
        { icon: 'fa-solid fa-money-bill-wave', iconBg: 'bg-teal-100', iconColor: 'text-teal-600', name: 'Sadad',            desc: 'Accept local payments via Sadad (Saudi Arabia)',              connected: false, connectedAs: '',                        statusCls: 'bg-gray-100 text-gray-600' },
      ]
    },
  ];

  // ── Storage ─────────────────────────────────────────────
  storagePlans = [
    { name: 'Starter',     size: '50 GB',   price: 'Included', current: false, color: 'bg-gray-100 text-gray-700' },
    { name: 'Professional',size: '500 GB',  price: '+$29/mo',  current: false, color: 'bg-blue-100 text-blue-700' },
    { name: 'Business',    size: '2 TB',    price: '+$79/mo',  current: true,  color: 'bg-amber-100 text-amber-700' },
    { name: 'Enterprise',  size: 'Custom',  price: 'Contact',  current: false, color: 'bg-purple-100 text-purple-700' },
  ];

  storageBreakdown = [
    { icon: 'fa-solid fa-file-pdf',   iconBg: 'bg-red-100',    iconColor: 'text-red-600',    label: 'Legal Documents', used: '312 GB', pct: 47, color: 'bg-red-500' },
    { icon: 'fa-solid fa-file-image', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', label: 'Evidence & Media',used: '187 GB', pct: 28, color: 'bg-purple-500' },
    { icon: 'fa-solid fa-file-word',  iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   label: 'Contracts',       used: '94 GB',  pct: 14, color: 'bg-blue-500' },
    { icon: 'fa-solid fa-folder',     iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  label: 'Other Files',     used: '77 GB',  pct: 11, color: 'bg-amber-500' },
  ];

  storageHistory = [
    { month: 'Nov 2024', used: '670 GB', change: '+18 GB', pct: 34 },
    { month: 'Oct 2024', used: '652 GB', change: '+24 GB', pct: 33 },
    { month: 'Sep 2024', used: '628 GB', change: '+31 GB', pct: 31 },
    { month: 'Aug 2024', used: '597 GB', change: '+12 GB', pct: 29 },
  ];
}