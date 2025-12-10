import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AllItemsPage, GenericItem } from '../components/AllItemsPage';
import { useLanguage } from '../context/LanguageContext';
import { GundemItem } from '../components/AgendaList';

export const AgendaListScreen = ({ navigation }: any) => {
  const { language, dictionary } = useLanguage();
  const [data, setData] = useState<GenericItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [language]);

  const fetchData = async () => {
    try {
      // NOT: Burada 'api/main' yerine sadece gündemleri getiren bir endpoint varsa onu kullanmak daha doğru olur.
      // Şimdilik testapi'den tüm listeyi çekiyoruz gibi simüle ediyorum.
      // Eğer 'api/gundem' gibi bir liste endpointi varsa burayı güncellemelisin.
      const response = await fetch('https://testapi.kastamonu.edu.tr/api/main'); 
      const json = await response.json();
      
      const rawData: GundemItem[] = json.gundem?.data || [];

      // GenericItem formatına dönüştürme
      const formattedData: GenericItem[] = rawData.map(item => ({
        id: item.id,
        title: language === 'tr' ? item.baslikTR : (item.baslikEN || item.baslikTR),
        date: new Date(item.eklemeZamani).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        image: item.path,
        category: dictionary.agenda, // "Gündem"
        originalData: item
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Gündem verisi alınamadı:", error);
    } finally {
      setLoading(false);
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
    <AllItemsPage
      title={dictionary.agenda} // "Gündem"
      type="agenda"
      data={data}
      onItemPress={(item) => {
        // Detay sayfasına veya modal'a yönlendirme yapılabilir.
        // Şimdilik sadece log atıyoruz.
        console.log("Seçilen:", item.title);
        // navigation.navigate('DetailScreen', { item: item.originalData }); gibi
      }}
    />
  );
};