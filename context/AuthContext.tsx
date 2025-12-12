import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API'den dönen veri yapısı
interface UserInfo {
  Id: number;
  Email: string;
  PersonId: number;
  TitleNameSurname: string; 
  Image: string | null;     
  BirthDate: string;
}

interface AuthContextType {
  token: string | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  validateToken: (tokenToCheck: string) => Promise<boolean>;
  fetchUserInfo: (tokenToUse: string) => Promise<boolean>; // <-- Boolean dönecek şekilde güncelledik
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- KULLANICI BİLGİLERİNİ ÇEKME ---
  // Artık işlemin başarılı olup olmadığını (true/false) dönüyor
  const fetchUserInfo = async (tokenToUse: string): Promise<boolean> => {
    try {
      console.log("🚀 Kullanıcı bilgileri isteniyor...");
      const cleanToken = tokenToUse.trim();

      // 1. DENEME: 'Token' başlığı ile
      let response = await fetch('https://mobil.kastamonu.edu.tr/api/Authentication/GetMyInfo', {
        method: 'GET',
        headers: {
          'Token': cleanToken,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      // 2. DENEME: 401 alırsak Bearer ile dene
      if (response.status === 401) {
        console.log("⚠️ Token header başarısız, Bearer deneniyor...");
        response = await fetch('https://mobil.kastamonu.edu.tr/api/Authentication/GetMyInfo', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${cleanToken}`, 
              'Content-Type': 'application/json',
              'User-Agent': 'PostmanRuntime/7.36.0'
            }
        });
      }

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Kullanıcı Bilgisi Alındı:", data.TitleNameSurname);
        setUserInfo(data);
        return true; // Başarılı
      } else {
        const errorText = await response.text();
        console.log("❌ Bilgi alınamadı:", response.status, errorText);
        return false; // Başarısız
      }

    } catch (error) {
      console.error("🔥 fetchUserInfo Hatası:", error);
      return false; // Hata
    }
  };

  const validateToken = async (tokenToCheck: string): Promise<boolean> => {
    try {
      const response = await fetch('https://ubys.kastamonu.edu.tr/Framework/Integration/ServiceCaller/Auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: "GetTokenValidate",
          serviceCriteria: {
            Token: tokenToCheck
          }
        }),
      });

      const responseText = await response.text();
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        if (responseText.toLowerCase() === 'true') return true;
        return false;
      }

      if (json === true) return true;
      if (typeof json === 'object' && json !== null) {
         if (json.Result === true || json.result === true || json.Success === true || json.success === true) {
             return true;
         }
      }
      return false; 
    } catch (error) {
      return false; 
    }
  };

  // --- UYGULAMA AÇILIŞI (GÜNCELLENDİ) ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        
        if (storedToken) {
          // 1. Önce sunucudan basit validasyon yap (Hızlı kontrol)
          const isValidFormat = await validateToken(storedToken);
          
          if (isValidFormat) {
            console.log("Token formatı geçerli, veri çekmeye çalışılıyor...");
            
            // 2. ASIL TEST: Veriyi çekebiliyor muyuz?
            const dataFetched = await fetchUserInfo(storedToken);
            
            if (dataFetched) {
              // Veri geldiyse token gerçekten sağlamdır.
              setToken(storedToken);
            } else {
              // Validate true dese bile veri gelmiyorsa token işe yaramaz. Çıkış yap.
              console.log("Token geçerli ama veri alınamadı. Oturum kapatılıyor.");
              await logout();
            }
          } else {
            console.log("Token formatı geçersiz.");
            await logout();
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (newToken: string) => {
    // Önce kaydet
    await AsyncStorage.setItem('userToken', newToken);
    
    // Sonra veriyi çekmeyi dene
    const success = await fetchUserInfo(newToken);
    
    if (success) {
        setToken(newToken); // Başarılıysa state'i güncelle (Uygulama açılır)
    } else {
        // Token ile veri çekilemediyse kaydı sil (Hatalı giriş gibi davran)
        console.log("Giriş sonrası veri çekilemedi, token siliniyor.");
        await AsyncStorage.removeItem('userToken');
        alert("Giriş başarısız oldu. Lütfen tekrar deneyin.");
    }
  };

  const logout = async () => {
    setToken(null);
    setUserInfo(null);
    await AsyncStorage.removeItem('userToken');
  };

  return (
    <AuthContext.Provider value={{ token, userInfo, isLoading, login, logout, validateToken, fetchUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};