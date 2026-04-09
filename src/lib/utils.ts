import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function playTimerEndSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Oscilador para o primeiro tom (Ding)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // Nota A5
    
    gain1.gain.setValueAtTime(0, audioCtx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
    
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    // Oscilador para o segundo tom (Dong, tocado um pouco depois)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.15); // Nota C6
    
    gain2.gain.setValueAtTime(0, audioCtx.currentTime + 0.15);
    gain2.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2.0);
    
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    
    // Iniciar e parar os sons
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 1.5);
    
    osc2.start(audioCtx.currentTime + 0.15);
    osc2.stop(audioCtx.currentTime + 2.0);
  } catch (error) {
    console.error('Erro ao tocar som:', error);
  }
}
