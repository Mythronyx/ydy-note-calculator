import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, TextInput, StyleSheet, Dimensions, Platform, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function App() {
  const [selectedCourse, setSelectedCourse] = useState('A');
  const [grades, setGrades] = useState({
    quiz: ['', '', '', ''], vize: ['', '', '', ''],
    writing: '', sunum: '', kanaat: '', odev: '', final: '', butunleme: '',
  });

  const [results, setResults] = useState(null);
  const [targetNote, setTargetNote] = useState(null);
  const [advice, setAdvice] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      document.documentElement.lang = 'tr';
      const meta = document.createElement('meta');
      meta.name = 'google';
      meta.content = 'notranslate';
      document.head.appendChild(meta);
    }
    loadSavedData();
  }, []);

  useEffect(() => {
    if (isLoaded) saveData();
  }, [grades, selectedCourse]);

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('@ydy_data', JSON.stringify({ grades, selectedCourse }));
    } catch (e) { console.error(e); }
  };

  const loadSavedData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('@ydy_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setGrades(parsed.grades);
        setSelectedCourse(parsed.selectedCourse);
      }
    } catch (e) { console.error(e); } finally { setIsLoaded(true); }
  };

  const getAdvice = (ortalama, minForPass) => {
    if (ortalama >= minForPass) return "Muazzam bir tempodasın, bu başarıyı Finalde mühürle!";
    if (ortalama >= minForPass - 10) return "Sınırı zorluyorsun, küçük bir gayret seni kurtaracak!";
    return "Durum kritik ancak imkansız değil; stratejini değiştir ve odaklan!";
  };

  const calculateGrade = () => {
    const quizValues = grades.quiz.map(v => parseFloat(v) || 0);
    const vizeValues = grades.vize.map(v => parseFloat(v) || 0);
    const quizPoints = (quizValues.reduce((a, b) => a + b, 0) / 4 / 100) * 20;
    const vizePoints = (vizeValues.reduce((a, b) => a + b, 0) / 4 / 100) * 60;
    const writingPoints = (parseFloat(grades.writing) || 0) / 100 * 5;
    const sunumPoints = (parseFloat(grades.sunum) || 0) / 100 * 5;
    const kanaatPoints = (parseFloat(grades.kanaat) || 0) / 100 * 5;
    const odevPoints = (parseFloat(grades.odev) || 0) / 100 * 5;

    const ortalama = quizPoints + vizePoints + writingPoints + sunumPoints + kanaatPoints + odevPoints;
    const minForPass = selectedCourse === 'A' ? 85 : selectedCourse === 'B' ? 80 : 75;
    
    setAdvice(getAdvice(ortalama, minForPass));

    if (!grades.final) {
      const needed = Math.ceil((65 - (ortalama * 0.4)) / 0.6);
      if (ortalama >= minForPass) setTargetNote({ type: 'pass', text: 'Zaten geçtiniz!' });
      else if (needed <= 100) setTargetNote({ type: 'target', text: `Finalde hedef: ${needed}` });
      else setTargetNote({ type: 'fail', text: 'Final imkansız, odak Bütünleme!' });
    } else { setTargetNote(null); }

    let res = { ortalama: ortalama.toFixed(2), durum: '', renk: '' };
    if (ortalama >= minForPass) { res.durum = 'Ortalama ile Geçtiniz ✓'; res.renk = '#10b981'; }
    else if (!grades.final) { res.durum = 'Finale Kaldınız'; res.renk = '#ef4444'; }
    else {
      const fScore = (parseFloat(grades.final) * 0.6 + ortalama * 0.4).toFixed(2);
      if (fScore >= 65) { res.durum = 'Final ile Geçtiniz ✓'; res.renk = '#10b981'; res.f = fScore; }
      else if (!grades.butunleme) { res.durum = 'Bütünlemeye Kaldınız'; res.renk = '#ef4444'; res.f = fScore; }
      else {
        const bScore = (parseFloat(grades.butunleme) * 0.6 + ortalama * 0.4).toFixed(2);
        const isP = bScore >= 65;
        res.durum = isP ? 'Bütünleme ile Geçtiniz ✓' : 'Kaldınız ✗';
        res.renk = isP ? '#10b981' : '#ef4444'; res.b = bScore;
      }
    }
    setResults(res);
  };

  const shareOnWhatsApp = () => {
    if (!results) return;
    const text = `🚀 YDY Not Hesaplama Sonucum:\n\nKur: ${selectedCourse}\nOrtalama: ${results.ortalama}\nDurum: ${results.durum}\n${targetNote ? `Hedef: ${targetNote.text}\n` : ''}\nUygulama: ${window.location.href}`;
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const handleInputChange = (f, i, v) => {
    const val = v === '' ? '' : Math.min(Math.max(parseFloat(v) || 0, 0), 100).toString();
    if (Array.isArray(grades[f])) {
      const n = [...grades[f]]; n[i] = val; setGrades({ ...grades, [f]: n });
    } else { setGrades({ ...grades, [f]: val }); }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}><Text style={styles.title}>YDY</Text><Text style={styles.subtitle}>Not Hesaplama</Text></View>

        <View style={styles.section}>
          <Text style={styles.label}>Kur Seçimi</Text>
          <View style={styles.row}>
            {['A', 'B', 'C'].map(k => (
              <TouchableOpacity key={k} onPress={() => setSelectedCourse(k)} style={[styles.btn, selectedCourse === k && styles.btnActive]}>
                <Text style={styles.btnT}>{k} KURU</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Quiz & Vize</Text>
          <View style={styles.grid}>{grades.quiz.map((v, i) => (
            <View key={`q${i}`} style={styles.item}><Text style={styles.iL}>Q{i+1}</Text><TextInput style={styles.input} keyboardType="numeric" value={v} onChangeText={t => handleInputChange('quiz', i, t)} maxLength={3}/></View>
          ))}{grades.vize.map((v, i) => (
            <View key={`v${i}`} style={styles.item}><Text style={styles.iL}>V{i+1}</Text><TextInput style={styles.input} keyboardType="numeric" value={v} onChangeText={t => handleInputChange('vize', i, t)} maxLength={3}/></View>
          ))}</View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Diğer</Text>
          <View style={styles.grid}>{[ {k:'writing', l:'Writ'}, {k:'sunum', l:'Sun'}, {k:'kanaat', l:'Kan'}, {k:'odev', l:'Ödev'} ].map(i => (
            <View key={i.k} style={styles.half}><Text style={styles.iL}>{i.l}</Text><TextInput style={styles.input} keyboardType="numeric" value={grades[i.k]} onChangeText={t => handleInputChange(i.k, null, t)} maxLength={3}/></View>
          ))}</View>
        </View>

        <View style={styles.row}>
          <View style={[styles.section, styles.flex]}><Text style={styles.label}>Final</Text><TextInput style={styles.input} value={grades.final} onChangeText={t => handleInputChange('final', null, t)} maxLength={3}/></View>
          <View style={[styles.section, styles.flex]}><Text style={styles.label}>Büt</Text><TextInput style={styles.input} value={grades.butunleme} onChangeText={t => handleInputChange('butunleme', null, t)} maxLength={3}/></View>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.calc} onPress={calculateGrade}><Text style={styles.calcT}>Hesapla</Text></TouchableOpacity>
          <TouchableOpacity style={styles.reset} onPress={() => {setGrades({quiz:['','','',''],vize:['','','',''],writing:'',sunum:'',kanaat:'',odev:'',final:'',butunleme:''}); setResults(null); setTargetNote(null);}}><Text style={styles.calcT}>Sıfırla</Text></TouchableOpacity>
        </View>

        {results && (
          <View style={[styles.res, { borderTopColor: results.renk }]}>
            <Text style={[styles.resSt, { color: results.renk }]}>{results.durum}</Text>
            <Text style={styles.resN}>Ort: {results.ortalama}</Text>
            {advice !== '' && <Text style={styles.advice}>{advice}</Text>}
            <TouchableOpacity style={styles.waBtn} onPress={shareOnWhatsApp}><Text style={styles.waBtnT}>WhatsApp'ta Paylaş</Text></TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}><Text style={styles.footerT}>Created by Alparslan Soyak</Text></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { padding: 16 },
  header: { alignItems: 'center', marginVertical: 20 },
  title: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: '#c084fc', fontSize: 14 },
  section: { backgroundColor: '#1e293b', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  label: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginBottom: 8, opacity: 0.7 },
  row: { flexDirection: 'row', gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  item: { width: '23%' },
  half: { width: '48%' },
  iL: { color: '#94a3b8', fontSize: 9, marginBottom: 2 },
  input: { backgroundColor: '#0f172a', borderRadius: 6, padding: 8, color: '#fff', borderWidth: 1, borderColor: '#334155', fontSize: 12 },
  btn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#334155', alignItems: 'center' },
  btnActive: { backgroundColor: '#a855f7' },
  btnT: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  calc: { flex: 2, backgroundColor: '#a855f7', padding: 12, borderRadius: 10, alignItems: 'center' },
  reset: { flex: 1, backgroundColor: '#334155', padding: 12, borderRadius: 10, alignItems: 'center' },
  calcT: { color: '#fff', fontWeight: 'bold' },
  res: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, borderTopWidth: 3, marginTop: 10 },
  resSt: { fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  resN: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  advice: { color: '#94a3b8', fontSize: 12, marginTop: 5, fontStyle: 'italic' },
  waBtn: { backgroundColor: '#25D366', marginTop: 15, padding: 10, borderRadius: 8, alignItems: 'center' },
  waBtnT: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  footer: { alignItems: 'center', marginTop: 20, paddingBottom: 20 },
  footerT: { color: '#475569', fontSize: 10 },
  flex: { flex: 1 }
});
