import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, StyleSheet, SafeAreaView, StatusBar, Dimensions, Linking, Alert, ActivityIndicator,
} from 'react-native';
import { FontAwesome5, Ionicons, MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useAppPrefs } from '../context/AppPrefsContext';
import { dashboardAPI } from '../services/api';

import AddCaseScreen from './Cases/AddCaseScreen';
import CaseDetailsScreen from './Cases/CaseDetailsScreen';
import AddClientScreen from './Clients/AddClientScreen';
import UploadDocumentScreen from './Documents/UploadDocumentScreen';
import AddNoteScreen from './TasksNotes/AddNoteScreen';
import AIAssistantScreen from './AI/AIAssistantScreen';
import ScheduleScreen from './Schedule/ScheduleScreen';
import InvoiceScreen from './Invoices/InvoiceScreen';
import VoiceNoteScreen from './TasksNotes/VoiceNoteScreen';
import AddTaskScreen from './TasksNotes/AddTaskScreen';
import NotificationsScreen from './Notifications/NotificationsScreen';
import InvoicesManagementScreen from './Invoices/InvoicesManagementScreen';
import ClientsManagementScreen from './Clients/ClientsManagementScreen';
import TasksNotesManagementScreen from './TasksNotes/TasksNotesManagementScreen';
import AllScheduleScreen from './Schedule/AllScheduleScreen';
import AllCasesScreen from './Cases/AllCasesScreen';
import AllTasksScreen from './TasksNotes/AllTasksScreen';
import AllDocumentsScreen from './Documents/AllDocumentsScreen';

// ─── COULEURS ────────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#1E40AF', secondary: '#3B82F6', accent: '#60A5FA',
  dark: '#1E293B', light: '#F8FAFC', white: '#FFFFFF',
  gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB',
  gray400: '#9CA3AF', gray500: '#6B7280', gray600: '#4B5563', gray700: '#374151',
  red50: '#FEF2F2', red100: '#FEE2E2', red500: '#EF4444', red600: '#DC2626',
  amber50: '#FFFBEB', amber100: '#FEF3C7', amber500: '#F59E0B', amber600: '#D97706',
  green50: '#F0FDF4', green100: '#DCFCE7', green500: '#22C55E', green600: '#16A34A',
  blue50: '#EFF6FF', blue100: '#DBEAFE', blue600: '#2563EB',
  purple50: '#FAF5FF', purple100: '#F3E8FF', purple500: '#A855F7', purple600: '#9333EA',
  indigo600: '#4F46E5', teal500: '#14B8A6', teal600: '#0D9488',
  pink500: '#EC4899', orange50: '#FFF7ED', orange600: '#EA580C',
};

const W = Dimensions.get('window').width;

// ─── COMPOSANT ICÔNE ─────────────────────────────────────────────────────────
const Icon = ({ lib = 'FA5', name, size = 18, color = COLORS.dark }) => {
  switch (lib) {
    case 'FA5': return <FontAwesome5  name={name} size={size} color={color} />;
    case 'FA':  return <FontAwesome   name={name} size={size} color={color} />;
    case 'ION': return <Ionicons      name={name} size={size} color={color} />;
    case 'MAT': return <MaterialIcons name={name} size={size} color={color} />;
    case 'FTH': return <Feather       name={name} size={size} color={color} />;
    default:    return null;
  }
};

// ─── SCHEDULE : CONFIG PRIORITÉ ──────────────────────────────────────────────
const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent',        color: COLORS.red600,   bg: COLORS.red50,   border: COLORS.red500,    timeBg: COLORS.red100   },
  high:   { label: 'High Priority', color: COLORS.red600,   bg: COLORS.red50,   border: COLORS.red500,    timeBg: COLORS.red100   },
  medium: { label: 'Medium',        color: COLORS.amber600, bg: COLORS.amber50, border: COLORS.amber500,  timeBg: COLORS.amber100 },
  normal: { label: 'Normal',        color: COLORS.blue600,  bg: COLORS.blue50,  border: COLORS.secondary, timeBg: COLORS.blue100  },
};

