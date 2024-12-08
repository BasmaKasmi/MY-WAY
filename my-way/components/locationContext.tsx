import React, { createContext, useState, useContext } from "react";
import { Alert, Modal, ActivityIndicator, StyleSheet, View, Text } from "react-native";
import * as Location from "expo-location";
import LocationTracker from "./locationTracker";

interface LocationContextProps {
  startTracking: (tripStartDate: Date, tripEndDate: Date) => void;
  stopTracking: () => void;
  isTracking: boolean;
}

const LocationContext = createContext<LocationContextProps | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [tripStartDate, setTripStartDate] = useState<Date | null>(null);
  const [tripEndDate, setTripEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission refusée",
        "Nous avons besoin de votre localisation pour suivre le voyage."
      );
      return false;
    }
    return true;
  };

  const confirmAndRequestPermissions = async (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        "Partager votre localisation",
        "Souhaitez-vous partager votre position pour suivre ce voyage ?",
        [
          {
            text: "Non",
            onPress: () => {
              console.log("L'utilisateur a refusé de partager sa localisation.");
              resolve(false);
            },
            style: "cancel",
          },
          {
            text: "Oui",
            onPress: async () => {
              const permissionGranted = await requestPermissions();
              resolve(permissionGranted);
            },
          },
        ]
      );
    });
  };

  const startTracking = async (startDate: Date, endDate: Date) => {
    const permissionGranted = await confirmAndRequestPermissions();
    if (!permissionGranted) {
      console.log("Tracking annulé, permission non accordée.");
      return;
    }

    console.log("Démarrage du suivi :", startDate, endDate);
    setIsLoading(true); 
    setTripStartDate(startDate);
    setTripEndDate(endDate);
    setIsTracking(true); 
  };

  const stopTracking = () => {
    console.log("Arrêt du suivi.");
    setTripStartDate(null);
    setTripEndDate(null);
    setIsTracking(false);
  };

  const handleLocationTaskComplete = () => {
    console.log("Localisation envoyée avec succès.");
    setIsLoading(false); 
  };

  return (
    <LocationContext.Provider value={{ startTracking, stopTracking, isTracking }}>
      {children}
      {isTracking && tripStartDate && tripEndDate && (
        <LocationTracker
          startDate={tripStartDate}
          endDate={tripEndDate}
          onComplete={handleLocationTaskComplete} 
        />
      )}
 
      {isLoading && (
        <Modal
          transparent
          animationType="fade"
          visible={isLoading}
          onRequestClose={() => {}}
        >
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.loaderText}>Création de la localisation...</Text>
          </View>
        </Modal>
      )}
    </LocationContext.Provider>
  );
};

const styles = StyleSheet.create({
  loaderOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    color: "#FFF",
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },
});
