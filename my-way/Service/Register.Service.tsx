
import AsyncStorage from "@react-native-async-storage/async-storage";
export const Register = async (user: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    address: string;
  }) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      const data = await response.json();
      if(response.ok){
        if (data.token && data.user.id) {
          await AsyncStorage.setItem("token", data.token);
          await AsyncStorage.setItem("userId", data.user.id.toString());
          return data;
        } else {
          throw new Error("Token or userId is missing in the response");
        }
      }
      else if(response.status === 400){
        return data;
      }else{
        throw new Error("Une erreur est survenue lors de l'inscription");
      }
    } catch (error: any) {
      throw new Error(error.message || "Erreur inconnue");
    }
  };