import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const AnimatedOrganized: React.FC = () => {
  const { theme } = useTheme();
  const targetWord = 'Organized';
  const targetLetters = targetWord.split('');

  const [displayLetters, setDisplayLetters] = useState<string[]>([]);
  const [isShuffling, setIsShuffling] = useState(true);
  const [isFinal, setIsFinal] = useState(false);

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const shuffleInterval = setInterval(() => {
      setDisplayLetters(shuffleArray(targetLetters));
    }, 150);

    const stopShuffle = setTimeout(() => {
      clearInterval(shuffleInterval);
      setDisplayLetters(targetLetters);
      setIsShuffling(false);

      setTimeout(() => setIsFinal(true), 300);
      setTimeout(() => setIsFinal(false), 1000);
    }, 1500);

    return () => {
      clearInterval(shuffleInterval);
      clearTimeout(stopShuffle);
    };
  }, []);

  return (
    <div className="inline-block leading-[1.2] overflow-visible min-h-[1.2em]">
      <span className={`inline-block ${isFinal ? 'animate-organized-zoom' : ''}`}>
      {displayLetters.map((char, idx) => (
      <span 
        key={idx}
        className={`inline-block transition-all ${isShuffling ? 'animate-letter-rise' : 'animate-letter-fall'}`}
        style={{
          animationDelay: `${idx*80}ms`,
          color: isShuffling ? (theme === 'dark' ? 'white' : 'black') : 'transparent',
          backgroundImage: isShuffling ? undefined
            : 'linear-gradient(to right, #2563eb, #7c3aed)',
          backgroundClip: isShuffling ? undefined : 'text', 
          webkitBackgroundClip: isShuffling ? undefined : 'text',
        }}
        >
        {char}
      </span>
      ))}
    </span>
  </div>
  );
};

export default AnimatedOrganized;