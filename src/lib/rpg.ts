import { User, Shield, Sword, Axe, Swords, Crosshair, Sun, Wand2, Flame, Skull, Crown } from 'lucide-react';

export const RPG_CLASSES = [
  { minLevel: 50, name: 'Deus da Guerra', color: 'bg-yellow-100 text-yellow-600', barColor: 'bg-yellow-500', icon: Crown },
  { minLevel: 45, name: 'Cavaleiro da Morte', color: 'bg-slate-800 text-slate-300', barColor: 'bg-slate-600', icon: Skull },
  { minLevel: 40, name: 'Berserker', color: 'bg-rose-100 text-rose-600', barColor: 'bg-rose-500', icon: Flame },
  { minLevel: 35, name: 'Mago Obscuro', color: 'bg-fuchsia-100 text-fuchsia-600', barColor: 'bg-fuchsia-500', icon: Wand2 },
  { minLevel: 30, name: 'Paladino', color: 'bg-blue-100 text-blue-600', barColor: 'bg-blue-500', icon: Sun },
  { minLevel: 25, name: 'Assassino', color: 'bg-emerald-100 text-emerald-600', barColor: 'bg-emerald-500', icon: Crosshair },
  { minLevel: 20, name: 'Gladiador', color: 'bg-amber-100 text-amber-600', barColor: 'bg-amber-500', icon: Swords },
  { minLevel: 15, name: 'Bárbaro', color: 'bg-red-100 text-red-600', barColor: 'bg-red-500', icon: Axe },
  { minLevel: 10, name: 'Guerreiro', color: 'bg-orange-100 text-orange-600', barColor: 'bg-orange-500', icon: Sword },
  { minLevel: 5, name: 'Escudeiro', color: 'bg-zinc-200 text-zinc-700', barColor: 'bg-zinc-500', icon: Shield },
  { minLevel: 1, name: 'Aldeão', color: 'bg-stone-100 text-stone-500', barColor: 'bg-stone-400', icon: User },
];

export function getClassForLevel(level: number) {
  return RPG_CLASSES.find((c) => level >= c.minLevel) || RPG_CLASSES[RPG_CLASSES.length - 1];
}

export function getLevelProgress(xp: number, level: number) {
  // A fórmula atual do store é: level = Math.floor(Math.sqrt(xp / 100)) + 1
  // Então, o XP mínimo para um level L é: xp = Math.pow(L - 1, 2) * 100
  
  const xpForCurrentLevel = Math.pow(level - 1, 2) * 100;
  const xpForNextLevel = Math.pow(level, 2) * 100;
  
  const currentXPInLevel = xp - xpForCurrentLevel;
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = (currentXPInLevel / xpNeededForNext) * 100;

  return {
    currentXPInLevel,
    xpNeededForNext,
    progressPercentage: Math.min(Math.max(progressPercentage, 0), 100),
    xpRemaining: xpForNextLevel - xp
  };
}
