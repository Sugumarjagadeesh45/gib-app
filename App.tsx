import React, { useEffect, useState, } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import Login from './src/screens/Login';
import RootNavigator from './src/navigation/RootNavigator';
import LogoutScreen from './src/screens/LogoutScreen';
import Splash from './src/screens/Splash';
import { navigationRef } from './src/navigation/NavigationService';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import ForceUpdateChecker from './ForceUpdateChecker';
import { ToastAndroid, Platform, Alert } from 'react-native';
import { PermissionsAndroid} from 'react-native';
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  MainApp: undefined;
  LogoutScreen: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const showSplashTimeout = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(showSplashTimeout);
  }, []); 
  useEffect(() => {
    const checkAppVersionAndLogin = async () => {
      try {
        const currentVersion = DeviceInfo.getVersion(); 
        const storedVersion = await AsyncStorage.getItem('APP_VERSION');

        if (storedVersion !== currentVersion) {
          await AsyncStorage.clear();
          await AsyncStorage.setItem('APP_VERSION', currentVersion);
          setIsLoggedIn(false);
          return;
        }

        const phone = await AsyncStorage.getItem('phone');
        setIsLoggedIn(!!phone);
      } catch (error) {
        console.error('Error during version/login check:', error);
        setIsLoggedIn(false);
      }
    };

    if (!showSplash) {
      checkAppVersionAndLogin();
    }
  }, [showSplash]);
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const phone = await AsyncStorage.getItem('phone');
        if (!phone) return;

        const response = await fetch('https://www.giberode.com/giberode_app/logoutdevice.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });

        const result = await response.json();
        console.log('Device Check Response:', result);

        if (result?.device_id === null) {
          ToastAndroid.show('Logged out due to Unauthorized Access', ToastAndroid.SHORT);

          await auth().signOut();
          await AsyncStorage.clear();
          setIsLoggedIn(false);

          navigationRef.reset({
            index: 0,
            routes: [{ name: 'Login' as never }],
          });
        }
      } catch (error) {
        console.error('Auto logout check failed:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);
useEffect(() => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('FCM Foreground Message:', remoteMessage);

    Alert.alert(
      remoteMessage.notification?.title || 'Notification',
      remoteMessage.notification?.body || ''
    );
  });

  return unsubscribe;
}, []);
  useEffect(() => {
  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission denied');
      } else {
        console.log('Notification permission granted');
      }
    }
  };

  requestNotificationPermission();
}, []);


  if (showSplash || isLoggedIn === null) {
    return <Splash />;
  }

  return (
    <>
    <ForceUpdateChecker />
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={isLoggedIn ? 'MainApp' : 'Login'}
      >
        <Stack.Screen name="Login">
          {(props) => <Login {...props} setIsLoggedIn={setIsLoggedIn} />}
        </Stack.Screen>
        <Stack.Screen name="MainApp" component={RootNavigator} />
        <Stack.Screen name="LogoutScreen" component={LogoutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </>
  );
};

export default App;
