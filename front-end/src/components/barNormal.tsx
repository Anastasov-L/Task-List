import {
  Box,
  Button,
  VStack,
  Image,
  Flex,
  Spacer,
  HStack,
  Text,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { BarButtonText } from '../css/texts';
import logo from '../resources/LOGO.png';
import home from '../resources/home-2.png';
import homeBlack from '../resources/homeBlack.png';
import frame from '../resources/Frame.png';
import frameBlack from '../resources/FrameBlack.png';
import setting from '../resources/setting.png';
import settingBlack from '../resources/settingBlack.png';
import user from '../resources/user.png';
import userBlack from '../resources/userBlack.png';
import logOut from '../resources/logout.png';
import logOutBlack from '../resources/logoutBlack.png';

type TodoList = {
  id: string;
  name: string;
};

const BarNormal = ({ todoLists = [] as TodoList[] }) => {
  const [hovered, setHovered] = useState('');
  const { logout, backendUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;
  const activeButton = (() => {
    if (path.includes('/todolist')) return 'todolist';
    if (path.includes('/Admin')) return 'Admin';
    if (path.includes('/allUsers')) return 'AllUser';
    if (path.includes('/allTasks')) return 'tasks';
    return '';
  })();

  const isAdmin = backendUser?.user_type === 'admin';

  return (
    <Flex>
      <Box bg="gray.800" width="280px" h="100vh" overflow="hidden" position="sticky">
        <Image src={logo} alt="Logo" position="absolute" top="40px" left="24px" w="5vw" />

        <VStack mt="70px" h="80vh" py="34px" align="start" px="30px">
          <Button
            w="100%"
            justifyContent="flex-start"
            bg={activeButton === 'todolist' ? 'white' : 'none'}
            color={activeButton === 'todolist' ? 'black' : 'white'}
            borderRadius="10px"
            h="48px"
            onClick={() => navigate('/todolist')}
            onMouseEnter={() => setHovered('todolist')}
            onMouseLeave={() => setHovered('')}
            _hover={{ bg: 'white', color: 'black' }}
          >
            <HStack gap="5">
              <Image src={hovered === 'todolist' || activeButton === 'todolist' ? homeBlack : home} />
              <BarButtonText>TodoLists</BarButtonText>
            </HStack>
          </Button>

          <Box
            maxH="120px"
            overflowY="auto"
            w="100%"
            pr="8px"
            css={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': {
                width: '0px',
                height: '0px',
              },
            }}
          >
            <VStack align="flex-start" pl="8px">
              {todoLists.map((list) => (
                <Text
                  key={list.id}
                  fontSize="sm"
                  color="white"
                  truncate
                  maxW="180px"
                  cursor="pointer"
                  onClick={() => navigate(`/reviewsList?todolist=${list.id}`)}
                  _hover={{ textDecoration: 'underline', color: '#6F6CF3' }}
                >
                  • {list.name || 'Untitled'}
                </Text>
              ))}
            </VStack>
          </Box>

          <Button
            w="100%"
            justifyContent="flex-start"
            bg={activeButton === 'Admin' ? 'white' : 'none'}
            color={activeButton === 'Admin' ? 'black' : 'white'}
            borderRadius="10px"
            h="48px"
            onClick={() => isAdmin && navigate('/Admin')}
            onMouseEnter={() => setHovered('Admin')}
            onMouseLeave={() => setHovered('')}
            _hover={{
              bg: isAdmin ? 'white' : 'white',
              color: isAdmin ? 'black' : 'gray.500',
              cursor: isAdmin ? 'pointer' : 'not-allowed',
            }}
            disabled={!isAdmin}
          >
            <HStack gap="5">
              <Image src={hovered === 'Admin' || activeButton === 'Admin' ? frameBlack : frame} />
              <BarButtonText>Admin</BarButtonText>
            </HStack>
          </Button>

          <Button
            w="100%"
            justifyContent="flex-start"
            bg={activeButton === 'tasks' ? 'white' : 'none'}
            color={activeButton === 'tasks' ? 'black' : 'white'}
            borderRadius="10px"
            h="48px"
            onClick={() => navigate('/allTasks')}
            onMouseEnter={() => setHovered('tasks')}
            onMouseLeave={() => setHovered('')}
            _hover={{ bg: 'white', color: 'black' }}
          >
            <HStack gap="5">
              <Image src={hovered === 'tasks' || activeButton === 'tasks' ? settingBlack : setting} />
              <BarButtonText>Tasks</BarButtonText>
            </HStack>
          </Button>

          <Button
            w="100%"
            justifyContent="flex-start"
            bg={activeButton === 'AllUser' ? 'white' : 'none'}
            color={activeButton === 'AllUser' ? 'black' : 'white'}
            borderRadius="10px"
            h="48px"
            onClick={() => navigate('/allUsers')}
            onMouseEnter={() => setHovered('AllUser')}
            onMouseLeave={() => setHovered('')}
            _hover={{ bg: 'white', color: 'black' }}
          >
            <HStack gap="5">
              <Image src={hovered === 'AllUser' || activeButton === 'AllUser' ? userBlack : user} />
              <BarButtonText>User Management</BarButtonText>
            </HStack>
          </Button>

          <Spacer />

          <Button
            mt={6}
            w="100%"
            justifyContent="flex-start"
            bg="none"
            color="white"
            borderRadius="10px"
            h="48px"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            onMouseEnter={() => setHovered('logout')}
            onMouseLeave={() => setHovered('')}
            _hover={{ bg: 'white', color: 'black' }}
          >
            <HStack gap="5">
              <Image src={hovered === 'logout' ? logOutBlack : logOut} />
              <BarButtonText>Logout</BarButtonText>
            </HStack>
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default BarNormal;
