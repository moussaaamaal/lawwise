import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, RefreshControl, TextInput,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { clientPortalAPI } from '../../services/api';

const C = {
  primary: '#1E40AF', secondary: '#3B82F6', dark: '#1E293B',
  white: '#FFFFFF', g50: '#F9FAFB', g100: '#F3F4F6', g200: '#E5E7EB',
  g400: '#9CA3AF', g500: '#6B7280', g600: '#4B5563',
  blue50: '#EFF6FF', green50: '#F0FDF4', green600: '#16A34A',
  amber50: '#FFFBEB', amber600: '#D97706',
  red50: '#FEF2F2', red600: '#DC2626',
  gray50: '#F9FAFB',
};

const STATUS_CONFIG = {
  OPEN:        { label: 'Open',        bg: C.blue50,   color: C.primary   },
  IN_PROGRESS: { label: 'In Progress', bg: C.amber50,  color: C.amber600  },
  PENDING:     { label: 'Pending',     bg: '#FFF7ED',  color: '#EA580C'   },
  CLOSED:      { label: 'Closed',      bg: C.g100,     color: C.g500      },
  SETTLED:     { label: 'Settled',     bg: C.green50,  color: C.green600  },
};

const PRIORITY_CONFIG = {
  URGENT: { label: 'Urgent', color: C.red600 },
  HIGH:   { label: 'High',   color: '#EA580C' },
  MEDIUM: { label: 'Medium', color: C.amber600 },
  LOW:    { label: 'Low',    color: C.green600 },
};

function CaseCard({ c, onPress }) {
  const st = STATUS_CONFIG[c.status]   || { label: c.status, bg: C.g100, color: C.g500 };
  const pr = PRIORITY_CONFIG[c.priority] || { label: c.priority, color: C.g500 };

  return (
    <TouchableOpacity style={s.caseCard} onPress={onPress} activeOpacity={0.8}>
      <View style={s.caseCardTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.caseNumber}>{c.case_number}</Text>
          <Text style={s.caseTitle} numberOfLines={2}>{c.title}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: st.bg }]}>
          <Text style={[s.badgeTxt, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
      <View style={s.caseCardBottom}>
        <Text style={[s.prioTxt, { color: pr.color }]}>
          <FontAwesome5 name="circle" size={8} color={pr.color} /> {pr.label}
        </Text>
        {c.practice_area ? <Text style={s.areaTxt}>{c.practice_area}</Text> : null}
        {c.first_hearing_date ? (
          <View style={s.hearingRow}>
            <FontAwesome5 name="gavel" size={10} color={C.g400} />
            <Text style={s.hearingTxt}> {new Date(c.first_hearing_date).toLocaleDateString()}</Text>
          </View>
        ) : null}
      </View>
      {c.progress_percent != null && (
        <View style={s.progressWrap}>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${c.progress_percent}%` }]} />
          </View>
          <Text style={s.progressTxt}>{c.progress_percent}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ClientCasesScreen({ navigation }) {
  const [cases, setCases]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('ALL');

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await clientPortalAPI.cases();
      setCases(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED', 'SETTLED'];
  const filtered = cases.filter((c) => {
    const matchFilter = filter === 'ALL' || c.status === filter;
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.case_number?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Cases</Text>
        <Text style={s.headerCount}>{cases.length} total</Text>
      </View>

      <View style={s.searchWrap}>
        <FontAwesome5 name="search" size={14} color={C.g400} style={{ marginLeft: 14 }} />
        <TextInput
          style={s.searchInput}
          placeholder="Search cases..."
          placeholderTextColor={C.g400}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.filterChip, filter === f && s.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.filterChipTxt, filter === f && s.filterChipTxtActive]}>
              {f === 'ALL' ? 'All' : STATUS_CONFIG[f]?.label || f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
        >
          {filtered.length === 0 ? (
            <View style={s.emptyBox}>
              <FontAwesome5 name="briefcase" size={32} color={C.g400} />
              <Text style={s.emptyTitle}>No cases found</Text>
              <Text style={s.emptyTxt}>Your cases will appear here</Text>
            </View>
          ) : (
            filtered.map((c) => (
              <CaseCard
                key={c.id}
                c={c}
                onPress={() => navigation.navigate('ClientCaseDetail', { caseId: c.id, caseTitle: c.title })}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: C.primary },
  scroll:           { flex: 1, backgroundColor: C.g50 },
  center:           { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.g50 },
  header:           { backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, gap: 12 },
  backBtn:          { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:      { flex: 1, fontSize: 18, fontWeight: '800', color: C.white },
  headerCount:      { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  searchWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderBottomWidth: 1, borderColor: C.g200 },
  searchInput:      { flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, color: C.dark },
  filterScroll:     { maxHeight: 52, backgroundColor: C.white, borderBottomWidth: 1, borderColor: C.g100 },
  filterChip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.g100, marginVertical: 8 },
  filterChipActive: { backgroundColor: C.primary },
  filterChipTxt:    { fontSize: 12, fontWeight: '600', color: C.g600 },
  filterChipTxtActive: { color: C.white },
  caseCard:         { backgroundColor: C.white, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.g100, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  caseCardTop:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  caseNumber:       { fontSize: 11, color: C.g400, fontWeight: '600', marginBottom: 3 },
  caseTitle:        { fontSize: 15, fontWeight: '700', color: C.dark },
  badge:            { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginLeft: 8 },
  badgeTxt:         { fontSize: 11, fontWeight: '700' },
  caseCardBottom:   { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  prioTxt:          { fontSize: 12, fontWeight: '600' },
  areaTxt:          { fontSize: 12, color: C.g500 },
  hearingRow:       { flexDirection: 'row', alignItems: 'center' },
  hearingTxt:       { fontSize: 11, color: C.g400 },
  progressWrap:     { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  progressBg:       { flex: 1, height: 6, backgroundColor: C.g100, borderRadius: 3, overflow: 'hidden' },
  progressFill:     { height: 6, backgroundColor: C.primary, borderRadius: 3 },
  progressTxt:      { fontSize: 11, fontWeight: '700', color: C.primary, width: 32, textAlign: 'right' },
  emptyBox:         { alignItems: 'center', paddingVertical: 60 },
  emptyTitle:       { fontSize: 16, fontWeight: '700', color: C.dark, marginTop: 12 },
  emptyTxt:         { fontSize: 13, color: C.g400, marginTop: 4 },
});
