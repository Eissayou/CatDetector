'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner, Stack, Heading, Input, Button, Text } from '@chakra-ui/react';
import styles from "../page.module.css";


export default function Login() {
    const [isLoggingInOrRegistering, setIsLoggingInOrRegistering] = useState('isLoggingIn');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [passwordError, setPasswordError] = useState("");

    const userRegister = async () => {
        setIsLoggingInOrRegistering("isRegistering");
        setIsLoggedIn(false);
    }

    const userLogin = async () => {
        setIsLoggingInOrRegistering("isLoggingIn")
        setIsLoggedIn(false);
    }

    const userLoggedIn = async () => {
        setError(null)
        setIsLoggingInOrRegistering("isLoggedIn")
        setIsLoggedIn(true);
    }

    const validatePassword = (pwd) => {
      // At least 8 chars, one uppercase, one lowercase, one number, one special char
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(pwd);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setPasswordError("");
        setIsLoading(true);
        if (isLoggingInOrRegistering === "isRegistering") {
          if (!validatePassword(password)) {
            setPasswordError("Password must be at least 8 characters, include uppercase, lowercase, number, and special character.");
            setIsLoading(false);
            return;
          }
        }
        
        if (isLoggingInOrRegistering === "isLoggedIn") {
            setIsLoading(false);
            router.push('/');
            router.refresh()

        }

        if (isLoggingInOrRegistering === "isLoggingIn" || isLoggingInOrRegistering === "isRegistering") {
            try {
                
                const response = await fetch('/api/SendLoginToMongo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password, isLoggingInOrRegistering }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Success:', data);
                    userLoggedIn();
                    setIsLoading(false);
                    router.push('/');
                    router.refresh()
                } else {
                    const errorData = await response.json();
                    console.error('Error:', errorData);
                    setError(errorData.error);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error:', error);
                setError("An unexpected error occurred");
                setIsLoading(false);
            }
        }
    }

    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--background)', color: 'var(--foreground)' }}>
        <form className={styles.loginCard} onSubmit={handleSubmit} autoComplete="on">
          <div className={styles.loginTitle}>
            {isLoggingInOrRegistering === 'isLoggingIn' ? 'Login' : isLoggingInOrRegistering === 'isRegistering' ? 'Register' : 'Logging in'}
          </div>
          {isLoggingInOrRegistering !== "isLoggedIn" && (
            <>
              <input
                type="text"
                id="username"
                className={styles.loginInput}
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
              <input
                type="password"
                id="password"
                className={styles.loginInput}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              {isLoggingInOrRegistering === "isRegistering" && passwordError && (
                <div style={{ color: '#e53e3e', fontSize: '0.98rem', marginBottom: 8 }}>{passwordError}</div>
              )}
              <button
                type="submit"
                className={styles.loginButton}
                disabled={isLoading}
              >
                {isLoading ? (isLoggingInOrRegistering === 'isRegistering' ? 'Registering...' : 'Logging in...') : (isLoggingInOrRegistering === 'isLoggingIn' ? 'Login' : 'Register')}
              </button>
            </>
          )}
          {isLoggingInOrRegistering === "isLoggedIn" && (
            <div className={styles.progressContainer} aria-live="polite">
              <Spinner size="xl" />
              <p>You have logged in! Redirecting now...</p>
            </div>
          )}
          {isLoggingInOrRegistering !== "isLoggedIn" && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              {isLoggingInOrRegistering === 'isLoggingIn'
                ? "Don't have an account?"
                : 'Already have an account?'}
              <button
                type="button"
                className={styles.loginButton}
                style={{ marginLeft: 12, padding: '6px 18px', fontSize: '1rem', borderWidth: 1 }}
                onClick={isLoggingInOrRegistering === 'isLoggingIn' ? userRegister : userLogin}
                disabled={isLoading}
              >
                {isLoggingInOrRegistering === 'isLoggingIn' ? 'Register' : 'Login'}
              </button>
            </div>
          )}
          {error && (
            <div style={{ color: '#e53e3e', textAlign: 'center', marginTop: 8 }} aria-live="polite">
              {error}
            </div>
          )}
        </form>
      </div>
    );
}