import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Modal,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getCategory, getCategoryWiseMenu } from "../../../services/menuServices";
import { API } from "../../../services/login";

type Category = { _id: string; categoryName: string; image: string };
type MenuItem = { _id: string; itemName: string; price: number; image?: string };
type SelectedItem = MenuItem & { quantity: number };

interface Props {
  navigation: any;
  route: { params?: { editable?: boolean; order?: any; onOrderUpdated?: () => void } };
}

const BASE_URL = "http://192.168.1.47:5000";

const AddOrderScreen: React.FC<Props> = ({ navigation, route }) => {
  const { editable = false, order, onOrderUpdated } = route.params || {};

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [token, setToken] = useState("");
  const [loadingCat, setLoadingCat] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isSelectedModalOpen, setIsSelectedModalOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const orderListRef = useRef<FlatList>(null);
  const categoryScrollX = useRef(new Animated.Value(0)).current;

  /* ---------------- LOAD TOKEN ---------------- */
  useEffect(() => {
    AsyncStorage.getItem("token").then(t => t && setToken(t));
  }, []);

  /* ---------------- FETCH CATEGORIES ---------------- */
  useEffect(() => {
    if (token) fetchCategories();
  }, [token]);

  /* ---------------- EDIT MODE ---------------- */
  useEffect(() => {
    if (editable && order) {
      const mapped = order.items.map((it: any) => ({
        _id: it.itemId || it._id,
        itemName: it.name || it.itemName,
        price: it.price,
        quantity: it.quantity,
        image: it.image,
      }));
      setSelectedItems(mapped);
      setTotalAmount(order.totalAmount || 0);
    }
  }, [editable, order]);

  /* ---------------- SEARCH ---------------- */
  useEffect(() => {
    if (!searchTerm) setFilteredItems(items);
    else
      setFilteredItems(
        items.filter(i => i.itemName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [searchTerm, items]);

  /* ---------------- FETCH CATEGORIES ---------------- */
  const fetchCategories = async () => {
    setLoadingCat(true);
    try {
      const res = await getCategory({ page: 1, limit: 30 }, token);
      if (res?.data?.success) {
        setCategories(res.data.data);
        if (res.data.data.length > 0) handleSelectCategory(res.data.data[0]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingCat(false);
    }
  };

  /* ---------------- FETCH ITEMS ---------------- */
  const handleSelectCategory = async (cat: Category) => {
    setSelectedCategory(cat);
    setLoadingItems(true);
    try {
      const res = await getCategoryWiseMenu({ categoryId: cat._id }, token);
      if (res?.data?.success) {
        setItems(res.data.data);
        setFilteredItems(res.data.data);
      } else setItems([]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingItems(false);
    }
  };

  /* ---------------- ADD / REMOVE ITEMS ---------------- */
  const handleAddItem = (item: MenuItem) => {
    setSelectedItems(prev => {
      const exist = prev.find(i => i._id === item._id);
      if (exist)
        return prev.map(i =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      return [...prev, { ...item, quantity: 1 }];
    });
    setTotalAmount(prev => prev + item.price);
    setTimeout(() => orderListRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const handleRemoveItem = (item: SelectedItem) => {
    setSelectedItems(prev => {
      if (item.quantity > 1)
        return prev.map(i =>
          i._id === item._id ? { ...i, quantity: i.quantity - 1 } : i
        );
      return prev.filter(i => i._id !== item._id);
    });
    setTotalAmount(prev => prev - item.price);
  };

  /* ---------------- SAVE ORDER ---------------- */
  const handleSaveOrder = async () => {
    if (selectedItems.length === 0) return;
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return;

    const payload = {
      userId,
      items: selectedItems.map(i => ({
        itemId: i._id,
        name: i.itemName,
        price: i.price,
        quantity: i.quantity,
        note: specialInstructions,
      })),
      totalAmount,
    };

    try {
      const res = editable
        ? await API.put(`/orders/order/${order._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        : await API.post(`/orders`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

      if (res.data.success) {
        if (onOrderUpdated) onOrderUpdated();
        navigation.goBack();
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>{editable ? "Edit Order" : "Create Order"}</Text>

      {/* SEARCH */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#999" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search items..."
          placeholderTextColor="#777"
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <View style={styles.categoryContainer}>
        {loadingCat ? (
          <ActivityIndicator color="#FFD700" style={{ marginVertical: 20 }} />
        ) : (
          <FlatList
            horizontal
            data={categories}
            keyExtractor={c => c._id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8, alignItems: "center" }}
            extraData={selectedCategory}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.catCard,
                  selectedCategory?._id === item._id && styles.catCardActive,
                ]}
                onPress={() => handleSelectCategory(item)}
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri: item.image?.startsWith("http")
                      ? item.image
                      : `${BASE_URL}${item.image}`,
                  }}
                  style={styles.catImage}
                />
                {/* Overlay Text */}
                <View style={styles.catNameOverlay}>
                  <Text
                    style={[
                      styles.catText,
                      selectedCategory?._id === item._id && styles.catTextActive,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.categoryName}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>




      {/* ITEM LIST */}
      {loadingItems ? (
        <ActivityIndicator color="#FFD700" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          ref={orderListRef}
          data={filteredItems}
          keyExtractor={i => i._id}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.itemName}</Text>
                <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => handleAddItem(item)}
              >
                <Ionicons name="add" size={24} color="#030303ff" />
              </TouchableOpacity>
            </View>
          )}
        />

      )}

      {/* BOTTOM CART BAR */}
      <TouchableOpacity
        style={[
          styles.cartBar,
          selectedItems.length > 0 && styles.cartBarActive,
        ]}
        onPress={() => setIsSelectedModalOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.cartText}>
          {selectedItems.length} item(s) • ₹{totalAmount.toFixed(2)}
        </Text>
      </TouchableOpacity>

      {/* Selected Items Modal */}
      <Modal
        visible={isSelectedModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSelectedModalOpen(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selected Items</Text>

            <FlatList
              data={selectedItems}
              keyExtractor={i => i._id}
              style={{ maxHeight: 350 }}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              renderItem={({ item }) => (
                <View style={styles.modalItemCard}>
                  <View style={styles.modalItemInfo}>
                    <Text style={styles.itemName}>{item.itemName}</Text>
                    <View style={styles.modalQtyRow}>
                      <TouchableOpacity onPress={() => handleRemoveItem(item)}>
                        <Ionicons name="remove-circle" size={28} color="#FFD700" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => handleAddItem(item)}>
                        <Ionicons name="add-circle" size={28} color="#FFD700" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.itemPrice}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              )}
            />

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Special Instructions / Note</Text>
              <TextInput
                style={styles.input}
                placeholder="Add note (e.g., No onions, extra spicy)"
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                multiline
              />
            </View>


            <View style={styles.modalFooter}>
              <Text style={styles.totalText}>Total: ₹{totalAmount.toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.saveBtnModal}
                onPress={() => {
                  handleSaveOrder();
                  setIsSelectedModalOpen(false);
                }}
              >
                <Text style={styles.saveBtnText}>{editable ? "Update Order" : "Save Order"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setIsSelectedModalOpen(false)}
            >
              <Ionicons name="close-circle" size={32} color="#FFD700" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddOrderScreen;

/* ---------------- STYLES ----------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b0b", paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#FFD700", marginVertical: 12 },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#222",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 16 },
  catCard: {
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },

  catImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  catNameOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  catText: {
    color: "#ccc",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  catCardActive: {
    borderColor: "#FFD700",
  },

  catTextActive: {
    color: "#FFD700",
  },


  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FFD70020",
  },
  itemImage: { width: 60, height: 60, borderRadius: 12 },
  itemName: { color: "#fff", fontSize: 17, fontWeight: "700", flex: 1 },
  itemPrice: { color: "#FFD700", fontWeight: "800", fontSize: 17 },
  addBtn: {
    backgroundColor: "#FFD700",
    padding: 8,
    borderRadius: 10,
  },

  cartBar: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#222",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#555",
    alignItems: "center",
  },
  cartBarActive: {
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 6,
  },
  cartText: { color: "#FFD700", fontWeight: "700", fontSize: 16 },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
    backgroundColor: "#0b0b0b",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#FFD700", marginBottom: 16 },
  modalItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FFD70030",
  },
  modalItemImage: { width: 60, height: 60, borderRadius: 12, marginRight: 12 },
  modalItemInfo: { flex: 1, justifyContent: "center" },
  modalQtyRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  qtyText: { color: "#FFD700", fontWeight: "700", fontSize: 18, marginHorizontal: 8 },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  totalText: { color: "#FFD700", fontWeight: "800", fontSize: 18 },
  saveBtnModal: {
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  saveBtnText: { fontSize: 16, fontWeight: "800", color: "#111" },
  closeBtn: { position: "absolute", top: 12, right: 12 },
  categoryContainer: {
    height: 120,       // Enough for 100px card + padding
    marginBottom: 16,  // spacing between category and items
  },
inputContainer: {
  marginVertical: 10,
},
label: {
  fontSize: 16,
  fontWeight: "600",
  marginBottom: 5,
},
input: {
  borderWidth: 1,
  borderColor: "#FFD700",
  borderRadius: 8,
  padding: 10,
  fontSize: 16,
  backgroundColor: "#080808ff",
  minHeight: 50,
},

});
