import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { billingAPI } from '../../services/api';

const C = {
  primary: '#1E40AF', secondary: '#3B82F6', dark: '#1E293B', white: '#FFFFFF',
  g50: '#F9FAFB', g100: '#F3F4F6', g200: '#E5E7EB', g400: '#9CA3AF', g500: '#6B7280', g600: '#4B5563',
  red50: '#FEF2F2', red100: '#FEE2E2', red600: '#DC2626',
  amber50: '#FFFBEB', amber100: '#FEF3C7', amber600: '#D97706',
  green50: '#F0FDF4', green100: '#DCFCE7', green600: '#16A34A',
  blue50: '#EFF6FF', blue100: '#DBEAFE', blue600: '#2563EB',
  purple50: '#FAF5FF', purple100: '#F3E8FF', purple600: '#9333EA',
  indigo600: '#4F46E5',
};

const FILTER_TABS = ['All (47)', 'Paid (28)', 'Pending (12)', 'Overdue (7)', 'Draft (3)'];

const OVERDUE_INVOICES = [
  { id: 'INV-2024-1247', overdueTxt: '45 days overdue', title: 'Legal Consultation Services', subtitle: 'State vs. Johnson - Criminal Defense', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', client: 'Marcus Johnson', amount: '$3,500', dueDate: 'Jan 30, 2024', stat3Label: 'Status', stat3Val: 'Overdue', stat3Color: C.red600, actions: [{ icon: 'whatsapp', lib: 'FA', bg: C.green50, color: C.green600 }, { icon: 'phone', lib: 'FA5', bg: C.blue50, color: C.primary }] },
  { id: 'INV-2024-1189', overdueTxt: '30 days overdue', title: 'Contract Review & Amendment', subtitle: 'Anderson LLC - Corporate Law', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg', client: 'David Anderson', amount: '$2,800', dueDate: 'Feb 14, 2024', stat3Label: 'Reminders', stat3Val: '3 sent', stat3Color: C.amber600, actions: [{ icon: 'envelope', lib: 'FA5', bg: C.purple50, color: C.purple600 }, { icon: 'eye', lib: 'FA5', bg: C.blue50, color: C.primary }] },
  { id: 'INV-2024-1098', overdueTxt: '22 days overdue', title: 'Estate Planning Services', subtitle: 'Williams Family - Family Law', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg', client: 'Jennifer Williams', amount: '$2,600', dueDate: 'Feb 22, 2024', stat3Label: 'Reminders', stat3Val: '2 sent', stat3Color: C.amber600, actions: [{ icon: 'whatsapp', lib: 'FA', bg: C.green50, color: C.green600 }, { icon: 'download', lib: 'FA5', bg: C.blue50, color: C.primary }] },
];

const PENDING_INVOICES = [
  { id: 'INV-2024-1356', tag: 'Due in 5 days', title: 'Corporate Litigation Services', subtitle: 'Mitchell Corp. - Corporate Law', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', client: 'Sarah Mitchell', amount: '$6,200', dueDate: 'Mar 20, 2024', stat3Label: 'Status', stat3Val: 'Pending', stat3Color: C.amber600, actions: [{ icon: 'envelope', lib: 'FA5', bg: C.purple50, color: C.purple600 }, { icon: 'download', lib: 'FA5', bg: C.blue50, color: C.primary }] },
  { id: 'INV-2024-1342', tag: 'Due in 8 days', title: 'Property Dispute Resolution', subtitle: 'Chen Estate - Civil Law', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg', client: 'Robert Chen', amount: '$4,750', dueDate: 'Mar 23, 2024', stat3Label: 'Status', stat3Val: 'Pending', stat3Color: C.amber600, actions: [{ icon: 'whatsapp', lib: 'FA', bg: C.green50, color: C.green600 }, { icon: 'share', lib: 'FA5', bg: C.blue50, color: C.primary }] },
];

const IBtn = ({ icon, lib, bg, color }) => (
  <TouchableOpacity style={[s.iconBtn, { backgroundColor: bg }]}>
    {lib === 'FA' ? <FontAwesome name={icon} size={14} color={color} /> : <FontAwesome5 name={icon} size={14} color={color} />}
  </TouchableOpacity>
);

const InvoiceCard = ({ inv, type }) => {
  const isOverdue = type === 'overdue';
  const borderColor = isOverdue ? C.red600 : C.amber600;
  const tagBg = isOverdue ? C.red100 : C.amber50;
  const tagColor = isOverdue ? C.red600 : C.amber600;
  const tag = isOverdue ? inv.overdueTxt : inv.tag;
  const btnColor = isOverdue ? C.red600 : C.amber600;
  return (
    <View style={[s.card, { borderLeftColor: borderColor }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            <View style={[s.idBadge, { backgroundColor: isOverdue ? C.red50 : C.amber50 }]}>
              <Text style={[s.idText, { color: tagColor }]}>{inv.id}</Text>
            </View>
            <View style={[s.pill, { backgroundColor: tagBg }]}>
              <Text style={[s.pillText, { color: tagColor }]}>{tag}</Text>
            </View>
          </View>
          <Text style={s.cardTitle}>{inv.title}</Text>
          <Text style={s.cardSub}>{inv.subtitle}</Text>
        </View>
        <TouchableOpacity><FontAwesome5 name="ellipsis-v" size={14} color={C.g400} /></TouchableOpacity>
      </View>
      <View style={s.clientRow}>
        <Image source={{ uri: inv.avatar }} style={s.avatarSm} />
        <View style={{ marginLeft: 8 }}>
          <Text style={s.clientName}>{inv.client}</Text>
          <Text style={s.clientRole}>Client</Text>
        </View>
      </View>
      <View style={s.statsRow}>
        <View style={s.statItem}><Text style={s.statLabel}>Amount</Text><Text style={s.statVal}>{inv.amount}</Text></View>
        <View style={[s.statItem, s.statBordered]}><Text style={s.statLabel}>Due Date</Text><Text style={[s.statVal, { color: tagColor }]}>{inv.dueDate}</Text></View>
        <View style={s.statItem}><Text style={s.statLabel}>{inv.stat3Label}</Text><Text style={[s.statVal, { color: inv.stat3Color }]}>{inv.stat3Val}</Text></View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity style={[s.btnMain, { backgroundColor: btnColor, flex: 1 }]}>
          <FontAwesome5 name={isOverdue ? 'paper-plane' : 'eye'} size={12} color={C.white} />
          <Text style={s.btnMainText}>{isOverdue ? 'Send Reminder' : 'View Details'}</Text>
        </TouchableOpacity>
        {inv.actions.map((a, i) => <IBtn key={i} {...a} />)}
      </View>
    </View>
  );
};

function apiInvoiceToCard(inv) {
  const isOverdue = inv.status === 'OVERDUE';
  const isPending = inv.status === 'PENDING';
  const clientName = inv.client_name || (inv.client ? `${inv.client.first_name} ${inv.client.last_name}` : 'Client');
  return {
    id: inv.invoice_number || inv.id,
    _id: inv.id,
    title: `Invoice ${inv.invoice_number || ''}`,
    subtitle: clientName,
    client: clientName,
    avatar: inv.client?.avatar_url || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
    amount: `$${parseFloat(inv.total_amount || 0).toLocaleString()}`,
    dueDate: inv.due_date ? inv.due_date.slice(0, 10) : '—',
    overdueTxt: isOverdue ? 'Overdue' : '',
    tag: isPending ? `Due ${inv.due_date ? inv.due_date.slice(0, 10) : ''}` : '',
    stat3Label: 'Status',
    stat3Val: inv.status,
    stat3Color: isOverdue ? '#DC2626' : isPending ? '#D97706' : '#16A34A',
    actions: [
      { icon: 'envelope', lib: 'FA5', bg: '#FAF5FF', color: '#9333EA' },
      { icon: 'eye',      lib: 'FA5', bg: '#EFF6FF', color: '#1E40AF' },
    ],
    _status: inv.status,
  };
}

export default function InvoicesManagementScreen({ navigation }) {
  const [activeFilter, setActiveFilter]   = useState(0);
  const [overdueList, setOverdueList]     = useState(OVERDUE_INVOICES);
  const [pendingList, setPendingList]     = useState(PENDING_INVOICES);
  const [analytics, setAnalytics]         = useState(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    Promise.all([
      billingAPI.listInvoices(),
      billingAPI.getAnalytics(),
    ])
      .then(([invoices, kpis]) => {
        const cards = (invoices || []).map(apiInvoiceToCard);
        setOverdueList(cards.filter(c => c._status === 'OVERDUE'));
        setPendingList(cards.filter(c => c._status === 'PENDING'));
        setAnalytics(kpis);
      })
      .catch(() => {/* keep static fallback */})
      .finally(() => setLoading(false));
  }, []);

  const sendReminder = async (invId) => {
    try {
      await billingAPI.sendReminder(invId);
      Alert.alert('Reminder Sent', 'The payment reminder has been sent.');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const fmt = (n) => n != null ? `$${parseFloat(n).toLocaleString()}` : '—';
  const statsCards = analytics ? [
    { icon: 'check-circle',        iconColor: '#16A34A', iconBg: '#DCFCE7', badge: '+$12k',  badgeColor: '#16A34A', badgeBg: '#F0FDF4', value: fmt(analytics.total_revenue),  label: 'Paid This Month' },
    { icon: 'clock',               iconColor: '#D97706', iconBg: '#FEF3C7', badge: 'Pending',badgeColor: '#D97706', badgeBg: '#FFFBEB', value: fmt(analytics.outstanding),     label: 'Awaiting Payment' },
    { icon: 'exclamation-triangle',iconColor: '#DC2626', iconBg: '#FEE2E2', badge: 'Urgent', badgeColor: '#DC2626', badgeBg: '#FEF2F2', value: fmt(analytics.overdue),          label: 'Overdue' },
    { icon: 'file-invoice-dollar', iconColor: '#1E40AF', iconBg: '#DBEAFE', badge: 'Total',  badgeColor: '#2563EB', badgeBg: '#EFF6FF', value: `${Math.round((analytics.collection_rate || 0) * 100)}%`, label: 'Collection Rate' },
  ] : null;

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.primary} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.g50 }}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      <View style={s.header}>
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()}>
            <FontAwesome5 name="arrow-left" size={16} color={C.white} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.headerTitle}>Invoice Management</Text>
            <Text style={s.headerSub}>Track payments & send reminders</Text>
          </View>
          <TouchableOpacity>
            <FontAwesome5 name="bell" size={20} color={C.white} />
            <View style={s.notifDot}><Text style={s.notifTxt}>3</Text></View>
          </TouchableOpacity>
        </View>
        <View style={s.searchRow}>
          <FontAwesome5 name="search" size={14} color="rgba(255,255,255,0.7)" />
          <TextInput style={s.searchInput} placeholder="Search invoices, clients..." placeholderTextColor="rgba(255,255,255,0.6)" />
          <TouchableOpacity style={s.filterBtn}>
            <FontAwesome5 name="filter" size={10} color={C.white} />
            <Text style={s.filterBtnTxt}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* STATS */}
        <View style={s.section}>
          <View style={s.statsGrid}>
            {(statsCards || [
              { icon: 'check-circle',         iconColor: C.green600, iconBg: C.green100, badge: '+$12k',  badgeColor: C.green600, badgeBg: C.green50, value: '$45,280', label: 'Paid This Month'  },
              { icon: 'clock',                iconColor: C.amber600, iconBg: C.amber100, badge: 'Pending',badgeColor: C.amber600, badgeBg: C.amber50, value: '$23,150', label: 'Awaiting Payment' },
              { icon: 'exclamation-triangle', iconColor: C.red600,   iconBg: C.red100,   badge: 'Urgent', badgeColor: C.red600,   badgeBg: C.red50,   value: '$8,900',  label: 'Overdue'          },
              { icon: 'file-invoice-dollar',  iconColor: C.primary,  iconBg: C.blue100,  badge: 'Total',  badgeColor: C.blue600,  badgeBg: C.blue50,  value: '47',      label: 'Active Invoices'  },
            ]).map((st, i) => (
              <View key={i} style={s.statCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={[s.statIcon, { backgroundColor: st.iconBg }]}>
                    <FontAwesome5 name={st.icon} size={16} color={st.iconColor} />
                  </View>
                  <View style={[s.pill, { backgroundColor: st.badgeBg }]}>
                    <Text style={[s.pillText, { color: st.badgeColor }]}>{st.badge}</Text>
                  </View>
                </View>
                <Text style={s.statBigVal}>{st.value}</Text>
                <Text style={s.statSmLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
          <View style={s.outCard}>
            <View>
              <Text style={s.outLabel}>Total Outstanding</Text>
              <Text style={s.outValue}>$32,050</Text>
              <Text style={s.outSub}>12 invoices pending</Text>
            </View>
            <View style={s.outIconWrap}><FontAwesome5 name="chart-line" size={24} color={C.white} /></View>
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { marginBottom: 12 }]}>Quick Actions</Text>
          <View style={s.qaGrid}>
            {[
              { icon: 'plus', label: 'Create', sub: 'New Invoice', color: C.primary },
              { icon: 'paper-plane', label: 'Send', sub: 'Reminders', color: C.green600 },
              { icon: 'download', label: 'Export', sub: 'Reports', color: C.purple600 },
              { icon: 'cog', label: 'Settings', sub: 'Configure', color: C.amber600 },
            ].map((qa, i) => (
              <TouchableOpacity key={i} style={[s.qaCard, { backgroundColor: qa.color }]}>
                <View style={s.qaIconWrap}><FontAwesome5 name={qa.icon} size={22} color={C.white} /></View>
                <View><Text style={s.qaLabel}>{qa.label}</Text><Text style={s.qaSub}>{qa.sub}</Text></View>
              </TouchableOpacity>
            ))}
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

        {/* OVERDUE */}
        <View style={[s.section, { backgroundColor: '#FFF8F8' }]}>
          <View style={s.sHRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[s.sIconWrap, { backgroundColor: C.red100 }]}><FontAwesome5 name="exclamation-triangle" size={13} color={C.red600} /></View>
              <Text style={s.sectionTitle}>Overdue Invoices</Text>
            </View>
            <View style={[s.pill, { backgroundColor: C.red100 }]}><Text style={[s.pillText, { color: C.red600, fontWeight: '700' }]}>7</Text></View>
          </View>
          {(overdueList.length > 0 ? overdueList : OVERDUE_INVOICES).map((inv, i) => (
            <InvoiceCard key={i} inv={inv} type="overdue" onRemind={() => sendReminder(inv._id)} />
          ))}
        </View>

        {/* PENDING */}
        <View style={[s.section, { backgroundColor: C.amber50 }]}>
          <View style={s.sHRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[s.sIconWrap, { backgroundColor: C.amber100 }]}><FontAwesome5 name="clock" size={13} color={C.amber600} /></View>
              <Text style={s.sectionTitle}>Pending Payment</Text>
            </View>
            <View style={[s.pill, { backgroundColor: C.amber100 }]}><Text style={[s.pillText, { color: C.amber600, fontWeight: '700' }]}>12</Text></View>
          </View>
          {(pendingList.length > 0 ? pendingList : PENDING_INVOICES).map((inv, i) => (
            <InvoiceCard key={i} inv={inv} type="pending" onRemind={() => sendReminder(inv._id)} />
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
  notifDot: { position: 'absolute', top: -4, right: -4, backgroundColor: C.red600, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  notifTxt: { color: C.white, fontSize: 10, fontWeight: '700' },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, gap: 10 },
  searchInput: { flex: 1, color: C.white, fontSize: 13 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  filterBtnTxt: { color: C.white, fontSize: 11, fontWeight: '600' },
  section: { paddingHorizontal: 16, paddingVertical: 18, backgroundColor: C.white, marginBottom: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.dark },
  sHRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard: { width: '47.5%', backgroundColor: C.white, borderRadius: 18, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: C.g100 },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statBigVal: { fontSize: 22, fontWeight: '800', color: C.dark, marginBottom: 2 },
  statSmLabel: { fontSize: 11, color: C.g500 },
  outCard: { backgroundColor: C.indigo600, borderRadius: 18, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  outLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  outValue: { fontSize: 30, fontWeight: '800', color: C.white },
  outSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  outIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  qaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  qaCard: { width: '47.5%', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  qaIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontSize: 14, fontWeight: '700', color: C.white },
  qaSub: { fontSize: 11, color: 'rgba(255,255,255,0.72)' },
  filterBar: { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.g200, maxHeight: 52, flexGrow: 0 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, backgroundColor: C.g100 },
  filterTabActive: { backgroundColor: C.primary },
  filterTabTxt: { fontSize: 12, fontWeight: '600', color: C.g600 },
  filterTabTxtActive: { color: C.white },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 14, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 2, marginBottom: 10 },
  idBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  idText: { fontSize: 11, fontWeight: '700' },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillText: { fontSize: 11, fontWeight: '600' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: C.dark, marginBottom: 2 },
  cardSub: { fontSize: 12, color: C.g600 },
  clientRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.g100, marginVertical: 10 },
  avatarSm: { width: 32, height: 32, borderRadius: 10 },
  clientName: { fontSize: 12, fontWeight: '700', color: C.dark },
  clientRole: { fontSize: 11, color: C.g400 },
  statsRow: { flexDirection: 'row', marginBottom: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statBordered: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: C.g100 },
  statLabel: { fontSize: 11, color: C.g500, marginBottom: 2 },
  statVal: { fontSize: 14, fontWeight: '700', color: C.dark },
  btnMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
  btnMainText: { color: C.white, fontSize: 13, fontWeight: '700' },
  iconBtn: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
});
