import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';

import EventDetailsScreen from './EventDetailsScreen';

const C = {
  primary: '#1E40AF', secondary: '#3B82F6', dark: '#1E293B', white: '#FFFFFF',
  g50: '#F9FAFB', g100: '#F3F4F6', g200: '#E5E7EB', g400: '#9CA3AF', g500: '#6B7280', g600: '#4B5563',
  red50: '#FEF2F2', red100: '#FEE2E2', red500: '#EF4444', red600: '#DC2626',
  amber50: '#FFFBEB', amber100: '#FEF3C7', amber500: '#F59E0B', amber600: '#D97706',
  green50: '#F0FDF4', green100: '#DCFCE7', green600: '#16A34A',
  blue50: '#EFF6FF', blue100: '#DBEAFE', blue600: '#2563EB',
  purple50: '#FAF5FF', purple100: '#F3E8FF', purple600: '#9333EA',
  indigo600: '#4F46E5',
};

const FILTER_TABS = ['All', 'Today', 'Tomorrow', 'This Week', 'Urgent'];

const SCHEDULE_DATA = [
  {
    date: 'Today — March 6, 2026', isToday: true,
    events: [
      { time: '09:30', period: 'AM', title: 'Criminal Court Hearing', subtitle: 'State vs. Johnson - Room 305', priority: 'Urgent', priorityColor: C.red600, priorityBg: C.red50, tag: 'Criminal Law', borderColor: C.red500, timeBg: C.red100, timeColor: C.red600, client: 'Marcus Johnson', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', caseId: 'CR-2024-1247', actions: [{ lib: 'FA5', name: 'map-marker-alt', bg: C.blue50, color: C.primary }, { lib: 'FA', name: 'whatsapp', bg: C.green50, color: C.green600 }] },
      { time: '11:00', period: 'AM', title: 'Client Meeting', subtitle: 'Contract Review - Office', priority: 'Medium', priorityColor: C.amber600, priorityBg: C.amber50, tag: 'Corporate', borderColor: C.amber500, timeBg: C.amber100, timeColor: C.amber600, client: 'Sarah Mitchell', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', caseId: 'CV-2024-0892', actions: [{ lib: 'FA5', name: 'phone', bg: C.blue50, color: C.primary }, { lib: 'FA5', name: 'envelope', bg: C.purple50, color: C.purple600 }] },
      { time: '02:00', period: 'PM', title: 'Document Submission', subtitle: 'Civil Court - Case #2024-567', priority: 'Normal', priorityColor: C.blue600, priorityBg: C.blue50, tag: 'Civil Law', borderColor: C.secondary, timeBg: C.blue100, timeColor: C.blue600, client: 'Robert Chen', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg', caseId: 'FM-2024-0453', actions: [{ lib: 'FA5', name: 'file-pdf', bg: C.green50, color: C.green600 }] },
      { time: '04:30', period: 'PM', title: 'Team Strategy Meeting', subtitle: 'Weekly case review - Conference Room A', priority: 'Normal', priorityColor: C.blue600, priorityBg: C.blue50, tag: 'Internal', borderColor: C.secondary, timeBg: C.blue100, timeColor: C.blue600, client: 'Legal Team', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg', caseId: null, actions: [{ lib: 'FA5', name: 'video', bg: C.purple50, color: C.purple600 }] },
    ],
  },
  {
    date: 'Tomorrow — March 7, 2026', isToday: false,
    events: [
      { time: '10:00', period: 'AM', title: 'Personal Injury Hearing', subtitle: 'Williams vs. City Transit - Room 8', priority: 'Urgent', priorityColor: C.red600, priorityBg: C.red50, tag: 'Personal Injury', borderColor: C.red500, timeBg: C.red100, timeColor: C.red600, client: 'Jennifer Williams', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg', caseId: 'PI-2024-0678', actions: [{ lib: 'FA5', name: 'gavel', bg: C.red50, color: C.red600 }, { lib: 'FA', name: 'whatsapp', bg: C.green50, color: C.green600 }] },
      { time: '02:30', period: 'PM', title: 'Mediation Session', subtitle: 'Davis Employment Dispute', priority: 'Medium', priorityColor: C.amber600, priorityBg: C.amber50, tag: 'Employment', borderColor: C.amber500, timeBg: C.amber100, timeColor: C.amber600, client: 'Thomas Davis', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', caseId: 'EM-2024-0345', actions: [{ lib: 'FA5', name: 'handshake', bg: C.amber50, color: C.amber600 }, { lib: 'FA5', name: 'phone', bg: C.blue50, color: C.primary }] },
    ],
  },
  {
    date: 'March 18, 2026', isToday: false,
    events: [
      { time: '11:00', period: 'AM', title: 'Mitchell Corp. Hearing', subtitle: 'Breach of Contract - New York Civil Court', priority: 'Medium', priorityColor: C.amber600, priorityBg: C.amber50, tag: 'Corporate Law', borderColor: C.amber500, timeBg: C.amber100, timeColor: C.amber600, client: 'Sarah Mitchell', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', caseId: 'CV-2024-0892', actions: [{ lib: 'FA5', name: 'gavel', bg: C.amber50, color: C.amber600 }, { lib: 'FA5', name: 'envelope', bg: C.purple50, color: C.purple600 }] },
    ],
  },
  {
    date: 'March 19, 2026', isToday: false,
    events: [
      { time: '02:30', period: 'PM', title: 'Davis Mediation', subtitle: 'Wrongful Termination — NLRB', priority: 'Medium', priorityColor: C.amber600, priorityBg: C.amber50, tag: 'Employment Law', borderColor: C.amber500, timeBg: C.amber100, timeColor: C.amber600, client: 'Thomas Davis', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', caseId: 'EM-2024-0345', actions: [{ lib: 'FA5', name: 'handshake', bg: C.amber50, color: C.amber600 }] },
      { time: '05:00', period: 'PM', title: 'Motion Filing Deadline', subtitle: 'State vs. Johnson — Manhattan Criminal Court', priority: 'Urgent', priorityColor: C.red600, priorityBg: C.red50, tag: 'Deadline', borderColor: C.red500, timeBg: C.red100, timeColor: C.red600, client: 'Marcus Johnson', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', caseId: 'CR-2024-1247', actions: [{ lib: 'FA5', name: 'bell', bg: C.red50, color: C.red600 }] },
    ],
  },
  {
    date: 'March 20, 2026', isToday: false,
    events: [
      { time: '02:00', period: 'PM', title: 'Chen Estate Planning Meeting', subtitle: 'Asset Distribution Review', priority: 'Normal', priorityColor: C.green600, priorityBg: C.green50, tag: 'Family Law', borderColor: C.green600, timeBg: C.green100, timeColor: C.green600, client: 'Robert Chen', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg', caseId: 'FM-2024-0453', actions: [{ lib: 'FA5', name: 'users', bg: C.blue50, color: C.primary }, { lib: 'FA', name: 'whatsapp', bg: C.green50, color: C.green600 }] },
    ],
  },
];

const STATS = [
  { val: '8', label: "Today's Events", iconBg: C.blue100,  iconColor: C.primary,  icon: 'calendar-day'  },
  { val: '3', label: 'Urgent',         iconBg: C.red100,   iconColor: C.red600,   icon: 'exclamation'   },
  { val: '5', label: 'This Week',      iconBg: C.green100, iconColor: C.green600, icon: 'calendar-week' },
];

export default function AllScheduleScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState(0);
  // Etat pour naviguer vers EventDetailsScreen
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Si un event est sélectionné → afficher la page détail
  if (selectedEvent) {
    return (
      <EventDetailsScreen
        event={selectedEvent}
        navigation={{ goBack: () => setSelectedEvent(null) }}
      />
    );
  }

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
            <Text style={s.headerTitle}>Schedule</Text>
            <Text style={s.headerSub}>All upcoming events & hearings</Text>
          </View>
          <TouchableOpacity style={s.addBtn}>
            <FontAwesome5 name="plus" size={14} color={C.white} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {STATS.map((st, i) => (
            <View key={i} style={s.statItem}>
              <View style={[s.statIcon, { backgroundColor: st.iconBg }]}>
                <FontAwesome5 name={st.icon} size={14} color={st.iconColor} />
              </View>
              <Text style={s.statVal}>{st.val}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* FILTER TABS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterBar}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}
      >
        {FILTER_TABS.map((t, i) => (
          <TouchableOpacity
            key={i}
            style={[s.filterTab, activeFilter === i && s.filterTabActive]}
            onPress={() => setActiveFilter(i)}
          >
            <Text style={[s.filterTabTxt, activeFilter === i && s.filterTabTxtActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* LIST */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {SCHEDULE_DATA.map((group, gi) => (
          <View key={gi} style={{ marginBottom: 8 }}>

            {/* Group header */}
            <View style={s.groupHeader}>
              <View style={[s.groupDot, { backgroundColor: group.isToday ? C.red500 : C.g400 }]} />
              <Text style={[s.groupTitle, group.isToday && { color: C.primary }]}>{group.date}</Text>
              {group.isToday && (
                <View style={s.todayPill}>
                  <Text style={s.todayPillTxt}>TODAY</Text>
                </View>
              )}
              <Text style={s.groupCount}>{group.events.length} events</Text>
            </View>

            {/* Events */}
            {group.events.map((ev, ei) => (
              <View key={ei} style={[s.card, { borderLeftWidth: 4, borderLeftColor: ev.borderColor }]}>
                <View style={s.cardTop}>
                  {/* Time */}
                  <View style={[s.timeBox, { backgroundColor: ev.timeBg }]}>
                    <Text style={[s.timeVal, { color: ev.timeColor }]}>{ev.time}</Text>
                    <Text style={[s.timePeriod, { color: ev.timeColor }]}>{ev.period}</Text>
                  </View>
                  {/* Info */}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.eventTitle}>{ev.title}</Text>
                    <Text style={s.eventSub}>{ev.subtitle}</Text>
                    <View style={s.tagRow}>
                      <View style={[s.pill, { backgroundColor: ev.priorityBg }]}>
                        <Text style={[s.pillTxt, { color: ev.priorityColor }]}>{ev.priority}</Text>
                      </View>
                      <View style={[s.pill, { backgroundColor: C.g100 }]}>
                        <Text style={[s.pillTxt, { color: C.g600 }]}>{ev.tag}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Footer */}
                <View style={s.cardFooter}>
                  <View style={s.clientRow}>
                    <Image source={{ uri: ev.avatar }} style={s.avatar} />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={s.clientName}>{ev.client}</Text>
                      {ev.caseId && <Text style={s.caseId}>{ev.caseId}</Text>}
                    </View>
                  </View>
                  <View style={s.actionsRow}>
                    {ev.actions.map((a, ai) => (
                      <TouchableOpacity key={ai} style={[s.iconBtn, { backgroundColor: a.bg }]}>
                        {a.lib === 'FA'
                          ? <FontAwesome  name={a.name} size={14} color={a.color} />
                          : <FontAwesome5 name={a.name} size={14} color={a.color} />}
                      </TouchableOpacity>
                    ))}

                    {/* ✅ View button → navigate to EventDetailsScreen */}
                    <TouchableOpacity
                      style={s.viewBtn}
                      onPress={() => setSelectedEvent(ev)}
                    >
                      <Text style={s.viewBtnTxt}>View</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.primary },
  scroll: { flex: 1, backgroundColor: C.g50 },
  header: { backgroundColor: C.primary, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.white },
  headerSub:   { fontSize: 11, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statItem:  { alignItems: 'center', gap: 4 },
  statIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statVal:   { fontSize: 18, fontWeight: '800', color: C.white },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.72)' },
  filterBar:        { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.g200, maxHeight: 52, flexGrow: 0 },
  filterTab:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, backgroundColor: C.g100 },
  filterTabActive:  { backgroundColor: C.primary },
  filterTabTxt:     { fontSize: 12, fontWeight: '600', color: C.g600 },
  filterTabTxtActive: { color: C.white },
  groupHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  groupDot:     { width: 8, height: 8, borderRadius: 4 },
  groupTitle:   { fontSize: 14, fontWeight: '700', color: C.dark, flex: 1 },
  groupCount:   { fontSize: 11, color: C.g400 },
  todayPill:    { backgroundColor: C.red50, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  todayPillTxt: { fontSize: 10, fontWeight: '800', color: C.red600 },
  card:       { backgroundColor: C.white, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: C.g100, marginBottom: 10 },
  cardTop:    { flexDirection: 'row', marginBottom: 12 },
  timeBox:    { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  timeVal:    { fontSize: 13, fontWeight: '800' },
  timePeriod: { fontSize: 10, fontWeight: '600' },
  eventTitle: { fontSize: 14, fontWeight: '700', color: C.dark, marginBottom: 2 },
  eventSub:   { fontSize: 12, color: C.g500, marginBottom: 6 },
  tagRow:     { flexDirection: 'row', gap: 6 },
  pill:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillTxt:    { fontSize: 11, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: C.g100 },
  clientRow:  { flexDirection: 'row', alignItems: 'center' },
  avatar:     { width: 28, height: 28, borderRadius: 14 },
  clientName: { fontSize: 12, fontWeight: '700', color: C.dark },
  caseId:     { fontSize: 10, color: C.primary, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn:    { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  viewBtn:    { backgroundColor: C.primary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  viewBtnTxt: { fontSize: 12, fontWeight: '700', color: C.white },
});