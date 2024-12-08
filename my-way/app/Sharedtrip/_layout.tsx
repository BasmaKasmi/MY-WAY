import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams,useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { getSharedTripDetails } from "@/Service/Trip.Service";
import { getLocation } from "@/Service/Location.Service";
import { Buffer } from "buffer";
import Comments from "@/components/Comment"; // Import du composant de commentaires

type Step = {
  id: number;
  name: string;
  stepDate: string;
  createdAt: string;
  photos?: Array<{ photoUrl: Buffer | string }>;
  city?: string;
};

type TripData = {
  id: number;
  name: string;
  description?: string;
  country?: string;
  startDate?: string;
  summary?: string;
  steps: Step[];
};

const { width } = Dimensions.get("window");

export default function SharedTripScreen() {
  const { firstName, lastName, tripId, tripName } = useLocalSearchParams<{
    firstName: string;
    lastName: string;
    tripId: string;
    tripName: string;
  }>();
  const navigation = useNavigation();

  const [tripData, setTripData] = useState<TripData | null>(null);
  const [location, setLocation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null); 
  const [showComments, setShowComments] = useState(false); 

  useEffect(() => {
    navigation.setOptions({ headerShown: false }); 
  }, [navigation]);
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const tripIdNumber = Number(tripId);
        if (isNaN(tripIdNumber)) throw new Error("Trip ID is not a valid number");

        const data = await getSharedTripDetails(firstName, lastName, tripIdNumber, tripName);
        setTripData(data.trip);

        const fetchedLocation = await getLocation(tripIdNumber);
        setLocation(fetchedLocation);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du voyage:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [firstName, lastName, tripId, tripName]);

  const bufferToBase64 = (buffer: Buffer): string => {
    return `data:image/jpeg;base64,${Buffer.from(buffer).toString("base64")}`;
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-CA");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1abc9c" />
      </View>
    );
  }

  if (!tripData) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTripText}>Aucun voyage trouvé avec ce lien.</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#432371", "#faae7b"]} style={styles.gradientBackground}>
      <View style={styles.container}>
        {/* Header utilisateur */}
        <View style={styles.userSection}>
          <Ionicons name="person-circle-outline" size={50} color="#ffffff" style={styles.userIcon} />
          <View>
            <Text style={styles.userName}>
              {firstName} {lastName}
            </Text>
            <Text style={styles.userRole}>Partageur de ce voyage</Text>
          </View>
        </View>

        {/* Carte et résumé */}
        <View style={styles.mapAndSummary}>
          <MapView
            style={styles.map}
            region={{
              latitude: location?.latitude || 0,
              longitude: location?.longitude || 0,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {location && (
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title={location.city || "Position actuelle"}
                pinColor="#e74c3c"
              />
            )}
          </MapView>
          <View style={styles.tripSummary}>
            <Text style={styles.tripTitle}>{tripData.name}</Text>
            <Text style={styles.tripDescription}>{tripData.summary}</Text>
            <Text style={styles.tripDates}>Voyage commencé le {formatDate(tripData.startDate)}</Text>
          </View>
        </View>

        {/* Étapes */}
        <FlatList
          data={tripData.steps}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.stepCard}>
              <Text style={styles.stepTitle}>{item.name}</Text>
              <Text style={styles.stepCity}>{item.city || "Ville inconnue"}</Text>
              {item.photos?.length ? (
                <FlatList
                  data={item.photos}
                  keyExtractor={(_, index) => index.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item: photo }) => {
                    const photoUri =
                      typeof photo.photoUrl === "string"
                        ? photo.photoUrl
                        : bufferToBase64(photo.photoUrl as Buffer);
                    return <Image source={{ uri: photoUri }} style={styles.stepPhoto} />;
                  }}
                />
              ) : (
                <Text style={styles.noPhotoText}>Pas de photos disponibles</Text>
              )}

              {/* Bouton "Voir les commentaires" */}
              <TouchableOpacity
                style={styles.viewCommentsButton}
                onPress={() => {
                  setSelectedStepId(item.id);
                  setShowComments(true); // Afficher le composant Comments
                }}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#ffffff" />
                <Text style={styles.viewCommentsText}>Voir les commentaires</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Composant Comments */}
        {showComments && selectedStepId !== null && (
          <Comments
            stepId={selectedStepId}
            isVisible={showComments}
            onClose={() => setShowComments(false)} // Cacher le composant Comments
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: { flex: 1, paddingTop: 20 },
  userSection: { flexDirection: "row", alignItems: "center", padding: 20, marginBottom: 20 },
  userIcon: { marginRight: 15 },
  userName: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
  userRole: { fontSize: 14, color: "#eaeaea" },
  mapAndSummary: { marginHorizontal: 20, marginBottom: 20 },
  map: { width: "100%", height: 200, borderRadius: 20, marginBottom: 10 },
  tripSummary: { padding: 15, backgroundColor: "#ffffff", borderRadius: 15 },
  tripTitle: { fontSize: 22, fontWeight: "bold", color: "#2c3e50", textAlign: "center" },
  tripDescription: { fontSize: 14, color: "#7f8c8d", textAlign: "center", marginVertical: 10 },
  tripDates: { fontSize: 14, color: "#2c3e50", textAlign: "center", fontWeight: "600" },
  stepCard: { marginBottom: 15, padding: 15, borderRadius: 15, backgroundColor: "#ffffff" },
  stepTitle: { fontSize: 16, fontWeight: "bold", color: "#2c3e50", marginBottom: 5 },
  stepCity: { fontSize: 14, color: "#7f8c8d", marginBottom: 10 },
  stepPhoto: { width: 100, height: 100, marginRight: 10, borderRadius: 10 },
  noPhotoText: { fontSize: 14, color: "#7f8c8d", textAlign: "center" },
  viewCommentsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#3498db",
    borderRadius: 10,
    marginTop: 10,
  },
  noTripText: {
    fontSize: 18,
    color: "#ffffff",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  viewCommentsText: { fontSize: 14, color: "#ffffff", marginLeft: 5 },
});
