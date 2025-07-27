import { useAuth } from '../components/AuthProvider';
import { Text, Box, Flex, VStack, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (data: any) => {
    try {
      console.log("🧪 Submitted data:", data);

      await register(
        data.email,
        data.password,
        data.first_name,
        data.last_name,
        data.phone,
        data.birthday
      );

      navigate('/todolist');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <Flex align="center" h="100vh">
      <VStack alignSelf="center" bg="black" w="65vw" h="100vh" justify="center">
        <Text fontSize="2vw" fontWeight="500" color="white">Register a New Account</Text>
        <RegisterForm onSubmit={handleRegister} />
      </VStack>
      <Box w="35vw" h="100vh" bg="white">
        <VStack align="center" py="35vh" color="white">
          <Text fontSize="4vw" color="black">Already Registered?</Text>
          <Text fontSize="1.5vw" px="14" color="black">Login and access your workspace!</Text>
          <Button borderRadius="20px" bg="black" color="white" onClick={() => navigate('/login')}>
            Login
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
