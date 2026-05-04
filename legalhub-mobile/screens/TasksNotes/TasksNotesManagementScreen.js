import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';

const C = {
  primary: '#1E40AF', secondary: '#3B82F6', dark: '#1E293B', white: '#FFFFFF',
  g50: '#F9FAFB', g100: '#F3F4F6', g200: '#E5E7EB', g400: '#9CA3AF', g500: '#6B7280', g600: '#4B5563',
  red50: '#FEF2F2', red100: '#FEE2E2', red600: '#DC2626',
  amber50: '#FFFBEB', amber100: '#FEF3C7', amber600: '#D97706',
  green50: '#F0FDF4', green100: '#DCFCE7', green600: '#16A34A',
  blue50: '#EFF6FF', blue100: '#DBEAFE', blue600: '#2563EB',
  purple50: '#FAF5FF', purple100: '#F3E8FF', purple600: '#9333EA',
};

const FILTER_TABS = ['All Tasks', 'Pending', 'Completed', 'Notes', 'Important'];

const URGENT_TASKS = [
  { title: 'File Motion to Dismiss', due: 'Due Today - 5:00 PM', dueColor: C.red600, dueBg: C.red50, caseId: 'CR-2024-1247', caseIdColor: C.primary, caseIdBg: C.blue50, desc: 'Complete and submit motion documents to criminal court for State vs. Johnson case', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', client: 'Marcus Johnson', actionIcon: 'paperclip', actionLabel: '3 Files', actionColor: C.primary, actionBg: C.blue50, borderColor: C.red600 },
  { title: 'Prepare Witness Statement', due: 'Due Today - 6:00 PM', dueColor: C.red600, dueBg: C.red50, caseId: 'CR-2024-1247', caseIdColor: C.primary, caseIdBg: C.blue50, desc: "Draft and finalize witness statements for tomorrow's hearing", avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', client: 'Marcus Johnson', actionIcon: 'microphone', actionLabel: 'Voice Note', actionColor: C.purple600, actionBg: C.purple50, borderColor: C.red600 },
  { title: 'Review Contract Amendment', due: 'Due Tomorrow', dueColor: C.amber600, dueBg: C.amber50, caseId: 'CV-2024-0892', caseIdColor: C.primary, caseIdBg: C.blue50, desc: 'Review and provide feedback on contract modifications requested by Mitchell Corp', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', client: 'Sarah Mitchell', actionIcon: 'robot', actionLabel: 'AI Review', actionColor: C.primary, actionBg: C.blue50, borderColor: C.amber600 },
];

const PENDING_TASKS = [
  { title: 'Prepare Discovery Documents', due: 'Due Mar 18', dueColor: C.blue600, dueBg: C.blue50, caseId: 'FM-2024-0453', desc: 'Compile all discovery materials for Chen estate case', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg', client: 'Robert Chen', actionIcon: null },
  { title: 'Draft Settlement Proposal', due: 'Due Mar 19', dueColor: C.blue600, dueBg: C.blue50, caseId: 'CV-2024-0892', desc: 'Create comprehensive settlement offer for Mitchell Corp dispute', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', client: 'Sarah Mitchell', actionIcon: 'robot', actionLabel: 'AI Draft', actionColor: C.primary, actionBg: C.blue50 },
  { title: 'Client Follow-up Call', due: 'Due Mar 20', dueColor: C.green600, dueBg: C.green50, caseId: 'Multiple', desc: 'Schedule and conduct follow-up calls with 3 clients regarding case updates', avatars: ['https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg', 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg'], actionIcon: 'phone', actionLabel: 'Call', actionColor: C.green600, actionBg: C.green50 },
];

const VOICE_NOTES = [
  { title: 'Client Consultation Notes', time: 'Recorded today at 2:30 PM • 4m 32s', caseId: 'CV-2024-0892', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', transcript: '"Client expressed concerns about timeline. Discussed potential settlement options. Need to review contract clause 14.2 and prepare amendment proposal. Follow up next Tuesday..."', actions: [{ icon: 'play', bg: C.purple50, color: C.purple600 }, { icon: 'share', bg: C.blue50, color: C.primary }] },
  { title: 'Witness Interview Summary', time: 'Recorded today at 11:15 AM • 7m 18s', caseId: 'CR-2024-1247', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', transcript: '"Witness provided detailed account of incident. Key points: timeline matches security footage, corroborates client statement. Need to prepare formal witness statement and schedule deposition..."', actions: [{ icon: 'play', bg: C.purple50, color: C.purple600 }, { icon: 'robot', bg: C.blue50, color: C.primary }] },
  { title: 'Case Strategy Discussion', time: 'Recorded yesterday at 3:45 PM • 5m 52s', caseId: 'CR-2024-1247', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', transcript: '"Discussed case strategy with senior partner. Agreed to focus on procedural defense. Need to file motion within 3 days. Research similar precedents from 2019-2022..."', actions: [{ icon: 'play', bg: C.purple50, color: C.purple600 }, { icon: 'star', bg: C.amber50, color: C.amber600 }] },
];

export default function TasksNotesManagementScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState(0);
  const [checked, setChecked] = useState({});

  const toggleCheck = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const TaskCard = ({ task, id, urgent }) => (
    <View style={[s.taskCard, { borderLeftColor: task.borderColor || C.g200 }]}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          style={[s.checkbox, checked[id] && { backgroundColor: C.primary, borderColor: C.primary }]}
          onPress={() => toggleCheck(id)}
        >
          {checked[id] && <FontAwesome5 name="check" size={10} color={C.white} />}
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={[s.taskTitle, checked[id] && { textDecorationLine: 'line-through', color: C.g400 }]}>{task.title}</Text>
            <TouchableOpacity><FontAwesome5 name="ellipsis-v" size={13} color={C.g400} /></TouchableOpacity>
          </View>
          <Text style={s.taskDesc} numberOfLines={2}>{task.desc}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <View style={[s.pill, { backgroundColor: task.dueBg }]}>
              <FontAwesome5 name="clock" size={9} color={task.dueColor} />
              <Text style={[s.pillTxt, { color: task.dueColor }]}>{task.due}</Text>
            </View>
            <View style={[s.pill, { backgroundColor: task.caseIdBg || C.g100 }]}>
              <Text style={[s.pillTxt, { color: task.caseIdColor || C.g600 }]}>{task.caseId}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.g100 }}>
            {task.avatars ? (
              <View style={{ flexDirection: 'row' }}>
                {task.avatars.map((av, i) => (
                  <Image key={i} source={{ uri: av }} style={[s.avatarTiny, { marginLeft: i > 0 ? -8 : 0, zIndex: task.avatars.length - i }]} />
                ))}
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Image source={{ uri: task.avatar }} style={s.avatarTiny} />
                <Text style={s.clientMeta}>{task.client}</Text>
              </View>
            )}
            {task.actionIcon && (
              <TouchableOpacity style={[s.pill, { backgroundColor: task.actionBg, paddingHorizontal: 10, paddingVertical: 6 }]}>
                <FontAwesome5 name={task.actionIcon} size={11} color={task.actionColor} />
                <Text style={[s.pillTxt, { color: task.actionColor }]}>{task.actionLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );

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
            <Text style={s.headerTitle}>Tasks & Notes</Text>
            <Text style={s.headerSub}>Manage tasks, notes & voice memos</Text>
          </View>
          <TouchableOpacity style={s.backBtn}>
            <FontAwesome5 name="plus" size={16} color={C.white} />
          </TouchableOpacity>
        </View>
        <View style={s.searchRow}>
          <FontAwesome5 name="search" size={14} color="rgba(255,255,255,0.7)" />
          <TextInput style={s.searchInput} placeholder="Search tasks, notes..." placeholderTextColor="rgba(255,255,255,0.6)" />
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* STATS 4 cols */}
        <View style={[s.section, { backgroundColor: C.blue50 }]}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { icon: 'tasks', iconColor: C.primary, iconBg: C.blue100, value: '28', label: 'Total' },
              { icon: 'clock', iconColor: C.amber600, iconBg: C.amber100, value: '12', label: 'Pending' },
              { icon: 'check', iconColor: C.green600, iconBg: C.green100, value: '16', label: 'Done' },
              { icon: 'sticky-note', iconColor: C.purple600, iconBg: C.purple100, value: '34', label: 'Notes' },
            ].map((st, i) => (
              <View key={i} style={s.statCard}>
                <View style={[s.statIcon, { backgroundColor: st.iconBg }]}>
                  <FontAwesome5 name={st.icon} size={16} color={st.iconColor} />
                </View>
                <Text style={s.statVal}>{st.value}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={s.section}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={[s.qaCard, { backgroundColor: C.primary, flex: 1 }]}>
              <View style={s.qaIconWrap}><FontAwesome5 name="plus" size={20} color={C.white} /></View>
              <View><Text style={s.qaLabel}>Add Task</Text><Text style={s.qaSub}>Create new task</Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={[s.qaCard, { backgroundColor: C.purple600, flex: 1 }]}>
              <View style={s.qaIconWrap}><FontAwesome5 name="microphone" size={20} color={C.white} /></View>
              <View><Text style={s.qaLabel}>Voice Note</Text><Text style={s.qaSub}>Record & transcribe</Text></View>
            </TouchableOpacity>
          </View>
        </View>

        {/* FILTER TABS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterBar} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}>
          {FILTER_TABS.map((t, i) => (
            <TouchableOpacity key={i} style={[s.filterTab, activeFilter === i && s.filterTabActive]} onPress={() => setActiveFilter(i)}>
              <Text style={[s.filterTabTxt, activeFilter === i && s.filterTabTxtActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* URGENT TASKS */}
        <View style={[s.section, { backgroundColor: '#FFF8F8' }]}>
          <View style={s.sHRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[s.sIconWrap, { backgroundColor: C.red100 }]}><FontAwesome5 name="exclamation-triangle" size={13} color={C.red600} /></View>
              <Text style={s.sectionTitle}>Urgent Tasks</Text>
            </View>
            <View style={[s.pill, { backgroundColor: C.red100, paddingHorizontal: 10, paddingVertical: 5 }]}>
              <Text style={[s.pillTxt, { color: C.red600, fontWeight: '700' }]}>3 Due Today</Text>
            </View>
          </View>
          {URGENT_TASKS.map((t, i) => <TaskCard key={i} task={t} id={`urgent-${i}`} urgent />)}
        </View>

        {/* PENDING TASKS */}
        <View style={s.section}>
          <View style={s.sHRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[s.sIconWrap, { backgroundColor: C.blue100 }]}><FontAwesome5 name="list-check" size={13} color={C.primary} /></View>
              <Text style={s.sectionTitle}>Pending Tasks</Text>
            </View>
            <TouchableOpacity><Text style={s.sectionAction}>View All (9)</Text></TouchableOpacity>
          </View>
          {PENDING_TASKS.map((t, i) => <TaskCard key={i} task={{ ...t, borderColor: C.g200 }} id={`pending-${i}`} />)}
        </View>

        {/* VOICE NOTES */}
        <View style={[s.section, { backgroundColor: C.purple50 }]}>
          <View style={s.sHRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[s.sIconWrap, { backgroundColor: C.purple100 }]}><FontAwesome5 name="microphone" size={13} color={C.purple600} /></View>
              <Text style={s.sectionTitle}>Voice Notes</Text>
            </View>
            <TouchableOpacity><Text style={s.sectionAction}>View All (12)</Text></TouchableOpacity>
          </View>
          {VOICE_NOTES.map((vn, i) => (
            <View key={i} style={s.voiceCard}>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 10 }}>
                <View style={s.micIcon}><FontAwesome5 name="microphone" size={20} color={C.purple600} /></View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={s.voiceTitle}>{vn.title}</Text>
                    <TouchableOpacity><FontAwesome5 name="ellipsis-v" size={13} color={C.g400} /></TouchableOpacity>
                  </View>
                  <Text style={s.voiceTime}>{vn.time}</Text>
                </View>
              </View>
              <View style={s.transcriptBox}>
                <Text style={s.transcriptTxt} numberOfLines={3}>{vn.transcript}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <View style={[s.pill, { backgroundColor: C.blue50 }]}>
                    <Text style={[s.pillTxt, { color: C.primary }]}>{vn.caseId}</Text>
                  </View>
                  <Image source={{ uri: vn.avatar }} style={s.avatarTiny} />
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {vn.actions.map((a, j) => (
                    <TouchableOpacity key={j} style={[s.actionBtn, { backgroundColor: a.bg }]}>
                      <FontAwesome5 name={a.icon} size={13} color={a.color} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.primary },
  scroll: { flex: 1, backgroundColor: C.g50 },
  header: { backgroundColor: C.primary, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.white },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, gap: 10 },
  searchInput: { flex: 1, color: C.white, fontSize: 13 },
  section: { paddingHorizontal: 16, paddingVertical: 18, backgroundColor: C.white, marginBottom: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.dark },
  sectionAction: { fontSize: 13, fontWeight: '700', color: C.primary },
  sHRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  filterBar: { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.g200, maxHeight: 52, flexGrow: 0 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, backgroundColor: C.g100 },
  filterTabActive: { backgroundColor: C.primary },
  filterTabTxt: { fontSize: 12, fontWeight: '600', color: C.g600 },
  filterTabTxtActive: { color: C.white },
  statCard: { flex: 1, backgroundColor: C.white, borderRadius: 16, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 2 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statVal: { fontSize: 20, fontWeight: '800', color: C.dark },
  statLabel: { fontSize: 10, color: C.g500, marginTop: 1 },
  qaCard: { borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  qaIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontSize: 14, fontWeight: '700', color: C.white },
  qaSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  taskCard: { backgroundColor: C.white, borderRadius: 16, padding: 14, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: C.g100, marginBottom: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: C.g400, alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  taskTitle: { fontSize: 14, fontWeight: '700', color: C.dark, flex: 1, marginRight: 8 },
  taskDesc: { fontSize: 12, color: C.g600, lineHeight: 18 },
  avatarTiny: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: C.white },
  clientMeta: { fontSize: 12, color: C.g600, fontWeight: '500' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  pillTxt: { fontSize: 11, fontWeight: '600' },
  voiceCard: { backgroundColor: C.white, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: '#E9D5FF', marginBottom: 10 },
  micIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: C.purple100, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  voiceTitle: { fontSize: 14, fontWeight: '700', color: C.dark, flex: 1, marginRight: 6 },
  voiceTime: { fontSize: 11, color: C.g400, marginTop: 3 },
  transcriptBox: { backgroundColor: C.purple50, borderRadius: 12, padding: 12 },
  transcriptTxt: { fontSize: 13, color: C.g600, lineHeight: 20, fontStyle: 'italic' },
  actionBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
