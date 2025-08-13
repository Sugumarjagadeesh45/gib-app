import React, { useEffect, useRef, useState } from 'react';
import {  View,  Text,  TouchableOpacity,  Modal,  StyleSheet,  SafeAreaView,  StatusBar,
  ActivityIndicator,  AppState,  Platform,
} from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { request, PERMISSIONS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
type QrScannerProps = {
  onClose: () => void;
};

const QrScanner: React.FC<QrScannerProps> = ({ onClose }) => {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [processing, setProcessing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showCamera, setShowCamera] = useState(true);
  const device = useCameraDevice('back');

  useEffect(() => {
    const requestCameraPermission = async () => {
      const status = await request(
        Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA
      );
      setHasPermission(status === 'granted');
    };

    requestCameraPermission();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        qrLock.current = false;
        setShowCamera(true);
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!processing && modalMessage) {
      const delay = Platform.OS === 'ios' ? 500 : 0;
      const timer = setTimeout(() => {
        setModalVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [processing, modalMessage]);

  const extractMeetingCode = (url: string) => {
    const match = url.match(/code=([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

const handleScannedData = async (data: string) => {
  try {
    setShowCamera(false);
    setProcessing(true);

    const phone = await AsyncStorage.getItem('phone');
    const name = await AsyncStorage.getItem('name');
    const profile_image = await AsyncStorage.getItem('profile_image');

    const meeting_code = extractMeetingCode(data);
    if (!meeting_code) throw new Error('Invalid QR code: meeting code missing.');

    // ✅ Get current date in YYYY-MM-DD format
    const current_date = new Date().toISOString().slice(0, 10);

    const formData = new FormData();
    formData.append('meeting_code', meeting_code);
    formData.append('name', name || '');
    formData.append('phone', phone || '');
    formData.append('profile_image', profile_image || '');
    formData.append('current_date', current_date); // ✅ Added system date

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://www.giberode.com/giberode_app/Insert_atten.php', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const result = await response.text();

    if (result.toLowerCase().includes('already') || result.toLowerCase().includes('exists')) {
      setModalMessage('⚠️ Attendance already marked.');
    } else if (result.toLowerCase().includes('success')) {
      setModalMessage('✅ Attendance marked successfully!');
    } else {
      setModalMessage('ℹ️ ' + result);
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      setModalMessage('⏰ Request timed out. Please try again.');
    } else {
      setModalMessage('❌ ' + error.message);
    }
  } finally {
    setProcessing(false);
  }
};

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0 && codes[0].value && !qrLock.current) {
        qrLock.current = true;
        handleScannedData(codes[0].value);
      }
    },
  });

  if (hasPermission === null || !device) {
    return (
      <View style={styles.centered}>
        <Text>Loading camera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text>No camera permission</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      {Platform.OS === 'android' && <StatusBar hidden />}

      {showCamera && device && (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
        />
      )}

   
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>

    
      <Modal transparent visible={processing} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.modalText}>⏳ Processing Attendance...</Text>
          </View>
        </View>
      </Modal>

   
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setModalMessage('');
                qrLock.current = false;
                onClose();
              }}
              style={styles.okButton}
            >
              <Text style={styles.okText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    backgroundColor: '#000000aa',
    borderRadius: 8,
  },
  closeText: {
    color: 'white',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000080',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  okButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  okText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default QrScanner;
