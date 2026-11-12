import type { CSSProperties } from "react";
import "./epic-encounters.css";

const PEOPLE = {
  qingxing: [0, "青荇，携药草与旧药囊的青衣采药者"],
  wuwei: [1, "雾尾，背着盐包、耳尖微白的狐妖商旅"],
  pansheng: [2, "磐生，肩负石锤、身有岩纹的巫族石匠"],
  axin: [3, "阿薪，以双手护住陶罐余火的人族行旅者"],
} as const;
const VISTAS = {
  dao: [0, "昆仑巨门屹立雪山之上，万灵如细小金光沿石阶上行"],
  wu: [1, "负石者沿险峻山道运石，天柱裂隙里流动着古老金纹"],
  yao: [2, "苍茫海潮拍岸，扶桑巨木笼住暮色，群鸟飞向远方"],
  ren: [3, "雨幕笼罩山中聚落，众人仍围坐在未熄的火塘旁"],
} as const;

/** Each equal atlas cell retains its native aspect; only its outer viewport may crop. */
export function EncounterArt({
  kind,
  id,
  className = "",
}: {
  kind: "person" | "lineage";
  id: string;
  className?: string;
}) {
  const entries = kind === "person" ? PEOPLE : VISTAS;
  const entry = Object.hasOwn(entries, id)
    ? (entries as Record<string, readonly [number, string]>)[id]
    : null;
  if (!entry) return null;
  const [index, description] = entry;
  const file = kind === "person" ? "wayfarers" : "lineage-vistas";
  return (
    <div
      className={`painted-atlas painted-atlas--${kind} ${className}`}
      style={{ "--atlas-column": index % 2, "--atlas-row": Math.floor(index / 2) } as CSSProperties}
      role="img"
      aria-label={description}
      data-art-id={id}
    >
      <picture aria-hidden="true">
        <source media="(max-width: 640px)" srcSet={`/art/${file}-small.webp`} />
        <img
          src={`/art/${file}.webp`}
          width={kind === "person" ? 1254 : 1672}
          height={kind === "person" ? 1254 : 940}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </picture>
    </div>
  );
}
