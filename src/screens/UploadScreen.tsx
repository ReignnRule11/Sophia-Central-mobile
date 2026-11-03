import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { apiClient } from '../config/api';

const resourceTypes = ['Lecture Notes', 'Past Questions', 'Research Paper', 'Project Reference'];
const resourceTypeValues: Record<string, string> = {
  'Lecture Notes': 'lecture_notes',
  'Past Questions': 'past_question',
  'Research Paper': 'research_paper',
  'Project Reference': 'project',
};
const mimeByExtension: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};
const payloadOf = (response: any) => response?.data?.data ?? response?.data ?? {};

export default function UploadScreen() {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [institution, setInstitution] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState(resourceTypes[0]);
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const chooseFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: Object.values(mimeByExtension),
      });
      if (!result.canceled && result.assets?.[0]) {
        const selected = result.assets[0];
        if (!selected.size || selected.size > 100 * 1024 * 1024) {
          Alert.alert('File size not supported', 'Choose a file smaller than 100 MB.');
          return;
        }
        setFile(selected);
      }
    } catch (error: any) {
      Alert.alert('Unable to select file', String(error?.message ?? 'Please try again.'));
    }
  };

  const handleUpload = async () => {
    if (!title.trim() || !course.trim() || !topic.trim() || !file) {
      Alert.alert('Missing details', 'Add a title, course, topic and document before submitting.');
      return;
    }
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const fileType = file.mimeType || mimeByExtension[extension];
    if (!fileType || !Object.values(mimeByExtension).includes(fileType)) {
      Alert.alert('Unsupported file', 'Choose a PDF, DOC, DOCX, PPT, PPTX, TXT, JPG or PNG file.');
      return;
    }

    setLoading(true);
    try {
      // Storage accepts a resource identifier as the object-key namespace. The
      // confirmed private-storage URL is attached to the resource on creation.
      const uploadResourceId = `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const presign = payloadOf(await apiClient.post('/storage/presigned-url', {
        fileName: file.name,
        fileSize: file.size,
        fileType,
        resourceId: uploadResourceId,
      }));
      if (!presign.presignedUrl || !presign.uploadId) throw new Error('The backend returned an invalid upload authorization.');

      const upload = await FileSystem.uploadAsync(presign.presignedUrl, file.uri, {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: { 'Content-Type': fileType },
      });
      if (upload.status < 200 || upload.status >= 300) throw new Error(`Document transfer failed (HTTP ${upload.status}).`);

      const confirmed = payloadOf(await apiClient.post('/storage/confirm-upload', {
        uploadId: presign.uploadId,
        resourceId: uploadResourceId,
        fileName: file.name,
      }));
      if (!confirmed.success || !confirmed.fileUrl) throw new Error('The backend could not confirm the uploaded document.');

      await apiClient.post('/resources', {
        title: title.trim(),
        course: course.trim(),
        topic: topic.trim(),
        institution: institution.trim(),
        description: description.trim(),
        type: resourceTypeValues[resourceType],
        fileUrl: confirmed.fileUrl,
      });

      Alert.alert('Submitted', 'Your document and resource details have been submitted for moderation.');
      setTitle(''); setCourse(''); setTopic(''); setInstitution(''); setDescription('');
      setResourceType(resourceTypes[0]); setFile(null);
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.message ?? 'Please retry your upload.';
      Alert.alert('Submission failed', String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Upload resource</Text>
      <Text style={styles.helper}>Submit academic materials for review. Approved resources become available to students.</Text>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} placeholderTextColor="#94A3B8" />
      <TextInput placeholder="Course" value={course} onChangeText={setCourse} style={styles.input} placeholderTextColor="#94A3B8" />
      <TextInput placeholder="Topic" value={topic} onChangeText={setTopic} style={styles.input} placeholderTextColor="#94A3B8" />
      <TextInput placeholder="Institution" value={institution} onChangeText={setInstitution} style={styles.input} placeholderTextColor="#94A3B8" />
      <Text style={styles.label}>Resource type</Text>
      <View style={styles.chipsWrap}>
        {resourceTypes.map((type) => (
          <TouchableOpacity key={type} style={[styles.chip, resourceType === type && styles.chipActive]} onPress={() => setResourceType(type)}>
            <Text style={[styles.chipText, resourceType === type && styles.chipTextActive]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} multiline numberOfLines={5} style={[styles.input, styles.textArea]} placeholderTextColor="#94A3B8" />
      <TouchableOpacity style={styles.fileButton} onPress={chooseFile} disabled={loading}>
        <Text style={styles.fileButtonText}>{file ? `Selected: ${file.name}` : 'Choose academic document'}</Text>
      </TouchableOpacity>
      {file ? <Text style={styles.fileMeta}>{(file.size ?? 0) / (1024 * 1024) < 1 ? `${Math.ceil((file.size ?? 0) / 1024)} KB` : `${((file.size ?? 0) / (1024 * 1024)).toFixed(1)} MB`}</Text> : null}
      <TouchableOpacity style={[styles.primaryButton, loading && styles.disabled]} onPress={handleUpload} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Upload and submit</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: '#F8FAFC', fontSize: 28, fontWeight: '700', marginBottom: 8 },
  helper: { color: '#94A3B8', lineHeight: 20, marginBottom: 18 },
  label: { color: '#94A3B8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  input: { backgroundColor: '#111827', color: '#F8FAFC', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 14, borderWidth: 1, borderColor: '#1F2937' },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
  chip: { backgroundColor: '#111827', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#1F2937' },
  chipActive: { backgroundColor: '#7C3AED', borderColor: '#8B5CF6' },
  chipText: { color: '#E2E8F0', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#FFF' },
  fileButton: { backgroundColor: '#172033', borderRadius: 12, borderWidth: 1, borderColor: '#475569', borderStyle: 'dashed', padding: 16, alignItems: 'center' },
  fileButtonText: { color: '#C4B5FD', fontWeight: '700' },
  fileMeta: { color: '#94A3B8', fontSize: 12, marginTop: 8 },
  primaryButton: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 18 },
  primaryButtonText: { color: '#FFF', fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
