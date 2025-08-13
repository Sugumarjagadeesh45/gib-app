import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing
} from 'react-native';
import { StatusBar } from 'react-native';

import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

  // Animation for message display
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: message ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [message]);

  const onChangePhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
  };

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 4000);
  };

  const startResendTimer = () => {
    let time = 30;
    setResendTimeout(time);
    
    const timer = setInterval(() => {
      time -= 1;
      setResendTimeout(time);
      
      if (time <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  };

  const handleSendCode = async () => {
    if (phone.length !== 10) {
      showMessage('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setLoading(true);
      setCode(''); // Clear any previous OTP

      const response = await fetch('https://www.giberode.com/giberode_app/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.status === 'error' && data.message === 'User not found') {
        showMessage('You are not a registered member. Please contact GiB administration.');
        return;
      }

      const confirmation = await auth().signInWithPhoneNumber('+91' + phone);
      setConfirm(confirmation);
      showMessage('OTP sent to your phone');
      startResendTimer();
    } catch (error: any) {
      showMessage(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!confirm) {
      showMessage('Session expired. Please request a new OTP.');
      return;
    }

    if (code.length < 6) {
      showMessage('Please enter a valid 6-digit OTP');
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
        const { name, phone: savedPhone, profile_image } = data.user;

        if (savedPhone === phone) {
          await AsyncStorage.multiSet([
            ['name', name],
            ['phone', savedPhone],
            ['profile_image', profile_image || ''],
          ]);

          setIsLoggedIn(true);
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainApp' }],
          });
        } else {
          await auth().signOut();
          showMessage('Phone number does not match our records.');
          resetAuthState();
        }
      } else {
        showMessage('Unexpected server response.');
        resetAuthState();
      }
    } catch (error: any) {
      showMessage(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAuthState = () => {
    setConfirm(null);
    setCode('');
  };

  const handleResendOTP = () => {
    if (resendTimeout > 0) return;
    handleSendCode();
  };

  const handleChangePhone = () => {
    resetAuthState();
    setPhone('');
  };

  return (
    <>
     <StatusBar
            barStyle="dark-content" // dark icons for light background
            backgroundColor="#ffffff" // Android only: status bar background color
            translucent={false} // status bar does not overlay content
          />
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.header}>
          <Image 
            source={require('../assets/officallogo.png')} // Update with your logo path
            style={styles.logo} 
            resizeMode="contain"
          />
           <Text style={styles.title}>Gounders in Business</Text>
         
          {/* <Text style={styles.subtitle}>  உறவுகளை வளர்போம்!{'\n'}கலாச்சாரத்தை மீட்டெடுப்போம்!!</Text> */}
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
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
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
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleConfirmCode}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            <View style={styles.secondaryActions}>
              {/* <TouchableOpacity 
                onPress={handleResendOTP} 
                disabled={resendTimeout > 0}
                style={styles.secondaryButton}
              >
                <Text style={[styles.secondaryButtonText, resendTimeout > 0 && styles.disabledText]}>
                  {resendTimeout > 0 ? `Resend OTP in ${resendTimeout}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity> */}

              <TouchableOpacity 
                onPress={handleChangePhone}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Change Phone Number</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>




{/* <Image 
  source={require('../assets/icon.png')}
  style={{
    width: 120,           // adjust width
    height: 120,
             // adjust height
    resizeMode: 'contain',
    alignSelf: 'center',  // centers the image horizontally
  }}
/> */}



    </KeyboardAvoidingView>

    </>
  );
};

const styles = StyleSheet.create({
  KeyboardAvoidingView:{
backgroundColor: 'white',
  },
  
container: {

  flex: 1,
  justifyContent: 'center', 
  paddingHorizontal: 24,
  paddingTop: 40,
  paddingBottom: 24,
  // backgroundColor: '#f8f9fa',
},

  header: {
    alignItems: 'center',
   
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom:50, 
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#2c3e50',
  },
  primaryButton: {
    backgroundColor: 'green',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  secondaryActions: {
    marginTop: 8,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledText: {
    color: '#95a5a6',
  },
  messageContainer: {
    marginBottom: 20,
  },
  message: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    padding: 12,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default PhoneAuthScreen;