import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const COLORS = {
  amber: '#D97706', amberDark: '#92400E', dark: '#1E293B',
  white: '#FFFFFF', gray50: '#F9FAFB', gray100: '#F3F4F6',
  gray200: '#E5E7EB', gray400: '#9CA3AF', gray500: '#6B7280', gray600: '#4B5563',
};

const PRIORITIES = [
  { key: 'low', label: 'Low', color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
  { key: 'medium', label: 'Medium', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { key: 'high', label: 'High', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
];

const CATEGORIES = ['Court Filing', 'Document Review', 'Client Meeting', 'Research', 'Correspondence', 'Discovery', 'Billing', 'Other'];

export default function AddTaskScreen({ navigation }) {
  const [form, setForm] = useState({
    title: '', case: '', category: '', priority: 'medium',
    assignedTo: '', dueDate: '', dueTime: '', description: '',
    reminder: false, recurringTask: false,
  });
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const selectedPriority = PRIORITIES.find(p => p.key === form.priority) || PRIORITIES[1];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.amber} />

      <View style={s.header}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
            <FontAwesome5 name="arrow-left" size={16} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Add Task</Text>
          <TouchableOpacity style={s.backBtn}>
            <FontAwesome5 name="ellipsis-v" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero Banner */}
        <View style={s.heroBanner}>
          <View style={s.heroIconWrap}>
            <FontAwesome5 name="tasks" size={26} color={COLORS.white} />
          </View>
          <View>
            <Text style={s.heroTitle}>New Task</Text>
            <Text style={s.heroSub}>Create a task for a case</Text>
          </View>
        </View>

        {/* Task Title */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Task Details</Text>
          <Field label="Task Title *" placeholder="e.g., File Motion to Dismiss" value={form.title} onChange={v => update('title', v)} icon="tasks" />

          <Text style={s.label}>Related Case *</Text>
          {['CR-2024-1247 — State vs. Johnson', 'CV-2024-0892 — Mitchell Corp.', 'FM-2024-0453 — Chen Estate'].map(c => (
            <TouchableOpacity key={c} style={[s.caseRow, form.case === c && s.caseRowActive]} onPress={() => update('case', c)}>
              <View style={[s.radio, form.case === c && s.radioActive]}>
                {form.case === c && <View style={s.radioDot} />}
              </View>
              <Text style={[s.caseText, form.case === c && s.caseTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Priority */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Priority Level</Text>
          <View style={s.priorityRow}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p.key}
                style={[s.priorityBtn, { backgroundColor: p.bg, borderColor: form.priority === p.key ? p.color : p.border }]}
                onPress={() => update('priority', p.key)}
              >
                <FontAwesome5 name="flag" size={14} color={p.color} />
                <Text style={[s.priorityText, { color: p.color }]}>{p.label}</Text>
                {form.priority === p.key && <FontAwesome5 name="check-circle" size={13} color={p.color} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Task Category</Text>
          <View style={s.catGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[s.catBtn, form.category === cat && s.catBtnActive]}
                onPress={() => update('category', cat)}
              >
                <Text style={[s.catText, form.category === cat && s.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due Date */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Due Date & Time</Text>
          <View style={s.dateRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Due Date</Text>
              <TouchableOpacity style={s.dateBtn} onPress={() => update('dueDate', 'Mar 18, 2024')}>
                <FontAwesome5 name="calendar" size={13} color={COLORS.amber} />
                <Text style={[s.dateBtnText, !form.dueDate && { color: COLORS.gray400 }]}>
                  {form.dueDate || 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Due Time</Text>
              <TouchableOpacity style={s.dateBtn} onPress={() => update('dueTime', '5:00 PM')}>
                <FontAwesome5 name="clock" size={13} color={COLORS.amber} />
                <Text style={[s.dateBtnText, !form.dueTime && { color: COLORS.gray400 }]}>
                  {form.dueTime || 'Select time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Date Buttons */}
          <View style={s.quickDates}>
            {['Today', 'Tomorrow', 'This Week', 'Next Week'].map(d => (
              <TouchableOpacity key={d} style={[s.quickDate, form.dueDate === d && s.quickDateActive]} onPress={() => update('dueDate', d)}>
                <Text style={[s.quickDateText, form.dueDate === d && s.quickDateTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Assign */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Assign To</Text>
          <View style={s.assignRow}>
            {['Me', 'David Sterling', 'Jessica Park', 'Michael Torres'].map(a => (
              <TouchableOpacity key={a} style={[s.assignChip, form.assignedTo === a && s.assignChipActive]} onPress={() => update('assignedTo', a)}>
                <View style={[s.assignAvatar, form.assignedTo === a && { backgroundColor: COLORS.amber }]}>
                  <Text style={[s.assignAvatarText, form.assignedTo === a && { color: COLORS.white }]}>
                    {a.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <Text style={[s.assignName, form.assignedTo === a && s.assignNameActive]}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Description</Text>
          <TextInput
            style={[s.input, { height: 90, textAlignVertical: 'top', paddingTop: 12 }]}
            placeholder="Add any extra details, context, or instructions for this task..."
            placeholderTextColor={COLORS.gray400}
            value={form.description}
            onChangeText={v => update('description', v)}
            multiline
          />
        </View>

        {/* Toggles */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Options</Text>
          <View style={s.optRow}>
            <View style={s.optLeft}>
              <FontAwesome5 name="bell" size={14} color={COLORS.gray500} />
              <View style={{ marginLeft: 12 }}>
                <Text style={s.optTitle}>Set Reminder</Text>
                <Text style={s.optSub}>Get notified before due date</Text>
              </View>
            </View>
            <TouchableOpacity style={[s.toggle, form.reminder && s.toggleOn]} onPress={() => update('reminder', !form.reminder)}>
              <View style={[s.knob, form.reminder && s.knobOn]} />
            </TouchableOpacity>
          </View>
          <View style={[s.optRow, { marginTop: 12 }]}>
            <View style={s.optLeft}>
              <FontAwesome5 name="redo" size={14} color={COLORS.gray500} />
              <View style={{ marginLeft: 12 }}>
                <Text style={s.optTitle}>Recurring Task</Text>
                <Text style={s.optSub}>Repeat this task periodically</Text>
              </View>
            </View>
            <TouchableOpacity style={[s.toggle, form.recurringTask && s.toggleOn]} onPress={() => update('recurringTask', !form.recurringTask)}>
              <View style={[s.knob, form.recurringTask && s.knobOn]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.btnSecondary} onPress={() => navigation?.goBack()}>
          <Text style={s.btnSecondaryText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnPrimary}>
          <FontAwesome5 name="check" size={14} color={COLORS.white} />
          <Text style={[s.btnPrimaryText, { marginLeft: 8 }]}>Create Task</Text>
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
  safe: { flex: 1, backgroundColor: COLORS.amber },
  scroll: { flex: 1, backgroundColor: COLORS.gray50 },
  header: { backgroundColor: COLORS.amber, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  heroBanner: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.amber, paddingHorizontal: 20, paddingBottom: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  heroIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  section: { margin: 16, backgroundColor: COLORS.white, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.dark, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.dark, marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.dark, backgroundColor: COLORS.white },
  caseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, marginBottom: 6, borderWidth: 1.5, borderColor: COLORS.gray200 },
  caseRowActive: { borderColor: COLORS.amber, backgroundColor: '#FFFBEB' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.gray300, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.amber },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.amber },
  caseText: { fontSize: 13, color: COLORS.gray600, flex: 1 },
  caseTextActive: { color: COLORS.amber, fontWeight: '600' },
  priorityRow: { gap: 10 },
  priorityBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 2, marginBottom: 6 },
  priorityText: { fontSize: 14, fontWeight: '700', flex: 1 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.gray200 },
  catBtnActive: { backgroundColor: COLORS.amber, borderColor: COLORS.amber },
  catText: { fontSize: 12, fontWeight: '600', color: COLORS.gray600 },
  catTextActive: { color: COLORS.white },
  dateRow: { flexDirection: 'row' },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12 },
  dateBtnText: { fontSize: 13, color: COLORS.dark, fontWeight: '500' },
  quickDates: { flexDirection: 'row', gap: 8, marginTop: 10 },
  quickDate: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.gray200, alignItems: 'center' },
  quickDateActive: { backgroundColor: COLORS.amber, borderColor: COLORS.amber },
  quickDateText: { fontSize: 11, fontWeight: '600', color: COLORS.gray600 },
  quickDateTextActive: { color: COLORS.white },
  assignRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  assignChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.gray200 },
  assignChipActive: { borderColor: COLORS.amber, backgroundColor: '#FFFBEB' },
  assignAvatar: { width: 30, height: 30, borderRadius: 9, backgroundColor: COLORS.gray100, alignItems: 'center', justifyContent: 'center' },
  assignAvatarText: { fontSize: 10, fontWeight: '800', color: COLORS.gray600 },
  assignName: { fontSize: 12, fontWeight: '600', color: COLORS.dark },
  assignNameActive: { color: COLORS.amber },
  optRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optLeft: { flexDirection: 'row', alignItems: 'center' },
  optTitle: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  optSub: { fontSize: 11, color: COLORS.gray500 },
  toggle: { width: 48, height: 26, borderRadius: 13, backgroundColor: COLORS.gray200, paddingHorizontal: 2, justifyContent: 'center' },
  toggleOn: { backgroundColor: COLORS.amber },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.white, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
  knobOn: { marginLeft: 22 },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  btnPrimary: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.amber, paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  btnSecondary: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.gray200, alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText: { fontSize: 15, fontWeight: '600', color: COLORS.gray600 },
});
