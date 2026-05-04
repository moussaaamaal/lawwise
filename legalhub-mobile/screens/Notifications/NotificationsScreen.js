import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { notificationsAPI } from '../../services/api';

const C = {
  primary: '#1E40AF', secondary: '#3B82F6', dark: '#1E293B', white: '#FFFFFF',
  g50: '#F9FAFB', g100: '#F3F4F6', g200: '#E5E7EB', g400: '#9CA3AF', g500: '#6B7280', g600: '#4B5563',
  red50: '#FEF2F2', red100: '#FEE2E2', red600: '#DC2626',
  amber50: '#FFFBEB', amber100: '#FEF3C7', amber600: '#D97706',
  green50: '#F0FDF4', green100: '#DCFCE7', green600: '#16A34A',
  blue50: '#EFF6FF', blue100: '#DBEAFE', blue600: '#2563EB',
  purple50: '#FAF5FF', purple100: '#F3E8FF', purple600: '#9333EA',
  indigo50: '#EEF2FF', indigo100: '#E0E7FF', indigo600: '#4F46E5',
  teal50: '#F0FDFA', teal100: '#CCFBF1', teal600: '#0D9488',
};

const FILTER_TABS = ['All Updates', 'Cases', 'Documents', 'Payments', 'Deadlines'];

// ─── DONNÉES NOTIFICATIONS ────────────────────────────────────────────────────
const TODAY_NOTIFS = [
  {
    iconName: 'gavel', iconColor: C.red600, iconBg: C.red100, borderColor: C.red600,
    badge: 'CASE UPDATE', badgeColor: C.red600, badgeBg: C.red50,
    time: '2 min ago', title: 'Hearing Rescheduled',
    desc: 'State vs. Johnson - Criminal Court hearing moved to March 18, 10:00 AM',
    caseId: 'CR-2024-1247', avatar: null, avatarName: null,
    actionLabel: 'View Case', actionColor: C.primary, actionStyle: 'link',
  },
  {
    iconName: 'dollar-sign', iconColor: C.green600, iconBg: C.green100, borderColor: C.green600,
    badge: 'PAYMENT RECEIVED', badgeColor: C.green600, badgeBg: C.green50,
    time: '15 min ago', title: 'Payment Confirmed',
    desc: 'Robert Chen paid $5,000.00 for Invoice #2024-089 via Bank Transfer',
    caseId: null, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg', avatarName: 'Robert Chen',
    actionLabel: 'View Receipt', actionColor: C.green600, actionStyle: 'link',
  },
  {
    iconName: 'file-pdf', iconColor: C.primary, iconBg: C.blue100, borderColor: C.secondary,
    badge: 'DOCUMENT ADDED', badgeColor: C.blue600, badgeBg: C.blue50,
    time: '45 min ago', title: 'New Document Uploaded',
    desc: 'Signed Contract Amendment - Mitchell Corp.pdf (2.4 MB)',
    caseId: 'CV-2024-0892', avatar: null, avatarName: null,
    actionLabel: 'View', actionColor: C.primary, actionStyle: 'link',
    extraAction: { label: 'Analyze', icon: 'robot', color: C.primary, bg: C.blue50 },
  },
  {
    iconName: 'exclamation-triangle', iconColor: C.amber600, iconBg: C.amber100, borderColor: C.amber600,
    badge: 'DEADLINE ALERT', badgeColor: C.amber600, badgeBg: C.amber50,
    time: '1 hour ago', title: 'Upcoming Deadline',
    desc: 'Motion filing deadline for State vs. Johnson is in 4 hours (5:00 PM today)',
    caseId: 'CR-2024-1247', avatar: null, avatarName: null,
    actionLabel: 'Set Reminder', actionColor: C.white, actionStyle: 'filled', actionBg: C.amber600,
    actionIcon: 'bell',
  },
  {
    iconName: 'calendar-check', iconColor: C.purple600, iconBg: C.purple100, borderColor: C.purple600,
    badge: 'CASE STATUS', badgeColor: C.purple600, badgeBg: C.purple50,
    time: '2 hours ago', title: 'Case Status Changed',
    desc: 'Chen Estate Planning moved from "Discovery" to "Negotiation" phase',
    caseId: 'FM-2024-0453', avatar: null, avatarName: null,
    actionLabel: 'View Timeline', actionColor: C.purple600, actionStyle: 'link',
  },
  {
    iconName: 'robot', iconColor: C.indigo600, iconBg: C.indigo100, borderColor: C.indigo600,
    badge: 'AI ANALYSIS', badgeColor: C.indigo600, badgeBg: C.indigo50,
    time: '3 hours ago', title: 'Document Analysis Complete',
    desc: 'AI found 3 key clauses and 2 potential issues in Contract Amendment',
    caseId: null, avatar: null, avatarName: null, extraBadge: '3 Findings',
    extraBadgeColor: C.indigo600, extraBadgeBg: C.indigo50,
    actionLabel: 'View Report', actionColor: C.indigo600, actionStyle: 'link',
  },
];

