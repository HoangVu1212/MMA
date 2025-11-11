import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import LoginScreen from "../../screens/LoginScreen";
import TodoScreen from "../../screens/TodoScreen";

const Stack = createStackNavigator();

export default function Index() {
  const [initialRoute, setInitialRoute] = useState("Login");

  useEffect(() => {
    const checkLogin = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) setInitialRoute("Todo");
    };
    checkLogin();
  }, []);

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Todo"
        component={TodoScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
