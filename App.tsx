import './global.css';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { Button } from './components/ui/Button';

export default function App() {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center p-6">
      <Text className="text-2xl font-bold mb-8 text-gray-900">
        Üni App 🚀
      </Text>
      
      <View className="w-full gap-4">
        <Button 
          title="Giriş Yap" 
          onPress={() => console.log("Giriş")} 
        />
        
        <Button 
          title="Misafir" 
          variant="outline" 
          onPress={() => console.log("Misafir")} 
        />
      </View>

      <StatusBar style="auto" />
    </View>
  );
}