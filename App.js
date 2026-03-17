import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, TextInput, StyleSheet, Dimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function App() {
  // MUTLAK ÇEVİRİ ENGELLEME PROTOKOLÜ
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.documentElement.lang = 'tr';
      const meta = document.createElement('meta');
      meta.name = 'google';
      meta.content = 'notranslate';
      document.head.appendChild(meta);
    }
  }, []);

  const [selectedCourse, setSelectedCourse] = useState('A');
  const [grades, setGrades] = useState({
    quiz: ['', '', '', ''],
    vize: ['', '', '', ''],
    writing: '',
    sunum: '',
    kanaat: '',
    odev: '',
    final: '',
    butunleme: '',
  });

  const [results, setResults] = useState(null);

  const calculateGrade = () => {
    const quizValues = grades.quiz.map(v => parseFloat(v) || 0);
    const vizeValues = grades.vize.map(v => parseFloat(v) || 0);
    
    const quizTotal = quizValues.reduce((a, b) => a + b, 0) / 4;
    const quizPoints = (quizTotal / 100) * 20;

    const vizeTotal = vizeValues.reduce((a, b) => a + b, 0) / 4;
    const vizePoints = (vizeTotal / 100) * 60;

    const writingPoints = (parseFloat(grades.writing) || 0) / 100 * 5;
    const sunumPoints = (parseFloat(grades.sunum) || 0) / 100 * 5;
    const kanaatPoints = (parseFloat(grades.kanaat) || 0) / 100 * 5;
    const odevPoints = (parseFloat(grades.odev) || 0) / 100 * 5;

    const ortalama = quizPoints + vizePoints + writingPoints + sunumPoints + kanaatPoints + odevPoints;

    const minForPass = selectedCourse === 'A' ? 85 : selectedCourse === 'B' ? 80 : 75;

    let finalResult = {};

    if (ortalama >= minForPass) {
      finalResult = {
        ortalama: ortalama.toFixed(2),
        durum: 'Ortalama ile Geçtiniz ✓',
        renkClass: 'success',
        detay: `Ortalamanız ${ortalama.toFixed(2)} puan ile ${minForPass} puan ve üzerindedir.`,
      };
    } else {
      if (!grades.final) {
        // GÜNCELLENEN KISIM: Sarı uyarı yerine Kırmızı "Finale Kaldınız" durumu
        finalResult = {
          ortalama: ortalama.toFixed(2),
          durum: 'Finale Kaldınız',
          renkClass: 'danger',
          detay: `Ortalamanız ${ortalama.toFixed(2)} puandır. Final notunu girin.`,
        };
        setResults(finalResult);
        return;
      }

      const finalScore = (parseFloat(grades.final) * 0.6 + ortalama * 0.4).toFixed(2);

      if (finalScore >= 65) {
        finalResult = {
          ortalama: ortalama.toFixed(2),
          finalNotu: grades.final,
          finalHesap: finalScore,
          durum: 'Final ile Geçtiniz ✓',
          renkClass: 'success',
          detay: `Final (%60) + Ortalama (%40) = ${finalScore} puan`,
        };
      } else {
        if (!grades.butunleme) {
          finalResult = {
            ortalama: ortalama.toFixed(2),
            finalNotu: grades.final,
            finalHesap: finalScore,
            durum: 'Bütünlemeye Kaldınız',
            renkClass: 'danger',
            detay: `Final notunuz ${finalScore} puandır. Bütünleme notunu girin.`,
          };
          setResults(finalResult);
          return;
        }

        const butunlemeScore = (parseFloat(grades.butunleme) * 0.6 + ortalama * 0.4).toFixed(2);

        if (butunlemeScore >= 65) {
          finalResult = {
            ortalama: ortalama.toFixed(2),
            finalNotu: grades.final,
            finalHesap: finalScore,
            butunlemeNotu: grades.butunleme,
            butunlemeHesap: butunlemeScore,
            durum: 'Bütünleme ile Geçtiniz ✓',
            renkClass: 'success',
            detay: `Bütünleme (%60) + Ortalama (%40) = ${butunlemeScore} puan`,
          };
        } else {
          finalResult = {
            ortalama: ortalama.toFixed(2),
            finalNotu: grades.final,
            finalHesap: finalScore,
            butunlemeNotu: grades.butunleme,
            butunlemeHesap: butunlemeScore,
            durum: 'Dersten Kaldınız ✗',
            renkClass: 'fail',
            detay: `Bütünleme notunuz ${butunlemeScore} puandır (65 altında).`,
          };
        }
      }
    }

    setResults(finalResult);
  };

  const handleInputChange = (field, index, value) => {
    const numValue = value === '' ? '' : Math.min(Math.max(parseFloat(value) || 0, 0), 100).toString();
    
    if (Array.isArray(grades[field])) {
      const newArray = [...grades[field]];
      newArray[index] = numValue;
      setGrades({ ...grades, [field]: newArray });
    } else {
      setGrades({ ...grades, [field]: numValue });
    }
  };

  const handleReset = () => {
    setGrades({
      quiz: ['', '', '', ''],
      vize: ['', '', '', ''],
      writing: '',
      sunum: '',
      kanaat: '',
      odev: '',
      final: '',
      butunleme: '',
    });
    setResults(null);
  };

  const getResultColor = () => {
    if (!results) return '#6b7280';
    if (results.renkClass === 'success') return '#10b981';
    if (results.renkClass === 'warning') return '#eab308';
    return '#ef4444'; // 'danger' ve 'fail' durumlarında Kırmızı renk üretir
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>YDY</Text>
          <Text style={styles.subtitle}>Not Hesaplama</Text>
        </View>

        {/* Course Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Kur Seçimi</Text>
          <View style={styles.courseButtons}>
            {['A', 'B', 'C'].map((kur) => (
              <TouchableOpacity
                key={kur}
                onPress={() => setSelectedCourse(kur)}
                style={[
                  styles.courseButton,
                  selectedCourse === kur && styles.courseButtonActive,
                ]}
              >
                <Text style={[
                  styles.courseButtonText,
                  selectedCourse === kur && styles.courseButtonTextActive,
                ]}>
                  {kur} KURU
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quiz Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quiz</Text>
          <View style={styles.gridContainer}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.inputItem}>
                <Text style={styles.inputLabel}>Quiz {i + 1}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholder="0-100"
                  placeholderTextColor="#9ca3af"
                  value={grades.quiz[i]}
                  onChangeText={(val) => handleInputChange('quiz', i, val)}
                  maxLength={3}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Vize Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Vize</Text>
          <View style={styles.gridContainer}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.inputItem}>
                <Text style={styles.inputLabel}>Vize {i + 1}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholder="0-100"
                  placeholderTextColor="#9ca3af"
                  value={grades.vize[i]}
                  onChangeText={(val) => handleInputChange('vize', i, val)}
                  maxLength={3}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Other Grades */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Diğer Notlar</Text>
          <View style={styles.gridContainer}>
            {[
              { key: 'writing', label: 'Writing' },
              { key: 'sunum', label: 'Sunum' },
              { key: 'kanaat', label: 'Kanaat Notu' },
              { key: 'odev', label: 'Online Ödev' },
            ].map((item) => (
              <View key={item.key} style={styles.halfGrid}>
                <View style={styles.inputItem}>
                  <Text style={styles.inputLabel}>{item.label}</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholder="0-100"
                    placeholderTextColor="#9ca3af"
                    value={grades[item.key]}
                    onChangeText={(val) => handleInputChange(item.key, null, val)}
                    maxLength={3}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Final & Bütünleme */}
        <View style={styles.twoColumnContainer}>
          <View style={[styles.section, styles.flex]}>
            <Text style={styles.sectionLabel}>Final</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="0-100"
              placeholderTextColor="#9ca3af"
              value={grades.final}
              onChangeText={(val) => handleInputChange('final', null, val)}
              maxLength={3}
            />
          </View>

          <View style={[styles.section, styles.flex]}>
            <Text style={styles.sectionLabel}>Bütünleme</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="0-100"
              placeholderTextColor="#9ca3af"
              value={grades.butunleme}
              onChangeText={(val) => handleInputChange('butunleme', null, val)}
              maxLength={3}
            />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.calculateButton} onPress={calculateGrade}>
            <Text style={styles.calculateButtonText}>Hesapla</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Sıfırla</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {results && (
          <View style={[styles.resultsContainer, { borderTopColor: getResultColor() }]}>
            <View style={[styles.resultStatus, { backgroundColor: getResultColor() + '20' }]}>
              <Text style={[styles.resultStatusText, { color: getResultColor() }]}>
                {results.durum}
              </Text>
            </View>

            <View style={styles.resultValue}>
              <Text style={styles.resultLabel}>Ortalaması</Text>
              <Text style={styles.resultNumber}>{results.ortalama}</Text>
            </View>

            {results.finalNotu && (
              <View style={styles.resultValue}>
                <Text style={styles.resultLabel}>Final Notu</Text>
                <Text style={styles.resultNumber}>{results.finalNotu}</Text>
                <Text style={styles.resultSmall}>Hesap: {results.finalHesap}</Text>
              </View>
            )}

            {results.butunlemeNotu && (
              <View style={styles.resultValue}>
                <Text style={styles.resultLabel}>Bütünleme Notu</Text>
                <Text style={styles.resultNumber}>{results.butunlemeNotu}</Text>
                <Text style={styles.resultSmall}>Hesap: {results.butunlemeHesap}</Text>
              </View>
            )}

            <Text style={styles.resultDetail}>{results.detay}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Created by Alparslan Soyak</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#c084fc',
    marginTop: 8,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  courseButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  courseButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  courseButtonActive: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
  },
  courseButtonText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 'bold',
    fontSize: 12,
  },
  courseButtonTextActive: {
    color: '#ffffff',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  halfGrid: {
    width: '48%',
  },
  inputItem: {
    flex: 1,
    minWidth: '23%',
  },
  inputLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  twoColumnContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  calculateButton: {
    flex: 1,
    backgroundColor: '#a855f7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resetButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderTopWidth: 2,
    borderTopColor: '#10b981',
    marginVertical: 16,
  },
  resultStatus: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  resultStatusText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  resultValue: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
  resultNumber: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultSmall: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    marginTop: 4,
  },
  resultDetail: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 20,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
  },
});
                
