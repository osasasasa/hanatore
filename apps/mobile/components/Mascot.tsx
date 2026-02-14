import { Image, ImageStyle, StyleProp } from 'react-native';

const MASCOT_IMAGES = {
  normal: require('../assets/mascots/mascot-normal.png'),
  sad: require('../assets/mascots/mascot-sad.png'),
  excited: require('../assets/mascots/mascot-excited.png'),
} as const;

export type MascotMood = keyof typeof MASCOT_IMAGES;

type Props = {
  mood?: MascotMood;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function Mascot({ mood = 'normal', size = 64, style }: Props) {
  return (
    <Image
      source={MASCOT_IMAGES[mood]}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}