const YESTERDAY_NOTIFS = [
  {
    iconName: 'user-plus', iconColor: C.teal600, iconBg: C.teal100, borderColor: C.teal600,
    badge: 'NEW CLIENT', badgeColor: C.teal600, badgeBg: C.teal50,
    time: 'Yesterday, 4:30 PM', title: 'Client Added to System',
    desc: 'Jennifer Williams - Personal Injury Case (Car Accident)',
    caseId: null, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg', avatarName: 'Jennifer Williams',
    actionLabel: 'View Profile', actionColor: C.teal600, actionStyle: 'link',
  },
  {
    iconName: 'file-signature', iconColor: C.primary, iconBg: C.blue100, borderColor: C.secondary,
    badge: 'DOCUMENT SIGNED', badgeColor: C.blue600, badgeBg: C.blue50,
    time: 'Yesterday, 2:15 PM', title: 'Client Signature Received',
    desc: 'Retainer Agreement signed by Marcus Johnson via DocuSign',
    caseId: 'CR-2024-1247', avatar: null, avatarName: null,
    actionLabel: 'Download', actionColor: C.primary, actionStyle: 'link',
  },
  {
    iconName: 'clock', iconColor: C.amber600, iconBg: C.amber100, borderColor: C.amber600,
    badge: 'PAYMENT DUE', badgeColor: C.amber600, badgeBg: C.amber50,
    time: 'Yesterday, 12:00 PM', title: 'Payment Reminder Sent',
    desc: 'Invoice #2024-091 reminder sent to Sarah Mitchell ($3,500 overdue)',
    caseId: null, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', avatarName: 'Sarah Mitchell',
    actionLabel: 'Follow Up', actionColor: C.green600, actionStyle: 'filled', actionBg: C.green50,
    actionIcon: 'whatsapp', actionLib: 'FA',
  },
  {
    iconName: 'check-circle', iconColor: C.green600, iconBg: C.green100, borderColor: C.green600,
    badge: 'TASK COMPLETED', badgeColor: C.green600, badgeBg: C.green50,
    time: 'Yesterday, 10:30 AM', title: 'Discovery Documents Submitted',
    desc: 'All discovery documents filed for Chen Estate Planning case',
    caseId: 'FM-2024-0453', avatar: null, avatarName: null,
    actionLabel: 'View Details', actionColor: C.green600, actionStyle: 'link',
  },
  {
    iconName: 'file-alt', iconColor: C.red600, iconBg: C.red100, borderColor: C.red600,
    badge: 'CASE UPDATE', badgeColor: C.red600, badgeBg: C.red50,
    time: 'Yesterday, 9:00 AM', title: 'Motion Denied',
    desc: 'Judge denied Motion to Suppress Evidence in State vs. Johnson',
    caseId: 'CR-2024-1247', avatar: null, avatarName: null,
    actionLabel: 'Read Order', actionColor: C.red600, actionStyle: 'link',
  },
];

