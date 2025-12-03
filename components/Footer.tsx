import { View, Text, TouchableOpacity, Linking, LayoutChangeEvent } from 'react-native';
import { Phone, Mail, MapPin, Globe, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react-native';

interface FooterProps {
  onLayout: (event: LayoutChangeEvent) => void;
}

export const Footer = ({ onLayout }: FooterProps) => {

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Link açılamadı", err));
  };

  return (
    <View 
      className="bg-red-950 px-6 py-10 mt-10" 
      onLayout={onLayout} // Konum bildirmek için şart
    >
      
      <View className="mb-8">
        <Text className="text-white font-extrabold text-2xl tracking-tighter">
          KASTAMONU
        </Text>
        <Text className="text-red-400 font-bold text-lg -mt-1">
          ÜNİVERSİTESİ
        </Text>
        <View className="h-1 w-12 bg-red-500 mt-3 rounded-full" />
      </View>

      <View className="gap-5 mb-8">
        
        <View className="flex-row items-start">
          <MapPin color="#ff6467" size={20} style={{ marginTop: 2 }} />
          <View className="ml-3">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Adres</Text>
            <Text className="text-gray-200 text-sm leading-5">
              Kuzeykent Mahallesi, Orgeneral Atilla Ateş Paşa Cd. No:19, 37150 Kastamonu
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => openLink('tel:+903662801000')}
          className="flex-row items-center"
        >
          <Phone color="#ff6467" size={20} />
          <View className="ml-3">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Santral</Text>
            <Text className="text-white font-bold text-base">+90 (366) 280 10 00</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => openLink('mailto:iletisim@kastamonu.edu.tr')}
          className="flex-row items-center"
        >
          <Mail color="#ff6467" size={20} />
          <View className="ml-3">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-1">E-Posta</Text>
            <Text className="text-white font-bold text-base">iletisim@kastamonu.edu.tr</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => openLink('https://kastamonu.edu.tr')}
          className="flex-row items-center"
        >
          <Globe color="#ff6467" size={20} />
          <View className="ml-3">
            <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Web Sitesi</Text>
            <Text className="text-red-300 font-bold text-sm">www.kastamonu.edu.tr</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-4 mb-8 border-t border-red-900 pt-6">
        <SocialIcon icon={<Twitter size={20} color="white" />} />
        <SocialIcon icon={<Facebook size={20} color="white" />} />
        <SocialIcon icon={<Instagram size={20} color="white" />} />
        <SocialIcon icon={<Linkedin size={20} color="white" />} />
      </View>

      <View className="items-center">
        <Text className="text-gray-500 text-xs text-center">
          © 2025 Kastamonu Üniversitesi Bilgi İşlem Daire Başkanlığı
        </Text>
        <Text className="text-gray-600 text-[10px] mt-1">
          Mobil Uygulama v1.0
        </Text>
      </View>

    </View>
  );
};

// Sosyal Medya İkon Bileşeni
const SocialIcon = ({ icon }: { icon: any }) => (
  <TouchableOpacity className="bg-red-800 p-3 rounded-full active:bg-red-700">
    {icon}
  </TouchableOpacity>
);