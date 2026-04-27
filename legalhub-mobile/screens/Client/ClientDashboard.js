import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { clientPortalAPI } from '../../services/api';

const C = {
  primary: '#1E40AF', secondary: '#3B82F6', dark: '#1E293B',
  white: '#FFFFFF', g50: '#F9FAFB', g100: '#F3F4F6', g200: '#E5E7EB',
  g400: '#9CA3AF', g500: '#6B7280', g600: '#4B5563',
  blue50: '#EFF6FF', blue100: '#DBEAFE',
  green50: '#F0FDF4', green600: '#16A34A',
  amber50: '#FFFBEB', amber600: '#D97706',
  red50: '#FEF2F2', red600: '#DC2626',
  purple50: '#FAF5FF', purple600: '#9333EA',
};

function StatCard({ icon, label, value, bg, color, sub }) {
  return (
    <View style={[s.statCard, { backgroundColor: bg }]}>
      <View style={[s.statIcon, { backgroundColor: color + '22' }]}>
        <FontAwesome5 name={icon} size={18} color={color} />
      </View>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
      {sub ? <Text style={s.statSub}>{sub}</Text> : null}
    </View>
  );
}

function AppointmentCard({ event }) {
  const dt = new Date(event.start_datetime);
  const dateStr = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const timeStr = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={s.apptCard}>
      <View style={s.apptDate}>
        <Text style={s.apptDateTxt}>{dateStr}</Text>
        <Text style={s.apptTimeTxt}>{timeStr}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={s.apptTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={s.apptType}>{event.event_type?.replace(/_/g, ' ')}</Text>
        {event.location ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <FontAwesome5 name="map-marker-alt" size={10} color={C.g400} />
            <Text style={s.apptLoc} numberOfLines={1}> {event.location}</Text>
          </View>
        ) : null}
      </View>
      {event.is_video_call && (
        <View style={s.videoBadge}>
          <Ionicons name="videocam" size={12} color={C.primary} />
        </View>
      )}
    </View>
  );
}

export default function ClientDashboard({ navigation }) {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]     = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const d = await clientPortalAPI.dashboard();
      setData(d);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const client = data?.client;
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{greeting()},</Text>
          <Text style={s.clientName}>
            {client ? `${client.first_name} ${client.last_name}` : user?.full_name || 'Client'}
          </Text>
        </View>
        <TouchableOpacity style={s.avatarCircle} onPress={() => navigation.navigate('ClientProfile')}>
          <FontAwesome5 name="user" size={18} color={C.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : error ? (
        <View style={s.center}>
          <FontAwesome5 name="exclamation-circle" size={36} color={C.g400} />
          <Text style={[s.emptyTxt, { marginTop: 12 }]}>{error}</Text>
          <TouchableOpacity
            onPress={() => load()}
            style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: C.primary, borderRadius: 12 }}
          >
            <Text style={{ color: C.white, fontWeight: '700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
        >
          {/* Stats Grid */}
          <Text style={s.sectionTitle}>Overview</Text>
          <View style={s.statsGrid}>
            <StatCard icon="briefcase" label="Active Cases" value={data?.active_cases ?? 0} bg={C.blue50} color={C.primary} />
            <StatCard icon="file-invoice-dollar" label="Pending" value={`$${data?.pending_invoices_total ?? 0}`} bg={C.amber50} color={C.amber600} sub={`${data?.pending_invoices_count ?? 0} invoice(s)`} />
            <StatCard icon="file-alt" label="Documents" value={data?.pending_documents ?? 0} bg={C.green50} color={C.green600} sub="pending review" />
          </View>

          {/* Upcoming Appointments */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Upcoming Appointments</Text>
          </View>
          {data?.upcoming_appointments?.length > 0 ? (
            data.upcoming_appointments.map((ev) => (
              <AppointmentCard key={ev.id} event={ev} />
            ))
          ) : (
            <View style={s.emptyBox}>
              <FontAwesome5 name="calendar-times" size={24} color={C.g400} />
              <Text style={s.emptyTxt}>No upcoming appointments</Text>
            </View>
          )}

          {/* Quick Links */}
          <Text style={[s.sectionTitle, { marginTop: 20 }]}>Quick Access</Text>
          <View style={s.quickRow}>
            {[
              { icon: 'briefcase',         label: 'My Cases',    route: 'ClientCases'      },
              { icon: 'file-invoice',      label: 'Invoices',    route: 'ClientInvoices'   },
              { icon: 'file-alt',          label: 'Documents',   route: 'ClientDocuments'  },
              { icon: 'user-circle',       label: 'Profile',     route: 'ClientProfile'    },
            ].map((q) => (
              <TouchableOpacity key={q.route} style={s.quickCard} onPress={() => navigation.navigate(q.route)}>
                <View style={[s.quickIcon, { backgroundColor: C.blue50 }]}>
                  <FontAwesome5 name={q.icon} size={20} color={C.primary} />
                </View>
                <Text style={s.quickLabel}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.primary },
  scroll:       { flex: 1, backgroundColor: C.g50 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.g50 },
  header:       { backgroundColor: C.primary, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting:     { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  clientName:   { fontSize: 20, fontWeight: '800', color: C.white, marginTop: 2 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.dark, marginBottom: 10, marginTop: 4 },
  seeAll:       { fontSize: 13, fontWeight: '700', color: C.primary },
  statsGrid:    { flexDirection: 'row', gap: 10, marginBottom: 4 },
  statCard:     { flex: 1, borderRadius: 18, padding: 14, alignItems: 'center' },
  statIcon:     { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue:    { fontSize: 18, fontWeight: '800' },
  statLabel:    { fontSize: 11, color: C.g500, marginTop: 2, textAlign: 'center' },
  statSub:      { fontSize: 10, color: C.g400, marginTop: 1, textAlign: 'center' },
  apptCard:     { backgroundColor: C.white, borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.g100, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  apptDate:     { backgroundColor: C.blue50, borderRadius: 12, padding: 10, alignItems: 'center', minWidth: 60 },
  apptDateTxt:  { fontSize: 12, fontWeight: '800', color: C.primary },
  apptTimeTxt:  { fontSize: 11, color: C.secondary, marginTop: 2 },
  apptTitle:    { fontSize: 14, fontWeight: '700', color: C.dark },
  apptType:     { fontSize: 11, color: C.g400, marginTop: 2 },
  apptLoc:      { fontSize: 11, color: C.g400 },
  videoBadge:   { backgroundColor: C.blue50, borderRadius: 8, padding: 6 },
  emptyBox:     { alignItems: 'center', padding: 24, backgroundColor: C.white, borderRadius: 16, borderWidth: 1, borderColor: C.g100 },
  emptyTxt:     { marginTop: 8, fontSize: 13, color: C.g400 },
  quickRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard:    { width: '47%', backgroundColor: C.white, borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.g100, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  quickIcon:    { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  quickLabel:   { fontSize: 13, fontWeight: '700', color: C.dark },
});
