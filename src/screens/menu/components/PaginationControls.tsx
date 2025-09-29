// components/PaginationControls.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props { page: number; totalPages: number; onPageChange: (p: number) => void; }

export default function PaginationControls({ page, totalPages, onPageChange }: Props) {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity disabled={page <= 1} onPress={() => onPageChange(page - 1)} style={styles.btn}><Text style={styles.txt}>Prev</Text></TouchableOpacity>
      <Text style={styles.txt}>{page} / {totalPages}</Text>
      <TouchableOpacity disabled={page >= totalPages} onPress={() => onPageChange(page + 1)} style={styles.btn}><Text style={styles.txt}>Next</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 12, gap: 16 },
  btn: { padding: 8, backgroundColor: "#151515", borderRadius: 8 },
  txt: { color: "#ddd", fontWeight: "700" },
});
