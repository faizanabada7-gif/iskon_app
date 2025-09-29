// components/CategoryFilters.tsx
import React from "react";
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  roleFilter: string;
  setRoleFilter: (v: string) => void;
  onAddCategory: () => void;
}

export default function CategoryFilters({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, roleFilter, setRoleFilter, onAddCategory }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.titleWrap}>
          <Ionicons name="layers" size={22} color="#d9a515" />
          <Text style={styles.title}>Menu Management</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color="#777" style={{ marginRight: 8 }} />
          <TextInput placeholder="Search by category or item name..." value={searchTerm} onChangeText={setSearchTerm} style={styles.input} placeholderTextColor="#999" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#101010", padding: 12, borderRadius: 12, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  titleWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: "#fff", fontSize: 18, marginLeft: 8, fontWeight: "700" },
  addBtn: { backgroundColor: "#d9a515", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  addText: { color: "#000", fontWeight: "700" },
  filterRow: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8 },
  searchWrap: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#0e0e0e", padding: 8, borderRadius: 8 },
  input: { color: "#fff", flex: 1, height: 36 },
  select: { padding: 8, backgroundColor: "#0e0e0e", borderRadius: 8 },
  selectText: { color: "#ddd" },
});
