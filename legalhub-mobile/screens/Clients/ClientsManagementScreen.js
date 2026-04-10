import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { clientsAPI } from '../../services/api';

const C = {
  primary: '#1E40AF', secondary: '#3B82F6', dark: '#1E293B', white: '#FFFFFF',
  g50: '#F9FAFB', g100: '#F3F4F6', g200: '#E5E7EB', g400: '#9CA3AF', g500: '#6B7280', g600: '#4B5563',
  red50: '#FEF2F2', red500: '#EF4444', red600: '#DC2626',
  amber50: '#FFFBEB', amber100: '#FEF3C7', amber600: '#D97706',
  green50: '#F0FDF4', green100: '#DCFCE7', green600: '#16A34A',
  blue50: '#EFF6FF', blue100: '#DBEAFE', blue600: '#2563EB',
  purple50: '#FAF5FF', purple100: '#F3E8FF', purple600: '#9333EA',
  yellow400: '#FACC15',
};

const FILTER_TABS = ['All Clients', 'Active Cases', 'Unpaid', 'VIP'];

const CLIENTS = [
  { name: 'Marcus Johnson', badge: 'Urgent', badgeColor: C.red600, badgeBg: C.red50, specialty: 'Criminal Defense', cases: '2 Cases', billed: '$12,500', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg' },
  { name: 'Robert Chen', badge: 'Active', badgeColor: C.green600, badgeBg: C.green50, specialty: 'Family Law - Estate Planning', cases: '1 Case', billed: '$8,200', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg' },
  { name: 'Jennifer Williams', badge: 'New', badgeColor: C.amber600, badgeBg: C.amber50, specialty: 'Personal Injury', cases: '1 Case', billed: '$0', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' },
  { name: 'David Thompson', badge: 'Active', badgeColor: C.blue600, badgeBg: C.blue50, specialty: 'Real Estate Law', cases: '2 Cases', billed: '$18,900', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg' },
];

const CLIENT_CASES = [
  { id: 'CR-2024-1247', badge: 'Urgent', badgeColor: C.red600, badgeBg: C.red50, borderColor: C.red500, title: 'State vs. Johnson', subtitle: 'Criminal Defense - Assault Charges', stat1: 'Today', stat2: 'Active', stat3: '23' },
  { id: 'CR-2023-0892', badge: 'Closed', badgeColor: C.green600, badgeBg: C.green50, borderColor: C.secondary, title: 'Previous Criminal Case', subtitle: 'Criminal Defense - Successfully Resolved', stat1: 'Feb 2024', stat2: 'Won', stat3: '47' },
];

const IBtn = ({ icon, lib, bg, color, size = 14 }) => (
  <TouchableOpacity style={[s.iconBtn, { backgroundColor: bg }]}>
    {lib === 'FA' ? <FontAwesome name={icon} size={size} color={color} /> : <FontAwesome5 name={icon} size={size} color={color} />}
  </TouchableOpacity>
);

function apiClientToCard(c) {
  const tag = c.tag || 'ACTIVE';
  const badgeMap = {
    ACTIVE:  { badge: 'Active',  badgeColor: '#16A34A', badgeBg: '#F0FDF4' },
    PENDING: { badge: 'Pending', badgeColor: '#D97706', badgeBg: '#FFFBEB' },
    PREMIUM: { badge: 'Premium', badgeColor: '#9333EA', badgeBg: '#FAF5FF' },
    VIP:     { badge: 'VIP',     badgeColor: '#1E40AF', badgeBg: '#EFF6FF' },
  };
  const { badge, badgeColor, badgeBg } = badgeMap[tag] || badgeMap.ACTIVE;
  return {
    name:      `${c.first_name} ${c.last_name}`,
    badge, badgeColor, badgeBg,
    specialty: c.occupation || c.client_type || 'Client',
    cases:     '— Cases',
    billed:    '$0',
    avatar:    c.avatar_url || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
    email:     c.email || '',
    phone:     c.phone || '',
    _raw:      c,
  };
}

export default function ClientsManagementScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState(0);
  const [clients, setClients]           = useState(CLIENTS);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');

  useEffect(() => {
    clientsAPI.list()
      .then(data => setClients((data || []).map(apiClientToCard)))
      .catch(() => {/* keep static fallback */})
      .finally(() => setLoading(false));
  }, []);

  const displayed = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const total   = clients.length;
  const active  = clients.filter(c => c.badge === 'Active').length;
  const pending = clients.filter(c => c.badge === 'Pending').length;

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

      {/* HEADER */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()}>
            <FontAwesome5 name="arrow-left" size={16} color={C.white} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.headerTitle}>Client Management</Text>
            <Text style={s.headerSub}>Manage your client portfolio</Text>
          </View>
          <TouchableOpacity style={s.backBtn}>
            <FontAwesome5 name="user-plus" size={14} color={C.white} />
          </TouchableOpacity>
        </View>
        <View style={s.searchRow}>
          <FontAwesome5 name="search" size={14} color="rgba(255,255,255,0.7)" />
          <TextInput style={s.searchInput} placeholder="Search clients, cases..." placeholderTextColor="rgba(255,255,255,0.6)" value={search} onChangeText={setSearch} />
          <TouchableOpacity style={s.filterBtn}>
            <FontAwesome5 name="filter" size={10} color={C.white} />
            <Text style={s.filterBtnTxt}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* STATS 3 cols */}
        <View style={[s.section, { backgroundColor: C.blue50 }]}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { icon: 'users',      iconColor: C.primary,   iconBg: C.blue100,  value: String(total),   label: 'Total Clients' },
              { icon: 'user-check', iconColor: C.green600,  iconBg: C.green100, value: String(active),  label: 'Active' },
              { icon: 'clock',      iconColor: C.amber600,  iconBg: C.amber100, value: String(pending), label: 'Pending' },
            ].map((st, i) => (
              <View key={i} style={s.statCard}>
                <View style={[s.statIcon, { backgroundColor: st.iconBg }]}>
                  <FontAwesome5 name={st.icon} size={18} color={st.iconColor} />
                </View>
                <Text style={s.statBigVal}>{st.value}</Text>
                <Text style={s.statSmLabel}>{st.label}</Text>
              </View>
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

        {/* FEATURED CLIENT */}
        <View style={s.section}>
          <View style={s.sHRow}>
            <Text style={s.sectionTitle}>Featured Client</Text>
            <TouchableOpacity><Text style={s.sectionAction}>View Profile</Text></TouchableOpacity>
          </View>
          <View style={s.featuredCard}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
              <Image source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg' }} style={s.featuredAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={s.featuredName}>Sarah Mitchell</Text>
                <Text style={s.featuredRole}>CEO, Mitchell Corporation</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                  <View style={s.vipBadge}><FontAwesome5 name="star" size={9} color="#713F12" /><Text style={s.vipText}>VIP</Text></View>
                  <View style={s.whiteBadge}><Text style={s.whiteBadgeTxt}>Corporate Law</Text></View>
                </View>
              </View>
            </View>
            <View style={s.featuredStats}>
              <View style={s.fStatItem}><Text style={s.fStatVal}>3</Text><Text style={s.fStatLabel}>Active Cases</Text></View>
              <View style={[s.fStatItem, s.fStatBordered]}><Text style={s.fStatVal}>$45K</Text><Text style={s.fStatLabel}>Total Billed</Text></View>
              <View style={s.fStatItem}><Text style={s.fStatVal}>2 yrs</Text><Text style={s.fStatLabel}>Client Since</Text></View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <TouchableOpacity style={s.fBtnWhite}><FontAwesome5 name="phone" size={13} color={C.primary} /><Text style={[s.fBtnTxt, { color: C.primary }]}>Call</Text></TouchableOpacity>
              <TouchableOpacity style={s.fBtnTransp}><FontAwesome name="whatsapp" size={14} color={C.white} /><Text style={s.fBtnTxt}>WhatsApp</Text></TouchableOpacity>
              <TouchableOpacity style={[s.iconBtn, { backgroundColor: 'rgba(255,255,255,0.2)', width: 48, height: 48, borderRadius: 14 }]}>
                <FontAwesome5 name="envelope" size={15} color={C.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* CLIENT LIST */}
        <View style={s.section}>
          <View style={s.sHRow}>
            <Text style={s.sectionTitle}>All Clients</Text>
            <TouchableOpacity style={s.addBtn}>
              <FontAwesome5 name="plus" size={12} color={C.white} />
              <Text style={s.addBtnTxt}>Add Client</Text>
            </TouchableOpacity>
          </View>
          {displayed.map((cl, i) => (
            <View key={i} style={s.clientCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 12, flex: 1 }}>
                  <Image source={{ uri: cl.avatar }} style={s.clientAvatar} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Text style={s.clientName}>{cl.name}</Text>
                      <View style={[s.pill, { backgroundColor: cl.badgeBg }]}>
                        <Text style={[s.pillTxt, { color: cl.badgeColor }]}>{cl.badge}</Text>
                      </View>
                    </View>
                    <Text style={s.clientSpecialty}>{cl.specialty}</Text>
                    <View style={{ flexDirection: 'row', gap: 14, marginTop: 5 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <FontAwesome5 name="briefcase" size={10} color={C.g400} />
                        <Text style={s.clientMeta}>{cl.cases}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <FontAwesome5 name="file-invoice-dollar" size={10} color={C.g400} />
                        <Text style={s.clientMeta}>{cl.billed}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <TouchableOpacity><FontAwesome5 name="ellipsis-v" size={14} color={C.g400} /></TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: C.g100, paddingTop: 12 }}>
                <TouchableOpacity style={s.viewProfileBtn}><Text style={s.viewProfileTxt}>View Profile</Text></TouchableOpacity>
                <IBtn icon="phone" lib="FA5" bg={C.green50} color={C.green600} />
                <IBtn icon="whatsapp" lib="FA" bg={C.blue50} color={C.primary} />
                <IBtn icon="envelope" lib="FA5" bg={C.purple50} color={C.purple600} />
              </View>
            </View>
          ))}
        </View>

        {/* CLIENT PROFILE DETAIL */}
        <View style={s.section}>
          <View style={s.sHRow}>
            <Text style={s.sectionTitle}>Client Profile Details</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <FontAwesome5 name="edit" size={12} color={C.primary} />
              <Text style={s.sectionAction}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={s.profileCard}>
            {/* profile header */}
            <View style={s.profileHeader}>
              <Image source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg' }} style={s.profileAvatar} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.profileName}>Marcus Johnson</Text>
                <Text style={s.profileId}>Client ID: CL-2024-1247</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                  <View style={{ backgroundColor: C.red500, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 }}>
                    <Text style={{ color: C.white, fontSize: 11, fontWeight: '700' }}>High Priority</Text>
                  </View>
                  <View style={s.whiteBadge}><Text style={s.whiteBadgeTxt}>Criminal Defense</Text></View>
                </View>
              </View>
            </View>

            <View style={{ padding: 16 }}>
              {[
                { icon: 'phone', iconBg: C.blue100, iconColor: C.primary, label: 'Phone Number', value: '+1 (555) 123-4567', actionIcon: 'phone', actionBg: C.green50, actionColor: C.green600, actionLib: 'FA5' },
                { icon: 'envelope', iconBg: C.purple100, iconColor: C.purple600, label: 'Email Address', value: 'm.johnson@email.com', actionIcon: 'envelope', actionBg: C.purple50, actionColor: C.purple600, actionLib: 'FA5' },
                { icon: 'whatsapp', iconBg: C.green100, iconColor: C.green600, label: 'WhatsApp', value: '+1 (555) 123-4567', actionIcon: 'whatsapp', actionBg: C.green50, actionColor: C.green600, actionLib: 'FA' },
                { icon: 'map-marker-alt', iconBg: C.amber100, iconColor: C.amber600, label: 'Address', value: '742 Evergreen Terrace, Springfield', actionIcon: null },
              ].map((row, i) => (
                <View key={i} style={s.profileRow}>
                  <View style={[s.profileRowIcon, { backgroundColor: row.iconBg }]}>
                    {row.icon === 'whatsapp'
                      ? <FontAwesome name={row.icon} size={16} color={row.iconColor} />
                      : <FontAwesome5 name={row.icon} size={14} color={row.iconColor} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.profileRowLabel}>{row.label}</Text>
                    <Text style={s.profileRowVal}>{row.value}</Text>
                  </View>
                  {row.actionIcon && (
                    <IBtn icon={row.actionIcon} lib={row.actionLib} bg={row.actionBg} color={row.actionColor} size={13} />
                  )}
                </View>
              ))}

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.g200 }}>
                <View style={[s.dateCard, { backgroundColor: C.blue50 }]}>
                  <Text style={s.dateLabel}>Client Since</Text>
                  <Text style={s.dateVal}>Jan 2024</Text>
                </View>
                <View style={[s.dateCard, { backgroundColor: C.green50 }]}>
                  <Text style={s.dateLabel}>Last Contact</Text>
                  <Text style={s.dateVal}>Today</Text>
                </View>
              </View>

              <TouchableOpacity style={s.btnFull}>
                <FontAwesome5 name="briefcase" size={13} color={C.white} />
                <Text style={s.btnFullTxt}>View All Cases</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <TouchableOpacity style={[s.btnHalf, { backgroundColor: C.blue50 }]}>
                  <FontAwesome5 name="file-invoice-dollar" size={13} color={C.primary} />
                  <Text style={[s.btnHalfTxt, { color: C.primary }]}>Invoices</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.btnHalf, { backgroundColor: C.purple50 }]}>
                  <FontAwesome5 name="folder" size={13} color={C.purple600} />
                  <Text style={[s.btnHalfTxt, { color: C.purple600 }]}>Documents</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* CLIENT CASES */}
        <View style={s.section}>
          <View style={s.sHRow}>
            <Text style={s.sectionTitle}>Active Cases</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Text style={s.sectionAction}>See All</Text>
              <FontAwesome5 name="chevron-right" size={10} color={C.primary} />
            </TouchableOpacity>
          </View>
          {CLIENT_CASES.map((c, i) => (
            <View key={i} style={[s.caseCard, { borderLeftColor: c.borderColor }]}>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <View style={s.caseIdBadge}><Text style={s.caseIdTxt}>{c.id}</Text></View>
                <View style={[s.pill, { backgroundColor: c.badgeBg }]}>
                  <Text style={[s.pillTxt, { color: c.badgeColor }]}>{c.badge}</Text>
                </View>
              </View>
              <Text style={s.caseTitle}>{c.title}</Text>
              <Text style={s.caseSub}>{c.subtitle}</Text>
              <View style={s.caseStats}>
                <View style={s.caseStatItem}><Text style={s.caseStatLabel}>{i === 0 ? 'Next Hearing' : 'Closed Date'}</Text><Text style={s.caseStatVal}>{c.stat1}</Text></View>
                <View style={[s.caseStatItem, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: C.g100 }]}><Text style={s.caseStatLabel}>{i === 0 ? 'Status' : 'Outcome'}</Text><Text style={s.caseStatVal}>{c.stat2}</Text></View>
                <View style={s.caseStatItem}><Text style={s.caseStatLabel}>Documents</Text><Text style={s.caseStatVal}>{c.stat3}</Text></View>
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
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  filterBtnTxt: { color: C.white, fontSize: 11, fontWeight: '600' },
  section: { paddingHorizontal: 16, paddingVertical: 18, backgroundColor: C.white, marginBottom: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.dark },
  sectionAction: { fontSize: 13, fontWeight: '700', color: C.primary },
  sHRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  filterBar: { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.g200, maxHeight: 52, flexGrow: 0 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, backgroundColor: C.g100 },
  filterTabActive: { backgroundColor: C.primary },
  filterTabTxt: { fontSize: 12, fontWeight: '600', color: C.g600 },
  filterTabTxtActive: { color: C.white },
  statCard: { flex: 1, backgroundColor: C.white, borderRadius: 18, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  statIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statBigVal: { fontSize: 22, fontWeight: '800', color: C.dark, marginBottom: 2 },
  statSmLabel: { fontSize: 11, color: C.g500, textAlign: 'center' },
  // Featured
  featuredCard: { backgroundColor: C.purple600, borderRadius: 24, padding: 18 },
  featuredAvatar: { width: 64, height: 64, borderRadius: 18, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  featuredName: { fontSize: 18, fontWeight: '800', color: C.white },
  featuredRole: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  vipBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.yellow400, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  vipText: { fontSize: 11, fontWeight: '800', color: '#713F12' },
  whiteBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  whiteBadgeTxt: { fontSize: 11, fontWeight: '600', color: C.white },
  featuredStats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 14 },
  fStatItem: { flex: 1, alignItems: 'center' },
  fStatBordered: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  fStatVal: { fontSize: 22, fontWeight: '800', color: C.white },
  fStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  fBtnWhite: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.white, paddingVertical: 12, borderRadius: 14 },
  fBtnTransp: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 12, borderRadius: 14 },
  fBtnTxt: { fontSize: 13, fontWeight: '700', color: C.white },
  // Client list
  clientCard: { backgroundColor: C.white, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: C.g100, marginBottom: 10 },
  clientAvatar: { width: 56, height: 56, borderRadius: 14, borderWidth: 1.5, borderColor: C.g100 },
  clientName: { fontSize: 14, fontWeight: '700', color: C.dark },
  clientSpecialty: { fontSize: 12, color: C.g600, marginTop: 2 },
  clientMeta: { fontSize: 11, color: C.g500 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillTxt: { fontSize: 11, fontWeight: '600' },
  viewProfileBtn: { flex: 1, backgroundColor: C.primary, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  viewProfileTxt: { color: C.white, fontWeight: '700', fontSize: 13 },
  iconBtn: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, shadowColor: C.primary, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  addBtnTxt: { color: C.white, fontSize: 13, fontWeight: '700' },
  // Profile card
  profileCard: { backgroundColor: C.white, borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: C.g100 },
  profileHeader: { backgroundColor: C.primary, padding: 20, flexDirection: 'row', alignItems: 'flex-start' },
  profileAvatar: { width: 80, height: 80, borderRadius: 20, borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)' },
  profileName: { fontSize: 18, fontWeight: '800', color: C.white },
  profileId: { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  profileRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.g100 },
  profileRowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  profileRowLabel: { fontSize: 11, color: C.g400, marginBottom: 2 },
  profileRowVal: { fontSize: 13, fontWeight: '600', color: C.dark },
  dateCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center' },
  dateLabel: { fontSize: 11, color: C.g600, marginBottom: 3 },
  dateVal: { fontSize: 16, fontWeight: '800', color: C.dark },
  btnFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.primary, paddingVertical: 13, borderRadius: 14 },
  btnFullTxt: { color: C.white, fontWeight: '700', fontSize: 14 },
  btnHalf: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14 },
  btnHalfTxt: { fontWeight: '700', fontSize: 13 },
  // Cases
  caseCard: { backgroundColor: C.white, borderRadius: 14, padding: 14, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: C.g100, marginBottom: 10 },
  caseIdBadge: { backgroundColor: C.blue50, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  caseIdTxt: { fontSize: 11, fontWeight: '700', color: C.primary },
  caseTitle: { fontSize: 14, fontWeight: '700', color: C.dark, marginBottom: 2 },
  caseSub: { fontSize: 12, color: C.g600, marginBottom: 10 },
  caseStats: { flexDirection: 'row', paddingTop: 10, borderTopWidth: 1, borderTopColor: C.g100 },
  caseStatItem: { flex: 1, alignItems: 'center' },
  caseStatLabel: { fontSize: 11, color: C.g500, marginBottom: 2 },
  caseStatVal: { fontSize: 13, fontWeight: '700', color: C.dark },
});
