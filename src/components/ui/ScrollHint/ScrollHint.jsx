import styles from "./ScrollHint.module.scss";

export default function ScrollHint({
  label = "Scroll",
  hidden = false,
  onActivate,
}) {
  return (
    <div
      className={`${styles.hint} ${hidden ? styles.hidden : ""}`}
      role="button"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onActivate?.();
      }}
    >
      <span className={styles.icon}>↓</span>
      <span>{label}</span>
    </div>
  );
}
