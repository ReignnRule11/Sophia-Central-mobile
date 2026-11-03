import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

function getAuthErrorMessage(error: any): string {
  const raw = error?.response?.data?.message ?? error?.response?.data?.error ?? error?.message;
  const readable = (value: any): string | null => {
    if (typeof value === 'string' && value.trim()) return value;
    if (Array.isArray(value)) {
      const parts = value.map(readable).filter(Boolean);
      return parts.length ? parts.join('\n') : null;
    }
    if (value && typeof value === 'object') {
      if (typeof value.message === 'string') return value.message;
      if (Array.isArray(value.message)) return readable(value.message);
      if (typeof value.error === 'string') return value.error;
    }
    return null;
  };
  return readable(raw) ?? 'The request could not be completed. Check your connection and try again.';
}

export default function LoginScreen() {
  const { signIn, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [academicHandle, setAcademicHandle] = useState('');
  const [institution, setInstitution] = useState('');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }
    if (mode === 'register' && (!firstName.trim() || !lastName.trim() || !academicHandle.trim())) {
      Alert.alert('Missing details', 'First name, last name and academic handle are required.');
      return;
    }
    try {
      setLoading(true);
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await register({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          academicHandle: academicHandle.trim(),
          email: email.trim(),
          password,
          ...(institution.trim() ? { institution: institution.trim() } : {}),
          ...(faculty.trim() ? { faculty: faculty.trim() } : {}),
          ...(department.trim() ? { department: department.trim() } : {}),
        });
      }
    } catch (error: any) {
      Alert.alert('Authentication failed', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Sophia Central</Text>
        <Text style={styles.subtitle}>Study smarter. Research faster.</Text>
      </View>
      <View style={styles.card}>
        {mode === 'register' ? (
          <>
            <TextInput placeholder="First name" value={firstName} onChangeText={setFirstName} style={styles.input} placeholderTextColor="#94A3B8" />
            <TextInput placeholder="Last name" value={lastName} onChangeText={setLastName} style={styles.input} placeholderTextColor="#94A3B8" />
            <TextInput placeholder="Academic handle (required)" value={academicHandle} onChangeText={setAcademicHandle} autoCapitalize="none" style={styles.input} placeholderTextColor="#94A3B8" />
            <TextInput placeholder="Institution" value={institution} onChangeText={setInstitution} style={styles.input} placeholderTextColor="#94A3B8" />
            <TextInput placeholder="Faculty" value={faculty} onChangeText={setFaculty} style={styles.input} placeholderTextColor="#94A3B8" />
            <TextInput placeholder="Department" value={department} onChangeText={setDepartment} style={styles.input} placeholderTextColor="#94A3B8" />
          </>
        ) : null}
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholderTextColor="#94A3B8" />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} placeholderTextColor="#94A3B8" />
        <TouchableOpacity style={[styles.primaryButton, loading && styles.disabled]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <Text style={styles.switchText}>{mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0B1220' },
  headerWrap: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#F8FAFC', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94A3B8' },
  card: { backgroundColor: '#111827', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#1F2937', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  input: { backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 14, borderWidth: 1, borderColor: '#1F2937' },
  primaryButton: { backgroundColor: '#7C3AED', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  switchText: { color: '#A5B4FC', marginTop: 18, textAlign: 'center', fontWeight: '600' },
});
