import { nextRealm, realmOf, STAT_LABEL, STAT_ORDER } from "@/lib/honghuang/world";
import type { Stats } from "@/lib/honghuang/types";

// Display scales mirror the existing engine caps; this does not alter any stat.
const CAP: Record<keyof Stats, number> = {
  dao: 400,
  qi: 160,
  kill: 160,
  virtue: 160,
  demon: 100,
  life: 100,
};

export function StatList({ stats }: { stats: Stats }) {
  const realm = realmOf(stats.dao);
  const upcoming = nextRealm(stats.dao);
  const span = upcoming ? upcoming.min - realm.min : 1;
  const daoPct = upcoming ? Math.min(100, ((stats.dao - realm.min) / span) * 100) : 100;

  return (
    <div className="grid gap-3">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-serif text-lg text-gold">{realm.name}</span>
          <span className="text-xs text-dim">{upcoming ? `距${upcoming.name}` : "门缝之外"}</span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-dim">{realm.line}</p>
        <div className="meter mt-2" aria-hidden="true">
          <span style={{ width: `${daoPct}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {STAT_ORDER.map((key) => {
          const value = stats[key];
          const pct = Math.min(100, (value / CAP[key]) * 100);
          return (
            <div key={key}>
              <div className="flex justify-between text-xs text-dim">
                <span>{STAT_LABEL[key]}</span>
                <span className="tabular-nums text-fog">{value}</span>
              </div>
              <div
                className={
                  key === "life" || key === "demon" ? "meter meter-life mt-1" : "meter mt-1"
                }
                aria-hidden="true"
              >
                <span style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      {stats.life < 30 ? (
        <p className="text-sm text-cinnabar">道躯残损。再硬扛一次，可能就散了。</p>
      ) : null}
    </div>
  );
}
