import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, Camera } from "expo-camera";
import { useNavigation } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const QRScannerScreen = () => {
  const { dictionary } = useLanguage();
  const { token } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: any) => {
    if (scanned) return; // Tekrar tekrar okumasın diye
    setScanned(true);

    // 1. Token Kontrolü
    if (!token) {
        Alert.alert("Hata", "Oturum süreniz dolmuş, lütfen tekrar giriş yapın.");
        navigation.goBack();
        return;
    }

    try {
        // QR verisini ekrana basmak yerine sunucuya gönderiyoruz
        console.log("QR Okundu, sunucuya gönderiliyor:", data);

        const response = await fetch('https://mobil.kastamonu.edu.tr/api/Yoklama/QrKatil', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, // <-- KİMLİK
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                qrData: data // QR'dan çıkan veri (Genelde şifreli bir string olur)
            })
        });

        if (response.ok) {
            Alert.alert("Başarılı", "✅ Yoklamaya başarıyla katıldınız!", [
                { text: "Tamam", onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert("Hata", "❌ QR Kod geçersiz veya süresi dolmuş.", [
                { text: "Tekrar Dene", onPress: () => setScanned(false) },
                { text: "Çık", onPress: () => navigation.goBack() }
            ]);
        }

    } catch (error) {
        Alert.alert("Hata", "Sunucuya bağlanılamadı.");
        navigation.goBack();
    }
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white">{dictionary.cameraPermissionRequest}</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white">{dictionary.noCameraPermission}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Kapatma Butonu */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        className="absolute top-12 right-6 bg-black/50 p-3 rounded-full"
      >
        <X size={24} color="white" />
      </TouchableOpacity>

      {/* Tarama Alanı Göstergesi (Overlay) */}
      <View className="absolute inset-0 justify-center items-center">
        <View className="w-64 h-64 border-2 border-white/60 rounded-3xl bg-transparent" />
        <Text className="text-white mt-4 font-bold bg-black/40 px-4 py-2 rounded-full overflow-hidden">
          {dictionary.scanQROverlay}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
});