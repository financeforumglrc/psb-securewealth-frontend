import { useWealthStore } from '../../store/wealthStore';
import { useTranslation } from '../../hooks/useTranslation';

export default function BadgeStreak() {
  const badges = useWealthStore((s) => s.badges);
  const unlocked = badges.filter((b) => b.unlocked);
  const { t, isHindi } = useTranslation();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 text-sm">
          <i className="fas fa-medal text-accent mr-2" /> {isHindi() ? 'उपलब्धि बैज' : 'Achievement Badges'}
        </h3>
        <span className="text-xs text-slate-500">{unlocked.length}/{badges.length} {isHindi() ? 'अनलॉक किए गए' : 'Unlocked'}</span>
      </div>
      {isHindi() && unlocked.length > 0 && (
        <p className="text-[10px] text-amber-600 mb-2">
          <i className="fas fa-flag mr-1" /> {t('jaiHind')}! आपने {unlocked.length} बैज अनलॉक किए हैं।
        </p>
      )}
      <div className="flex gap-2 flex-wrap">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`badge ${b.unlocked ? 'badge-unlocked' : 'badge-locked'}`}
            title={`${b.desc}${b.unlocked ? ` • Unlocked ${b.date}` : ' • Locked'}`}
          >
            <i className={`fas ${b.icon}`} />
            <span>{b.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
