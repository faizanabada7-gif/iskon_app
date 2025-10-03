import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Image,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { API } from "../../../services/login";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserRole = "cook" | "waiter" | "admin";

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  done?: boolean;
  status?: string;
}

interface Order {
  _id: string;
  orderNumber: number;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  waiterName?: string;
  orderDate?: string;
  orderTime?: string;
}

interface Props {
  order: Order;
  userRole: UserRole;
  updateOrderStatus: (
    id: string,
    status: string,
    paymentMethod?: string
  ) => void;
  onPress?: () => void;
}

export const OrderCard: React.FC<Props> = ({
  order,
  userRole,
  updateOrderStatus,
  onPress,
}) => {
  const [itemsState, setItemsState] = useState(order.items);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState<"Cash" | "Online" | null>(null);
  const [cashAmount, setCashAmount] = useState<string>("");
  const [error, setError] = useState("");

  // Compute progress dynamically
  const progress = useMemo(() => {
    const total = itemsState.length;
    const doneCount = itemsState.filter((i) => i.status === "Ready").length;
    return total ? Math.round((doneCount / total) * 100) : 0;
  }, [itemsState]);

  // Cook marks item done
  const markItemDone = async (itemId: string, currentlyDone: boolean) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const newStatus = currentlyDone ? "Preparing" : "Ready";

      await API.put(
        `/orders/${order._id}/items/${itemId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItemsState((prev) =>
        prev.map((i) => (i._id === itemId ? { ...i, status: newStatus } : i))
      );
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to update item status");
    }
  };

  const handleCompletePress = () => setModalVisible(true);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      {/* Order number and status */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.orderNo}>Order #{order.orderNumber}</Text>
      </View>

      {/* Waiter and Time */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 4 }}>
        <Text style={styles.detailText}>Order By: {order.waiterName || "Unknown"}</Text>
        <Text style={styles.detailText}>
          {order.orderDate || ""} {order.orderTime || ""}
        </Text>
      </View>

      {/* Progress Bar */}
      {(userRole === "cook" || userRole === "waiter" || userRole === "admin") && (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: progress > 0 ? "#4CAF50" : "#FFD700" },
            ]}
          />
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      )}

      {/* Items List */}
      <ScrollView style={{ marginBottom: 8 }} nestedScrollEnabled>
        {itemsState.map((i) => (
          <View key={i._id} style={styles.itemRow}>
            <Text style={styles.itemName}>{i.name}</Text>
            <Text style={styles.itemQty}>×{i.quantity}</Text>
            <Text style={styles.itemPrice}>₹{i.price}</Text>
            <View style={styles.itemDoneCell}>
              {userRole === "cook" ? (
                <TouchableOpacity
                  style={[
                    styles.doneButton,
                    i.status === "Ready" && {
                      backgroundColor: "#4CAF50",
                      borderColor: "#4CAF50",
                    },
                  ]}
                  onPress={() => markItemDone(i._id, i.status === "Ready")}
                >
                  <Ionicons
                    name={i.status === "Ready" ? "checkmark-circle" : "checkmark-outline"}
                    size={18}
                    color={i.status === "Ready" ? "#fff" : "#FFD700"}
                  />
                </TouchableOpacity>
              ) : (userRole === "waiter" || userRole === "admin") && i.status === "Ready" ? (
                <View
                  style={[styles.doneButton, { backgroundColor: "#4CAF50", borderColor: "#4CAF50" }]}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.total}>Total: ₹{order.totalAmount}</Text>

      {/* Complete Button */}
      {userRole !== "cook" && progress === 100 && order.status !== "Completed" && (
        <TouchableOpacity style={styles.completeButton} activeOpacity={0.85} onPress={handleCompletePress}>
          <Text style={styles.completeButtonText}>Mark Completed</Text>
        </TouchableOpacity>
      )}

      {/* Payment Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#ff0800ff" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Confirm Payment</Text>
            <Text style={styles.modalMessage}>
              Order #{order.orderNumber} - ₹{order.totalAmount}
            </Text>

            {/* Payment Buttons */}
            <View style={styles.paymentButtons}>
              <TouchableOpacity
                style={[styles.payButton, { backgroundColor: paymentType === "Cash" ? "#FFD700" : "#222" }]}
                onPress={() => {
                  setPaymentType("Cash");
                  setCashAmount("");
                  setError("");
                }}
              >
                <Text style={[styles.payButtonText, { color: paymentType === "Cash" ? "#111" : "#FFD700" }]}>
                  Cash
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.payButton, { backgroundColor: paymentType === "Online" ? "#FFD700" : "#222" }]}
                onPress={() => {
                  setPaymentType("Online");
                  setCashAmount("");
                  setError("");
                }}
              >
                <Text style={[styles.payButtonText, { color: paymentType === "Online" ? "#111" : "#FFD700" }]}>
                  Online
                </Text>
              </TouchableOpacity>
            </View>

            {/* Cash Input */}
            {paymentType === "Cash" && (
              <View style={{ width: "100%", marginVertical: 16 }}>
                <Text style={styles.label}>Enter amount</Text>
                <TextInput
                  placeholder="Enter amount"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={cashAmount}
                  onChangeText={setCashAmount}
                  style={styles.cashInput}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>
            )}

            {/* Online QR */}
            {paymentType === "Online" && (
              <View style={{ alignItems: "center", marginVertical: 16 }}>
                <View style={styles.qrContainer}>
                  <Image source={require("../../../assets/images/cleaned_qr.png")} style={styles.qrImage} />
                </View>
                <Text style={styles.qrLabel}>Scan to Pay</Text>
              </View>
            )}

            {/* Complete Button */}
            <TouchableOpacity
              style={[styles.completeButton, { marginTop: 10 }]}
              activeOpacity={0.85}
              onPress={async () => {
                if (paymentType === "Cash" && Number(cashAmount) !== order.totalAmount) {
                  setError("Entered amount must equal total amount!");
                  return;
                }

                try {
                  const token = await AsyncStorage.getItem("token");
                  if (!token) throw new Error("No token found");

                  await API.put(
                    `/orders/${order._id}/status`,
                    {
                      status: "Completed",
                      paymentMethod: paymentType || "Cash",
                      cashAmount: paymentType === "Cash" ? Number(cashAmount) : undefined,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );

                  updateOrderStatus(order._id, "Completed", paymentType || "Cash");
                  setModalVisible(false);
                  setPaymentType(null);
                  setCashAmount("");
                  setError("");
                } catch (err: any) {
                  console.error(err);
                  Alert.alert("Error", "Failed to complete order");
                }
              }}
            >
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
  },
  orderNo: { fontSize: 18, fontWeight: "700", color: "#FFD700" },
  status: { fontSize: 14, fontWeight: "600", color: "#fff" },
  detailText: { fontSize: 14, color: "#ccc" },
  progressFill: { height: "100%", borderRadius: 10 },
  progressContainer: { height: 18, borderRadius: 10, backgroundColor: "rgba(255,215,0,0.1)", overflow: "hidden", marginBottom: 12, position: "relative" },
  progressText: { position: "absolute", alignSelf: "center", fontSize: 12, fontWeight: "700", color: "#fff" },
  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: "rgba(255,215,0,0.15)" },
  itemName: { flex: 1, color: "#fff", fontSize: 15 },
  itemQty: { width: 40, textAlign: "center", color: "#bbb" },
  itemPrice: { width: 70, textAlign: "right", color: "#FFD700", fontWeight: "600" },
  itemDoneCell: { width: 50, alignItems: "center", justifyContent: "center" },
  doneButton: { borderWidth: 1, borderColor: "#FFD700", borderRadius: 16, padding: 4, minWidth: 32, minHeight: 32, alignItems: "center", justifyContent: "center" },
  total: { marginTop: 6, fontSize: 16, fontWeight: "700", color: "#FFD700", textAlign: "right" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "85%", backgroundColor: "#111", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "#FFD700", alignItems: "center", position: "relative" },
  modalCloseButton: { position: "absolute", top: 12, right: 12, zIndex: 10 },
  modalTitle: { fontSize: 24, fontWeight: "800", color: "#FFD700", marginBottom: 12 },
  modalMessage: { fontSize: 16, color: "#fff", textAlign: "center", marginBottom: 20 },
  paymentButtons: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 16 },
  payButton: { flex: 1, paddingVertical: 14, borderRadius: 14, marginHorizontal: 6 },
  payButtonText: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  cashInput: { backgroundColor: "rgba(255,215,0,0.1)", color: "#fff", borderRadius: 12, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: "#FFD700", fontSize: 16 },
  label: { color: "#FFD700", fontWeight: "700", marginBottom: 6, fontSize: 14 },
  errorText: { color: "#FF5252", marginTop: 6, fontWeight: "600" },
  qrContainer: { width: 260, height: 260, borderWidth: 4, borderColor: "#FFD700", borderRadius: 16, overflow: "hidden", shadowColor: "#FFD700", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12 },
  qrImage: { width: "100%", height: "100%", resizeMode: "contain" },
  qrLabel: { color: "#FFD700", fontSize: 18, fontWeight: "700", marginTop: 12 },
  completeButton: { alignSelf: "stretch", backgroundColor: "#4CAF50", paddingVertical: 14, borderRadius: 22, shadowColor: "#4CAF50", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 6 },
  completeButtonText: { color: "#fff", fontWeight: "800", fontSize: 16, textAlign: "center" },
});
