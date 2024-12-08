import { searchUser } from '@/Service/Profil.Service';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

const ExploreScreen = ({navigation , route }: any) => {

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchUser(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        Alert.alert(
          "Aucun utilisateur trouvé",
          `L'utilisateur "${searchQuery}" n'existe pas.`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de la recherche.",
        [{ text: "OK" }]
      );
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleUserPress = (userId: number) => {
    navigation.navigate('UserTripsScreen', { userId });
  };

  return (
    <LinearGradient
      colors={['#432371', '#faae7b']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
         
          {/* <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={30} color="#FFFFFF" />
          </TouchableOpacity> */}
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="rgba(255,255,255,0.8)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
            />
          </View>
        </View>

       

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userCard}
                onPress={() => handleUserPress(item.id)}
              >
                <View style={styles.glassEffect}>
                  <View style={styles.userAvatarContainer}>
                    <Text style={styles.userAvatar}>
                      {item.firstName[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.userName}>
                    {`${item.firstName}\n${item.lastName}`}
                  </Text>
                 
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.userGrid}
            showsVerticalScrollIndicator={false}
          />
        )}

        {searchResults.length === 0 && searchQuery.length > 0 && !loading && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={50} color="rgba(255,255,255,0.8)" />
            <Text style={styles.noResults}>Aucun résultat trouvé</Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileButton: {
    padding: 5,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userGrid: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  userCard: {
    flex: 1,
    margin: 10,
    height: 180,
  },
  glassEffect: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  userAvatar: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  rating: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 10,
  },
});

export default ExploreScreen;