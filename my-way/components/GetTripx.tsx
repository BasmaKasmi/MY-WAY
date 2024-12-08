import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  Share,
  TouchableWithoutFeedback,
  ImageBackground,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Linking from 'expo-linking';
import { format } from "date-fns";
import { getUserTrips, getTripById } from "@/Service/Trip.Service";


interface Trip {
  id: number;
  name: string;
  country: string;
  summary?: string;
  startDate: string;
  endDate: string;
}

interface TripCardProps {
  item: Trip;
  onPress: () => void;
  onLongPress: () => void;
  isCurrentTrip: boolean;
}

const TripCard: React.FC<TripCardProps> = ({ item, onPress, onLongPress, isCurrentTrip }) => {
  const startDate = new Date(item.startDate);
  const endDate = item.endDate ? new Date(item.endDate) : startDate;
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Animatable.View 
      animation="fadeInUp" 
      duration={1000} 
      style={styles.tripCard}
    >
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.cardTouchable}
        activeOpacity={0.9}
      >
        <ImageBackground
          source={require('../assets/images/Travel1.jpg')}
          style={styles.cardBackground}
          imageStyle={styles.cardImage}
        >
          <LinearGradient
            colors={['rgba(67, 35, 113, 0.4)', 'rgba(67, 35, 113, 0.95)']}
            style={styles.gradient}
          >
            {isCurrentTrip && (
              <Animatable.View 
                animation="fadeIn" 
                style={styles.badgeContainer}
              >
                <Text style={styles.badgeText}>NOW TRAVELING</Text>
              </Animatable.View>
            )}

            <View style={styles.cardContent}>
              <Text style={styles.tripName}>{item.name}</Text>
              <Text style={styles.tripDescription} numberOfLines={2}>
                {item.summary || `Découvrez les merveilles de ${item.country}`}
              </Text>

              <View style={styles.tripDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailValue}>
                    {format(startDate, "MMMM")}
                  </Text>
                  <Text style={styles.detailLabel}>
                    {format(startDate, "yyyy")}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailValue}>{days}</Text>
                  <Text style={styles.detailLabel}>DAYS</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailValue}>0</Text>
                  <Text style={styles.detailLabel}>MILES</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const TripList = ({ navigation, refreshing, route }: { navigation: any; refreshing: boolean; route: any }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const tripsData = await getUserTrips();
        setTrips(tripsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
    const unsubscribe = navigation.addListener("focus", () => {
      if (route.params?.deleted || route.params?.updated|| route.params?.newTrip) {
        fetchTrips();
      }
    });
    return unsubscribe;
  }, [refreshing, route.params?.deleted, route.params?.updated,route.params?.newTrip]);

  const handleLongPress = (tripId: number) => {
    setSelectedTripId(tripId);
    setModalVisible(true);
  };

  const handleMenuAction = async (action: string) => {
    if (selectedTripId === null) {
      Alert.alert("Erreur", "Aucun voyage sélectionné");
      return;
    }

    if (action === "settings") {
      navigation.navigate("TripDetails", { id: selectedTripId });
    } else if (action === "share") {
      try {
        const tripDetails = await getTripById(selectedTripId);
  
        if (!tripDetails) {
          Alert.alert("Erreur", "Détails du voyage introuvables");
          return;
        }
        if (!tripDetails.isPublic) {
          Alert.alert("Erreur", "Ce voyage n'est pas public. Rendez-le public dans les paramètres avant de pouvoir le partager.");
          return;
        }
        
  
        const { name: tripName,id: tripId } = tripDetails;
        const { firstName, lastName } = tripDetails.user;
  
        const url = Linking.createURL("Sharedtrip",{
          queryParams:{
            firstName,lastName,tripId,tripName
          }
        })
        const result = await Share.share({
          message:url,
        });
  
        if (result.action === Share.sharedAction) {
          if (result.activityType) {

          } else {
          }
        } else if (result.action === Share.dismissedAction) {
        }

        
      } catch (error) {
        console.error("Erreur lors du partage :", error);
        Alert.alert("Erreur", "Impossible de partager le voyage.");
      }
    }
    setModalVisible(false);
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Chargement de vos voyages...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id.toString()}

        renderItem={({ item }) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const startDate = new Date(item.startDate);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(item.endDate);
          endDate.setHours(23, 59, 59, 999);
          
          const isCurrentTrip = today >= startDate && today <= endDate;

          return (
            <TripCard
              item={item}
              onPress={() => navigation.navigate("Steps", { id: item.id })}
              onLongPress={() => handleLongPress(item.id)}
              isCurrentTrip={isCurrentTrip}
            />
          );
        }}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}

      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <TouchableOpacity 
                  style={styles.optionRow}
                  onPress={() => handleMenuAction("settings")}
                >
                  <Icon name="settings" size={24} color="#432371" />
                  <Text style={styles.optionText}>Paramètres du voyage</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.optionRow}
                  onPress={() => handleMenuAction("share")}
                >
                  <Icon name="share" size={24} color="#432371" />
                  <Text style={styles.optionText}>Partager le voyage</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  listContainer: {
    paddingVertical: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#432371',
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
  },
  tripCard: {
    height: 220,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#432371',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardTouchable: {
    flex: 1,
  },
  cardBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardImage: {
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    justifyContent: 'flex-end',
  },
  tripName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tripDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
  },
  detailItem: {
    alignItems: 'flex-start',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(67, 35, 113, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#432371',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#432371',
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default TripList;