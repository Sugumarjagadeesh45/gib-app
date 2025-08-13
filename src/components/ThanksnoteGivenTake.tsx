import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThanksNoteScreen = () => {
  const [data, setData] = useState<{ total_given: number; total_taken: number } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // true for first fetch only

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchThanksNote = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);

        const phone = await AsyncStorage.getItem('phone');
        if (!phone) {
          setError('Phone number not found');
          return;
        }

        const response = await fetch(
          'https://www.giberode.com/giberode_app/thanksnotecalculationv2.php',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
          }
        );

        const result = await response.json();

        if (result.status === 'success') {
          setData({
            total_given: result.total_given,
            total_taken: result.total_taken,
          });
          setError('');
        } else {
          setError('No data found');
        }
      } catch (e) {
        setError('Failed to fetch data');
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    fetchThanksNote(true); // initial load with spinner

    interval = setInterval(() => fetchThanksNote(false), 3000); // background updates

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#098241" />}
      {!!error && <Text style={styles.error}>{error}</Text>}

      {data && !loading && (
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Total Given</Text>
              <Text style={styles.value}>₹ {data.total_given}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Total Taken</Text>
              <Text style={styles.value}>₹ {data.total_taken}</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ThanksNoteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#e6f5ec',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#098241',
    marginTop: 8,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
});
