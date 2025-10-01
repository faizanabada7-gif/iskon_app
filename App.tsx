import React, { useState, useEffect } from "react";
import { SafeAreaView, StatusBar, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashScreen from "./src/screens/splashScreen";
import { NavigationContainer, ParamListBase } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import UltraLuxuryLoginScreen from "./src/screens/auth/LoginScreen";
import WelcomeScreen from "./src/screens/welcome/WelcomeScreen";
import AddOrderScreen from "./src/screens/order/addOrder/AddOrderScreen";
import ViewOrderScreen from './src/screens/order/viewOrder/ViewOrderScreen';

const Stack = createNativeStackNavigator();

type AddOrderScreenProps = NativeStackScreenProps<ParamListBase, "AddOrder"> & {
  refreshOrders?: () => void; // ✅ add your extra prop here
};
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = loading

  // Check login state on mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        setIsLoggedIn(!!token); // true if token exists
      } catch (error) {
        console.log("Error checking login status:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (isLoggedIn === null || showSplash) {
    // show splash or loading
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        {showSplash ? (
          <SplashScreen onFinish={handleSplashFinish} />
        ) : (
          <ActivityIndicator size="large" color="#FFD700" style={{ flex: 1 }} />
        )}
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Stack.Navigator
        initialRouteName={isLoggedIn ? "Welcome" : "Login"}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login">
          {(props) => <UltraLuxuryLoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
        </Stack.Screen>
        <Stack.Screen name="Welcome">
          {(props) => <WelcomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
        </Stack.Screen>
        <Stack.Screen
          name="AddOrder"
        >
          {(props) => <AddOrderScreen {...props} />}
        </Stack.Screen>

        <Stack.Screen
          name="ViewOrder"
        >
          {(props) => <ViewOrderScreen {...props} />}
        </Stack.Screen>
      </Stack.Navigator>

    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
});
