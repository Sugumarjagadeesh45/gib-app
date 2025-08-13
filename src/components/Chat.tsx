import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface BlogItem {
  id: string;
  title: string;
  category: string;
  created_at: string;
  content: string;
  image: string;
}

const HomeScreen: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogItem[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageUri, setModalImageUri] = useState('');

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('https://www.giberode.com/giberode_app/blogapi.php');
      const data: BlogItem[] = await res.json();
      const sorted = data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setBlogs(sorted);
      setFilteredBlogs(sorted);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBlogs();
      const interval = setInterval(() => {
        fetchBlogs();
      }, 12000);
      return () => clearInterval(interval);
    }, [fetchBlogs])
  );

  const handleSearch = (text: string) => {
    setSearchText(text);
    const filtered = blogs.filter((item) =>
      item.title.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredBlogs(filtered);
  };

  return (
    <View style={styles.container}>
    <TextInput
  style={styles.search}
  placeholder="Search News & Events..."
  placeholderTextColor="#888" 
  value={searchText}
  onChangeText={handleSearch}
/>


      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          {filteredBlogs.map((item) => {
            const isSelected = selectedBlogId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => setSelectedBlogId(isSelected ? null : item.id)}
              >
                <TouchableOpacity
                  onPress={() => {
                    setModalImageUri(item.image);
                    setModalVisible(true);
                  }}
                >
                  <Image source={{ uri: item.image }} style={styles.image} />
                </TouchableOpacity>

                <View style={styles.info}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.category}>{item.category}</Text>
                  {/* <Text style={styles.date}>{new Date(item.created_at).toDateString()}</Text> */}
                  {isSelected && (
                    <View style={styles.details}>
                      <Text style={styles.content}>{item.content}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Modal for Image View */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            <ScrollView
              style={styles.zoomContainer}
              maximumZoomScale={3}
              minimumZoomScale={1}
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
              horizontal={false}
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              <Image
                source={{ uri: modalImageUri }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 10, backgroundColor: '#f9f9f9' },
  search: {
    marginHorizontal: 15,
    marginBottom: 10,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
    padding: 10,
    flexDirection: 'row',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  category: {
    color: '#555',
    fontSize: 14,
  },
  date: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
  },
  details: {
    marginTop: 5,
  },
  content: {
    fontSize: 14,
    color: '#333',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  closeText: {
    fontSize: 35,
    color: '#fff',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  zoomContainer: {
    flex: 1,
  },
});

export default HomeScreen;
