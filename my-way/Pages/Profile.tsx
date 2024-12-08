import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, FlatList } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { getUserData, getProfilePhoto } from '@/Service/Profil.Service';
import TripList from '@/components/GetTripx';
import { getUserTrips } from '@/Service/Trip.Service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { logoutUser } from '@/Service/Login.Service';
import { CommonActions } from '@react-navigation/native';

interface Trip {
  id: string;
  country: string;
  days: number;
  startDate: string;
  endDate: string;
}

const calculateStats = (trips: Trip[]) => {
  if (!trips || trips.length === 0) {
    return { countries: 0, trips: 0, days: 0 };
  }

  const uniqueCountries = new Set(trips.map(trip => trip.country)).size;
  const totalTrips = trips.length;
  const totalDays = trips.reduce((acc, trip) => acc + (trip.days || 0), 0);

  return {
    countries: uniqueCountries,
    trips: totalTrips,
    days: totalDays,
  };
};

const Profil = ({ navigation, route,setIsAuthenticated }: any) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [stats, setStats] = useState({ countries: 0, trips: 0, days: 0 });
  const [trips, setTrips] = useState<Trip[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const loadUserData = async () => {
    try {
      const userData = await getUserData();
      setFirstName(userData.firstName);
      setLastName(userData.lastName);

      const userIdString = await AsyncStorage.getItem('userId');
      const userId = userIdString || '0';

      const profilePictureBlob = await getProfilePhoto(userId);
     
      const updatedAvatarUrl = `${profilePictureBlob}?timestamp=${new Date().getTime()}`;
    setAvatarUrl(updatedAvatarUrl);
      const userTrips = await getUserTrips();
      setTrips(userTrips); 
      const calculatedStats = calculateStats(userTrips);
      setStats(calculatedStats);
    } catch (error: any) {
      console.error('Failed to load user data', error);
      Alert.alert('Erreur', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      setTimeout(()=>{
        navigation.navigate('Home');
    },100)
    } catch (error: any) {
      Alert.alert('Erreur', 'La déconnexion a échoué.');
    }
  };
  useEffect(() => {
    const loadTrips = async () => {
      try {
        setRefreshing(true);
        await loadUserData();
        setRefreshing(false);
      } catch (error) {
        setRefreshing(false);
        console.error('Erreur lors du chargement des voyages', error);
      }
    };
  
    loadTrips();
  
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.deleted || route.params?.updated || route.params?.newTrip) {
        setRefreshing(true);
        loadTrips().finally(() => {
          const timer = setTimeout(() => setRefreshing(false), 1000);
          return () => clearTimeout(timer); 
        });
      }
    });
  

    return unsubscribe;
  }, [navigation, route.params?.updated, route.params?.deleted, route.params?.newTrip]);
  

  const renderHeader = () => (
    <View>
      <LinearGradient colors={['#432371', '#faae7b']} style={styles.header}>
      <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
        <View style={styles.headerContent}>
          <Animatable.View animation="fadeIn" duration={1000} style={styles.avatarContainer}>
            <Image
              source={avatarUrl ? { uri: avatarUrl } : require('../assets/images/profile.jpg')}
              style={styles.avatar}
            />
          </Animatable.View>
          <Animatable.Text animation="fadeInUp" duration={1000} style={styles.name}>
            {`${firstName} ${lastName}`}
          </Animatable.Text>
        </View>
      </LinearGradient>
    
      <View style={styles.statsContainer}>
        <Animatable.View animation="fadeInUp" delay={300} style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.countries}</Text>
          <Text style={styles.statLabel}>Pays</Text>
        </Animatable.View>
        <View style={styles.statDivider} />
        <Animatable.View animation="fadeInUp" delay={400} style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.trips}</Text>
          <Text style={styles.statLabel}>Voyages</Text>
        </Animatable.View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.addTripButton} onPress={() => navigation.navigate('CreateTrip')}>
          <LinearGradient colors={['#432371', '#faae7b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.addTripText}>Nouveau voyage</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('Infos')}>
          <Ionicons name="create-outline" size={24} color="#432371" />
          <Text style={styles.editButtonText}>Modifier</Text>
        </TouchableOpacity>
      </View>

   
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <TripList refreshing={false} navigation={navigation} route={route} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    padding: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 65,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  logoutIcon: {
    position: 'absolute',
    top: 81,
    right: 20,
    zIndex: 10,
  },

  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#432371',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(67, 35, 113, 0.1)',
    marginHorizontal: 20,
  },
  statNumber: {
    fontSize: 20, 
    fontWeight: '600', 
    color: '#432371', 
  },
  
  statLabel: {
    fontSize: 12,
    color: '#faae7b',
    marginTop: 2,
    fontWeight: '500', 
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  addTripButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#432371',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  addTripText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#432371',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    color: '#432371',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#432371',
    marginTop: 16,
    marginLeft: 20,
  },
});

export default Profil;
