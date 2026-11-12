import { useLayoutEffect, useRef } from "react";
import type { RoamReport } from "@/lib/honghuang/roam/state";

import { focusReadingTarget } from "./reading-focus";

export function ActionOutcome({
  report,
  label,
  selected,
}: {
  report: RoamReport;
  label: string;
  selected?: string;
}) {
  const target = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    focusReadingTarget(target.current);
  }, [report]);
  return (
    <div
      ref={target}
      className="local-result action-outcome"
      role="status"
      aria-label={label}
      tabIndex={-1}
    >
      <p className="outcome-selection">
        <span className="choice-result-seal">已落印</span>
        {selected ? `已选择：${selected}` : "此事已然"}
      </p>
      <strong>{report.title}</strong>
      {report.paragraphs.map((line, index) => (
        <p key={index}>{line}</p>
      ))}
      {report.changes.length ? (
        <ul>
          {report.changes.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
