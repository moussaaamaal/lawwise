import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { FontAwesome5, FontAwesome, Ionicons } from '@expo/vector-icons';

const C = {
  primary: '#1E40AF', secondary: '#3B82F6', dark: '#1E293B', white: '#FFFFFF',
  g50: '#F9FAFB', g100: '#F3F4F6', g200: '#E5E7EB', g400: '#9CA3AF', g500: '#6B7280', g600: '#4B5563',
  red50: '#FEF2F2', red100: '#FEE2E2', red500: '#EF4444', red600: '#DC2626',
  amber50: '#FFFBEB', amber100: '#FEF3C7', amber600: '#D97706',
  green50: '#F0FDF4', green100: '#DCFCE7', green600: '#16A34A',
  blue50: '#EFF6FF', blue100: '#DBEAFE', blue600: '#2563EB',
  purple50: '#FAF5FF', purple100: '#F3E8FF', purple600: '#9333EA',
  indigo50: '#EEF2FF', indigo600: '#4F46E5',
};

// ─── Données enrichies par caseId ─────────────────────────────────────────
const EVENT_EXTRA = {
  'CR-2024-1247': {
    court: 'Manhattan Criminal Court', room: 'Room 305', judge: 'Hon. Patricia Williams',
    attorney: 'Sarah Williams', phone: '+1 (555) 234-5678', email: 'm.johnson@email.com',
    address: '742 Evergreen Terrace, Springfield',
    notes: 'Client must appear 30 min early for security clearance. Bring original ID and all documents.',
    documents: [
      { icon: 'file-pdf',  iconColor: C.red600,   iconBg: C.red100,  name: 'Motion to Dismiss v3.pdf',   size: '2.4 MB' },
      { icon: 'file-word', iconColor: C.blue600,  iconBg: C.blue100, name: 'Defense Summary.docx',        size: '1.1 MB' },
    ],
    tasks: [
      { title: 'File Motion to Dismiss', done: false, due: 'Due Today', dueColor: C.red600 },
      { title: 'Prepare witness list',   done: true,  due: 'Done',      dueColor: C.green600 },
    ],
    timeline: [
      { icon: 'gavel',    bg: C.red100,   color: C.red600,   label: 'Hearing',  text: 'Criminal Court Hearing scheduled', time: 'Today 09:30' },
      { icon: 'file-alt', bg: C.blue100,  color: C.primary,  label: 'Filing',   text: 'Motion to Dismiss submitted',      time: 'Yesterday'   },
      { icon: 'users',    bg: C.green100, color: C.green600, label: 'Meeting',  text: 'Strategy meeting with client',      time: '2 days ago'  },
    ],
  },
  'CV-2024-0892': {
    court: 'New York Civil Court', room: 'Room 12', judge: 'Hon. James T. Murphy',
    attorney: 'Michael Chen', phone: '+1 (555) 987-6543', email: 's.mitchell@mitchellcorp.com',
    address: '1200 Fifth Avenue, New York',
    notes: 'Bring the amended contract and all correspondence from January 2024 onwards.',
    documents: [
      { icon: 'file-word', iconColor: C.blue600,  iconBg: C.blue100,  name: 'Contract Amendment Final.docx', size: '1.8 MB' },
      { icon: 'file-pdf',  iconColor: C.red600,   iconBg: C.red100,   name: 'Case Summary.pdf',              size: '980 KB' },
    ],
    tasks: [
      { title: 'Review contract amendment', done: false, due: 'Due Tomorrow', dueColor: C.amber600 },
      { title: 'Notify opposing counsel',   done: true,  due: 'Done',         dueColor: C.green600 },
    ],
    timeline: [
      { icon: 'gavel',       bg: C.amber100, color: C.amber600, label: 'Hearing', text: 'Mitchell Corp. Hearing scheduled', time: 'Mar 18'   },
      { icon: 'file-alt',    bg: C.blue100,  color: C.primary,  label: 'Filing',  text: 'Contract uploaded to portal',     time: 'Mar 5'    },
      { icon: 'handshake',   bg: C.green100, color: C.green600, label: 'Client',  text: 'Intro meeting with client',       time: 'Dec 2023' },
    ],
  },
  'EM-2024-0345': {
    court: 'NLRB Mediation Center', room: 'Mediation Room B', judge: 'Mediator J. Collins',
    attorney: 'Michael Chen', phone: '+1 (555) 234-9876', email: 't.davis@email.com',
    address: '34 Midtown Ave, New York',
    notes: 'Mediation session — both parties must be present. Settlement authority required.',
    documents: [
      { icon: 'file-pdf',  iconColor: C.red600,   iconBg: C.red100,   name: 'Mediation Brief.pdf',    size: '1.3 MB' },
      { icon: 'file-word', iconColor: C.blue600,  iconBg: C.blue100,  name: 'Settlement Draft.docx',  size: '740 KB' },
    ],
    tasks: [
      { title: 'Prepare settlement terms', done: false, due: 'Due Mar 19', dueColor: C.amber600 },
      { title: 'Gather pay stubs',         done: true,  due: 'Done',       dueColor: C.green600 },
    ],
    timeline: [
      { icon: 'handshake', bg: C.amber100,  color: C.amber600, label: 'Mediation', text: 'Mediation scheduled',           time: 'Mar 19'   },
      { icon: 'file-alt',  bg: C.blue100,   color: C.primary,  label: 'Filing',    text: 'NLRB complaint submitted',      time: 'Feb 20'   },
      { icon: 'users',     bg: C.green100,  color: C.green600, label: 'Meeting',   text: 'Initial consultation w/ client', time: 'Feb 15'  },
    ],
  },
  'PI-2024-0678': {
    court: 'Queens Civil Court', room: 'Room 8', judge: 'Hon. Antonio Rivera',
    attorney: 'Sarah Williams', phone: '+1 (555) 321-6549', email: 'j.williams@email.com',
    address: '88 Queens Blvd, Queens, NY',
    notes: 'Client should bring all medical records and doctor`s notes from the accident date.',
    documents: [
      { icon: 'file-pdf',   iconColor: C.red600,  iconBg: C.red100,  name: 'Medical Records.pdf',         size: '4.2 MB' },
      { icon: 'file-image', iconColor: C.blue600, iconBg: C.blue100, name: 'Accident_Scene_Photo_01.jpg',  size: '3.2 MB' },
    ],
    tasks: [
      { title: 'Collect expert testimony', done: false, due: 'Due Tomorrow', dueColor: C.red600 },
      { title: 'File police report copy',  done: true,  due: 'Done',         dueColor: C.green600 },
    ],
    timeline: [
      { icon: 'gavel',    bg: C.red100,   color: C.red600,   label: 'Hearing', text: 'Personal Injury Hearing',         time: 'Tomorrow' },
      { icon: 'file-alt', bg: C.blue100,  color: C.primary,  label: 'Filing',  text: 'Complaint filed with court',      time: 'Feb 3'    },
      { icon: 'users',    bg: C.green100, color: C.green600, label: 'Client',  text: 'Initial consultation',            time: 'Feb 1'    },
    ],
  },
  'FM-2024-0453': {
    court: 'Surrogate Court, NY', room: 'Office Visit', judge: 'Hon. Linda Park',
    attorney: 'Jennifer Davis', phone: '+1 (555) 456-7890', email: 'r.chen@email.com',
    address: '55 Riverside Dr, New York',
    notes: 'Bring asset list and existing will documents. Session estimated 90 minutes.',
    documents: [
      { icon: 'file-word', iconColor: C.blue600,  iconBg: C.blue100,  name: 'Estate Distribution Plan.docx', size: '2.2 MB' },
      { icon: 'file-pdf',  iconColor: C.red600,   iconBg: C.red100,   name: 'Will Draft v2.pdf',             size: '1.5 MB' },
    ],
    tasks: [
      { title: 'Review asset distribution',  done: false, due: 'Due Mar 20', dueColor: C.primary  },
      { title: 'Send estate summary',        done: true,  due: 'Done',       dueColor: C.green600 },
    ],
    timeline: [
      { icon: 'users',    bg: C.green100, color: C.green600, label: 'Meeting', text: 'Estate planning session',      time: 'Mar 20'   },
      { icon: 'file-alt', bg: C.blue100,  color: C.primary,  label: 'Draft',   text: 'Will draft uploaded',          time: 'Mar 3'    },
      { icon: 'users',    bg: C.purple50, color: C.purple600,label: 'Client',  text: 'Initial consultation w/ Chen', time: 'Nov 2023' },
    ],
  },
};

