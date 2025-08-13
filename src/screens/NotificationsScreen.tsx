import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Modal, ImageBackground, TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QrScanner from '../components/QrScanner';
import Icon from 'react-native-vector-icons/Ionicons';
import { Alert } from 'react-native';

const Meeting = () => {
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(8).fill(''));
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<any>(null);
  const [pastMeetings, setPastMeetings] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'KG-Meet' | 'Other Meet'>('KG-Meet');
  const inputsRef = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    (async () => {
      const phone = await AsyncStorage.getItem('phone');
      if (phone) {
        fetchAttendanceStatus(phone);
        intervalId = setInterval(() => fetchAttendanceStatus(phone), 3000);
      }
    })();

    return () => clearInterval(intervalId);
  }, []);

  const fetchAttendanceStatus = async (phone: string) => {
    try {
      const res = await fetch(`https://www.giberode.com/giberode_app/attendance_report.php?phone=${phone}`);
      const data = await res.json();
      setAttendanceStatus(data);
      if (Array.isArray(data.attended_meetings)) {
        setPastMeetings(data.attended_meetings);
      } else {
        setPastMeetings([]);
      }
    } catch (error) {
      console.log('Fetch attendance status error:', error);
    }
  };

  const handleChangeText = (text: string, index: number) => {
    const char = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const updated = [...codeDigits];
    updated[index] = char.slice(-1);
    setCodeDigits(updated);

    if (char && index < 7) {
      inputsRef.current[index + 1]?.focus();
    }

    if (updated.every(d => d !== '')) {
      submitCode(updated.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !codeDigits[index] && index > 0) {
      const updated = [...codeDigits];
      updated[index - 1] = '';
      setCodeDigits(updated);
      inputsRef.current[index - 1]?.focus();
    }
  };

 const submitCode = async (code: string) => {
  if (attendanceStatus?.attendance_status === 'Not Eligible') {
    showModal('❌ You have reached your meeting limit.');
    return;
  }

  try {
    const name = await AsyncStorage.getItem('name');
    const phone = await AsyncStorage.getItem('phone');
    const profile_image = await AsyncStorage.getItem('profile_image');


   const currentDate = new Date().toISOString().split('T')[0]; 


console.log("Current Date", currentDate);


    // const currentDate = "2025-06-30";
    const formData = new FormData();
    formData.append('meeting_code', code);
    formData.append('name', name || '');
    formData.append('phone', phone || '');
    formData.append('profile_image', profile_image || '');
    formData.append('current_date', currentDate); 

    const response = await fetch('https://www.giberode.com/giberode_app/Insert_atten.php', {
      method: 'POST',
      body: formData,
    });

    const text = await response.text();
    const json = text.match(/{.*}/s);
    if (json) {
      const result = JSON.parse(json[0]);
      if (result.message?.includes('✅')) {
        showModal(result.message);
        if (phone) fetchAttendanceStatus(phone);
      } else {
        showModal(`❌ ${result.message || 'Something went wrong'}`);
      }
    } else {
      showModal('❌ Unexpected server response.');
    }
  } catch (error: any) {
    showModal(`⚠️ Error: ${error.message}`);
  }

  setCodeDigits(Array(8).fill(''));
  inputsRef.current[0]?.focus();
};


  const showModal = (msg: string) => {
    setModalMessage(msg);
    setModalVisible(true);
  };

  const handleOpenScanner = () => {
    setScannerActive(true);
  };

  const kgMeetings = pastMeetings.filter(m => m.meeting_type === 'KG-Meet');
  const otherMeetings = pastMeetings.filter(m => m.meeting_type !== 'KG-Meet');

  if (scannerActive) return <QrScanner onClose={() => setScannerActive(false)} />;

  return (
    <ImageBackground source={require('../assets/bg.png')} style={{ flex: 1 }} resizeMode="cover">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
          {attendanceStatus && (
            <View style={styles.statsBox}>
        <Text style={styles.statsText}>🤝 KG Meeting  |  📌Required:  {attendanceStatus.required_meetings || 0}  |  ✅Attended: {attendanceStatus.attended_count || 0}</Text>

            </View>
          )}

       {attendanceStatus && (
  <View style={styles.statsBox}>
    <Text style={styles.statsText}>
      🤝 Other Meetings | 📌Conducted: {attendanceStatus.other_meet_total || 0} | ✅Attended: {attendanceStatus.other_meet_attended || 0}
    </Text>
  </View>
)}


          <View style={styles.scancard}>
            <TouchableOpacity
              style={[styles.button, styles.qrButton]}
              onPress={handleOpenScanner}
            >
              <Icon name="camera-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Past Meetings</Text>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, selectedTab === 'KG-Meet' && styles.tabButtonActive]}
                onPress={() => setSelectedTab('KG-Meet')}
              >
                <Text style={[styles.tabText, selectedTab === 'KG-Meet' && styles.tabTextActive]}>KG Meeting</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, selectedTab === 'Other Meet' && styles.tabButtonActive]}
                onPress={() => setSelectedTab('Other Meet')}
              >
                <Text style={[styles.tabText, selectedTab === 'Other Meet' && styles.tabTextActive]}>Other Meeting</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollArea} nestedScrollEnabled>
              {(selectedTab === 'KG-Meet' ? kgMeetings : otherMeetings).map((item, index) => (
                <View key={index} style={styles.meetingCard}>
                  <Text style={styles.meetingTitle}>{item.title}</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.icon}>📝</Text>
                    <Text style={styles.detailText}>{item.description}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.icon}>🔑</Text>
                    <Text style={styles.detailText}>Code: {item.meeting_code}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.icon}>📅</Text>
                    <Text style={styles.detailText}>Date: {item.meeting_date}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>

      <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  scrollArea: { maxHeight: 350, marginTop: 10 },
  container: { flex: 1, padding: 10 },
  scancard: {
    marginTop: 10,
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderRadius: 12,
    borderColor: '#fff',
    borderWidth: 0.5,
  },
  card: {
    marginTop: 20,
    margin: 5,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  emptyText: { textAlign: 'center', color: '#aaa', paddingVertical: 20 },
  meetingCard: {
    backgroundColor: '#fff', padding: 14, marginBottom: 12, borderRadius: 10,
    shadowColor: '#ccc', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
  },
  meetingTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  icon: { marginRight: 6, fontSize: 16 },
  detailText: { fontSize: 14, color: '#555', flexShrink: 1 },
  button: { padding: 10, borderRadius: 8, alignItems: 'center' },
  qrButton: { backgroundColor: 'green', padding: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
statsBox: {
  backgroundColor: '#fff',
  padding: 10,
  borderRadius: 10,
  alignItems: 'center', 
  justifyContent: 'center',
  marginBottom: 10,
},

statsText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
  textAlign: 'center',
},

  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center',
  },
  modalText: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
  modalButton: {
    backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8,
  },
  modalButtonText: { color: '#fff', fontWeight: 'bold' },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#ccc',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'green',
  },
  tabText: {
    fontWeight: 'bold',
    color: '#333',
  },
  tabTextActive: {
    color: '#fff',
  },
});

export default Meeting;
