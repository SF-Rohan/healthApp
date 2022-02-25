// In App.js in a new project

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './modules/welcome/Welcome';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
} from 'react-native'; 
import Health from './Health';
import Health2 from './Health2';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

function App() {
  return (
    // <SafeAreaView style={{}}>
<>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Welcome" options={{ headerShown: false}} component={WelcomeScreen} />
        <Stack.Screen name="Health2" options={{ headerShown: false}} component={Health2} />
        {/* <Stack.Screen name="Health" options={{ headerShown: false}} component={Health} /> */}
      </Stack.Navigator>
    </NavigationContainer>
    <Toast />
    </>
    // </SafeAreaView>
  );
}

export default App;



// [
//   {
//       value: 2,
//       createdAt: "2022-02-24T09:36:57.475Z",
//       end: "2022-02-22 15:12:36",
//       id: "1645695417475",
//       name: "com.google.step_count.delta",
//       start: "2022-02-22 15:11:36",
//       type: "STEPS"
//   },
//   {
//       value: 110,
//       createdAt: "2022-02-24T09:39:45.127Z",
//       end: "2022-02-22 15:13:36",
//       id: "1645695585127",
//       name: "com.google.step_count.delta",
//       start: "2022-02-22 15:12:36",
//       type: "STEPS"
//   },
//   {
//       value: 110,
//       createdAt: "2022-02-24T11:01:57.947Z",
//       end: "2022-02-22 15:13:36",
//       id: "1645700517947",
//       name: "com.google.step_count.delta",
//       start: "2022-02-22 15:12:36",
//       type: "STEPS"
//   }
// ]