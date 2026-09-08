import {
  Aperture,
  Smartphone,
  Gamepad2,
  Speaker,
  Wind,
  AudioLines,
  Headphones,
  Recycle,
  Truck,
  Repeat,
  ShieldCheck,
  Star,
  type LucideProps,
} from "lucide-react";

const MAP = {
  apple: Aperture,
  smartphone: Smartphone,
  gamepad: Gamepad2,
  console: Gamepad2,
  speaker: Speaker,
  wind: Wind,
  audio: AudioLines,
  headphones: Headphones,
  recycle: Recycle,
  truck: Truck,
  repeat: Repeat,
  shield: ShieldCheck,
  star: Star,
} as const;

export type IconName = keyof typeof MAP;

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = MAP[name as IconName] ?? Aperture;
  return <Cmp {...props} />;
}
