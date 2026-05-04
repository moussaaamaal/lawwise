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
  purple50: '#FAF5FF', purple600: '#9333EA',
};

const FILE_ICONS = {
  'application/pdf': { icon: 'file-pdf',   color: C.red600    },
  'image/jpeg':      { icon: 'file-image', color: C.amber600  },
  'image/png':       { icon: 'file-image', color: C.amber600  },
  'application/msword': { icon: 'file-word', color: C.primary },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: 'file-word', color: C.primary },
};

function getFileIcon(mimeType) {
  return FILE_ICONS[mimeType] || { icon: 'file-alt', color: C.g500 };
}

function DocCard({ doc }) {
  const { icon, color } = getFileIcon(doc.file_type);
  const sizeMB = doc.file_size_mb ? `${parseFloat(doc.file_size_mb).toFixed(1)} MB` : '';
  const date = doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  return (
    <View style={s.docCard}>
      <View style={[s.docIcon, { backgroundColor: color + '18' }]}>
        <FontAwesome5 name={icon} size={24} color={color} />
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={s.docName} numberOfLines={2}>{doc.file_name}</Text>
        <View style={s.docMeta}>
          {doc.category && <Text style={s.docCategory}>{doc.category?.replace(/_/g, ' ')}</Text>}
          {sizeMB ? <Text style={s.docSize}>{sizeMB}</Text> : null}
        </View>
        <Text style={s.docDate}>{date}</Text>
      </View>
      {doc.status === 'PENDING_REVIEW' && (
        <View style={s.pendingBadge}>
          <Text style={s.pendingBadgeTxt}>New</Text>
        </View>
      )}
    </View>
  );
}

export default function ClientDocumentsScreen({ navigation }) {
  const [docs, setDocs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await clientPortalAPI.documents();
      setDocs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const newCount = docs.filter(d => d.status === 'PENDING_REVIEW').length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>My Documents</Text>
          <Text style={s.headerSub}>{docs.length} document{docs.length !== 1 ? 's' : ''} shared with you</Text>
        </View>
        {newCount > 0 && (
          <View style={s.newBadge}>
            <Text style={s.newBadgeTxt}>{newCount} new</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={C.primary} /></View>
      ) : (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
        >
          {docs.length === 0 ? (
            <View style={s.emptyBox}>
              <FontAwesome5 name="folder-open" size={40} color={C.g400} />
              <Text style={s.emptyTitle}>No documents yet</Text>
              <Text style={s.emptyTxt}>Documents shared by your attorney will appear here</Text>
            </View>
          ) : (
            docs.map((doc) => <DocCard key={doc.id} doc={doc} />)
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.primary },
  scroll:       { flex: 1, backgroundColor: C.g50 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.g50 },
  header:       { backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, gap: 12 },
  backBtn:      { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: C.white },
  headerSub:    { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  newBadge:     { backgroundColor: C.amber600, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  newBadgeTxt:  { fontSize: 11, fontWeight: '700', color: C.white },
  docCard:      { backgroundColor: C.white, borderRadius: 18, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.g100, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  docIcon:      { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docName:      { fontSize: 14, fontWeight: '700', color: C.dark, marginBottom: 4 },
  docMeta:      { flexDirection: 'row', gap: 8, marginBottom: 2 },
  docCategory:  { fontSize: 11, color: C.primary, fontWeight: '600', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  docSize:      { fontSize: 11, color: C.g400 },
  docDate:      { fontSize: 11, color: C.g400 },
  pendingBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pendingBadgeTxt: { fontSize: 10, fontWeight: '800', color: C.amber600 },
  emptyBox:     { alignItems: 'center', paddingVertical: 60 },
  emptyTitle:   { fontSize: 16, fontWeight: '700', color: C.dark, marginTop: 16 },
  emptyTxt:     { fontSize: 13, color: C.g400, marginTop: 6, textAlign: 'center', paddingHorizontal: 32 },
});
