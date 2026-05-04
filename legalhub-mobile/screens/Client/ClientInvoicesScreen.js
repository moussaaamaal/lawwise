import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { clientPortalAPI } from '../../services/api';

const C = {
  primary: '#1E40AF', dark: '#1E293B', white: '#FFFFFF',
  g50: '#F9FAFB', g100: '#F3F4F6', g200: '#E5E7EB', g400: '#9CA3AF', g500: '#6B7280',
  blue50: '#EFF6FF', green50: '#F0FDF4', green600: '#16A34A',
  amber50: '#FFFBEB', amber600: '#D97706',
  red50: '#FEF2F2', red600: '#DC2626',
};

const STATUS_CONFIG = {
  DRAFT:   { label: 'Draft',   bg: C.g100,    color: C.g500       },
  PENDING: { label: 'Pending', bg: C.amber50, color: C.amber600   },
  OVERDUE: { label: 'Overdue', bg: C.red50,   color: C.red600     },
  PAID:    { label: 'Paid',    bg: C.green50, color: C.green600   },
};

function InvoiceCard({ inv, onPress }) {
  const st = STATUS_CONFIG[inv.status] || { label: inv.status, bg: C.g100, color: C.g500 };
  const issueDate = inv.issue_date ? new Date(inv.issue_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  const dueDate   = inv.due_date   ? new Date(inv.due_date).toLocaleDateString('en-GB',   { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  const isOverdue = inv.status === 'OVERDUE';

  return (
    <TouchableOpacity style={[s.card, isOverdue && s.cardOverdue]} onPress={onPress} activeOpacity={0.8}>
      <View style={s.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.invNumber}>{inv.invoice_number}</Text>
          <Text style={s.invAmount}>{inv.currency} {parseFloat(inv.total_amount).toFixed(2)}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: st.bg }]}>
          <Text style={[s.badgeTxt, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
      <View style={s.cardBottom}>
        <View style={s.dateRow}>
          <FontAwesome5 name="calendar" size={10} color={C.g400} />
          <Text style={s.dateLabel}> Issued: </Text>
          <Text style={s.dateVal}>{issueDate}</Text>
        </View>
        <View style={s.dateRow}>
          <FontAwesome5 name={isOverdue ? 'exclamation-triangle' : 'calendar-times'} size={10} color={isOverdue ? C.red600 : C.g400} />
          <Text style={[s.dateLabel, isOverdue && { color: C.red600 }]}> Due: </Text>
          <Text style={[s.dateVal, isOverdue && { color: C.red600, fontWeight: '700' }]}>{dueDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const FILTERS = ['ALL', 'PENDING', 'OVERDUE', 'PAID', 'DRAFT'];

export default function ClientInvoicesScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]     = useState('ALL');

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const status = filter === 'ALL' ? undefined : filter;
      const data = await clientPortalAPI.invoices(status);
      setInvoices(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const totalPending = invoices
    .filter(i => ['PENDING', 'OVERDUE'].includes(i.status))
    .reduce((sum, i) => sum + parseFloat(i.total_amount || 0), 0);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Invoices</Text>
      </View>

      {/* Summary */}
      {totalPending > 0 && (
        <View style={s.summaryBanner}>
          <FontAwesome5 name="file-invoice-dollar" size={16} color={C.amber600} />
          <Text style={s.summaryTxt}>
            {' '}Amount due: <Text style={s.summaryAmount}>${totalPending.toFixed(2)}</Text>
          </Text>
        </View>
      )}

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.chip, filter === f && s.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.chipTxt, filter === f && s.chipTxtActive]}>
              {f === 'ALL' ? 'All' : STATUS_CONFIG[f]?.label || f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={C.primary} /></View>
      ) : (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
        >
          {invoices.length === 0 ? (
            <View style={s.emptyBox}>
              <FontAwesome5 name="file-invoice" size={32} color={C.g400} />
              <Text style={s.emptyTitle}>No invoices</Text>
              <Text style={s.emptyTxt}>Your invoices will appear here</Text>
            </View>
          ) : (
            invoices.map((inv) => (
              <InvoiceCard
                key={inv.id}
                inv={inv}
                onPress={() => navigation.navigate('ClientInvoiceDetail', { invoiceId: inv.id, invoiceNumber: inv.invoice_number })}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: C.primary },
  scroll:         { flex: 1, backgroundColor: C.g50 },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.g50 },
  header:         { backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, gap: 12 },
  backBtn:        { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:    { fontSize: 18, fontWeight: '800', color: C.white },
  summaryBanner:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.amber50, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#FDE68A' },
  summaryTxt:     { fontSize: 14, color: C.amber600, flex: 1 },
  summaryAmount:  { fontWeight: '800', fontSize: 16 },
  filterScroll:   { maxHeight: 52, backgroundColor: C.white, borderBottomWidth: 1, borderColor: C.g100 },
  chip:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.g100, marginVertical: 8 },
  chipActive:     { backgroundColor: C.primary },
  chipTxt:        { fontSize: 12, fontWeight: '600', color: C.g500 },
  chipTxtActive:  { color: C.white },
  card:           { backgroundColor: C.white, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.g100, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardOverdue:    { borderColor: '#FCA5A5' },
  cardTop:        { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  invNumber:      { fontSize: 12, color: C.g400, fontWeight: '600', marginBottom: 4 },
  invAmount:      { fontSize: 22, fontWeight: '800', color: C.dark },
  badge:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeTxt:       { fontSize: 11, fontWeight: '700' },
  cardBottom:     { flexDirection: 'row', justifyContent: 'space-between' },
  dateRow:        { flexDirection: 'row', alignItems: 'center' },
  dateLabel:      { fontSize: 12, color: C.g400 },
  dateVal:        { fontSize: 12, color: C.g500 },
  emptyBox:       { alignItems: 'center', paddingVertical: 60 },
  emptyTitle:     { fontSize: 16, fontWeight: '700', color: C.dark, marginTop: 12 },
  emptyTxt:       { fontSize: 13, color: C.g400, marginTop: 4 },
});
