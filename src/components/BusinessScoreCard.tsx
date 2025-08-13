import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

const BusinessScoreCard: React.FC = () => {
  const [businessAmount, setBusinessAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  interface ApiResponse {
    status: string;
    total_business_amount: number;
    [key: string]: any;
  }

  const fetchBusinessAmount = () => {
    fetch('https://www.giberode.com/giberode_app/thanksnoteservealldata.php')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data: ApiResponse) => {
        if (data.status === 'success') {
          setBusinessAmount(data.total_business_amount);
          setError('');
        } else {
          setError('Invalid response from server');
        }
      })
      .catch((err: Error) => {
        setError(`Error fetching data: ${err.message}`);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBusinessAmount(); // initial fetch

    const interval = setInterval(() => {
      fetchBusinessAmount(); // fetch every 5 seconds
    }, 5000);

    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <View style={styles.card}>
      {loading && businessAmount === null ? (
        <ActivityIndicator size="large" color="#00b894" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <Text style={styles.label}>Total Business</Text>
          <Text style={styles.amount}>₹ {Number(businessAmount).toLocaleString()}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(45, 1, 1, 0.62)',
    margin: 10,
    marginTop: 10,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#636e72',
    marginBottom: 5,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});

export default BusinessScoreCard;
