import React, { useState, useEffect } from 'react';
import {
  View, TextInput, Text, ActivityIndicator, TouchableOpacity,
  Image, KeyboardAvoidingView, Platform, ScrollView, Animated, Easing, Modal, Alert,StyleSheet
} from 'react-native';
import { StatusBar } from 'react-native';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';

interface Props {
  setIsLoggedIn: (val: boolean) => void;
}

const PhoneAuthScreen: React.FC<Props> = ({ setIsLoggedIn }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirm, setConfirm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resendTimeout, setResendTimeout] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [regModalVisible, setRegModalVisible] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimeout > 0) {
      timer = setInterval(() => {
        setResendTimeout(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimeout]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: message ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [message]);

  // FCM permission request
  useEffect(() => {
    messaging()
      .requestPermission()
      .then(authStatus => {
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('FCM permission granted');
        }
      })
      .catch(error => {
        console.log('FCM permission error:', error);
      });
  }, []);

  const onChangePhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
  };

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 4000);
  };

  const startResendTimer = () => {
    setResendTimeout(30);
  };

  const handleSendCode = async () => {
    if (phone.length !== 10) {
      showMessage('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setLoading(true);
      const deviceId = await DeviceInfo.getUniqueId();

      const checkRes = await fetch('https://www.giberode.com/giberode_app/check_device_id.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `phone=${phone}&device_id=${deviceId}`,
      });
      const result = await checkRes.json();

      if (result.status === 'blocked') {
        if (result.message === 'Already logged in on another device') {
          Alert.alert(
            'Your Account Already logged in ',
            'Do you want to Logout device?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Yes, Clear',
                onPress: async () => {
                  await fetch('https://www.giberode.com/giberode_app/cleardevice_id.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone }),
                  });
                  showMessage('Previous device logged out. Please try again.');
                },
              },
            ]
          );
        } else {
          showMessage(result.message);
        }
        return;
      }

      const userRes = await fetch('https://www.giberode.com/giberode_app/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const userData = await userRes.json();

      if (userData.status === 'error') {
        showMessage('Not registered. Contact GiB admin.');
        return;
      }

      const confirmation = await auth().signInWithPhoneNumber('+91' + phone);
      setConfirm(confirmation);
      showMessage('OTP sent to your phone');
      startResendTimer();
    } catch (error: any) {
      showMessage(error.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

const handleConfirmCode = async () => {
  if (!confirm) {
    showMessage('Session expired. Request a new OTP.');
    return;
  }
  if (code.length < 6) {
    showMessage('Enter a valid 6-digit OTP');
    return;
  }

  try {
    setLoading(true);
    await confirm.confirm(code);

    const response = await fetch('https://www.giberode.com/giberode_app/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    const data = await response.json();

    if (data?.user) {
      const { name, phone: savedPhone, profile_image, role } = data.user;

      if (savedPhone === phone) {
        const deviceId = await DeviceInfo.getUniqueId();
        await AsyncStorage.setItem('device_id', deviceId);

        await fetch('https://www.giberode.com/giberode_app/update_device_id.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `phone=${phone}&device_id=${deviceId}`,
        });

        await AsyncStorage.multiSet([
          ['name', name],
          ['phone', savedPhone],
          ['profile_image', profile_image || ''],
          ['role', role],
        ]);

        try {
          const fcmToken = await messaging().getToken();
          console.log('FCM Token:', fcmToken);

          // Send FCM token to server
          await fetch('https://www.giberode.com/giberode_app/update_fcmtoken.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `phone=${phone}&fcm_token=${fcmToken}`,
          });

        } catch (tokenError) {
          console.log('FCM token error:', tokenError);
        }

        setIsLoggedIn(true);
        navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
      } else {
        await auth().signOut();
        showMessage('Phone mismatch.');
        resetAuthState();
      }
    } else {
      showMessage('Unexpected server response.');
      resetAuthState();
    }
  } catch (error: any) {
    showMessage(error.message || 'Invalid OTP');
  } finally {
    setLoading(false);
  }
};


  const resetAuthState = () => {
    setConfirm(null);
    setCode('');
  };

  const handleChangePhone = () => {
    resetAuthState();
    setPhone('');
  };

  const handleRegister = async () => {
    if (!regName || !regPhone || !regEmail) {
      Alert.alert('All fields are required');
      return;
    }

    try {
      const response = await fetch('https://www.giberode.com/giberode_app/registrationNonExce.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `name=${encodeURIComponent(regName)}&phone=${encodeURIComponent(regPhone)}&email=${encodeURIComponent(regEmail)}`,
      });

      const json = await response.json();
      if (json.success) {
        Alert.alert('Registered successfully!');
        setRegModalVisible(false);
        setRegName('');
        setRegPhone('');
        setRegEmail('');
      } else {
        Alert.alert(json.message || 'Registration failed.');
      }
    } catch (error: any) {
      Alert.alert('Error: ' + error.message);
    }
  };

   return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Image source={require('../assets/logooffical.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Gounders in Business</Text>
          </View>

          <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
            {message && <Text style={styles.message}>{message}</Text>}
          </Animated.View>

          {!confirm ? (
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Icon name="phone" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={onChangePhone}
                  keyboardType="phone-pad"
                  style={styles.input}
                  maxLength={10}
                />
              </View>
              <TouchableOpacity style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={handleSendCode} disabled={loading}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={() => setRegModalVisible(true)}>
                <Text style={styles.secondaryButtonText}>Non GiB Member - Need To register ?</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#999"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  style={styles.input}
                  maxLength={6}
                />
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={handleConfirmCode}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleChangePhone} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Change Phone Number</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

    <Modal
  visible={regModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setRegModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Register</Text>
      <TextInput
        style={styles.input1}
        placeholder="Name"
         placeholderTextColor="#888"
        value={regName}
        onChangeText={setRegName}
      />
      <TextInput
        style={styles.input1}
        placeholder="Phone"
         placeholderTextColor="#888"
        keyboardType="phone-pad"
        value={regPhone}
        onChangeText={setRegPhone}
      />
      <TextInput
        style={styles.input1}
        placeholder="Email"
         placeholderTextColor="#888"
        keyboardType="email-address"
        value={regEmail}
        onChangeText={setRegEmail}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText1}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#aaa', marginTop: 10 }]}
        onPress={() => setRegModalVisible(false)}
      >
        <Text style={styles.buttonText1}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </>
  );
};

export default PhoneAuthScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    height: 100,
    width: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 10,
  },
  formContainer: {
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },
  primaryButton: {
    backgroundColor: 'green',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1e90ff',
    fontSize: 14,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor:'#6cd831',
    padding:10,
  
  },
  message: {
    color: '#fff',
    fontSize: 14,
  },
   modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 10, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  input1: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: 'green',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText1: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
