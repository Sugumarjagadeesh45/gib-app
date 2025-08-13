import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

const EventCalendar: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [markedDates, setMarkedDates] = useState({});

  const fetchEvents = async () => {
    try {
      const res = await axios.get<EventItem[]>('https://www.giberode.com/giberode_app/get_events.php');
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const handleDayPress = (day: { dateString: string }) => {
    const date = day.dateString;
    const event = events.find((e) => e.date === date);

    setSelectedDate(date);
    setSelectedEvent(event || null);
    setModalVisible(!!event);
  };

  // Delayed markedDates generation
  useEffect(() => {
    const timeout = setTimeout(() => {
      const marked: Record<string, any> = {};
      const today = new Date().toISOString().split('T')[0];

      events.forEach((event) => {
        marked[event.date] = {
          customStyles: {
            container: {
              backgroundColor: "green",
              borderRadius: 8,
            },
            text: {
              color: 'white',
              fontWeight: 'bold',
            },
          },
        };
      });

      if (selectedDate) {
        marked[selectedDate] = {
          ...(marked[selectedDate] || {}),
          customStyles: {
            container: {
              backgroundColor: "orange",
              borderRadius: 8,
            },
            text: {
              color: '#fff',
              fontWeight: 'bold',
            },
          },
        };
      }

      if (marked[today] && selectedDate !== today) {
        marked[today].customStyles.container.backgroundColor = '#34a853';
      } else if (!marked[today]) {
        marked[today] = {
          customStyles: {
            container: {
              backgroundColor: "orange",
              borderRadius: 8,
            },
            text: {
              color: '#fff',
              fontWeight: 'bold',
            },
          },
        };
      }

      setMarkedDates(marked);
    }, 50); // 50ms delay to allow calendar to show first

    return () => clearTimeout(timeout);
  }, [events, selectedDate]);

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markingType={'custom'}
        markedDates={markedDates}
        enableSwipeMonths
        theme={{
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textMonthFontSize: 20,
          textSectionTitleColor: 'green',
          monthTextColor: '#333',
          arrowColor: 'green',
        }}
        style={styles.calendar}
      />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalDate}>{selectedDate}</Text>
            <Text style={styles.modalTitle}>{selectedEvent?.title || 'No Title'}</Text>
            <Text style={styles.modalDesc}>{selectedEvent?.description || 'No Description'}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#f5f7fb',
    flex: 1,
  },
  calendar: {
    borderRadius: 16,
    elevation: 3,
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20,
  },
  modalDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'green',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    backgroundColor: 'green',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default EventCalendar;
