import AsyncStorage from '@react-native-async-storage/async-storage';

export const getLocation = async (tripId:any) => {
  try {

    const userId = await AsyncStorage.getItem('userId');

    if (!userId) {
      throw new Error('ID utilisateur manquant');
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/location/${userId}/${tripId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur inconnue lors de la récupération de la localisation');
    }

    const data = await response.json();
    return data.location;
  } catch (error) {
    console.error('Erreur lors de la récupération de la localisation :', error);
    throw error;
  }
};
