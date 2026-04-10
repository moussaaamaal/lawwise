import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const COLORS = {
  primary: '#1E40AF', dark: '#1E293B', white: '#FFFFFF',
  gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB',
  gray400: '#9CA3AF', gray500: '#6B7280', gray600: '#4B5563',
};

const NOTE_COLORS = [
  { id: 'yellow', bg: '#FEF9C3', border: '#FDE047', dot: '#EAB308' },
  { id: 'blue', bg: '#DBEAFE', border: '#93C5FD', dot: '#3B82F6' },
  { id: 'green', bg: '#DCFCE7', border: '#86EFAC', dot: '#22C55E' },
  { id: 'pink', bg: '#FCE7F3', border: '#F9A8D4', dot: '#EC4899' },
  { id: 'purple', bg: '#F3E8FF', border: '#D8B4FE', dot: '#A855F7' },
  { id: 'orange', bg: '#FFEDD5', border: '#FED7AA', dot: '#F97316' },
];

const NOTE_TAGS = ['Client Meeting', 'Research', 'Court Prep', 'Strategy', 'Reminder', 'Important', 'Follow-up', 'Confidential'];

export default function AddNoteScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [selectedCase, setSelectedCase] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const currentTheme = NOTE_COLORS.find(c => c.id === selectedColor) || NOTE_COLORS[0];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#D97706" />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
            <FontAwesome5 name="arrow-left" size={16} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>New Note</Text>
          <TouchableOpacity style={s.pinBtn} onPress={() => setIsPinned(!isPinned)}>
            <FontAwesome5 name={isPinned ? 'thumbtack' : 'thumbtack'} size={16} color={isPinned ? '#FDE68A' : 'rgba(255,255,255,0.6)'} solid={isPinned} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Note Preview Card */}
        <View style={[s.notePreview, { backgroundColor: currentTheme.bg, borderColor: currentTheme.border }]}>
          <View style={s.previewHeader}>
            <View style={[s.colorDot, { backgroundColor: currentTheme.dot }]} />
            <Text style={s.previewDate}>Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            {isPinned && <FontAwesome5 name="thumbtack" size={12} color={COLORS.gray500} style={{ marginLeft: 'auto' }} />}
          </View>
          <Text style={[s.previewTitle, !title && s.placeholder]}>
            {title || 'Note title...'}
          </Text>
          <Text style={[s.previewContent, !content && s.placeholder]} numberOfLines={3}>
            {content || 'Start typing your note here...'}
          </Text>
        </View>

        {/* Main Write Area */}
        <View style={s.section}>
          <Text style={s.label}>Title</Text>
          <TextInput
            style={s.titleInput}
            placeholder="Enter note title..."
            placeholderTextColor={COLORS.gray400}
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />
          <Text style={s.charCount}>{title.length}/80</Text>

          <Text style={[s.label, { marginTop: 16 }]}>Content</Text>
          <TextInput
            style={s.contentInput}
            placeholder="Write your note here... You can include case details, action items, reminders, or any relevant information."
            placeholderTextColor={COLORS.gray400}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          {/* Formatting Toolbar */}
          <View style={s.toolbar}>
            {[
              { icon: 'bold', label: 'B' },
              { icon: 'italic', label: 'I' },
              { icon: 'underline', label: 'U' },
              { icon: 'list-ul', label: '•' },
              { icon: 'list-ol', label: '1.' },
              { icon: 'link', label: '🔗' },
            ].map((t, i) => (
              <TouchableOpacity key={i} style={s.toolbarBtn}>
                <FontAwesome5 name={t.icon} size={13} color={COLORS.gray600} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note Color */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Note Color</Text>
          <View style={s.colorsRow}>
            {NOTE_COLORS.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[s.colorBtn, { backgroundColor: c.bg, borderColor: c.border }, selectedColor === c.id && s.colorBtnSelected]}
                onPress={() => setSelectedColor(c.id)}
              >
                <View style={[s.colorBtnDot, { backgroundColor: c.dot }]} />
                {selectedColor === c.id && (
                  <View style={s.colorCheck}>
                    <FontAwesome5 name="check" size={8} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Related Case */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Link to Case</Text>
          {['None', 'CR-2024-1247 — State vs. Johnson', 'CV-2024-0892 — Mitchell Corp.', 'FM-2024-0453 — Chen Estate'].map(c => (
            <TouchableOpacity key={c} style={[s.caseRow, selectedCase === c && s.caseRowActive]} onPress={() => setSelectedCase(c)}>
              <View style={[s.radio, selectedCase === c && s.radioActive]}>
                {selectedCase === c && <View style={s.radioDot} />}
              </View>
              <Text style={[s.caseText, selectedCase === c && s.caseTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tags */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Tags</Text>
          <View style={s.tagsWrap}>
            {NOTE_TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[s.tagBtn, selectedTags.includes(tag) && s.tagBtnActive]}
                onPress={() => toggleTag(tag)}
              >
                {selectedTags.includes(tag) && <FontAwesome5 name="check" size={9} color={COLORS.white} style={{ marginRight: 4 }} />}
                <Text style={[s.tagText, selectedTags.includes(tag) && s.tagTextActive]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Options */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Options</Text>
          <View style={s.optionRow}>
            <View style={s.optionLeft}>
              <FontAwesome5 name="lock" size={14} color={COLORS.gray500} />
              <View style={{ marginLeft: 12 }}>
                <Text style={s.optionTitle}>Private Note</Text>
                <Text style={s.optionSub}>Only visible to you</Text>
              </View>
            </View>
            <TouchableOpacity style={[s.toggle, isPrivate && s.toggleActive]} onPress={() => setIsPrivate(!isPrivate)}>
              <View style={[s.toggleKnob, isPrivate && s.toggleKnobActive]} />
            </TouchableOpacity>
          </View>

          <View style={[s.optionRow, { marginTop: 12 }]}>
            <View style={s.optionLeft}>
              <FontAwesome5 name="thumbtack" size={14} color={COLORS.gray500} />
              <View style={{ marginLeft: 12 }}>
                <Text style={s.optionTitle}>Pin to Dashboard</Text>
                <Text style={s.optionSub}>Show on home screen</Text>
              </View>
            </View>
            <TouchableOpacity style={[s.toggle, isPinned && s.toggleActive]} onPress={() => setIsPinned(!isPinned)}>
              <View style={[s.toggleKnob, isPinned && s.toggleKnobActive]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.btnSecondary} onPress={() => navigation?.goBack()}>
          <Text style={s.btnSecondaryText}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btnPrimary, { backgroundColor: '#D97706' }]}>
          <FontAwesome5 name="sticky-note" size={14} color={COLORS.white} />
          <Text style={[s.btnPrimaryText, { marginLeft: 8 }]}>Save Note</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#D97706' },
  scroll: { flex: 1, backgroundColor: COLORS.gray50 },
  header: { backgroundColor: '#D97706', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  pinBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  notePreview: { margin: 16, borderRadius: 20, padding: 16, borderWidth: 2 },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  previewDate: { fontSize: 11, color: COLORS.gray500 },
  previewTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 6 },
  previewContent: { fontSize: 13, color: COLORS.gray600, lineHeight: 20 },
  placeholder: { color: COLORS.gray400, fontStyle: 'italic' },
  section: { marginHorizontal: 16, marginBottom: 12, backgroundColor: COLORS.white, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.dark, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.dark, marginBottom: 8 },
  titleInput: { fontSize: 16, fontWeight: '600', color: COLORS.dark, borderBottomWidth: 2, borderBottomColor: COLORS.gray200, paddingBottom: 10, paddingHorizontal: 4 },
  charCount: { fontSize: 11, color: COLORS.gray400, textAlign: 'right', marginTop: 4 },
  contentInput: { fontSize: 14, color: COLORS.dark, minHeight: 120, lineHeight: 22, borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, padding: 14, marginTop: 8 },
  toolbar: { flexDirection: 'row', gap: 4, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  toolbarBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.gray50, alignItems: 'center', justifyContent: 'center' },
  colorsRow: { flexDirection: 'row', gap: 10 },
  colorBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  colorBtnSelected: { borderWidth: 3 },
  colorBtnDot: { width: 18, height: 18, borderRadius: 9 },
  colorCheck: { position: 'absolute', bottom: -6, right: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center' },
  caseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, marginBottom: 6, borderWidth: 1.5, borderColor: COLORS.gray200 },
  caseRowActive: { borderColor: '#D97706', backgroundColor: '#FFFBEB' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.gray300, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#D97706' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D97706' },
  caseText: { fontSize: 13, color: COLORS.gray600, flex: 1 },
  caseTextActive: { color: '#D97706', fontWeight: '600' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.gray200, backgroundColor: COLORS.white },
  tagBtnActive: { backgroundColor: '#D97706', borderColor: '#D97706' },
  tagText: { fontSize: 12, fontWeight: '600', color: COLORS.gray600 },
  tagTextActive: { color: COLORS.white },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  optionSub: { fontSize: 11, color: COLORS.gray500 },
  toggle: { width: 48, height: 26, borderRadius: 13, backgroundColor: COLORS.gray200, paddingHorizontal: 2, justifyContent: 'center' },
  toggleActive: { backgroundColor: '#D97706' },
  toggleKnob: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.white, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
  toggleKnobActive: { marginLeft: 22 },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  btnPrimary: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  btnSecondary: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.gray200, alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText: { fontSize: 15, fontWeight: '600', color: COLORS.gray600 },
});
