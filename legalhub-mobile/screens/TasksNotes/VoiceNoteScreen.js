import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Animated,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const COLORS = {
  red: '#DC2626', dark: '#1E293B', white: '#FFFFFF',
  gray100: '#F3F4F6', gray200: '#E5E7EB', gray400: '#9CA3AF', gray500: '#6B7280',
};

export default function VoiceNoteScreen({ navigation }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recordings, setRecordings] = useState([
    { id: 1, title: 'Client consultation notes', duration: '02:34', case: 'State vs. Johnson', date: 'Today' },
    { id: 2, title: 'Hearing preparation memo', duration: '01:17', case: 'Mitchell Corp.', date: 'Yesterday' },
  ]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      clearInterval(intervalRef.current);
      pulseAnim.stopAnimation();
    }
    return () => clearInterval(intervalRef.current);
  }, [isRecording, isPaused]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startStop = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsPaused(false);
      if (seconds > 0) {
        setRecordings(prev => [{
          id: Date.now(), title: 'New voice note', duration: fmt(seconds), case: 'Unassigned', date: 'Just now',
        }, ...prev]);
      }
      setSeconds(0);
    } else {
      setIsRecording(true);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.red} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
          <FontAwesome5 name="arrow-left" size={16} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Voice Notes</Text>
        <View style={s.backBtn} />
      </View>

      {/* Recorder */}
      <View style={s.recorderArea}>
        <Text style={s.timer}>{fmt(seconds)}</Text>
        <Text style={s.timerSub}>{isRecording ? (isPaused ? 'Paused' : 'Recording...') : 'Tap to start'}</Text>

        {/* Waveform */}
        <View style={s.waveform}>
          {Array.from({ length: 24 }).map((_, i) => (
            <View
              key={i}
              style={[
                s.waveBar,
                {
                  height: isRecording && !isPaused ? 8 + Math.random() * 32 : 12,
                  backgroundColor: isRecording ? COLORS.white : 'rgba(255,255,255,0.3)',
                },
              ]}
            />
          ))}
        </View>

        {/* Record Button */}
        <Animated.View style={[s.pulseRing, { transform: [{ scale: isRecording ? pulseAnim : 1 }], opacity: isRecording ? 0.3 : 0 }]} />
        <TouchableOpacity style={[s.recordBtn, isRecording && s.recordBtnActive]} onPress={startStop}>
          <FontAwesome5 name={isRecording ? 'stop' : 'microphone'} size={28} color={isRecording ? COLORS.red : COLORS.white} />
        </TouchableOpacity>

        {/* Controls */}
        {isRecording && (
          <View style={s.controls}>
            <TouchableOpacity style={s.controlBtn} onPress={() => setIsPaused(!isPaused)}>
              <FontAwesome5 name={isPaused ? 'play' : 'pause'} size={18} color={COLORS.white} />
              <Text style={s.controlLabel}>{isPaused ? 'Resume' : 'Pause'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.controlBtn, { backgroundColor: 'rgba(255,255,255,0.3)' }]} onPress={() => { setIsRecording(false); setSeconds(0); }}>
              <FontAwesome5 name="trash" size={18} color={COLORS.white} />
              <Text style={s.controlLabel}>Discard</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={s.hint}>{isRecording ? 'Tap stop to save recording' : 'Max 30 minutes per recording'}</Text>
      </View>

      {/* Past Recordings */}
      <View style={s.listArea}>
        <Text style={s.listTitle}>Saved Recordings ({recordings.length})</Text>
        {recordings.map(r => (
          <View key={r.id} style={s.recCard}>
            <View style={s.recIcon}>
              <FontAwesome5 name="microphone" size={16} color={COLORS.red} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.recTitle}>{r.title}</Text>
              <Text style={s.recMeta}>{r.case} • {r.date}</Text>
            </View>
            <Text style={s.recDur}>{r.duration}</Text>
            <TouchableOpacity style={s.playBtn}>
              <FontAwesome5 name="play" size={13} color={COLORS.red} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.red },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  recorderArea: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 32, flex: 0 },
  timer: { fontSize: 56, fontWeight: '800', color: COLORS.white, letterSpacing: 2, fontVariant: ['tabular-nums'] },
  timerSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4, marginBottom: 24 },
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 50, marginBottom: 28 },
  waveBar: { width: 4, borderRadius: 2, backgroundColor: COLORS.white },
  pulseRing: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.white, top: '50%', marginTop: -10 },
  recordBtn: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, elevation: 8, marginBottom: 16 },
  recordBtnActive: { backgroundColor: '#FEE2E2' },
  controls: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  controlBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  controlLabel: { fontSize: 13, color: COLORS.white, fontWeight: '600' },
  hint: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  listArea: { flex: 1, backgroundColor: COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 20 },
  listTitle: { fontSize: 15, fontWeight: '700', color: COLORS.dark, marginBottom: 14 },
  recCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  recIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  recTitle: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  recMeta: { fontSize: 12, color: COLORS.gray500, marginTop: 2 },
  recDur: { fontSize: 13, fontWeight: '700', color: COLORS.gray400, marginRight: 8 },
  playBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
});
