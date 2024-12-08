import AsyncStorage from '@react-native-async-storage/async-storage';

export const createTrip = async (tripData: {
  name: string;
  summary: string;
  startDate: string;
  endDate?:  string | null;
  country: string;
  userId: number;
  isPublic:boolean
}) => {
  try {

    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Token manquant');
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/trips`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(tripData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de la création du voyage: ${errorText}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Erreur inconnue');
  }
};

export const getUserTrips = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId'); 
    const token = await AsyncStorage.getItem('token');

    if (userId) {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/trips/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      //  console.log("je suis les voyages",data)
      return data;
    } else {
      throw new Error('User ID not found');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch user trips');
  }
};

export const getTripById = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/trips/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch trip details');
  }
};
export const updateTrip = async (id: number, tripData: any) => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/trips/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tripData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update trip');
  }
};
export const deleteTrip = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/trips/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return true; 
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete trip');
  }
};


export const getSharedTripDetails = async (firstName: string, lastName: string, tripId: number, tripName: string) => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/trips/share/${firstName}${lastName}/${tripId}/${tripName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du voyage partagé: ${response.status}`);
    }

    const tripData = await response.json();
    return tripData;
  } catch (error: any) {
    throw new Error(error.message || 'Erreur lors de la récupération des détails du voyage partagé');
  }
};
