import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Linking,
} from 'react-native';
import { FontAwesome5, FontAwesome, Ionicons } from '@expo/vector-icons';
import { casesAPI } from '../../services/api';

import CaseDetailsScreen from './CaseDetailsScreen';

// ─── COULEURS ──────────────────────────────────────────────────────────────
const C = {
  primary: '#1E40AF', secondary: '#3B82F6', dark: '#1E293B',
  white: '#FFFFFF', gray50: '#F9FAFB', gray100: '#F3F4F6',
  gray200: '#E5E7EB', gray400: '#9CA3AF', gray500: '#6B7280',
  gray600: '#4B5563', gray700: '#374151',
  red50: '#FEF2F2', red100: '#FEE2E2', red500: '#EF4444', red600: '#DC2626',
  amber50: '#FFFBEB', amber100: '#FEF3C7', amber600: '#D97706',
  green50: '#F0FDF4', green100: '#DCFCE7', green600: '#16A34A',
  blue50: '#EFF6FF', blue100: '#DBEAFE', blue600: '#2563EB',
  purple50: '#FAF5FF', purple100: '#F3E8FF', purple600: '#9333EA',
  indigo50: '#EEF2FF', indigo100: '#E0E7FF', indigo600: '#4F46E5',
};

const Icon = ({ lib = 'FA5', name, size = 16, color = C.dark }) => {
  if (lib === 'FA5') return <FontAwesome5 name={name} size={size} color={color} />;
  if (lib === 'FA')  return <FontAwesome  name={name} size={size} color={color} />;
  if (lib === 'ION') return <Ionicons     name={name} size={size} color={color} />;
  return null;
};

// ─── DONNÉES ──────────────────────────────────────────────────────────────
const FILTER_TABS = [
  { label: 'All Cases (24)', icon: 'briefcase', active: true,  color: C.white,    bg: C.primary  },
  { label: 'Urgent (5)',     icon: 'fire',      active: false, color: C.red500,   bg: C.gray100  },
  { label: 'Pending (8)',    icon: 'clock',     active: false, color: C.amber600, bg: C.gray100  },
  { label: 'Closed (11)',    icon: 'check-circle', active: false, color: C.green600, bg: C.gray100 },
];

