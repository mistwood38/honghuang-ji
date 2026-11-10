import { useId, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { RoamAct } from "@/lib/honghuang/roam/state";
import type { Origin } from "@/lib/honghuang/types";
import { useActionFeedback } from "./action-feedback";
import "./action-art.css";

export type ActionEmblem = "lotus" | "sword" | "mountain" | "cloud" | "censer" | "scroll";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  emblem?: ActionEmblem;
  action?: RoamAct;
  surface?: "seal" | "plaque" | "bare" | "vow";
  material?: Origin;
  hint?: string;
  actionId?: string;
  children?: ReactNode;
};

function emblemFor(action?: RoamAct): ActionEmblem {
  if (!action) return "scroll";
  if (["cultivate", "rest", "retreat", "breakthrough"].includes(action.type)) return "lotus";
  if (["gather", "alchemy", "trade", "use", "plot"].includes(action.type)) return "censer";
  if (["explore", "travel", "beast", "continue", "notice"].includes(action.type)) return "cloud";
  if (action.type === "idle")
    return action.what === "sit" ? "lotus" : action.what === "stop" ? "mountain" : "cloud";
  if (action.type === "combat")
    return action.move === "strike"
      ? "sword"
      : action.move === "guard"
        ? "mountain"
        : action.move === "flee"
          ? "cloud"
          : "scroll";
  return "scroll";
}

export function ActionButton({
  label,
  emblem,
  action,
  surface = "seal",
  material = "dao",
  hint,
  actionId,
  children,
  className = "",
  disabled,
  onClick,
  ...props
}: Props) {
  const uid = useId();
  const id = actionId ?? uid;
  const { pending, run } = useActionFeedback();
  const selected = pending === id;
  const [title, ...details] = label.split(" · ");
  const note = hint ?? details.join(" · ");
  const noteId = `${uid}-hint`;
  const accessibleName = props["aria-label"] ?? label;
  const description = [
    props["aria-describedby"],
    note && !accessibleName.includes(note) ? noteId : null,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      {...props}
      type="button"
      data-ui-sound={
        action?.type === "combat"
          ? "skill"
          : action?.type === "use" || action?.type === "alchemy"
            ? "item"
            : undefined
      }
      aria-label={accessibleName}
      aria-describedby={description || undefined}
      disabled={disabled || Boolean(pending)}
      aria-busy={selected || undefined}
      data-selected={selected || undefined}
      className={`game-action game-action--${surface} ${surface === "vow" ? `vow-${material}` : ""} ${selected ? "is-committing" : ""} ${className}`}
      onClick={(event) => run(id, () => onClick?.(event))}
    >
      {children ?? (
        <>
          {surface === "seal" || surface === "vow" ? (
            <span
              className={`action-emblem emblem-${emblem ?? emblemFor(action)}`}
              aria-hidden="true"
            />
          ) : null}
          <span className="action-copy">
            <span>{title}</span>
            {note ? <small id={noteId}>{note}</small> : null}
          </span>
        </>
      )}
      {children && note ? (
        <span id={noteId} className="sr-only">
          {note}
        </span>
      ) : null}
      {surface !== "bare" ? (
        <span className="action-stamp" aria-hidden="true">
          定
        </span>
      ) : null}
    </button>
  );
}
