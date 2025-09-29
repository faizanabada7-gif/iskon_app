import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface Item {
  _id: string;
  itemName: string;
  price: number;
  quantity?: number;
  status: string;
}

interface Props {
  item: Item;
  onClick: (item: Item) => void;
}

export default function CategoryListItem({ item, onClick }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onClick(item)}>
      <Text style={styles.title}>{item.itemName}</Text>
      <Text style={styles.price}>₹ {item.price}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#111",
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    color: "#d9a515",
    fontSize: 16,
    fontWeight: "700",
  },
  price: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
