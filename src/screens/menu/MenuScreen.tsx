// screens/MenuScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CategoryFilters from "./components/CategoryFilters";
import CategoryCard from "./components/CategoryCard";
import CategoryListItem from "./components/CategoryListItem";
import ItemsModal from "./components/ItemsModal";
import CategoryFormModal from "./components/CategoryFormModal";

import { getCategory, getCategoryWiseMenu, deleteCategory } from "../../services/menuServices";

export interface Category {
  _id: string;
  image: string;
  categoryName: string;
  status: string;
}

export default function MenuScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryPage, setCategoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [itemModalVisible, setItemModalVisible] = useState(false);

  const [selectedCategoryItems, setSelectedCategoryItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [isItemsOpen, setIsItemsOpen] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = 16;
  const numColumns = 2;
  const spacing = 16;
  const cardWidth = (screenWidth - horizontalPadding * 2 - spacing * (numColumns - 1)) / numColumns;

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await getCategory(
        {
          page: categoryPage,
          limit: 20,
          username: searchTerm || undefined,
          role: roleFilter !== "all" ? roleFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
        token || undefined
      );

      if (res?.data?.success) {
        setCategories(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);

        // Set default selected category (first category)
        if (res.data.data && res.data.data.length > 0 && !selectedCategory) {
          fetchCategoryItems(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error("fetchCategories:", err);
    } finally {
      setLoading(false);
    }
  }, [categoryPage, searchTerm, statusFilter, roleFilter]);

  // Fetch items for a category
  const fetchCategoryItems = async (category: Category) => {
    setItemsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token"); // get JWT from storage

      const res = await getCategoryWiseMenu(
        { categoryId: category._id, page: 1, limit: 20 },
        token || undefined // pass token as second argument
      );

      if (res?.data?.success) setSelectedCategoryItems(res.data.data || []);
      setSelectedCategory(category);
    } catch (err) {
      console.error("fetchCategoryItems:", err);
    } finally {
      setItemsLoading(false);
    }
  };


  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Delete category
  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Horizontal card click
  const handleCategoryClick = (cat: Category) => {
    fetchCategoryItems(cat);
  };

  // Horizontal card edit/delete handlers
  const handleEdit = (cat: Category) => Alert.alert("Edit", `Edit ${cat.categoryName}`);
  const handleDelete = (cat: Category) => Alert.alert("Delete", `Delete ${cat.categoryName}?`);
  const handleOpen = (cat: Category) => Alert.alert("Open", `Open items in ${cat.categoryName}`);

  return (
    <SafeAreaView style={styles.container}>
      <CategoryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#d9a515" style={{ marginTop: 50 }} />
      ) : (
        <View style={{ flex: 1 }}>
          {/* Horizontal Header */}
          <View style={styles.horizontalHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Text style={styles.categoryButtonText}>+ Category</Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal Scrollable Category Cards */}
          <View style={{ height: 250 }}>
            <FlatList
              data={categories}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
              ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
              renderItem={({ item }) => (
                <CategoryCard
                  category={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onClick={() => handleCategoryClick(item)}
                  cardWidth={180}
                />
              )}
            />
          </View>

          {/* Vertical List Title */}
          {/* Second List Header */}
          <View style={styles.horizontalHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory ? selectedCategory.categoryName : "Select a Category"}
            </Text>
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={() => setItemModalVisible(true)} // for adding new item
            >
              <Text style={styles.categoryButtonText}>+ Item</Text>
            </TouchableOpacity>
          </View>

          {/* Vertical List of Items */}
          {itemsLoading ? (
            <ActivityIndicator size="large" color="#d9a515" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={selectedCategoryItems}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingBottom: 40 }}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              renderItem={({ item }) => (
                <CategoryListItem
                  item={item}
                  onClick={(clickedItem) =>
                    Alert.alert("Item Clicked", clickedItem.itemName)
                  }
                />
              )}
            />
          )}

        </View>
      )}

      {/* Category Form Modal */}
      <CategoryFormModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        editingCategory={null}
        refreshCategories={fetchCategories}
      />

      {/* Items Modal */}
      <ItemsModal
        visible={isItemsOpen}
        onClose={() => setIsItemsOpen(false)}
        items={selectedCategoryItems}
        categoryName={selectedCategory?.categoryName || ""}
        categoryImage={selectedCategory?.image || ""}
        categoryId={selectedCategory?._id || ""}
        page={1}
        totalPages={1}
        onPageChange={(newPage) =>
          selectedCategory ? fetchCategoryItems(selectedCategory) : null
        }
        onRefresh={fetchCategories}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#0b0b0b" },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#d9a515", marginHorizontal: 16 },
  horizontalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 20 },
  categoryButton: { backgroundColor: "#d9a515", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  categoryButtonText: { color: "#111", fontWeight: "700", fontSize: 14 },
});
