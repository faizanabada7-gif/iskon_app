import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Animated,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { OrderCard } from "./components/OrderCard";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../../services/login";
import socket from "../../socket/socket";

const { width, height } = Dimensions.get("window");
const PARTICLE_COUNT = 40;

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const logoAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }).map(() => ({
      translateX: new Animated.Value(Math.random() * width),
      translateY: new Animated.Value(Math.random() * height),
      opacity: new Animated.Value(Math.random() * 0.7 + 0.3),
      scale: new Animated.Value(Math.random() * 0.7 + 0.3),
    }))
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, { toValue: -6, duration: 3000, useNativeDriver: true }),
        Animated.timing(logoAnim, { toValue: 6, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    particles.forEach(p => animateParticle(p));
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!searchTerm) setFilteredOrders(orders);
    else {
      const filtered = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  const animateParticle = (p: any) => {
    p.translateY.setValue(-10);
    p.translateX.setValue(Math.random() * width);
    p.opacity.setValue(Math.random() * 0.7 + 0.3);
    p.scale.setValue(Math.random() * 0.6 + 0.4);

    Animated.loop(
      Animated.parallel([
        Animated.timing(p.translateY, { toValue: height + 10, duration: 9000 + Math.random() * 4000, useNativeDriver: true }),
        Animated.timing(p.translateX, { toValue: Math.random() * width, duration: 9000 + Math.random() * 4000, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(p.opacity, { toValue: 0.8, duration: 4000, useNativeDriver: true }),
          Animated.timing(p.opacity, { toValue: 0.2, duration: 4000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  };

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await API.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setOrders(res.data.data);
        setFilteredOrders(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

useEffect(() => {
  const handleNewOrder = (newOrder: any) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  socket.on("orderCreated", handleNewOrder);

  return () => {
    socket.off("orderCreated", handleNewOrder);
  };
}, []);

useFocusEffect(
  React.useCallback(() => {
    fetchOrders();
  }, [])
);


  const handleAddOrder = () => {
    navigation.navigate("AddOrder");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Floating particles */}
      <View style={StyleSheet.absoluteFill}>
        {particles.map((p, i) => (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#FFD700",
              opacity: p.opacity,
              transform: [
                { translateX: p.translateX },
                { translateY: p.translateY },
                { scale: p.scale },
              ],
            }}
          />
        ))}
      </View>

      <View style={styles.headerContainer}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.titleWrap}>
              <Ionicons name="layers" size={22} color="#d9a515" />
              <Text style={styles.title}>Orders</Text>
            </View>

            <TouchableOpacity style={styles.categoryButton} onPress={handleAddOrder}>
              <Text style={styles.categoryButtonText}>+ Order</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color="#777" style={{ marginRight: 8 }} />
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

      <FlatList
        data={filteredOrders}
        keyExtractor={o => o._id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            userRole="admin"
            updateOrderStatus={(id, status) =>
              setOrders(prev => prev.map(o => (o._id === id ? { ...o, status } : o)))
            }
            handleDeleteOrder={id => setOrders(prev => prev.filter(o => o._id !== id))}
          />
        )}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  headerContainer: { paddingHorizontal: 16, marginBottom: 12 },
  card: { backgroundColor: "#1c1c1c", borderRadius: 12, padding: 16, elevation: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  titleWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 20, fontWeight: "600", color: "#d9a515" },
  categoryButton: { backgroundColor: "#d9a515", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  categoryButtonText: { color: "#111", fontWeight: "700", fontSize: 14 },
  filterRow: { marginTop: 16 },
  searchWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#2b2b2b", paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: "#444" },
  input: { flex: 1, color: "#fff", fontSize: 14 },
});
