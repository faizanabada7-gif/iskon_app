import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCategoryWiseMenu } from "../../../services/menuServices";
import { API } from "../../../services/login";

type MenuItem = {
    _id: string;
    itemName: string;
    price: number;
};

type AddOrderScreenProps = {
    navigation: any;
    refreshOrders?: () => void;
};

type SelectedItem = MenuItem & { quantity: number };

const AddOrderScreen: React.FC<AddOrderScreenProps> = ({ navigation, refreshOrders }) => {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [token, setToken] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchToken = async () => {
            const t = await AsyncStorage.getItem("token");
            if (t) setToken(t);
        };
        fetchToken();
    }, []);

    useEffect(() => {
        if (!token) return;
        fetchAllItems();
    }, [token]);

    useEffect(() => {
        if (!searchTerm) setFilteredItems(items);
        else {
            const filtered = items.filter(item =>
                item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredItems(filtered);
        }
    }, [searchTerm, items]);

    const fetchAllItems = async () => {
        try {
            const res = await getCategoryWiseMenu({}, token);
            if (res?.data?.success) setItems(res.data.data);
        } catch (err) {
            console.log("Error fetching items:", err);
        }
    };

    const handleAddItem = (item: MenuItem) => {
        setSelectedItems(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { ...item, quantity: 1 }];
        });
        setTotalAmount(prev => prev + item.price);
    };

    const handleRemoveItem = (item: SelectedItem) => {
        setSelectedItems(prev => {
            if (item.quantity > 1) return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity - 1 } : i);
            return prev.filter(i => i._id !== item._id);
        });
        setTotalAmount(prev => prev - item.price);
    };

    const handleSaveOrder = async () => {
        if (selectedItems.length === 0) {
            // alert("Please add at least one item to the order.");
            console.log("Please add at least one item to the order.")
            return;
        }

        const orderPayload = {
            items: selectedItems.map(i => ({
                itemId: i._id,
                name: i.itemName,
                price: i.price,
                quantity: i.quantity,
            })),
            totalAmount,
            // tableNumber or note can be added if you have inputs for them
            note: "",
            // tableNumber: someValue
        };

        try {
            const res = await API.post("/orders", orderPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setSelectedItems([]);
                setTotalAmount(0);
                if (refreshOrders) refreshOrders();
                navigation.goBack();
            } else {
                // alert(res.data.message || "Failed to create order");
                console.log(res.data.message || "Failed to create order")
            }
        } catch (err: any) {
            console.error("Error creating order:", err);
            // alert(err.response?.data?.message || "Something went wrong!");
        }
    };

    return (
        <View style={styles.container}>
            {/* Header & Search */}
            <View style={styles.headerContainer}>
                <View style={styles.card}>
                    {/* Header Row */}
                    <View style={styles.row}>
                        {/* Back Button */}
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back-outline" size={24} color="#FFD700" />
                            {/* Title */}
                            <View style={styles.titleWrap}>
                                <Text style={styles.title}>Orders</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.filterRow}>
                        <View style={styles.searchWrap}>
                            <Ionicons name="search-outline" size={18} color="#777" style={{ marginRight: 8 }} />
                            <TextInput
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                                style={styles.input}
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>
                </View>
            </View>


            {/* Selected Items Horizontal Scroll */}
            {selectedItems.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedScroll}>
                        {selectedItems.map(item => (
                            <View key={item._id} style={styles.selectedItemCard}>
                                <Text style={styles.itemText}>{item.itemName}</Text>
                                <View style={styles.qtyContainer}>
                                    <TouchableOpacity onPress={() => handleRemoveItem(item)} style={styles.qtyBtn}>
                                        <Ionicons name="remove-circle-outline" size={24} color="#FFD700" />
                                    </TouchableOpacity>
                                    <Text style={styles.qtyText}>{item.quantity}</Text>
                                    <TouchableOpacity onPress={() => handleAddItem(item)} style={styles.qtyBtn}>
                                        <Ionicons name="add-circle-outline" size={24} color="#FFD700" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.priceText}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Total Amount Below Horizontal Scroll */}
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
                    </View>
                </View>
            )}

            {/* All Items */}
            <FlatList
                data={filteredItems}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <View style={styles.menuItem}>
                        <Text style={styles.itemText}>{item.itemName}</Text>
                        <Text style={styles.priceText}>₹{item.price.toFixed(2)}</Text>
                        <TouchableOpacity onPress={() => handleAddItem(item)} style={styles.addBtn}>
                            <Ionicons name="add-circle-outline" size={28} color="#FFD700" />
                        </TouchableOpacity>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveOrder}>
                <Text style={styles.saveButtonText}>Save Order</Text>
                <Ionicons name="checkmark-done-outline" size={22} color="#000" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
        </View>
    );
};

export default AddOrderScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#121212", padding: 16 },
    header: { marginBottom: 16 },
    headerTitle: { fontSize: 28, fontWeight: "700", color: "#FFD700", marginBottom: 12 },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1c1c1c",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    searchInput: { flex: 1, marginLeft: 8, color: "#fff", fontSize: 16 },

    selectedScroll: { marginBottom: 8 },

    selectedItemCard: {
        backgroundColor: "#1f1f1f",
        padding: 12,
        borderRadius: 12,
        marginRight: 12,
        minWidth: 150,
    },
    qtyContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 6 },
    qtyBtn: { paddingHorizontal: 6 },
    qtyText: { color: "#fff", fontWeight: "600", fontSize: 16 },
    itemText: { color: "#fff", fontSize: 16, fontWeight: "500" },
    priceText: { color: "#FFD700", fontWeight: "600", fontSize: 16 },

    totalContainer: { flexDirection: "row", justifyContent: "flex-end", paddingVertical: 8 },
    totalLabel: { color: "#fff", fontWeight: "600", fontSize: 18, marginRight: 8 },
    totalValue: { color: "#FFD700", fontWeight: "700", fontSize: 20 },

    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1c1c1c",
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
    },

    addBtn: { padding: 4 },

    saveButton: {
        position: "absolute",
        bottom: 20,
        left: 16,
        right: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,

        backgroundColor: "#d9a515", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8
    },
    saveButtonText: { fontSize: 18, fontWeight: "700", color: "#111" },

    headerContainer: {
        marginBottom: 16,
    },
    card: {
        backgroundColor: "#1c1c1c",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    backText: {
        color: "#FFD700",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 4,
    },
    titleWrap: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFD700",
    },
    filterRow: {
        marginTop: 8,
    },
    searchWrap: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2a2a2a",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    input: {
        flex: 1,
        color: "#fff",
        fontSize: 16,
    },

});
