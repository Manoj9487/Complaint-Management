import { STATUSES } from "../constants";

export default function StatusPipeline({ status }) {
  const current = STATUSES.indexOf(status);
  return (
    <ol className="pipeline" aria-label={`Progress: ${status}`}>
      {STATUSES.map((step, i) => (
        <li
          key={step}
          className={i < current ? "done" : i === current ? "done current" : ""}
          aria-current={i === current ? "step" : undefined}
        >
          {step}
        </li>
      ))}
    </ol>
  );
}
