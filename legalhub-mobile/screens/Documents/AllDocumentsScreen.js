import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { FontAwesome5, FontAwesome, Ionicons } from '@expo/vector-icons';

const C = {
  primary: '#1E40AF', secondary: '#3B82F6', dark: '#1E293B', white: '#FFFFFF',
  g50: '#F9FAFB', g100: '#F3F4F6', g200: '#E5E7EB', g400: '#9CA3AF', g500: '#6B7280', g600: '#4B5563',
  red50: '#FEF2F2', red100: '#FEE2E2', red600: '#DC2626',
  amber50: '#FFFBEB', amber100: '#FEF3C7', amber600: '#D97706',
  green50: '#F0FDF4', green100: '#DCFCE7', green600: '#16A34A',
  blue50: '#EFF6FF', blue100: '#DBEAFE', blue600: '#2563EB',
  purple50: '#FAF5FF', purple100: '#F3E8FF', purple600: '#9333EA',
  teal50: '#F0FDFA', teal100: '#CCFBF1', teal600: '#0D9488',
  orange50: '#FFF7ED', orange100: '#FFEDD5', orange600: '#EA580C',
};

const FILTER_TABS = ['All (68)', 'PDF', 'Word', 'Excel', 'Images', 'Recent'];

const SORT_OPTIONS = ['Date ↓', 'Name', 'Size', 'Case'];

const STATS = [
  { val: '68',   label: 'Total Docs',  icon: 'file-alt',    iconBg: C.blue100,   iconColor: C.primary   },
  { val: '12',   label: 'This Week',   icon: 'calendar-week',iconBg: C.green100,  iconColor: C.green600  },
  { val: '2.4GB',label: 'Storage',     icon: 'hdd',         iconBg: C.purple100, iconColor: C.purple600  },
  { val: '5',    label: 'Pending AI',  icon: 'robot',       iconBg: C.amber100,  iconColor: C.amber600  },
];

