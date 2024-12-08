
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Image, 
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { getUserData, updateUserData, uploadProfilePhoto, getProfilePhoto } from '@/Service/Profil.Service';


interface UserData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  pic?: string;
}


  const ProfilInfos = ({ navigation }: any) => {
    const [userData, setUserData] = useState<any>({
      firstName: '',
      lastName: '',
      email: '',
      address: '',
    });
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
    const fetchUserData = async () => {
      try {
        const data = await getUserData();
        setUserData({
          id:data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          address: data.address || '',
          pic: data.pic,
        });
  
        if (data.pic) {
       
          const profilePictureBlob = await getProfilePhoto(data.id);
          
          setSelectedImage(profilePictureBlob);
        }
      } catch (error: any) {
      
        Alert.alert('Erreur', error.message);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchUserData();
    }, []);
  
    const handleUpdate = async () => {
      try {
        const updatedData = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          address: userData.address,
        };
  
        await updateUserData(updatedData);
        navigation.navigate('Profil',  { updated: true },);
      } catch (error: any) {
        Alert.alert('Erreur', error.message);
      }
    };  
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Erreur', 'Désolé, nous avons besoin d\'accès à la galerie pour choisir une photo.');
          return;
        }
    
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
        if (!result.canceled) {
          const pickedImage = result.assets[0];
          let imageUri = pickedImage.uri;
          setSelectedImage(imageUri);
    
          try {
            await uploadProfilePhoto(pickedImage);
            Alert.alert('Succès', 'Photo de profil mise à jour avec succès.');
            navigation.navigate('Main', {
              screen: 'Profil',
              params: { updated: true },
            });
  
          } catch (error: any) {
            Alert.alert('Erreur', error.message);
          }
        }
    };
    

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#432371', '#faae7b']}
          style={StyleSheet.absoluteFillObject}
        />
  
        {/* Header */}
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="person-outline" size={40} color="#FFF" />
                </View>
              )}
              <View style={styles.cameraButton}>
                <Ionicons name="camera" size={20} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-outline" size={20} color="#432371" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Prénom"
              placeholderTextColor="#999"
              value={userData.firstName}
              onChangeText={(text) => setUserData({ ...userData, firstName: text })}
            />
          </View>
  
          <View style={styles.inputWrapper}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-outline" size={20} color="#432371" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nom"
              placeholderTextColor="#999"
              value={userData.lastName}
              onChangeText={(text) => setUserData({ ...userData, lastName: text })}
            />
          </View>
  
          <View style={styles.inputWrapper}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={20} color="#432371" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
  
          <View style={styles.inputWrapper}>
            <View style={styles.iconContainer}>
              <Ionicons name="home-outline" size={20} color="#432371" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Adresse"
              placeholderTextColor="#999"
              value={userData.address}
              onChangeText={(text) => setUserData({ ...userData, address: text })}
            />
          </View>
  
          <TouchableOpacity 
            style={styles.updateButton}
            onPress={handleUpdate}
          >
            <LinearGradient
              colors={['#faae7b', '#432371']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.updateButtonText}>Mettre à jour</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    backButton: {
      padding: 8,
    },
    logoutButton: {
      padding: 8,
    },
    profileImageContainer: {
      alignItems: 'center',
      marginVertical: 20,
    },
    imageWrapper: {
      position: 'relative',
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: '#FFF',
    },
    placeholderContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: '#FFF',
    },
    cameraButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#432371',
      width: 34,
      height: 34,
      borderRadius: 17,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFF',
    },
    formContainer: {
      flex: 1,
      backgroundColor: '#FFF',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingTop: 30,
      paddingHorizontal: 20,
      marginTop: 20,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F8F8F8',
      borderRadius: 15,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#EEE',
    },
    iconContainer: {
      padding: 15,
      backgroundColor: '#FFF',
      borderRadius: 12,
      marginRight: 10,
    },
    input: {
      flex: 1,
      paddingVertical: 15,
      fontSize: 16,
      color: '#333',
    },
    updateButton: {
      marginTop: 20,
      borderRadius: 15,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#432371',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    gradientButton: {
      paddingVertical: 16,
      alignItems: 'center',
    },
    updateButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
  
  export default ProfilInfos;