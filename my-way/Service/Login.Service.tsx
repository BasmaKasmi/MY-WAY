import AsyncStorage from "@react-native-async-storage/async-storage";

import * as SecureStore from 'expo-secure-store';
export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      if (data.token && data.id) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("userId", data.id.toString());
        return data;
      } else {
        throw new Error("Token ou userId manquant dans la réponse");
      }
    } else if (response.status === 404) {
      console.log(data.message)
      return data;
      
    } else {
      throw new Error("Une erreur est survenue lors de la connexion");
    }
  } catch (error: any) {

    throw new Error(error.message || "Erreur inconnue");
  }
};



  export const logoutUser = async () => {
    try {
      
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error('Error logging out', error);
      throw error;
    }
  };
  