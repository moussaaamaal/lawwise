import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { FontAwesome5, FontAwesome, Ionicons } from '@expo/vector-icons';
import { casesAPI } from '../../services/api';
import CaseDetailsScreen from './CaseDetailsScreen';

const C = {
  primary: '#1E40AF', secondary: '#3B82F6', dark: '#1E293B', white: '#FFFFFF',
  g50: '#F9FAFB', g100: '#F3F4F6', g200: '#E5E7EB', g400: '#9CA3AF', g500: '#6B7280', g600: '#4B5563',
  red50: '#FEF2F2', red100: '#FEE2E2', red500: '#EF4444', red600: '#DC2626',
  amber50: '#FFFBEB', amber100: '#FEF3C7', amber600: '#D97706',
  green50: '#F0FDF4', green100: '#DCFCE7', green600: '#16A34A',
  blue50: '#EFF6FF', blue100: '#DBEAFE', blue600: '#2563EB',
  purple50: '#FAF5FF', purple100: '#F3E8FF', purple600: '#9333EA',
  indigo600: '#4F46E5',
};


const CASES = [
  {
    id: 'CR-2024-1247', urgency: 'Urgent', urgencyIcon: 'fire', urgencyColor: C.red600, urgencyBg: C.red50, borderColor: C.red500,
    title: 'State vs. Johnson', subtitle: 'Criminal Defense — Assault Charges',
    type: 'Criminal Law', phase: 'Trial Phase', priority: 'urgent', status: 'Active', filingDate: '2024-01-15',
    court: 'Manhattan Criminal Court', judge: 'Hon. Patricia Williams', prosecutor: 'DA Robert Chen',
    attorney: 'Sarah Williams - Lead Attorney', caseValue: '$45,000',
    description: 'Client charged with assault — self-defense claim. Key evidence: surveillance footage and witness testimonies.',
    tags: ['Criminal Law', 'Self Defense', 'Trial'],
    nextHearing: { label: 'Today', time: '09:30 AM', room: 'Room 305', countdown: '2h 47m' },
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
    client: 'Marcus Johnson', clientSince: 'Jan 2024',
    hearing: 'Today', docs: '23', tasks: '5',
    clientData: { name: 'Marcus Johnson', id: 'CL-2024-089', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', since: 'January 15, 2024', phone: '+1 (555) 234-5678', email: 'm.johnson@email.com', address: '742 Evergreen Terrace, Springfield', status: 'Active', tier: 'Verified' },
  },
  {
    id: 'CV-2024-0892', urgency: 'Medium', urgencyIcon: 'exclamation-triangle', urgencyColor: C.amber600, urgencyBg: C.amber50, borderColor: C.amber600,
    title: 'Mitchell Corp. Contract Dispute', subtitle: 'Corporate Law — Breach of Contract',
    type: 'Corporate Law', phase: 'Discovery', priority: 'medium', status: 'Active', filingDate: '2023-12-10',
    court: 'New York Civil Court', judge: 'Hon. James T. Murphy', prosecutor: 'Counsel: David Rivers',
    attorney: 'Michael Chen - Lead Attorney', caseValue: '$120,000',
    description: 'Mitchell Corporation disputes contract amendment by former vendor claiming breach of agreed terms.',
    tags: ['Corporate Law', 'Discovery'],
    nextHearing: { label: 'Mar 18', time: '11:00 AM', room: 'Room 12', countdown: '2 days' },
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
    client: 'Sarah Mitchell', clientSince: 'Dec 2023',
    hearing: 'Mar 18', docs: '47', tasks: '3',
    clientData: { name: 'Sarah Mitchell', id: 'CL-2023-512', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', since: 'December 1, 2023', phone: '+1 (555) 987-6543', email: 's.mitchell@mitchellcorp.com', address: '1200 Fifth Avenue, New York', status: 'Active', tier: 'VIP' },
  },
  {
    id: 'FM-2024-0453', urgency: 'Normal', urgencyIcon: 'check', urgencyColor: C.green600, urgencyBg: C.green50, borderColor: C.green600,
    title: 'Chen Family Estate Planning', subtitle: 'Family Law — Estate Distribution',
    type: 'Family Law', phase: 'Planning', priority: 'normal', status: 'Active', filingDate: '2023-11-20',
    court: 'Surrogate Court, NY', judge: 'Hon. Linda Park', prosecutor: 'N/A',
    attorney: 'Jennifer Davis - Lead Attorney', caseValue: '$320,000',
    description: 'Estate planning and distribution for the Chen family involving wills, asset allocation, and beneficiary disputes.',
    tags: ['Family Law', 'Planning'],
    nextHearing: null,
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
    client: 'Robert Chen', clientSince: 'Nov 2023',
    hearing: 'Mar 20', docs: '31', tasks: '2',
    clientData: { name: 'Robert Chen', id: 'CL-2023-498', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg', since: 'November 20, 2023', phone: '+1 (555) 456-7890', email: 'r.chen@email.com', address: '55 Riverside Dr, New York', status: 'Active', tier: 'Verified' },
  },
  {
    id: 'PI-2024-0678', urgency: 'Urgent', urgencyIcon: 'fire', urgencyColor: C.red600, urgencyBg: C.red50, borderColor: C.red500,
    title: 'Williams Personal Injury Claim', subtitle: 'Personal Injury — Car Accident',
    type: 'Personal Injury', phase: 'Litigation', priority: 'urgent', status: 'Active', filingDate: '2024-02-01',
    court: 'Queens Civil Court', judge: 'Hon. Antonio Rivera', prosecutor: 'Opposing: Clark & Assoc.',
    attorney: 'Sarah Williams - Lead Attorney', caseValue: '$85,000',
    description: 'Jennifer Williams suffered injuries in a car accident. Medical reports, accident reconstruction, and insurance negotiation.',
    tags: ['Personal Injury', 'Litigation'],
    nextHearing: { label: 'Tomorrow', time: '10:00 AM', room: 'Room 8', countdown: '1 day' },
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
    client: 'Jennifer Williams', clientSince: 'Feb 2024',
    hearing: 'Tomorrow', docs: '19', tasks: '7',
    clientData: { name: 'Jennifer Williams', id: 'CL-2024-201', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg', since: 'February 1, 2024', phone: '+1 (555) 321-6549', email: 'j.williams@email.com', address: '88 Queens Blvd, Queens, NY', status: 'Active', tier: 'Standard' },
  },
  {
    id: 'RE-2024-0234', urgency: 'Normal', urgencyIcon: 'info-circle', urgencyColor: C.blue600, urgencyBg: C.blue50, borderColor: C.secondary,
    title: 'Thompson Real Estate Transaction', subtitle: 'Real Estate — Property Sale',
    type: 'Real Estate', phase: 'Closing', priority: 'normal', status: 'Active', filingDate: '2024-01-10',
    court: 'N/A', judge: 'N/A', prosecutor: 'Opposing: Barker Law Group',
    attorney: 'Michael Chen - Lead Attorney', caseValue: '$1,200,000',
    description: 'Michael Thompson selling Manhattan property. Contract drafting, title searches, and closing procedures.',
    tags: ['Real Estate', 'Closing'],
    nextHearing: null,
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg',
    client: 'Michael Thompson', clientSince: 'Jan 2024',
    hearing: 'Mar 22', docs: '38', tasks: '4',
    clientData: { name: 'Michael Thompson', id: 'CL-2024-178', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg', since: 'January 10, 2024', phone: '+1 (555) 654-3210', email: 'm.thompson@email.com', address: '420 Park Avenue, Manhattan', status: 'Active', tier: 'VIP' },
  },
  {
    id: 'EM-2024-0345', urgency: 'Medium', urgencyIcon: 'exclamation-triangle', urgencyColor: C.amber600, urgencyBg: C.amber50, borderColor: C.amber600,
    title: 'Davis Employment Dispute', subtitle: 'Employment Law — Wrongful Termination',
    type: 'Employment Law', phase: 'Mediation', priority: 'medium', status: 'Active', filingDate: '2024-02-15',
    court: 'NLRB', judge: 'Mediator J. Collins', prosecutor: 'Employer: Global Inc. Legal',
    attorney: 'Michael Chen - Lead Attorney', caseValue: '$65,000',
    description: 'Thomas Davis wrongfully terminated after whistleblower complaint. Mediation with employer.',
    tags: ['Employment Law', 'Mediation'],
    nextHearing: { label: 'Mar 19', time: '02:30 PM', room: 'Mediation Room B', countdown: '3 days' },
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
    client: 'Thomas Davis', clientSince: 'Feb 2024',
    hearing: 'Mar 19', docs: '26', tasks: '4',
    clientData: { name: 'Thomas Davis', id: 'CL-2024-245', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', since: 'February 15, 2024', phone: '+1 (555) 234-9876', email: 't.davis@email.com', address: '34 Midtown Ave, New York', status: 'Active', tier: 'Standard' },
  },
];

const toCaseDetails = (c) => ({
  ...c,
  stats: { docs: parseInt(c.docs), tasks: parseInt(c.tasks), events: 3, notes: 8 },
  timeTracking: { billable: 47.5, nonBillable: 12.3 },
  client: c.clientData,
  events: [
    { id:1, icon:'gavel', color:'#DC2626', bg:'#FEF2F2', title:'Court Hearing', desc:'Scheduled hearing', dateLabel: c.nextHearing?.label || 'TBD', time: c.nextHearing?.time || 'TBD', urgent: c.priority === 'urgent' },
    { id:2, icon:'users', color:'#1E40AF', bg:'#EFF6FF', title:'Client Meeting', desc:'Strategy discussion', dateLabel:'Tomorrow', time:'02:00 PM', urgent: false },
    { id:3, icon:'file-signature', color:'#9333EA', bg:'#FAF5FF', title:'Document Deadline', desc:'Filing due', dateLabel:'Mar 19', time:'05:00 PM', urgent: false },
  ],
  documents: [
    { id:1, icon:'file-pdf',   iconColor:'#fff', iconBg:'#DC2626', name:'Motion to Dismiss.pdf',  size:'2.4 MB', date:'2 hours ago', priority: true  },
    { id:2, icon:'file-word',  iconColor:'#fff', iconBg:'#1E40AF', name:'Case Summary.docx',      size:'1.8 MB', date:'Yesterday',   priority: false },
    { id:3, icon:'file-excel', iconColor:'#fff', iconBg:'#16A34A', name:'Evidence Log.xlsx',      size:'856 KB', date:'3 days ago',  priority: false },
  ],
  tasks: [
    { id:1, title:'File Motion', due:'Due Today 5:00 PM', dueColor:'#DC2626', priority:'urgent', assignee:'Lead Attorney', done: false },
    { id:2, title:'Review Evidence', due:'Due Tomorrow', dueColor:'#D97706', priority:'medium', assignee:'Associate', done: false },
    { id:3, title:'Draft Statement', due:'Completed', dueColor:'#16A34A', priority:'normal', assignee:'Lead Attorney', done: true },
  ],
  timeline: [
    { id:1, icon:'gavel',    color:'#fff', bg:'#DC2626', title:'Hearing Scheduled', desc:'Assigned courtroom', time:'Upcoming', badge:'Hearing', badgeColor:'#DC2626', badgeBg:'#FEF2F2' },
    { id:2, icon:'file-alt', color:'#fff', bg:'#1E40AF', title:'Motion Filed',      desc:'Defense motion with docs', time:'2 hrs ago', badge:'Document', badgeColor:'#1E40AF', badgeBg:'#EFF6FF' },
  ],
  notes: [
    { id:1, author:'Lead Attorney', avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', title:'Meeting Summary', content:'Discussed strategy and upcoming deadlines.', time:'2 hours ago', borderColor:'#D97706', bg:'#FFFBEB' },
  ],
});

// Priority → display config
const PRIORITY_STYLE = {
  URGENT: { urgency: 'Urgent', urgencyIcon: 'fire',               urgencyColor: C.red600,   urgencyBg: C.red50,   borderColor: C.red500   },
  HIGH:   { urgency: 'High',   urgencyIcon: 'exclamation-circle',  urgencyColor: C.red600,   urgencyBg: C.red50,   borderColor: C.red500   },
  MEDIUM: { urgency: 'Medium', urgencyIcon: 'exclamation-triangle',urgencyColor: C.amber600, urgencyBg: C.amber50, borderColor: C.amber600 },
  NORMAL: { urgency: 'Normal', urgencyIcon: 'info-circle',         urgencyColor: C.blue600,  urgencyBg: C.blue50,  borderColor: C.secondary },
  LOW:    { urgency: 'Low',    urgencyIcon: 'check',               urgencyColor: C.green600, urgencyBg: C.green50, borderColor: C.green600 },
};

function apiCaseToCard(c) {
  const ps = PRIORITY_STYLE[c.priority] || PRIORITY_STYLE.NORMAL;
  const clientName = c.client_name || (c.client ? `${c.client.first_name} ${c.client.last_name}` : 'N/A');
  return {
    ...ps,
    id: c.case_number || c.id,
    _id: c.id,
    title: c.title,
    subtitle: `${c.case_type} — ${c.status}`,
    type: c.case_type, phase: c.status, priority: c.priority?.toLowerCase() || 'normal',
    status: c.status, filingDate: c.filing_date || '',
    court: c.court_name || '', judge: c.judge_name || '', prosecutor: c.opposing_party || '',
    attorney: '', caseValue: c.estimated_value ? `$${c.estimated_value}` : '',
    description: c.description || '',
    tags: [c.case_type],
    nextHearing: null,
    avatar: null,
    client: clientName, clientSince: c.created_at ? c.created_at.slice(0, 10) : '',
    hearing: '—', docs: '—', tasks: '—',
    clientData: { name: clientName, id: c.client_id || '', avatar: null, since: '', phone: '', email: '', address: '', status: 'Active', tier: '' },
  };
}

export default function AllCasesScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState(0);
  const [search, setSearch]             = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [cases, setCases]               = useState(CASES);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    casesAPI.list()
      .then(data => setCases((data || []).map(apiCaseToCard)))
      .catch(() => {/* keep static fallback */})
      .finally(() => setLoading(false));
  }, []);

  if (selectedCase) {
    return <CaseDetailsScreen navigation={{ goBack: () => setSelectedCase(null) }} route={{ params: { caseData: selectedCase } }} />;
  }

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

  const filtered = cases.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (typeof c.client === 'string' && c.client.toLowerCase().includes(search.toLowerCase())) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

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
            <Text style={s.headerTitle}>Active Cases</Text>
            <Text style={s.headerSub}>24 cases total</Text>
          </View>
        </View>
        <View style={s.searchWrap}>
          <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.7)" />
          <TextInput style={s.searchInput} placeholder="Search cases, clients, ID..." placeholderTextColor="rgba(255,255,255,0.6)"
            value={search} onChangeText={setSearch} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={s.resultsCount}>{filtered.length} cases found</Text>

        {filtered.map((c, i) => (
          <View key={i} style={[s.card, { borderLeftWidth: 4, borderLeftColor: c.borderColor }]}>
            {/* Header */}
            <View style={s.cardHeaderRow}>
              <View style={s.row}>
                <View style={s.caseIdBadge}><Text style={s.caseIdTxt}>{c.id}</Text></View>
                <View style={[s.pill, { backgroundColor: c.urgencyBg, marginLeft: 6 }]}>
                  <FontAwesome5 name={c.urgencyIcon} size={9} color={c.urgencyColor} />
                  <Text style={[s.pillTxt, { color: c.urgencyColor, marginLeft: 4 }]}>{c.urgency}</Text>
                </View>
              </View>
            </View>

            <Text style={s.caseTitle}>{c.title}</Text>
            <Text style={s.caseSub}>{c.subtitle}</Text>

            {/* Tags */}
            <View style={[s.row, { flexWrap: 'wrap', gap: 6, marginBottom: 12 }]}>
              {c.tags.map((t, ti) => (
                <View key={ti} style={[s.pill, { backgroundColor: C.g100 }]}>
                  <Text style={[s.pillTxt, { color: C.g600 }]}>{t}</Text>
                </View>
              ))}
            </View>

            {/* Client */}
            <View style={[s.row, s.clientRow]}>
              <Image source={{ uri: c.avatar }} style={s.avatar} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={s.clientName}>{c.client}</Text>
                <Text style={s.clientSince}>Client since {c.clientSince}</Text>
              </View>
              <TouchableOpacity style={[s.iconBtn, { backgroundColor: C.green50 }]}>
                <FontAwesome name="whatsapp" size={14} color={C.green600} />
              </TouchableOpacity>
              <TouchableOpacity style={[s.iconBtn, { backgroundColor: C.blue50, marginLeft: 6 }]}>
                <FontAwesome5 name="phone" size={12} color={C.primary} />
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={s.statsRow}>
              {[
                { label: 'Next Hearing', val: c.hearing },
                { label: 'Documents', val: c.docs },
                { label: 'Tasks', val: `${c.tasks} pending` },
              ].map((st, si) => (
                <View key={si} style={[s.statCol, si > 0 && { borderLeftWidth: 1, borderLeftColor: C.g100 }]}>
                  <Text style={s.statLabel}>{st.label}</Text>
                  <Text style={s.statVal}>{st.val}</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={s.row}>
              <TouchableOpacity style={s.btnPrimary} onPress={() => setSelectedCase(toCaseDetails(c))}>
                <FontAwesome5 name="eye" size={13} color={C.white} />
                <Text style={s.btnPrimaryTxt}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.72)' },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, color: C.white, fontSize: 13 },
  filterBar: { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.g200, maxHeight: 52, flexGrow: 0 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, backgroundColor: C.g100 },
  filterTabActive: { backgroundColor: C.primary },
  filterTabTxt: { fontSize: 12, fontWeight: '600', color: C.g600 },
  filterTabTxtActive: { color: C.white },
  resultsCount: { fontSize: 12, color: C.g500, marginBottom: 12 },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: C.g100, marginBottom: 12 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  caseIdBadge: { backgroundColor: C.blue50, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  caseIdTxt: { fontSize: 11, fontWeight: '700', color: C.primary },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillTxt: { fontSize: 11, fontWeight: '600' },
  caseTitle: { fontSize: 15, fontWeight: '700', color: C.dark, marginBottom: 2 },
  caseSub: { fontSize: 12, color: C.g500, marginBottom: 8 },
  clientRow: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.g100 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  clientName: { fontSize: 13, fontWeight: '700', color: C.dark },
  clientSince: { fontSize: 11, color: C.g400 },
  iconBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.g100 },
  statCol: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  statLabel: { fontSize: 10, color: C.g400, marginBottom: 2 },
  statVal: { fontSize: 13, fontWeight: '700', color: C.dark },
  btnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.primary, paddingVertical: 10, borderRadius: 12 },
  btnPrimaryTxt: { fontSize: 13, fontWeight: '700', color: C.white },
});
