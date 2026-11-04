import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../config/api';

type ScreenMode = 'login' | 'register' | 'forgot';
type AccountRole = 'student' | 'lecturer';

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
  const [mode, setMode] = useState<ScreenMode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [academicHandle, setAcademicHandle] = useState('');
  const [institution, setInstitution] = useState('');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AccountRole>('student');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }
    if (mode !== 'forgot' && !password) {
      Alert.alert('Password required', 'Please enter your password.');
      return;
    }
    if (mode === 'register' && (!firstName.trim() || !lastName.trim() || !academicHandle.trim())) {
      Alert.alert('Missing details', 'First name, last name and academic handle are required.');
      return;
    }
    try {
      setLoading(true);
      if (mode === 'forgot') {
        await apiClient.post('/auth/password-reset/request', { email: email.trim() });
        Alert.alert(
          'Check your email',
          'If an account exists for that email, password reset instructions will be sent. The link expires in 30 minutes.',
        );
        setMode('login');
      } else if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await register({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          academicHandle: academicHandle.trim(),
          email: email.trim(),
          password,
          role,
          ...(institution.trim() ? { institution: institution.trim() } : {}),
          ...(faculty.trim() ? { faculty: faculty.trim() } : {}),
          ...(department.trim() ? { department: department.trim() } : {}),
        });
      }
    } catch (error: any) {
      Alert.alert(mode === 'forgot' ? 'Unable to request reset' : 'Authentication failed', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'forgot' ? 'Reset your password' : mode === 'register' ? 'Create your account' : 'Welcome back';
  const subtitle = mode === 'forgot'
    ? 'Enter your account email and we will send a secure reset link.'
    : mode === 'register'
      ? 'Choose how you will use Sophis Central.'
      : 'Sign in to continue to Sophis Central.';

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Sophis Central</Text>
        <Text style={styles.subtitle}>Study smarter. Research faster.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.formTitle}>{title}</Text>
        <Text style={styles.formSubtitle}>{subtitle}</Text>

        {mode === 'register' ? (
          <>
            <Text style={styles.fieldLabel}>I am joining as</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                accessibilityRole="radio"
                accessibilityState={{ selected: role === 'student' }}
                style={[styles.roleOption, role === 'student' && styles.roleOptionSelected]}
                onPress={() => setRole('student')}
              >
                <Text style={[styles.roleTitle, role === 'student' && styles.roleTitleSelected]}>Student</Text>
                <Text style={styles.roleDescription}>Learn and access academic resources</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="radio"
                accessibilityState={{ selected: role === 'lecturer' }}
                style={[styles.roleOption, role === 'lecturer' && styles.roleOptionSelected]}
                onPress={() => setRole('lecturer')}
              >
                <Text style={[styles.roleTitle, role === 'lecturer' && styles.roleTitleSelected]}>Lecturer</Text>
                <Text style={styles.roleDescription}>Teach and share learning resources</Text>
              </TouchableOpacity>
            </View>
            <TextInput placeholder="First name" value={firstName} onChangeText={setFirstName} style={styles.input} placeholderTextColor="#94A3B8" />
            <TextInput placeholder="Last name" value={lastName} onChangeText={setLastName} style={styles.input} placeholderTextColor="#94A3B8" />
            <TextInput placeholder="Academic handle (required)" value={academicHandle} onChangeText={setAcademicHandle} autoCapitalize="none" style={styles.input} placeholderTextColor="#94A3B8" />
            <TextInput placeholder="Institution" value={institution} onChangeText={setInstitution} style={styles.input} placeholderTextColor="#94A3B8" />
            <TextInput placeholder="Faculty" value={faculty} onChangeText={setFaculty} style={styles.input} placeholderTextColor="#94A3B8" />
            <TextInput placeholder="Department" value={department} onChangeText={setDepartment} style={styles.input} placeholderTextColor="#94A3B8" />
          </>
        ) : null}

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          style={styles.input}
          placeholderTextColor="#94A3B8"
        />

        {mode !== 'forgot' ? (
          <>
            <View style={styles.passwordWrap}>
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                style={styles.passwordInput}
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
                onPress={() => setPasswordVisible((visible) => !visible)}
                style={styles.visibilityButton}
              >
                <Text style={styles.visibilityText}>{passwordVisible ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            {mode === 'login' ? (
              <TouchableOpacity style={styles.forgotLink} onPress={() => setMode('forgot')}>
                <Text style={styles.linkText}>Forgot password?</Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : null}

        <TouchableOpacity style={[styles.primaryButton, loading && styles.disabled]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.primaryButtonText}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : mode === 'register' ? 'Create account' : 'Send reset link'}
          </Text>
        </TouchableOpacity>

        {mode === 'forgot' ? (
          <TouchableOpacity onPress={() => setMode('login')}>
            <Text style={styles.switchText}>Back to login</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setPasswordVisible(false); }}>
            <Text style={styles.switchText}>{mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}</Text>
          </TouchableOpacity>
        )}
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
  formTitle: { color: '#F8FAFC', fontSize: 23, fontWeight: '800', marginBottom: 6 },
  formSubtitle: { color: '#94A3B8', fontSize: 14, lineHeight: 20, marginBottom: 18 },
  fieldLabel: { color: '#E2E8F0', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleOption: { flex: 1, minHeight: 86, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#334155', backgroundColor: '#0F172A', justifyContent: 'center' },
  roleOptionSelected: { borderColor: '#A78BFA', backgroundColor: '#241B42' },
  roleTitle: { color: '#CBD5E1', fontWeight: '700', fontSize: 15, marginBottom: 5 },
  roleTitleSelected: { color: '#DDD6FE' },
  roleDescription: { color: '#94A3B8', fontSize: 11, lineHeight: 15 },
  input: { backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 14, borderWidth: 1, borderColor: '#1F2937' },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1F2937' },
  passwordInput: { flex: 1, color: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 14 },
  visibilityButton: { paddingHorizontal: 16, paddingVertical: 12 },
  visibilityText: { color: '#C4B5FD', fontWeight: '700' },
  forgotLink: { alignSelf: 'flex-end', paddingVertical: 8, marginBottom: 8 },
  linkText: { color: '#C4B5FD', fontWeight: '600' },
  primaryButton: { backgroundColor: '#7C3AED', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  switchText: { color: '#A5B4FC', marginTop: 18, textAlign: 'center', fontWeight: '600' },
});
