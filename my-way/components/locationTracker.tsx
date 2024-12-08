import React, { useEffect } from "react";
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationTrackerProps {
  startDate: Date;
  endDate: Date;
  onComplete: () => void; 
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ startDate, endDate, onComplete }) => {
  useEffect(() => {
    let lastLatitude: number | null = null;
    let lastLongitude: number | null = null;

    const requestPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La permission de localisation est requise pour suivre le voyage.');
        return false;
      }
      return true;
    };

    const getLocationAndSendToAPI = async () => {
      try {
        const permissionGranted = await requestPermissions();
        if (!permissionGranted) {
          onComplete(); 
          return;
        }

        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const { latitude, longitude } = location.coords;

        if (latitude === lastLatitude && longitude === lastLongitude) {
          console.log("Localisation identique, aucune mise à jour envoyée.");
          return;
        }

        lastLatitude = latitude;
        lastLongitude = longitude;

        console.log("Nouvelle localisation reçue :", { latitude, longitude });

        await sendLocationToAPI(latitude, longitude);
        onComplete(); 
      } catch (error) {
        console.error("Erreur lors de la récupération de la localisation :", error);
        onComplete(); 
      }
    };

    const now = new Date();
    if (startDate <= now && now <= endDate) {
      getLocationAndSendToAPI(); 
      const interval = setInterval(getLocationAndSendToAPI, 5000);
      return () => clearInterval(interval); 
    } else {
      onComplete(); 
    }
  }, [startDate, endDate]);

  return null;
};

export default LocationTracker;

const sendLocationToAPI = async (latitude: number, longitude: number) => {
  try {
    const tripId = await AsyncStorage.getItem('activeTripId');
    const userId = await AsyncStorage.getItem('userId');

    console.log("Envoi de la localisation à l'API :", {
      latitude,
      longitude,
      tripId,
      userId,
      timestamp: new Date().toISOString(),
    });

    await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/location`, {
      latitude,
      longitude,
      tripId,
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (apiError) {
    console.error("Erreur lors de l'envoi de la localisation :", apiError);
  }
};
