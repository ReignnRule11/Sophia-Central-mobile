import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';

type Message = { id: string; from: 'user' | 'bot'; text: string };
const payloadOf = (response: any) => response?.data?.data ?? response?.data ?? {};

export default function AIChatScreen() {
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', from: 'bot', text: 'Ask me a question about your course materials.' },
  ]);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const prompt = question.trim();
    if (!prompt || sending) return;
    setMessages((previous) => [...previous, { id: `user-${Date.now()}`, from: 'user', text: prompt }]);
    setQuestion('');
    setSending(true);
    try {
      const response = await apiClient.post('/ai/chat', { question: prompt, ...(sessionId ? { sessionId } : {}) });
      const payload = payloadOf(response);
      if (payload.error === 'Insufficient Wisdom Points') {
        Alert.alert('Insufficient Wisdom Points', `You need ${payload.required ?? 2} points. Your balance is ${payload.balance ?? 0}.`);
        return;
      }
      if (typeof payload.assistantMessage !== 'string' || !payload.assistantMessage.trim()) {
        throw new Error('Sophis AI returned an empty response.');
      }
      if (typeof payload.sessionId === 'string') setSessionId(payload.sessionId);
      setMessages((previous) => [...previous, { id: `assistant-${Date.now()}`, from: 'bot', text: payload.assistantMessage }]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['wallet-balance'] }),
        queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] }),
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.message ?? 'Please try again.';
      setMessages((previous) => [...previous, { id: `error-${Date.now()}`, from: 'bot', text: `I couldn't complete that request: ${String(message)}` }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Study Assistant</Text>
      <ScrollView style={styles.chatBox} contentContainerStyle={{ padding: 12 }}>
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.message, msg.from === 'user' ? styles.userMessage : styles.botMessage]}>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
        {sending ? <ActivityIndicator color="#A5B4FC" style={{ margin: 12 }} /> : null}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput value={question} onChangeText={setQuestion} placeholder="Ask about notes, quizzes, or concepts" style={styles.input} placeholderTextColor="#94A3B8" editable={!sending} multiline />
        <TouchableOpacity style={[styles.sendButton, sending && styles.disabledButton]} onPress={handleSend} disabled={sending || !question.trim()}>
          <Text style={styles.sendText}>{sending ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220', padding: 20 },
  title: { color: '#F8FAFC', fontSize: 28, fontWeight: '700', marginBottom: 16 },
  chatBox: { flex: 1, backgroundColor: '#111827', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1F2937' },
  message: { maxWidth: '85%', borderRadius: 12, padding: 12, marginBottom: 12 },
  userMessage: { backgroundColor: '#7C3AED', alignSelf: 'flex-end' },
  botMessage: { backgroundColor: '#1F2937', alignSelf: 'flex-start' },
  messageText: { color: '#F8FAFC', lineHeight: 21 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, maxHeight: 110, backgroundColor: '#111827', color: '#F8FAFC', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#1F2937' },
  sendButton: { backgroundColor: '#7C3AED', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 12, marginLeft: 10 },
  disabledButton: { opacity: 0.5 },
  sendText: { color: '#FFF', fontWeight: '700' },
});