const WEEK_NOTIFS = [
  {
    iconName: 'file-invoice', iconColor: C.primary, iconBg: C.blue100, borderColor: C.secondary,
    badge: 'INVOICE SENT', badgeColor: C.blue600, badgeBg: C.blue50,
    time: 'Mar 13, 3:45 PM', title: 'Invoice Generated',
    desc: 'Invoice #2024-092 sent to Mitchell Corp. for $8,500.00',
    caseId: 'CV-2024-0892', avatar: null, avatarName: null,
    actionLabel: 'View Invoice', actionColor: C.primary, actionStyle: 'link',
  },
  {
    iconName: 'comment-dots', iconColor: C.purple600, iconBg: C.purple100, borderColor: C.purple600,
    badge: 'CLIENT MESSAGE', badgeColor: C.purple600, badgeBg: C.purple50,
    time: 'Mar 13, 11:20 AM', title: 'New Message Received',
    desc: '"Thank you for the update on my case. When is our next meeting?"',
    caseId: null, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg', avatarName: 'Robert Chen',
    actionLabel: 'Reply', actionColor: C.purple600, actionStyle: 'link',
  },
  {
    iconName: 'briefcase', iconColor: C.indigo600, iconBg: C.indigo100, borderColor: C.indigo600,
    badge: 'NEW CASE', badgeColor: C.indigo600, badgeBg: C.indigo50,
    time: 'Mar 12, 2:00 PM', title: 'Case Opened',
    desc: 'Thompson vs. City Transit Authority - Personal Injury',
    caseId: 'PI-2024-0234', avatar: null, avatarName: null,
    actionLabel: 'View Case', actionColor: C.indigo600, actionStyle: 'link',
  },
  {
    iconName: 'dollar-sign', iconColor: C.green600, iconBg: C.green100, borderColor: C.green600,
    badge: 'PAYMENT RECEIVED', badgeColor: C.green600, badgeBg: C.green50,
    time: 'Mar 12, 10:30 AM', title: 'Partial Payment Received',
    desc: 'Sarah Mitchell paid $1,750 towards Invoice #2024-091',
    caseId: null, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', avatarName: 'Balance: $1,750',
    actionLabel: 'View', actionColor: C.green600, actionStyle: 'link',
  },
  {
    iconName: 'file-import', iconColor: C.amber600, iconBg: C.amber100, borderColor: C.amber600,
    badge: 'DOCUMENT RECEIVED', badgeColor: C.amber600, badgeBg: C.amber50,
    time: 'Mar 11, 4:15 PM', title: 'Evidence Submitted',
    desc: 'Prosecution submitted 15 new evidence files in State vs. Johnson',
    caseId: null, extraBadge: '15 Files', extraBadgeColor: C.g600, extraBadgeBg: C.g100,
    actionLabel: 'Review', actionColor: C.amber600, actionStyle: 'filled', actionBg: C.amber50,
    actionIcon: 'robot',
  },
  {
    iconName: 'calendar-times', iconColor: C.red600, iconBg: C.red100, borderColor: C.red600,
    badge: 'MEETING CANCELLED', badgeColor: C.red600, badgeBg: C.red50,
    time: 'Mar 11, 9:00 AM', title: 'Client Rescheduled',
    desc: 'Sarah Mitchell cancelled meeting scheduled for March 16',
    caseId: null, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', avatarName: 'Sarah Mitchell',
    actionLabel: 'Reschedule', actionColor: C.red600, actionStyle: 'link',
  },
];

const PAYMENT_SUMMARY = [
  { statusIcon: 'check', statusBg: C.green100, statusColor: C.green600, invoice: 'Invoice #2024-089', client: 'Robert Chen - Paid', amount: '$5,000', amountColor: C.green600 },
  { statusIcon: 'clock', statusBg: C.amber100, statusColor: C.amber600, invoice: 'Invoice #2024-092', client: 'Mitchell Corp. - Pending', amount: '$8,500', amountColor: C.amber600 },
  { statusIcon: 'exclamation', statusBg: C.red100, statusColor: C.red600, invoice: 'Invoice #2024-091', client: 'Sarah Mitchell - Overdue', amount: '$1,750', amountColor: C.red600 },
];

