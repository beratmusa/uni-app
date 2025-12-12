import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './lib/notifications'; 
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
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
  // Dili buradan çekiyoruz, değiştiği an bu sayfa yenilenir (Re-render)
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

  // --- TARİH FORMATI (DİLE GÖRE) ---
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // --- KATEGORİ İSMİ (DİLE GÖRE) ---
  const getCategoryName = (rawName: string) => {
    if (rawName === "Öğrenci Duyuruları") return dictionary.categories.student;
    if (rawName === "Birim Haberleri") return dictionary.categories.academic;
    if (rawName === "Üniversite Duyuruları") return dictionary.categories.admin;
    if (rawName === "Üniversite Haberleri") return dictionary.categories.general;
    return rawName;
  };

  // --- MODAL AÇMA FONKSİYONLARI ---

  const handleAnnouncementClick = (item: HaberItem) => {
    setSelectedItem({
      title: language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR),
      date: formatDate(item.baslamaZamani),
      content: language === 'tr' ? (item.icerikTR || item.icerikEN) : (item.icerikEN || item.icerikTR || "<p>Content not available</p>"),
      category: getCategoryName(item.kategori),
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

  // Gündem Detayı (Fotoğraflar için API isteği atar)
  const handleAgendaClick = async (item: GundemItem) => {
    try {
      const response = await fetch(`https://testapi.kastamonu.edu.tr/api/gundem/${item.id}`);
      const json = await response.json();
      const detailData = json.data;

      setSelectedItem({
        title: language === 'tr' 
          ? (detailData?.baslikTR || item.baslikTR) 
          : (detailData?.baslikEN || item.baslikEN || item.baslikTR),
        
        date: new Date(item.eklemeZamani).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US'),
        
        content: language === 'tr' 
          ? (detailData?.icerikTR || item.icerikTR || item.baslikTR) 
          : (detailData?.icerikEN || item.icerikEN || item.baslikTR),
        
        image: item.path,
        category: dictionary.agenda,
        gallery: detailData?.gundemFotolar || [] 
      });
      setModalVisible(true);

    } catch (error) {
      console.error("Gündem detay hatası:", error);
      setSelectedItem({
        title: language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR),
        date: new Date(item.eklemeZamani).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US'),
        content: item.icerikTR || item.baslikTR, 
        image: item.path,
        category: dictionary.agenda,
        gallery: []
      });
      setModalVisible(true);
    }
  };
  
  const scrollToDiningSection = () => {
    scrollViewRef.current?.scrollTo({ y: diningY, animated: true });
  };

  const scrollToContactSection = () => {
    scrollViewRef.current?.scrollTo({ y: contactY, animated: true });
  };

  return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
        
        {/* --- NAVBAR --- */}
        <View className="flex-row justify-between items-center px-5 py-6 bg-white shadow-sm z-50 border-b border-slate-100">
          
          <View className="flex-row items-center gap-3">
            {/* Logo */}
            <Image 
              source={require('./assets/icon.png')} // Kendi logonu eklediğinde 'logo.png' yap
              className="w-12 h-12"
              resizeMode="contain"
            />
            
            <View>
              {/* Üniversite Adı */}
              <Text className="text-xl font-black text-slate-900 leading-6 tracking-tight">
                KASTAMONU
              </Text>
              
              {/* Dinamik Alt Başlık (TR/EN) */}
              <Text className="text-[11px] font-bold text-red-600 tracking-[3px] uppercase">
                {language === 'en' ? 'UNIVERSITY' : 'ÜNİVERSİTESİ'}
              </Text>
              
              {/* Kırmızı Çizgi */}
              <View className="h-1 w-10 bg-red-600 rounded-full mt-1.5" />
            </View>
          </View>

          {/* Menü Butonu */}
          <TouchableOpacity 
            onPress={() => setMenuVisible(true)} 
            activeOpacity={0.7}
            className="w-12 h-12 bg-slate-50 items-center justify-center rounded-full border border-slate-200 shadow-sm"
          >
            <Menu color="#0f172a" size={24} />
          </TouchableOpacity>
        </View>
        {/* --------------------------------------------------- */}

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