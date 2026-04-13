import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar, Image, Dimensions,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const { width: W } = Dimensions.get('window');

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  primary:   '#1E40AF',
  secondary: '#3B82F6',
  dark:      '#1E293B',
  white:     '#FFFFFF',
  g50:       '#F9FAFB',
  g100:      '#F3F4F6',
  g200:      '#E5E7EB',
  g400:      '#9CA3AF',
  g500:      '#6B7280',
  g600:      '#4B5563',
  red50:     '#FEF2F2',
  red100:    '#FEE2E2',
  red500:    '#EF4444',
  red600:    '#DC2626',
  amber50:   '#FFFBEB',
  amber100:  '#FEF3C7',
  amber600:  '#D97706',
  green50:   '#F0FDF4',
  green100:  '#DCFCE7',
  green600:  '#16A34A',
  blue50:    '#EFF6FF',
  blue100:   '#DBEAFE',
  purple50:  '#FAF5FF',
  purple100: '#F3E8FF',
  purple500: '#A855F7',
  purple600: '#9333EA',
  indigo600: '#4F46E5',
  teal600:   '#0D9488',
};

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const CASE = {
  id:          'CR-2024-1247',
  title:       'State vs. Johnson',
  subtitle:    'Criminal Defense — Assault Charges',
  type:        'Criminal Law',
  phase:       'Trial Phase',
  priority:    'urgent',
  status:      'Active',
  filingDate:  '2024-01-15',
  court:       'Manhattan Criminal Court',
  judge:       'Hon. Patricia Williams',
  prosecutor:  'DA Robert Chen',
  attorney:    'Sarah Williams - Lead Attorney',
  caseValue:   '$45,000',
  description: 'Client is charged with assault in the second degree following an altercation at a local establishment. The prosecution alleges intentional harm, while the defense maintains self-defense. Key evidence includes surveillance footage and witness testimonies.',
  tags:        ['Criminal Law', 'Self Defense', 'Trial'],
  nextHearing: { label: 'Today', time: '09:30 AM', room: 'Room 305', countdown: '2h 47m' },
  stats:       { docs: 23, tasks: 5, events: 8, notes: 12 },
  timeTracking:{ billable: 47.5, nonBillable: 12.3 },
  client: {
    name:    'Marcus Johnson',
    id:      'CL-2024-089',
    avatar:  'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
    since:   'January 15, 2024',
    phone:   '+1 (555) 234-5678',
    email:   'm.johnson@email.com',
    address: '742 Evergreen Terrace, Springfield',
    status:  'Active',
    tier:    'Verified',
  },
  events: [
    { id:1, icon:'gavel',          color:C.red600,    bg:C.red50,    title:'Court Hearing',      desc:'Pre-trial motion hearing', dateLabel:'Today',    time:'09:30 AM', urgent:true  },
    { id:2, icon:'users',          color:C.primary,   bg:C.blue50,   title:'Client Meeting',     desc:'Strategy discussion',      dateLabel:'Tomorrow', time:'02:00 PM', urgent:false },
    { id:3, icon:'file-signature', color:C.purple600, bg:C.purple50, title:'Document Deadline',  desc:'Motion filing due',        dateLabel:'Mar 19',   time:'05:00 PM', urgent:false },
  ],
  documents: [
    { id:1, icon:'file-pdf',   iconColor:'#fff', iconBg:C.red600,    name:'Motion to Dismiss.pdf',     size:'2.4 MB', date:'2 hours ago',  priority:true  },
    { id:2, icon:'file-word',  iconColor:'#fff', iconBg:C.primary,   name:'Case Summary.docx',         size:'1.8 MB', date:'Yesterday',    priority:false },
    { id:3, icon:'file-excel', iconColor:'#fff', iconBg:C.green600,  name:'Evidence Log.xlsx',         size:'856 KB', date:'3 days ago',   priority:false },
    { id:4, icon:'file-alt',   iconColor:'#fff', iconBg:C.purple600, name:'Witness Statements.pdf',    size:'3.1 MB', date:'5 days ago',   priority:false },
  ],
  tasks: [
    { id:1, title:'File Motion to Dismiss',      due:'Due Today 5:00 PM',    dueColor:C.red600,   priority:'urgent', assignee:'Sarah Williams', done:false },
    { id:2, title:'Review Evidence Documents',   due:'Due Tomorrow 3:00 PM', dueColor:C.amber600, priority:'medium', assignee:'Michael Chen',   done:false },
    { id:3, title:'Prepare Witness List',        due:'Due Mar 18',           dueColor:C.primary,  priority:'normal', assignee:'Jennifer Davis',  done:false },
    { id:4, title:'Draft Opening Statement',     due:'Completed',            dueColor:C.green600, priority:'normal', assignee:'Sarah Williams',  done:true  },
  ],
  timeline: [
    { id:1, icon:'gavel',     color:'#fff', bg:C.red600,    title:'Court Hearing Scheduled',  desc:'Trial hearing at 09:30 AM — Springfield County',          time:'Today',    badge:'Hearing',  badgeColor:C.red600,   badgeBg:C.red50   },
    { id:2, icon:'file-alt',  color:'#fff', bg:C.primary,   title:'Motion to Dismiss Filed',  desc:'Defense motion filed with supporting documentation',       time:'2 hrs ago', badge:'Document', badgeColor:C.primary,  badgeBg:C.blue50  },
    { id:3, icon:'users',     color:'#fff', bg:C.purple500, title:'Client Meeting Completed', desc:'Strategy discussion and case review with Marcus Johnson',   time:'Yesterday', badge:'Meeting',  badgeColor:C.purple600,badgeBg:C.purple50},
    { id:4, icon:'check',     color:'#fff', bg:C.green600,  title:'Evidence Review Done',     desc:'All prosecution evidence reviewed and analyzed',            time:'2 days ago',badge:'Task',    badgeColor:C.green600, badgeBg:C.green50 },
    { id:5, icon:'user-tie',  color:'#fff', bg:C.amber600,  title:'Expert Witness Deposition',desc:'Dr. Smith provided testimony on medical evidence',          time:'3 days ago',badge:'Event',   badgeColor:C.amber600, badgeBg:C.amber50 },
  ],
  notes: [
    { id:1, author:'Sarah Williams', avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', title:'Client Meeting Summary',    content:'Client confirms self-defense account. New witness identified — James T. Kirk present during altercation. Need to subpoena security footage from 3rd Ave.', time:'2 hours ago', borderColor:C.amber600, bg:'#FFFBEB'  },
    { id:2, author:'Michael Chen',   avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', title:'Evidence Analysis Notes',   content:'Prosecution evidence appears weak. Medical report timing inconsistent with arrest timeline. Potential for dismissal if we challenge chain of custody.',    time:'Yesterday',  borderColor:C.primary,   bg:'#EFF6FF'  },
    { id:3, author:'Jennifer Davis', avatar:'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg', title:'Research — Self Defense Law', content:'Relevant precedents found: People v. Smith (2019) and Torres v. State (2021). Both cases affirm reasonable force doctrine in similar contexts.',            time:'2 days ago', borderColor:C.purple600, bg:'#FAF5FF'  },
  ],
};

const PRIORITY = {
  urgent: { label:'Urgent', color:C.red600,   bg:C.red50,   icon:'fire'               },
  high:   { label:'High',   color:C.amber600, bg:C.amber50, icon:'exclamation-triangle'},
  medium: { label:'Medium', color:C.primary,  bg:C.blue50,  icon:'minus-circle'       },
  normal: { label:'Normal', color:C.green600, bg:C.green50, icon:'check-circle'       },
};

const TABS = [
  { key:'overview',  icon:'info-circle', label:'Overview'  },
  { key:'documents', icon:'file-alt',    label:'Documents' },
  { key:'tasks',     icon:'tasks',       label:'Tasks'     },
  { key:'notes',     icon:'sticky-note', label:'Notes'     },
  { key:'timeline',  icon:'history',     label:'Timeline'  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const Chip = ({ label, color, bg }) => (
  <View style={[h.chip, { backgroundColor: bg }]}>
    <Text style={[h.chipText, { color }]}>{label}</Text>
  </View>
);

const Row = ({ icon, iconBg, iconColor, label, value, actionIcon, actionBg, actionColor }) => (
  <View style={h.row}>
    <View style={[h.rowIcon, { backgroundColor: iconBg }]}>
      <FontAwesome5 name={icon} size={14} color={iconColor} />
    </View>
    <View style={{ flex:1, marginLeft:12 }}>
      <Text style={h.rowLabel}>{label}</Text>
      <Text style={h.rowValue}>{value}</Text>
    </View>
    {actionIcon && (
      <TouchableOpacity style={[h.rowAction, { backgroundColor: actionBg }]}>
        <FontAwesome5 name={actionIcon} size={13} color={actionColor} />
      </TouchableOpacity>
    )}
  </View>
);

const SectionHeader = ({ title, action, onAction }) => (
  <View style={h.sectionHeader}>
    <Text style={h.sectionTitle}>{title}</Text>
    {action && <TouchableOpacity onPress={onAction}><Text style={h.sectionAction}>{action}</Text></TouchableOpacity>}
  </View>
);

const h = StyleSheet.create({
  chip:          { paddingHorizontal:10, paddingVertical:4, borderRadius:20 },
  chipText:      { fontSize:11, fontWeight:'700' },
  row:           { flexDirection:'row', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderBottomColor:C.g100 },
  rowIcon:       { width:40, height:40, borderRadius:12, alignItems:'center', justifyContent:'center', flexShrink:0 },
  rowLabel:      { fontSize:11, color:C.g400, marginBottom:2 },
  rowValue:      { fontSize:13, fontWeight:'600', color:C.dark },
  rowAction:     { width:36, height:36, borderRadius:10, alignItems:'center', justifyContent:'center' },
  sectionHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:14 },
  sectionTitle:  { fontSize:16, fontWeight:'800', color:C.dark },
  sectionAction: { fontSize:13, fontWeight:'700', color:C.primary },
});

// ═════════════════════════════════════════════════════════════════════════════
//  TAB: OVERVIEW
// ═════════════════════════════════════════════════════════════════════════════
const OverviewTab = ({ caseData, editMode, form, setForm }) => {
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <View>
      {/* Urgent countdown banner */}
      {caseData.nextHearing && (
        <View style={ov.urgentBanner}>
          <View style={ov.urgentLeft}>
            <View style={ov.pulseDot} />
            <Text style={ov.urgentLabel}>URGENT</Text>
          </View>
          <View style={ov.urgentRight}>
            <FontAwesome5 name="clock" size={12} color={C.red600} />
            <Text style={ov.urgentText}>Hearing Today — {caseData.nextHearing.time}</Text>
          </View>
        </View>
      )}

      {/* Countdown card */}
      {caseData.nextHearing && (
        <View style={ov.countdownCard}>
          <Text style={ov.countdownLabel}>Time Remaining</Text>
          <Text style={ov.countdownValue}>{caseData.nextHearing.countdown}</Text>
        </View>
      )}

      {/* Case Description */}
      <View style={card.wrap}>
        <SectionHeader title="Case Description" action={editMode ? null : 'Edit'} />
        {editMode ? (
          <TextInput
            style={[form_s.input, { height:90, textAlignVertical:'top', paddingTop:10 }]}
            value={form.description}
            onChangeText={v => upd('description', v)}
            multiline
          />
        ) : (
          <Text style={ov.descText}>{caseData.description}</Text>
        )}
        <View style={ov.detailGrid}>
          {[['Court',      caseData.court],
            ['Judge',      caseData.judge],
            ['Prosecutor', caseData.prosecutor],
            ['Case Value', caseData.caseValue],
          ].map(([k, v]) => (
            <View key={k} style={ov.detailItem}>
              <Text style={ov.detailKey}>{k}</Text>
              <Text style={ov.detailVal}>{v}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Case Details (editable) */}
      <View style={card.wrap}>
        <SectionHeader title="Case Details" action={editMode ? undefined : undefined} />

        <View style={form_s.field}>
          <Text style={form_s.label}>Case Title</Text>
          <TextInput
            style={[form_s.input, !editMode && form_s.readonly]}
            value={form.title}
            onChangeText={v => upd('title', v)}
            editable={editMode}
          />
        </View>

        <View style={form_s.field}>
          <Text style={form_s.label}>Case Type</Text>
          <View style={[form_s.input, form_s.selectRow, !editMode && form_s.readonly]}>
            <Text style={form_s.selectText}>{form.caseType}</Text>
            <FontAwesome5 name="chevron-down" size={10} color={C.g400} />
          </View>
        </View>

        <View style={form_s.field}>
          <Text style={form_s.label}>Case Status</Text>
          <View style={[form_s.input, form_s.selectRow, !editMode && form_s.readonly]}>
            <Text style={form_s.selectText}>{form.phase}</Text>
            <FontAwesome5 name="chevron-down" size={10} color={C.g400} />
          </View>
        </View>

        <View style={form_s.field}>
          <Text style={form_s.label}>Priority Level</Text>
          <View style={form_s.priorityRow}>
            {['urgent','high','medium','normal'].map(p => {
              const pr = PRIORITY[p]; const active = form.priority === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[form_s.priorityBtn, { backgroundColor: active ? pr.bg : C.g50, borderColor: active ? pr.color : C.g200, borderWidth: active ? 2 : 1 }]}
                  onPress={() => editMode && upd('priority', p)}
                >
                  <FontAwesome5 name={pr.icon} size={10} color={active ? pr.color : C.g400} />
                  <Text style={[form_s.priorityText, { color: active ? pr.color : C.g500 }]}>{pr.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={form_s.twoCol}>
          <View style={[form_s.field, { flex:1, marginRight:6 }]}>
            <Text style={form_s.label}>Filing Date</Text>
            <TextInput style={[form_s.input, !editMode && form_s.readonly]} value={form.filingDate} editable={editMode} onChangeText={v => upd('filingDate', v)} />
          </View>
          <View style={[form_s.field, { flex:1, marginLeft:6 }]}>
            <Text style={form_s.label}>Next Hearing</Text>
            <TextInput style={[form_s.input, !editMode && form_s.readonly]} value={form.nextHearing} editable={editMode} onChangeText={v => upd('nextHearing', v)} />
          </View>
        </View>

        <View style={form_s.field}>
          <Text style={form_s.label}>Assigned Attorney</Text>
          <View style={[form_s.input, form_s.selectRow, !editMode && form_s.readonly]}>
            <Text style={form_s.selectText}>{form.attorney}</Text>
            <FontAwesome5 name="chevron-down" size={10} color={C.g400} />
          </View>
        </View>

        <View style={form_s.field}>
          <Text style={form_s.label}>Court Location</Text>
          <TextInput style={[form_s.input, !editMode && form_s.readonly]} value={form.court} editable={editMode} onChangeText={v => upd('court', v)} />
        </View>

        {/* Tags */}
        <View style={form_s.field}>
          <Text style={form_s.label}>Tags</Text>
          <View style={form_s.tagsRow}>
            {form.tags.map(tag => (
              <View key={tag} style={form_s.tagChip}>
                <Text style={form_s.tagText}>{tag}</Text>
                {editMode && (
                  <TouchableOpacity onPress={() => upd('tags', form.tags.filter(t => t !== tag))} style={{ marginLeft:5 }}>
                    <FontAwesome5 name="times" size={9} color={C.primary} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {editMode && (
              <TouchableOpacity style={form_s.tagAdd}>
                <FontAwesome5 name="plus" size={10} color={C.primary} />
                <Text style={form_s.tagText}>Add Tag</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Upcoming Events */}
      <View style={card.wrap}>
        <SectionHeader title="Upcoming Events" action="+ Add Event" />
        {CASE.events.map((ev) => (
          <View key={ev.id} style={[ov.evCard, { borderLeftColor: ev.color }]}>
            <View style={[ov.evIcon, { backgroundColor: ev.bg }]}>
              <FontAwesome5 name={ev.icon} size={16} color={ev.color} />
            </View>
            <View style={{ flex:1, marginLeft:12 }}>
              <Text style={ov.evTitle}>{ev.title}</Text>
              <Text style={ov.evDesc}>{ev.desc}</Text>
              <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginTop:5 }}>
                <Chip label={ev.dateLabel} color={ev.color} bg={ev.bg} />
                <Text style={[ov.evTime, { color: ev.color }]}>{ev.time}</Text>
              </View>
            </View>
            {ev.urgent && (
              <TouchableOpacity style={[ov.dirBtn, { backgroundColor: ev.color }]}>
                <FontAwesome5 name="map-marker-alt" size={12} color={C.white} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Case Metrics */}
      <View style={card.wrap}>
        <SectionHeader title="Case Metrics" />
        <View style={ov.metricsGrid}>
          {[
            { icon:'file-alt',    iconColor:C.primary,   iconBg:C.blue100,   value:'23', label:'Documents'    },
            { icon:'tasks',       iconColor:C.amber600,  iconBg:C.amber100,  value:'5',  label:'Active Tasks' },
            { icon:'calendar',    iconColor:C.green600,  iconBg:C.green100,  value:'8',  label:'Events'       },
            { icon:'sticky-note', iconColor:C.purple600, iconBg:C.purple100, value:'12', label:'Notes'        },
          ].map((m) => (
            <View key={m.label} style={ov.metricCard}>
              <View style={[ov.metricIcon, { backgroundColor: m.iconBg }]}>
                <FontAwesome5 name={m.icon} size={18} color={m.iconColor} />
              </View>
              <Text style={ov.metricValue}>{m.value}</Text>
              <Text style={ov.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Time Tracking */}
        <View style={ov.timeTrack}>
          <View style={ov.timeTrackHeader}>
            <Text style={ov.timeTrackTitle}>Time Tracking</Text>
            <Text style={[ov.timeTrackTitle, { color: C.primary, fontWeight:'700' }]}>View Details</Text>
          </View>
          {[
            { label:'Billable Hours',     value:'47.5 hrs', pct:0.75, color:C.primary },
            { label:'Non-Billable Hours', value:'12.3 hrs', pct:0.25, color:C.g400   },
          ].map((t, i) => (
            <View key={t.label} style={{ marginBottom: i === 0 ? 12 : 0 }}>
              <View style={ov.timeRow}>
                <Text style={ov.timeLabel}>{t.label}</Text>
                <Text style={[ov.timeValue, { color: t.color }]}>{t.value}</Text>
              </View>
              <View style={ov.progressBg}>
                <View style={[ov.progressFill, { width: `${t.pct * 100}%`, backgroundColor: t.color }]} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* AI Assistant */}
      <View style={ov.aiCard}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:14, marginBottom:14 }}>
          <View style={ov.aiIcon}>
            <FontAwesome5 name="robot" size={22} color={C.white} />
          </View>
          <View>
            <Text style={ov.aiTitle}>AI Case Assistant</Text>
            <Text style={ov.aiSub}>Advanced Legal AI · Ready to help</Text>
          </View>
          <View style={ov.aiOnline}>
            <View style={ov.aiDot} /><Text style={ov.aiOnlineText}>Online</Text>
          </View>
        </View>
        {[
          { icon:'file-alt',           label:'Summarize this case'   },
          { icon:'exclamation-triangle', label:'Identify legal risks' },
          { icon:'calendar-check',     label:'Extract all deadlines' },
          { icon:'search',             label:'Research case law'     },
        ].map(a => (
          <TouchableOpacity key={a.label} style={ov.aiBtn}>
            <FontAwesome5 name={a.icon} size={13} color={C.white} />
            <Text style={ov.aiBtnText}>{a.label}</Text>
            <FontAwesome5 name="chevron-right" size={10} color="rgba(255,255,255,0.5)" style={{ marginLeft:'auto' }} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const ov = StyleSheet.create({
  urgentBanner:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:C.red50, borderBottomWidth:1, borderBottomColor:C.red100, paddingHorizontal:16, paddingVertical:10 },
  urgentLeft:     { flexDirection:'row', alignItems:'center', gap:6 },
  pulseDot:       { width:8, height:8, borderRadius:4, backgroundColor:C.red500 },
  urgentLabel:    { fontSize:12, fontWeight:'800', color:C.red600, letterSpacing:1 },
  urgentRight:    { flexDirection:'row', alignItems:'center', gap:6 },
  urgentText:     { fontSize:12, fontWeight:'700', color:C.red600 },
  countdownCard:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:C.white, marginHorizontal:16, marginTop:10, marginBottom:4, borderRadius:14, paddingHorizontal:16, paddingVertical:12, borderWidth:1, borderColor:C.g100, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:6, elevation:2 },
  countdownLabel: { fontSize:12, color:C.g500, fontWeight:'500' },
  countdownValue: { fontSize:22, fontWeight:'800', color:C.red600 },
  descText:       { fontSize:14, color:C.g600, lineHeight:22, marginBottom:14 },
  detailGrid:     { flexDirection:'row', flexWrap:'wrap', borderTopWidth:1, borderTopColor:C.g100, paddingTop:12 },
  detailItem:     { width:'50%', paddingVertical:6, paddingRight:6 },
  detailKey:      { fontSize:11, color:C.g400, marginBottom:2 },
  detailVal:      { fontSize:13, fontWeight:'700', color:C.dark },
  // Events
  evCard:         { flexDirection:'row', alignItems:'center', backgroundColor:C.g50, borderLeftWidth:4, borderRadius:14, padding:12, marginBottom:10 },
  evIcon:         { width:44, height:44, borderRadius:13, alignItems:'center', justifyContent:'center', flexShrink:0 },
  evTitle:        { fontSize:13, fontWeight:'700', color:C.dark },
  evDesc:         { fontSize:12, color:C.g500, marginTop:2 },
  evTime:         { fontSize:12, fontWeight:'700' },
  dirBtn:         { width:36, height:36, borderRadius:10, alignItems:'center', justifyContent:'center' },
  // Metrics
  metricsGrid:    { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:16 },
  metricCard:     { width:(W-32-10*3)/4, backgroundColor:C.g50, borderRadius:14, padding:12, alignItems:'center' },
  metricIcon:     { width:44, height:44, borderRadius:13, alignItems:'center', justifyContent:'center', marginBottom:8 },
  metricValue:    { fontSize:20, fontWeight:'800', color:C.dark },
  metricLabel:    { fontSize:10, color:C.g500, marginTop:2, textAlign:'center' },
  // Time tracking
  timeTrack:      { backgroundColor:C.g50, borderRadius:14, padding:14 },
  timeTrackHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  timeTrackTitle: { fontSize:13, fontWeight:'600', color:C.dark },
  timeRow:        { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
  timeLabel:      { fontSize:12, color:C.g600 },
  timeValue:      { fontSize:13, fontWeight:'700' },
  progressBg:     { height:8, backgroundColor:C.g200, borderRadius:4, overflow:'hidden' },
  progressFill:   { height:8, borderRadius:4 },
  // AI
  aiCard:         { backgroundColor:C.indigo600, marginHorizontal:16, marginBottom:12, borderRadius:20, padding:18 },
  aiIcon:         { width:50, height:50, borderRadius:15, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' },
  aiTitle:        { fontSize:15, fontWeight:'800', color:C.white },
  aiSub:          { fontSize:11, color:'rgba(255,255,255,0.65)', marginTop:2 },
  aiOnline:       { marginLeft:'auto', flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'rgba(255,255,255,0.15)', paddingHorizontal:10, paddingVertical:5, borderRadius:20 },
  aiDot:          { width:6, height:6, borderRadius:3, backgroundColor:'#4ADE80' },
  aiOnlineText:   { fontSize:11, color:C.white, fontWeight:'600' },
  aiBtn:          { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'rgba(255,255,255,0.12)', borderRadius:12, padding:12, marginBottom:8 },
  aiBtnText:      { fontSize:13, fontWeight:'600', color:C.white },
});

// ═════════════════════════════════════════════════════════════════════════════
//  TAB: DOCUMENTS
// ═════════════════════════════════════════════════════════════════════════════
const DocumentsTab = () => (
  <View style={card.wrap}>
    <SectionHeader title={`Documents (${CASE.stats.docs})`} action="Upload" />
    {CASE.documents.map(doc => (
      <View key={doc.id} style={[doc_s.card, doc.priority && doc_s.cardPriority]}>
        <View style={[doc_s.icon, { backgroundColor: doc.iconBg }]}>
          <FontAwesome5 name={doc.icon} size={20} color={doc.iconColor} />
        </View>
        <View style={{ flex:1, marginLeft:12 }}>
          <Text style={doc_s.name} numberOfLines={1}>{doc.name}</Text>
          <Text style={doc_s.meta}>{doc.size} · Uploaded {doc.date}</Text>
          <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
            <TouchableOpacity style={[doc_s.btn, { backgroundColor: doc.iconBg }]}>
              <FontAwesome5 name="eye" size={11} color={C.white} /><Text style={doc_s.btnText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[doc_s.btnOutline, { borderColor: doc.iconBg }]}>
              <FontAwesome5 name="download" size={11} color={doc.iconBg} /><Text style={[doc_s.btnText, { color: doc.iconBg }]}>Download</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={{ padding:6 }}>
          <FontAwesome5 name="ellipsis-v" size={14} color={C.g400} />
        </TouchableOpacity>
      </View>
    ))}
    <TouchableOpacity style={doc_s.viewAll}>
      <FontAwesome5 name="folder-open" size={14} color={C.primary} />
      <Text style={doc_s.viewAllText}>View All Documents ({CASE.stats.docs})</Text>
    </TouchableOpacity>
  </View>
);

const doc_s = StyleSheet.create({
  card:         { flexDirection:'row', padding:14, backgroundColor:C.g50, borderRadius:16, marginBottom:10 },
  cardPriority: { backgroundColor:'#FFF7F7', borderLeftWidth:4, borderLeftColor:C.red600 },
  icon:         { width:50, height:50, borderRadius:14, alignItems:'center', justifyContent:'center', flexShrink:0 },
  name:         { fontSize:13, fontWeight:'700', color:C.dark, marginBottom:3 },
  meta:         { fontSize:11, color:C.g400 },
  btn:          { flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:12, paddingVertical:6, borderRadius:8 },
  btnOutline:   { flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:12, paddingVertical:6, borderRadius:8, borderWidth:1, backgroundColor:C.white },
  btnText:      { fontSize:11, fontWeight:'700', color:C.white },
  viewAll:      { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor:C.blue50, paddingVertical:13, borderRadius:14, marginTop:4 },
  viewAllText:  { fontSize:13, fontWeight:'700', color:C.primary },
});

// ═════════════════════════════════════════════════════════════════════════════
//  TAB: TASKS
// ═════════════════════════════════════════════════════════════════════════════
const TasksTab = () => {
  const [tasks, setTasks] = useState(CASE.tasks);
  const toggle = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const pr = PRIORITY;

  return (
    <View style={card.wrap}>
      <SectionHeader title={`Tasks (${CASE.stats.tasks})`} action="+ Add Task" />
      {tasks.map(task => {
        const p = pr[task.priority];
        return (
          <View key={task.id} style={[task_s.card, task.priority === 'urgent' && !task.done && task_s.cardUrgent, task.done && { opacity:0.5 }]}>
            <TouchableOpacity onPress={() => toggle(task.id)} style={[task_s.checkbox, task.done && { backgroundColor:C.green600, borderColor:C.green600 }]}>
              {task.done && <FontAwesome5 name="check" size={11} color={C.white} />}
            </TouchableOpacity>
            <View style={{ flex:1, marginLeft:12 }}>
              <Text style={[task_s.title, task.done && task_s.titleDone]}>{task.title}</Text>
              <Text style={[task_s.due, { color: task.done ? C.green600 : task.dueColor }]}>{task.due}</Text>
              <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginTop:5 }}>
                <Chip label={p.label} color={p.color} bg={p.bg} />
                <Text style={task_s.assignee}>{task.assignee}</Text>
              </View>
            </View>
            <TouchableOpacity style={{ padding:6 }}>
              <FontAwesome5 name="ellipsis-v" size={14} color={C.g400} />
            </TouchableOpacity>
          </View>
        );
      })}
      <TouchableOpacity style={doc_s.viewAll}>
        <FontAwesome5 name="tasks" size={14} color={C.primary} />
        <Text style={doc_s.viewAllText}>View All Tasks ({CASE.stats.tasks})</Text>
      </TouchableOpacity>
    </View>
  );
};

const task_s = StyleSheet.create({
  card:        { flexDirection:'row', alignItems:'flex-start', padding:14, backgroundColor:C.g50, borderRadius:16, marginBottom:10 },
  cardUrgent:  { backgroundColor:'#FFF7F7', borderLeftWidth:4, borderLeftColor:C.red600 },
  checkbox:    { width:24, height:24, borderRadius:7, borderWidth:2, borderColor:C.g300, alignItems:'center', justifyContent:'center', marginTop:2, flexShrink:0 },
  title:       { fontSize:14, fontWeight:'700', color:C.dark, marginBottom:3 },
  titleDone:   { textDecorationLine:'line-through', color:C.g400 },
  due:         { fontSize:12, fontWeight:'600' },
  assignee:    { fontSize:11, color:C.g500, fontWeight:'500' },
});

// ═════════════════════════════════════════════════════════════════════════════
//  TAB: NOTES
// ═════════════════════════════════════════════════════════════════════════════
const NotesTab = () => (
  <View style={card.wrap}>
    <SectionHeader title={`Notes (${CASE.stats.notes})`} action="+ Add Note" />
    {CASE.notes.map(note => (
      <View key={note.id} style={[note_s.card, { backgroundColor: note.bg, borderLeftColor: note.borderColor }]}>
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
            <Image source={{ uri: note.avatar }} style={note_s.avatar} />
            <View>
              <Text style={note_s.noteName}>{note.author}</Text>
              <Text style={note_s.noteTime}>{note.time}</Text>
            </View>
          </View>
          <TouchableOpacity><FontAwesome5 name="ellipsis-v" size={14} color={C.g400} /></TouchableOpacity>
        </View>
        <Text style={note_s.noteTitle}>{note.title}</Text>
        <Text style={note_s.noteContent} numberOfLines={3}>{note.content}</Text>
        <TouchableOpacity style={note_s.readMore}>
          <Text style={[note_s.readMoreText, { color: note.borderColor }]}>Read more</Text>
          <FontAwesome5 name="chevron-right" size={10} color={note.borderColor} />
        </TouchableOpacity>
      </View>
    ))}
  </View>
);

const note_s = StyleSheet.create({
  card:          { borderLeftWidth:4, borderRadius:16, padding:14, marginBottom:12 },
  avatar:        { width:36, height:36, borderRadius:10 },
  noteName:      { fontSize:13, fontWeight:'700', color:C.dark },
  noteTime:      { fontSize:11, color:C.g400 },
  noteTitle:     { fontSize:14, fontWeight:'800', color:C.dark, marginBottom:6 },
  noteContent:   { fontSize:13, color:C.g600, lineHeight:20 },
  readMore:      { flexDirection:'row', alignItems:'center', gap:4, marginTop:8 },
  readMoreText:  { fontSize:12, fontWeight:'700' },
});

// ═════════════════════════════════════════════════════════════════════════════
//  TAB: TIMELINE
// ═════════════════════════════════════════════════════════════════════════════
const TimelineTab = () => (
  <View style={card.wrap}>
    <SectionHeader title="Case Timeline & Activity" action="+ Add Event" />
    {CASE.timeline.map((item, idx) => (
      <View key={item.id} style={tl.row}>
        <View style={tl.left}>
          <View style={[tl.dot, { backgroundColor: item.bg }]}>
            <FontAwesome5 name={item.icon} size={13} color={item.color} />
          </View>
          {idx < CASE.timeline.length - 1 && <View style={tl.line} />}
        </View>
        <View style={tl.content}>
          <View style={tl.contentHeader}>
            <Text style={tl.title}>{item.title}</Text>
            <Text style={tl.time}>{item.time}</Text>
          </View>
          <Text style={tl.desc}>{item.desc}</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginTop:6 }}>
            <Chip label={item.badge} color={item.badgeColor} bg={item.badgeBg} />
            <TouchableOpacity><Text style={tl.link}>View Details</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    ))}
  </View>
);

const tl = StyleSheet.create({
  row:           { flexDirection:'row', marginBottom:0 },
  left:          { alignItems:'center', marginRight:14, width:40 },
  dot:           { width:40, height:40, borderRadius:12, alignItems:'center', justifyContent:'center', flexShrink:0, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:4, elevation:2 },
  line:          { width:2, flex:1, backgroundColor:C.g200, marginVertical:4 },
  content:       { flex:1, paddingBottom:20 },
  contentHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 },
  title:         { fontSize:13, fontWeight:'700', color:C.dark, flex:1, marginRight:8 },
  time:          { fontSize:11, color:C.g400, flexShrink:0 },
  desc:          { fontSize:12, color:C.g500, lineHeight:18 },
  link:          { fontSize:12, fontWeight:'700', color:C.primary },
});

// ─── SHARED CARD STYLE ────────────────────────────────────────────────────────
const card = StyleSheet.create({
  wrap: { backgroundColor:C.white, marginHorizontal:16, marginBottom:12, borderRadius:20, padding:16, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:8, elevation:2, borderWidth:1, borderColor:C.g100 },
});

// ─── FORM STYLES ──────────────────────────────────────────────────────────────
const form_s = StyleSheet.create({
  field:       { marginBottom:14 },
  label:       { fontSize:12, fontWeight:'700', color:C.g600, marginBottom:6 },
  input:       { borderWidth:1.5, borderColor:C.g200, borderRadius:12, paddingHorizontal:14, paddingVertical:11, fontSize:14, color:C.dark, backgroundColor:C.white },
  readonly:    { backgroundColor:C.g50, borderColor:C.g100 },
  selectRow:   { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  selectText:  { fontSize:14, color:C.dark },
  priorityRow: { flexDirection:'row', gap:6 },
  priorityBtn: { flex:1, paddingVertical:10, borderRadius:12, alignItems:'center', gap:4, flexDirection:'row', justifyContent:'center' },
  priorityText:{ fontSize:11, fontWeight:'700' },
  twoCol:      { flexDirection:'row' },
  tagsRow:     { flexDirection:'row', flexWrap:'wrap', gap:8 },
  tagChip:     { flexDirection:'row', alignItems:'center', backgroundColor:C.blue50, paddingHorizontal:12, paddingVertical:6, borderRadius:20 },
  tagAdd:      { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:C.g100, paddingHorizontal:12, paddingVertical:6, borderRadius:20 },
  tagText:     { fontSize:12, fontWeight:'600', color:C.primary },
});

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN SCREEN
// ═════════════════════════════════════════════════════════════════════════════
export default function CaseDetailsScreen({ navigation, route }) {
  const caseData = route?.params?.caseData || CASE;
  const pr = PRIORITY[caseData.priority] || PRIORITY.urgent;

  const [activeTab, setActiveTab] = useState('overview');
  const [editMode,  setEditMode]  = useState(false);
  const [form, setForm] = useState({
    title:      caseData.title,
    caseType:   caseData.type,
    phase:      caseData.phase,
    priority:   caseData.priority,
    court:      caseData.court,
    judge:      caseData.judge,
    attorney:   caseData.attorney,
    description:caseData.description,
    filingDate: caseData.filingDate,
    nextHearing:'2024-03-16',
    tags:       [...caseData.tags],
  });

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':  return <OverviewTab  caseData={caseData} editMode={editMode} form={form} setForm={setForm} />;
      case 'documents': return <DocumentsTab />;
      case 'tasks':     return <TasksTab />;
      case 'notes':     return <NotesTab />;
      case 'timeline':  return <TimelineTab />;
    }
  };

  return (
    <SafeAreaView style={sc.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ─── HEADER ─────────────────────────────────────────────── */}
      <View style={sc.header}>
        {/* Row 1 */}
        <View style={sc.headerRow}>
          <TouchableOpacity style={sc.headerBtn} onPress={() => navigation?.goBack?.()}>
            <FontAwesome5 name="arrow-left" size={16} color={C.white} />
          </TouchableOpacity>
          <View style={{ flex:1, alignItems:'center' }}>
            <Text style={sc.headerTitle}>Case Details</Text>
            <Text style={sc.headerSub}>{caseData.id}</Text>
          </View>
          <View style={{ flexDirection:'row', gap:8 }}>
            <TouchableOpacity style={sc.headerBtn}>
              <FontAwesome5 name="share-nodes" size={14} color={C.white} />
            </TouchableOpacity>
            <TouchableOpacity style={[sc.headerBtn, { position:'relative' }]}>
              <FontAwesome5 name="bell" size={14} color={C.white} />
              <View style={sc.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Case identity card inside header */}
        <View style={sc.caseCard}>
          <View style={{ flexDirection:'row', alignItems:'flex-start', gap:14 }}>
            <View style={[sc.caseIcon, { backgroundColor: pr.color }]}>
              <FontAwesome5 name="gavel" size={22} color={C.white} />
            </View>
            <View style={{ flex:1 }}>
              <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:6 }}>
                <View style={[sc.priorityBadge, { backgroundColor: pr.color }]}>
                  <FontAwesome5 name={pr.icon} size={9} color={C.white} />
                  <Text style={sc.priorityText}>{pr.label}</Text>
                </View>
                <View style={sc.typeBadge}>
                  <Text style={sc.typeText}>{caseData.type}</Text>
                </View>
                <View style={sc.typeBadge}>
                  <Text style={sc.typeText}>{caseData.phase}</Text>
                </View>
              </View>
              <Text style={sc.caseTitle}>{caseData.title}</Text>
              <Text style={sc.caseSub}>{caseData.subtitle}</Text>
            </View>
          </View>

          {/* Hearing alert row */}
          {caseData.nextHearing && (
            <View style={sc.hearingRow}>
              <FontAwesome5 name="calendar-exclamation" size={12} color="#FCA5A5" />
              <Text style={sc.hearingText}>
                Hearing {caseData.nextHearing.label} · {caseData.nextHearing.time} · {caseData.nextHearing.room}
              </Text>
              <View style={sc.countdown}>
                <Text style={sc.countdownText}>{caseData.nextHearing.countdown}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* ─── STATS ROW ──────────────────────────────────────────── */}
      <View style={sc.statsRow}>
        {[
          { icon:'file-alt',    iconColor:C.primary,   bg:C.blue50,   value:caseData.stats.docs,   label:'Docs'   },
          { icon:'tasks',       iconColor:C.amber600,  bg:C.amber50,  value:caseData.stats.tasks,  label:'Tasks'  },
          { icon:'calendar',    iconColor:C.green600,  bg:C.green50,  value:caseData.stats.events, label:'Events' },
          { icon:'sticky-note', iconColor:C.purple600, bg:C.purple50, value:caseData.stats.notes,  label:'Notes'  },
        ].map((s, i) => (
          <View key={i} style={[sc.statItem, { backgroundColor: s.bg }]}>
            <FontAwesome5 name={s.icon} size={14} color={s.iconColor} style={{ marginBottom:4 }} />
            <Text style={[sc.statValue, { color: s.iconColor }]}>{s.value}</Text>
            <Text style={sc.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ─── CLIENT CARD ────────────────────────────────────────── */}
      <View style={sc.clientCard}>
        <Image source={{ uri: caseData.client.avatar }} style={sc.clientAvatar} />
        <View style={{ flex:1, marginLeft:12 }}>
          <Text style={sc.clientName}>{caseData.client.name}</Text>
          <Text style={sc.clientMeta}>ID: {caseData.client.id} · Since {caseData.client.since}</Text>
          <View style={{ flexDirection:'row', gap:6, marginTop:5 }}>
            <Chip label={caseData.client.status} color={C.primary}   bg={C.blue50}  />
            <Chip label={caseData.client.tier}   color={C.green600}  bg={C.green50} />
          </View>
        </View>
        <View style={{ gap:8 }}>
          <TouchableOpacity style={[sc.contactBtn, { backgroundColor:C.green50 }]}>
            <FontAwesome5 name="whatsapp" size={15} color={C.green600} />
          </TouchableOpacity>
          <TouchableOpacity style={[sc.contactBtn, { backgroundColor:C.blue50 }]}>
            <FontAwesome5 name="phone" size={14} color={C.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[sc.contactBtn, { backgroundColor:C.purple50 }]}>
            <FontAwesome5 name="envelope" size={13} color={C.purple600} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── QUICK ACTIONS ──────────────────────────────────────── */}
      <View style={sc.quickActions}>
        {[
          { icon:'edit',      label:'Edit',    color:C.primary,   bg:C.blue50,    active: editMode, onPress:() => setEditMode(e => !e) },
          { icon:'file-alt',  label:'Docs',    color:C.purple600, bg:C.purple50,  active:false, onPress:() => setActiveTab('documents') },
          { icon:'tasks',     label:'Tasks',   color:C.amber600,  bg:C.amber50,   active:false, onPress:() => setActiveTab('tasks') },
          { icon:'robot',     label:'AI',      color:C.indigo600, bg:'#EEF2FF',   active:false, onPress:() => {} },
          { icon:'print',     label:'Print',   color:C.teal600,   bg:'#F0FDFA',   active:false, onPress:() => {} },
          { icon:'archive',   label:'Archive', color:C.g500,      bg:C.g100,      active:false, onPress:() => {} },
        ].map((q, i) => (
          <TouchableOpacity
            key={i}
            style={[sc.qaBtn, { backgroundColor: q.active ? C.primary : q.bg }]}
            onPress={q.onPress}
          >
            <View style={[sc.qaIconWrap, { backgroundColor: q.active ? 'rgba(255,255,255,0.25)' : q.bg }]}>
              <FontAwesome5 name={q.icon} size={15} color={q.active ? C.white : q.color} />
            </View>
            <Text style={[sc.qaLabel, { color: q.active ? C.white : q.color }]}>{q.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── TABS BAR ───────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={sc.tabsBar}
        contentContainerStyle={{ paddingHorizontal:16, gap:8, paddingVertical:10 }}
      >
        {TABS.map(t => {
          const active = activeTab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[sc.tabBtn, active && sc.tabBtnActive]}
              onPress={() => setActiveTab(t.key)}
            >
              <FontAwesome5 name={t.icon} size={12} color={active ? C.white : C.g500} />
              <Text style={[sc.tabLabel, active && sc.tabLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ─── SCROLLABLE CONTENT ─────────────────────────────────── */}
      <ScrollView
        style={sc.scroll}
        contentContainerStyle={{ paddingTop:12, paddingBottom:40 }}
        showsVerticalScrollIndicator={false}
      >
        {renderTab()}
      </ScrollView>

      {/* ─── FOOTER EDIT MODE ───────────────────────────────────── */}
      {editMode && (
        <View style={sc.footer}>
          <TouchableOpacity style={sc.footerCancel} onPress={() => setEditMode(false)}>
            <Text style={sc.footerCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={sc.footerSave} onPress={() => setEditMode(false)}>
            <FontAwesome5 name="save" size={14} color={C.white} />
            <Text style={sc.footerSaveText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── SCREEN STYLES ────────────────────────────────────────────────────────────
const sc = StyleSheet.create({
  safe:   { flex:1, backgroundColor:C.primary },
  scroll: { flex:1, backgroundColor:C.g50 },

  // Header
  header:        { backgroundColor:C.primary, paddingHorizontal:16, paddingTop:10, paddingBottom:16 },
  headerRow:     { flexDirection:'row', alignItems:'center', marginBottom:14 },
  headerBtn:     { width:40, height:40, borderRadius:12, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' },
  headerTitle:   { fontSize:17, fontWeight:'800', color:C.white },
  headerSub:     { fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:1 },
  notifDot:      { position:'absolute', top:7, right:7, width:8, height:8, borderRadius:4, backgroundColor:C.red500, borderWidth:1.5, borderColor:C.primary },

  // Case card in header
  caseCard:      { backgroundColor:'rgba(255,255,255,0.12)', borderRadius:18, padding:16, borderWidth:1, borderColor:'rgba(255,255,255,0.2)' },
  caseIcon:      { width:54, height:54, borderRadius:16, alignItems:'center', justifyContent:'center', flexShrink:0, shadowColor:'#000', shadowOpacity:0.2, shadowRadius:6, elevation:4 },
  priorityBadge: { flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:9, paddingVertical:4, borderRadius:20 },
  priorityText:  { fontSize:10, fontWeight:'800', color:C.white },
  typeBadge:     { backgroundColor:'rgba(255,255,255,0.2)', paddingHorizontal:9, paddingVertical:4, borderRadius:20 },
  typeText:      { fontSize:10, fontWeight:'600', color:C.white },
  caseTitle:     { fontSize:19, fontWeight:'800', color:C.white, marginBottom:3 },
  caseSub:       { fontSize:12, color:'rgba(255,255,255,0.72)' },
  hearingRow:    { flexDirection:'row', alignItems:'center', gap:8, marginTop:12, backgroundColor:'rgba(220,38,38,0.3)', borderRadius:12, paddingHorizontal:12, paddingVertical:9 },
  hearingText:   { flex:1, fontSize:12, color:'#FCA5A5', fontWeight:'600' },
  countdown:     { backgroundColor:C.red600, paddingHorizontal:10, paddingVertical:4, borderRadius:20 },
  countdownText: { fontSize:11, fontWeight:'800', color:C.white },

  // Stats
  statsRow:  { flexDirection:'row', backgroundColor:C.white, paddingHorizontal:16, paddingVertical:12, gap:10, borderBottomWidth:1, borderBottomColor:C.g100 },
  statItem:  { flex:1, borderRadius:14, paddingVertical:10, alignItems:'center' },
  statValue: { fontSize:18, fontWeight:'800' },
  statLabel: { fontSize:10, fontWeight:'600', color:C.g500, marginTop:1 },

  // Client
  clientCard:   { flexDirection:'row', alignItems:'flex-start', backgroundColor:C.white, paddingHorizontal:16, paddingVertical:14, borderBottomWidth:1, borderBottomColor:C.g100 },
  clientAvatar: { width:56, height:56, borderRadius:16, borderWidth:2.5, borderColor:C.primary },
  clientName:   { fontSize:15, fontWeight:'800', color:C.dark },
  clientMeta:   { fontSize:11, color:C.g400, marginTop:1 },
  contactBtn:   { width:34, height:34, borderRadius:10, alignItems:'center', justifyContent:'center' },

  // Quick actions
  quickActions: { flexDirection:'row', backgroundColor:C.white, paddingHorizontal:12, paddingVertical:10, gap:4, borderBottomWidth:1, borderBottomColor:C.g100 },
  qaBtn:        { flex:1, borderRadius:12, paddingVertical:8, alignItems:'center', gap:3 },
  qaIconWrap:   { width:36, height:36, borderRadius:10, alignItems:'center', justifyContent:'center' },
  qaLabel:      { fontSize:9, fontWeight:'700' },

  // Tabs
  tabsBar:       { backgroundColor:C.white, borderBottomWidth:1, borderBottomColor:C.g100, maxHeight:52, flexGrow:0 },
  tabBtn:        { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:14, paddingVertical:8, borderRadius:20, backgroundColor:C.g100 },
  tabBtnActive:  { backgroundColor:C.primary, shadowColor:C.primary, shadowOpacity:0.35, shadowRadius:6, elevation:4 },
  tabLabel:      { fontSize:12, fontWeight:'700', color:C.g500 },
  tabLabelActive:{ color:C.white },

  // Footer
  footer:           { flexDirection:'row', gap:12, paddingHorizontal:16, paddingVertical:14, backgroundColor:C.white, borderTopWidth:1, borderTopColor:C.g100 },
  footerCancel:     { paddingHorizontal:20, paddingVertical:14, borderRadius:14, borderWidth:1.5, borderColor:C.g200, alignItems:'center', justifyContent:'center' },
  footerCancelText: { fontSize:14, fontWeight:'700', color:C.g600 },
  footerSave:       { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor:C.primary, paddingVertical:14, borderRadius:14, shadowColor:C.primary, shadowOpacity:0.35, shadowRadius:8, elevation:4 },
  footerSaveText:   { fontSize:15, fontWeight:'800', color:C.white },
});
