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
  onPress?: () => void;

}

export const OrderCard: React.FC<Props> = ({
  order,
  userRole,
  updateOrderStatus,
  onPress,
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

    // Notify parent to update order status
    const allDone = itemsState.every((i) => i._id === id ? !i.done : i.done);
    if (allDone) {
      updateOrderStatus(order._id, "Ready"); // or whatever status you want
    }
  };


  const handleCompletePress = () => setModalVisible(true);

  const handlePayment = (method: "Cash" | "Online" | "Complete") => {
    if (method === "Cash") {
      setPaymentType("Cash");
      setCashAmount("");
      setError("");
    } else if (method === "Online") {
      setPaymentType("Online");
    } else if (method === "Complete") {
      // Validate Cash
      if (paymentType === "Cash" && Number(cashAmount) !== order.totalAmount) {
        setError("Entered amount must equal total amount!");
        return;
      }
      updateOrderStatus(order._id, "Completed", paymentType || "Cash");
      setModalVisible(false);
      setPaymentType(null);
      setCashAmount("");
      setError("");
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress} // call the onPress passed from parent
      style={styles.card}
    >
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
        onRequestClose={() => {
          setModalVisible(false);
          setPaymentType(null);
          setCashAmount("");
          setError("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setModalVisible(false);
                setPaymentType(null);
                setCashAmount("");
                setError("");
              }}
            >
              <Ionicons name="close" size={28} color="#ff0800ff" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Confirm Payment</Text>
            <Text style={styles.modalMessage}>
              Order #{order.orderNumber} - ₹{order.totalAmount}
            </Text>

            {/* Payment Type Buttons */}
            <View style={styles.paymentButtons}>
              <TouchableOpacity
                style={[
                  styles.payButton,
                  { backgroundColor: paymentType === "Cash" ? "#FFD700" : "#222" },
                ]}
                onPress={() => {
                  setPaymentType("Cash");
                  setCashAmount("");
                  setError("");
                }}
              >
                <Text
                  style={[
                    styles.payButtonText,
                    { color: paymentType === "Cash" ? "#111" : "#FFD700" },
                  ]}
                >
                  Cash
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.payButton,
                  { backgroundColor: paymentType === "Online" ? "#FFD700" : "#222" },
                ]}
                onPress={() => {
                  setPaymentType("Online");
                  setCashAmount("");
                  setError("");
                }}
              >
                <Text
                  style={[
                    styles.payButtonText,
                    { color: paymentType === "Online" ? "#111" : "#FFD700" },
                  ]}
                >
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
                  <Image
                    source={require("../../../assets/images/cleaned_qr.png")}
                    style={styles.qrImage}
                  />
                </View>
                <Text style={styles.qrLabel}>Scan to Pay</Text>
              </View>
            )}

            {/* Complete Button */}
            <TouchableOpacity
              style={[styles.completeButton, { marginTop: 10 }]}
              activeOpacity={0.85}
              onPress={() => {
                if (paymentType === "Cash" && Number(cashAmount) !== order.totalAmount) {
                  setError("Entered amount must equal total amount!");
                  return;
                }
                updateOrderStatus(order._id, "Completed", paymentType || "Cash");
                setModalVisible(false);
                setPaymentType(null);
                setCashAmount("");
                setError("");
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#111",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#FFD700",
    alignItems: "center",
    position: "relative",
  },
  modalCloseButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFD700",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  paymentButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  payButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    marginHorizontal: 6,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  cashInput: {
    backgroundColor: "rgba(255,215,0,0.1)",
    color: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#FFD700",
    fontSize: 16,
  },
  label: {
    color: "#FFD700",
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 14,
  },
  errorText: { color: "#FF5252", marginTop: 6, fontWeight: "600" },
  qrContainer: {
    width: 260,
    height: 260,
    borderWidth: 4,
    borderColor: "#FFD700",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  qrImage: { width: "100%", height: "100%", resizeMode: "contain" },
  qrLabel: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  completeButton: {
    alignSelf: "stretch",
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 22,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  completeButtonText: { color: "#fff", fontWeight: "800", fontSize: 16, textAlign: "center" },

});