// ─── CASES avec les champs requis par CaseDetailsScreen ───────────────────
const CASES = [
  {
    id: 'CR-2024-1247', urgency: 'Urgent', urgencyIcon: 'fire',
    urgencyColor: C.red600, urgencyBg: C.red50, borderColor: C.red500,
    title: 'State vs. Johnson', subtitle: 'Criminal Defense - Assault Charges',
    tags: [{ label: 'Criminal Law', color: C.gray600, bg: C.gray100 }, { label: 'Trial Phase', color: C.purple600, bg: C.purple50 }],
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
    client: 'Marcus Johnson', clientSince: 'Jan 2024',
    contacts: [
      { lib: 'FA', name: 'whatsapp', bg: C.green50, color: C.green600 },
      { lib: 'FA5', name: 'phone', bg: C.blue50, color: C.primary },
    ],
    stats: [
      { label: 'Hearing', val: 'Today',  valColor: C.red600 },
      { label: 'Docs',    val: '23',     valColor: C.dark   },
      { label: 'Tasks',   val: '5',      valColor: C.amber600 },
      { label: 'Notes',   val: '12',     valColor: C.dark   },
    ],
    nextLabel: 'Next: Today 09:30 AM', calColor: C.red500,
    timeLeft: '3h left', timeLeftColor: C.red600, timeLeftBg: C.red50,
    // ── champs CaseDetailsScreen ──
    type: 'Criminal Law', phase: 'Trial Phase', priority: 'urgent',
    status: 'Active', filingDate: '2024-01-15',
    court: 'Manhattan Criminal Court', judge: 'Hon. Patricia Williams',
    prosecutor: 'DA Robert Chen', attorney: 'Sarah Williams - Lead Attorney',
    caseValue: '$45,000',
    description: 'Client is charged with assault in the second degree following an altercation at a local establishment. The prosecution alleges intentional harm, while the defense maintains self-defense. Key evidence includes surveillance footage and witness testimonies.',
    nextHearing: { label: 'Today', time: '09:30 AM', room: 'Room 305', countdown: '2h 47m' },
    clientData: {
      name: 'Marcus Johnson', id: 'CL-2024-089',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
      since: 'January 15, 2024', phone: '+1 (555) 234-5678',
      email: 'm.johnson@email.com', address: '742 Evergreen Terrace, Springfield',
      status: 'Active', tier: 'Verified',
    },
  },
  {
    id: 'CV-2024-0892', urgency: 'Medium', urgencyIcon: 'exclamation-triangle',
    urgencyColor: C.amber600, urgencyBg: C.amber50, borderColor: C.amber600,
    title: 'Mitchell Corp. Contract Dispute', subtitle: 'Corporate Law - Breach of Contract',
    tags: [{ label: 'Corporate Law', color: C.gray600, bg: C.gray100 }, { label: 'Discovery', color: C.blue600, bg: C.blue50 }],
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
    client: 'Sarah Mitchell', clientSince: 'Dec 2023',
    contacts: [
      { lib: 'FA5', name: 'envelope', bg: C.purple50, color: C.purple600 },
      { lib: 'FA5', name: 'phone', bg: C.blue50, color: C.primary },
    ],
    stats: [
      { label: 'Hearing', val: 'Mar 18', valColor: C.dark },
      { label: 'Docs',    val: '47',     valColor: C.dark },
      { label: 'Tasks',   val: '3',      valColor: C.amber600 },
      { label: 'Notes',   val: '8',      valColor: C.dark },
    ],
    nextLabel: 'Next: Mar 18, 11:00 AM', calColor: C.amber600,
    timeLeft: '2 days', timeLeftColor: C.amber600, timeLeftBg: C.amber50,
    type: 'Corporate Law', phase: 'Discovery', priority: 'medium',
    status: 'Active', filingDate: '2023-12-10',
    court: 'New York Civil Court', judge: 'Hon. James T. Murphy',
    prosecutor: 'Counsel: David Rivers', attorney: 'Michael Chen - Lead Attorney',
    caseValue: '$120,000',
    description: 'Mitchell Corporation disputes a contract amendment by their former vendor claiming breach of agreed terms. The case involves review of financial statements, email correspondence, and contractual obligations over a two-year period.',
    nextHearing: { label: 'Mar 18', time: '11:00 AM', room: 'Room 12', countdown: '2 days' },
    clientData: {
      name: 'Sarah Mitchell', id: 'CL-2023-512',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
      since: 'December 1, 2023', phone: '+1 (555) 987-6543',
      email: 's.mitchell@mitchellcorp.com', address: '1200 Fifth Avenue, New York',
      status: 'Active', tier: 'VIP',
    },
  },
  {
    id: 'FM-2024-0453', urgency: 'Normal', urgencyIcon: 'check',
    urgencyColor: C.green600, urgencyBg: C.green50, borderColor: C.green600,
    title: 'Chen Family Estate Planning', subtitle: 'Family Law - Estate Distribution',
    tags: [{ label: 'Family Law', color: C.gray600, bg: C.gray100 }, { label: 'Planning', color: C.green600, bg: C.green50 }],
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
    client: 'Robert Chen', clientSince: 'Nov 2023',
    contacts: [
      { lib: 'FA', name: 'whatsapp', bg: C.green50, color: C.green600 },
      { lib: 'FA5', name: 'phone', bg: C.blue50, color: C.primary },
    ],
    stats: [
      { label: 'Meeting', val: 'Mar 20', valColor: C.dark },
      { label: 'Docs',    val: '31',     valColor: C.dark },
      { label: 'Tasks',   val: '2',      valColor: C.green600 },
      { label: 'Notes',   val: '15',     valColor: C.dark },
    ],
    nextLabel: 'Next: Mar 20, 02:00 PM', calColor: C.green600,
    timeLeft: '4 days', timeLeftColor: C.green600, timeLeftBg: C.green50,
    type: 'Family Law', phase: 'Planning', priority: 'normal',
    status: 'Active', filingDate: '2023-11-20',
    court: 'Surrogate Court, NY', judge: 'Hon. Linda Park',
    prosecutor: 'N/A', attorney: 'Jennifer Davis - Lead Attorney',
    caseValue: '$320,000',
    description: 'Estate planning and distribution case for the Chen family following the passing of the patriarch. Involves reviewing existing wills, asset allocation, and potential disputes among beneficiaries.',
    nextHearing: null,
    clientData: {
      name: 'Robert Chen', id: 'CL-2023-498',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
      since: 'November 20, 2023', phone: '+1 (555) 456-7890',
      email: 'r.chen@email.com', address: '55 Riverside Dr, New York',
      status: 'Active', tier: 'Verified',
    },
  },
  {
    id: 'PI-2024-0678', urgency: 'Urgent', urgencyIcon: 'fire',
    urgencyColor: C.red600, urgencyBg: C.red50, borderColor: C.red500,
    title: 'Williams Personal Injury Claim', subtitle: 'Personal Injury - Car Accident',
    tags: [{ label: 'Personal Injury', color: C.gray600, bg: C.gray100 }, { label: 'Litigation', color: C.red600, bg: C.red50 }],
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
    client: 'Jennifer Williams', clientSince: 'Feb 2024',
    contacts: [
      { lib: 'FA', name: 'whatsapp', bg: C.green50, color: C.green600 },
      { lib: 'FA5', name: 'phone', bg: C.blue50, color: C.primary },
    ],
    stats: [
      { label: 'Hearing',   val: 'Tomorrow', valColor: C.red600 },
      { label: 'Docs',      val: '19',       valColor: C.dark   },
      { label: 'Tasks',     val: '7',        valColor: C.red600 },
      { label: 'Notes',     val: '6',        valColor: C.dark   },
    ],
    nextLabel: 'Next: Tomorrow 10:00 AM', calColor: C.red500,
    timeLeft: '1 day', timeLeftColor: C.red600, timeLeftBg: C.red50,
    type: 'Personal Injury', phase: 'Litigation', priority: 'urgent',
    status: 'Active', filingDate: '2024-02-01',
    court: 'Queens Civil Court', judge: 'Hon. Antonio Rivera',
    prosecutor: 'Opposing: Clark & Assoc.', attorney: 'Sarah Williams - Lead Attorney',
    caseValue: '$85,000',
    description: 'Jennifer Williams suffered significant injuries in a car accident caused by a distracted driver. The case involves medical reports, accident reconstruction, and negotiation with the insurance company for fair compensation.',
    nextHearing: { label: 'Tomorrow', time: '10:00 AM', room: 'Room 8', countdown: '1 day' },
    clientData: {
      name: 'Jennifer Williams', id: 'CL-2024-201',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
      since: 'February 1, 2024', phone: '+1 (555) 321-6549',
      email: 'j.williams@email.com', address: '88 Queens Blvd, Queens, NY',
      status: 'Active', tier: 'Standard',
    },
  },
  {
    id: 'RE-2024-0234', urgency: 'Normal', urgencyIcon: 'info-circle',
    urgencyColor: C.blue600, urgencyBg: C.blue50, borderColor: C.secondary,
    title: 'Thompson Real Estate Transaction', subtitle: 'Real Estate - Property Sale',
    tags: [{ label: 'Real Estate', color: C.gray600, bg: C.gray100 }, { label: 'Closing', color: C.blue600, bg: C.blue50 }],
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg',
    client: 'Michael Thompson', clientSince: 'Jan 2024',
    contacts: [
      { lib: 'FA5', name: 'envelope', bg: C.purple50, color: C.purple600 },
      { lib: 'FA5', name: 'phone', bg: C.blue50, color: C.primary },
    ],
    stats: [
      { label: 'Closing', val: 'Mar 22', valColor: C.dark },
      { label: 'Docs',    val: '38',     valColor: C.dark },
      { label: 'Tasks',   val: '4',      valColor: C.blue600 },
      { label: 'Notes',   val: '9',      valColor: C.dark },
    ],
    nextLabel: 'Next: Mar 22, 03:00 PM', calColor: C.secondary,
    timeLeft: '6 days', timeLeftColor: C.blue600, timeLeftBg: C.blue50,
    type: 'Real Estate', phase: 'Closing', priority: 'normal',
    status: 'Active', filingDate: '2024-01-10',
    court: 'N/A', judge: 'N/A',
    prosecutor: 'Opposing: Barker Law Group', attorney: 'Michael Chen - Lead Attorney',
    caseValue: '$1,200,000',
    description: 'Michael Thompson is selling his Manhattan property and requires legal assistance with contract drafting, title searches, and closing procedures. The transaction involves multiple parties and requires careful coordination.',
    nextHearing: null,
    clientData: {
      name: 'Michael Thompson', id: 'CL-2024-178',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg',
      since: 'January 10, 2024', phone: '+1 (555) 654-3210',
      email: 'm.thompson@email.com', address: '420 Park Avenue, Manhattan',
      status: 'Active', tier: 'VIP',
    },
  },
  {
    id: 'IP-2024-0567', urgency: 'Normal', urgencyIcon: 'star',
    urgencyColor: C.purple600, urgencyBg: C.purple50, borderColor: C.purple600,
    title: 'Anderson IP Protection', subtitle: 'Intellectual Property - Trademark',
    tags: [{ label: 'IP Law', color: C.gray600, bg: C.gray100 }, { label: 'Filing', color: C.purple600, bg: C.purple50 }],
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg',
    client: 'Lisa Anderson', clientSince: 'Mar 2024',
    contacts: [
      { lib: 'FA', name: 'whatsapp', bg: C.green50, color: C.green600 },
      { lib: 'FA5', name: 'envelope', bg: C.purple50, color: C.purple600 },
    ],
    stats: [
      { label: 'Filing', val: 'Mar 25', valColor: C.dark   },
      { label: 'Docs',   val: '15',     valColor: C.dark   },
      { label: 'Tasks',  val: '3',      valColor: C.purple600 },
      { label: 'Notes',  val: '5',      valColor: C.dark   },
    ],
    nextLabel: 'Next: Mar 25, 01:00 PM', calColor: C.purple600,
    timeLeft: '9 days', timeLeftColor: C.purple600, timeLeftBg: C.purple50,
    type: 'IP Law', phase: 'Filing', priority: 'normal',
    status: 'Active', filingDate: '2024-03-01',
    court: 'USPTO', judge: 'N/A',
    prosecutor: 'N/A', attorney: 'Jennifer Davis - Lead Attorney',
    caseValue: '$25,000',
    description: 'Lisa Anderson seeks trademark protection for her tech startup brand. The filing process involves trademark search, application preparation, and response to any USPTO office actions.',
    nextHearing: null,
    clientData: {
      name: 'Lisa Anderson', id: 'CL-2024-305',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg',
      since: 'March 1, 2024', phone: '+1 (555) 789-0123',
      email: 'l.anderson@startup.io', address: '200 Tech Hub, Brooklyn, NY',
      status: 'Active', tier: 'Standard',
    },
  },
  {
    id: 'EM-2024-0345', urgency: 'Medium', urgencyIcon: 'exclamation-triangle',
    urgencyColor: C.amber600, urgencyBg: C.amber50, borderColor: C.amber600,
    title: 'Davis Employment Dispute', subtitle: 'Employment Law - Wrongful Termination',
    tags: [{ label: 'Employment Law', color: C.gray600, bg: C.gray100 }, { label: 'Mediation', color: C.amber600, bg: C.amber50 }],
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
    client: 'Thomas Davis', clientSince: 'Feb 2024',
    contacts: [
      { lib: 'FA5', name: 'phone', bg: C.blue50, color: C.primary },
      { lib: 'FA5', name: 'envelope', bg: C.purple50, color: C.purple600 },
    ],
    stats: [
      { label: 'Mediation', val: 'Mar 19', valColor: C.dark },
      { label: 'Docs',      val: '26',     valColor: C.dark },
      { label: 'Tasks',     val: '4',      valColor: C.amber600 },
      { label: 'Notes',     val: '11',     valColor: C.dark },
    ],
    nextLabel: 'Next: Mar 19, 02:30 PM', calColor: C.amber600,
    timeLeft: '3 days', timeLeftColor: C.amber600, timeLeftBg: C.amber50,
    type: 'Employment Law', phase: 'Mediation', priority: 'medium',
    status: 'Active', filingDate: '2024-02-15',
    court: 'NLRB', judge: 'Mediator J. Collins',
    prosecutor: 'Employer: Global Inc. Legal', attorney: 'Michael Chen - Lead Attorney',
    caseValue: '$65,000',
    description: 'Thomas Davis was wrongfully terminated following a whistleblower complaint. The case involves reviewing termination documentation, communications, and preparing for mediation with the employer.',
    nextHearing: { label: 'Mar 19', time: '02:30 PM', room: 'Mediation Room B', countdown: '3 days' },
    clientData: {
      name: 'Thomas Davis', id: 'CL-2024-245',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
      since: 'February 15, 2024', phone: '+1 (555) 234-9876',
      email: 't.davis@email.com', address: '34 Midtown Ave, New York',
      status: 'Active', tier: 'Standard',
    },
  },
  {
    id: 'DV-2024-0123', urgency: 'Normal', urgencyIcon: 'check',
    urgencyColor: C.green600, urgencyBg: C.green50, borderColor: C.green600,
    title: 'Martinez Divorce Settlement', subtitle: 'Family Law - Divorce Proceedings',
    tags: [{ label: 'Family Law', color: C.gray600, bg: C.gray100 }, { label: 'Settlement', color: C.green600, bg: C.green50 }],
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
    client: 'Maria Martinez', clientSince: 'Dec 2023',
    contacts: [
      { lib: 'FA', name: 'whatsapp', bg: C.green50, color: C.green600 },
      { lib: 'FA5', name: 'phone', bg: C.blue50, color: C.primary },
    ],
    stats: [
      { label: 'Meeting', val: 'Mar 21', valColor: C.dark },
      { label: 'Docs',    val: '42',     valColor: C.dark },
      { label: 'Tasks',   val: '2',      valColor: C.green600 },
      { label: 'Notes',   val: '18',     valColor: C.dark },
    ],
    nextLabel: 'Next: Mar 21, 10:00 AM', calColor: C.green600,
    timeLeft: '5 days', timeLeftColor: C.green600, timeLeftBg: C.green50,
    type: 'Family Law', phase: 'Settlement', priority: 'normal',
    status: 'Active', filingDate: '2023-12-05',
    court: 'Family Court, NY', judge: 'Hon. Carol Burns',
    prosecutor: 'Opposing: Carter & Sons', attorney: 'Sarah Williams - Lead Attorney',
    caseValue: '$210,000',
    description: 'Divorce proceedings for Maria Martinez involving asset distribution, child custody arrangements, and spousal support. Both parties are working toward an amicable settlement to avoid prolonged litigation.',
    nextHearing: null,
    clientData: {
      name: 'Maria Martinez', id: 'CL-2023-488',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
      since: 'December 5, 2023', phone: '+1 (555) 111-2233',
      email: 'm.martinez@email.com', address: '19 Sunset Blvd, Brooklyn',
      status: 'Active', tier: 'Verified',
    },
  },
];

