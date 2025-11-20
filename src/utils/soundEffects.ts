// Sound effects utility for the scoreboard
export const playScoreSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Create a more exciting chime sound
  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // First chime
  oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
  oscillator1.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
  oscillator1.type = 'sine';
  
  // Second chime (harmony)
  oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
  oscillator2.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.1); // G5
  oscillator2.type = 'sine';
  
  // Envelope
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator1.start(audioContext.currentTime);
  oscillator2.start(audioContext.currentTime);
  oscillator1.stop(audioContext.currentTime + 0.5);
  oscillator2.stop(audioContext.currentTime + 0.5);
};

export const playCelebrationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Create a triumphant ascending sound
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  
  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + index * 0.1);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.1);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + index * 0.1 + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.3);
    
    oscillator.start(audioContext.currentTime + index * 0.1);
    oscillator.stop(audioContext.currentTime + index * 0.1 + 0.3);
  });
};

export const playWinnerSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Create a victory fanfare
  const sequence = [
    { freq: 523.25, time: 0 },      // C5
    { freq: 659.25, time: 0.15 },   // E5
    { freq: 783.99, time: 0.3 },    // G5
    { freq: 1046.50, time: 0.45 },  // C6
    { freq: 1046.50, time: 0.6 },   // C6 (hold)
  ];
  
  sequence.forEach(({ freq, time }) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + time);
    oscillator.type = 'triangle';
    
    const duration = time === 0.6 ? 0.5 : 0.15;
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + time);
    gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + time + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + duration);
    
    oscillator.start(audioContext.currentTime + time);
    oscillator.stop(audioContext.currentTime + time + duration);
  });
};
