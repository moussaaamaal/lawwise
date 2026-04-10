import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { clientPortalAPI } from '../../services/api';

const C = {
  primary: '#1E40AF', secondary: '#3B82F6', dark: '#1E293B',
  white: '#FFFFFF', g50: '#F9FAFB', g100: '#F3F4F6', g200: '#E5E7EB',
  g400: '#9CA3AF', g500: '#6B7280', g600: '#4B5563',
  blue50: '#EFF6FF', red600: '#DC2626',
};

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <View style={s.infoRow}>
      <View style={s.infoIcon}>
        <FontAwesome5 name={icon} size={12} color={C.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ClientProfileScreen({ navigation }) {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientPortalAPI.profile()
      .then(d => setProfile(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Profile</Text>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={C.primary} /></View>
      ) : !profile ? (
        <View style={s.center}><Text style={{ color: C.g400 }}>Profile not found.</Text></View>
      ) : (
        <ScrollView style={s.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* Avatar */}
          <View style={s.avatarSection}>
            <View style={s.avatarCircle}>
              <FontAwesome5 name="user" size={36} color={C.primary} />
            </View>
            <Text style={s.fullName}>{profile.first_name} {profile.last_name}</Text>
            <Text style={s.clientTag}>{profile.tag || 'Client'}</Text>
            {profile.client_type && (
              <View style={s.typeBadge}>
                <Text style={s.typeBadgeTxt}>{profile.client_type?.replace(/_/g, ' ')}</Text>
              </View>
            )}
          </View>

          {/* Personal Info */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Personal Information</Text>
            <InfoRow icon="envelope"       label="Email"         value={profile.email} />
            <InfoRow icon="phone"          label="Phone"         value={profile.phone} />
            <InfoRow icon="whatsapp"       label="WhatsApp"      value={profile.whatsapp_number} />
            <InfoRow icon="birthday-cake"  label="Date of Birth" value={profile.date_of_birth} />
            <InfoRow icon="venus-mars"     label="Gender"        value={profile.gender} />
            <InfoRow icon="flag"           label="Nationality"   value={profile.nationality} />
            <InfoRow icon="briefcase"      label="Occupation"    value={profile.occupation} />
            <InfoRow icon="building"       label="Company"       value={profile.company_name} />
            <InfoRow icon="map-marker-alt" label="Address"       value={profile.address} />
          </View>

          {/* Assigned Attorney */}
          {profile.assigned_attorney && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Your Attorney</Text>
              <View style={s.attorneyRow}>
                <View style={s.attorneyAvatar}>
                  <FontAwesome5 name="user-tie" size={22} color={C.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={s.attorneyName}>{profile.assigned_attorney.full_name}</Text>
                  <Text style={s.attorneyTitle}>{profile.assigned_attorney.title}</Text>
                  {profile.assigned_attorney.email && <Text style={s.attorneyEmail}>{profile.assigned_attorney.email}</Text>}
                  {profile.assigned_attorney.specializations?.length > 0 && (
                    <View style={s.specRow}>
                      {profile.assigned_attorney.specializations.slice(0, 2).map((sp, i) => (
                        <View key={i} style={s.specChip}>
                          <Text style={s.specChipTxt}>{sp}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Law Firm */}
          {profile.firm && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Law Firm</Text>
              <InfoRow icon="building"       label="Name"    value={profile.firm.name} />
              <InfoRow icon="envelope"       label="Email"   value={profile.firm.email} />
              <InfoRow icon="phone"          label="Phone"   value={profile.firm.phone} />
              <InfoRow icon="map-marker-alt" label="Address" value={[profile.firm.address, profile.firm.city, profile.firm.country].filter(Boolean).join(', ')} />
            </View>
          )}

          {/* Sign Out */}
          <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
            <FontAwesome5 name="sign-out-alt" size={16} color={C.red600} />
            <Text style={s.signOutTxt}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.primary },
  scroll:        { flex: 1, backgroundColor: C.g50 },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.g50 },
  header:        { backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, gap: 12 },
  backBtn:       { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:   { fontSize: 18, fontWeight: '800', color: C.white },
  avatarSection: { alignItems: 'center', paddingVertical: 24, backgroundColor: C.white, borderRadius: 20, marginBottom: 14, borderWidth: 1, borderColor: C.g100 },
  avatarCircle:  { width: 80, height: 80, borderRadius: 40, backgroundColor: C.blue50, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  fullName:      { fontSize: 20, fontWeight: '800', color: C.dark },
  clientTag:     { fontSize: 13, color: C.g400, marginTop: 4 },
  typeBadge:     { marginTop: 8, backgroundColor: C.blue50, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  typeBadgeTxt:  { fontSize: 12, fontWeight: '700', color: C.primary },
  card:          { backgroundColor: C.white, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.g100, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardTitle:     { fontSize: 14, fontWeight: '800', color: C.dark, marginBottom: 14 },
  infoRow:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  infoIcon:      { width: 30, height: 30, borderRadius: 8, backgroundColor: C.blue50, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoLabel:     { fontSize: 11, color: C.g400, fontWeight: '600', marginBottom: 1 },
  infoValue:     { fontSize: 14, fontWeight: '600', color: C.dark },
  attorneyRow:   { flexDirection: 'row', alignItems: 'flex-start' },
  attorneyAvatar:{ width: 52, height: 52, borderRadius: 26, backgroundColor: C.blue50, alignItems: 'center', justifyContent: 'center' },
  attorneyName:  { fontSize: 15, fontWeight: '700', color: C.dark },
  attorneyTitle: { fontSize: 12, color: C.g400, marginTop: 2 },
  attorneyEmail: { fontSize: 12, color: C.primary, marginTop: 4 },
  specRow:       { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  specChip:      { backgroundColor: C.blue50, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  specChipTxt:   { fontSize: 11, fontWeight: '600', color: C.primary },
  signOutBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.white, borderRadius: 18, paddingVertical: 16, borderWidth: 2, borderColor: '#FEE2E2', marginTop: 4 },
  signOutTxt:    { fontSize: 15, fontWeight: '700', color: C.red600 },
});
