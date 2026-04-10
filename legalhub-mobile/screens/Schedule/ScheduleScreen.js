import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const COLORS = {
  pink: '#DB2777', pinkLight: '#EC4899', dark: '#1E293B',
  white: '#FFFFFF', gray50: '#F9FAFB', gray100: '#F3F4F6',
  gray200: '#E5E7EB', gray400: '#9CA3AF', gray500: '#6B7280', gray600: '#4B5563',
};

const EVENT_TYPES = [
  { key: 'hearing', label: 'Court Hearing', icon: 'gavel', color: '#DC2626', bg: '#FEF2F2' },
  { key: 'meeting', label: 'Client Meeting', icon: 'users', color: '#2563EB', bg: '#EFF6FF' },
  { key: 'deadline', label: 'Filing Deadline', icon: 'file-signature', color: '#D97706', bg: '#FFFBEB' },
  { key: 'call', label: 'Phone Call', icon: 'phone', color: '#059669', bg: '#F0FDF4' },
  { key: 'deposition', label: 'Deposition', icon: 'microphone', color: '#7C3AED', bg: '#FAF5FF' },
  { key: 'other', label: 'Other', icon: 'calendar', color: '#DB2777', bg: '#FDF2F8' },
];

const TIMES = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '17:00', '18:00'];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleScreen({ navigation }) {
  const [form, setForm] = useState({
    title: '', type: '', case: '', location: '',
    date: '', time: '', duration: '60', notes: '',
    reminder: '30', recurrence: 'none',
  });
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Generate a week starting from today
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.pink} />

      <View style={s.header}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
            <FontAwesome5 name="arrow-left" size={16} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Schedule Event</Text>
          <View style={s.backBtn} />
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Calendar Strip */}
        <View style={s.calStrip}>
          <View style={s.monthRow}>
            <FontAwesome5 name="chevron-left" size={13} color={COLORS.pink} />
            <Text style={s.monthText}>{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
            <FontAwesome5 name="chevron-right" size={13} color={COLORS.pink} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            {weekDays.map((d, i) => {
              const isToday = i === 0;
              const isSelected = selectedDay === i;
              return (
                <TouchableOpacity
                  key={i}
                  style={[s.dayBtn, isSelected && s.dayBtnSelected]}
                  onPress={() => {
                    setSelectedDay(i);
                    update('date', d.toLocaleDateString());
                  }}
                >
                  <Text style={[s.dayName, isSelected && s.dayNameSelected]}>{DAYS[d.getDay()]}</Text>
                  <Text style={[s.dayNum, isSelected && s.dayNumSelected]}>{d.getDate()}</Text>
                  {isToday && <View style={[s.todayDot, isSelected && { backgroundColor: COLORS.white }]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Event Type */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Event Type</Text>
          <View style={s.typeGrid}>
            {EVENT_TYPES.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[s.typeCard, { backgroundColor: t.bg, borderColor: form.type === t.key ? t.color : '#E5E7EB' }]}
                onPress={() => update('type', t.key)}
              >
                <FontAwesome5 name={t.icon} size={18} color={t.color} />
                <Text style={[s.typeLabel, { color: t.color }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Event Details */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Event Details</Text>
          <Field label="Event Title *" placeholder="e.g., Criminal Court Hearing" value={form.title} onChange={v => update('title', v)} icon="calendar-alt" />
          <Field label="Location / Room" placeholder="e.g., Courtroom 204, City Hall" value={form.location} onChange={v => update('location', v)} icon="map-marker-alt" />

          <Text style={s.label}>Related Case</Text>
          <View style={s.caseList}>
            {['None', 'CR-2024-1247 — State vs. Johnson', 'CV-2024-0892 — Mitchell Corp.', 'FM-2024-0453 — Chen Estate'].map(c => (
              <TouchableOpacity key={c} style={[s.caseRow, form.case === c && s.caseRowActive]} onPress={() => update('case', c)}>
                <View style={[s.radio, form.case === c && s.radioActive]}>
                  {form.case === c && <View style={s.radioDot} />}
                </View>
                <Text style={[s.caseText, form.case === c && s.caseTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Date & Time</Text>

          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Date</Text>
              <TouchableOpacity style={s.dateBtn}>
                <FontAwesome5 name="calendar" size={14} color={COLORS.pink} />
                <Text style={s.dateBtnText}>
                  {form.date || weekDays[selectedDay]?.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.label}>Duration</Text>
              <View style={s.durationRow}>
                {['30', '60', '90', '120'].map(d => (
                  <TouchableOpacity key={d} style={[s.durBtn, form.duration === d && s.durBtnActive]} onPress={() => update('duration', d)}>
                    <Text style={[s.durText, form.duration === d && s.durTextActive]}>{d}m</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={[s.label, { marginTop: 14 }]}>Start Time</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
            {TIMES.map(t => (
              <TouchableOpacity
                key={t}
                style={[s.timeChip, form.time === t && s.timeChipActive]}
                onPress={() => update('time', t)}
              >
                <Text style={[s.timeChipText, form.time === t && s.timeChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Reminder & Recurrence */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Notifications</Text>
          <Text style={s.label}>Remind me before</Text>
          <View style={s.reminderRow}>
            {[['15', '15 min'], ['30', '30 min'], ['60', '1 hour'], ['1440', '1 day']].map(([val, lab]) => (
              <TouchableOpacity key={val} style={[s.remBtn, form.reminder === val && s.remBtnActive]} onPress={() => update('reminder', val)}>
                <Text style={[s.remText, form.reminder === val && s.remTextActive]}>{lab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[s.label, { marginTop: 14 }]}>Recurrence</Text>
          <View style={s.recRow}>
            {[['none', 'None'], ['weekly', 'Weekly'], ['biweekly', 'Bi-weekly'], ['monthly', 'Monthly']].map(([val, lab]) => (
              <TouchableOpacity key={val} style={[s.recBtn, form.recurrence === val && s.recBtnActive]} onPress={() => update('recurrence', val)}>
                <Text style={[s.recText, form.recurrence === val && s.recTextActive]}>{lab}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={[s.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
            placeholder="Preparation notes, items to bring, agenda..."
            placeholderTextColor={COLORS.gray400}
            value={form.notes}
            onChangeText={v => update('notes', v)}
            multiline
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.btnSecondary} onPress={() => navigation?.goBack()}>
          <Text style={s.btnSecondaryText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btnPrimary, { backgroundColor: COLORS.pink }]}>
          <FontAwesome5 name="calendar-plus" size={14} color={COLORS.white} />
          <Text style={[s.btnPrimaryText, { marginLeft: 8 }]}>Schedule Event</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const Field = ({ label, placeholder, value, onChange, icon }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={s.label}>{label}</Text>
    <View style={{ position: 'relative' }}>
      {icon && <FontAwesome5 name={icon} size={13} color={COLORS.gray400} style={{ position: 'absolute', left: 14, top: 14, zIndex: 1 }} />}
      <TextInput style={[s.input, icon && { paddingLeft: 42 }]} placeholder={placeholder} placeholderTextColor={COLORS.gray400} value={value} onChangeText={onChange} />
    </View>
  </View>
);

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pink },
  scroll: { flex: 1, backgroundColor: COLORS.gray50 },
  header: { backgroundColor: COLORS.pink, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  calStrip: { backgroundColor: COLORS.white, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  monthRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 12 },
  monthText: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
  dayBtn: { width: 52, height: 68, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: COLORS.gray50, borderWidth: 1.5, borderColor: COLORS.gray200 },
  dayBtnSelected: { backgroundColor: COLORS.pink, borderColor: COLORS.pink },
  dayName: { fontSize: 11, color: COLORS.gray500, fontWeight: '600' },
  dayNameSelected: { color: 'rgba(255,255,255,0.8)' },
  dayNum: { fontSize: 17, fontWeight: '800', color: COLORS.dark },
  dayNumSelected: { color: COLORS.white },
  todayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.pink },
  section: { margin: 16, backgroundColor: COLORS.white, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.dark, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.dark, marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.dark, backgroundColor: COLORS.white },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: { width: '30%', padding: 12, borderRadius: 14, borderWidth: 2, alignItems: 'center', gap: 6 },
  typeLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  caseList: { gap: 6 },
  caseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.gray200 },
  caseRowActive: { borderColor: COLORS.pink, backgroundColor: '#FDF2F8' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.gray300, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.pink },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.pink },
  caseText: { fontSize: 13, color: COLORS.gray600, flex: 1 },
  caseTextActive: { color: COLORS.pink, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  dateBtnText: { fontSize: 13, color: COLORS.dark, fontWeight: '500' },
  durationRow: { flexDirection: 'row', gap: 6 },
  durBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.gray200, alignItems: 'center' },
  durBtnActive: { backgroundColor: COLORS.pink, borderColor: COLORS.pink },
  durText: { fontSize: 11, fontWeight: '700', color: COLORS.gray600 },
  durTextActive: { color: COLORS.white },
  timeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.gray200, backgroundColor: COLORS.white },
  timeChipActive: { backgroundColor: COLORS.pink, borderColor: COLORS.pink },
  timeChipText: { fontSize: 13, fontWeight: '600', color: COLORS.gray600 },
  timeChipTextActive: { color: COLORS.white },
  reminderRow: { flexDirection: 'row', gap: 8 },
  remBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.gray200, alignItems: 'center' },
  remBtnActive: { backgroundColor: COLORS.pink, borderColor: COLORS.pink },
  remText: { fontSize: 11, fontWeight: '600', color: COLORS.gray600 },
  remTextActive: { color: COLORS.white },
  recRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  recBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.gray200 },
  recBtnActive: { backgroundColor: COLORS.pink, borderColor: COLORS.pink },
  recText: { fontSize: 12, fontWeight: '600', color: COLORS.gray600 },
  recTextActive: { color: COLORS.white },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  btnPrimary: { flex: 1, flexDirection: 'row', paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  btnSecondary: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.gray200, alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText: { fontSize: 15, fontWeight: '600', color: COLORS.gray600 },
});
