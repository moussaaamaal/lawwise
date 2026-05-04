import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
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
};


const TASKS = [
  { id: 1, title: 'File Motion to Dismiss', desc: 'Prepare and submit motion with all supporting documentation', due: 'Due Today 5:00 PM', dueColor: C.red600, dueBg: C.red50, caseId: 'CR-2024-1247', caseName: 'State vs. Johnson', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', client: 'Marcus Johnson', priority: 'urgent', priorityColor: C.red600, priorityBg: C.red50, borderColor: C.red500, timeLeft: '3 hours left', timeColor: C.red600, done: false, assignee: 'Sarah Williams', actions: [{ lib: 'FA5', name: 'file-alt', bg: C.blue50, color: C.primary, label: '3 Files' }, { lib: 'FA5', name: 'robot', bg: C.purple50, color: C.purple600, label: 'AI Review' }] },
  { id: 2, title: 'Review Contract Amendment', desc: 'Analyse the new contract terms and prepare summary notes', due: 'Due Today 3:00 PM', dueColor: C.red600, dueBg: C.red50, caseId: 'CV-2024-0892', caseName: 'Mitchell Corp. Dispute', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', client: 'Sarah Mitchell', priority: 'urgent', priorityColor: C.red600, priorityBg: C.red50, borderColor: C.red500, timeLeft: '1 hour left', timeColor: C.red600, done: false, assignee: 'Michael Chen', actions: [{ lib: 'FA5', name: 'robot', bg: C.blue50, color: C.primary, label: 'AI Draft' }] },
  { id: 3, title: 'Prepare Witness List', desc: 'Compile and verify all witness names and contact information', due: 'Due Tomorrow 3:00 PM', dueColor: C.amber600, dueBg: C.amber50, caseId: 'CR-2024-1247', caseName: 'State vs. Johnson', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', client: 'Marcus Johnson', priority: 'medium', priorityColor: C.amber600, priorityBg: C.amber50, borderColor: C.amber600, timeLeft: '1 day left', timeColor: C.amber600, done: false, assignee: 'Jennifer Davis', actions: [{ lib: 'FA5', name: 'users', bg: C.green50, color: C.green600, label: 'Contacts' }] },
  { id: 4, title: 'Schedule Mediation Session', desc: 'Coordinate with both parties for mediation date and venue', due: 'Due Tomorrow 5:00 PM', dueColor: C.amber600, dueBg: C.amber50, caseId: 'EM-2024-0345', caseName: 'Davis Employment Dispute', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', client: 'Thomas Davis', priority: 'medium', priorityColor: C.amber600, priorityBg: C.amber50, borderColor: C.amber600, timeLeft: '1 day left', timeColor: C.amber600, done: false, assignee: 'Michael Chen', actions: [{ lib: 'FA5', name: 'calendar-plus', bg: C.purple50, color: C.purple600, label: 'Schedule' }] },
  { id: 5, title: 'Upload Evidence Documents', desc: 'Scan and upload prosecution evidence files to case portal', due: 'Due Mar 18', dueColor: C.primary, dueBg: C.blue50, caseId: 'CR-2024-1247', caseName: 'State vs. Johnson', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', client: 'Marcus Johnson', priority: 'normal', priorityColor: C.primary, priorityBg: C.blue50, borderColor: C.secondary, timeLeft: '2 days left', timeColor: C.primary, done: false, assignee: 'Paralegal', actions: [{ lib: 'FA5', name: 'cloud-upload-alt', bg: C.blue50, color: C.primary, label: 'Upload' }] },
  { id: 6, title: 'Client Meeting — Estate Planning', desc: 'Discuss asset distribution and beneficiary assignments', due: 'Due Mar 20', dueColor: C.primary, dueBg: C.blue50, caseId: 'FM-2024-0453', caseName: 'Chen Estate Planning', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg', client: 'Robert Chen', priority: 'normal', priorityColor: C.green600, priorityBg: C.green50, borderColor: C.green600, timeLeft: '4 days left', timeColor: C.green600, done: false, assignee: 'Jennifer Davis', actions: [{ lib: 'FA5', name: 'calendar-check', bg: C.green50, color: C.green600, label: 'Calendar' }] },
  { id: 7, title: 'Draft Opening Statement', desc: 'Write initial opening argument for trial proceedings', due: 'Completed', dueColor: C.green600, dueBg: C.green50, caseId: 'CR-2024-1247', caseName: 'State vs. Johnson', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', client: 'Marcus Johnson', priority: 'done', priorityColor: C.green600, priorityBg: C.green50, borderColor: C.green600, timeLeft: null, timeColor: null, done: true, assignee: 'Sarah Williams', actions: [] },
  { id: 8, title: 'Send Payment Reminder — Invoice #091', desc: 'Follow up with client regarding overdue payment', due: 'Completed', dueColor: C.green600, dueBg: C.green50, caseId: 'CV-2024-0892', caseName: 'Mitchell Corp.', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', client: 'Sarah Mitchell', priority: 'done', priorityColor: C.green600, priorityBg: C.green50, borderColor: C.green600, timeLeft: null, timeColor: null, done: true, assignee: 'Admin', actions: [] },
];

const STATS = [
  { val: '28', label: 'Total Tasks',   icon: 'tasks',       iconBg: C.blue100,  iconColor: C.primary   },
  { val: '6',  label: 'Urgent',        icon: 'fire',        iconBg: C.red100,   iconColor: C.red600    },
  { val: '12', label: 'Pending',       icon: 'clock',       iconBg: C.amber100, iconColor: C.amber600  },
  { val: '16', label: 'Done',          icon: 'check-circle',iconBg: C.green100, iconColor: C.green600  },
];

export default function AllTasksScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState(0);
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState({});

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const filtered = TASKS.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.caseName.toLowerCase().includes(search.toLowerCase()) ||
    t.client.toLowerCase().includes(search.toLowerCase())
  );

  const pending = filtered.filter(t => !t.done);
  const done    = filtered.filter(t => t.done);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* HEADER */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()}>
            <FontAwesome5 name="arrow-left" size={16} color={C.white} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.headerTitle}>All Tasks</Text>
            <Text style={s.headerSub}>28 tasks total</Text>
          </View>
          <TouchableOpacity style={s.addBtn}>
            <FontAwesome5 name="plus" size={14} color={C.white} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {STATS.map((st, i) => (
            <View key={i} style={s.statItem}>
              <View style={[s.statIconWrap, { backgroundColor: st.iconBg }]}>
                <FontAwesome5 name={st.icon} size={13} color={st.iconColor} />
              </View>
              <Text style={s.statVal}>{st.val}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.7)" />
          <TextInput style={s.searchInput} placeholder="Search tasks, cases, clients..." placeholderTextColor="rgba(255,255,255,0.6)"
            value={search} onChangeText={setSearch} />
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* PENDING SECTION */}
        {pending.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <View style={s.sectionLabelRow}>
              <View style={[s.sectionDot, { backgroundColor: C.amber600 }]} />
              <Text style={s.sectionLabel}>Pending ({pending.length})</Text>
            </View>
            {pending.map((task) => (
              <TaskCard key={task.id} task={task} checked={!!checked[task.id]} onToggle={() => toggle(task.id)} />
            ))}
          </View>
        )}

        {/* COMPLETED SECTION */}
        {done.length > 0 && (
          <View>
            <View style={s.sectionLabelRow}>
              <View style={[s.sectionDot, { backgroundColor: C.green600 }]} />
              <Text style={s.sectionLabel}>Completed ({done.length})</Text>
            </View>
            {done.map((task) => (
              <TaskCard key={task.id} task={task} checked={true} onToggle={() => {}} />
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function TaskCard({ task, checked, onToggle }) {
  return (
    <View style={[s.card, { borderLeftWidth: 4, borderLeftColor: task.borderColor, opacity: task.done ? 0.7 : 1 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        {/* Checkbox */}
        <TouchableOpacity style={[s.checkbox, checked && s.checkboxDone]} onPress={onToggle}>
          {checked && <FontAwesome5 name="check" size={10} color={C.white} />}
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          {/* Title row */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={[s.taskTitle, task.done && s.taskTitleDone]}>{task.title}</Text>
            <View style={[s.pill, { backgroundColor: task.dueBg }]}>
              <Text style={[s.pillTxt, { color: task.dueColor }]}>{task.due}</Text>
            </View>
          </View>

          <Text style={s.taskDesc}>{task.desc}</Text>

          {/* Case info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 10 }}>
            <View style={s.caseChip}>
              <FontAwesome5 name="briefcase" size={9} color={C.primary} />
              <Text style={s.caseChipTxt}>{task.caseId}</Text>
            </View>
            <Image source={{ uri: task.avatar }} style={s.avatar} />
            <Text style={s.clientName}>{task.client}</Text>
            {task.timeLeft && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                <FontAwesome5 name="clock" size={10} color={task.timeColor} />
                <Text style={[s.timeLeft, { color: task.timeColor }]}>{task.timeLeft}</Text>
              </View>
            )}
          </View>

          
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.primary },
  scroll: { flex: 1, backgroundColor: C.g50 },
  header: { backgroundColor: C.primary, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.white },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.72)' },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, paddingVertical: 12, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statItem: { alignItems: 'center', gap: 3 },
  statIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 17, fontWeight: '800', color: C.white },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.72)' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, color: C.white, fontSize: 13 },
  filterBar: { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.g200, maxHeight: 52, flexGrow: 0 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, backgroundColor: C.g100 },
  filterTabActive: { backgroundColor: C.primary },
  filterTabTxt: { fontSize: 12, fontWeight: '600', color: C.g600 },
  filterTabTxtActive: { color: C.white },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: C.dark },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: C.g100, marginBottom: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: C.g400, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  checkboxDone: { backgroundColor: C.primary, borderColor: C.primary },
  taskTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: C.dark, marginRight: 8 },
  taskTitleDone: { textDecorationLine: 'line-through', color: C.g400 },
  taskDesc: { fontSize: 12, color: C.g500, lineHeight: 17 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, flexShrink: 0 },
  pillTxt: { fontSize: 11, fontWeight: '600' },
  caseChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.blue50, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  caseChipTxt: { fontSize: 10, fontWeight: '700', color: C.primary },
  avatar: { width: 20, height: 20, borderRadius: 10 },
  clientName: { fontSize: 11, color: C.g600, fontWeight: '500' },
  timeLeft: { fontSize: 11, fontWeight: '700' },
  assignee: { fontSize: 11, color: C.g500, marginLeft: 5 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  actionBtnTxt: { fontSize: 11, fontWeight: '600' },
});
