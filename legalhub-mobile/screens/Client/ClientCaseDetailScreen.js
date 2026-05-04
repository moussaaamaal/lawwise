import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { clientPortalAPI } from '../../services/api';

const C = {
  primary: '#1E40AF', secondary: '#3B82F6', dark: '#1E293B',
  white: '#FFFFFF', g50: '#F9FAFB', g100: '#F3F4F6', g200: '#E5E7EB',
  g400: '#9CA3AF', g500: '#6B7280', g600: '#4B5563',
  blue50: '#EFF6FF', blue100: '#DBEAFE',
  green50: '#F0FDF4', green600: '#16A34A',
  amber50: '#FFFBEB', amber600: '#D97706',
  red50: '#FEF2F2', red600: '#DC2626',
};

const STATUS_COLORS = {
  OPEN: C.primary, IN_PROGRESS: C.amber600, PENDING: '#EA580C',
  CLOSED: C.g500, SETTLED: C.green600,
};

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <View style={s.infoRow}>
      <View style={s.infoIconWrap}>
        <FontAwesome5 name={icon} size={13} color={C.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ClientCaseDetailScreen({ route, navigation }) {
  const { caseId, caseTitle } = route.params;
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    clientPortalAPI.caseDetail(caseId)
      .then(d => setCaseData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [caseId]);

  const statusColor = STATUS_COLORS[caseData?.status] || C.g500;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>{caseTitle || 'Case Detail'}</Text>
        </View>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : !caseData ? (
        <View style={s.center}>
          <Text style={{ color: C.g400 }}>Case not found.</Text>
        </View>
      ) : (
        <ScrollView style={s.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* Status Banner */}
          <View style={[s.statusBanner, { backgroundColor: statusColor + '18', borderColor: statusColor + '44' }]}>
            <View style={[s.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[s.statusTxt, { color: statusColor }]}>{caseData.status?.replace(/_/g, ' ')}</Text>
            {caseData.progress_percent != null && (
              <Text style={[s.progressPct, { color: statusColor }]}>{caseData.progress_percent}% complete</Text>
            )}
          </View>

          {/* Case Info */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Case Information</Text>
            <InfoRow icon="hashtag"         label="Case Number"   value={caseData.case_number} />
            <InfoRow icon="tag"             label="Type"          value={caseData.case_type?.replace(/_/g, ' ')} />
            <InfoRow icon="layer-group"     label="Practice Area" value={caseData.practice_area} />
            <InfoRow icon="exclamation-circle" label="Priority"   value={caseData.priority} />
            <InfoRow icon="university"      label="Court"         value={caseData.court_name} />
            <InfoRow icon="gavel"           label="First Hearing" value={caseData.first_hearing_date ? new Date(caseData.first_hearing_date).toLocaleDateString() : null} />
            <InfoRow icon="calendar-alt"    label="Opened"        value={caseData.created_at ? new Date(caseData.created_at).toLocaleDateString() : null} />
          </View>

          {/* Lead Attorney */}
          {caseData.lead_attorney && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Your Attorney</Text>
              <View style={s.attorneyRow}>
                <View style={s.avatarCircle}>
                  <FontAwesome5 name="user-tie" size={20} color={C.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={s.attorneyName}>{caseData.lead_attorney.full_name}</Text>
                  <Text style={s.attorneyTitle}>{caseData.lead_attorney.title}</Text>
                  {caseData.lead_attorney.email ? (
                    <Text style={s.attorneyEmail}>{caseData.lead_attorney.email}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          )}

          {/* Timeline */}
          {caseData.timeline?.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Recent Activity</Text>
              {caseData.timeline.map((ev, i) => (
                <View key={i} style={s.timelineItem}>
                  <View style={s.timelineDot} />
                  {i < caseData.timeline.length - 1 && <View style={s.timelineLine} />}
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={s.timelineAction}>{ev.action}</Text>
                    <Text style={s.timelineDate}>{new Date(ev.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.primary },
  scroll:        { flex: 1, backgroundColor: C.g50 },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.g50 },
  header:        { backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, gap: 12 },
  backBtn:       { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:   { fontSize: 17, fontWeight: '800', color: C.white },
  statusBanner:  { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12, marginBottom: 14, borderWidth: 1, gap: 8 },
  statusDot:     { width: 10, height: 10, borderRadius: 5 },
  statusTxt:     { fontSize: 14, fontWeight: '700', flex: 1 },
  progressPct:   { fontSize: 13, fontWeight: '600' },
  card:          { backgroundColor: C.white, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.g100, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardTitle:     { fontSize: 14, fontWeight: '800', color: C.dark, marginBottom: 14 },
  infoRow:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  infoIconWrap:  { width: 32, height: 32, borderRadius: 10, backgroundColor: C.blue50, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoLabel:     { fontSize: 11, color: C.g400, fontWeight: '600', marginBottom: 2 },
  infoValue:     { fontSize: 14, fontWeight: '600', color: C.dark },
  attorneyRow:   { flexDirection: 'row', alignItems: 'center' },
  avatarCircle:  { width: 52, height: 52, borderRadius: 26, backgroundColor: C.blue50, alignItems: 'center', justifyContent: 'center' },
  attorneyName:  { fontSize: 15, fontWeight: '700', color: C.dark },
  attorneyTitle: { fontSize: 12, color: C.g400, marginTop: 2 },
  attorneyEmail: { fontSize: 12, color: C.primary, marginTop: 4 },
  timelineItem:  { flexDirection: 'row', marginBottom: 16, position: 'relative', paddingLeft: 14 },
  timelineDot:   { width: 12, height: 12, borderRadius: 6, backgroundColor: C.primary, position: 'absolute', left: 0, top: 3 },
  timelineLine:  { width: 2, backgroundColor: C.g200, position: 'absolute', left: 5, top: 15, bottom: -10 },
  timelineAction:{ fontSize: 13, fontWeight: '600', color: C.dark },
  timelineDate:  { fontSize: 11, color: C.g400, marginTop: 2 },
});
