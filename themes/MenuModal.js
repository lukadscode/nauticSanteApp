import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MenuModal = ({
  visible,
  onClose,
  items,
  title = "Choisissez un type",
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuWrapper}>
              <Text style={styles.menuTitle}>{title}</Text>

              {items.map((item, index) => (
                <View key={index}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      item.onClick();
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color="#1E283C"
                      style={styles.menuIcon}
                    />
                    <Text style={styles.menuText}>{item.name}</Text>
                  </TouchableOpacity>

                  {/* Separator (except last) */}
                  {index < items.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  menuWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E283C",
    marginBottom: 10,
    paddingLeft: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E283C",
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E3E8",
    marginHorizontal: 10,
  },
});

export default MenuModal;
