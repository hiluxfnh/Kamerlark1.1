"use client";
import Image from "next/image";
import styles from "../styles/spinner.module.css";

export default function Spinner() {
  return (
    <div
      className={styles.backdrop}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className={styles.spinnerBox}>
        <div className={styles.ring} />
        <div className={styles.logoWrap}>
          <Image
            src={require("../assets/kamerlark.png")}
            alt="KamerLark"
            width={58}
            height={58}
            className={styles.logo}
            priority
          />
        </div>
      </div>
    </div>
  );
}