const DEFAULT_EXTRA = {
  court: 'Internal / Virtual', room: 'Conference Room A', judge: 'N/A',
  attorney: 'Legal Team', phone: '+1 (555) 000-0000', email: 'team@sterlinglaw.com',
  address: 'Sterling & Associates, 42 Park Ave, New York',
  notes: 'Internal team meeting. Please review the latest case updates before joining.',
  documents: [],
  tasks: [{ title: 'Prepare case summary slides', done: false, due: 'Due Today', dueColor: C.amber600 }],
  timeline: [
    { icon: 'users', bg: C.blue100, color: C.primary, label: 'Meeting', text: 'Weekly team review scheduled', time: 'Today 04:30' },
  ],
};

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────
export default function EventDetailsScreen({ event, navigation }) {
  const [activeTab, setActiveTab] = useState('overview');
  const extra = (event?.caseId && EVENT_EXTRA[event.caseId]) || DEFAULT_EXTRA;

  const TABS = ['overview', 'documents', 'tasks', 'timeline'];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── HEADER ── */}
      <View style={[s.header, { borderBottomColor: event?.borderColor || C.primary }]}>
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()}>
            <FontAwesome5 name="arrow-left" size={16} color={C.white} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.headerTitle} numberOfLines={1}>{event?.title || 'Event Details'}</Text>
            <Text style={s.headerSub}>{event?.subtitle || ''}</Text>
          </View>
          <TouchableOpacity style={s.moreBtn}>
            <FontAwesome5 name="ellipsis-v" size={16} color={C.white} />
          </TouchableOpacity>
        </View>

        {/* ── Countdown pill + priority ── */}
        <View style={s.headerMeta}>
          <View style={[s.timePill, { backgroundColor: event?.timeBg || C.blue100 }]}>
            <FontAwesome5 name="clock" size={11} color={event?.timeColor || C.primary} />
            <Text style={[s.timePillTxt, { color: event?.timeColor || C.primary }]}>
              {event?.time} {event?.period}
            </Text>
          </View>
          <View style={[s.priorityPill, { backgroundColor: event?.priorityBg || C.blue50 }]}>
            <Text style={[s.priorityPillTxt, { color: event?.priorityColor || C.primary }]}>
              {event?.priority}
            </Text>
          </View>
          <View style={[s.tagPill, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={s.tagPillTxt}>{event?.tag}</Text>
          </View>
        </View>
      </View>

      {/* ── TABS ── */}
      <View style={s.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabTxt, activeTab === tab && s.tabTxtActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* ══════════════ OVERVIEW ══════════════ */}
        {activeTab === 'overview' && (
          <View>
            {/* Client card */}
            <View style={s.card}>
              <Text style={s.sectionTitle}>Client Information</Text>
              <View style={s.clientRow}>
                <Image source={{ uri: event?.avatar }} style={s.avatar} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.clientName}>{event?.client}</Text>
                  {event?.caseId && <Text style={s.caseId}>{event?.caseId}</Text>}
                </View>
                <View style={s.contactBtns}>
                  <TouchableOpacity style={[s.contactBtn, { backgroundColor: C.green50 }]}>
                    <FontAwesome name="whatsapp" size={16} color={C.green600} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.contactBtn, { backgroundColor: C.blue50 }]}>
                    <FontAwesome5 name="phone" size={14} color={C.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.contactBtn, { backgroundColor: C.purple50 }]}>
                    <FontAwesome5 name="envelope" size={14} color={C.purple600} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={s.infoGrid}>
                <InfoRow icon="phone"         label="Phone"   value={extra.phone}   />
                <InfoRow icon="envelope"      label="Email"   value={extra.email}   />
                <InfoRow icon="map-marker-alt"label="Address" value={extra.address} />
              </View>
            </View>

            {/* Event details */}
            <View style={s.card}>
              <Text style={s.sectionTitle}>Event Details</Text>
              <View style={s.infoGrid}>
                <InfoRow icon="building"     label="Court / Venue" value={extra.court}    />
                <InfoRow icon="door-open"    label="Room"          value={extra.room}     />
                <InfoRow icon="user-tie"     label="Judge"         value={extra.judge}    />
                <InfoRow icon="balance-scale"label="Attorney"      value={extra.attorney} />
              </View>
            </View>

            {/* Notes */}
            <View style={[s.card, { backgroundColor: C.amber50, borderColor: '#FCD34D', borderWidth: 1 }]}>
              <View style={s.row}>
                <FontAwesome5 name="sticky-note" size={14} color={C.amber600} />
                <Text style={[s.sectionTitle, { marginLeft: 8, color: C.amber600 }]}>Notes & Instructions</Text>
              </View>
              <Text style={s.noteText}>{extra.notes}</Text>
            </View>

            {/* Quick actions */}
            <View style={s.card}>
              <Text style={s.sectionTitle}>Quick Actions</Text>
              <View style={s.actionGrid}>
                {[
                  { icon: 'map-marker-alt', label: 'Directions',  bg: C.blue50,   color: C.primary   },
                  { icon: 'bell',           label: 'Reminder',    bg: C.amber50,  color: C.amber600  },
                  { icon: 'robot',          label: 'AI Prep',     bg: C.indigo50, color: C.indigo600 },
                  { icon: 'share-alt',      label: 'Share',       bg: C.green50,  color: C.green600  },
                ].map((a, i) => (
                  <TouchableOpacity key={i} style={[s.actionCard, { backgroundColor: a.bg }]}>
                    <FontAwesome5 name={a.icon} size={18} color={a.color} />
                    <Text style={[s.actionLabel, { color: a.color }]}>{a.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ══════════════ DOCUMENTS ══════════════ */}
        {activeTab === 'documents' && (
          <View>
            {extra.documents.length === 0 ? (
              <View style={s.emptyState}>
                <FontAwesome5 name="folder-open" size={36} color={C.g400} />
                <Text style={s.emptyTxt}>No documents for this event</Text>
              </View>
            ) : extra.documents.map((doc, i) => (
              <View key={i} style={s.card}>
                <View style={s.row}>
                  <View style={[s.docIcon, { backgroundColor: doc.iconBg }]}>
                    <FontAwesome5 name={doc.icon} size={22} color={doc.iconColor} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.docName} numberOfLines={1}>{doc.name}</Text>
                    <Text style={s.docSize}>{doc.size}</Text>
                  </View>
                  <View style={s.row}>
                    <TouchableOpacity style={[s.docBtn, { backgroundColor: C.blue50 }]}>
                      <FontAwesome5 name="eye" size={13} color={C.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.docBtn, { backgroundColor: C.green50, marginLeft: 6 }]}>
                      <FontAwesome5 name="download" size={13} color={C.green600} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
            <TouchableOpacity style={s.uploadCta}>
              <FontAwesome5 name="cloud-upload-alt" size={16} color={C.primary} />
              <Text style={s.uploadCtaTxt}>Upload Document</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ══════════════ TASKS ══════════════ */}
        {activeTab === 'tasks' && (
          <View>
            {extra.tasks.map((task, i) => (
              <View key={i} style={[s.card, s.row, { gap: 12 }]}>
                <View style={[s.checkbox, task.done && s.checkboxDone]}>
                  {task.done && <FontAwesome5 name="check" size={10} color={C.white} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.taskTitle, task.done && s.taskTitleDone]}>{task.title}</Text>
                  <Text style={[s.taskDue, { color: task.dueColor }]}>{task.due}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={s.uploadCta}>
              <FontAwesome5 name="plus" size={14} color={C.primary} />
              <Text style={s.uploadCtaTxt}>Add Task</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ══════════════ TIMELINE ══════════════ */}
        {activeTab === 'timeline' && (
          <View>
            {extra.timeline.map((item, i) => (
              <View key={i} style={s.timelineRow}>
                <View style={s.timelineLeft}>
                  <View style={[s.timelineIcon, { backgroundColor: item.bg }]}>
                    <FontAwesome5 name={item.icon} size={14} color={item.color} />
                  </View>
                  {i < extra.timeline.length - 1 && <View style={s.timelineLine} />}
                </View>
                <View style={[s.card, { flex: 1, marginBottom: 12 }]}>
                  <View style={s.row}>
                    <View style={[s.tlBadge, { backgroundColor: item.bg }]}>
                      <Text style={[s.tlBadgeTxt, { color: item.color }]}>{item.label}</Text>
                    </View>
                    <Text style={[s.tlTime, { marginLeft: 'auto' }]}>{item.time}</Text>
                  </View>
                  <Text style={s.tlText}>{item.text}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── InfoRow helper ───────────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoIconWrap}>
        <FontAwesome5 name={icon} size={12} color={C.primary} />
      </View>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.primary },
  scroll: { flex: 1, backgroundColor: C.g50 },
  row:    { flexDirection: 'row', alignItems: 'center' },

  // Header
  header: { backgroundColor: C.primary, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18, borderBottomWidth: 3 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  moreBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.white },
  headerSub:   { fontSize: 11, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  headerMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  timePillTxt: { fontSize: 12, fontWeight: '700' },
  priorityPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  priorityPillTxt: { fontSize: 11, fontWeight: '700' },
  tagPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  tagPillTxt: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },

  // Tabs
  tabBar: { flexDirection: 'row', backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.g200 },
  tab: { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: C.primary },
  tabTxt: { fontSize: 12, fontWeight: '600', color: C.g500 },
  tabTxtActive: { color: C.primary, fontWeight: '700' },

  // Cards
  card: { backgroundColor: C.white, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: C.g100, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: C.dark, marginBottom: 12 },

  // Client
  clientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.g100 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  clientName: { fontSize: 14, fontWeight: '700', color: C.dark },
  caseId: { fontSize: 11, color: C.primary, fontWeight: '600', marginTop: 2 },
  contactBtns: { flexDirection: 'row', gap: 6 },
  contactBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  // Info grid
  infoGrid: { gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: C.blue50, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  infoLabel: { fontSize: 10, color: C.g400, marginBottom: 1 },
  infoValue: { fontSize: 13, fontWeight: '600', color: C.dark },

  // Notes
  noteText: { fontSize: 13, color: C.g600, lineHeight: 20, marginTop: 4 },

  // Action grid
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '47%', borderRadius: 14, padding: 14, alignItems: 'center', gap: 8 },
  actionLabel: { fontSize: 12, fontWeight: '700' },

  // Documents
  docIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  docName: { fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 2 },
  docSize: { fontSize: 11, color: C.g400 },
  docBtn: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  // Tasks
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: C.g400, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkboxDone: { backgroundColor: C.primary, borderColor: C.primary },
  taskTitle: { fontSize: 14, fontWeight: '700', color: C.dark },
  taskTitleDone: { textDecorationLine: 'line-through', color: C.g400 },
  taskDue: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  // Timeline
  timelineRow: { flexDirection: 'row', gap: 12 },
  timelineLeft: { alignItems: 'center' },
  timelineIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  timelineLine: { width: 2, flex: 1, backgroundColor: C.g200, marginVertical: 4 },
  tlBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  tlBadgeTxt: { fontSize: 10, fontWeight: '700' },
  tlTime: { fontSize: 11, color: C.g400 },
  tlText: { fontSize: 13, color: C.g600, marginTop: 6, lineHeight: 18 },

  // Upload CTA
  uploadCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: C.primary, backgroundColor: C.blue50, marginTop: 4 },
  uploadCtaTxt: { fontSize: 13, fontWeight: '700', color: C.primary },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyTxt: { fontSize: 14, color: C.g400, fontWeight: '500' },
});
