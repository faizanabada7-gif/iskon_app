import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
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
  waiterName?: string;       // 👈 added
  orderTime?: string;        // 👈 added
  orderDate?: string;        // 👈 optional if needed
  lastUpdated?: string;      // 👈 added
}

interface Order {
  placedBy: any;
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
  _id: string;
  orderNumber: number;
  items: OrderItem[];
  totalAmount: number;
  status: string;
}

interface GroupedOrders {
  Current: Order[];
  Completed: Order[];
  Cancelled: Order[];
}

const statusTabs: (keyof GroupedOrders)[] = ["Current", "Completed", "Cancelled"];

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrders>({
    Current: [],
    Completed: [],
    Cancelled: [],
  });
  const [userRole, setUserRole] = useState<UserRole>("waiter");
  const [userId, setUserId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<keyof GroupedOrders>("Current");

  const navigation = useNavigation();

  // Get icon for tab
  const getStatusIcon = (status: keyof GroupedOrders) =>
    status === "Current"
      ? "restaurant-outline"
      : status === "Completed"
        ? "checkmark-done-circle-outline"
        : status === "Cancelled"
          ? "close-circle-outline"
          : "help-circle-outline";


  // Fetch user info
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

  // Fetch orders from API
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
    const g: GroupedOrders = { Current: [], Completed: [], Cancelled: [] };
    list.forEach((o) => {
      const s = o.status?.toLowerCase();
      if (s === "completed") g.Completed.push(o);
      else if (s === "cancelled") g.Cancelled.push(o);
      else g.Current.push(o); // everything else
    });
    setGroupedOrders(g);
  };

  // Update order status locally and refresh groupedOrders
  const handleUpdateOrderStatus = (id: string, newStatus: string) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o));
      groupOrdersByStatus(updated); // update groupedOrders
      return updated;
    });
  };

  // Refresh orders on mount and when screen focuses
  useEffect(() => {
    if (userId) fetchOrders();
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) fetchOrders();
    }, [userId])
  );

  const formattedOrders = orders.map(o => ({
    ...o,
    waiterName: o.placedBy?.username || "Unknown",
    orderTime: new Date(o.createdAt).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    orderDate: new Date(o.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    lastUpdated: new Date(o.updatedAt).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

const groupOrdersByDate = (orders: Order[]) => {
  return orders.reduce<Record<string, Order[]>>((acc, order) => {
    const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(order);
    return acc;
  }, {});
};


  

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
        {userRole !== "cook" && (
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("AddOrder", {
                editable: false,   // creating new order 
                onOrderUpdated: fetchOrders,
              })
            }
          >
            <Text style={styles.addButtonText}>+ New</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        {statusTabs.map((tab) => {
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

   <View style={{ flex: 1, paddingHorizontal: 16 }}>
  <FlatList
    data={Object.entries(groupOrdersByDate(groupedOrders[activeTab]))}
    keyExtractor={([date]) => date}
    renderItem={({ item }) => {
      const [date, ordersForDate] = item;
      return (
        <View style={{ marginBottom: 20 }}>
          {/* Date Header */}
          <Text style={styles.dateHeader}>{date}</Text>

          {/* Orders for this date */}
          {ordersForDate.map((order) => (
            <OrderCard
              key={order._id + order.totalAmount}
              order={order}
              userRole={userRole}
              updateOrderStatus={handleUpdateOrderStatus}
              onPress={() =>
                navigation.navigate("AddOrder", {
                  editable: true,
                  order,
                  onOrderUpdated: fetchOrders,
                })
              }
            />
          ))}
        </View>
      );
    }}
  />
</View>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18 },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFD700",
    letterSpacing: 1.2,
    textShadowColor: "rgba(255,215,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
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
  dateHeader: {
  fontSize: 18,
  fontWeight: "700",
  color: "#FFD700",
  marginVertical: 8,
}

});
