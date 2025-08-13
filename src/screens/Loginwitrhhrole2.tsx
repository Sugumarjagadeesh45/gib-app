import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PhoneAuthScreenProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean | null>>;
}

const PhoneAuthScreen: React.FC<PhoneAuthScreenProps> = ({ setIsLoggedIn }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirm, setConfirm] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setLoading(true);
      const deviceId = await DeviceInfo.getUniqueId();

      // Step 1: Check if device_id matches existing login in DB
      const checkRes = await fetch('https://www.giberode.com/giberode_app/check_device_id.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `phone=${phone}&device_id=${deviceId}`,
      });
      const result = await checkRes.json();

      if (result.status === 'blocked') {
        Alert.alert('Login Blocked', result.message);
        return;
      }

      const fullPhone = '+91' + phone;
      const confirmation = await auth().signInWithPhoneNumber(fullPhone);
      setConfirm(confirmation);
      Alert.alert('OTP Sent', 'Please check your SMS for the verification code.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirm || code.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      await confirm.confirm(code);

      const deviceId = await DeviceInfo.getUniqueId();

      // Step 2: Update DB with the new device_id
      await fetch('https://www.giberode.com/giberode_app/update_device_id.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `phone=${phone}&device_id=${deviceId}`,
      });

      await AsyncStorage.setItem('phone', phone);
      setIsLoggedIn(true);
      Alert.alert('Success', 'Login successful!');
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Login with Phone</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter phone number"
        keyboardType="numeric"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
      />

      {confirm && (
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          keyboardType="numeric"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#4E9F3D" />
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={confirm ? handleVerifyCode : handleSendCode}
        >
          <Text style={styles.buttonText}>
            {confirm ? 'Verify Code' : 'Send OTP'}
          </Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

export default PhoneAuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    color: '#4E9F3D',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4E9F3D',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
