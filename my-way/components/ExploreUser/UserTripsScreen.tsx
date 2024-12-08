import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getProfilePhoto, getUserTripsBySearch } from '@/Service/Profil.Service';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

type UserTripsScreenProps = {
  route: RouteProp<RootStackParamList, 'UserTripsScreen'>;
};
type RootStackParamList = {
  UserTripsScreen: { userId: string };
  TripStepsScreen: { tripId: string; tripname: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'UserTripsScreen'>;

const UserTripsScreen = ({ route }: UserTripsScreenProps) => {
  const { userId } = route.params;
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [stats, setStats] = useState({ countries: 0, trips: 0 });

  const navigation = useNavigation<NavigationProp>();

  const fetchUserTrips = async () => {
    try {
      const data = await getUserTripsBySearch(userId);
      setUserData(data);
      if (data) {
        const photoBlob = await getProfilePhoto(userId);
        setProfilePhoto(photoBlob);
        const calculatedStats = calculateStats(data.trips);
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de l\'utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (trips: any[]) => {
    if (!trips || trips.length === 0) {
      return { countries: 0, trips: 0 };
    }
    const uniqueCountries = new Set(trips.map((trip) => trip.country)).size;
    const totalTrips = trips.length;
    return {
      countries: uniqueCountries,
      trips: totalTrips,
    };
  };

  useEffect(() => {
    fetchUserTrips();
  }, [userId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#001F2D" style={styles.loading} />;
  }

  return (
    
    <LinearGradient
      colors={['#432371', '#faae7b']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
    
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: profilePhoto || 'default-avatar-url' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>{`${userData.firstName} ${userData.lastName}`}</Text>
        </View>

        <View style={styles.glassCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.countries}</Text>
            <Text style={styles.statLabel}>Pays</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.trips}</Text>
            <Text style={styles.statLabel}>Voyages</Text>
          </View>
        </View>

        <View style={styles.tripsSection}>
          <Text style={styles.sectionTitle}>Mes Voyages</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <FlatList
              data={userData.trips}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const startDate = new Date(item.startDate);
                const endDate = new Date(item.endDate);
                const totalDays = Math.ceil(
                  (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <TouchableOpacity
                    style={styles.tripCard}
                    onPress={() =>
                      navigation.navigate('TripStepsScreen', { tripId: item.id, tripname: item.name })
                    }
                  >
                    <ImageBackground
                      source={require('../../assets/images/Travel1.jpg')}
                      style={styles.tripBackground}
                      imageStyle={{ borderRadius: 12 }}
                    >
                      <LinearGradient
                        colors={['rgba(67, 35, 113, 0.4)', 'rgba(67, 35, 113, 0.95)']}
                        style={styles.overlay}
                      >
                        <View style={styles.tripInfo}>
                          <Text style={styles.tripName}>{item.name}</Text>
                          <View style={styles.dateRow}>
                            <Ionicons
                              name="calendar-outline"
                              size={16}
                              color="rgba(255,255,255,0.8)"
                            />
                            <Text style={styles.dateText}>
                              {format(startDate, 'dd MMM yyyy')} -{' '}
                              {format(endDate, 'dd MMM yyyy')}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.daysContainer}>
                          <Text style={styles.daysNumber}>{totalDays}</Text>
                          <Text style={styles.daysText}>Jours</Text>
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                  </TouchableOpacity>
                );
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.tripsList}
            />
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
  },
  glassCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
  },
  tripsSection: {
    flex: 1,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tripsList: {
    paddingBottom: 20,
  },
  tripCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tripBackground: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  tripInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  tripName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  daysContainer: {
    alignItems: 'center',
  },
  daysNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  daysText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default UserTripsScreen;
