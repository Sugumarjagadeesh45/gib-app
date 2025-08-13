import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThanksNoteScreen = () => {
  const [data, setData] = useState<{ total_given: number; total_taken: number } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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

    fetchThanksNote(true);
    interval = setInterval(() => fetchThanksNote(false), 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#098241" />}
      {!!error && <Text style={styles.error}>{error}</Text>}

      {data && !loading && (
        <View style={styles.card}>
          <Text style={styles.heading}>Thanks Score Summary</Text>
          <View style={styles.row}>
            <View style={styles.block}>
              <Text style={styles.label}>Total Given</Text>
              <Text style={styles.value}>₹ {data.total_given}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.block}>
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
  justifyContent: 'center',
  paddingHorizontal: 10,
  backgroundColor: '#F6F8FA',
      
},

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
      borderColor: 'grey',     
  borderWidth: 0.5,   
},
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#098241',
    textAlign: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  block: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 10,
  },
  label: {
     fontSize: 15,
    fontWeight: '600',
    color: '#636e72',
    marginBottom: 5,
  },
  value: {
   fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 12,
  },
});
