"use client";

import { useState, useEffect } from 'react';
import styles from '../page.module.css';
import { Stack, Spinner, Center, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function pastImages() {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Added for logout logic
    const [loggingOut, setLoggingOut] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            const response = await fetch('/api/HandleLogout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Successful logout
                router.push('/login');
                router.refresh();
                setLoggingOut(false);
            } else {
                console.error('Logout failed:', response.status);
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch('/api/GetImageFromMongo', {
                    method: 'GET', // Use GET request since you're fetching data
                });

                if (response.ok) {
                    const data = await response.json();
                    setImages(data.images);
                } else {
                    const errorData = await response.json();
                    console.error('Error fetching images:', errorData.error);
                    setError(errorData.error);
                }
            } catch (error) {
                console.error('Error fetching images:', error);
                setError('Failed to fetch images');
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();
    }, []);

    if (isLoading) {
        return (
            <Center h="100vh">
                <Stack align="center" aria-live="polite"> {/* Use a Stack component */}
                    <Spinner
                        thickness='4px'
                        speed='0.65s'
                        emptyColor='gray.200'
                        size="xl"
                    />
                    <div>Loading your images...</div> {/* Text below the spinner */}
                </Stack>
            </Center>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <main className={styles.main}>
                    <div className={styles.errorContainer} aria-live="polite"> {/* Add error container class */}
                        <h2>Error: {error}</h2>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.page} style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            <main className={styles.main}>
                <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', marginBottom: 32 }}>
                  <div style={{
                    background: 'var(--card-bg)',
                    borderRadius: 18,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    padding: '28px 0 18px 0',
                    marginBottom: 24,
                    border: '1.5px solid var(--card-border)',
                    textAlign: 'center',
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: '#228B22',
                    letterSpacing: '-1px',
                    textShadow: '0 2px 8px rgba(34,139,34,0.08)',
                  }}>
                    Past Inferences
                  </div>
                  <ul style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 32,
                    padding: 0,
                    margin: 0,
                    listStyle: 'none',
                  }}>
                    {images.map((image) => (
                      <li key={image._id || image.user + (image.timestamp || '')} style={{
                        background: 'var(--card-bg)',
                        borderRadius: 18,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                        border: '1.5px solid var(--card-border)',
                        padding: 18,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 12,
                        minHeight: 380,
                        margin: 0,
                        width: '100%',
                        maxWidth: 420,
                        transition: 'box-shadow 0.2s, border-color 0.2s',
                      }}>
                        <div className={styles.imageContainer} style={{ boxShadow: 'none', border: 'none', background: 'transparent', padding: 0, marginBottom: 0 }}>
                          <img src={image.base64} alt="Uploaded" className={styles.image} />
                        </div>
                        <div style={{
                          marginTop: 8,
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          color: 'var(--foreground)',
                          background: 'rgba(34,139,34,0.07)',
                          borderRadius: 8,
                          padding: '6px 18px',
                          letterSpacing: '0.01em',
                          boxShadow: '0 1px 4px rgba(34,139,34,0.04)',
                          maxWidth: '90%',
                          marginLeft: 'auto',
                          marginRight: 'auto',
                        }}>
                          {image.guess}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <Center>
                    {!loggingOut && (
                        <Button
                            onClick={handleLogout}
                            className={styles.logoutButton}
                            variant="unstyled"
                        >
                            Logout
                        </Button>
                    )}
                    {loggingOut && (
                        <div className={styles.progressContainer}>
                            <Spinner size="xl" />
                            <p>You have logged out! Redirecting now...</p>
                        </div>
                    )}
                </Center>
            </main>
        </div>
    );
}
