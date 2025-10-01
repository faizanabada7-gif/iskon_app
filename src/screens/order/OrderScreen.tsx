import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { API } from "../../services/login";
import { OrderCard } from "./components/OrderCard";

type UserRole = "cook" | "waiter" | "admin";

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  done?: boolean;
}

interface Order {
  _id: string;
  orderNumber: number;
  items: OrderItem[];
  totalAmount: number;
  status: string;
}
interface GroupedOrders {
  Preparing: Order[];
  Ready: Order[];
  Completed: Order[];
  Cancelled: Order[];
}

const statusTabs: (keyof GroupedOrders)[] = ["Preparing", "Ready", "Completed", "Cancelled"];

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrders>({
    Preparing: [],
    Ready: [],
    Completed: [],
    Cancelled: [],
  });
  const [userRole, setUserRole] = useState<UserRole>("waiter");
  const [userId, setUserId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<keyof GroupedOrders>("Preparing");

  const navigation = useNavigation();

  const getStatusIcon = (status: keyof GroupedOrders) =>
    status === "Preparing" ? "restaurant-outline" :
      status === "Ready" ? "people-outline" :
        status === "Completed" ? "checkmark-done-circle-outline" :
          status === "Cancelled" ? "close-circle-outline" :
            "help-circle-outline";

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        setUserRole(user.role);
        setUserId(user._id);
      }
    };
    fetchUser();
  }, []);

  const fetchOrders = async () => {
    if (!userId) return;
    const token = await AsyncStorage.getItem("token");
    try {
      const res = await API.get(`/orders/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setOrders(res.data.data);
        groupOrdersByStatus(res.data.data);
      }
    } catch (err) {
      console.log("Error fetching orders:", err);
    }
  };

  // Group orders by status
  const groupOrdersByStatus = (list: Order[]) => {
    const g: GroupedOrders = { Preparing: [], Ready: [], Completed: [], Cancelled: [] };
    list.forEach(o => {
      const s = o.status?.toLowerCase();
      if (s === "ready") g.Ready.push(o);
      else if (s === "completed") g.Completed.push(o);
      else if (s === "cancelled") g.Cancelled.push(o);
      else g.Preparing.push(o);
    });
    setGroupedOrders(g);
  };

  // Refresh orders on mount and screen focus
  useEffect(() => { if (userId) fetchOrders(); }, [userId]);
  useFocusEffect(useCallback(() => { fetchOrders(); }, [userId]));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
        {userRole !== "cook" && (
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("AddOrder")}
          >
            <Text style={styles.addButtonText}>+ New</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        {statusTabs.map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.85}
            >
              <Ionicons
                name={getStatusIcon(tab)}
                size={isActive ? 28 : 24}
                color={isActive ? "#111" : "#FFD700"}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Orders List */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <FlatList
          data={groupedOrders[activeTab]}
          keyExtractor={(o) => o._id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              userRole={userRole}
              updateOrderStatus={(id, newStatus) =>
                setOrders(prev =>
                  prev.map(o => (o._id === id ? { ...o, status: newStatus } : o))
                )
              }
            />
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      </View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18 },
  headerTitle: {
    fontSize: 32, fontWeight: "900", color: "#FFD700", letterSpacing: 1.2,
    textShadowColor: "rgba(255,215,0,0.3)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  addButton: { backgroundColor: "#FFD700", paddingVertical: 8, paddingHorizontal: 20, borderRadius: 30, elevation: 4 },
  addButtonText: { color: "#111", fontWeight: "700", fontSize: 16 },

  // Tabs
  tabsWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 10,
    backgroundColor: "#111",
    borderRadius: 40,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  tabButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
  },
  tabButtonActive: {
    backgroundColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  tabLabel: { fontSize: 10, fontWeight: "700", color: "#FFD700", marginTop: 4 },
  tabLabelActive: { color: "#111" },
});
