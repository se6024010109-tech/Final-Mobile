// src/screens/ProfileScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, signOut, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(user?.age?.toString() || "");
  const [weight, setWeight] = useState(user?.weight?.toString() || "");
  const [height, setHeight] = useState(user?.height?.toString() || "");
  const [goal, setGoal] = useState(user?.goal || "Stay Fit");
  const [debugToken, setDebugToken] = useState(null);

  const goals = [
    "Lose Weight",
    "Build Muscle",
    "Stay Fit",
    "Improve Endurance",
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await authAPI.updateProfile({
        name,
        age: age ? parseInt(age) : null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        goal,
      });
      await updateUser(response.data.user);
      setEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleShowToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      console.log("ProfileScreen: stored token ->", token);
      setDebugToken(token);
      Alert.alert("Stored token", token ? token : "No token found");
    } catch (e) {
      console.error("Error reading token:", e);
      Alert.alert("Error", "Failed to read token");
    }
  };

  const handleLogout = () => {
    console.log("[ProfileScreen] Logout pressed");
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("[ProfileScreen] Calling signOut");
            await signOut();
            console.log("[ProfileScreen] SignOut complete");
          } catch (error) {
            console.error("[ProfileScreen] SignOut error:", error);
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  const calculateBMI = () => {
    if (weight && height) {
      const w = parseFloat(weight);
      const h = parseFloat(height) / 100;
      return (w / (h * h)).toFixed(1);
    }
    return "N/A";
  };

  const SettingItem = ({ icon, title, value, onPress, showSwitch }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={theme.textColor} />
        <Text style={[styles.settingTitle, { color: theme.textColor }]}>
          {title}
        </Text>
      </View>
      {showSwitch ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: "#767577", true: theme.primary }}
          thumbColor="#fff"
        />
      ) : (
        <Ionicons name="chevron-forward" size={24} color={theme.textColor} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.userName, { color: theme.textColor }]}>
          {user?.name}
        </Text>
        <Text style={[styles.userEmail, { color: theme.textColor }]}>
          {user?.email}
        </Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View
          style={[styles.statBox, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.statValue, { color: theme.textColor }]}>
            {weight || "--"}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textColor }]}>
            Weight (kg)
          </Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.statValue, { color: theme.textColor }]}>
            {height || "--"}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textColor }]}>
            Height (cm)
          </Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.statValue, { color: theme.textColor }]}>
            {calculateBMI()}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textColor }]}>
            BMI
          </Text>
        </View>
      </View>

      {/* Edit Profile Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Profile Information
          </Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Text style={[styles.editButton, { color: theme.primary }]}>
              {editing ? "Cancel" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        {editing ? (
          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.textColor }]}>Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.cardBackground,
                  color: theme.textColor,
                },
              ]}
              value={name}
              onChangeText={setName}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.label, { color: theme.textColor }]}>
                  Age
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.cardBackground,
                      color: theme.textColor,
                    },
                  ]}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.textColor }]}>
                  Weight (kg)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.cardBackground,
                      color: theme.textColor,
                    },
                  ]}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={[styles.label, { color: theme.textColor }]}>
              Height (cm)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.cardBackground,
                  color: theme.textColor,
                },
              ]}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.textColor }]}>
              Fitness Goal
            </Text>
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
                      goal === g && { color: "#FFF" },
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}
          >
            <Text style={[styles.infoLabel, { color: theme.textColor }]}>
              Goal
            </Text>
            <Text style={[styles.infoValue, { color: theme.textColor }]}>
              {user?.goal || "Not set"}
            </Text>
          </View>
        )}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
          Settings
        </Text>
        <SettingItem
          icon="moon"
          title="Dark Mode"
          value={isDark}
          onPress={toggleTheme}
          showSwitch
        />
        <SettingItem
          icon="information-circle"
          title="About"
          onPress={() => Alert.alert("About", "FitTracker v1.0.0")}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: "#F44336" }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color="#FFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>



      {debugToken !== null && (
        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
          <Text
            style={{ color: theme.textColor, fontSize: 12 }}
            numberOfLines={2}
          >
            Token: {debugToken ? debugToken : "No token stored"}
          </Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
    marginTop: 5,
    opacity: 0.7,
  },
  statsSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 5,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
    opacity: 0.7,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  editButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  form: {
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
  },
  goalsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  goalButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  goalText: {
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoCard: {
    padding: 15,
    borderRadius: 10,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 5,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingTitle: {
    fontSize: 16,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  logoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
});
