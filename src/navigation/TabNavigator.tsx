import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import UploadScreen from '../screens/UploadScreen';
import PointsScreen from '../screens/PointsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AIChatScreen from '../screens/AIChatScreen';
import ModerationScreen from '../screens/ModerationScreen';
import MyUploadsScreen from '../screens/MyUploadsScreen';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { user } = useAuth();
  const role = user?.role;
  const isStudent = role === 'student';
  const isLecturer = role === 'lecturer';
  const canModerate = role === 'moderator' || role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = 'home';
          if (route.name === 'Discover') iconName = 'search';
          if (route.name === 'AI Chat') iconName = 'chatbubbles';
          if (route.name === 'Upload') iconName = 'cloud-upload';
          if (route.name === 'My uploads') iconName = 'folder';
          if (route.name === 'Moderation') iconName = 'shield-checkmark';
          if (route.name === 'Points') iconName = 'trophy';
          if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#94A3B8',
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0F172A', borderTopColor: '#1F2937', borderTopWidth: 1, height: 64, paddingBottom: 8 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={SearchScreen} />
      {isStudent ? <Tab.Screen name="AI Chat" component={AIChatScreen} /> : null}
      {isLecturer ? <Tab.Screen name="Upload" component={UploadScreen} /> : null}
      {isLecturer ? <Tab.Screen name="My uploads" component={MyUploadsScreen} /> : null}
      {canModerate ? <Tab.Screen name="Moderation" component={ModerationScreen} /> : null}
      {isStudent ? <Tab.Screen name="Points" component={PointsScreen} /> : null}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
