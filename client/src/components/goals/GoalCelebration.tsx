import { useEffect, useState } from 'react';

interface CelebrationProps {
  show: boolean;
  goalName: string;
  onClose: () => void;
}

export default function GoalCelebration({ show, goalName, onClose }: CelebrationProps) {
  const [particles, setParticles] = useState<{ id: number; left: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    if (show) {
      const p = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1 + Math.random() * 2,
      }));
      setParticles(p);
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white dark:bg-dark-light rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-4 animate-fade-in pointer-events-auto">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-trophy text-3xl text-success" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Goal Achieved! 🎉</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">You reached your <strong>{goalName}</strong> goal!</p>
        <p className="text-xs text-slate-400 mt-2">Keep up the great financial discipline.</p>
        <button onClick={onClose} className="mt-4 px-6 py-2 bg-success text-white rounded-lg text-sm font-medium hover:bg-success/90">Awesome!</button>
      </div>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            backgroundColor: ['#0f766e', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'][p.id % 5],
            animation: `confettiFall ${p.duration}s ease-out ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
