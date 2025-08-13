import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StoredData {
  [key: string]: string | null;
}

const StoredDataViewer: React.FC = () => {
  const [storedData, setStoredData] = useState<StoredData>({});

  useEffect(() => {
    const fetchStoredData = async () => {
      try {
        const keys = ['name', 'phone', 'profile_image', 'role', 'device_id'];
        const result = await AsyncStorage.multiGet(keys);

        const data: StoredData = {};
        result.forEach(([key, value]) => {
          data[key] = value;
        });

        setStoredData(data);
      } catch (error) {
        console.error('Failed to fetch data from AsyncStorage:', error);
      }
    };

    fetchStoredData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Stored AsyncStorage Data</Text>
      {Object.entries(storedData).map(([key, value]) => (
        <View key={key} style={styles.item}>
          <Text style={styles.key}>{key}</Text>
          <Text style={styles.value}>{value || 'Not Set'}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    marginBottom: 15,
  },
  key: {
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
});

export default StoredDataViewer;
