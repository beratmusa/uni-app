import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, Image, FlatList, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RefreshCw, CreditCard, ShieldCheck, User, ChevronDown, ChevronUp, GraduationCap, Briefcase } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CustomAlert } from '../components/CustomAlert';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- TİPLER ---
interface SearchProfile {
  tcNumarasi: string;
  adi: string;
  soyadi: string;
  uniqNo: string;
  durum: string;
  tip: string;
  resimBase64: string | null;
}

interface PerioCardInfo {
  ad: string;
  soyad: string;
  kategori: string;       
  nO_SICIL: string;       
  heX_KART_ID: string;    
  decimaL_KART_ID: number;
  bakiye?: number;
}

interface DigitalCard extends SearchProfile {
  cardDetails?: PerioCardInfo;
}

const { width } = Dimensions.get('window');

// --- ALT BİLEŞEN: KART TASARIMI ---
const DigitalCardView = ({ item, t }: { item: DigitalCard, t: any }) => {
    const isStudent = item.tip === "ÖĞRENCİ";
    const bgColor = isStudent ? "bg-blue-900" : "bg-slate-800"; 
    const qrValue = item.cardDetails?.decimaL_KART_ID?.toString() || item.uniqNo;

    const idTypeLabel = isStudent ? (t.studentIdLabel || "ÖĞRENCİ") : (t.staffIdLabel || "PERSONEL");
    const idSuffix = t.idSuffix || "KİMLİĞİ";

    return (
        <View className="w-full items-center mb-6">
            {/* KART GÖVDESİ */}
            <View 
                className={`w-full ${bgColor} rounded-3xl overflow-hidden shadow-xl`}
                style={{ height: 240, elevation: 10, width: width - 40 }}
            >
                <View className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-10 -mt-10 opacity-10" />
                <View className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-10 -mb-10 opacity-5" />

                <View className="flex-1 p-6 justify-between">
                    {/* Üst Kısım */}
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/30">
                                <ShieldCheck size={20} color="white" />
                            </View>
                            <View>
                                <Text className="text-white/70 font-bold text-[10px] uppercase tracking-widest">
                                    {t.uniName || "KASTAMONU ÜNİVERSİTESİ"}
                                </Text>
                                <Text className="text-white font-extrabold text-base">
                                    {idTypeLabel} {idSuffix}
                                </Text>
                            </View>
                        </View>
                        <View className={`px-3 py-1 rounded-full border border-white/10 ${item.durum === 'Aktif' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            <Text className={`text-[10px] font-bold uppercase ${item.durum === 'Aktif' ? 'text-green-300' : 'text-red-300'}`}>
                                {item.durum}
                            </Text>
                        </View>
                    </View>

                    {/* Orta Kısım */}
                    <View className="flex-row items-center mt-2">
                        <View className="w-20 h-24 bg-white/10 rounded-xl border border-white/20 items-center justify-center overflow-hidden mr-4">
                            {item.resimBase64 ? (
                                <Image 
                                    source={{ uri: `data:image/jpeg;base64,${item.resimBase64}` }} 
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <User size={32} color="rgba(255,255,255,0.5)" />
                            )}
                        </View>

                        <View>
                            <Text className="text-white font-black text-2xl shadow-sm leading-7">{item.adi}</Text>
                            <Text className="text-white font-black text-2xl shadow-sm leading-7">{item.soyadi}</Text>
                            <Text className="text-white/60 font-medium text-xs mt-2 uppercase tracking-wider">
                                {isStudent ? (t.studentNo || "Öğrenci No") : (t.staffNo || "Sicil No")}
                            </Text>
                            <Text className="text-white font-mono text-lg tracking-widest">
                                {item.uniqNo}
                            </Text>
                        </View>
                    </View>
                </View>
                <View className={`h-3 w-full ${isStudent ? 'bg-red-600' : 'bg-orange-500'}`} />
            </View>

            {/* QR ALANI */}
            <View className="mt-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 items-center w-full relative overflow-hidden" style={{ width: width - 40 }}>
                <View className="absolute top-0 w-8 h-8 bg-slate-50 rotate-45 -mt-4 shadow-sm z-10 border border-slate-100" />
                <Text className="text-slate-400 font-bold text-[10px] uppercase mb-4 tracking-widest">
                    {t.qrTitle || "TURNİKE & YEMEKHANE QR KODU"}
                </Text>
                <View className="p-3 border-2 border-slate-100 rounded-2xl bg-white shadow-sm">
                    <QRCode value={qrValue} size={160} color="black" backgroundColor="white" />
                </View>
                <Text className="text-slate-900 font-bold text-xl tracking-wider font-mono mt-4">
                    {qrValue}
                </Text>
            </View>
        </View>
    );
};

// --- ANA EKRAN ---
export const DigitalIDScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuth(); 
  const { dictionary } = useLanguage();
  
  const t = dictionary.digitalId || {
    headerTitle: "Dijital Kimlik",
    loadingUser: "Kullanıcı bilgileri alınıyor...",
    searching: "Kimlik kayıtları aranıyor...",
    creating: "Kart detayları oluşturuluyor...",
    emailError: "E-posta adresi bulunamadı.",
    fetchErrorTitle: "Hata",
    fetchErrorMessage: "Kimlik bilgileri yüklenirken bir sorun oluştu.",
    notFoundTitle: "Kayıt Bulunamadı",
    notFoundDesc: "Bu e-posta adresine bağlı aktif bir kimlik kartı kaydı bulunamadı.",
    totalCards: "Toplam {0} adet kimlik kartı bulundu."
  };
  
  const [cards, setCards] = useState<DigitalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(t.loadingUser);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // --- CUSTOM ALERT STATE ---
  const [alertConfig, setAlertConfig] = useState({
      visible: false,
      type: 'success' as 'success' | 'error',
      title: '',
      message: ''
  });

  const showAlert = (type: 'success' | 'error', title: string, message: string) => {
      setAlertConfig({ visible: true, type, title, message });
  };

  const closeAlert = () => {
      setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    loadDigitalIDs();
  }, []);

  const loadDigitalIDs = async () => {
    try {
      setLoading(true);
      setCards([]);
      
      // 1. Email al
      setStatusMessage(t.loadingUser || "Kullanıcı bilgileri alınıyor...");
      const myInfoRes = await fetch('https://mobil.kastamonu.edu.tr/api/Authentication/GetMyInfo', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const myInfoJson = await myInfoRes.json();
      const email = myInfoJson.Data?.Email || myInfoJson.Email;

      if (!email) throw new Error(t.emailError || "E-posta adresi bulunamadı.");

      // 2. Profilleri Ara
      setStatusMessage(t.searching || "Kimlik kayıtları aranıyor...");
      const searchRes = await fetch('https://perioapi.kastamonu.edu.tr/api/UbysProxy/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': 'Kastamonu-37-XyZ-998877'
        },
        body: JSON.stringify({ Email: email, ResimleriDahilEt: false })
      });

      const profiles: SearchProfile[] = await searchRes.json();

      if (!Array.isArray(profiles) || profiles.length === 0) {
        setLoading(false);
        return;
      }

      // 3. Kart Detaylarını Çek
      setStatusMessage(t.creating || "Kart detayları oluşturuluyor...");
      const cardPromises = profiles.map(async (profile) => {
        try {
          const cardRes = await fetch(`https://perioapi.kastamonu.edu.tr/api/periokart/kart-bilgisi/${profile.uniqNo}`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'X-Api-Key': 'Kastamonu-37-XyZ-998877'
            }
          });
          
          const resText = await cardRes.text();
          let cardDetails: PerioCardInfo | undefined = undefined;

          // --- GÜVENLİ PARSE İŞLEMİ ---
          try {
              if (resText && resText.trim().length > 0) {
                  const firstChar = resText.trim().charAt(0);
                  
                  if (firstChar === '[' || firstChar === '{') {
                      const cardJson = JSON.parse(resText);
                      
                      if (Array.isArray(cardJson) && cardJson.length > 0) {
                          cardDetails = cardJson[0]; 
                      } 
                      else if (!Array.isArray(cardJson) && cardJson.heX_KART_ID) {
                          cardDetails = cardJson;
                      }
                  } else {
                      console.log(`Sunucudan JSON olmayan yanıt geldi (${profile.uniqNo}):`, resText);
                  }
              }
          } catch(e) {
              console.warn(`JSON Parse Hatası (${profile.uniqNo}):`, e);
          }

          return { ...profile, cardDetails };

        } catch (e) {
          console.error(`Fetch Hatası (${profile.uniqNo}):`, e);
          return { ...profile, cardDetails: undefined };
        }
      });

      const results = await Promise.all(cardPromises);
      setCards(results);

    } catch (error) {
      console.error("Dijital Kimlik Hatası:", error);
      showAlert(
          'error', 
          t.fetchErrorTitle || "Hata", 
          t.fetchErrorMessage || "Kimlik bilgileri yüklenirken bir sorun oluştu."
      );
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  };

  const toggleExpand = (uniqNo: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => prev === uniqNo ? null : uniqNo);
  };

  const renderHeader = () => (
    <View className="px-5 py-4 bg-white flex-row items-center justify-between shadow-sm z-10">
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100 active:bg-slate-100"
      >
        <ArrowLeft size={20} color="#334155" />
      </TouchableOpacity>
      <Text className="text-lg font-bold text-slate-800">{t.headerTitle || "Dijital Kimlik"}</Text>
      <TouchableOpacity 
        onPress={loadDigitalIDs}
        className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100 active:bg-slate-100"
      >
        <RefreshCw size={20} color="#334155" />
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    // 1. Durum: Kart Yok
    if (cards.length === 0) {
        return (
            <View className="flex-1 items-center justify-center px-6 mt-20">
                <CreditCard size={64} color="#cbd5e1" />
                <Text className="mt-4 text-slate-800 font-bold text-lg text-center">{t.notFoundTitle}</Text>
                <Text className="mt-2 text-slate-400 text-center">{t.notFoundDesc}</Text>
            </View>
        );
    }

    // 2. Durum: TEK Kart
    if (cards.length === 1) {
        return (
            <View className="pt-6 items-center">
                <DigitalCardView item={cards[0]} t={t} />
            </View>
        );
    }

    // 3. Durum: ÇOKLU Kart
    return (
        <View className="pt-4 px-4 pb-20">
            <Text className="text-slate-500 font-medium mb-4 text-center">
                {(t.totalCards || "Toplam {0} adet kimlik kartı bulundu.").replace("{0}", cards.length.toString())}
            </Text>
            
            {cards.map((item) => {
                const isExpanded = expandedId === item.uniqNo;
                const isStudent = item.tip === "ÖĞRENCİ";
                
                return (
                    <View key={item.uniqNo} className="mb-3 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <TouchableOpacity 
                            onPress={() => toggleExpand(item.uniqNo)}
                            activeOpacity={0.7}
                            className={`flex-row items-center justify-between p-4 ${isExpanded ? 'bg-slate-50' : 'bg-white'}`}
                        >
                            <View className="flex-row items-center gap-3">
                                <View className={`w-10 h-10 rounded-full items-center justify-center ${isStudent ? 'bg-blue-100' : 'bg-slate-200'}`}>
                                    {isStudent 
                                        ? <GraduationCap size={20} color="#2563eb" /> 
                                        : <Briefcase size={20} color="#475569" />
                                    }
                                </View>
                                <View>
                                    <Text className="font-bold text-slate-800 text-base">
                                        {isStudent ? (t.studentIdLabel || "Öğrenci Kimliği") : (t.staffIdLabel || "Personel Kimliği")}
                                    </Text>
                                    <Text className={`text-xs font-bold ${item.durum === 'Aktif' ? 'text-green-600' : 'text-red-500'}`}>
                                        {item.durum} • {item.uniqNo}
                                    </Text>
                                </View>
                            </View>
                            {isExpanded ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                        </TouchableOpacity>

                        {isExpanded && (
                            <View className="p-4 bg-slate-50 border-t border-slate-100 items-center">
                                <DigitalCardView item={item} t={t} />
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {renderHeader()}

      {loading ? (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-4 text-slate-500 font-medium">{statusMessage}</Text>
        </View>
      ) : (
        <FlatList
            data={[]} 
            renderItem={null}
            ListHeaderComponent={renderContent}
            showsVerticalScrollIndicator={false}
        />
      )}

      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={closeAlert}
        confirmText={dictionary.ok}
      />
    </SafeAreaView>
  );
};