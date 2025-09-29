// components/ItemsModal.tsx
import React from "react";
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  items: any[];
  categoryName: string;
  categoryImage: string;
  categoryId: string;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onRefresh?: () => void;
}

export default function ItemsModal({ visible, onClose, items, categoryName, categoryImage, page, totalPages, onPageChange }: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{categoryName}</Text>
            <TouchableOpacity onPress={onClose}><Text style={{color:"#d9a515"}}>Close</Text></TouchableOpacity>
          </View>

          <FlatList
            data={items}
            keyExtractor={(i, idx) => i._id ?? idx.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <Image source={{ uri: item.image?.startsWith("http") ? item.image : `http://localhost:5000${item.image}` }} style={styles.itemImage} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                </View>
                <Text style={styles.price}>₹{item.price}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={{color:"#aaa", textAlign:"center", marginTop:16}}>No items</Text>}
          />

          <View style={styles.pager}>
            <TouchableOpacity disabled={page <= 1} onPress={() => onPageChange(page - 1)} style={styles.pagerBtn}><Text style={styles.pagerText}>Prev</Text></TouchableOpacity>
            <Text style={{color:"#ddd"}}>{page} / {totalPages}</Text>
            <TouchableOpacity disabled={page >= totalPages} onPress={() => onPageChange(page + 1)} style={styles.pagerBtn}><Text style={styles.pagerText}>Next</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { height: "75%", backgroundColor: "#0b0b0b", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  itemImage: { width: 64, height: 64, borderRadius: 8, backgroundColor: "#222" },
  itemTitle: { color: "#fff", fontWeight: "700" },
  itemDesc: { color: "#bbb", fontSize: 12 },
  price: { color: "#d9a515", fontWeight: "800", marginLeft: 8 },
  pager: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  pagerBtn: { padding: 8, borderRadius: 8, backgroundColor: "#151515" },
  pagerText: { color: "#ddd" },
});
