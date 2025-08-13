import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const FetchScore: React.FC = () => {
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true); // true only for first load

  const fetchScore = async (isInitial = false): Promise<void> => {
    try {
      if (isInitial) setLoading(true);

      const phone = await AsyncStorage.getItem('phone');
      if (!phone) {
        if (isInitial) setLoading(false);
        return;
      }

      const response = await fetch('https://www.giberode.com/giberode_app/get_user_score.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.status && data.profile_score_percentage) {
        setScore(parseInt(data.profile_score_percentage, 10));
      } else {
        setScore(0);
      }
    } catch (err) {
      console.error('Fetch score error:', err);
      setScore(0);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchScore(true); // trigger full loading only on focus
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      fetchScore(false); // refresh silently
    }, 300000); // 5 mins

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4E9F3D" />
      ) : (
        <View style={styles.circleContainer}>
          <Text style={styles.scoreText}>{score}%</Text>
          <Text style={styles.label}>Profile Score</Text>
        </View>
      )}
    </View>
  );
};

export default FetchScore;


const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 10,
    borderColor: '#4E9F3D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
