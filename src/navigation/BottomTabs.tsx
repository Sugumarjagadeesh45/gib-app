import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import Doctorhome from '../screens/doctors/Doctorhome';
import DoctorsDirectory from '../screens/doctors/DoctorsDirectory';
import ExcecutiveDirectory from '../screens/doctors/ExcecutiveDirectory';
import DoctorProfile from '../screens/doctors/DoctorProfile';
import Nonhome from '../screens/nonexcecutive/Nonhome';
import MemberDic from '../screens/nonexcecutive/MemberDic';
// import NonProfileScreen from '../screens/nonexcecutive/NonProfileScreen';

import Header from '../components/Header';

const Tab = createBottomTabNavigator();

type CustomButtonProps = BottomTabBarButtonProps & {
  icon: string;
  label: string;
  isCenter?: boolean;
};

export default function BottomTabs() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const getRole = async () => {
      let storedRole = await AsyncStorage.getItem('role');
      console.log('Stored Role:', storedRole);
      if (storedRole === 'Doctors') storedRole = 'Doctor';
      setRole(storedRole);
    };
    getRole();
  }, []);

  if (!role) return null;

  if (!['Executive', 'Doctor', 'Non-Executive'].includes(role)) {
    return (
      <View style={styles.centered}>
        <Text>Invalid role: {role}</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        header: () => <Header />,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      {role === 'Executive' && (
        <>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarButton: (props) => <TabBarItem {...props} icon="home-outline" label="Home" />,
            }}
          />
             <Tab.Screen
            name="About"
            component={AboutScreen}
            options={{
              tabBarButton: (props) => <TabBarItem {...props} icon="people-outline" label="Directory" />,
            }}
          />
        
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarButton: (props) => <TabBarItem {...props} icon="receipt-outline" label="Thanks Note" isCenter />,
            }}
          />
       
          <Tab.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              tabBarButton: (props) => <TabBarItem {...props} icon="briefcase-outline" label="Meeting" />,
            }}
          />
            <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarButton: (props) => <TabBarItem {...props} icon="person-outline" label="Profile" />,
            }}
          />
        </>
      )}

      {role === 'Doctor' && (
        <>
          <Tab.Screen
            name="Doctorhome"
            component={Doctorhome}
            options={{
              tabBarButton: (props) => <TabBarItem {...props} icon="home-outline" label="Home" />,
            }}
          />
          <Tab.Screen
            name="Directory"
            component={DoctorsDirectory}
            options={{
              tabBarButton: (props) => <TabBarItem {...props} icon="pulse-outline" label="Directory" />,
            }}
          />
          <Tab.Screen
            name="Excecutive_Directory"
            component={ExcecutiveDirectory}
            options={{
              tabBarButton: (props) => <TabBarItem {...props} icon="ribbon-outline" label="Executives" />,
            }}
          />
          <Tab.Screen
            name="DoctorProfile"
            component={DoctorProfile}
            options={{
              tabBarButton: (props) => <TabBarItem {...props} icon="person-circle-outline" label="Profile" />,
            }}
          />
        </>
      )}

      {role === 'Non-Executive' && (
        <>
          <Tab.Screen
            name="Nonhome"
            component={Nonhome}
            options={{
              tabBarButton: (props) => <TabBarItem {...props} icon="home-outline" label="Home" />,
            }}
          />
          <Tab.Screen
            name="MemberDic"
            component={MemberDic}
            options={{
              tabBarButton: (props) => <TabBarItem {...props} icon="people-outline" label="Members" />,
            }}
          />
     
        </>
      )}
    </Tab.Navigator>
  );
}

function TabBarItem({
  onPress,
  accessibilityState,
  icon,
  label,
  isCenter,
}: CustomButtonProps) {
  const focused = accessibilityState?.selected;

  if (isCenter) {
    return (
      <TouchableOpacity
        style={styles.centerButtonWrapper}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.centerButton}>
          <Icon
            name={focused ? icon.replace('-outline', '') : icon}
            size={30}
            color="#fff"
          />
        </View>
        <Text style={[styles.centerLabel, { color: focused ? 'green' : '#666' }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon
        name={focused ? icon.replace('-outline', '') : icon}
        size={24}
        color={focused ? 'green' : '#666'}
      />
      <Text style={[styles.label, { color: focused ? 'green' : '#666' }]}>
        {label}
      </Text>
      {focused && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: Platform.OS === 'ios' ? 90 : 70,
    position: 'absolute',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 10,
    elevation: 10,
    paddingTop: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'green',
    marginTop: 4,
  },
  centerButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -20,
    flex: 1,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 10,
  },
  centerLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
