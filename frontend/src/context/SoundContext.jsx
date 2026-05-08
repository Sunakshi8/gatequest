import { createContext, useContext, useState } from 'react';

const SoundContext = createContext();
export const useSound = () => useContext(SoundContext);

// Simple sound player using Audio API
const playSound = (enabled, type) => {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.15;

    if (type === 'correct') {
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'wrong') {
      osc.frequency.value = 200;
      osc.type = 'sawtooth';
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'tick') {
      osc.frequency.value = 1000;
      osc.type = 'sine';
      gain.gain.value = 0.05;
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'boss') {
      osc.frequency.value = 150;
      osc.type = 'square';
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'levelup') {
      osc.frequency.value = 523;
      osc.type = 'sine';
      setTimeout(() => { try { osc.frequency.value = 659; } catch(e){} }, 100);
      setTimeout(() => { try { osc.frequency.value = 784; } catch(e){} }, 200);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'click') {
      osc.frequency.value = 600;
      osc.type = 'sine';
      gain.gain.value = 0.08;
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start(); osc.stop(ctx.currentTime + 0.08);
    }
  } catch (e) {}
};

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const play = (type) => playSound(soundEnabled, type);
  const toggle = () => setSoundEnabled(p => !p);

  return (
    <SoundContext.Provider value={{ soundEnabled, toggle, play }}>
      {children}
    </SoundContext.Provider>
  );
};
