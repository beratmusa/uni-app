import { View, Text } from 'react-native';
import { cn } from '../../lib/utils';

interface CardProps {
  title: string;
  description?: string;
  date?: string;
  className?: string;
}

export const Card = ({ title, description, date, className }: CardProps) => {
  return (
    <View className={cn("bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4", className)}>
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-bold text-gray-900 flex-1 mr-2">
          {title}
        </Text>
        {date && (
          <Text className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md overflow-hidden">
            {date}
          </Text>
        )}
      </View>
      
      {description && (
        <Text className="text-gray-600 text-sm leading-5">
          {description}
        </Text>
      )}
    </View>
  );
};