const CASE_TYPES = [
  { color: C.red500,    label: 'Criminal Law',  count: '8 cases', pct: '33%' },
  { color: C.secondary, label: 'Corporate Law', count: '6 cases', pct: '25%' },
  { color: C.green600,  label: 'Family Law',    count: '5 cases', pct: '21%' },
  { color: C.purple600, label: 'Other',         count: '5 cases', pct: '21%' },
];

const QUICK_FILTERS = [
  { iconLib: 'FA5', iconName: 'fire',           iconColor: C.red600,    iconBg: C.red100,    title: 'Urgent Cases',  sub: 'Due soon',      count: '5', primary: true  },
  { iconLib: 'FA5', iconName: 'gavel',          iconColor: C.primary,   iconBg: C.blue100,   title: 'In Court',      sub: 'Active trials', count: '7', primary: false },
  { iconLib: 'FA5', iconName: 'handshake',      iconColor: C.purple600, iconBg: C.purple100, title: 'Mediation',     sub: 'In progress',   count: '3', primary: false },
  { iconLib: 'FA5', iconName: 'file-signature', iconColor: C.green600,  iconBg: C.green100,  title: 'Awaiting Sign', sub: 'Documents',     count: '4', primary: false },
];

const ACTIVITY = [
  { iconLib: 'FA5', iconName: 'file-alt',       iconColor: C.primary,   iconBg: C.blue100,   title: 'Document uploaded to case', desc: 'Motion to Dismiss added to State vs. Johnson',   time: '2 hours ago', tag: 'CR-2024-1247', tagColor: C.primary,   tagBg: C.blue50   },
  { iconLib: 'FA5', iconName: 'user-plus',      iconColor: C.green600,  iconBg: C.green100,  title: 'New case created',          desc: 'Anderson IP Protection case opened',             time: '5 hours ago', tag: 'IP-2024-0567', tagColor: C.purple600, tagBg: C.purple50 },
  { iconLib: 'FA5', iconName: 'calendar-check', iconColor: C.purple600, iconBg: C.purple100, title: 'Hearing scheduled',         desc: 'Court date set for Williams Personal Injury',    time: 'Yesterday',   tag: 'PI-2024-0678', tagColor: C.red600,   tagBg: C.red50    },
  { iconLib: 'FA5', iconName: 'tasks',          iconColor: C.amber600,  iconBg: C.amber100,  title: 'Task completed',            desc: 'Contract review finalized for Mitchell Corp.',   time: 'Yesterday',   tag: 'CV-2024-0892', tagColor: C.amber600, tagBg: C.amber50  },
];

const AI_INSIGHTS = [
  { iconBg: C.red500,   icon: 'exclamation', title: 'Urgent Deadline Alert',  desc: 'Motion filing due in 3 hours for CR-2024-1247', btn: 'View Case'   },
  { iconBg: C.amber600, icon: 'lightbulb',   title: 'Document Missing',       desc: '3 cases need additional documentation',         btn: 'Review'      },
  { iconBg: C.green600, icon: 'chart-line',  title: 'Case Trend Analysis',    desc: 'Similar cases show 92% success rate',           btn: 'See Details' },
];

const DEADLINES = [
  { iconLib: 'FA5', iconName: 'exclamation-triangle', iconColor: C.red600,   title: 'Motion Filing',   subtitle: 'State vs. Johnson (CR-2024-1247)',        badge: 'Today',    badgeColor: C.white, badgeBg: C.red600,   time: '3 hours remaining', timeColor: C.red600,   border: C.red500,    btnBg: C.red600   },
  { iconLib: 'FA5', iconName: 'file-signature',        iconColor: C.amber600, title: 'Contract Review', subtitle: 'Mitchell Corp. (CV-2024-0892)',            badge: 'Tomorrow', badgeColor: C.white, badgeBg: C.amber600, time: '1 day remaining',   timeColor: C.amber600, border: C.amber600,  btnBg: C.amber600 },
  { iconLib: 'FA5', iconName: 'gavel',                 iconColor: C.blue600,  title: 'Court Hearing',   subtitle: 'Williams Personal Injury (PI-2024-0678)', badge: 'Mar 18',   badgeColor: C.white, badgeBg: C.blue600,  time: '2 days remaining',  timeColor: C.blue600,  border: C.secondary, btnBg: C.blue600  },
];

const BULK_ACTIONS = [
  { iconLib: 'FA5', iconName: 'file-export', label: 'Export',  color: C.primary,   bg: C.blue50   },
  { iconLib: 'FA5', iconName: 'tags',        label: 'Tag',     color: C.purple600, bg: C.purple50 },
  { iconLib: 'FA5', iconName: 'archive',     label: 'Archive', color: C.green600,  bg: C.green50  },
  { iconLib: 'FA5', iconName: 'share-alt',   label: 'Share',   color: C.amber600,  bg: C.amber50  },
];

