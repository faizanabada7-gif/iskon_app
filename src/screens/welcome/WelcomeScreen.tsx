// src/screens/welcome/WelcomeScreen.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import OrdersScreen from '../order/OrderScreen';
import MenuScreen from '../menu/MenuScreen';
import QRCodeScreen from '../qrCode/QRCodeScreen';
import ProfileScreen from '../profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function WelcomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: '#000', borderTopColor: '#333' },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#777',
          tabBarIcon: ({ color, size }) => {
            let iconName: string = '';

            if (route.name === 'Orders') iconName = 'list';
            else if (route.name === 'Menu') iconName = 'restaurant';
            else if (route.name === 'QR Code') iconName = 'qr-code';
            else if (route.name === 'Profile') iconName = 'person';

            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Orders" component={OrdersScreen} />
        <Tab.Screen name="Menu" component={MenuScreen} />
        <Tab.Screen name="QR Code" component={QRCodeScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
}
