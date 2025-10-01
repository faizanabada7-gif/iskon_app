import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../../../services/login";

type OrderItem = { _id: string; name: string; price: number; quantity: number };
type SelectedItem = OrderItem;

interface ViewOrderScreenProps {
    route: { params: { orderId: string } };
    navigation: any;
}

const ViewOrderScreen: React.FC<ViewOrderScreenProps> = ({ route, navigation }) => {
    const { orderId } = route.params;
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const selectedListRef = useRef<FlatList>(null);
    const [token, setToken] = useState("");

    useEffect(() => {
        AsyncStorage.getItem("token").then((t) => {
            if (t) setToken(t);
        });
    }, []);

    useEffect(() => {
        if (!token) return;
        fetchOrder();
    }, [token]);


    const fetchOrder = async () => {
        try {
            console.log("orderId >>>", orderId, "type:", typeof orderId);
            const res = await API.get(`/orders/order/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                const order = res.data.data;
                const itemsWithId = order.items.map((i: any) => ({
                    _id: i.itemId || i._id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                }));
                setSelectedItems(itemsWithId);
                const total = itemsWithId.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
                setTotalAmount(total);
            } else console.log("Failed to fetch order");
        } catch (err) {
            console.log("Error fetching order:", err);
        }
    };

    const handleAddItem = (item: SelectedItem) => {
        setSelectedItems((prev) =>
            prev.map((i) =>
                i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
            )
        );
        setTotalAmount((prev) => prev + item.price);
    };

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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Order Details</Text>

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
                            <Text style={styles.itemText}>{item.name}</Text>
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

            <Text style={styles.totalValue}>Total: ₹{totalAmount.toFixed(2)}</Text>
        </View>
    );
};

export default ViewOrderScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0d0d0d", padding: 16 },
    title: { fontSize: 22, fontWeight: "800", color: "#FFD700", marginBottom: 16 },
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
});
