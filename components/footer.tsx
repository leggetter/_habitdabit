import Link from "next/link";
import styles from "./footer.module.css";
import packageJSON from "../package.json";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <hr />
      <ul className={styles.navItems}>
        <li className={styles.navItem}>
          <a href="https://github.com/leggetter/habitdabit">GitHub</a>
        </li>
        {/* <li className={styles.navItem}>
          <Link href="/policy">Policy</Link>
        </li> */}
      </ul>
    </footer>
  );
}
