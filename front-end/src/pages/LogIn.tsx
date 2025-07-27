import { useAuth } from '../components/AuthProvider';
import { Text, Box, Flex, VStack, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import LogDemo from "../components/logField";
import { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';

export default function LogIn() {
  const { login, backendUser, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const hasNavigated = useRef(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Login attempt started");

    if (!email || !password) {
      alert('Please fill in both fields');
      return;
    }

    try {
      await login(email, password);
      const idToken = await auth.currentUser?.getIdToken(true);
      console.log("Login successful, token:", idToken);
    } catch (error: any) {
      console.error('Login failed:', error.message);
      alert(error.message);
    }
  }

  useEffect(() => {
    console.log('useEffect backendUser:', backendUser);
    console.log('useEffect loading:', loading);
    if (!loading && backendUser && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate('/todolist');
    }
  }, [backendUser, loading, navigate]);

  return (
    <Flex>
      <VStack w="65vw" h="100vh" bg="#121212" justify="center">
        <Text fontSize="2vw" fontWeight="500" color = "white">Login to Your Account</Text>
        <LogDemo
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onSubmit={handleLogin}
        />
      </VStack>
      <Box w="35vw" h="100vh" bg="gray.800">
        <VStack py="35vh"  px={10}>
          <Text fontSize="4vw" color="white">New Here?</Text>
          <Text fontSize="1.5vw" color="white" textAlign="center">Sign up and discover a great amount of new opportunities!</Text>
          <Button onClick={() => navigate('/register')} bg="white" color="black" borderRadius="20px">
            Sign Up
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
