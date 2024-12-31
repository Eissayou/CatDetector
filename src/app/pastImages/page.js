"use client";

import { useState, useEffect } from 'react';
import styles from '../page.module.css';
import { Stack, Spinner, Center, useColorModeValue, Button } from '@chakra-ui/react';
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
                <Stack align="center"> {/* Use a Stack component */}
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
                    <div className={styles.errorContainer}> {/* Add error container class */}
                        <h2>Error: {error}</h2>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <Center><h1>My Images</h1></Center>

                <ul className={styles.grid}> {/* Use grid class for image layout */}
                    {images.map((image) => (
                        <li key={image.user} className={styles.card}>  {/* Use card class for image container */}
                            <div className={styles.imageContainer}>
                                <img src={image.base64} alt="Uploaded" className={styles.image} />
                                <p className={styles.guessText}>Guess: {image.guess}</p> {/* Move guessText inside imageContainer */}
                            </div>
                        </li>
                    ))}
                </ul>
                <Center>
                    {!loggingOut && (
                        <Button
                            onClick={handleLogout}
                            colorScheme="red"
                            variant="outline"
                            size="sm"
                            mt={4} // Add some top margin
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
