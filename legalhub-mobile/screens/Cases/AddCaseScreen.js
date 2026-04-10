import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar, Alert, ActivityIndicator,
} from 'react-native';

import { FontAwesome5 } from '@expo/vector-icons';
import { casesAPI } from '../../services/api';

const COLORS = {
  primary: '#1E40AF', secondary: '#3B82F6', dark: '#1E293B',
  white: '#FFFFFF', gray50: '#F9FAFB', gray100: '#F3F4F6',
  gray200: '#E5E7EB', gray300: '#D1D5DB', gray400: '#9CA3AF',
  gray500: '#6B7280', gray600: '#4B5563', blue50: '#EFF6FF',
};

const CASE_TYPES = ['Criminal Law', 'Civil Law', 'Corporate Law', 'Family Law', 'Real Estate Law', 'Immigration Law', 'Personal Injury', 'Intellectual Property'];
const PRIORITIES = [
  { label: 'Low',    color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  { label: 'Medium', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { label: 'High',   color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  { label: 'Urgent', color: '#7C3AED', bg: '#FAF5FF', border: '#DDD6FE' },
];

const CASE_TYPE_MAP = {
  'Criminal Law': 'CRIMINAL', 'Civil Law': 'CIVIL',
  'Corporate Law': 'CORPORATE', 'Family Law': 'FAMILY',
  'Real Estate Law': 'REAL_ESTATE', 'Immigration Law': 'IMMIGRATION',
  'Personal Injury': 'PERSONAL_INJURY', 'Intellectual Property': 'IP',
};

export default function AddCaseScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', caseNumber: '', caseType: '', priority: '',
    court: '', judge: '', filingDate: '', description: '',
    client: '', attorney: '', notes: '',
  });

  const progress = (step / 3) * 100;
  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleCreateCase = async () => {
    if (!form.title.trim()) {
      Alert.alert('Missing Field', 'Case title is required.');
      return;
    }
    if (!form.caseType) {
      Alert.alert('Missing Field', 'Please select a case type.');
      return;
    }

    setLoading(true);
    try {
      await casesAPI.create({
        title:            form.title,
        case_number:      form.caseNumber || `CASE-${Date.now()}`,
        case_type:        CASE_TYPE_MAP[form.caseType] || 'CIVIL',
        priority:         form.priority?.toUpperCase() || 'NORMAL',
        description:      form.description,
        court_name:       form.court,
        judge_name:       form.judge,
        filing_date:      form.filingDate || null,
      });

      Alert.alert('Success', 'Case created successfully!', [
        { text: 'OK', onPress: () => navigation?.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={s.header}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
            <FontAwesome5 name="arrow-left" size={16} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Add New Case</Text>
          <View style={s.backBtn} />
        </View>
      </View>

      <View style={s.progressWrap}>
        <View style={s.progressRow}>
          <Text style={s.progressLabel}>Step {step} of 3</Text>
          <Text style={s.progressPct}>{Math.round(progress)}%</Text>
        </View>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={s.stepsRow}>
          {['Case Info', 'Parties', 'Details'].map((l, i) => (
            <Text key={i} style={[s.stepLabel, step === i + 1 && s.stepLabelActive]}>{l}</Text>
          ))}
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {step === 1 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.iconWrap}>
                <FontAwesome5 name="briefcase" size={22} color={COLORS.white} />
              </View>
              <View>
                <Text style={s.sectionTitle}>Case Information</Text>
                <Text style={s.sectionSub}>Basic case details</Text>
              </View>
            </View>

            <Field label="Case Title *" placeholder="e.g., State vs. Johnson" value={form.title} onChange={v => update('title', v)} icon="gavel" />
            <Field label="Case Number" placeholder="e.g., CR-2024-1247" value={form.caseNumber} onChange={v => update('caseNumber', v)} icon="hashtag" />

            <Text style={s.label}>Case Type *</Text>
            <View style={s.typeGrid}>
              {CASE_TYPES.map(t => (
                <TouchableOpacity key={t} style={[s.typeBtn, form.caseType === t && s.typeBtnActive]} onPress={() => update('caseType', t)}>
                  <Text style={[s.typeBtnText, form.caseType === t && s.typeBtnTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Priority Level *</Text>
            <View style={s.priorityRow}>
              {PRIORITIES.map(p => (
                <TouchableOpacity key={p.label}
                  style={[s.priorityBtn, { backgroundColor: p.bg, borderColor: form.priority === p.label ? p.color : p.border }]}
                  onPress={() => update('priority', p.label)}
                >
                  <FontAwesome5 name="flag" size={10} color={p.color} />
                  <Text style={[s.priorityText, { color: p.color }]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.iconWrap, { backgroundColor: '#7C3AED' }]}>
                <FontAwesome5 name="users" size={22} color={COLORS.white} />
              </View>
              <View>
                <Text style={s.sectionTitle}>Parties Involved</Text>
                <Text style={s.sectionSub}>Client & legal team info</Text>
              </View>
            </View>
            <Field label="Client Name *" placeholder="Full name of client" value={form.client} onChange={v => update('client', v)} icon="user" />
            <Field label="Assigned Attorney" placeholder="Attorney name" value={form.attorney} onChange={v => update('attorney', v)} icon="user-tie" />
            <Field label="Court / Jurisdiction" placeholder="e.g., Superior Court" value={form.court} onChange={v => update('court', v)} icon="landmark" />
            <Field label="Judge Name" placeholder="Honorable..." value={form.judge} onChange={v => update('judge', v)} icon="gavel" />
            <Field label="Filing Date" placeholder="YYYY-MM-DD" value={form.filingDate} onChange={v => update('filingDate', v)} icon="calendar" />
          </View>
        )}

        {step === 3 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.iconWrap, { backgroundColor: '#059669' }]}>
                <FontAwesome5 name="file-alt" size={22} color={COLORS.white} />
              </View>
              <View>
                <Text style={s.sectionTitle}>Case Details</Text>
                <Text style={s.sectionSub}>Description & notes</Text>
              </View>
            </View>

            <Text style={s.label}>Case Description</Text>
            <TextInput
              style={[s.input, s.textarea]}
              placeholder="Describe the case, key facts, charges..."
              placeholderTextColor={COLORS.gray400}
              value={form.description}
              onChangeText={v => update('description', v)}
              multiline numberOfLines={5}
            />

            <Text style={s.label}>Internal Notes</Text>
            <TextInput
              style={[s.input, s.textarea]}
              placeholder="Private notes for legal team only..."
              placeholderTextColor={COLORS.gray400}
              value={form.notes}
              onChangeText={v => update('notes', v)}
              multiline numberOfLines={4}
            />

            <View style={s.summaryCard}>
              <Text style={s.summaryTitle}>Case Summary</Text>
              {[['Title', form.title], ['Type', form.caseType], ['Priority', form.priority], ['Client', form.client]].map(([k, v]) => v ? (
                <View key={k} style={s.summaryRow}>
                  <Text style={s.summaryKey}>{k}</Text>
                  <Text style={s.summaryVal}>{v}</Text>
                </View>
              ) : null)}
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={s.footer}>
        {step > 1 && (
          <TouchableOpacity style={s.btnSecondary} onPress={() => setStep(p => p - 1)} disabled={loading}>
            <Text style={s.btnSecondaryText}>Back</Text>
          </TouchableOpacity>
        )}
        {step < 3 ? (
          <TouchableOpacity style={s.btnPrimary} onPress={() => setStep(p => p + 1)}>
            <Text style={s.btnPrimaryText}>Continue</Text>
            <FontAwesome5 name="arrow-right" size={14} color={COLORS.white} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[s.btnPrimary, { backgroundColor: '#059669' }]} onPress={handleCreateCase} disabled={loading}>
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <>
                  <FontAwesome5 name="check" size={14} color={COLORS.white} />
                  <Text style={[s.btnPrimaryText, { marginLeft: 8 }]}>Create Case</Text>
                </>
            }
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const Field = ({ label, placeholder, value, onChange, icon }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={s.label}>{label}</Text>
    <View style={s.inputWrap}>
      {icon && <FontAwesome5 name={icon} size={14} color={COLORS.gray400} style={s.inputIcon} />}
      <TextInput style={[s.input, icon && { paddingLeft: 44 }]} placeholder={placeholder} placeholderTextColor={COLORS.gray400} value={value} onChangeText={onChange} />
    </View>
  </View>
);

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flex: 1, backgroundColor: COLORS.gray50 },
  header: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  progressWrap: { backgroundColor: COLORS.white, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  progressPct: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  progressBar: { height: 6, backgroundColor: COLORS.gray200, borderRadius: 3, marginBottom: 8 },
  progressFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stepLabel: { fontSize: 11, color: COLORS.gray400 },
  stepLabelActive: { color: COLORS.primary, fontWeight: '700' },
  section: { margin: 16, backgroundColor: COLORS.white, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  iconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark },
  sectionSub: { fontSize: 12, color: COLORS.gray500 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.dark, marginBottom: 8 },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 14, top: 14, zIndex: 1 },
  input: { borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.dark, backgroundColor: COLORS.white },
  textarea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.gray200, backgroundColor: COLORS.white },
  typeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.gray600 },
  typeBtnTextActive: { color: COLORS.white },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  priorityBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', gap: 4 },
  priorityText: { fontSize: 11, fontWeight: '700' },
  summaryCard: { backgroundColor: COLORS.blue50, borderRadius: 16, padding: 14, marginTop: 8 },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#DBEAFE' },
  summaryKey: { fontSize: 12, color: COLORS.gray500 },
  summaryVal: { fontSize: 12, fontWeight: '600', color: COLORS.dark },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  btnPrimary: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  btnSecondary: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.gray200, alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText: { fontSize: 15, fontWeight: '600', color: COLORS.gray600 },
});