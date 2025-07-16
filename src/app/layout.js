import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/ui/provider"
import styles from "./header.module.css"; // Import the CSS module
import { cookies } from 'next/headers';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cat Breed Classifier",
  description: "A simple app to classify cat breeds using AI.",
};


export default async function RootLayout({ children }) {

  const cookiesList = await cookies();
  const token = cookiesList.get('token')?.value;


  return (
    <html suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <Provider>
          <header className={styles.header}>
            <div className={styles.container}>
              <a href="/" className={styles.logo}>
                <span className={styles.logoIcon}>🐈</span>
                <span className={styles.logoText}>Cat Classifier</span>
              </a>
              <nav className={styles.nav}>
                <ul className={styles.navList}>
                  <li className={styles.navItem}>
                    {token && (
                    <a href="/" className={styles.navLink}>
                      Classify
                    </a>
                    )}
                  </li>
                  <li className={styles.navItem}>
                    {token && (
                    <a href="/pastImages" className={styles.navLink}>
                      Past Inferences
                    </a>
                    )}
                  </li>
                  <li className={styles.navItem}>
                  {!token && (
                    <a href="/login" className={styles.navLink}>
                      Register/Login
                    </a>
                  )}
                  </li>
                </ul>
              </nav>
            </div>
          </header>
          {children}
        </Provider>
      </body>
    </html>
  );
}