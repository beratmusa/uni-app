import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, Calendar, Megaphone, Newspaper, ChevronRight, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Ortak Veri Tipi
export interface GenericItem {
  id: number | string;
  title: string;
  date: string;
  image?: string | null;
  category?: string;
  originalData?: any; 
}

interface AllItemsPageProps {
  title: string;
  type: 'announcement' | 'agenda' | 'event';
  data: GenericItem[];
  onItemPress: (item: GenericItem) => void;
}

export const AllItemsPage = ({ title, type, data, onItemPress }: AllItemsPageProps) => {
  const navigation = useNavigation();

  const getIcon = () => {
    switch (type) {
      case 'announcement': return <Megaphone size={20} color="#ea580c" />;
      case 'agenda': return <Newspaper size={20} color="#2563eb" />;
      case 'event': return <Calendar size={20} color="#dc2626" />;
      default: return <Megaphone size={20} color="#ea580c" />;
    }
  };

  const renderItem = ({ item }: { item: GenericItem }) => (
    <TouchableOpacity 
      onPress={() => onItemPress(item)}
      activeOpacity={0.7}
      className="bg-white p-3 rounded-2xl mb-3 border border-slate-100 shadow-sm flex-row items-center"
    >
      {/* SOL TARAF: Görsel veya İkon */}
      <View className="mr-3">
        {type === 'event' ? (
           <View className="bg-red-50 border border-red-100 w-14 h-14 rounded-xl items-center justify-center">
              <Text className="text-red-600 font-bold text-lg">{item.date.split(' ')[0]}</Text>
              <Text className="text-red-400 text-[9px] uppercase font-bold">{item.date.split(' ')[1]?.slice(0,3)}</Text>
           </View>
        ) : item.image ? (
           <Image 
             source={{ uri: item.image }} 
             className="w-16 h-16 rounded-xl bg-slate-200"
             resizeMode="cover"
           />
        ) : (
           <View className={`w-14 h-14 rounded-xl items-center justify-center border ${
             type === 'agenda' ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'
           }`}>
              {getIcon()}
           </View>
        )}
      </View>

      {/* ORTA: İçerik */}
      <View className="flex-1 gap-1">
        {item.category && (
          <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            {item.category}
          </Text>
        )}
        
        <Text className="text-slate-800 font-bold text-sm leading-5 pr-2" numberOfLines={2}>
          {item.title}
        </Text>

        <View className="flex-row items-center mt-0.5">
          <Clock size={11} color="#94a3b8" />
          <Text className="text-slate-400 text-xs ml-1 font-medium">
            {item.date}
          </Text>
        </View>
      </View>

      {/* SAĞ: Ok İkonu */}
      <ChevronRight size={18} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {/* HEADER */}
      <View className="px-4 py-3 bg-white border-b border-slate-100 flex-row items-center justify-between">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100"
        >
          <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>
        
        <Text className="text-lg font-bold text-slate-800">
          {title}
        </Text>
        
        <View className="w-10" />
      </View>

      {/* LİSTE */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-20 opacity-50">
            <Text className="text-slate-500 font-medium">İçerik bulunamadı.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};