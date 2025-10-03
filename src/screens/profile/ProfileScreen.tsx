import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { getUserById } from "../../services/userServices";

// --- TYPE DECLARATIONS ---
type Order = {
  id: string | number;
  time: string;
  date: string;
  amount: number;
};

type User = {
  name: string;
  mobile: string;
  role: string;
  todayRevenue: number;
  totalOrders: number;
  orders: Order[];
};

export default function ProfileScreen() {
  const navigation = useNavigation<any>();

  const [logoutVisible, setLogoutVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;

        const res = await getUserById(userId, token);
        if (res?.data?.success) {
          const u = res.data.data;
          setUser({
            name: u.username,
            mobile: u.phoneNumber,
            role: u.role,
            todayRevenue: u.todayRevenue || 0,
            totalOrders: u.totalOrders || 0,
            orders: u.recentOrders || [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const confirmLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userId");
      setLogoutVisible(false);
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }]
      });
    } catch (err) {
      console.error("Error clearing token:", err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "#d9a515", fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "#fff", fontSize: 18 }}>User not found</Text>
      </View>
    );
  }

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View>
        <Text style={styles.orderTitle}>Order #{item.id}</Text>
        <Text style={styles.orderSub}>{item.date} • {item.time}</Text>
      </View>
      <Text style={styles.orderAmount}>₹ {item.amount}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.pageTitle}>My Profile</Text>

      <View style={styles.infoCard}>
        <InfoRow label="User Name" value={user.name} />
        <InfoRow label="Mobile Number" value={user.mobile} />
        <InfoRow label="Role" value={user.role} />
      </View>

      <View style={styles.statsRow}>
        <StatBox label="Today's Revenue" value={`₹ ${user.todayRevenue}`} />
        <StatBox label="Total Orders" value={user.totalOrders.toString()} />
      </View>

      <Text style={styles.sectionTitle}>Recent Orders</Text>
      <FlatList
        data={user.orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
      />

      <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutVisible(true)}>
        <Ionicons name="log-out-outline" size={22} color="#000" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Modal
        visible={logoutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons name="alert-circle-outline" size={48} color="#d9a515" />
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to log out of your account?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setLogoutVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// --- REUSABLE COMPONENTS ---
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const StatBox = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);



// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#d9a515",
    marginVertical: 24,
    textAlign: "center"
  },
  infoCard: {
    backgroundColor: "rgba(20,20,20,0.85)",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(217,165,21,0.2)",
    marginBottom: 24
  },
  infoRow: {
    marginVertical: 6
  },
  infoLabel: {
    fontSize: 13,
    color: "#aaa"
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginTop: 2
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28
  },
  statBox: {
    flex: 0.48,
    backgroundColor: "rgba(25,25,25,0.9)",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(217,165,21,0.25)"
  },
  statLabel: {
    fontSize: 14,
    color: "#999"
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#d9a515",
    marginTop: 6
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#d9a515",
    marginBottom: 16
  },
  orderCard: {
    backgroundColor: "rgba(25,25,25,0.9)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(217,165,21,0.15)"
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff"
  },
  orderSub: {
    fontSize: 12,
    color: "#888",
    marginTop: 3
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#d9a515"
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d9a515",
    marginTop: 36,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#d9a515",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  logoutText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24
  },
  modalBox: {
    backgroundColor: "#111",
    width: "90%",
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(217,165,21,0.3)",
    alignItems: "center"
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#d9a515",
    marginTop: 12,
    marginBottom: 8
  },
  modalMessage: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 20
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%"
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 25,
    alignItems: "center"
  },
  cancelButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "#555"
  },
  cancelText: {
    color: "#ccc",
    fontWeight: "600"
  },
  confirmButton: {
    backgroundColor: "#d9a515"
  },
  confirmText: {
    color: "#000",
    fontWeight: "700"
  }
});
