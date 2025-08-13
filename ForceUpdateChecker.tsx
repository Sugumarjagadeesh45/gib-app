import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';

const ForceUpdateChecker = () => {
  const [forceUpdateRequired, setForceUpdateRequired] = useState(false);

  useEffect(() => {
    const checkForUpdate = async () => {
      try {
        const response = await fetch('https://www.giberode.com/giberode_app/app_version.php');
        const data = await response.json();

        const latestVersion = data.android_version; 
        const currentVersion = DeviceInfo.getVersion();

        console.log('Current:', currentVersion, '| Latest:', latestVersion);

        if (compareVersions(currentVersion, latestVersion) < 0) {
          setForceUpdateRequired(true);
        }
      } catch (err) {
        console.warn('Version check failed:', err);
      }
    };

    checkForUpdate();
  }, []);

  const compareVersions = (v1: string, v2: string): number => {
    const a = v1.split('.').map(Number);
    const b = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const diff = (a[i] || 0) - (b[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  };

  const openPlayStore = async () => {
    const url = 'https://play.google.com/store/apps/details?id=com.gib_unite.app';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Unable to open Play Store. Please update manually.');
    }
  };

  return (
    <Modal visible={forceUpdateRequired} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Update Required</Text>
          <Text style={styles.message}>
            A new version of the app is available. Please update to continue using the app.
          </Text>
          <TouchableOpacity onPress={openPlayStore} style={styles.updateBtn}>
            <Text style={styles.updateText}>Update Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 10,
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  updateBtn: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 6,
  },
  updateText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default ForceUpdateChecker;