const DOC_ACTIVITY = [
  { iconName: 'file-pdf', iconColor: C.red600, iconBg: C.red100, title: 'Motion to Dismiss - Final.pdf', sub: 'State vs. Johnson - Uploaded by you', size: '2.4 MB', time: 'Today, 2:30 PM', badge: 'New', badgeColor: C.primary, badgeBg: C.blue50, actionLabel: 'View', actionIcon: 'eye', actionColor: C.primary, actionBg: C.blue50 },
  { iconName: 'file-word', iconColor: C.primary, iconBg: C.blue100, title: 'Contract Amendment - Signed.docx', sub: 'Mitchell Corp. - Received from client', size: '1.8 MB', time: 'Today, 11:15 AM', badge: 'Signed', badgeColor: C.green600, badgeBg: C.green50, actionLabel: 'Analyze', actionIcon: 'robot', actionColor: C.indigo600, actionBg: C.indigo50 },
  { iconName: 'file-excel', iconColor: C.green600, iconBg: C.green100, title: 'Asset Inventory - Updated.xlsx', sub: 'Chen Estate - Last modified by you', size: '956 KB', time: 'Yesterday, 3:00 PM', badge: 'Modified', badgeColor: C.amber600, badgeBg: C.amber50, actionLabel: 'Open', actionIcon: 'external-link-alt', actionColor: C.g600, actionBg: C.g100 },
];

