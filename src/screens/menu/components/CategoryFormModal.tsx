import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, Image, StyleSheet, ScrollView, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Yup from "yup";
import { Formik } from "formik";
import { addCategory, updateCategory } from "../../../services/menuServices";

// Category Type
interface Category {
  _id?: string;
  categoryName: string;
  status: string;
  image?: string | null;
}

// Props
interface Props {
  visible: boolean;
  onClose: () => void;
  editingCategory?: Category | null;
  refreshCategories: () => void;
}

const CategorySchema = Yup.object().shape({
  categoryName: Yup.string().required("Category name is required"),
  status: Yup.string().required("Status is required"),
});

export default function CategoryFormModal({ visible, onClose, editingCategory, refreshCategories }: Props) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (editingCategory?.image) {
      setPreviewImage(`http://192.168.1.44:5000${editingCategory.image}`);
    } else {
      setPreviewImage(null);
    }
  }, [editingCategory]);

  const handleImageSelect = async () => {
    // TODO: integrate ImagePicker for selecting image
    // For demo, we can leave a placeholder
    // Alert("Open Image Picker here");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.modalTitle}>{editingCategory ? "Edit Category" : "Add Category"}</Text>

            <Formik
              enableReinitialize
              initialValues={{
                categoryName: editingCategory?.categoryName || "",
                status: editingCategory?.status || "Active",
                image: editingCategory?.image || null,
              }}
              validationSchema={CategorySchema}
              onSubmit={async (values, { resetForm }) => {
                try {
                  // Simulate API call
                  if (editingCategory) {
                    await updateCategory(editingCategory._id!, values);
                  } else {
                    await addCategory(values);
                  }
                  refreshCategories();
                  resetForm();
                  onClose();
                } catch (err) {
                  console.error(err);
                //   Alert("Error saving category");
                }
              }}
            >
              {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
                <>
                  {/* Category Name */}
                  <Text style={styles.label}>Category Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={values.categoryName}
                    onChangeText={handleChange("categoryName")}
                    placeholder="Enter category name"
                    placeholderTextColor="#aaa"
                  />
                  {errors.categoryName && touched.categoryName && (
                    <Text style={styles.errorText}>{errors.categoryName}</Text>
                  )}

                  {/* Status */}
                  <Text style={[styles.label, { marginTop: 12 }]}>Status</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={values.status}
                      onValueChange={(val) => setFieldValue("status", val)}
                      style={{ color: "white" }}
                    >
                      <Picker.Item label="Active" value="Active" />
                      <Picker.Item label="Inactive" value="Inactive" />
                    </Picker>
                  </View>

                  {/* Image */}
                  <Text style={[styles.label, { marginTop: 12 }]}>Image</Text>
                  <TouchableOpacity style={styles.imageUpload} onPress={handleImageSelect}>
                    {previewImage ? (
                      <Image source={{ uri: previewImage }} style={{ width: "100%", height: "100%", borderRadius: 8 }} />
                    ) : (
                      <Text style={{ color: "#aaa" }}>Tap to select image</Text>
                    )}
                  </TouchableOpacity>

                  {/* Buttons */}
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveBtn} onPress={() => handleSubmit()}>
                      <Text style={styles.saveText}>{editingCategory ? "Update" : "Save"}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Formik>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "90%", backgroundColor: "#111", borderRadius: 16, maxHeight: "90%" },
  modalTitle: { fontSize: 22, fontWeight: "700", color: "#d9a515", marginBottom: 16, textAlign: "center" },
  label: { color: "#d9a515", fontWeight: "600", marginBottom: 4 },
  input: { backgroundColor: "#222", color: "white", borderRadius: 8, padding: 10 },
  errorText: { color: "#c0392b", marginTop: 4 },
  pickerWrapper: { backgroundColor: "#222", borderRadius: 8 },
  imageUpload: { backgroundColor: "#222", height: 120, borderRadius: 8, justifyContent: "center", alignItems: "center", marginTop: 4 },
  buttonRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 20, gap: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: "#d9a515" },
  cancelText: { color: "#fff", fontWeight: "700" },
  saveBtn: { backgroundColor: "#d9a515", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  saveText: { color: "#111", fontWeight: "700" },
});
