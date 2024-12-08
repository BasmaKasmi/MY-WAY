"use client";
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";

const { width, height } = Dimensions.get("window");

interface InteractiveMapProps {
  markers: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    description: string;
  }>;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ markers }) => {
  const initialRegion = {
    latitude: markers.length > 0 ? markers[0].latitude : 35.6762,
    longitude: markers.length > 0 ? markers[0].longitude : 139.6503,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            description={marker.description}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
});

export default InteractiveMap;
