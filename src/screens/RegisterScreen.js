// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('Build Muscle');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { theme } = useTheme();

  const goals = ['Lose Weight', 'Build Muscle', 'Stay Fit', 'Improve Endurance'];

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({
        name,
        email,
        password,
        age: age ? parseInt(age) : null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        goal,
      });
      await signIn(response.data.token, response.data.user);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.form}>
        <Text style={[styles.title, { color: theme.textColor }]}>Create Account</Text>

        <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground }]}>
          <Ionicons name="person-outline" size={20} color={theme.textColor} />
          <TextInput
            style={[styles.input, { color: theme.textColor }]}
            placeholder="Full Name *"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground }]}>
          <Ionicons name="mail-outline" size={20} color={theme.textColor} />
          <TextInput
            style={[styles.input, { color: theme.textColor }]}
            placeholder="Email *"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground }]}>
          <Ionicons name="lock-closed-outline" size={20} color={theme.textColor} />
          <TextInput
            style={[styles.input, { color: theme.textColor }]}
            placeholder="Password *"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.halfInputContainer, { backgroundColor: theme.cardBackground }]}>
            <Ionicons name="calendar-outline" size={20} color={theme.textColor} />
            <TextInput
              style={[styles.input, { color: theme.textColor }]}
              placeholder="Age"
              placeholderTextColor="#888"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.halfInputContainer, { backgroundColor: theme.cardBackground }]}>
            <Ionicons name="speedometer-outline" size={20} color={theme.textColor} />
            <TextInput
              style={[styles.input, { color: theme.textColor }]}
              placeholder="Weight (kg)"
              placeholderTextColor="#888"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground }]}>
          <Ionicons name="resize-outline" size={20} color={theme.textColor} />
          <TextInput
            style={[styles.input, { color: theme.textColor }]}
            placeholder="Height (cm)"
            placeholderTextColor="#888"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />
        </View>

        <Text style={[styles.label, { color: theme.textColor }]}>Fitness Goal</Text>
        <View style={styles.goalsContainer}>
          {goals.map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.goalButton,
                { backgroundColor: theme.cardBackground },
                goal === g && { backgroundColor: theme.primary },
              ]}
              onPress={() => setGoal(g)}
            >
              <Text
                style={[
                  styles.goalText,
                  { color: theme.textColor },
                  goal === g && { color: '#FFF' },
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  form: {
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  goalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 10,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});