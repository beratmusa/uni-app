import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './lib/notifications'; 
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu } from 'lucide-react-native';
import { DetailModal, DetailData } from './components/DetailModal';

// --- CONTEXT ---
import { useLanguage } from './context/LanguageContext';

// --- BİLEŞENLER ---
import { SideMenu } from './components/SideMenu';
import { HeroSlider, SlaytItem } from './components/HeroSlider';
import { AgendaList, GundemItem } from './components/AgendaList';
import { DiningList, YemekhaneItem } from './components/DiningList';
import { AnnouncementList, HaberItem } from './components/AnnouncementList';
import { EventList, EtkinlikItem } from './components/EventList';
import { Footer } from './components/Footer'; 

// API Tipleri
interface AfisData { id: number; adTR: string; icerikTR: string; foto1: string; }
interface AfisItem { data: AfisData; }
interface ApiResponse { 
  slayt: { data: SlaytItem[] }; 
  gundem: { data: GundemItem[] }; 
  haber: { data: HaberItem[] };
  yemekhane: { data: YemekhaneItem[] };
  etkinlik: { data: EtkinlikItem[] };
  afis1?: AfisItem;
  afis2?: AfisItem;
}

export default function MainContent() {
  const { language, dictionary } = useLanguage(); 

  const [slaytlar, setSlaytlar] = useState<SlaytItem[]>([]);
  const [gundem, setGundem] = useState<GundemItem[]>([]);
  const [haberler, setHaberler] = useState<HaberItem[]>([]);
  const [yemekListesi, setYemekListesi] = useState<YemekhaneItem[]>([]);
  const [etkinlikler, setEtkinlikler] = useState<EtkinlikItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [diningY, setDiningY] = useState(0); 
  const [contactY, setContactY] = useState(0);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DetailData | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if(token) setExpoPushToken(token);
    });

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log("Bildirim Geldi:", notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Bildirime Tıklandı:", response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('https://testapi.kastamonu.edu.tr/api/main');
      const json: ApiResponse = await response.json();
      setSlaytlar(json.slayt?.data || []);
      setGundem(json.gundem?.data || []);
      setHaberler(json.haber?.data || []);
      setYemekListesi(json.yemekhane?.data || []);
      setEtkinlikler(json.etkinlik?.data || []);
    } catch (error) {
      console.error("Veri hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // --- KATEGORİ ÇEVİRME (MEVCUT KEY'LERE GÖRE) ---
  // Hatayı çözen kısım burası. "university_announcement" yerine var olan "admin" veya "general" kullanıyoruz.
  const getCategoryName = (rawName: string) => {
    if (rawName === "Öğrenci Duyuruları") return dictionary.categories.student;
    if (rawName === "Birim Haberleri") return dictionary.categories.academic;
    
    // "Üniversite Duyuruları"nı "İdari" (admin) kategorisine eşleştirdik
    if (rawName === "Üniversite Duyuruları") return dictionary.categories.admin;
    
    // "Üniversite Haberleri"ni "Genel" (general) kategorisine eşleştirdik
    if (rawName === "Üniversite Haberleri") return dictionary.categories.general;
    
    return rawName;
  };

  // --- MODAL İŞLEMLERİ ---

  const handleAnnouncementClick = (item: HaberItem) => {
    setSelectedItem({
      title: language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR),
      date: formatDate(item.baslamaZamani),
      content: language === 'tr' ? (item.icerikTR || item.icerikEN) : (item.icerikEN || item.icerikTR || "<p>Content not available</p>"),
      category: getCategoryName(item.kategori), // Çevrilmiş kategori ismi
      image: null
    });
    setModalVisible(true);
  };

  const handleEventClick = (item: EtkinlikItem) => {
    setSelectedItem({
      title: language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR),
      date: formatDate(item.baslamaZamani),
      content: item.icerikTR, 
      image: item.pathTR,     
      location: item.yerTR,   
      category: dictionary.events 
    });
    setModalVisible(true);
  };

  const handleAgendaClick = (item: GundemItem) => {
    setSelectedItem({
      // 1. BAŞLIK: Dil TR ise TR, değilse EN (yoksa TR)
      title: language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR),
      
      // 2. TARİH FORMATI: Dile göre yerelleştirme
      date: new Date(item.eklemeZamani).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      
      // 3. İÇERİK: Dil TR ise (icerikTR veya başlık), EN ise (icerikEN veya icerikTR veya başlık)
      content: language === 'tr' 
        ? (item.icerikTR || item.baslikTR) 
        : (item.icerikEN || item.icerikTR || item.baslikEN || item.baslikTR),
        
      image: item.path,
      
      // 4. KATEGORİ: Sözlükten "Gündem" veya "Agenda"
      category: dictionary.agenda 
    });
    setModalVisible(true);
  };
  
  const scrollToDiningSection = () => {
    scrollViewRef.current?.scrollTo({ y: diningY, animated: true });
  };

  const scrollToContactSection = () => {
    scrollViewRef.current?.scrollTo({ y: contactY, animated: true });
  };

  return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
        
        {/* Navbar */}
        <View className="px-4 py-4 bg-white border-b border-gray-200 shadow-sm z-10 flex-row justify-between items-center">
          <View>
            <Text className="text-xl font-extrabold text-red-800 tracking-tight">
              Kastamonu {language === 'en' ? 'University' : 'Üniversitesi'}
            </Text>
            <Text className="text-xs text-gray-500 font-medium">
              {language === 'en' ? 'Mobile Info System' : 'Mobil Bilgi Sistemi'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setMenuVisible(true)} className="p-2 bg-gray-100 rounded-full active:bg-gray-200">
            <Menu color="#1e3a8a" size={24} />
          </TouchableOpacity>
        </View>

        {/* Yan Menü */}
        {menuVisible && (
          <SideMenu 
            onClose={() => setMenuVisible(false)} 
            onScrollToDining={scrollToDiningSection}
            onScrollToContact={scrollToContactSection} 
          />
        )}

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <ScrollView 
            ref={scrollViewRef} 
            className="flex-1" 
            showsVerticalScrollIndicator={false}
          >
            
            <HeroSlider data={slaytlar} />
            <AgendaList data={gundem} onItemClick={handleAgendaClick}/>

            <AnnouncementList data={haberler} onItemClick={handleAnnouncementClick}/>
            
            <DiningList 
              data={yemekListesi} 
              onLayout={(event) => setDiningY(event.nativeEvent.layout.y)}
            />

            <EventList data={etkinlikler} onItemClick={handleEventClick}/>
            
            <Footer 
              onLayout={(event) => setContactY(event.nativeEvent.layout.y)} 
            />
            
            <View className="h-20" /> 
            
          </ScrollView>
        )}
        
        <DetailModal 
          visible={modalVisible}
          data={selectedItem}
          onClose={() => setModalVisible(false)}
        />
        <StatusBar style="dark" />
      </SafeAreaView>
  );
}