// ─── COMPOSANT NOTIFICATION CARD ─────────────────────────────────────────────
const NotifCard = ({ n }) => (
  <View style={[s.notifCard, { borderLeftColor: n.borderColor }]}>
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={[s.notifIcon, { backgroundColor: n.iconBg }]}>
        <FontAwesome5 name={n.iconName} size={18} color={n.iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        {/* Badge + time */}
        <View style={s.notifTopRow}>
          <View style={[s.pill, { backgroundColor: n.badgeBg }]}>
            <Text style={[s.pillTxt, { color: n.badgeColor }]}>{n.badge}</Text>
          </View>
          <Text style={s.notifTime}>{n.time}</Text>
        </View>
        {/* Title + desc */}
        <Text style={s.notifTitle}>{n.title}</Text>
        <Text style={s.notifDesc}>{n.desc}</Text>
        {/* Footer */}
        <View style={s.notifFooter}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {n.caseId && (
              <View style={[s.pill, { backgroundColor: C.g100 }]}>
                <Text style={[s.pillTxt, { color: C.g600 }]}>{n.caseId}</Text>
              </View>
            )}
            {n.avatar && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Image source={{ uri: n.avatar }} style={s.avatarTiny} />
                <Text style={s.avatarName}>{n.avatarName}</Text>
              </View>
            )}
            {n.extraBadge && (
              <View style={[s.pill, { backgroundColor: n.extraBadgeBg }]}>
                <Text style={[s.pillTxt, { color: n.extraBadgeColor }]}>{n.extraBadge}</Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {n.extraAction && (
              <TouchableOpacity style={[s.actionChip, { backgroundColor: n.extraAction.bg }]}>
                <FontAwesome5 name={n.extraAction.icon} size={11} color={n.extraAction.color} />
                <Text style={[s.actionChipTxt, { color: n.extraAction.color }]}>{n.extraAction.label}</Text>
              </TouchableOpacity>
            )}
            {n.actionStyle === 'link' && (
              <TouchableOpacity>
                <Text style={[s.actionLink, { color: n.actionColor }]}>{n.actionLabel}</Text>
              </TouchableOpacity>
            )}
            {n.actionStyle === 'filled' && (
              <TouchableOpacity style={[s.actionChip, { backgroundColor: n.actionBg }]}>
                {n.actionIcon && (
                  n.actionLib === 'FA'
                    ? <FontAwesome name={n.actionIcon} size={11} color={n.actionColor} />
                    : <FontAwesome5 name={n.actionIcon} size={11} color={n.actionColor} />
                )}
                <Text style={[s.actionChipTxt, { color: n.actionColor }]}>{n.actionLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  </View>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
// Map API notification type → icon config
const TYPE_CONFIG = {
  CASE_UPDATE:      { iconName: 'briefcase',          iconColor: '#1E40AF', iconBg: '#DBEAFE', borderColor: '#3B82F6', badge: 'CASE UPDATE',      badgeColor: '#1E40AF', badgeBg: '#EFF6FF' },
  INVOICE_DUE:      { iconName: 'dollar-sign',         iconColor: '#D97706', iconBg: '#FEF3C7', borderColor: '#D97706', badge: 'INVOICE DUE',       badgeColor: '#D97706', badgeBg: '#FFFBEB' },
  HEARING_REMINDER: { iconName: 'gavel',               iconColor: '#DC2626', iconBg: '#FEE2E2', borderColor: '#DC2626', badge: 'HEARING REMINDER',  badgeColor: '#DC2626', badgeBg: '#FEF2F2' },
  DOCUMENT_SHARED:  { iconName: 'file-alt',            iconColor: '#16A34A', iconBg: '#DCFCE7', borderColor: '#22C55E', badge: 'DOCUMENT SHARED',   badgeColor: '#16A34A', badgeBg: '#F0FDF4' },
  TASK_ASSIGNED:    { iconName: 'tasks',               iconColor: '#9333EA', iconBg: '#F3E8FF', borderColor: '#A855F7', badge: 'TASK ASSIGNED',     badgeColor: '#9333EA', badgeBg: '#FAF5FF' },
  GENERAL:          { iconName: 'bell',                iconColor: '#4B5563', iconBg: '#F3F4F6', borderColor: '#9CA3AF', badge: 'GENERAL',           badgeColor: '#4B5563', badgeBg: '#F9FAFB' },
};

function apiNotifToCard(n) {
  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.GENERAL;
  return {
    ...cfg,
    time:        n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    title:       n.title,
    desc:        n.message || '',
    caseId:      null,
    avatar:      null,
    avatarName:  null,
    actionLabel: 'View',
    actionColor: cfg.badgeColor,
    actionStyle: 'link',
    is_read:     n.is_read,
    _date:       n.created_at ? new Date(n.created_at) : new Date(),
  };
}

export default function NotificationsScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    notificationsAPI.list()
      .then(data => setNotifications((data || []).map(apiNotifToCard)))
      .catch(() => {/* keep static fallback */})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (_) {}
  };

  const today = new Date();
  const todayStr = today.toDateString();
  const yesterdayStr = new Date(today - 86400000).toDateString();

  const todayNotifs     = notifications.filter(n => n._date.toDateString() === todayStr);
  const yesterdayNotifs = notifications.filter(n => n._date.toDateString() === yesterdayStr);
  const olderNotifs     = notifications.filter(n => n._date.toDateString() !== todayStr && n._date.toDateString() !== yesterdayStr);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Use static data when API returns nothing yet
  const displayToday     = todayNotifs.length     > 0 ? todayNotifs     : TODAY_NOTIFS;
  const displayYesterday = yesterdayNotifs.length > 0 ? yesterdayNotifs : YESTERDAY_NOTIFS;
  const displayOlder     = olderNotifs.length     > 0 ? olderNotifs     : WEEK_NOTIFS;

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.primary} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
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
            <Text style={s.headerTitle}>Notifications</Text>
            <Text style={s.headerSub}>Stay updated on all case activity</Text>
          </View>
          <TouchableOpacity style={s.markAllBtn} onPress={handleMarkAllRead}>
            <FontAwesome5 name="check-double" size={13} color={C.white} />
            <Text style={s.markAllTxt}>Mark all read{unreadCount > 0 ? ` (${unreadCount})` : ''}</Text>
          </TouchableOpacity>
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

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* SUMMARY STATS */}
        <View style={[s.section, { backgroundColor: C.blue50 }]}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { icon: 'briefcase', iconColor: C.primary, iconBg: C.blue100, value: '8', label: 'Case Updates', borderColor: '#BFDBFE' },
              { icon: 'file-alt', iconColor: C.green600, iconBg: C.green100, value: '12', label: 'New Docs', borderColor: '#BBF7D0' },
              { icon: 'dollar-sign', iconColor: C.amber600, iconBg: C.amber100, value: '5', label: 'Payments', borderColor: '#FDE68A' },
            ].map((st, i) => (
              <View key={i} style={[s.statCard, { borderColor: st.borderColor }]}>
                <View style={[s.statIcon, { backgroundColor: st.iconBg }]}>
                  <FontAwesome5 name={st.icon} size={18} color={st.iconColor} />
                </View>
                <Text style={s.statVal}>{st.value}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* TODAY */}
        <View style={s.section}>
          <View style={s.groupHeader}>
            <Text style={s.groupTitle}>Today</Text>
            <Text style={s.groupDate}>March 15, 2024</Text>
          </View>
          {displayToday.map((n, i) => <NotifCard key={i} n={n} />)}
        </View>

        {/* YESTERDAY */}
        <View style={[s.section, { backgroundColor: '#FAFAFA' }]}>
          <View style={s.groupHeader}>
            <Text style={s.groupTitle}>Yesterday</Text>
            <Text style={s.groupDate}>March 14, 2024</Text>
          </View>
          {displayYesterday.map((n, i) => <NotifCard key={i} n={n} />)}
        </View>

        {/* EARLIER THIS WEEK */}
        <View style={s.section}>
          <View style={s.groupHeader}>
            <Text style={s.groupTitle}>Earlier This Week</Text>
            <Text style={s.groupDate}>March 11–13</Text>
          </View>
          {displayOlder.map((n, i) => <NotifCard key={i} n={n} />)}
        </View>

        {/* PAYMENT STATUS OVERVIEW */}
        <View style={[s.section, { backgroundColor: C.green50 }]}>
          <Text style={[s.groupTitle, { marginBottom: 14 }]}>Payment Status Overview</Text>
          <View style={s.paymentCard}>
            <View style={s.paymentTopRow}>
              {[
                { icon: 'check-circle', iconBg: C.green100, iconColor: C.green600, value: '$12,750', label: 'Paid This Week', sub: '3 payments', subColor: C.green600 },
                { icon: 'clock', iconBg: C.amber100, iconColor: C.amber600, value: '$8,250', label: 'Pending', sub: '4 invoices', subColor: C.amber600 },
              ].map((p, i) => (
                <View key={i} style={[s.paymentStat, i === 0 && { borderRightWidth: 1, borderRightColor: C.g100 }]}>
                  <View style={[s.paymentIcon, { backgroundColor: p.iconBg }]}>
                    <FontAwesome5 name={p.icon} size={22} color={p.iconColor} />
                  </View>
                  <Text style={s.paymentVal}>{p.value}</Text>
                  <Text style={s.paymentLabel}>{p.label}</Text>
                  <Text style={[s.paymentSub, { color: p.subColor }]}>{p.sub}</Text>
                </View>
              ))}
            </View>
            <View style={{ gap: 8 }}>
              {PAYMENT_SUMMARY.map((p, i) => (
                <View key={i} style={s.paymentRow}>
                  <View style={[s.paymentRowIcon, { backgroundColor: p.statusBg }]}>
                    <FontAwesome5 name={p.statusIcon} size={13} color={p.statusColor} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.paymentRowInvoice}>{p.invoice}</Text>
                    <Text style={s.paymentRowClient}>{p.client}</Text>
                  </View>
                  <Text style={[s.paymentRowAmount, { color: p.amountColor }]}>{p.amount}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* RECENT DOCUMENT ACTIVITY */}
        <View style={s.section}>
          <Text style={[s.groupTitle, { marginBottom: 14 }]}>Recent Document Activity</Text>
          {DOC_ACTIVITY.map((doc, i) => (
            <View key={i} style={s.docCard}>
              <View style={[s.docIcon, { backgroundColor: doc.iconBg }]}>
                <FontAwesome5 name={doc.iconName} size={20} color={doc.iconColor} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={s.docTopRow}>
                  <Text style={s.docTitle} numberOfLines={1}>{doc.title}</Text>
                  <View style={[s.pill, { backgroundColor: doc.badgeBg }]}>
                    <Text style={[s.pillTxt, { color: doc.badgeColor }]}>{doc.badge}</Text>
                  </View>
                </View>
                <Text style={s.docSub}>{doc.sub}</Text>
                <View style={s.docFooter}>
                  <Text style={s.docMeta}>{doc.size}</Text>
                  <Text style={s.docMetaDot}>•</Text>
                  <Text style={s.docMeta}>{doc.time}</Text>
                  <TouchableOpacity style={[s.actionChip, { backgroundColor: doc.actionBg, marginLeft: 'auto' }]}>
                    <FontAwesome5 name={doc.actionIcon} size={11} color={doc.actionColor} />
                    <Text style={[s.actionChipTxt, { color: doc.actionColor }]}>{doc.actionLabel}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.primary },
  scroll: { flex: 1, backgroundColor: C.g50 },

  header: { backgroundColor: C.primary, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.white },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  markAllTxt: { fontSize: 11, fontWeight: '600', color: C.white },

  filterBar: { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.g200, maxHeight: 52, flexGrow: 0 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, backgroundColor: C.g100 },
  filterTabActive: { backgroundColor: C.primary },
  filterTabTxt: { fontSize: 12, fontWeight: '600', color: C.g600 },
  filterTabTxtActive: { color: C.white },

  section: { paddingHorizontal: 16, paddingVertical: 18, backgroundColor: C.white, marginBottom: 2 },

  // Stats
  statCard: { flex: 1, backgroundColor: C.white, borderRadius: 18, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1 },
  statIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statVal: { fontSize: 22, fontWeight: '800', color: C.dark },
  statLabel: { fontSize: 11, color: C.g500, marginTop: 2, textAlign: 'center' },

  // Group headers
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  groupTitle: { fontSize: 16, fontWeight: '800', color: C.dark },
  groupDate: { fontSize: 12, color: C.g500, fontWeight: '500' },

  // Notification card
  notifCard: { backgroundColor: C.white, borderRadius: 16, padding: 14, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: C.g100, marginBottom: 10 },
  notifIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  notifTime: { fontSize: 11, color: C.g400 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: C.dark, marginBottom: 4 },
  notifDesc: { fontSize: 13, color: C.g600, lineHeight: 18, marginBottom: 10 },
  notifFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: C.g100 },

  // Pills & Actions
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillTxt: { fontSize: 11, fontWeight: '700' },
  actionLink: { fontSize: 13, fontWeight: '700' },
  actionChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9 },
  actionChipTxt: { fontSize: 11, fontWeight: '700' },

  // Avatar
  avatarTiny: { width: 24, height: 24, borderRadius: 8 },
  avatarName: { fontSize: 12, color: C.g600, fontWeight: '500' },

  // Payment overview
  paymentCard: { backgroundColor: C.white, borderRadius: 24, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: C.g100 },
  paymentTopRow: { flexDirection: 'row', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.g100 },
  paymentStat: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  paymentIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  paymentVal: { fontSize: 22, fontWeight: '800', color: C.dark },
  paymentLabel: { fontSize: 12, color: C.g600, fontWeight: '500', marginTop: 2 },
  paymentSub: { fontSize: 11, fontWeight: '700', marginTop: 3 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.g50, borderRadius: 14, padding: 12 },
  paymentRowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  paymentRowInvoice: { fontSize: 13, fontWeight: '700', color: C.dark },
  paymentRowClient: { fontSize: 11, color: C.g500, marginTop: 2 },
  paymentRowAmount: { fontSize: 14, fontWeight: '800' },

  // Doc activity
  docCard: { flexDirection: 'row', backgroundColor: C.white, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: C.g100, marginBottom: 10 },
  docIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  docTitle: { fontSize: 13, fontWeight: '700', color: C.dark, flex: 1, marginRight: 8 },
  docSub: { fontSize: 12, color: C.g600, marginBottom: 8 },
  docFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  docMeta: { fontSize: 11, color: C.g400 },
  docMetaDot: { fontSize: 11, color: C.g400 },
});
