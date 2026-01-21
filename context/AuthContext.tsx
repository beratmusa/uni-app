import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Applications İçin Model Tanımı
interface Application {
  Id: number;
  ContextId: number;
  Uri: string;
  Enabled: boolean;
  Name: string;
}

// 2. UserInfo Modeli
interface UserInfo {
  Id: number;
  Email: string;
  PersonId: number;
  TitleNameSurname: string; 
  Image: string | null;     
  Applications: Application[];
}

interface AuthContextType {
  token: string | null;
  userInfo: UserInfo | null;
  isStudent: boolean;     
  isInstructor: boolean;   
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  validateToken: (tokenToCheck: string) => Promise<boolean>;
  fetchUserInfo: (tokenToUse: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isStudent, setIsStudent] = useState<boolean>(false);
  const [isInstructor, setIsInstructor] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- KULLANICI BİLGİLERİNİ ÇEKME ---
  const fetchUserInfo = async (tokenToUse: string): Promise<boolean> => {
    try {
      const cleanToken = tokenToUse.trim();

      const response = await fetch('https://mobil.kastamonu.edu.tr/api/Authentication/GetMyInfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // console.log("✅ Kullanıcı:", data.TitleNameSurname);
        // console.log("✅ Kullanıcı token:", cleanToken);
        
        // --- ROL KONTROLÜ (SADECE APPLICATION NAME İLE) ---
        let studentStatus = false;
        let instructorStatus = false;

        if (data.Applications && Array.isArray(data.Applications)) {
          studentStatus = data.Applications.some((app: Application) => 
            app.Name.includes("Öğrenci Mobil")
          );
          instructorStatus = data.Applications.some((app: Application) => 
            app.Name.includes("Öğretim Üyesi Mobil")
          );
        }

          // console.log(`🎓 Rol Tespiti -> Öğrenci: ${studentStatus}, Eğitmen: ${instructorStatus}`);

        setIsStudent(studentStatus);
        setIsInstructor(instructorStatus);
        setUserInfo(data);
        return true; 
      } else {
        return false; 
      }

    } catch (error) {
      return false; 
    }
  };

  // --- TOKEN DOĞRULAMA ---
  const validateToken = async (tokenToCheck: string): Promise<boolean> => {
    try {
      const response = await fetch('https://ubys.kastamonu.edu.tr/Framework/Integration/ServiceCaller/Auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: "GetTokenValidate",
          serviceCriteria: { Token: tokenToCheck }
        }),
      });
      const responseText = await response.text();
      if (responseText.toLowerCase() === 'true' || responseText.includes('true')) return true;
      return false; 
    } catch (error) { return false; }
  };

  // --- UYGULAMA AÇILIŞI ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          const isValidFormat = await validateToken(storedToken);
          if (isValidFormat) {
            const dataFetched = await fetchUserInfo(storedToken);
            if (dataFetched) {
              setToken(storedToken);
            } else {
              await logout();
            }
          } else {
            await logout();
          }
        }
      } catch (e) { console.error(e); } 
      finally { setIsLoading(false); }
    };
    initAuth();
  }, []);

  const login = async (newToken: string) => {
    await AsyncStorage.setItem('userToken', newToken);
    const success = await fetchUserInfo(newToken);
    if (success) setToken(newToken);
    else await AsyncStorage.removeItem('userToken');
  };

  const logout = async () => {
    setToken(null);
    setUserInfo(null);
    await AsyncStorage.removeItem('userToken');
  };

  return (
    <AuthContext.Provider value={{ token, userInfo, isStudent,isInstructor, isLoading, login, logout, validateToken, fetchUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};