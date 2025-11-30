// src/screens/GoalsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { goalAPI } from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export default function GoalsScreen() {
  const { theme } = useTheme();
  const [goals, setGoals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState('Weight Loss');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const goalTypes = ['Weight Loss', 'Muscle Gain', 'Run Distance', 'Workout Count'];

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await goalAPI.getAll();
      setGoals(response.data);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleAddGoal = async () => {
    if (!target) {
      Alert.alert('Error', 'Please enter a target value');
      return;
    }

    try {
      await goalAPI.create({
        type: type.toLowerCase().replace(' ', '_'),
        target: parseFloat(target),
        deadline,
      });
      Alert.alert('Success', 'Goal created successfully');
      setModalVisible(false);
      resetForm();
      loadGoals();
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal');
    }
  };

  const updateProgress = async (goalId, currentValue) => {
    Alert.prompt(
      'Update Progress',
      'Enter current value:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async (value) => {
            if (value) {
              try {
                await goalAPI.update(goalId, { current: parseFloat(value) });
                loadGoals();
              } catch (error) {
                Alert.alert('Error', 'Failed to update progress');
              }
            }
          },
        },
      ],
      'plain-text',
      currentValue.toString()
    );
  };

  const deleteGoal = (id, type) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete this goal?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await goalAPI.delete(id);
              loadGoals();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete goal');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setType('Weight Loss');
    setTarget('');
    setDeadline(new Date());
  };

  const getGoalIcon = (type) => {
    const icons = {
      weight_loss: 'trending-down',
      muscle_gain: 'trending-up',
      run_distance: 'bicycle',
      workout_count: 'barbell',
    };
    return icons[type] || 'trophy';
  };

  const formatType = (type) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderGoalCard = ({ item }) => {
    const progress = Math.min((item.current / item.target) * 100, 100);
    const daysLeft = Math.ceil((new Date(item.deadline) - new Date()) / (1000 * 60 * 60 * 24));

    return (
      <View style={[styles.goalCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.goalHeader}>
          <View style={styles.goalTitle}>
            <Ionicons name={getGoalIcon(item.type)} size={24} color={theme.primary} />
            <Text style={[styles.goalName, { color: theme.textColor }]}>
              {formatType(item.type)}
            </Text>
          </View>
          <TouchableOpacity onPress={() => deleteGoal(item._id, item.type)}>
            <Ionicons name="trash-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>

        <View style={styles.goalProgress}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: theme.textColor }]}>
              {item.current} / {item.target}
            </Text>
            <Text style={[styles.progressPercent, { color: theme.primary }]}>
              {progress.toFixed(0)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: theme.primary }
              ]}
            />
          </View>
        </View>

        <View style={styles.goalFooter}>
          <Text style={[styles.deadlineText, { color: theme.textColor }]}>
            {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
          </Text>
          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: theme.secondary }]}
            onPress={() => updateProgress(item._id, item.current)}
          >
            <Ionicons name="create-outline" size={16} color="#FFF" />
            <Text style={styles.updateButtonText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textColor }]}>My Goals</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={80} color={theme.textColor} opacity={0.3} />
          <Text style={[styles.emptyText, { color: theme.textColor }]}>
            No goals set yet
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: theme.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.emptyButtonText}>Set Your First Goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoalCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Add Goal Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textColor }]}>
                New Goal
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={theme.textColor} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={[styles.label, { color: theme.textColor }]}>Goal Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {goalTypes.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeOption,
                      { backgroundColor: theme.cardBackground },
                      type === t && { backgroundColor: theme.primary },
                    ]}
                    onPress={() => setType(t)}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        { color: theme.textColor },
                        type === t && { color: '#FFF' },
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: theme.textColor }]}>Target Value</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.textColor }]}
                placeholder="e.g., 10"
                placeholderTextColor="#888"
                value={target}
                onChangeText={setTarget}
                keyboardType="numeric"
              />

              <Text style={[styles.label, { color: theme.textColor }]}>Deadline</Text>
              <TouchableOpacity
                style={[styles.input, { backgroundColor: theme.cardBackground }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: theme.textColor }}>
                  {deadline.toDateString()}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={deadline}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) setDeadline(selectedDate);
                  }}
                />
              )}

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: theme.primary }]}
                onPress={handleAddGoal}
              >
                <Text style={styles.submitButtonText}>Create Goal</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  goalCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  goalTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  goalProgress: {
    marginBottom: 15,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineText: {
    fontSize: 14,
    opacity: 0.7,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalForm: {
    padding: 20,
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
  typeOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});