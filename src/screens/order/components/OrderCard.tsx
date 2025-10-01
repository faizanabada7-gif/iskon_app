import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

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

interface Props {
  order: Order;
  userRole: UserRole;
  updateOrderStatus: (
    id: string,
    status: string,
    paymentMethod?: string
  ) => void;
}

export const OrderCard: React.FC<Props> = ({
  order,
  userRole,
  updateOrderStatus,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [itemsState, setItemsState] = useState(order.items);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState<"Cash" | "Online" | null>(null);
  const [cashAmount, setCashAmount] = useState<string>("");
  const [error, setError] = useState("");

  const displayedItems = showAll ? itemsState : itemsState.slice(0, 5);

  const progress = useMemo(() => {
    const total = itemsState.length;
    const doneCount = itemsState.filter((i) => i.done).length;
    return total ? Math.round((doneCount / total) * 100) : 0;
  }, [itemsState]);

  const markItemDone = (id: string) => {
    setItemsState((prev) =>
      prev.map((i) => (i._id === id ? { ...i, done: !i.done } : i))
    );
  };

  const handleCompletePress = () => setModalVisible(true);

  const handlePayment = (method: "Cash" | "Online") => {
    if (method === "Cash") {
      setPaymentType("Cash");
      setCashAmount("");
      setError("");
    } else {
      // Online or Complete button
      if (paymentType === "Cash") {
        // Check if entered amount matches total
        if (Number(cashAmount) !== order.totalAmount) {
          setError("Entered amount must equal total amount!");
          return;
        }
      }
      updateOrderStatus(order._id, "Completed", method);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.card}>
      {userRole === "cook" && order.status === "Preparing" && (
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

      <Text style={styles.orderNumber}>#{order.orderNumber}</Text>

      <ScrollView
        style={styles.itemsContainer}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {displayedItems.map((i) => (
          <View key={i._id} style={styles.itemRow}>
            <Text style={styles.itemName}>{i.name}</Text>
            <Text style={styles.itemQty}>×{i.quantity}</Text>
            <Text style={styles.itemPrice}>₹{i.price}</Text>

            {userRole === "cook" && order.status === "Preparing" && (
              <TouchableOpacity
                style={[
                  styles.doneButton,
                  i.done && { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
                ]}
                onPress={() => markItemDone(i._id)}
              >
                <Ionicons
                  name={i.done ? "checkmark-circle" : "checkmark-outline"}
                  size={18}
                  color={i.done ? "#fff" : "#FFD700"}
                />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {itemsState.length > 5 && !showAll && (
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setShowAll(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.moreButtonText}>Show More</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.total}>Total: ₹{order.totalAmount}</Text>

      {userRole !== "cook" && order.status === "Ready" && (
        <TouchableOpacity
          style={styles.completeButton}
          activeOpacity={0.85}
          onPress={handleCompletePress}
        >
          <Text style={styles.completeButtonText}>Mark Completed</Text>
        </TouchableOpacity>
      )}

      {/* Payment Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Payment</Text>
            <Text style={styles.modalMessage}>
              Order #{order.orderNumber} - ₹{order.totalAmount}
            </Text>

            {/* Cash Input */}
            {paymentType === "Cash" && (
              <View style={{ width: "100%", marginBottom: 12 }}>
                <Text style={{ color: "#FFD700", fontWeight: "700", marginBottom: 6 }}>
                  Enter amount
                </Text>
                <TextInput
                  placeholder="Enter amount"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={cashAmount}
                  onChangeText={(text) => setCashAmount(text)}
                  style={styles.cashInput}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>
            )}

            <View style={styles.paymentButtons}>
              <TouchableOpacity
                style={[
                  styles.payButton,
                  { backgroundColor: paymentType === "Cash" ? "#FFD700" : "#FFD700" },
                ]}
                onPress={() => handlePayment("Cash")}
              >
                <Text style={styles.payButtonText}>Cash</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.payButton,
                  { backgroundColor: paymentType === "Cash" ? "#4CAF50" : "#4CAF50" },
                ]}
                onPress={() => handlePayment(paymentType === "Cash" ? "Complete" : "Online")}
              >
                <Text style={styles.payButtonText}>
                  {paymentType === "Cash" ? "Complete" : "Online"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "rgba(25,25,25,0.92)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
    padding: 14,
    shadowColor: "#FFD700",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    minHeight: 320,
    marginVertical: 8,
  },
  progressFill: { height: "100%", borderRadius: 10 },
  progressContainer: { height: 18, borderRadius: 10, backgroundColor: "rgba(255,215,0,0.1)", overflow: "hidden", marginBottom: 12, position: "relative" },
  progressText: { position: "absolute", alignSelf: "center", fontSize: 12, fontWeight: "700", color: "#fff" },
  orderNumber: { fontSize: 20, fontWeight: "800", color: "#FFD700", marginBottom: 12, textAlign: "center" },
  itemsContainer: { flexGrow: 0, maxHeight: 180, marginBottom: 8 },
  itemRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: "rgba(255,215,0,0.15)" },
  itemName: { flex: 1, color: "#fff", fontSize: 15 },
  itemQty: { width: 36, color: "#bbb", textAlign: "center" },
  itemPrice: { width: 60, textAlign: "right", color: "#FFD700", fontWeight: "600" },
  doneButton: { backgroundColor: "transparent", borderColor: "#FFD700", borderWidth: 1, borderRadius: 14, paddingVertical: 4, paddingHorizontal: 8, marginLeft: 6 },
  moreButton: { alignSelf: "center", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 14, backgroundColor: "rgba(255,215,0,0.15)", marginVertical: 6 },
  moreButtonText: { color: "#FFD700", fontWeight: "600", fontSize: 13 },
  total: { marginTop: 6, fontSize: 16, fontWeight: "700", color: "#FFD700", textAlign: "right" },
  completeButton: { marginTop: "auto", alignSelf: "stretch", backgroundColor: "#4CAF50", paddingVertical: 10, borderRadius: 22, shadowColor: "#4CAF50", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 6 },
  completeButtonText: { color: "#fff", fontWeight: "800", fontSize: 15, textAlign: "center", letterSpacing: 0.6 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "80%", backgroundColor: "#111", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "#FFD700", alignItems: "center" },
  modalTitle: { fontSize: 22, fontWeight: "800", color: "#FFD700", marginBottom: 12 },
  modalMessage: { fontSize: 16, color: "#fff", marginBottom: 20, textAlign: "center" },
  paymentButtons: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  payButton: { flex: 1, paddingVertical: 12, borderRadius: 14, marginHorizontal: 6 },
  payButtonText: { color: "#111", fontWeight: "700", fontSize: 16, textAlign: "center" },
  cashInput: {
    backgroundColor: "rgba(255,215,0,0.1)",
    color: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  errorText: { color: "#FF5252", marginTop: 6, fontWeight: "600" },
});
