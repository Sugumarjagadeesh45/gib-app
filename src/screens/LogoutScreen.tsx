import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { navigationRef } from '../navigation/NavigationService';

const LogoutScreen: React.FC = () => {
  const handleLogout = async (): Promise<void> => {
    try {
      
      await auth().signOut();

      await AsyncStorage.clear();

      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Login' as never }],
      });
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Image source={require('../assets/icon.png')} style={styles.logo} />
          <Text style={styles.welcomeText}>Gounders In Business</Text>
          <Text style={styles.tagline}>
            உறவுகளை வளர்போம்!{'\n'}கலாச்சாரத்தை மீட்டெடுப்போம்!!
          </Text>
        </View>

        <Text style={styles.title}>Log Out</Text>
        <Text style={styles.message}>Are you sure you want to log out?</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => navigationRef.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LogoutScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4E9F3D',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    color: '#555',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    marginHorizontal: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#d9534f',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
