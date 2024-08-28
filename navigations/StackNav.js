import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FirstScreen from "../screens/FirstScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import MainPage from "../screens/MainPage";

export default StackNav = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      initialRouteName="firstPage"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="firstPage"
        component={FirstScreen}
        options={{
          gestureEnabled: false,
          // headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="login"
        component={LoginScreen}
        options={{
          gestureEnabled: false,
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="signup"
        component={SignupScreen}
        options={{
          gestureEnabled: false,
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="mainPage"
        component={MainPage}
        options={{
          gestureEnabled: false,
          headerLeft: () => null,
        }}
      />
    </Stack.Navigator>
  );
};
