import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCategoryWiseMenu } from "../../../services/menuServices";
import { API } from "../../../services/login";
import socket from "../../../socket/socket";

type MenuItem = { _id: string; itemName: string; price: number };
type SelectedItem = MenuItem & { quantity: number };

type AddOrderScreenProps = { navigation: any; route: any , onOrderUpdated?: () => Promise<void>;};

const AddOrderScreen: React.FC<AddOrderScreenProps> = ({ navigation, route }) => {
  const { editable = false, order,onOrderUpdated } = route.params || {}; // 👈 get params

  const [items, setItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [token, setToken] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const selectedListRef = useRef<FlatList>(null);

  // Load token
  useEffect(() => {
    AsyncStorage.getItem("token").then((t) => {
      if (t) setToken(t);
    });
  }, []);

  // Fetch menu items
  useEffect(() => {
    if (!token) return;
    fetchItems();
  }, [token]);

  // Setup editing mode
  useEffect(() => {
    if (editable && order) {
      const mapped = order.items.map((it: any) => ({
        _id: it.itemId || it._id,
        itemName: it.name || it.itemName,
        price: it.price,
        quantity: it.quantity,
      }));
      setSelectedItems(mapped);
      setTotalAmount(order.totalAmount || 0);
    }
  }, [editable, order]);

  // Search filter
  useEffect(() => {
    if (!searchTerm) setFilteredItems(items);
    else
      setFilteredItems(
        items.filter((i) =>
          i.itemName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
  }, [searchTerm, items]);

  // Fetch menu items
  const fetchItems = async () => {
    try {
      const res = await getCategoryWiseMenu({}, token);
      if (res?.data?.success) setItems(res.data.data);
      else console.log("No items found");
    } catch (err) {
      console.log("Error fetching items:", err);
    }
  };

  // Add item to selected list
  const handleAddItem = (item: MenuItem) => {
    setSelectedItems((prev) => {
      const exist = prev.find((i) => i._id === item._id);
      if (exist)
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      return [...prev, { ...item, quantity: 1 }];
    });
    setTotalAmount((prev) => prev + item.price);

    setTimeout(() => selectedListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // Remove item
  const handleRemoveItem = (item: SelectedItem) => {
    setSelectedItems((prev) => {
      if (item.quantity > 1)
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity - 1 } : i
        );
      return prev.filter((i) => i._id !== item._id);
    });
    setTotalAmount((prev) => prev - item.price);
  };

  // Save or update order
const handleSaveOrder = async () => {
  if (selectedItems.length === 0) return;

  const userId = await AsyncStorage.getItem("userId");
  if (!userId) return;

  const payload = {
    userId,
    items: selectedItems.map((i) => ({
      itemId: i._id,
      name: i.itemName,
      price: i.price,
      quantity: i.quantity,
    })),
    totalAmount,
  };

  try {
    let res;
    if (editable && order?._id) {
      res = await API.put(`/orders/order/${order._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      res = await API.post("/orders", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    if (res.data.success) {
      // ✅ Call the parent callback
      if (onOrderUpdated) await onOrderUpdated(); 
      navigation.goBack();
    }
  } catch (err) {
    console.log(err);
  }
};

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{editable ? "Edit Order" : "Create Order"}</Text>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color="#777" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <FlatList
          ref={selectedListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={selectedItems}
          keyExtractor={(item) => item._id}
          style={{ height: 140, marginBottom: 12 }}
          renderItem={({ item }) => (
            <View style={styles.selectedItemCard}>
              <Text style={styles.itemText}>{item.itemName}</Text>
              <View style={styles.qtyContainer}>
                <TouchableOpacity onPress={() => handleRemoveItem(item)}>
                  <Ionicons name="remove-circle-outline" size={24} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => handleAddItem(item)}>
                  <Ionicons name="add-circle-outline" size={24} color="#FFD700" />
                </TouchableOpacity>
              </View>
              <Text style={styles.priceText}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          )}
        />
      )}

      {/* Total */}
      <Text style={styles.totalValue}>Total: ₹{totalAmount.toFixed(2)}</Text>

      {/* Menu Items */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.menuItem} onPress={() => handleAddItem(item)}>
            <Text style={styles.itemText}>{item.itemName}</Text>
            <Text style={styles.priceText}>₹{item.price.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveOrder}>
        <Text style={styles.saveButtonText}>{editable ? "Update Order" : "Save Order"}</Text>
        <Ionicons name="checkmark-done-outline" size={22} color="#000" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  );
};

export default AddOrderScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d0d", padding: 16 },
  headerContainer: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#FFD700", marginBottom: 12 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c2c2c",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: { flex: 1, color: "#fff", fontSize: 16 },
  selectedItemCard: {
    backgroundColor: "#222",
    padding: 14,
    borderRadius: 16,
    marginRight: 14,
    minWidth: 160,
    borderWidth: 1,
    borderColor: "#FFD70020",
  },
  qtyContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 6 },
  qtyText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  itemText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  priceText: { color: "#FFD700", fontWeight: "700", fontSize: 16 },
  totalValue: { color: "#FFD700", fontWeight: "800", fontSize: 20, textAlign: "right", marginVertical: 8 },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1f1f1f",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FFD70020",
  },
  saveButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveButtonText: { fontSize: 18, fontWeight: "800", color: "#111" },
});
