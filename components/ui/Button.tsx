import { Text, TouchableOpacity, View } from 'react-native';
import { cn } from '../../lib/utils';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export const Button = ({ title, onPress, variant = 'default', className }: ButtonProps) => {
  
  const baseStyles = "p-4 rounded-xl items-center justify-center active:opacity-80";
  
  const variants = {
    default: "bg-blue-600",
    outline: "border border-gray-300 bg-transparent",
    ghost: "bg-transparent",
  };
  
  const textStyles = {
    default: "text-white font-bold text-base",
    outline: "text-gray-800 font-medium",
    ghost: "text-gray-600",
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      className={cn(baseStyles, variants[variant], className)}
    >
      <Text className={textStyles[variant]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};