import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native'; // Alert eklendi
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const LOGIN_URL = 'https://ubys.kastamonu.edu.tr/Framework/Integration/Authenticater/Login?authToken=8951ce48-12b8-4420-a2cd-1b9108467834'; 
 

export const LoginScreen = () => {
  const { login, validateToken } = useAuth(); 
  const navigation = useNavigation<any>();
  const [isValidating, setIsValidating] = useState(false); 
  
  const handleNavigationStateChange = async (newNavState: WebViewNavigation) => {
    const { url } = newNavState;
    
    if (url.includes('sorgu.kastamonu.edu.tr') && url.includes('token=')) {
      
      const match = url.match(/[?&]token=([^&#]*)/);
      
      if (match && match[1]) {
        const capturedToken = match[1];

        setIsValidating(true);

        const isValid = await validateToken(capturedToken);

        if (isValid) {
            await login(capturedToken);
            navigation.goBack();
        } else {
            Alert.alert("Giriş Hatası", "Oturum doğrulanamadı. Lütfen tekrar deneyin.");
            setIsValidating(false);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      {isValidating ? (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <WebView
            source={{ uri: LOGIN_URL }}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState={true}
            renderLoading={() => (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
            )}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            domStorageEnabled={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    zIndex: 10,
  }
});