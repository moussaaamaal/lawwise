import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const COLORS = {
  teal: '#0F766E', tealLight: '#14B8A6', dark: '#1E293B',
  white: '#FFFFFF', gray50: '#F9FAFB', gray100: '#F3F4F6',
  gray200: '#E5E7EB', gray400: '#9CA3AF', gray500: '#6B7280', gray600: '#4B5563',
};

const SERVICE_TEMPLATES = [
  { label: 'Court Representation', rate: '350' },
  { label: 'Legal Consultation', rate: '150' },
  { label: 'Document Drafting', rate: '200' },
  { label: 'Research & Analysis', rate: '180' },
];

const TAX_RATES = ['0%', '5%', '10%', '15%', '20%'];

export default function InvoiceScreen({ navigation }) {
  const [form, setForm] = useState({
    client: '', case: '', invoiceNumber: `INV-2024-${String(Math.floor(Math.random() * 900) + 100)}`,
    issueDate: new Date().toLocaleDateString(), dueDate: '', notes: '',
    taxRate: '0%', discount: '0',
  });
  const [items, setItems] = useState([
    { id: 1, desc: '', quantity: '1', rate: '', amount: 0 },
  ]);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const updateItem = (id, key, val) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [key]: val };
      updated.amount = parseFloat(updated.quantity || 0) * parseFloat(updated.rate || 0);
      return updated;
    }));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), desc: '', quantity: '1', rate: '', amount: 0 }]);
  };

  const removeItem = (id) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const subtotal = items.reduce((s, i) => s + (i.amount || 0), 0);
  const discountAmt = (subtotal * parseFloat(form.discount || 0)) / 100;
  const taxAmt = ((subtotal - discountAmt) * parseFloat(form.taxRate.replace('%', '') || 0)) / 100;
  const total = subtotal - discountAmt + taxAmt;
  const fmt = (n) => `$${n.toFixed(2)}`;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.teal} />

      <View style={s.header}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
            <FontAwesome5 name="arrow-left" size={16} color={COLORS.white} />
          </TouchableOpacity>
          <View>
            <Text style={s.headerTitle}>Create Invoice</Text>
            <Text style={s.headerSub}>Track payments & billing</Text>
          </View>
          <TouchableOpacity style={s.backBtn}>
            <FontAwesome5 name="eye" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Invoice Summary Banner */}
        <View style={s.summaryBanner}>
          <View style={s.summaryLeft}>
            <Text style={s.invNumLabel}>Invoice Number</Text>
            <Text style={s.invNum}>{form.invoiceNumber}</Text>
          </View>
          <View style={s.summaryRight}>
            <Text style={s.totalLabel}>Total Amount</Text>
            <Text style={s.totalAmount}>{fmt(total)}</Text>
          </View>
        </View>

        {/* Client Info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Bill To</Text>
          <Text style={s.label}>Client</Text>
          <View style={s.clientList}>
            {['Marcus Johnson', 'Sarah Mitchell', 'Robert Chen'].map(c => (
              <TouchableOpacity key={c} style={[s.clientChip, form.client === c && s.clientChipActive]} onPress={() => update('client', c)}>
                <View style={[s.clientAvatar, form.client === c && { backgroundColor: COLORS.teal }]}>
                  <Text style={[s.clientAvatarText, form.client === c && { color: COLORS.white }]}>
                    {c.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <Text style={[s.clientChipText, form.client === c && s.clientChipTextActive]}>{c}</Text>
                {form.client === c && <FontAwesome5 name="check" size={11} color={COLORS.teal} style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[s.label, { marginTop: 12 }]}>Related Case</Text>
          {['CR-2024-1247 — State vs. Johnson', 'CV-2024-0892 — Mitchell Corp.', 'FM-2024-0453 — Chen Estate'].map(c => (
            <TouchableOpacity key={c} style={[s.caseRow, form.case === c && s.caseRowActive]} onPress={() => update('case', c)}>
              <View style={[s.radio, form.case === c && s.radioActive]}>
                {form.case === c && <View style={s.radioDot} />}
              </View>
              <Text style={[s.caseText, form.case === c && s.caseTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dates */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Invoice Dates</Text>
          <View style={s.dateRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Issue Date</Text>
              <TouchableOpacity style={s.dateInput}>
                <FontAwesome5 name="calendar" size={13} color={COLORS.teal} />
                <Text style={s.dateInputText}>{form.issueDate}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Due Date</Text>
              <TouchableOpacity style={s.dateInput} onPress={() => update('dueDate', 'Apr 30, 2024')}>
                <FontAwesome5 name="calendar-alt" size={13} color={COLORS.teal} />
                <Text style={[s.dateInputText, !form.dueDate && { color: COLORS.gray400 }]}>
                  {form.dueDate || 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Line Items */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Services / Line Items</Text>

          {/* Templates */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 14 }}>
            {SERVICE_TEMPLATES.map(t => (
              <TouchableOpacity key={t.label} style={s.templateChip} onPress={() => addItem()}>
                <FontAwesome5 name="plus" size={10} color={COLORS.teal} />
                <Text style={s.templateText}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {items.map((item, idx) => (
            <View key={item.id} style={s.lineItem}>
              <View style={s.lineItemHeader}>
                <Text style={s.lineItemNum}>Item {idx + 1}</Text>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                  <FontAwesome5 name="trash" size={12} color="#DC2626" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={[s.input, { marginBottom: 8 }]}
                placeholder="Service description"
                placeholderTextColor={COLORS.gray400}
                value={item.desc}
                onChangeText={v => updateItem(item.id, 'desc', v)}
              />
              <View style={s.lineItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.miniLabel}>Qty</Text>
                  <TextInput style={s.miniInput} keyboardType="numeric" value={item.quantity} onChangeText={v => updateItem(item.id, 'quantity', v)} />
                </View>
                <View style={{ flex: 2, marginHorizontal: 8 }}>
                  <Text style={s.miniLabel}>Rate ($)</Text>
                  <TextInput style={s.miniInput} keyboardType="numeric" placeholder="0.00" placeholderTextColor={COLORS.gray400} value={item.rate} onChangeText={v => updateItem(item.id, 'rate', v)} />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={s.miniLabel}>Amount</Text>
                  <View style={s.amountBox}>
                    <Text style={s.amountText}>{fmt(item.amount)}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={s.addItemBtn} onPress={addItem}>
            <FontAwesome5 name="plus" size={13} color={COLORS.teal} />
            <Text style={s.addItemText}>Add Another Item</Text>
          </TouchableOpacity>
        </View>

        {/* Totals */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Summary</Text>

          <View style={s.totalRow}>
            <Text style={s.totalKey}>Subtotal</Text>
            <Text style={s.totalVal}>{fmt(subtotal)}</Text>
          </View>

          <View style={[s.totalRow, { marginTop: 10 }]}>
            <Text style={s.label}>Discount (%)</Text>
            <TextInput
              style={[s.miniInput, { width: 70, textAlign: 'right' }]}
              keyboardType="numeric"
              value={form.discount}
              onChangeText={v => update('discount', v)}
            />
          </View>

          <Text style={[s.label, { marginTop: 10 }]}>Tax Rate</Text>
          <View style={s.taxRow}>
            {TAX_RATES.map(t => (
              <TouchableOpacity key={t} style={[s.taxBtn, form.taxRate === t && s.taxBtnActive]} onPress={() => update('taxRate', t)}>
                <Text style={[s.taxText, form.taxRate === t && s.taxTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.divider} />
          {discountAmt > 0 && (
            <View style={s.totalRow}>
              <Text style={[s.totalKey, { color: '#059669' }]}>Discount</Text>
              <Text style={[s.totalVal, { color: '#059669' }]}>-{fmt(discountAmt)}</Text>
            </View>
          )}
          {taxAmt > 0 && (
            <View style={[s.totalRow, { marginTop: 4 }]}>
              <Text style={s.totalKey}>Tax ({form.taxRate})</Text>
              <Text style={s.totalVal}>{fmt(taxAmt)}</Text>
            </View>
          )}
          <View style={[s.totalRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 2, borderTopColor: COLORS.teal }]}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.dark }}>Total Due</Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.teal }}>{fmt(total)}</Text>
          </View>
        </View>

        {/* Notes */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Payment Notes</Text>
          <TextInput
            style={[s.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
            placeholder="Payment terms, bank details, notes..."
            placeholderTextColor={COLORS.gray400}
            value={form.notes}
            onChangeText={v => update('notes', v)}
            multiline
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        <TouchableOpacity style={s.btnOutline}>
          <FontAwesome5 name="file-pdf" size={14} color={COLORS.teal} />
          <Text style={s.btnOutlineText}>PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnOutline}>
          <FontAwesome5 name="paper-plane" size={14} color={COLORS.teal} />
          <Text style={s.btnOutlineText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btnPrimary, { flex: 1 }]}>
          <FontAwesome5 name="save" size={14} color={COLORS.white} />
          <Text style={[s.btnPrimaryText, { marginLeft: 8 }]}>Save Invoice</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.teal },
  scroll: { flex: 1, backgroundColor: COLORS.gray50 },
  header: { backgroundColor: COLORS.teal, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.white, textAlign: 'center' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  summaryBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.teal, paddingHorizontal: 20, paddingBottom: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  summaryLeft: {},
  invNumLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  invNum: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  summaryRight: { alignItems: 'flex-end' },
  totalLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  totalAmount: { fontSize: 24, fontWeight: '800', color: COLORS.white },
  section: { margin: 16, backgroundColor: COLORS.white, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.dark, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.dark, marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.dark, backgroundColor: COLORS.white },
  clientList: { gap: 8, marginBottom: 8 },
  clientChip: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.gray200 },
  clientChipActive: { borderColor: COLORS.teal, backgroundColor: '#F0FDFA' },
  clientAvatar: { width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.gray100, alignItems: 'center', justifyContent: 'center' },
  clientAvatarText: { fontSize: 12, fontWeight: '800', color: COLORS.gray600 },
  clientChipText: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  clientChipTextActive: { color: COLORS.teal },
  caseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, marginBottom: 6, borderWidth: 1.5, borderColor: COLORS.gray200 },
  caseRowActive: { borderColor: COLORS.teal, backgroundColor: '#F0FDFA' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.gray300, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.teal },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.teal },
  caseText: { fontSize: 13, color: COLORS.gray600, flex: 1 },
  caseTextActive: { color: COLORS.teal, fontWeight: '600' },
  dateRow: { flexDirection: 'row' },
  dateInput: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12 },
  dateInputText: { fontSize: 13, color: COLORS.dark, fontWeight: '500' },
  templateChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.teal, backgroundColor: '#F0FDFA' },
  templateText: { fontSize: 11, fontWeight: '600', color: COLORS.teal },
  lineItem: { backgroundColor: COLORS.gray50, borderRadius: 14, padding: 12, marginBottom: 10 },
  lineItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  lineItemNum: { fontSize: 12, fontWeight: '700', color: COLORS.gray500 },
  lineItemRow: { flexDirection: 'row', alignItems: 'flex-end' },
  miniLabel: { fontSize: 11, fontWeight: '600', color: COLORS.gray500, marginBottom: 4 },
  miniInput: { borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9, fontSize: 13, color: COLORS.dark, backgroundColor: COLORS.white },
  amountBox: { borderRadius: 10, backgroundColor: '#F0FDFA', paddingHorizontal: 10, paddingVertical: 9, alignItems: 'flex-end' },
  amountText: { fontSize: 13, fontWeight: '700', color: COLORS.teal },
  addItemBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.teal, marginTop: 4 },
  addItemText: { fontSize: 13, fontWeight: '700', color: COLORS.teal },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalKey: { fontSize: 14, color: COLORS.gray600 },
  totalVal: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
  taxRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  taxBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.gray200, alignItems: 'center' },
  taxBtnActive: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  taxText: { fontSize: 12, fontWeight: '700', color: COLORS.gray600 },
  taxTextActive: { color: COLORS.white },
  divider: { height: 1, backgroundColor: COLORS.gray100, marginVertical: 12 },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  btnPrimary: { flexDirection: 'row', backgroundColor: COLORS.teal, paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  btnOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.teal },
  btnOutlineText: { fontSize: 13, fontWeight: '700', color: COLORS.teal },
});
