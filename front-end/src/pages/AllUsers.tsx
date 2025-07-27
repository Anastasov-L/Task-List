import { useEffect, useState } from 'react';
import axios from '../api/apiAxios';
import Header from '../components/Header';
import Bar from '../components/bar';
import BarNormal from '../components/barNormal';
import { Skeleton, SkeletonText } from '@chakra-ui/react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';

const AllUsers = () => {
  const isDefaultOpen = useBreakpointValue({
    base: false,
    sm: false,
    md: true,
    lg: true,
    xl: true,
  });

  type User = {
    id: string;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    birthday?: string;
    is_active: boolean;
    user_type: string;
    created_at: string;
    last_modified: string;
  };

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/users/users/');
        setUsers(response.data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Flex bg="#121212" width="100vw" h="100vh" overflowX="hidden" gap="24px">
            <Box w={isDefaultOpen ? '280px' : '0px'} position="unset">
                {isDefaultOpen ? <BarNormal /> : <Bar />}
              </Box>

      <Flex w="100%" direction="column" gapY="20px" overflowY="auto">
        <Box py="40px" h="51px" zIndex="1">
          <Header />
        </Box>

        <Box pr="24px" py="24px">
          <Text fontSize="18px" fontWeight="500" color = "white">All Users</Text>
        </Box>

        <VStack  pr = "24px" py="16px" align="stretch">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <Box
                key={`skeleton-user-${idx}`}
                p="4"
                bg="gray.700"
                borderRadius="md"
                boxShadow="sm"
                border="1px solid"
              >
                <Skeleton height="20px" width="60%" mb="2" />
                <Skeleton height="16px" width="40%" mb="1" />
                <Skeleton height="14px" width="30%" />
              </Box>
            ))
          ) : (
            users.map((user) => (
              <Box
                key={user.id}
                p="4"
                bg="gray.700"
                borderRadius="md"
                boxShadow="sm"
                border="1px solid"
              >
                <HStack>
                  <VStack align="start">
                    <Text fontWeight="bold" color="white">
                      {user.first_name} {user.last_name}
                    </Text>
                    <Text fontSize="sm" color="gray.200">
                      {user.email}
                    </Text>
                    <Text fontSize="xs" color="gray.200">
                      Type: {user.user_type}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))
          )}

        </VStack>
      </Flex>
    </Flex>
  );
};

export default AllUsers;
