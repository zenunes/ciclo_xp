import { Book, Shield, Sword, Crown, Sparkles, Medal, Flame, Star, Zap, Sun, type LucideIcon } from 'lucide-react';

export interface CharacterClass {
  name: string;
  minLevel: number;
  maxLevel: number;
  icon: LucideIcon;
  color: 'zinc' | 'blue' | 'orange' | 'violet' | 'amber' | 'emerald' | 'red' | 'cyan' | 'fuchsia' | 'rose';
}

export const CHARACTER_CLASSES: CharacterClass[] = [
  { name: 'Aprendiz', minLevel: 1, maxLevel: 9, icon: Book, color: 'zinc' },
  { name: 'Escudeiro', minLevel: 10, maxLevel: 19, icon: Shield, color: 'blue' },
  { name: 'Guerreiro', minLevel: 20, maxLevel: 29, icon: Sword, color: 'orange' },
  { name: 'Cavaleiro', minLevel: 30, maxLevel: 39, icon: Crown, color: 'violet' },
  { name: 'Mestre', minLevel: 40, maxLevel: 49, icon: Sparkles, color: 'amber' },
  { name: 'Grão-Mestre', minLevel: 50, maxLevel: 59, icon: Medal, color: 'emerald' },
  { name: 'Herói', minLevel: 60, maxLevel: 69, icon: Flame, color: 'red' },
  { name: 'Lenda', minLevel: 70, maxLevel: 79, icon: Star, color: 'cyan' },
  { name: 'Mítico', minLevel: 80, maxLevel: 89, icon: Zap, color: 'fuchsia' },
  { name: 'Divino', minLevel: 90, maxLevel: Infinity, icon: Sun, color: 'rose' },
];

export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getCurrentClass(level: number): CharacterClass {
  return CHARACTER_CLASSES.find(c => level >= c.minLevel && level <= c.maxLevel) || CHARACTER_CLASSES[CHARACTER_CLASSES.length - 1];
}

export function getLevelProgress(xp: number, level: number) {
  const currentLevelXp = Math.pow(level - 1, 2) * 100;
  const nextLevelXp = Math.pow(level, 2) * 100;
  
  const xpInCurrentLevel = xp - currentLevelXp;
  const xpNeededForNext = nextLevelXp - currentLevelXp;
  
  const progressPercentage = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));
  
  return {
    nextLevelXp,
    xpNeededForNext,
    progressPercentage,
    xpRemaining: nextLevelXp - xp
  };
}
