import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './lib/notifications'; 
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu } from 'lucide-react-native';
import { DetailModal, DetailData } from './components/DetailModal';

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
  // --- STATE ---
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
      //  burada ilgili habere yönlendirme yapılabilir
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
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleAnnouncementClick = (item: HaberItem) => {
    setSelectedItem({
      title: item.baslikTR,
      date: formatDate(item.baslamaZamani),
      content: item.icerikTR || item.icerikEN || "<p>İçerik bulunamadı</p>",
      category: item.kategori,
      image: null
    });
    setModalVisible(true);
  };

  const handleEventClick = (item: EtkinlikItem) => {
    setSelectedItem({
      title: item.baslikTR,
      date: formatDate(item.baslamaZamani),
      content: item.icerikTR, 
      image: item.pathTR,     
      location: item.yerTR,   
      category: "Etkinlik"
    });
    setModalVisible(true);
  };

  const handleAgendaClick = (item: GundemItem) => {
  setSelectedItem({
    title: item.baslikTR,
    date: new Date(item.eklemeZamani).toLocaleDateString('tr-TR'),
    content: item.baslikTR,
    image: item.path,
    category: "Gündem"
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
            <Text className="text-xl font-extrabold text-red-800 tracking-tight">Kastamonu Üniversitesi</Text>
            <Text className="text-xs text-gray-500 font-medium">Mobil Bilgi Sistemi</Text>
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