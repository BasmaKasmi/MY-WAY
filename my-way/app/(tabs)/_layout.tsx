import React, { useState, useEffect, useCallback } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeScreen from "@/Pages/Home";
import Login from "@/Pages/Login";
import Register from "@/Pages/Register";
import Profil from "@/Pages/Profile";
import CreateTrip from "@/Pages/CreateTrip";
import Steps from "@/Pages/Steps";
import CreateStepForm from "@/components/CreateStepForm";
import ExploreScreen from "@/Pages/Explore";
import { Ionicons } from "@expo/vector-icons";
import StepDetails from "@/Pages/StepDetails";
import StepsScreen from "@/components/ExploreUser/StepScreen";
import UserTripsScreen from "@/components/ExploreUser/UserTripsScreen";
import TripDetails from "@/components/ TripDetails";
import { NavigationContainer } from "@react-navigation/native";
import { LocationProvider } from "@/components/locationContext";
import ProfilInfos from "@/Pages/ProfInfos";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = ({setIsAuthenticated}:any) => {
  return (
    <Tab.Navigator>
         <Tab.Screen
        name="Profil"
        options={{
          tabBarLabel: "Moi",
          tabBarIcon: ({ color }: any) => (
            <Ionicons name="person" size={24} color={color} />
          ),
          headerShown: false,
        }}
      >
        {(props: any) => <Profil {...props} setIsAuthenticated={setIsAuthenticated} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{ 
          tabBarLabel: 'Explorer',
          tabBarIcon: ({ color }:any) => (
            <Ionicons name="search" size={24} color={color} />
          ), headerShown: false 
        }} 
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      const storedToken = await AsyncStorage.getItem("token");
      if (storedUserId && storedToken) {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

  return (
    <Stack.Navigator
      screenOptions={({ route }:any) => {

        const headerShown =
          route.name === "TripDetails" ||
          route.name === "Infos" ||
          route.name === "CreateStepForm" ||
          route.name === "UserTripsScreen" ||
          route.name === "TripStepsScreen";

        return { headerShown }; 
      }}
    >
      {isAuthenticated ? (
        <>
       <Stack.Screen
  name="Main"
  options={{ headerShown: false }}
>
  {(props: any) => <TabNavigator {...props} setIsAuthenticated={setIsAuthenticated} />}
</Stack.Screen>

          <Stack.Screen
            name="CreateTrip"
            component={CreateTrip}
            options={{ headerShown: false }} 
          />
          <Stack.Screen
            name="Steps"
            component={Steps}
            options={{ headerShown: false }} 
          />
          <Stack.Screen
            name="StepDetails"
            component={StepDetails}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="TripDetails"
            component={TripDetails}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Infos"
            options={{ headerShown: false }} 
          >
            {(props:any) => (
              <ProfilInfos {...props} setIsAuthenticated={setIsAuthenticated} />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="CreateStepForm"
            component={CreateStepForm}
            options={{ presentation: "modal", headerShown: false }} 
          />
          <Stack.Screen
            name="UserTripsScreen"
            component={UserTripsScreen}
            options={{ headerShown: false }} 
          />
          <Stack.Screen
            name="TripStepsScreen"
            component={StepsScreen}
            options={{ headerShown: false }} 
          />
        </>
      ) : (
        <>

          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Login">
            {(props:any) => <Login {...props} setIsAuthenticated={setIsAuthenticated} />}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {(props:any) => <Register {...props} setIsAuthenticated={setIsAuthenticated} />}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
};



const App = () => {
  return (
    <NavigationContainer>


    
     <LocationProvider>
     <AppNavigator />
   </LocationProvider>
   </NavigationContainer>
      
  
  );
};



export default App;
