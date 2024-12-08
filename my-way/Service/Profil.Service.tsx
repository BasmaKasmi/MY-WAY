
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
export const getUserData = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userIdString = await AsyncStorage.getItem('userId');
    const userId = parseInt(userIdString || '0');

    if (token && userId) {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/${userId}`, { 
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des informations de l\'utilisateur');
      }

      return await response.json();
    } else {
      throw new Error('Token ou ID utilisateur manquant');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erreur inconnue');
  }
};

export const updateUserData = async (updatedData: any) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userIdString = await AsyncStorage.getItem('userId');
    const userId = parseInt(userIdString || '0');

    if (token && userId) {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des informations de l\'utilisateur');
      }

      return await response.json();
    } else {
      throw new Error('Token ou ID utilisateur manquant');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erreur inconnue');
  }
};


// export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
//   try {
//     const token = await AsyncStorage.getItem('token');
//     const userId = await AsyncStorage.getItem('userId'); 
//     if (!token) {
//       throw new Error('Token manquant');
//     }
//     if (userId) {
//       const response = await fetch(`${process.env.API_URL}/users/password/{userId}`, {
//         method: 'PUT', 
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           currentPassword,
//           newPassword,
//         }),
//       });
   

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || 'Erreur lors de la mise à jour du mot de passe');
//     }

//     // Réponse réussie
//     return;
//   } catch (error: any) {
//     throw new Error(error.message || 'Erreur inconnue');
//   }
// };


export const  searchUser = async(query: string) => {
  const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/search/?query=${query}`;
  const token = await AsyncStorage.getItem('token');

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de la recherche de user: ${response.statusText}, Réponse: ${errorText}`);
    }

    const data = await response.json();
    return data 
  } catch (error) {
    // console.error("Erreur lors de la recherche de user:", error);
    throw error;
  }
}
export const getUserTripsBySearch = async (userId: string) => {
  try {
    const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/${userId}/trips`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,          },
      });

      if (!response.ok) {
          throw new Error(`Erreur lors de la récupération des voyages: ${response.statusText}`);
      }

      const data = await response.json();
    
      return data;
  } catch (error) {
      console.error('Erreur dans le service getUserTripsBySearch:', error);
      throw error; 
  }
};

export const uploadProfilePhoto = async (photo: any): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userIdString = await AsyncStorage.getItem('userId');
    const userId = parseInt(userIdString || '0');

    if (!token || !userId) {
      throw new Error('Token ou ID utilisateur manquant');
    }

    let base64Image = '';

    if (Platform.OS === 'web') {
      base64Image = photo.uri;
    } else {
      base64Image = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      base64Image = `data:${photo.mimeType || 'image/jpeg'};base64,${base64Image}`;
    }

    const body = JSON.stringify({
      image: base64Image,
      mimeType: photo.mimeType || 'image/jpeg',
    });

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/${userId}/profil`, {
      method: 'PUT',
      body: body,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Erreur lors de l'upload de la photo de profil : ${errorMessage}`);
    }
  } catch (error: any) {
    console.error('Erreur dans uploadProfilePhoto:', error.message);
    throw new Error(error.message || 'Erreur inconnue');
  }
};

export const getProfilePhoto = async (userId: string): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Token manquant');
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/${userId}/profil`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la photo de profil');
    }

    if (Platform.OS === 'web') {
      const profilePhotoBlob = await response.blob();
      console.log("Blob Response:", profilePhotoBlob);
      return URL.createObjectURL(profilePhotoBlob);
    } else {
      const profilePhotoArrayBuffer = await response.arrayBuffer();
      const fileUri = `${FileSystem.documentDirectory}${userId}_profile.jpg`;
      const base64 = arrayBufferToBase64(profilePhotoArrayBuffer);
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return fileUri;
    }
  } catch (error: any) {
    console.error('Erreur dans getProfilePhoto:', error.message);
    throw new Error(error.message || 'Erreur inconnue');
  }
};


const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};



