import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';

const Header: React.FC = () => {
  const navigation = useNavigation();

  return (
    <>
      {/* StatusBar setup */}
      <StatusBar
        barStyle="dark-content" // dark icons for light background
        backgroundColor="#ffffff" // Android only: status bar background color
        translucent={false} // status bar does not overlay content
      />

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/icon.png')} style={styles.logo} />
          <Text style={styles.title}>Gounders In Business</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Text style={styles.hamburger}>☰</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 10,
    // height: Platform.OS === 'android' ? 80 + (StatusBar.currentHeight ?? 0) : 80,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android Shadow
    elevation: 5,

    borderBottomWidth: 1,
    borderBottomColor: '#fff',
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },

  hamburger: {
    fontSize: 28,
    color: 'green',
  },
});

export default Header;
