// src/screens/WorkoutsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { workoutAPI } from '../services/api';

export default function WorkoutsScreen({ navigation }) {
  const { theme } = useTheme();
  const [workouts, setWorkouts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadWorkouts();
    });
    return unsubscribe;
  }, [navigation]);

  const loadWorkouts = async () => {
    try {
      const response = await workoutAPI.getAll();
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkouts();
  };

  const deleteWorkout = (id, title) => {
    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutAPI.delete(id);
              loadWorkouts();
              Alert.alert('Success', 'Workout deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete workout');
            }
          },
        },
      ]
    );
  };

  const getWorkoutIcon = (type) => {
    const icons = {
      cardio: 'bicycle',
      strength: 'barbell',
      yoga: 'body',
      sports: 'football',
      other: 'fitness',
    };
    return icons[type.toLowerCase()] || 'fitness';
  };

  const renderWorkoutCard = ({ item }) => (
    <View style={[styles.workoutCard, { backgroundColor: theme.cardBackground }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
        <Ionicons name={getWorkoutIcon(item.type)} size={30} color={theme.primary} />
      </View>

      <View style={styles.workoutInfo}>
        <Text style={[styles.workoutTitle, { color: theme.textColor }]}>
          {item.title}
        </Text>
        <Text style={[styles.workoutType, { color: theme.textColor }]}>
          {item.type}
        </Text>
        <View style={styles.workoutStats}>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={16} color={theme.textColor} />
            <Text style={[styles.statText, { color: theme.textColor }]}>
              {item.duration}m
            </Text>
          </View>
          {item.calories && (
            <View style={styles.stat}>
              <Ionicons name="flame-outline" size={16} color={theme.textColor} />
              <Text style={[styles.statText, { color: theme.textColor }]}>
                {item.calories} cal
              </Text>
            </View>
          )}
          {item.distance && (
            <View style={styles.stat}>
              <Ionicons name="navigate-outline" size={16} color={theme.textColor} />
              <Text style={[styles.statText, { color: theme.textColor }]}>
                {item.distance} km
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.workoutDate, { color: theme.textColor }]}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteWorkout(item._id, item.title)}
      >
        <Ionicons name="trash-outline" size={24} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textColor }]}>My Workouts</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('LogWorkout')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {workouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="barbell-outline" size={80} color={theme.textColor} opacity={0.3} />
          <Text style={[styles.emptyText, { color: theme.textColor }]}>
            No workouts logged yet
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('LogWorkout')}
          >
            <Text style={styles.emptyButtonText}>Log Your First Workout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  workoutCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  workoutType: {
    fontSize: 14,
    marginTop: 5,
    opacity: 0.7,
    textTransform: 'capitalize',
  },
  workoutStats: {
    flexDirection: 'row',
    marginTop: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    fontSize: 12,
    marginLeft: 5,
    opacity: 0.7,
  },
  workoutDate: {
    fontSize: 12,
    marginTop: 5,
    opacity: 0.5,
  },
  deleteButton: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 30,
    opacity: 0.7,
  },
  emptyButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});