import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

export const requestUserPermissionAndUpdateToken = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Push notification permission granted.');
    await sendFcmTokenToBackend();
  } else {
    Alert.alert('Permission denied', 'Push notifications are disabled.');
  }
};

const getPhoneFromStorage = async (): Promise<string | null> => {
  try {
    const phone = await AsyncStorage.getItem('phone');
    return phone;
  } catch (error) {
    console.error('Failed to get phone from AsyncStorage:', error);
    return null;
  }
};

export const sendFcmTokenToBackend = async () => {
  try {
    const phone = await getPhoneFromStorage();
    const fcmToken = await messaging().getToken();

    if (!phone || !fcmToken) {
      console.warn('Missing phone or FCM token.');
      return;
    }

    console.log('Sending FCM token to server:', fcmToken);

    const response = await fetch('https://www.giberode.com/giberode_app/update_fcmtoken.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phone,
        fcm_token: fcmToken,
      }),
    });

    const result = await response.json();
    console.log('FCM token update result:', result);
  } catch (error) {
    console.error('Error sending FCM token to backend:', error);
  }
};
