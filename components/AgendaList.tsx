import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ArrowRight, Clock, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view'; // <-- YENİ EKLENDİ

export interface GundemItem { 
  id: number; 
  baslikTR: string; 
  path: string; 
  eklemeZamani: string; 
  icerikTR?: string; 
}

interface AgendaListProps {
  data: GundemItem[];
  onItemClick: (item: GundemItem) => void;
}

export const AgendaList = ({ data, onItemClick }: AgendaListProps) => {
  
  const getDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  const getMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase();
  };

  return (
    <View className="mt-0 py-12 bg-slate-50 relative border-b border-slate-200 overflow-hidden">
      
      {/* SOL DİKEY GRADYAN ÇİZGİ */}
      <LinearGradient
        colors={['#0f172a', '#1e3a8a', '#3b82f6']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }} 
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 18, 
          borderTopRightRadius: 30,
          borderBottomRightRadius: 30
        }}
      />

      {/* --- BAŞLIK ALANI --- */}
      <View className="px-8 mb-8 flex-row justify-between items-end">
        <View>
          {/* Üst Başlık (Öne Çıkanlar) */}
          <View className="flex-row items-center mb-1">
            <Sparkles size={14} color="#2563eb" /> 
            <Text className="text-blue-700 font-bold text-xs uppercase tracking-widest ml-1">Öne Çıkanlar</Text>
          </View>
          
          
          <MaskedView
            style={{ height: 45, width: 200 }} // Yazının sığacağı kadar alan
            maskElement={
              <Text className="text-4xl font-black tracking-tighter bg-transparent">
                Gündem
              </Text>
            }
          >
            
            <LinearGradient
              colors={['#0f172a', '#1e3a8a', '#3b82f6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }} // Soldan sağa renk geçişi
              style={{ flex: 1 }}
            />
          </MaskedView>
          {/* ----------------------------------------- */}

        </View>
        
        <TouchableOpacity className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <Text className="text-slate-700 text-xs font-bold">Tümünü Gör</Text>
        </TouchableOpacity>
      </View>

      {/* --- LİSTE --- */}
      <View className="px-5 gap-8">
        {data.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            onPress={() => onItemClick(item)}
            activeOpacity={0.95}
            className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden ml-2"
          >
            
            <View className="h-56 relative">
              <Image 
                source={{ uri: item.path }} 
                className="w-full h-full" 
                resizeMode="cover" 
              />
              <View className="absolute inset-0 bg-black/10" />

              <View className="absolute top-4 right-4 bg-white/90 backdrop-blur-lg rounded-2xl px-4 py-2 items-center shadow-sm">
                <Text className="text-2xl font-black text-slate-900 leading-6">
                  {getDay(item.eklemeZamani)}
                </Text>
                <Text className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">
                  {getMonth(item.eklemeZamani)}
                </Text>
              </View>
            </View>

            <View className="p-6">
              <View className="flex-row items-center mb-3">
                <Clock size={14} color="#94a3b8" />
                <Text className="text-slate-500 text-sm font-semibold ml-1.5">
                  Kastamonu Üniversitesi
                </Text>
              </View>

              <Text className="text-slate-900 font-extrabold text-xl leading-7 mb-5">
                {item.baslikTR}
              </Text>

              <View className="flex-row items-center justify-between border-t border-slate-100 pt-4">
                <Text className="text-slate-500 text-sm font-medium">Detayları incele</Text>
                <View className="bg-slate-900 p-2.5 rounded-full">
                  <ArrowRight size={18} color="white" />
                </View>
              </View>
            </View>

          </TouchableOpacity>
        ))}
      </View>

    </View>
  );
};