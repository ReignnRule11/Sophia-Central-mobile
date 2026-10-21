import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { apiClient } from '../config/api';

const resourceTypes = ['Lecture Notes', 'Past Questions', 'Research Paper', 'Project Reference'];

export default function UploadScreen() {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [institution, setInstitution] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState(resourceTypes[0]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!title.trim() || !course.trim() || !topic.trim()) {
      Alert.alert('Missing details', 'Please add a title, course, and topic before submitting.');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/resources', {
        title: title.trim(),
        course: course.trim(),
        topic: topic.trim(),
        institution: institution.trim(),
        description: description.trim(),
        type: resourceType.toLowerCase().replace(/\s+/g, '_'),
      });

      Alert.alert('Success', 'Resource submitted for moderation.');
      setTitle('');
      setCourse('');
      setTopic('');
      setInstitution('');
      setDescription('');
      setResourceType(resourceTypes[0]);
    } catch (error: any) {
      Alert.alert('Upload failed', error?.response?.data?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Upload resource</Text>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} placeholderTextColor="#94A3B8" />
      <TextInput placeholder="Course" value={course} onChangeText={setCourse} style={styles.input} placeholderTextColor="#94A3B8" />
      <TextInput placeholder="Topic" value={topic} onChangeText={setTopic} style={styles.input} placeholderTextColor="#94A3B8" />
      <TextInput placeholder="Institution" value={institution} onChangeText={setInstitution} style={styles.input} placeholderTextColor="#94A3B8" />

      <Text style={styles.label}>Resource type</Text>
      <View style={styles.chipsWrap}>
        {resourceTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.chip, resourceType === type && styles.chipActive]}
            onPress={() => setResourceType(type)}
          >
            <Text style={[styles.chipText, resourceType === type && styles.chipTextActive]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={5}
        style={[styles.input, styles.textArea]}
        placeholderTextColor="#94A3B8"
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleUpload} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? 'Uploading...' : 'Submit resource'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 18,
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#111827',
    color: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  chip: {
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  chipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#8B5CF6',
  },
  chipText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFF',
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
