// /**
//  * @format
//  */
// import 'react-native-gesture-handler';
// import {AppRegistry} from 'react-native';
// import App from './App';
// import {name as appName} from './app.json';

// AppRegistry.registerComponent(appName, () => App);


/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// ✅ Handle messages in background/quit state
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('FCM Background Message:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
