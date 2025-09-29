// src/screens/orders/components/OrderCard.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { OrderHeader } from "./OrderHeader";
import { OrderItemsList } from "./OrderItemsList";

type OrderItem = {
  id?: string | number;
  name: string;
  price: number;
  quantity: number;
  total: number;
  newAddedAt?: string | Date;
};

type Order = {
  id: string;
  orderNumber: string;
  status: "Preparing" | "Ready" | "Completed" | "Cancelled";
  totalAmount: number; // fixed property name
  items: OrderItem[];
};

type OrderCardProps = {
  order: Order;
  userRole: "waiter" | "cook" | "admin";
  updateOrderStatus: (id: string, status: string) => void;
  handleDeleteOrder: (id: string) => void;
};

export function OrderCard({
  order,
  userRole,
  updateOrderStatus,
  handleDeleteOrder,
}: OrderCardProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");

  const handlePrint = () => {
    Alert.alert("Print", "This would trigger the print/receipt flow.");
  };

  return (
    <View style={styles.card}>
      <OrderHeader
        order={order as {
          id: string;
          orderNumber: string;
          status: "Preparing" | "Ready" | "Completed" | "Cancelled";
        }}
        userRole={userRole}
        updateOrderStatus={updateOrderStatus}
        setShowPaymentConfirm={setShowPayment}
        setShowQR={setShowQR}
      />

      <View style={styles.itemsContainer}>
        <OrderItemsList items={order.items} totalPrice={order.totalAmount} />
      </View>

      {showPayment && !showQR && (
        <View style={styles.paymentContainer}>
          <Text style={styles.paymentTitle}>Confirm Payment</Text>

          <View style={styles.paymentRow}>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                paymentMethod === "cash" && styles.paymentButtonActive,
              ]}
              onPress={() => setPaymentMethod("cash")}
            >
              <Text style={styles.paymentButtonText}>Cash</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentButton,
                paymentMethod === "online" && styles.paymentButtonActive,
              ]}
              onPress={() => setPaymentMethod("online")}
            >
              <Text style={styles.paymentButtonText}>Online</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => {
              if (paymentMethod === "online") {
                setShowQR(true);
                setShowPayment(false);
              } else {
                updateOrderStatus(order.id, "completed");
                handlePrint();
                setShowPayment(false);
              }
            }}
          >
            <Text style={styles.completeText}>
              {paymentMethod === "cash" ? "Complete & Print" : "Confirm & Complete"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPayment(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {showQR && (
        <View style={styles.paymentContainer}>
          <Text style={styles.paymentTitle}>Scan to Pay</Text>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => {
              updateOrderStatus(order.id, "completed");
              setShowQR(false);
            }}
          >
            <Text style={styles.completeText}>Print Bill</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => setShowQR(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        {userRole === "admin" && (
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity style={styles.footerButton} onPress={handlePrint}>
              <Icon name="print-outline" size={20} color="#FFD700" />
              <Text style={styles.footerButtonText}>Print</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerButtonDelete}
              onPress={() => handleDeleteOrder(order.id)}
            >
              <Icon name="trash-outline" size={20} color="#FFD700" />
              <Text style={styles.footerButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1c1c1e",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  itemsContainer: {
    marginVertical: 12,
    maxHeight: 200,
  },
  paymentContainer: {
    backgroundColor: "#1f1f21",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
    gap: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 12,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  footerButtonDelete: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#FF5555",
    shadowColor: "#FF5555",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  footerButtonText: {
    color: "#FFD700",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 14,
  },
  paymentTitle: {
    color: "#FFD700",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  paymentButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#333",
    alignItems: "center",
  },
  paymentButtonActive: {
    backgroundColor: "#7f5af0",
  },
  paymentButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  completeButton: {
    backgroundColor: "#FFD700",
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    alignItems: "center",
  },
  completeText: {
    color: "#000",
    fontWeight: "700",
    textAlign: "center",
  },
  cancelButton: {
    padding: 10,
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#555",
    alignItems: "center",
  },
  cancelText: {
    color: "#fff",
    textAlign: "center",
  },
});