const DOCS = [
  // ── TODAY ──
  {
    group: "Today — March 6, 2026",
    items: [
      { id: 1, type: 'pdf',   iconColor: C.red600,    iconBg: C.red100,    name: 'Motion to Dismiss - Draft v3.pdf',    case: 'State vs. Johnson',          caseId: 'CR-2024-1247', size: '2.4 MB', date: '2:30 PM', priority: true,  avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', client: 'Marcus Johnson',   tag: 'Motion',         tagColor: C.red600,    tagBg: C.red50,    actions: [{lib:'FA5', name:'robot', bg:C.blue50, color:C.primary, label:'AI Review'}, {lib:'FA5', name:'download', bg:C.green50, color:C.green600, label:'Download'}] },
      { id: 2, type: 'word',  iconColor: C.blue600,   iconBg: C.blue100,   name: 'Contract Amendment - Final.docx',      case: 'Mitchell Corp. Dispute',     caseId: 'CV-2024-0892', size: '1.8 MB', date: '11:15 AM', priority: false, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', client: 'Sarah Mitchell',  tag: 'Contract',       tagColor: C.blue600,   tagBg: C.blue50,   actions: [{lib:'FA5', name:'eye', bg:C.purple50, color:C.purple600, label:'View'}, {lib:'FA5', name:'share-alt', bg:C.green50, color:C.green600, label:'Share'}] },
      { id: 3, type: 'image', iconColor: C.teal600,   iconBg: C.teal100,   name: 'Accident_Scene_Photo_01.jpg',          case: 'Williams Injury Claim',      caseId: 'PI-2024-0678', size: '3.2 MB', date: '9:05 AM',  priority: false, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg', client: 'J. Williams',     tag: 'Evidence',       tagColor: C.teal600,   tagBg: C.teal50,   actions: [{lib:'FA5', name:'search-plus', bg:C.blue50, color:C.primary, label:'Preview'}] },
    ]
  },
  // ── YESTERDAY ──
  {
    group: "Yesterday — March 5, 2026",
    items: [
      { id: 4, type: 'excel', iconColor: C.green600,  iconBg: C.green100,  name: 'Evidence Log - Updated.xlsx',          case: 'State vs. Johnson',          caseId: 'CR-2024-1247', size: '856 KB', date: '4:45 PM',  priority: false, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', client: 'Marcus Johnson',   tag: 'Evidence',       tagColor: C.green600,  tagBg: C.green50,  actions: [{lib:'FA5', name:'download', bg:C.green50, color:C.green600, label:'Download'}] },
      { id: 5, type: 'pdf',   iconColor: C.red600,    iconBg: C.red100,    name: 'Court Filing - Case Summary.pdf',       case: 'Davis Employment',           caseId: 'EM-2024-0345', size: '1.1 MB', date: '2:00 PM',  priority: true,  avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', client: 'Thomas Davis',    tag: 'Filing',         tagColor: C.orange600, tagBg: C.orange50, actions: [{lib:'FA5', name:'robot', bg:C.blue50, color:C.primary, label:'Summarize'}, {lib:'FA5', name:'download', bg:C.green50, color:C.green600, label:'Download'}] },
      { id: 6, type: 'word',  iconColor: C.blue600,   iconBg: C.blue100,   name: 'Estate Distribution Plan v2.docx',     case: 'Chen Estate Planning',       caseId: 'FM-2024-0453', size: '2.2 MB', date: '10:30 AM', priority: false, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg', client: 'Robert Chen',     tag: 'Planning',       tagColor: C.blue600,   tagBg: C.blue50,   actions: [{lib:'FA5', name:'eye', bg:C.purple50, color:C.purple600, label:'View'}, {lib:'FA5', name:'edit', bg:C.amber50, color:C.amber600, label:'Edit'}] },
    ]
  },
  // ── THIS WEEK ──
  {
    group: "This Week",
    items: [
      { id: 7, type: 'pdf',   iconColor: C.red600,    iconBg: C.red100,    name: 'Property Title Search Report.pdf',     case: 'Thompson Real Estate',       caseId: 'RE-2024-0234', size: '4.7 MB', date: 'Mar 4',    priority: false, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg', client: 'M. Thompson',     tag: 'Report',         tagColor: C.red600,    tagBg: C.red50,    actions: [{lib:'FA5', name:'robot', bg:C.blue50, color:C.primary, label:'AI Review'}, {lib:'FA5', name:'download', bg:C.green50, color:C.green600, label:'Download'}] },
      { id: 8, type: 'excel', iconColor: C.green600,  iconBg: C.green100,  name: 'Invoice Tracker Q1 2026.xlsx',         case: 'All Cases',                  caseId: 'ADMIN',        size: '512 KB', date: 'Mar 3',    priority: false, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg', client: 'Admin',           tag: 'Finance',        tagColor: C.green600,  tagBg: C.green50,  actions: [{lib:'FA5', name:'download', bg:C.green50, color:C.green600, label:'Download'}] },
      { id: 9, type: 'image', iconColor: C.teal600,   iconBg: C.teal100,   name: 'Witness_Statement_Scan.jpg',           case: 'State vs. Johnson',          caseId: 'CR-2024-1247', size: '1.9 MB', date: 'Mar 3',    priority: true,  avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg', client: 'Marcus Johnson',   tag: 'Evidence',       tagColor: C.teal600,   tagBg: C.teal50,   actions: [{lib:'FA5', name:'search-plus', bg:C.blue50, color:C.primary, label:'Preview'}, {lib:'FA5', name:'robot', bg:C.purple50, color:C.purple600, label:'OCR'}] },
      { id: 10, type: 'word', iconColor: C.blue600,   iconBg: C.blue100,   name: 'Mediation Agreement Draft.docx',       case: 'Davis Employment',           caseId: 'EM-2024-0345', size: '988 KB', date: 'Mar 2',    priority: false, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', client: 'Thomas Davis',    tag: 'Agreement',      tagColor: C.blue600,   tagBg: C.blue50,   actions: [{lib:'FA5', name:'eye', bg:C.purple50, color:C.purple600, label:'View'}, {lib:'FA5', name:'share-alt', bg:C.green50, color:C.green600, label:'Share'}] },
    ]
  },
];

const FILE_ICONS = {
  pdf:   { lib: 'FA5', name: 'file-pdf'   },
  word:  { lib: 'FA5', name: 'file-word'  },
  excel: { lib: 'FA5', name: 'file-excel' },
  image: { lib: 'FA5', name: 'file-image' },
  other: { lib: 'FA5', name: 'file-alt'   },
};

export default function AllDocumentsScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState(0);
  const [activeSort, setActiveSort]     = useState(0);
  const [search, setSearch]             = useState('');

  const filtered = DOCS.map(group => ({
    ...group,
    items: group.items.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.case.toLowerCase().includes(search.toLowerCase()) ||
      d.client.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(g => g.items.length > 0);

  const totalResults = filtered.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()}>
            <FontAwesome5 name="arrow-left" size={16} color={C.white} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.headerTitle}>All Documents</Text>
            <Text style={s.headerSub}>68 files across all cases</Text>
          </View>
          <TouchableOpacity style={s.addBtn}>
            <FontAwesome5 name="cloud-upload-alt" size={14} color={C.white} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {STATS.map((st, i) => (
            <View key={i} style={s.statItem}>
              <View style={[s.statIconWrap, { backgroundColor: st.iconBg }]}>
                <FontAwesome5 name={st.icon} size={13} color={st.iconColor} />
              </View>
              <Text style={s.statVal}>{st.val}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.7)" />
          <TextInput
            style={s.searchInput}
            placeholder="Search documents, cases, clients..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── FILTER TABS ── */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={s.filterBar}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}
      >
        {FILTER_TABS.map((t, i) => (
          <TouchableOpacity
            key={i}
            style={[s.filterTab, activeFilter === i && s.filterTabActive]}
            onPress={() => setActiveFilter(i)}
          >
            <Text style={[s.filterTabTxt, activeFilter === i && s.filterTabTxtActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── SORT BAR ── */}
      <View style={s.sortBar}>
        <Text style={s.sortLabel}>Sort by:</Text>
        {SORT_OPTIONS.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={[s.sortChip, activeSort === i && s.sortChipActive]}
            onPress={() => setActiveSort(i)}
          >
            <Text style={[s.sortChipTxt, activeSort === i && s.sortChipTxtActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ flex: 1 }} />
        <Text style={s.resultsCount}>{totalResults} files</Text>
      </View>

      {/* ── AI BANNER ── */}
      <View style={s.aiBanner}>
        <View style={s.aiIconWrap}>
          <FontAwesome5 name="robot" size={16} color={C.white} />
        </View>
        <Text style={s.aiText}>5 documents pending AI review</Text>
        <TouchableOpacity style={s.aiBtn}>
          <Text style={s.aiBtnTxt}>Review All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((group, gi) => (
          <View key={gi} style={{ marginBottom: 8 }}>
            {/* Group header */}
            <View style={s.groupHeader}>
              <View style={s.groupDot} />
              <Text style={s.groupTitle}>{group.group}</Text>
              <Text style={s.groupCount}>{group.items.length} files</Text>
            </View>

            {/* Documents */}
            {group.items.map((doc) => {
              const fi = FILE_ICONS[doc.type] || FILE_ICONS.other;
              return (
                <View key={doc.id} style={[s.card, doc.priority && s.cardPriority]}>
                  {doc.priority && (
                    <View style={s.priorityFlag}>
                      <FontAwesome5 name="star" size={9} color={C.amber600} solid />
                    </View>
                  )}

                  {/* Top row */}
                  <View style={s.cardTop}>
                    <View style={[s.docIconWrap, { backgroundColor: doc.iconBg }]}>
                      <FontAwesome5 name={fi.name} size={22} color={doc.iconColor} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={s.docName} numberOfLines={1}>{doc.name}</Text>
                      <Text style={s.docCase}>{doc.case}</Text>
                      <View style={s.metaRow}>
                        <Text style={s.metaTxt}>{doc.size}</Text>
                        <Text style={s.metaDot}>·</Text>
                        <Text style={s.metaTxt}>{doc.date}</Text>
                        <View style={[s.docTag, { backgroundColor: doc.tagBg }]}>
                          <Text style={[s.docTagTxt, { color: doc.tagColor }]}>{doc.tag}</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity style={s.moreBtn}>
                      <FontAwesome5 name="ellipsis-v" size={13} color={C.g400} />
                    </TouchableOpacity>
                  </View>

                  {/* Footer */}
                  <View style={s.cardFooter}>
                    <View style={s.clientRow}>
                      <Image source={{ uri: doc.avatar }} style={s.avatar} />
                      <View style={{ marginLeft: 8 }}>
                        <Text style={s.clientName}>{doc.client}</Text>
                        <Text style={s.caseId}>{doc.caseId}</Text>
                      </View>
                    </View>
                    <View style={s.actionsRow}>
                      {doc.actions.map((a, ai) => (
                        <TouchableOpacity key={ai} style={[s.actionBtn, { backgroundColor: a.bg }]}>
                          {a.lib === 'FA5'
                            ? <FontAwesome5 name={a.name} size={11} color={a.color} />
                            : <FontAwesome name={a.name} size={11} color={a.color} />}
                          <Text style={[s.actionBtnTxt, { color: a.color }]}>{a.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* Upload CTA */}
        <TouchableOpacity style={s.uploadCta}>
          <FontAwesome5 name="cloud-upload-alt" size={20} color={C.primary} />
          <Text style={s.uploadCtaTxt}>Upload New Document</Text>
          <FontAwesome5 name="arrow-right" size={12} color={C.primary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.primary },
  scroll: { flex: 1, backgroundColor: C.g50 },
  header: { backgroundColor: C.primary, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.white },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, paddingVertical: 12, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statItem: { alignItems: 'center', gap: 3 },
  statIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 15, fontWeight: '800', color: C.white },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.72)' },

  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, color: C.white, fontSize: 13 },

  filterBar: { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.g200, maxHeight: 52, flexGrow: 0 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, backgroundColor: C.g100 },
  filterTabActive: { backgroundColor: C.primary },
  filterTabTxt: { fontSize: 12, fontWeight: '600', color: C.g600 },
  filterTabTxtActive: { color: C.white },

  sortBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.g100, gap: 6 },
  sortLabel: { fontSize: 12, color: C.g500, marginRight: 2 },
  sortChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: C.g100 },
  sortChipActive: { backgroundColor: C.blue50, borderWidth: 1, borderColor: C.primary },
  sortChipTxt: { fontSize: 11, fontWeight: '600', color: C.g600 },
  sortChipTxtActive: { color: C.primary },
  resultsCount: { fontSize: 12, color: C.g400 },

  aiBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 16, paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: '#C7D2FE' },
  aiIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center' },
  aiText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#3730A3' },
  aiBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  aiBtnTxt: { fontSize: 12, fontWeight: '700', color: C.white },

  groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  groupDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary },
  groupTitle: { fontSize: 13, fontWeight: '700', color: C.dark, flex: 1 },
  groupCount: { fontSize: 11, color: C.g400 },

  card: { backgroundColor: C.white, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: C.g100, marginBottom: 10, position: 'relative' },
  cardPriority: { borderColor: C.amber600, borderWidth: 1.5 },
  priorityFlag: { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: C.amber50, alignItems: 'center', justifyContent: 'center' },

  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  docIconWrap: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docName: { fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 2 },
  docCase: { fontSize: 12, color: C.g500, marginBottom: 5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  metaTxt: { fontSize: 11, color: C.g400 },
  metaDot: { fontSize: 11, color: C.g400 },
  docTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  docTagTxt: { fontSize: 10, fontWeight: '700' },
  moreBtn: { padding: 6 },

  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: C.g100 },
  clientRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 26, height: 26, borderRadius: 13 },
  clientName: { fontSize: 12, fontWeight: '700', color: C.dark },
  caseId: { fontSize: 10, color: C.primary, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  actionBtnTxt: { fontSize: 11, fontWeight: '600' },

  uploadCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: C.primary, backgroundColor: C.blue50, marginTop: 4 },
  uploadCtaTxt: { fontSize: 14, fontWeight: '700', color: C.primary },
});