// ─── SCHEDULE : GÉNÉRATEUR D'ACTIONS ─────────────────────────────────────────
const getEventActions = (event, navigateTo) => {
  const actions = [];
  const { type, client, location, meeting_link, case_id } = event;

  if (client?.phone) {
    actions.push({
      key: 'call', iconLib: 'FA5', iconName: 'phone',
      bg: COLORS.blue50, color: COLORS.primary,
      onPress: () => Linking.canOpenURL(`tel:${client.phone}`).then(ok => {
        if (ok) Linking.openURL(`tel:${client.phone}`);
        else Alert.alert('Erreur', "Impossible d'ouvrir le téléphone");
      }),
    });
    actions.push({
      key: 'whatsapp', iconLib: 'FA', iconName: 'whatsapp',
      bg: COLORS.green50, color: COLORS.green600,
      onPress: () => {
        const phone = client.phone.replace(/\D/g, '');
        Linking.canOpenURL(`whatsapp://send?phone=${phone}`).then(ok => {
          if (ok) Linking.openURL(`whatsapp://send?phone=${phone}`);
          else Alert.alert('WhatsApp non installé', 'Veuillez installer WhatsApp');
        });
      },
    });
  }
  if (client?.email) {
    actions.push({
      key: 'email', iconLib: 'FA5', iconName: 'envelope',
      bg: COLORS.purple50, color: COLORS.purple600,
      onPress: () => Linking.openURL(`mailto:${client.email}`),
    });
  }
  switch (type) {
    case 'court_hearing':
      if (location) actions.push({
        key: 'map', iconLib: 'FA5', iconName: 'map-marker-alt',
        bg: COLORS.blue50, color: COLORS.primary,
        onPress: () => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(location)}`),
      });
      break;
    case 'internal_meeting':
      if (meeting_link) actions.push({
        key: 'video', iconLib: 'FA5', iconName: 'video',
        bg: COLORS.purple50, color: COLORS.purple600,
        onPress: () => Linking.openURL(meeting_link),
      });
      break;
    case 'deadline':
    case 'document_submission':
      if (case_id && navigateTo) actions.push({
        key: 'documents', iconLib: 'FA5', iconName: 'file-pdf',
        bg: COLORS.green50, color: COLORS.green600,
        onPress: () => navigateTo('CaseDocuments', { caseId: case_id }),
      });
      break;
    default: break;
  }
  return actions;
};

// ─── DONNÉES SCHEDULE ─────────────────────────────────────────────────────────
const SCHEDULE = [
  {
    id: 'evt-001', type: 'court_hearing',
    time: '09:30', period: 'AM',
    title: 'Criminal Court Hearing', subtitle: 'State vs. Johnson - Room 204',
    priority: 'urgent', case_id: 'CR-2024-1247',
    location: 'Manhattan Criminal Court, 100 Centre St, New York',
    client: { name: 'Marcus Johnson', phone: '+1234567890', email: 'marcus@example.com', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg' },
    tag: 'Criminal Law',
  },
  {
    id: 'evt-002', type: 'client_meeting',
    time: '11:00', period: 'AM',
    title: 'Client Meeting', subtitle: 'Contract Review - Office',
    priority: 'medium', case_id: 'CV-2024-0892', location: null,
    client: { name: 'Sarah Mitchell', phone: '+1987654321', email: 'sarah@mitchell.com', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg' },
    tag: 'Corporate',
  },
  {
    id: 'evt-003', type: 'document_submission',
    time: '02:00', period: 'PM',
    title: 'Document Submission', subtitle: 'Civil Court - Case #2024-567',
    priority: 'normal', case_id: 'CV-2024-0567', location: null,
    client: { name: 'Robert Chen', phone: '+1122334455', email: 'robert@chen.com', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg' },
    tag: 'Civil Law',
  },
];

// ─── DONNÉES CASES ────────────────────────────────────────────────────────────
// Chaque objet contient TOUS les champs requis par CaseDetailsScreen.
// Le bug "Cannot convert undefined value to object" venait du fait que
// CaseDetailsScreen accédait à des champs (type, phase, tags, client.id, etc.)
// absents des anciens objets CASES. Ils sont maintenant tous présents.
const CASES = [
  {
    // Champs affichage HomeScreen
    id: 'CR-2024-1247',
    badge: 'Urgent', badgeColor: COLORS.red600, badgeBg: COLORS.red50,
    col1Label: 'Next Hearing', col1Val: 'Today',
    col2Label: 'Documents',   col2Val: '23',
    col3Label: 'Tasks',       col3Val: '5 Pending',
    actions: [
      { iconLib: 'FA5', iconName: 'robot',    bg: COLORS.blue50,  color: COLORS.primary  },
      { iconLib: 'FA',  iconName: 'whatsapp', bg: COLORS.green50, color: COLORS.green600 },
    ],
    // Champs requis par CaseDetailsScreen
    title:       'State vs. Johnson',
    subtitle:    'Criminal Defense — Assault Charges',
    type:        'Criminal Law',
    phase:       'Trial Phase',
    priority:    'urgent',
    status:      'Active',
    filingDate:  '2024-01-15',
    court:       'Manhattan Criminal Court',
    judge:       'Hon. Patricia Williams',
    prosecutor:  'DA Robert Chen',
    attorney:    'Sarah Williams - Lead Attorney',
    caseValue:   '$45,000',
    description: 'Client is charged with assault in the second degree following an altercation at a local establishment. The prosecution alleges intentional harm, while the defense maintains self-defense. Key evidence includes surveillance footage and witness testimonies.',
    tags:        ['Criminal Law', 'Self Defense', 'Trial'],
    nextHearing: { label: 'Today', time: '09:30 AM', room: 'Room 305', countdown: '2h 47m' },
    stats:       { docs: 23, tasks: 5, events: 8, notes: 12 },
    timeTracking:{ billable: 47.5, nonBillable: 12.3 },
    client: {
      name: 'Marcus Johnson', id: 'CL-2024-089',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
      since: 'January 15, 2024', phone: '+1 (555) 234-5678',
      email: 'm.johnson@email.com', address: '742 Evergreen Terrace, Springfield',
      status: 'Active', tier: 'Verified',
    },
  },
  {
    // Champs affichage HomeScreen
    id: 'CV-2024-0892',
    badge: 'Medium', badgeColor: COLORS.amber600, badgeBg: COLORS.amber50,
    col1Label: 'Next Hearing', col1Val: 'Mar 18',
    col2Label: 'Documents',   col2Val: '47',
    col3Label: 'Tasks',       col3Val: '3 Pending',
    actions: [
      { iconLib: 'FA5', iconName: 'robot',    bg: COLORS.blue50,   color: COLORS.primary   },
      { iconLib: 'FA5', iconName: 'envelope', bg: COLORS.purple50, color: COLORS.purple600 },
    ],
    // Champs requis par CaseDetailsScreen
    title:       'Mitchell Corp. Contract Dispute',
    subtitle:    'Corporate Law — Breach of Contract',
    type:        'Corporate Law',
    phase:       'Discovery Phase',
    priority:    'medium',
    status:      'Active',
    filingDate:  '2024-02-10',
    court:       'New York Civil Court',
    judge:       'Hon. James Whitfield',
    prosecutor:  'N/A',
    attorney:    'Michael Chen - Lead Attorney',
    caseValue:   '$120,000',
    description: 'Mitchell Corp. alleges breach of contract by a former supplier. The dispute centers around delivery failures and financial damages incurred. Settlement negotiations are ongoing.',
    tags:        ['Corporate Law', 'Breach of Contract', 'Discovery'],
    nextHearing: { label: 'Mar 18', time: '11:00 AM', room: 'Room 12', countdown: '12d 3h' },
    stats:       { docs: 47, tasks: 3, events: 5, notes: 8 },
    timeTracking:{ billable: 32.0, nonBillable: 8.5 },
    client: {
      name: 'Sarah Mitchell', id: 'CL-2024-042',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
      since: 'February 10, 2024', phone: '+1 (555) 987-6543',
      email: 's.mitchell@corp.com', address: '200 Park Avenue, New York',
      status: 'Active', tier: 'Premium',
    },
  },
];

const STATS = [
  { iconLib: 'FA5', iconName: 'briefcase', iconColor: COLORS.primary,   count: '24', label: 'Active Cases',  badge: '+3',    badgeColor: COLORS.green600,  badgeBg: COLORS.green50,  iconBg: COLORS.blue100   },
  { iconLib: 'FA5', iconName: 'gavel',     iconColor: COLORS.purple600, count: '3',  label: 'Hearings',      badge: 'Today', badgeColor: COLORS.orange600, badgeBg: COLORS.orange50, iconBg: COLORS.purple100 },
  { iconLib: 'FA5', iconName: 'tasks',     iconColor: COLORS.amber600,  count: '12', label: 'Pending Tasks', badge: 'Urgent',badgeColor: COLORS.red600,    badgeBg: COLORS.red50,    iconBg: COLORS.amber100  },
  { iconLib: 'FA5', iconName: 'file-alt',  iconColor: COLORS.green600,  count: '8',  label: 'Documents',     badge: 'New',   badgeColor: COLORS.blue600,   badgeBg: COLORS.blue50,   iconBg: COLORS.green100  },
];

const MANAGEMENT_ACTIONS = [
  { screen: 'ClientsManagement',    icon: 'users',               iconLib: 'FA5', label: 'Clients',       sublabel: 'Management', color: COLORS.purple600, bg: COLORS.purple50, accent: COLORS.purple100, badge: '47',     badgeLabel: 'Total',   badgeColor: COLORS.purple600, badgeBg: COLORS.purple100 },
  { screen: 'TasksNotesManagement', icon: 'tasks',               iconLib: 'FA5', label: 'Tasks & Notes', sublabel: 'Management', color: COLORS.amber600,  bg: COLORS.amber50,  accent: COLORS.amber100,  badge: '12',     badgeLabel: 'Pending', badgeColor: COLORS.amber600,  badgeBg: COLORS.amber100  },
  { screen: 'InvoicesManagement',   icon: 'file-invoice-dollar', iconLib: 'FA5', label: 'Invoices',      sublabel: '& Payments', color: COLORS.teal600,   bg: '#F0FDFA',       accent: '#CCFBF1',        badge: '7',      badgeLabel: 'Overdue', badgeColor: COLORS.red600,    badgeBg: COLORS.red50     },
  { screen: 'AIAssistant',          icon: 'robot',               iconLib: 'FA5', label: 'AI Assistant',  sublabel: 'Legal AI',   color: COLORS.indigo600, bg: '#EEF2FF',       accent: '#C7D2FE',        badge: 'Online', badgeLabel: '',        badgeColor: COLORS.green600,  badgeBg: COLORS.green50   },
];

const TASKS = [
  { title: 'File Motion to Dismiss',    badge: 'Due Today',    badgeColor: COLORS.red600,   badgeBg: COLORS.red50,   subtitle: 'State vs. Johnson - Criminal Case', caseId: 'CR-2024-1247', timeLeft: '3 hours left', timeColor: COLORS.red600,   borderColor: COLORS.red500,   action: null },
  { title: 'Review Contract Amendment', badge: 'Due Tomorrow', badgeColor: COLORS.amber600, badgeBg: COLORS.amber50, subtitle: 'Mitchell Corp. - Corporate Law',     caseId: 'CV-2024-0892', timeLeft: null,           timeColor: null,            borderColor: COLORS.amber500, action: { iconLib: 'FA5', iconName: 'robot', label: 'AI Review', color: COLORS.primary, bg: COLORS.blue50 } },
];

const DOCUMENTS = [
  { iconLib: 'FA5', iconName: 'file-pdf',  iconColor: COLORS.red600,  iconBg: COLORS.red100,  name: 'Motion to Dismiss - Draft v3.pdf', case: 'State vs. Johnson', size: '2.4 MB', date: 'Today, 2:30 PM',  action: { iconLib: 'FA5', iconName: 'robot', label: 'Summarize', color: COLORS.primary,   bg: COLORS.blue50   } },
  { iconLib: 'FA5', iconName: 'file-word', iconColor: COLORS.blue600, iconBg: COLORS.blue100, name: 'Contract Amendment - Final.docx',   case: 'Mitchell Corp.',    size: '1.8 MB', date: 'Today, 11:15 AM', action: { iconLib: 'FA5', iconName: 'eye',   label: 'View',      color: COLORS.purple600, bg: COLORS.purple50 } },
];

// ─── COMPOSANTS ──────────────────────────────────────────────────────────────
const SectionHeader = ({ title, action, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && <TouchableOpacity onPress={onAction}><Text style={styles.sectionAction}>{action}</Text></TouchableOpacity>}
  </View>
);

const StatCard = ({ item }) => (
  <View style={styles.statCard}>
    <View style={styles.statTop}>
      <View style={[styles.statIconWrap, { backgroundColor: item.iconBg }]}>
        <Icon lib={item.iconLib} name={item.iconName} size={18} color={item.iconColor} />
      </View>
      <View style={[styles.statBadge, { backgroundColor: item.badgeBg }]}>
        <Text style={[styles.statBadgeText, { color: item.badgeColor }]}>{item.badge}</Text>
      </View>
    </View>
    <Text style={styles.statCount}>{item.count}</Text>
    <Text style={styles.statLabel}>{item.label}</Text>
  </View>
);

const ManagementCard = ({ item, onPress }) => (
  <TouchableOpacity style={[styles.mgmtCard, { backgroundColor: item.bg }]} onPress={() => onPress(item.screen)} activeOpacity={0.85}>
    <View style={[styles.mgmtIconCircle, { backgroundColor: item.accent }]}>
      <Icon lib={item.iconLib} name={item.icon} size={26} color={item.color} />
    </View>
    <Text style={[styles.mgmtLabel, { color: item.color }]}>{item.label}</Text>
    <Text style={styles.mgmtSublabel}>{item.sublabel}</Text>
    <View style={[styles.mgmtBadge, { backgroundColor: item.badgeBg }]}>
      <Text style={[styles.mgmtBadgeText, { color: item.badgeColor }]}>{item.badge}{item.badgeLabel ? ` ${item.badgeLabel}` : ''}</Text>
    </View>
    <View style={[styles.mgmtArrow, { backgroundColor: item.accent }]}>
      <FontAwesome5 name="arrow-right" size={9} color={item.color} />
    </View>
  </TouchableOpacity>
);

const ScheduleCard = ({ event, navigateTo }) => {
  const pCfg = PRIORITY_CONFIG[event.priority] || PRIORITY_CONFIG.normal;
  const actions = getEventActions(event, navigateTo);
  return (
    <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: pCfg.border }]}>
      <View style={styles.scheduleTop}>
        <View style={[styles.scheduleTime, { backgroundColor: pCfg.timeBg }]}>
          <Text style={[styles.scheduleTimeText, { color: pCfg.color }]}>{event.time}</Text>
          <Text style={[styles.schedulePeriod,   { color: pCfg.color }]}>{event.period}</Text>
        </View>
        <View style={styles.scheduleInfo}>
          <Text style={styles.cardTitle}>{event.title}</Text>
          <Text style={styles.cardSubtitle}>{event.subtitle}</Text>
          <View style={styles.row}>
            <View style={[styles.tag, { backgroundColor: pCfg.bg }]}>
              <Text style={[styles.tagText, { color: pCfg.color }]}>{pCfg.label}</Text>
            </View>
            {event.tag ? (
              <View style={[styles.tag, { backgroundColor: COLORS.gray100, marginLeft: 6 }]}>
                <Text style={[styles.tagText, { color: COLORS.gray600 }]}>{event.tag}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
      <View style={styles.scheduleBottom}>
        <View style={styles.row}>
          {event.client?.avatar ? <Image source={{ uri: event.client.avatar }} style={styles.avatarSm} /> : null}
          <Text style={styles.clientName}>{event.client?.name || '—'}</Text>
        </View>
        <View style={styles.row}>
          {actions.map((a) => (
            <TouchableOpacity key={a.key} style={[styles.iconBtn, { backgroundColor: a.bg, marginLeft: 6 }]} onPress={a.onPress} activeOpacity={0.7}>
              <Icon lib={a.iconLib} name={a.iconName} size={14} color={a.color} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const CaseCard = ({ item, onViewDetails }) => (
  <View style={styles.card}>
    <View style={styles.caseMeta}>
      <View style={styles.row}>
        <View style={styles.caseIdBadge}><Text style={styles.caseIdText}>{item.id}</Text></View>
        <View style={[styles.tag, { backgroundColor: item.badgeBg, marginLeft: 6 }]}>
          <Text style={[styles.tagText, { color: item.badgeColor }]}>{item.badge}</Text>
        </View>
      </View>
    </View>
    <Text style={[styles.cardTitle, { marginTop: 6 }]}>{item.title}</Text>
    <Text style={[styles.cardSubtitle, { marginBottom: 10 }]}>{item.subtitle}</Text>
    <View style={[styles.row, styles.caseClient]}>
      <Image source={{ uri: item.client?.avatar }} style={styles.avatarMd} />
      <View style={{ marginLeft: 8 }}>
        <Text style={styles.clientNameBold}>{item.client?.name}</Text>
        <Text style={styles.clientRole}>Client</Text>
      </View>
    </View>
    <View style={styles.caseStats}>
      <View style={styles.caseStat}><Text style={styles.caseStatLabel}>{item.col1Label}</Text><Text style={styles.caseStatVal}>{item.col1Val}</Text></View>
      <View style={[styles.caseStat, styles.caseStatBordered]}><Text style={styles.caseStatLabel}>{item.col2Label}</Text><Text style={styles.caseStatVal}>{item.col2Val}</Text></View>
      <View style={styles.caseStat}><Text style={styles.caseStatLabel}>{item.col3Label}</Text><Text style={styles.caseStatVal}>{item.col3Val}</Text></View>
    </View>
    <View style={styles.row}>
      <TouchableOpacity style={styles.btnPrimary} onPress={() => onViewDetails && onViewDetails(item)}>
        <Text style={styles.btnPrimaryText}>View Details</Text>
      </TouchableOpacity>
      {(item.actions || []).map((a, i) => (
        <TouchableOpacity key={i} style={[styles.iconBtn, { backgroundColor: a.bg, marginLeft: 8 }]}>
          <Icon lib={a.iconLib} name={a.iconName} size={16} color={a.color} />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const TaskCard = ({ item }) => (
  <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: item.borderColor }]}>
    <View style={styles.row}>
      <TouchableOpacity style={styles.checkbox} />
      <View style={{ flex: 1 }}>
        <View style={[styles.row, { marginBottom: 4, flexWrap: 'wrap', gap: 6 }]}>
          <Text style={[styles.cardTitle, { flex: 1 }]}>{item.title}</Text>
          <View style={[styles.tag, { backgroundColor: item.badgeBg }]}>
            <Text style={[styles.tagText, { color: item.badgeColor }]}>{item.badge}</Text>
          </View>
        </View>
        <Text style={[styles.cardSubtitle, { marginBottom: 8 }]}>{item.subtitle}</Text>
        <View style={styles.row}>
          <Icon lib="FA5" name="briefcase" size={11} color={COLORS.gray400} />
          <Text style={[styles.gray500Sm, { marginLeft: 4 }]}>{item.caseId}</Text>
          {item.timeLeft && (
            <View style={[styles.row, { marginLeft: 'auto' }]}>
              <Icon lib="FA5" name="clock" size={11} color={item.timeColor} />
              <Text style={[styles.gray500Sm, { color: item.timeColor, fontWeight: '600', marginLeft: 4 }]}>{item.timeLeft}</Text>
            </View>
          )}
          {item.action && (
            <TouchableOpacity style={[styles.tagBtn, { backgroundColor: item.action.bg, marginLeft: 'auto' }]}>
              <View style={styles.row}>
                <Icon lib={item.action.iconLib} name={item.action.iconName} size={11} color={item.action.color} />
                <Text style={[styles.tagText, { color: item.action.color, marginLeft: 4 }]}>{item.action.label}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  </View>
);

const DocumentCard = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <View style={[styles.docIcon, { backgroundColor: item.iconBg }]}>
        <Icon lib={item.iconLib} name={item.iconName} size={22} color={item.iconColor} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.cardTitle, { marginBottom: 2 }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.cardSubtitle, { marginBottom: 8 }]}>{item.case}</Text>
        <View style={styles.row}>
          <Text style={styles.gray500Sm}>{item.size}</Text>
          <Text style={[styles.gray500Sm, { marginHorizontal: 6 }]}>•</Text>
          <Text style={styles.gray500Sm}>{item.date}</Text>
          <TouchableOpacity style={[styles.tagBtn, { backgroundColor: item.action.bg, marginLeft: 'auto' }]}>
            <View style={styles.row}>
              <Icon lib={item.action.iconLib} name={item.action.iconName} size={11} color={item.action.color} />
              <Text style={[styles.tagText, { color: item.action.color, marginLeft: 4 }]}>{item.action.label}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
);

// ─── ÉCRAN PRINCIPAL ─────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user } = useAuth();
  const { theme: T } = useAppPrefs();
  const [currentScreen, setCurrentScreen] = useState(null);
  const [selectedCase, setSelectedCase]   = useState(null);

  // ── Dashboard data ───────────────────────────────────────────────────────
  const [stats,       setStats]       = useState(null);
  const [todayEvents, setTodayEvents] = useState([]);
  const [recentCases, setRecentCases] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, t, r] = await Promise.all([
          dashboardAPI.stats(),
          dashboardAPI.today(),
          dashboardAPI.recentCases(),
        ]);
        setStats(s);
        setTodayEvents(t || []);
        setRecentCases(r || []);
      } catch (err) {
        // Silently fallback to static data on network error (dev mode)
        console.warn('Dashboard load error:', err.message);
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  // ── Derive stats cards from API response (or keep static fallback) ────────
  const STATS_LIVE = stats ? [
    { iconLib: 'FA5', iconName: 'briefcase', iconColor: COLORS.primary,   count: String(stats.active_cases ?? 0),     label: 'Active Cases',  badge: '+3',    badgeColor: COLORS.green600,  badgeBg: COLORS.green50,  iconBg: COLORS.blue100   },
    { iconLib: 'FA5', iconName: 'gavel',     iconColor: COLORS.purple600, count: String(stats.upcoming_hearings ?? 0), label: 'Hearings',      badge: 'Today', badgeColor: COLORS.orange600, badgeBg: COLORS.orange50, iconBg: COLORS.purple100 },
    { iconLib: 'FA5', iconName: 'tasks',     iconColor: COLORS.amber600,  count: String(stats.active_reminders ?? 0),  label: 'Pending Tasks', badge: 'Urgent',badgeColor: COLORS.red600,    badgeBg: COLORS.red50,    iconBg: COLORS.amber100  },
    { iconLib: 'FA5', iconName: 'file-alt',  iconColor: COLORS.green600,  count: String(stats.closed_cases ?? 0),      label: 'Closed Cases',  badge: 'New',   badgeColor: COLORS.blue600,   badgeBg: COLORS.blue50,   iconBg: COLORS.green100  },
  ] : STATS;

  // ── Convert today's API events to ScheduleCard format ────────────────────
  const scheduleEvents = todayEvents.length > 0
    ? todayEvents.map((ev) => {
        const dt = new Date(ev.start_datetime);
        const h  = dt.getHours(), m = dt.getMinutes();
        return {
          id:       ev.id,
          type:     ev.event_type?.toLowerCase() || 'meeting',
          time:     `${h % 12 || 12}:${String(m).padStart(2, '0')}`,
          period:   h >= 12 ? 'PM' : 'AM',
          title:    ev.title,
          subtitle: ev.location || '',
          priority: 'normal',
          case_id:  ev.case_id,
          location: ev.location,
          tag:      ev.event_type,
          client:   null,
        };
      })
    : SCHEDULE;

  // ── Convert recent cases from API ────────────────────────────────────────
  const casesDisplay = recentCases.length > 0
    ? recentCases.map((c) => ({
        id:          c.id,
        badge:       c.priority || 'Normal',
        badgeColor:  c.priority === 'URGENT' ? COLORS.red600 : COLORS.amber600,
        badgeBg:     c.priority === 'URGENT' ? COLORS.red50  : COLORS.amber50,
        col1Label:   'Status',     col1Val: c.status,
        col2Label:   'Type',       col2Val: c.case_type,
        col3Label:   'Filed',      col3Val: c.filing_date ? c.filing_date.slice(0, 10) : '—',
        actions: [
          { iconLib: 'FA5', iconName: 'robot',    bg: COLORS.blue50,  color: COLORS.primary  },
          { iconLib: 'FA5', iconName: 'eye',      bg: COLORS.gray100, color: COLORS.gray600  },
        ],
        title:       c.title,
        subtitle:    c.case_type,
        type:        c.case_type,
        phase:       c.status,
        priority:    c.priority?.toLowerCase() || 'normal',
        status:      c.status,
        filingDate:  c.filing_date,
        court:       c.court_name || '',
        judge:       c.judge_name || '',
        prosecutor:  c.opposing_party || '',
        attorney:    '',
        caseValue:   c.estimated_value ? `$${c.estimated_value}` : '',
        description: c.description || '',
        tags:        [c.case_type],
        nextHearing: null,
        stats:       { docs: 0, tasks: 0, events: 0, notes: 0 },
        timeTracking:{ billable: 0, nonBillable: 0 },
        client:      c.client_name ? { name: c.client_name, id: c.client_id, avatar: null, since: '', phone: '', email: '', address: '', status: 'Active', tier: '' } : null,
      }))
    : CASES;

  const navigateTo = (screen) => setCurrentScreen(screen);
  const goBack = () => setCurrentScreen(null);
  const screenProps = { navigation: { goBack } };

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const firmName  = user?.firm_name || 'Your Firm';

  if (loadingData) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </SafeAreaView>
    );
  }

  if (selectedCase) {
    return (
      <CaseDetailsScreen
        navigation={{ goBack: () => setSelectedCase(null) }}
        route={{ params: { caseData: selectedCase } }}
      />
    );
  }

  if (currentScreen === 'AddCase')              return <AddCaseScreen {...screenProps} />;
  if (currentScreen === 'AddClient')            return <AddClientScreen {...screenProps} />;
  if (currentScreen === 'UploadDoc')            return <UploadDocumentScreen {...screenProps} />;
  if (currentScreen === 'AddNote')              return <AddNoteScreen {...screenProps} />;
  if (currentScreen === 'AIAssistant')          return <AIAssistantScreen {...screenProps} />;
  if (currentScreen === 'Schedule')             return <ScheduleScreen {...screenProps} />;
  if (currentScreen === 'Invoice')              return <InvoiceScreen {...screenProps} />;
  if (currentScreen === 'VoiceNote')            return <VoiceNoteScreen {...screenProps} />;
  if (currentScreen === 'AddTask')              return <AddTaskScreen {...screenProps} />;
  if (currentScreen === 'Notifications')        return <NotificationsScreen {...screenProps} />;
  if (currentScreen === 'InvoicesManagement')   return <InvoicesManagementScreen {...screenProps} />;
  if (currentScreen === 'ClientsManagement')    return <ClientsManagementScreen {...screenProps} />;
  if (currentScreen === 'TasksNotesManagement') return <TasksNotesManagementScreen {...screenProps} />;
  if (currentScreen === 'AllSchedule')          return <AllScheduleScreen {...screenProps} />;
  if (currentScreen === 'AllCases')             return <AllCasesScreen {...screenProps} />;
  if (currentScreen === 'AllTasks')             return <AllTasksScreen {...screenProps} />;
  if (currentScreen === 'AllDocuments')         return <AllDocumentsScreen {...screenProps} />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.row}>
            <Image source={{ uri: user?.avatar_url || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg' }} style={styles.avatar} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.welcomeText}>Welcome back, {firstName}</Text>
              <Text style={styles.firmText}>{firmName}</Text>
            </View>
          </View>
          <TouchableOpacity style={{ position: 'relative' }} onPress={() => navigateTo('Notifications')}>
            <Icon lib="ION" name="notifications-outline" size={26} color={COLORS.white} />
            <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>7</Text></View>
          </TouchableOpacity>
        </View>
        <View style={styles.searchWrap}>
          <Icon lib="FA" name="search" size={18} color="rgba(255,255,255,0.7)" />
          <TextInput style={styles.searchInput} placeholder="Search cases, clients, documents..." placeholderTextColor="rgba(255,255,255,0.6)" />
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <View style={styles.statsGrid}>
            {STATS_LIVE.map((s, i) => <StatCard key={i} item={s} />)}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Quick Actions" />
          <Text style={styles.managementSubtitle}>Tap a module to open its full management screen</Text>
          <View style={styles.mgmtGrid}>
            {MANAGEMENT_ACTIONS.map((item, i) => <ManagementCard key={i} item={item} onPress={navigateTo} />)}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: COLORS.blue50 }]}>
          <SectionHeader title="Today's Schedule" action="View All ›" onAction={() => navigateTo('AllSchedule')} />
          {scheduleEvents.map((event) => (
            <ScheduleCard key={event.id} event={event} navigateTo={navigateTo} />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Active Cases" action="See All ›" onAction={() => navigateTo('AllCases')} />
          {casesDisplay.map((c, i) => (
            <CaseCard key={i} item={c} onViewDetails={(caseItem) => setSelectedCase(caseItem)} />
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: COLORS.amber50 }]}>
          <SectionHeader title="Pending Tasks" action="View All ›" onAction={() => navigateTo('AllTasks')} />
          {TASKS.map((t, i) => <TaskCard key={i} item={t} />)}
          <TouchableOpacity style={styles.addTaskBtn} onPress={() => navigateTo('AddTask')}>
            <Icon lib="FA5" name="plus" size={14} color={COLORS.amber600} />
            <Text style={styles.addTaskBtnText}>Add New Task</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Recent Documents" action="View All ›" onAction={() => navigateTo('AllDocuments')} />
          {DOCUMENTS.map((d, i) => <DocumentCard key={i} item={d} />)}
        </View>

        <View style={[styles.section, { backgroundColor: '#EEF2FF' }]}>
          <TouchableOpacity style={styles.aiCard} onPress={() => navigateTo('AIAssistant')}>
            <View style={styles.row}>
              <View style={styles.aiIconWrap}>
                <Icon lib="FA5" name="robot" size={24} color={COLORS.white} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.aiTitle}>AI Legal Assistant</Text>
                <Text style={styles.aiSub}>Tap to open your intelligent legal companion</Text>
              </View>
              <Icon lib="FA5" name="chevron-right" size={14} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flex: 1, backgroundColor: COLORS.gray50 },
  header: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: COLORS.white },
  welcomeText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  firmText: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  notifBadge: { position: 'absolute', top: -3, right: -3, backgroundColor: COLORS.red500, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, gap: 10 },
  searchInput: { flex: 1, color: COLORS.white, fontSize: 14 },
  section: { paddingHorizontal: 20, paddingVertical: 20, backgroundColor: COLORS.white, marginBottom: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.dark },
  sectionAction: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  managementSubtitle: { fontSize: 12, color: COLORS.gray500, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', backgroundColor: COLORS.white, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: COLORS.gray100 },
  statTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  statIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statBadgeText: { fontSize: 11, fontWeight: '600' },
  statCount: { fontSize: 24, fontWeight: '800', color: COLORS.dark, marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '500', color: COLORS.gray500 },
  mgmtGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  mgmtCard: { width: (W - 40 - 12) / 2 - 1, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, position: 'relative', overflow: 'hidden' },
  mgmtIconCircle: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  mgmtLabel: { fontSize: 15, fontWeight: '800', lineHeight: 18 },
  mgmtSublabel: { fontSize: 11, color: COLORS.gray500, marginTop: 2, marginBottom: 10 },
  mgmtBadge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
  mgmtBadgeText: { fontSize: 11, fontWeight: '700' },
  mgmtArrow: { position: 'absolute', bottom: 12, right: 12, width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: COLORS.gray100, marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
  cardSubtitle: { fontSize: 13, color: COLORS.gray600, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  tagText: { fontSize: 11, fontWeight: '600' },
  tagBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarSm: { width: 24, height: 24, borderRadius: 12, marginRight: 6 },
  avatarMd: { width: 32, height: 32, borderRadius: 16 },
  clientName: { fontSize: 12, fontWeight: '500', color: COLORS.gray600 },
  clientNameBold: { fontSize: 12, fontWeight: '700', color: COLORS.dark },
  clientRole: { fontSize: 11, color: COLORS.gray500 },
  gray500Sm: { fontSize: 12, color: COLORS.gray500 },
  scheduleTop: { flexDirection: 'row', marginBottom: 12 },
  scheduleTime: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  scheduleTimeText: { fontSize: 12, fontWeight: '700' },
  schedulePeriod: { fontSize: 11 },
  scheduleInfo: { flex: 1 },
  scheduleBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  caseMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  caseIdBadge: { backgroundColor: COLORS.blue50, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  caseIdText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  caseClient: { marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  caseStats: { flexDirection: 'row', marginBottom: 12 },
  caseStat: { flex: 1, alignItems: 'center' },
  caseStatBordered: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.gray100 },
  caseStatLabel: { fontSize: 11, color: COLORS.gray500, marginBottom: 2 },
  caseStatVal: { fontSize: 13, fontWeight: '700', color: COLORS.dark },
  btnPrimary: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  btnPrimaryText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: COLORS.gray400, marginRight: 12, marginTop: 2 },
  docIcon: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aiCard: { backgroundColor: COLORS.indigo600, borderRadius: 20, padding: 18 },
  aiIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  aiSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  addTaskBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.amber600, marginTop: 4 },
  addTaskBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.amber600 },
});