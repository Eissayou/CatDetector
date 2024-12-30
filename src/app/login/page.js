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

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        setIsLoading(true);
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
                setError(errorData.error);
                setIsLoading(false);
            }
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}> 
        <Stack 
          as="form"
          onSubmit={handleSubmit}
          spacing={4}
          w="full"
          maxW="md" 
          bg="white"
          rounded="lg"
          p={6}
          boxShadow="lg"
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
        >
            <Heading as="h2" size="lg" textAlign="center">
                {isLoggingInOrRegistering === 'isLoggingIn' ? 'Login' :isLoggingInOrRegistering === 'isRegistering' ? 'Register': 'Logging in'}
            </Heading>

            {isLoggingInOrRegistering !== "isLoggedIn" && (
                <>
                    <div>
                        <label htmlFor="username">Username:</label>
                        <Input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <Input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" colorScheme="blue" size="xl" isLoading={isLoading} loadingText="Submitting">
                        {isLoggingInOrRegistering === 'isLoggingIn' ? 'Login' : 'Register'}
                    </Button>
                </>
            )}

            {isLoggingInOrRegistering === "isLoggedIn" && (

                <div className={styles.progressContainer}>
                    <Spinner size="xl" />
                    <p>You have logged in! Redirecting now...</p>
                </div>
            )}

            {isLoggingInOrRegistering !== "isLoggedIn" && (
                <Text textAlign="center">
                    {isLoggingInOrRegistering === 'isLoggingIn'
                        ? "Don't have an account?"
                        : 'Already have an account?'
                    }
                    <Button
                        variant="link"
                        colorScheme="blue"
                        onClick={isLoggingInOrRegistering === 'isLoggingIn' ? userRegister : userLogin}
                        ml={2}
                        isLoading={isLoading}
                    >
                        {isLoggingInOrRegistering === 'isLoggingIn' ? 'Register' : 'Login'}
                    </Button>
                </Text>
            )}
        {error && (
          <Text color="red.500" textAlign="center">
            {error}
          </Text>
        )}
        </Stack>

        </div>
    );
}