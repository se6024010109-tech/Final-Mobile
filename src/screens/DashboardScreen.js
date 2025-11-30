// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { workoutAPI, goalAPI } from '../services/api';
import { Pedometer } from 'expo-sensors';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [goals, setGoals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    loadData();
    subscribeToSteps();
  }, []);

  const subscribeToSteps = async () => {
    const isAvailable = await Pedometer.isAvailableAsync();
    if (isAvailable) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const result = await Pedometer.getStepCountAsync(today, new Date());
      setSteps(result.steps);

      return Pedometer.watchStepCount((result) => {
        setSteps(result.steps);
      });
    }
  };

  const loadData = async () => {
    try {
      const [statsResponse, goalsResponse] = await Promise.all([
        workoutAPI.getStats(),
        goalAPI.getAll(),
      ]);
      setStats(statsResponse.data);
      setGoals(goalsResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const calculateBMI = () => {
    if (user?.weight && user?.height) {
      const heightInMeters = user.height / 100;
      const bmi = user.weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return 'N/A';
  };

  const getActiveGoalsProgress = () => {
    const activeGoals = goals.filter(g => !g.completed);
    if (activeGoals.length === 0) return 0;
    
    const totalProgress = activeGoals.reduce((sum, goal) => {
      return sum + (goal.current / goal.target);
    }, 0);
    
    return totalProgress / activeGoals.length;
  };

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [20, 45, 28, 80, 99, 43, stats?.weeklyWorkouts || 0]
    }]
  };

  const progressData = {
    labels: ['Workouts', 'Goals', 'Steps'],
    data: [
      stats ? stats.weeklyWorkouts / 7 : 0,
      getActiveGoalsProgress(),
      steps / 10000,
    ]
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.textColor }]}>
            Hello, {user?.name}! 💪
          </Text>
          <Text style={[styles.subGreeting, { color: theme.textColor }]}>
            {user?.goal || 'Ready to workout?'}
          </Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
          <Ionicons name="flame" size={30} color="#FF6B35" />
          <Text style={[styles.statNumber, { color: theme.textColor }]}>
            {stats?.totalCalories || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textColor }]}>Calories</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
          <Ionicons name="barbell" size={30} color={theme.primary} />
          <Text style={[styles.statNumber, { color: theme.textColor }]}>
            {stats?.totalWorkouts || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textColor }]}>Workouts</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
          <Ionicons name="time" size={30} color="#4ECDC4" />
          <Text style={[styles.statNumber, { color: theme.textColor }]}>
            {stats?.totalDuration || 0}m
          </Text>
          <Text style={[styles.statLabel, { color: theme.textColor }]}>Minutes</Text>
        </View>
      </View>

      {/* Steps Counter */}
      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="walk" size={24} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Today's Steps
          </Text>
        </View>
        <Text style={[styles.stepsCount, { color: theme.textColor }]}>
          {steps.toLocaleString()}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min((steps / 10000) * 100, 100)}%`, backgroundColor: theme.primary }
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.textColor }]}>
          Goal: 10,000 steps
        </Text>
      </View>

      {/* Weekly Progress Chart */}
      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
          Weekly Activity
        </Text>
        <LineChart
          data={chartData}
          width={screenWidth - 60}
          height={200}
          chartConfig={{
            backgroundColor: theme.cardBackground,
            backgroundGradientFrom: theme.cardBackground,
            backgroundGradientTo: theme.cardBackground,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
            labelColor: (opacity = 1) => theme.isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: theme.primary
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </View>

      {/* Progress Overview */}
      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
          Progress Overview
        </Text>
        <ProgressChart
          data={progressData}
          width={screenWidth - 60}
          height={200}
          strokeWidth={16}
          radius={32}
          chartConfig={{
            backgroundColor: theme.cardBackground,
            backgroundGradientFrom: theme.cardBackground,
            backgroundGradientTo: theme.cardBackground,
            color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
            labelColor: (opacity = 1) => theme.isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
          }}
          hideLegend={false}
        />
      </View>

      {/* BMI Card */}
      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="fitness" size={24} color={theme.secondary} />
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Your BMI
          </Text>
        </View>
        <Text style={[styles.bmiValue, { color: theme.textColor }]}>
          {calculateBMI()}
        </Text>
        <Text style={[styles.bmiLabel, { color: theme.textColor }]}>
          {user?.weight && user?.height ? 'Body Mass Index' : 'Update profile to see BMI'}
        </Text>
      </View>

      {/* Quick Actions */}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('LogWorkout')}
      >
        <Ionicons name="add-circle" size={24} color="#FFF" />
        <Text style={styles.actionButtonText}>Log Workout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subGreeting: {
    fontSize: 16,
    marginTop: 5,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
    opacity: 0.7,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  stepsCount: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  bmiLabel: {
    textAlign: 'center',
    opacity: 0.7,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});