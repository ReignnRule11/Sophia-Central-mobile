import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const sampleResults = [
  { id: '1', title: 'Discrete Mathematics', type: 'Course Notes', institution: 'UNILAG' },
  { id: '2', title: 'Calculus II', type: 'Past Questions', institution: 'UI' },
  { id: '3', title: 'Research Proposal Guide', type: 'Research Paper', institution: 'FUTA' },
  { id: '4', title: 'Database Management', type: 'Lecture Slides', institution: 'UNN' },
];

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');

  const filtered = query
    ? sampleResults.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
    : sampleResults;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Discover</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search course, notes, topic..."
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ResourceDetail', { resource: item })}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.meta}>{item.type}</Text>
              <Text style={styles.meta}>{item.institution}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0B1220',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#111827',
    color: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  meta: {
    color: '#94A3B8',
    marginBottom: 2,
  },
});