// ─── helper : convertit un case de la liste vers le format CaseDetailsScreen ─
const toCaseDetails = (c) => ({
  id:          c.id,
  title:       c.title,
  subtitle:    c.subtitle,
  type:        c.type,
  phase:       c.phase,
  priority:    c.priority,
  status:      c.status,
  filingDate:  c.filingDate,
  court:       c.court,
  judge:       c.judge,
  prosecutor:  c.prosecutor,
  attorney:    c.attorney,
  caseValue:   c.caseValue,
  description: c.description,
  tags:        c.tags.map(t => t.label),
  nextHearing: c.nextHearing,
  stats:       {
    docs:   parseInt(c.stats.find(s => s.label === 'Docs')?.val  || '0'),
    tasks:  parseInt(c.stats.find(s => s.label === 'Tasks')?.val || '0'),
    events: 3,
    notes:  parseInt(c.stats.find(s => s.label === 'Notes')?.val || '0'),
  },
  timeTracking: { billable: 47.5, nonBillable: 12.3 },
  client: c.clientData,
  events: [
    { id:1, icon:'gavel',          color:'#DC2626', bg:'#FEF2F2', title:'Court Hearing',     desc:'Scheduled hearing',     dateLabel: c.nextHearing?.label || 'TBD', time: c.nextHearing?.time || 'TBD', urgent: c.priority === 'urgent' },
    { id:2, icon:'users',          color:'#1E40AF', bg:'#EFF6FF', title:'Client Meeting',    desc:'Strategy discussion',   dateLabel:'Tomorrow', time:'02:00 PM', urgent:false },
    { id:3, icon:'file-signature', color:'#9333EA', bg:'#FAF5FF', title:'Document Deadline', desc:'Motion filing due',     dateLabel:'Mar 19',   time:'05:00 PM', urgent:false },
  ],
  documents: [
    { id:1, icon:'file-pdf',   iconColor:'#fff', iconBg:'#DC2626', name:'Motion to Dismiss.pdf',  size:'2.4 MB', date:'2 hours ago', priority:true  },
    { id:2, icon:'file-word',  iconColor:'#fff', iconBg:'#1E40AF', name:'Case Summary.docx',      size:'1.8 MB', date:'Yesterday',   priority:false },
    { id:3, icon:'file-excel', iconColor:'#fff', iconBg:'#16A34A', name:'Evidence Log.xlsx',      size:'856 KB', date:'3 days ago',  priority:false },
    { id:4, icon:'file-alt',   iconColor:'#fff', iconBg:'#9333EA', name:'Witness Statements.pdf', size:'3.1 MB', date:'5 days ago',  priority:false },
  ],
  tasks: [
    { id:1, title:'File Motion to Dismiss',    due:'Due Today 5:00 PM',    dueColor:'#DC2626', priority:'urgent', assignee:'Lead Attorney', done:false },
    { id:2, title:'Review Evidence Documents', due:'Due Tomorrow 3:00 PM', dueColor:'#D97706', priority:'medium', assignee:'Associate',     done:false },
    { id:3, title:'Prepare Witness List',      due:'Due Mar 18',           dueColor:'#1E40AF', priority:'normal', assignee:'Paralegal',      done:false },
    { id:4, title:'Draft Opening Statement',   due:'Completed',            dueColor:'#16A34A', priority:'normal', assignee:'Lead Attorney', done:true  },
  ],
  timeline: [
    { id:1, icon:'gavel',    color:'#fff', bg:'#DC2626', title:'Court Hearing Scheduled',  desc:'Scheduled hearing — assigned courtroom',           time:'Upcoming',  badge:'Hearing',  badgeColor:'#DC2626', badgeBg:'#FEF2F2' },
    { id:2, icon:'file-alt', color:'#fff', bg:'#1E40AF', title:'Motion to Dismiss Filed',  desc:'Defense motion filed with supporting documentation',time:'2 hrs ago', badge:'Document', badgeColor:'#1E40AF', badgeBg:'#EFF6FF' },
    { id:3, icon:'users',    color:'#fff', bg:'#A855F7', title:'Client Meeting Completed', desc:'Strategy discussion and case review',               time:'Yesterday', badge:'Meeting',  badgeColor:'#9333EA', badgeBg:'#FAF5FF' },
    { id:4, icon:'check',    color:'#fff', bg:'#16A34A', title:'Evidence Review Done',     desc:'All prosecution evidence reviewed and analyzed',    time:'2 days ago',badge:'Task',    badgeColor:'#16A34A', badgeBg:'#F0FDF4' },
    { id:5, icon:'user-tie', color:'#fff', bg:'#D97706', title:'Expert Witness Deposition',desc:'Expert provided testimony on key evidence',         time:'3 days ago',badge:'Event',   badgeColor:'#D97706', badgeBg:'#FFFBEB' },
  ],
  notes: [
    { id:1, author:'Lead Attorney',  avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', title:'Client Meeting Summary',    content:'Discussed case strategy and upcoming deadlines. Client is cooperative and prepared for all proceedings.', time:'2 hours ago', borderColor:'#D97706', bg:'#FFFBEB' },
    { id:2, author:'Associate',      avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', title:'Evidence Analysis Notes',   content:'Evidence reviewed. Key findings documented. Potential procedural issues identified for further analysis.', time:'Yesterday',  borderColor:'#1E40AF', bg:'#EFF6FF' },
    { id:3, author:'Research Team',  avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg', title:'Legal Research Summary',    content:'Relevant case precedents identified. Strong support for defense arguments based on recent rulings.',         time:'2 days ago', borderColor:'#9333EA', bg:'#FAF5FF' },
  ],
});

// ─── COMPOSANTS ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, action }) => (
  <View style={s.sectionHeader}>
    <Text style={s.sectionTitle}>{title}</Text>
    {action && <TouchableOpacity><Text style={s.sectionAction}>{action}</Text></TouchableOpacity>}
  </View>
);

const CaseCard = ({ item, onViewDetails }) => (
  <View style={[s.card, { borderLeftWidth: 4, borderLeftColor: item.borderColor }]}>
    {/* Header */}
    <View style={[s.row, { justifyContent: 'space-between', marginBottom: 8 }]}>
      <View style={s.row}>
        <View style={s.caseIdBadge}><Text style={s.caseIdText}>{item.id}</Text></View>
        <View style={[s.tag, { backgroundColor: item.urgencyBg, marginLeft: 6 }]}>
          <View style={s.row}>
            <Icon lib="FA5" name={item.urgencyIcon} size={10} color={item.urgencyColor} />
            <Text style={[s.tagText, { color: item.urgencyColor, marginLeft: 4 }]}>{item.urgency}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity><Icon lib="FA5" name="ellipsis-v" size={16} color={C.gray400} /></TouchableOpacity>
    </View>
    <Text style={s.cardTitle}>{item.title}</Text>
    <Text style={[s.cardSubtitle, { marginBottom: 8 }]}>{item.subtitle}</Text>
    <View style={[s.row, { marginBottom: 12, flexWrap: 'wrap', gap: 6 }]}>
      {item.tags.map((t, i) => (
        <View key={i} style={[s.tag, { backgroundColor: t.bg }]}>
          <Text style={[s.tagText, { color: t.color }]}>{t.label}</Text>
        </View>
      ))}
    </View>

    {/* Client row */}
    <View style={[s.row, { justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.gray100 }]}>
      <View style={s.row}>
        <View style={[s.avatarMd, { backgroundColor: C.blue100, alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: C.primary }}>
            {item.client.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </Text>
        </View>
        <View style={{ marginLeft: 10 }}>
          <Text style={s.clientName}>{item.client}</Text>
          <Text style={s.clientSince}>Since: {item.clientSince}</Text>
        </View>
      </View>
      <View style={s.row}>
        {item.contacts.map((c, i) => (
          <TouchableOpacity
            key={i}
            style={[s.iconBtn, { backgroundColor: c.bg, marginLeft: 6 }]}
            onPress={() => c.action && Linking.openURL(c.action)}
          >
            <Icon lib={c.lib} name={c.name} size={14} color={c.color} />
          </TouchableOpacity>
        ))}
      </View>
    </View>

    {/* Stats row */}
    <View style={[s.row, { justifyContent: 'space-around', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.gray100 }]}>
      {item.stats.map((st, i) => (
        <View key={i} style={{ alignItems: 'center' }}>
          <Text style={s.statLabel}>{st.label}</Text>
          <Text style={[s.statVal, { color: st.valColor }]}>{st.val}</Text>
        </View>
      ))}
    </View>

    {/* Next event */}
    <View style={[s.row, { justifyContent: 'space-between', marginBottom: 12 }]}>
      <View style={s.row}>
        <Icon lib="FA5" name="calendar" size={12} color={item.calColor} />
        <Text style={[s.xs, { marginLeft: 6 }]}>{item.nextLabel}</Text>
      </View>
      <View style={[s.tag, { backgroundColor: item.timeLeftBg }]}>
        <View style={s.row}>
          <Icon lib="FA5" name="clock" size={10} color={item.timeLeftColor} />
          <Text style={[s.tagText, { color: item.timeLeftColor, marginLeft: 4 }]}>{item.timeLeft}</Text>
        </View>
      </View>
    </View>

    {/* Actions — View Details navigue vers CaseDetailsScreen */}
    <View style={s.row}>
      <TouchableOpacity style={s.btnPrimary} onPress={() => onViewDetails(item)}>
        <Icon lib="FA5" name="eye" size={14} color={C.white} />
        <Text style={[s.btnPrimaryText, { marginLeft: 6 }]}>View Details</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.iconBtn, { backgroundColor: C.blue50, marginLeft: 8, width: 44, height: 44 }]}>
        <Icon lib="FA5" name="robot" size={16} color={C.primary} />
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Priority → visual meta ───────────────────────────────────────────────
const PRIORITY_META = {
  URGENT: { urgency: 'Urgent', urgencyIcon: 'fire',                  urgencyColor: C.red600,    urgencyBg: C.red50,    borderColor: C.red500    },
  HIGH:   { urgency: 'High',   urgencyIcon: 'exclamation-triangle',  urgencyColor: C.amber600,  urgencyBg: C.amber50,  borderColor: C.amber600  },
  MEDIUM: { urgency: 'Medium', urgencyIcon: 'exclamation-triangle',  urgencyColor: C.amber600,  urgencyBg: C.amber50,  borderColor: C.amber600  },
  NORMAL: { urgency: 'Normal', urgencyIcon: 'check',                 urgencyColor: C.green600,  urgencyBg: C.green50,  borderColor: C.green600  },
  LOW:    { urgency: 'Low',    urgencyIcon: 'info-circle',           urgencyColor: C.blue600,   urgencyBg: C.blue50,   borderColor: C.secondary },
};

// ─── CaseType → label ─────────────────────────────────────────────────────
const TYPE_LABEL = {
  CRIMINAL:        'Criminal Law',
  CIVIL:           'Civil Law',
  CORPORATE:       'Corporate Law',
  FAMILY:          'Family Law',
  REAL_ESTATE:     'Real Estate',
  IMMIGRATION:     'Immigration',
  PERSONAL_INJURY: 'Personal Injury',
  IP:              'IP Law',
  LABOR:           'Labor Law',
  TAX:             'Tax Law',
  ADMINISTRATIVE:  'Administrative',
  CONSTITUTIONAL:  'Constitutional',
  ENVIRONMENTAL:   'Environmental',
  BANKING:         'Banking & Finance',
  MEDICAL:         'Medical Law',
  COMMERCIAL:      'Commercial Law',
  ARBITRATION:     'Arbitration',
  INTERNATIONAL:   'International Law',
  INHERITANCE:     'Inheritance',
  INSURANCE:       'Insurance',
};

// ─── Filter config ─────────────────────────────────────────────────────────
const FILTER_CONFIG = [
  { key: 'all',    label: 'All Cases',  icon: 'briefcase',    filter: () => true },
  { key: 'urgent', label: 'Urgent',     icon: 'fire',         filter: c => ['URGENT','HIGH'].includes((c.priority || '').toUpperCase()) },
  { key: 'active', label: 'Active',     icon: 'clock',        filter: c => ['NEW','INVESTIGATION','PRE_TRIAL','TRIAL','APPEAL'].includes((c.status || '').toUpperCase()) },
  { key: 'closed', label: 'Closed',     icon: 'check-circle', filter: c => ['SETTLED','CLOSED'].includes((c.status || '').toUpperCase()) },
];

// ─── Map API case → CaseCard format ──────────────────────────────────────
const toCardFormat = (c) => {
  const pm          = PRIORITY_META[c.priority]  || PRIORITY_META.NORMAL;
  const typeLabel   = TYPE_LABEL[c.case_type]    || c.case_type;
  const clientName  = c.client
    ? `${c.client.first_name ?? ''} ${c.client.last_name ?? ''}`.trim()
    : 'No Client';
  const filingLabel = c.filing_date
    ? new Date(c.filing_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—';
  const hearingLabel = c.first_hearing_date
    ? new Date(c.first_hearing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return {
    _raw:         c,
    id:           c.case_number,
    ...pm,
    title:        c.title,
    subtitle:     `${typeLabel} — ${c.status.replace('_', ' ')}`,
    tags: [
      { label: typeLabel,                        color: C.gray600, bg: C.gray100 },
      { label: c.status.replace(/_/g, ' '),      color: C.blue600, bg: C.blue50  },
    ],
    avatar:       null,
    client:       clientName,
    clientSince:  filingLabel,
    contacts: [
      ...(c.client?.email ? [{ lib: 'FA5', name: 'envelope', bg: C.purple50, color: C.purple600, action: `mailto:${c.client.email}` }] : []),
      ...(c.client?.phone ? [{ lib: 'FA5', name: 'phone',    bg: C.blue50,   color: C.primary,   action: `tel:${c.client.phone}`   }] : [{ lib: 'FA5', name: 'phone', bg: C.blue50, color: C.primary, action: null }]),
    ],
    stats: [
      { label: 'Status',   val: c.status.replace(/_/g, ' '), valColor: C.dark            },
      { label: 'Priority', val: pm.urgency,                  valColor: pm.urgencyColor    },
      { label: 'Type',     val: typeLabel.split(' ')[0],     valColor: C.dark             },
      { label: 'Filed',    val: filingLabel,                  valColor: C.dark            },
    ],
    nextLabel:      hearingLabel ? `Hearing: ${hearingLabel}` : 'No hearing scheduled',
    calColor:       hearingLabel ? C.primary  : C.gray400,
    timeLeft:       hearingLabel ? 'Upcoming' : '—',
    timeLeftColor:  hearingLabel ? C.primary  : C.gray400,
    timeLeftBg:     hearingLabel ? C.blue50   : C.gray50,
    // ── CaseDetailsScreen fields ──
    type:           typeLabel,
    phase:          c.status.replace(/_/g, ' '),
    priority:       (c.priority || 'NORMAL').toLowerCase(),
    status:         c.status,
    filingDate:     c.filing_date || '',
    court:          c.court_name       || '—',
    judge:          c.judge_name       || '—',
    prosecutor:     c.opposing_counsel || '—',
    attorney:       '—',
    caseValue:      c.estimated_value  ? `$${Number(c.estimated_value).toLocaleString()}` : '—',
    description:    c.description || '',
    nextHearing:    hearingLabel
      ? { label: hearingLabel, time: '—', room: '—', countdown: '—' }
      : null,
    clientData: {
      name:    clientName,
      id:      c.client?.id    || '—',
      avatar:  null,
      since:   filingLabel,
      phone:   c.client?.phone || '—',
      email:   c.client?.email || '—',
      address: c.client?.address || '—',
      status:  'Active',
      tier:    'Standard',
    },
  };
};

// ─── ÉCRAN ─────────────────────────────────────────────────────────────────
export default function CaseManagement({ navigation }) {
  const [selectedCase,     setSelectedCase]     = useState(null);
  const [cases,            setCases]            = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [searchText,       setSearchText]       = useState('');
  const [activeFilter,     setActiveFilter]     = useState('all');
  const [typeFilter,       setTypeFilter]       = useState(null);   // e.g. 'CRIMINAL'
  const [sortOrder,        setSortOrder]        = useState('newest');
  const [showFilterPanel,  setShowFilterPanel]  = useState(false);
  const [showSortPanel,    setShowSortPanel]    = useState(false);

  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      const data = await casesAPI.list();
      setCases(Array.isArray(data) ? data : []);
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCases(); }, [loadCases]);

  // ── Count per type (for filter panel badges) ─────────────────────────
  const typeCountMap2 = {};
  cases.forEach(c => {
    const key = (c.case_type || '').toUpperCase();
    if (key) typeCountMap2[key] = (typeCountMap2[key] || 0) + 1;
  });
  // All known types; put types with cases first, then the rest alphabetically
  const allTypeKeys = Object.keys(TYPE_LABEL).sort((a, b) => {
    const ca = typeCountMap2[a] || 0;
    const cb = typeCountMap2[b] || 0;
    if (cb !== ca) return cb - ca;
    return TYPE_LABEL[a].localeCompare(TYPE_LABEL[b]);
  });

  // ── Filtered + searched + sorted cases ───────────────────────────────
  const filterFn = FILTER_CONFIG.find(f => f.key === activeFilter)?.filter ?? (() => true);
  const displayCases = cases
    .filter(filterFn)
    .filter(c => !typeFilter || (c.case_type || '').toUpperCase() === typeFilter)
    .filter(c => {
      if (!searchText.trim()) return true;
      const q = searchText.toLowerCase();
      const clientName = c.client
        ? `${c.client.first_name} ${c.client.last_name}`.toLowerCase()
        : '';
      return (
        c.title?.toLowerCase().includes(q) ||
        c.case_number?.toLowerCase().includes(q) ||
        clientName.includes(q)
      );
    })
    .sort((a, b) => {
      if (sortOrder === 'oldest') return new Date(a.filing_date || 0) - new Date(b.filing_date || 0);
      if (sortOrder === 'az')     return (a.title || '').localeCompare(b.title || '');
      if (sortOrder === 'za')     return (b.title || '').localeCompare(a.title || '');
      return new Date(b.filing_date || 0) - new Date(a.filing_date || 0); // newest
    })
    .map(toCardFormat);

  // ── Tab counts ────────────────────────────────────────────────────────
  const tabCounts = {
    all:    cases.length,
    urgent: cases.filter(FILTER_CONFIG[1].filter).length,
    active: cases.filter(FILTER_CONFIG[2].filter).length,
    closed: cases.filter(FILTER_CONFIG[3].filter).length,
  };

  // ── Dynamic statistics ────────────────────────────────────────────────
  const TYPE_COLORS = [C.red500, C.secondary, C.green600, C.purple600, C.amber600];
  const typeCountMap = {};
  cases.forEach(c => {
    const label = TYPE_LABEL[(c.case_type || '').toUpperCase()] || c.case_type || 'Other';
    typeCountMap[label] = (typeCountMap[label] || 0) + 1;
  });
  const total = cases.length || 1;
  const dynamicCaseTypes = Object.entries(typeCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count], i) => ({
      color: TYPE_COLORS[i % TYPE_COLORS.length],
      label,
      count: `${count} case${count !== 1 ? 's' : ''}`,
      pct:   `${Math.round(count / total * 100)}%`,
    }));
  const urgentCount = tabCounts.urgent;
  const closedCount = tabCounts.closed;

  // Si un case est sélectionné, on affiche CaseDetailsScreen
  if (selectedCase) {
    return (
      <CaseDetailsScreen
        navigation={{ goBack: () => setSelectedCase(null) }}
        route={{ params: { caseData: selectedCase } }}
      />
    );
  }

  const handleViewDetails = (cardItem) => {
    setSelectedCase(toCaseDetails(cardItem));
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* HEADER */}
      <View style={s.header}>
        <View style={[s.row, { justifyContent: 'space-between', marginBottom: 16 }]}>
          <View style={s.row}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()}>
              <Icon lib="FA5" name="arrow-left" size={18} color={C.white} />
            </TouchableOpacity>
            <View style={{ marginLeft: 12 }}>
              <Text style={s.headerTitle}>Case Management</Text>
              <Text style={s.headerSub}>{cases.length} Case{cases.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[s.backBtn, { backgroundColor: 'rgba(255,255,255,0.25)' }]}
            onPress={() => navigation?.navigate?.('AddCase', { onCreated: loadCases })}
          >
            <Icon lib="FA5" name="plus" size={18} color={C.white} />
          </TouchableOpacity>
        </View>
        <View style={s.searchWrap}>
          <Icon lib="ION" name="search-outline" size={18} color="rgba(255,255,255,0.7)" />
          <TextInput
            style={s.searchInput}
            placeholder="Search by case number, client name..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon lib="ION" name="close-circle" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>

        {/* FILTER TABS */}
        <View style={s.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {FILTER_CONFIG.map(t => {
              const isActive = activeFilter === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[s.filterTab, { backgroundColor: isActive ? C.primary : C.gray100, marginRight: 8 }]}
                  onPress={() => setActiveFilter(t.key)}
                >
                  <Icon lib="FA5" name={t.icon} size={12} color={isActive ? C.white : C.gray500} />
                  <Text style={[s.filterTabText, { color: isActive ? C.white : C.gray700, marginLeft: 6 }]}>
                    {t.label} ({tabCounts[t.key]})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* SORT/FILTER BAR */}
        <View style={[s.section, { backgroundColor: C.blue50, paddingBottom: showFilterPanel || showSortPanel ? 8 : 16 }]}>
          <View style={s.row}>
            <TouchableOpacity
              style={[s.sortBtn, { flex: 1, marginRight: 8, borderColor: showFilterPanel || typeFilter ? C.primary : C.gray200 }]}
              onPress={() => { setShowFilterPanel(v => !v); setShowSortPanel(false); }}
            >
              <View style={s.row}>
                <Icon lib="FA5" name="filter" size={14} color={typeFilter ? C.primary : C.dark} />
                <Text style={[s.sortBtnText, { marginLeft: 8, color: typeFilter ? C.primary : C.dark }]}>
                  {typeFilter ? (TYPE_LABEL[typeFilter] || typeFilter) : 'Filter'}
                </Text>
              </View>
              <Icon lib="FA5" name={showFilterPanel ? 'chevron-up' : 'chevron-down'} size={10} color={C.gray400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.sortBtn, { flex: 1, marginRight: 8, borderColor: showSortPanel || sortOrder !== 'newest' ? C.primary : C.gray200 }]}
              onPress={() => { setShowSortPanel(v => !v); setShowFilterPanel(false); }}
            >
              <View style={s.row}>
                <Icon lib="FA5" name="sort" size={14} color={sortOrder !== 'newest' ? C.primary : C.dark} />
                <Text style={[s.sortBtnText, { marginLeft: 8, color: sortOrder !== 'newest' ? C.primary : C.dark }]}>
                  {{ newest: 'Newest', oldest: 'Oldest', az: 'A → Z', za: 'Z → A' }[sortOrder]}
                </Text>
              </View>
              <Icon lib="FA5" name={showSortPanel ? 'chevron-up' : 'chevron-down'} size={10} color={C.gray400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.sliderBtn, { backgroundColor: (typeFilter || sortOrder !== 'newest') ? C.primary : C.gray400 }]}
              onPress={() => { setTypeFilter(null); setSortOrder('newest'); setShowFilterPanel(false); setShowSortPanel(false); }}
            >
              <Icon lib="FA5" name="times" size={16} color={C.white} />
            </TouchableOpacity>
          </View>

          {/* Filter panel — case types */}
          {showFilterPanel && (
            <View style={s.filterPanel}>
              <Text style={[s.xs, { color: C.gray500, marginBottom: 10 }]}>Filter by case type:</Text>
              <View style={s.typeChipWrap}>
                <TouchableOpacity
                  style={[s.typeChip, !typeFilter && s.typeChipActive]}
                  onPress={() => { setTypeFilter(null); setShowFilterPanel(false); }}
                >
                  <Text style={[s.typeChipText, !typeFilter && { color: C.white }]}>
                    All Types
                  </Text>
                  <View style={[s.typeChipBadge, !typeFilter && { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                    <Text style={[s.typeChipBadgeText, !typeFilter && { color: C.white }]}>{cases.length}</Text>
                  </View>
                </TouchableOpacity>
                {allTypeKeys.map(key => {
                  const count = typeCountMap2[key] || 0;
                  const isActive = typeFilter === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[s.typeChip, isActive && s.typeChipActive, count === 0 && s.typeChipDim]}
                      onPress={() => { setTypeFilter(key); setShowFilterPanel(false); }}
                    >
                      <Text style={[s.typeChipText, isActive && { color: C.white }, count === 0 && { color: C.gray400 }]}>
                        {TYPE_LABEL[key]}
                      </Text>
                      <View style={[s.typeChipBadge, isActive && { backgroundColor: 'rgba(255,255,255,0.3)' }, count === 0 && { backgroundColor: C.gray100 }]}>
                        <Text style={[s.typeChipBadgeText, isActive && { color: C.white }, count === 0 && { color: C.gray400 }]}>{count}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Sort panel */}
          {showSortPanel && (
            <View style={s.filterPanel}>
              <Text style={[s.xs, { color: C.gray500, marginBottom: 8 }]}>Sort cases by:</Text>
              {[
                { key: 'newest', label: 'Newest First',  icon: 'sort-amount-down' },
                { key: 'oldest', label: 'Oldest First',  icon: 'sort-amount-up'   },
                { key: 'az',     label: 'Title A → Z',   icon: 'sort-alpha-down'  },
                { key: 'za',     label: 'Title Z → A',   icon: 'sort-alpha-up-alt'},
              ].map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[s.sortOption, sortOrder === opt.key && s.sortOptionActive]}
                  onPress={() => { setSortOrder(opt.key); setShowSortPanel(false); }}
                >
                  <View style={s.row}>
                    <Icon lib="FA5" name={opt.icon} size={13} color={sortOrder === opt.key ? C.primary : C.gray500} />
                    <Text style={[s.sortBtnText, { marginLeft: 10, color: sortOrder === opt.key ? C.primary : C.dark }]}>
                      {opt.label}
                    </Text>
                  </View>
                  {sortOrder === opt.key && <Icon lib="FA5" name="check" size={12} color={C.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ACTIVE FILTERS chips */}
        {(typeFilter || sortOrder !== 'newest') && (
          <View style={[s.section, { backgroundColor: C.blue50, paddingTop: 0, paddingBottom: 12 }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={[s.xs, { color: C.gray500, marginRight: 8, lineHeight: 28 }]}>Active:</Text>
              {typeFilter && (
                <View style={[s.activeFilter, { marginRight: 8 }]}>
                  <Text style={s.activeFilterText}>{TYPE_LABEL[typeFilter] || typeFilter}</Text>
                  <TouchableOpacity style={{ marginLeft: 6 }} onPress={() => setTypeFilter(null)}>
                    <Icon lib="FA5" name="times" size={10} color={C.primary} />
                  </TouchableOpacity>
                </View>
              )}
              {sortOrder !== 'newest' && (
                <View style={[s.activeFilter, { marginRight: 8 }]}>
                  <Text style={s.activeFilterText}>
                    {{ oldest: 'Oldest First', az: 'A → Z', za: 'Z → A' }[sortOrder]}
                  </Text>
                  <TouchableOpacity style={{ marginLeft: 6 }} onPress={() => setSortOrder('newest')}>
                    <Icon lib="FA5" name="times" size={10} color={C.primary} />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity onPress={() => { setTypeFilter(null); setSortOrder('newest'); }}>
                <Text style={[s.xs, { color: C.primary, textDecorationLine: 'underline', lineHeight: 28 }]}>Clear All</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* CASES LIST */}
        <View style={s.section}>
          <View style={[s.row, { justifyContent: 'space-between', marginBottom: 12 }]}>
            <Text style={s.sectionTitle}>
              {displayCases.length} Case{displayCases.length !== 1 ? 's' : ''}
              {searchText ? ` for "${searchText}"` : ''}
            </Text>
            <TouchableOpacity onPress={loadCases}>
              <Icon lib="FA5" name="sync-alt" size={14} color={C.primary} />
            </TouchableOpacity>
          </View>

          {loading && (
            <ActivityIndicator color={C.primary} size="large" style={{ marginVertical: 24 }} />
          )}
          {!loading && displayCases.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Icon lib="FA5" name="folder-open" size={36} color={C.gray400} />
              <Text style={[s.sm, { color: C.gray400, marginTop: 12 }]}>
                {searchText ? 'No cases match your search.' : 'No cases found.'}
              </Text>
              {!searchText && (
                <TouchableOpacity
                  style={[s.btnPrimary, { marginTop: 16, paddingHorizontal: 24 }]}
                  onPress={() => navigation?.navigate?.('AddCase', { onCreated: loadCases })}
                >
                  <Icon lib="FA5" name="plus" size={13} color={C.white} />
                  <Text style={[s.btnPrimaryText, { marginLeft: 6 }]}>Create First Case</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {!loading && displayCases.map((c, i) => (
            <CaseCard key={c._raw?.id ?? i} item={c} onViewDetails={handleViewDetails} />
          ))}
        </View>

        {/* STATISTICS */}
        <View style={[s.section, { backgroundColor: '#FAF5FF' }]}>
          <Text style={[s.sectionTitle, { marginBottom: 16 }]}>Case Statistics</Text>
          <View style={[s.card, { marginBottom: 16 }]}>
            <View style={[s.row, { justifyContent: 'space-between', marginBottom: 12 }]}>
              <Text style={s.cardTitle}>Cases by Type</Text>
            </View>
            {dynamicCaseTypes.length === 0 ? (
              <Text style={[s.xs, { color: C.gray400, textAlign: 'center', paddingVertical: 12 }]}>No cases yet</Text>
            ) : dynamicCaseTypes.map((t, i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <View style={[s.row, { justifyContent: 'space-between', marginBottom: 6 }]}>
                  <View style={s.row}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: t.color, marginRight: 8 }} />
                    <Text style={s.sm}>{t.label}</Text>
                  </View>
                  <Text style={s.smBold}>{t.count}</Text>
                </View>
                <View style={s.progressBg}>
                  <View style={[s.progressFill, { width: t.pct, backgroundColor: t.color }]} />
                </View>
              </View>
            ))}
          </View>
          <View style={s.statsRow}>
            <View style={[s.statMiniCard, { marginRight: 8 }]}>
              <View style={[s.statMiniIcon, { backgroundColor: C.green600 }]}>
                <Icon lib="FA5" name="check-circle" size={20} color={C.white} />
              </View>
              <Text style={s.statMiniCount}>{closedCount}</Text>
              <Text style={s.statMiniLabel}>Closed</Text>
              <Text style={s.statMiniSub}>Settled or closed</Text>
            </View>
            <View style={s.statMiniCard}>
              <View style={[s.statMiniIcon, { backgroundColor: C.red600 }]}>
                <Icon lib="FA5" name="fire" size={20} color={C.white} />
              </View>
              <Text style={s.statMiniCount}>{urgentCount}</Text>
              <Text style={s.statMiniLabel}>Urgent</Text>
              <Text style={[s.statMiniSub, { color: C.red600 }]}>High priority cases</Text>
            </View>
          </View>
        </View>

        {/* RECENT ACTIVITY */}
        <View style={[s.section, { backgroundColor: C.gray50 }]}>
          <SectionHeader title="Recent Activity" action="View All" />
          {ACTIVITY.map((a, i) => (
            <View key={i} style={s.card}>
              <View style={s.row}>
                <View style={[s.activityIcon, { backgroundColor: a.iconBg }]}>
                  <Icon lib={a.iconLib} name={a.iconName} size={16} color={a.iconColor} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.smBold}>{a.title}</Text>
                  <Text style={[s.xs, { marginVertical: 4 }]}>{a.desc}</Text>
                  <View style={[s.row, { justifyContent: 'space-between' }]}>
                    <Text style={s.gray400xs}>{a.time}</Text>
                    <View style={[s.tag, { backgroundColor: a.tagBg }]}>
                      <Text style={[s.tagText, { color: a.tagColor }]}>{a.tag}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* AI INSIGHTS */}
        <View style={[s.section, { backgroundColor: C.indigo50 }]}>
          <View style={s.aiCard}>
            <View style={[s.row, { marginBottom: 16 }]}>
              <View style={s.aiIconWrap}>
                <Icon lib="FA5" name="brain" size={24} color={C.white} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={s.aiTitle}>AI Case Insights</Text>
                <Text style={s.aiSub}>Smart recommendations</Text>
              </View>
            </View>
            {AI_INSIGHTS.map((a, i) => (
              <View key={i} style={s.aiItem}>
                <View style={[s.aiItemIcon, { backgroundColor: a.iconBg }]}>
                  <Icon lib="FA5" name={a.icon} size={14} color={C.white} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.aiItemTitle}>{a.title}</Text>
                  <Text style={s.aiItemDesc}>{a.desc}</Text>
                  <TouchableOpacity style={s.aiItemBtn}>
                    <Text style={s.aiItemBtnText}>{a.btn}</Text>
                    <Icon lib="FA5" name="arrow-right" size={10} color={C.white} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={s.aiMainBtn}>
              <Icon lib="FA5" name="robot" size={16} color={C.indigo600} />
              <Text style={s.aiMainBtnText}>Get More AI Insights</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* UPCOMING DEADLINES */}
        <View style={s.section}>
          <SectionHeader title="Upcoming Deadlines" action="Calendar View" />
          {DEADLINES.map((d, i) => (
            <View key={i} style={[s.deadlineCard, { borderLeftColor: d.border }]}>
              <View style={[s.row, { justifyContent: 'space-between', marginBottom: 6 }]}>
                <View style={s.row}>
                  <Icon lib={d.iconLib} name={d.iconName} size={13} color={d.iconColor} />
                  <Text style={[s.smBold, { marginLeft: 8 }]}>{d.title}</Text>
                </View>
                <View style={[s.tag, { backgroundColor: d.badgeBg }]}>
                  <Text style={[s.tagText, { color: d.badgeColor }]}>{d.badge}</Text>
                </View>
              </View>
              <Text style={[s.xs, { marginBottom: 10 }]}>{d.subtitle}</Text>
              <View style={[s.row, { justifyContent: 'space-between' }]}>
                <View style={s.row}>
                  <Icon lib="FA5" name="clock" size={12} color={d.timeColor} />
                  <Text style={[s.smBold, { color: d.timeColor, marginLeft: 6 }]}>{d.time}</Text>
                </View>
                <TouchableOpacity style={[s.deadlineBtn, { backgroundColor: d.btnBg }]}>
                  <Text style={s.deadlineBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* BULK ACTIONS */}
        <View style={[s.section, { backgroundColor: C.blue50 }]}>
          <Text style={[s.sectionTitle, { marginBottom: 14 }]}>Bulk Actions</Text>
          <View style={s.card}>
            <View style={[s.row, { justifyContent: 'space-between', marginBottom: 14 }]}>
              <View style={s.row}>
                <View style={s.checkbox} />
                <Text style={s.smBold}>Select All Cases</Text>
              </View>
              <Text style={s.xs}>0 selected</Text>
            </View>
            <View style={s.bulkGrid}>
              {BULK_ACTIONS.map((b, i) => (
                <TouchableOpacity key={i} style={[s.bulkBtn, { backgroundColor: b.bg }]}>
                  <Icon lib={b.iconLib} name={b.iconName} size={16} color={b.color} />
                  <Text style={[s.smBold, { color: b.color, marginLeft: 8 }]}>{b.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.primary },
  scroll: { flex: 1, backgroundColor: C.gray50 },
  header: { backgroundColor: C.primary, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.white },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  notifBadge: { position: 'absolute', top: -3, right: -3, backgroundColor: C.red500, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { color: C.white, fontSize: 10, fontWeight: '700' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, gap: 10 },
  searchInput: { flex: 1, color: C.white, fontSize: 14 },
  section: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.white, marginBottom: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.dark },
  sectionAction: { fontSize: 13, fontWeight: '600', color: C.primary },
  filterTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  filterTabText: { fontSize: 13, fontWeight: '600' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.white, borderWidth: 1, borderColor: C.gray200, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  sortBtnText: { fontSize: 13, fontWeight: '600', color: C.dark },
  sliderBtn: { width: 48, height: 48, backgroundColor: C.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  activeFilter: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderWidth: 1, borderColor: C.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  activeFilterText: { fontSize: 12, fontWeight: '600', color: C.primary },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: C.gray100, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.dark, marginBottom: 2 },
  cardSubtitle: { fontSize: 13, color: C.gray600 },
  row: { flexDirection: 'row', alignItems: 'center' },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  tagText: { fontSize: 11, fontWeight: '600' },
  caseIdBadge: { backgroundColor: C.blue50, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  caseIdText: { fontSize: 11, fontWeight: '700', color: C.primary },
  avatarMd: { width: 40, height: 40, borderRadius: 20 },
  clientName: { fontSize: 13, fontWeight: '700', color: C.dark },
  clientSince: { fontSize: 11, color: C.gray500 },
  iconBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 11, color: C.gray500, marginBottom: 2, textAlign: 'center' },
  statVal: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  xs: { fontSize: 12, color: C.gray600 },
  sm: { fontSize: 13, color: C.dark },
  smBold: { fontSize: 13, fontWeight: '700', color: C.dark },
  gray400xs: { fontSize: 12, color: C.gray400 },
  btnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary, paddingVertical: 10, borderRadius: 12 },
  btnPrimaryText: { color: C.white, fontWeight: '700', fontSize: 14 },
  viewToggle: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  progressBg: { height: 8, backgroundColor: C.gray100, borderRadius: 4 },
  progressFill: { height: 8, borderRadius: 4 },
  statsRow: { flexDirection: 'row' },
  statMiniCard: { flex: 1, backgroundColor: C.white, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.gray100 },
  statMiniIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statMiniCount: { fontSize: 22, fontWeight: '800', color: C.dark, marginBottom: 2 },
  statMiniLabel: { fontSize: 12, color: C.gray600, fontWeight: '500' },
  statMiniSub: { fontSize: 11, fontWeight: '700', color: C.green600, marginTop: 2 },
  qfGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  qfCard: { width: '47%', backgroundColor: C.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.gray200 },
  qfIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  qfCount: { fontSize: 20, fontWeight: '800', color: C.dark, marginTop: 6 },
  activityIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aiCard: { backgroundColor: C.indigo600, borderRadius: 24, padding: 20 },
  aiIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: 16, fontWeight: '700', color: C.white },
  aiSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  aiItem: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  aiItemIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aiItemTitle: { fontSize: 13, fontWeight: '700', color: C.white, marginBottom: 3 },
  aiItemDesc: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 8 },
  aiItemBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 4 },
  aiItemBtnText: { fontSize: 12, fontWeight: '600', color: C.white },
  aiMainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.white, paddingVertical: 12, borderRadius: 14, gap: 8, marginTop: 4 },
  aiMainBtnText: { fontSize: 14, fontWeight: '700', color: C.indigo600 },
  deadlineCard: { borderRadius: 16, padding: 14, borderLeftWidth: 4, marginBottom: 10, backgroundColor: C.gray50 },
  deadlineBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  deadlineBtnText: { color: C.white, fontSize: 12, fontWeight: '700' },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: C.gray400, marginRight: 10 },
  bulkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bulkBtn: { width: '47%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
  // ── Filter / Sort panels ─────────────────────────────────────────────
  filterPanel: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.gray200 },
  typeChipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: C.gray300, backgroundColor: C.white },
  typeChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  typeChipDim: { borderColor: C.gray200, backgroundColor: C.gray50 },
  typeChipText: { fontSize: 13, fontWeight: '600', color: C.dark },
  typeChipBadge: { minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 10, backgroundColor: C.blue50, alignItems: 'center', justifyContent: 'center' },
  typeChipBadgeText: { fontSize: 11, fontWeight: '700', color: C.primary },
  sortOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 },
  sortOptionActive: { backgroundColor: C.blue50 },
});
