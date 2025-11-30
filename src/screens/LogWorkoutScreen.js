// src/screens/LogWorkoutScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { workoutAPI } from '../services/api';
import * as Location from 'expo-location';

export default function LogWorkoutScreen({ navigation }) {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Cardio');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  const workoutTypes = ['Cardio', 'Strength', 'Yoga', 'Sports', 'Other'];

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for GPS tracking');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      Alert.alert('Location Captured', 
        `Lat: ${currentLocation.coords.latitude.toFixed(4)}, Lon: ${currentLocation.coords.longitude.toFixed(4)}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const handleSubmit = async () => {
    if (!title || !duration) {
      Alert.alert('Error', 'Please fill in workout title and duration');
      return;
    }

    setLoading(true);
    try {
      await workoutAPI.create({
        title,
        type: type.toLowerCase(),
        duration: parseInt(duration),
        calories: calories ? parseInt(calories) : 0,
        distance: distance ? parseFloat(distance) : 0,
        notes,
      });
      Alert.alert('Success', 'Workout logged successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to log workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.form}>
        <Text style={[styles.label, { color: theme.textColor }]}>Workout Title *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.textColor }]}
          placeholder="e.g., Morning Run, Leg Day"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[styles.label, { color: theme.textColor }]}>Type *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {workoutTypes.map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeButton,
                { backgroundColor: theme.cardBackground },
                type === t && { backgroundColor: theme.primary },
              ]}
              onPress={() => setType(t)}
            >
              <Text
                style={[
                  styles.typeText,
                  { color: theme.textColor },
                  type === t && { color: '#FFF' },
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.label, { color: theme.textColor }]}>Duration (minutes) *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.textColor }]}
          placeholder="e.g., 30"
          placeholderTextColor="#888"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: theme.textColor }]}>Calories Burned</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.textColor }]}
          placeholder="e.g., 250"
          placeholderTextColor="#888"
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: theme.textColor }]}>Distance (km)</Text>
        <View style={styles.inputWithButton}>
          <TextInput
            style={[styles.inputFlex, { backgroundColor: theme.cardBackground, color: theme.textColor }]}
            placeholder="e.g., 5.0"
            placeholderTextColor="#888"
            value={distance}
            onChangeText={setDistance}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={[styles.gpsButton, { backgroundColor: theme.secondary }]}
            onPress={getLocation}
          >
            <Ionicons name="location" size={20} color="#FFF" />
            <Text style={styles.gpsText}>GPS</Text>
          </TouchableOpacity>
        </View>

        {location && (
          <View style={[styles.locationInfo, { backgroundColor: theme.cardBackground }]}>
            <Ionicons name="checkmark-circle" size={20} color={theme.success} />
            <Text style={[styles.locationText, { color: theme.textColor }]}>
              Location captured
            </Text>
          </View>
        )}

        <Text style={[styles.label, { color: theme.textColor }]}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: theme.cardBackground, color: theme.textColor }]}
          placeholder="Add any notes about your workout..."
          placeholderTextColor="#888"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
              <Text style={styles.submitButtonText}>Log Workout</Text>
            </>
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
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFlex: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginRight: 10,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  gpsText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 5,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  locationText: {
    marginLeft: 10,
    fontSize: 14,
  },
  typeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 10,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});