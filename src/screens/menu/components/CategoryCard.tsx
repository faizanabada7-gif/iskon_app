import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

interface Category {
  _id: string;
  image: string;
  categoryName: string;
  status: string;
}

interface Props {
  category: Category;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onClick: (cat: Category) => void;
  cardWidth: number;
}

export default function CategoryCard({ category, onEdit, onDelete, onClick, cardWidth }: Props) {
  const LOCAL_IP = "192.168.1.44"; // your computer LAN IP
  const imageUri = category.image?.startsWith("http")
    ? category.image
    : `http://${LOCAL_IP}:5000${category.image}`;

  return (
<TouchableOpacity
  style={[styles.cardWrap, { width: cardWidth }]}
  activeOpacity={0.9}
  onPress={() => onClick(category)}
>
      <ImageBackground
        source={{ uri: imageUri }}
        style={styles.bg}
        imageStyle={{ borderRadius: 16 }}
      >
        {/* Overlay */}
        <View style={styles.overlay} />

        {/* Category Name */}
        <View style={styles.header}>
          <Text numberOfLines={1} style={styles.title}>
            {category.categoryName}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(category)} style={styles.iconBtn}>
            <Ionicons name="pencil" size={18} color="#121212" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(category)} style={[styles.iconBtn, styles.deleteBtn]}>
            <Ionicons name="trash" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
 cardWrap: {
    aspectRatio: 4 / 5,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#111",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginBottom: 16, // ONLY vertical spacing
  },
  bg: {
    flex: 1,
    justifyContent: "space-between",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
    borderRadius: 16,
  },
  header: {
    padding: 12,
  },
  title: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    color: "#d9a515",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
    alignSelf: "flex-start",
    overflow: "hidden",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 12,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#d9a515",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  deleteBtn: {
    backgroundColor: "#c0392b",
  },
});
