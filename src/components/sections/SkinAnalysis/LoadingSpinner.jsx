import styles from "./SkinAnalysis.module.scss";

export default function LoadingSpinner() {
  return (
    <div className={styles.spinnerOverlay}>
      <div className={styles.spinner}></div>
      <p className={styles.spinnerText}>Preparing analysis…</p>
    </div>
  );
}
