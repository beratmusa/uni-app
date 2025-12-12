import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AllItemsPage, GenericItem } from '../components/AllItemsPage';
import { useLanguage } from '../context/LanguageContext';
import { GundemItem } from '../components/AgendaList';
// EKLENEN IMPORTLAR:
import { DetailModal, DetailData } from '../components/DetailModal';

export const AgendaListScreen = ({ navigation }: any) => {
  const { language, dictionary } = useLanguage();
  const [data, setData] = useState<GenericItem[]>([]);
  const [loading, setLoading] = useState(true);

  // MODAL STATE'LERİ
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DetailData | null>(null);

  useEffect(() => {
    fetchData();
  }, [language]);

  const fetchData = async () => {
    try {
      const response = await fetch('https://testapi.kastamonu.edu.tr/api/gundem'); 
      const json = await response.json();
      const rawData: GundemItem[] = json.data || [];

      const formattedData: GenericItem[] = rawData.map(item => ({
        id: item.id,
        title: language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR),
        date: new Date(item.eklemeZamani).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        image: item.path,
        category: dictionary.agenda, 
        originalData: item // Orijinal veriyi saklıyoruz
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Gündem verisi alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  // TIKLAMA OLAYI VE DETAY ÇEKME
  const handleItemPress = async (item: GenericItem) => {
    const rawItem = item.originalData as GundemItem;
    
    // Varsayılan veriyi hemen hazırla (Hız hissi için)
    let detailData: DetailData = {
        title: item.title,
        date: item.date,
        content: language === 'tr' ? rawItem.icerikTR : rawItem.icerikEN,
        image: item.image,
        category: dictionary.agenda,
        gallery: []
    };

    // Modal'ı aç
    setSelectedItem(detailData);
    setModalVisible(true);

    // Arka planda detayları (galeriyi) çek
    try {
        const response = await fetch(`https://testapi.kastamonu.edu.tr/api/gundem/${item.id}`);
        const json = await response.json();
        const apiDetail = json.data;

        // Detaylar gelince state'i güncelle (Galeri fotoları vb. için)
        if (apiDetail) {
            setSelectedItem({
                ...detailData,
                content: language === 'tr' 
                  ? (apiDetail.icerikTR || rawItem.icerikTR) 
                  : (apiDetail.icerikEN || rawItem.icerikEN || rawItem.icerikTR),
                gallery: apiDetail.gundemFotolar || []
            });
        }
    } catch (error) {
        console.log("Detay çekilemedi, mevcut veri gösteriliyor.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <>
      <AllItemsPage
        title={dictionary.agenda}
        type="agenda"
        data={data}
        onItemPress={handleItemPress} // Fonksiyonu bağladık
      />
      
      {/* MODAL EKLENDİ */}
      <DetailModal 
        visible={modalVisible}
        data={selectedItem}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};