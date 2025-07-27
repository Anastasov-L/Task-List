import {
  Box,
  Button,
  VStack,
  Image,
  useBreakpointValue,
  Flex,
  Drawer,
  Portal,
  CloseButton,
  HStack,
  Text
} from '@chakra-ui/react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { BarButtonText } from '../css/texts';
import logo from '../resources/LOGO.png';
import home from '../resources/home-2.png';
import frame from '../resources/Frame.png';
import frameBlack from '../resources/FrameBlack.png';
import setting from '../resources/setting.png';
import settingBlack from '../resources/settingBlack.png';
import user from '../resources/user.png';
import userBlack from '../resources/userBlack.png';
import logOut from '../resources/logout.png';
import logOutBlack from '../resources/logoutBlack.png';
import homeBlack from '../resources/homeBlack.png';
import compass from '../resources/burger.png';

type TodoList = {
  id: string;
  name: string;
};

type Props = {
  todoLists?: TodoList[];
};
const triggerHaptic = () => {
  Haptics.impact({ style: ImpactStyle.Medium });
};

const Bar = ({ todoLists = [] }: Props) => {
  const isDefaultOpen = useBreakpointValue({ base: false, sm: false, md: true, lg: true, xl: true });
  const [isOpen, setOpen] = useState(false);
  const [hovered, setHovered] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isDefaultOpen) {
      setOpen(false);
    }
  }, [isDefaultOpen]);

  const path = location.pathname;
  const activeButton = (() => {
    if (path.includes('/todolist')) return 'todolist';
    if (path.includes('/keywords')) return 'keywords';
    if (path.includes('/crawler')) return 'crawler';
    if (path.includes('/Admin')) return 'Admin';
    if (path.includes('/allUsers')) return 'AllUser';
    if (path.includes('/allTasks')) return 'tasks';
    return '';
  })();

  if (isDefaultOpen) return null;

  return (
    <Drawer.Root open={isOpen} onOpenChange={(e) => setOpen(e.open)} placement="start">
      <Drawer.Trigger asChild>
        <Button variant="ghost" size="sm" w="10px">
          <Image src={compass} width="200px" height="40px" position="absolute" zIndex="9999" />
        </Button>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content height="100vh" bg="gray.700">
            <Drawer.Body>
              <Flex>
                <Box bg="gray.700" width="280px" h="100vh" position="relative">
                  <Image src={logo} alt="Logo" position="absolute" top="3vh" left="4.4vw" w="12vw" />

                  <VStack mt="70px" bg="gray.700" w="100%" h="80vh" alignContent="center" alignSelf="center" px="20px">
                    <Button
                      alignItems="center"
                      justifyContent="flex-start"
                      bg={activeButton === 'todolist' ? '#6F6CF3' : 'white'}
                      color={activeButton === 'todolist' ? 'white' : 'black'}
                      borderRadius="10px"
                      onClick={() => {
                      triggerHaptic();
                      navigate('/todolist');
                      }}
                      w="90%"
                      h="48px"
                      onMouseEnter={() => setHovered('todolist')}
                      onMouseLeave={() => setHovered('')}
                      _hover={{ bg: '#6F6CF3', color: 'white' }}
                    >
                      <HStack gap="5">
                        <Image src={hovered === 'todolist' || activeButton === 'todolist' ? home : homeBlack} />
                        <BarButtonText>TodoLists</BarButtonText>
                      </HStack>
                    </Button>

                    <Box
                      maxH="120px"
                      overflowY="auto"
                      w="90%"
                      pr="8px"
                      css={{
                        '&::-webkit-scrollbar': {
                          width: '0px',
                          height: '0px'
                        },
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                      }}
                    >
                      <VStack align="flex-start" pl="8px">
                        {todoLists.map((list) => (
                          <Text
                            key={list.id}
                            fontSize="sm"
                            color="white"
                            truncate
                            maxW="130px"
                            cursor="pointer"
                            onClick={() => {
                            triggerHaptic();
                            navigate(`/reviewsList?todolist=${list.id}`);
                            }}
                            _hover={{ textDecoration: 'underline', color: '#6F6CF3' }}
                          >
                            • {list.name || 'Untitled'}
                          </Text>
                        ))}
                      </VStack>
                    </Box>

                    <Button
                      alignItems="center"
                      justifyContent="flex-start"
                      bg={activeButton === 'Admin' ? '#6F6CF3' : 'white'}
                      color={activeButton === 'Admin' ? 'white' : 'black'}
                      borderRadius="10px"
                      onClick={() =>{
                       triggerHaptic();
                       navigate('/Admin')
                       }}
                      w="90%"
                      h="48px"
                      onMouseEnter={() => setHovered('Admin')}
                      onMouseLeave={() => setHovered('')}
                      _hover={{ bg: '#6F6CF3', color: 'white' }}
                    >
                      <HStack gap="5">
                        <Image src={hovered === 'Admin' || activeButton === 'Admin' ? frame : frameBlack} />
                        <BarButtonText>Admin</BarButtonText>
                      </HStack>
                    </Button>

                    <Button
                      alignItems="center"
                      justifyContent="flex-start"
                      bg={activeButton === 'tasks' ? '#6F6CF3' : 'white'}
                      color={activeButton === 'tasks' ? 'white' : 'black'}
                      borderRadius="10px"
                      onClick={() => {
                      triggerHaptic();
                      navigate('/allTasks')}}
                      w="90%"
                      h="48px"
                      onMouseEnter={() => setHovered('tasks')}
                      onMouseLeave={() => setHovered('')}
                      _hover={{ bg: '#6F6CF3', color: 'white' }}
                    >
                      <HStack gap="5">
                        <Image src={hovered === 'tasks' || activeButton === 'tasks' ? setting : settingBlack} />
                        <BarButtonText>Tasks</BarButtonText>
                      </HStack>
                    </Button>

                    <Button
                      alignItems="center"
                      justifyContent="flex-start"
                      bg={activeButton === 'AllUser' ? '#6F6CF3' : 'white'}
                      color={activeButton === 'AllUser' ? 'white' : 'black'}
                      borderRadius="10px"
                      onClick={() =>{
                       triggerHaptic();
                       navigate('/allUsers')}}
                      w="90%"
                      h="48px"
                      onMouseEnter={() => setHovered('AllUser')}
                      onMouseLeave={() => setHovered('')}
                      _hover={{ bg: '#6F6CF3', color: 'white' }}
                    >
                      <HStack gap="5">
                        <Image src={hovered === 'AllUser' || activeButton === 'AllUser' ? user : userBlack} />
                        <BarButtonText>User Management</BarButtonText>
                      </HStack>
                    </Button>

                    <Button
                      alignItems="center"
                      justifyContent="flex-start"
                      mt={6}
                      bg="white"
                      color="black"
                      borderRadius="10px"
                      onClick={() => {
                        triggerHaptic();
                        logout();
                        navigate('/login');
                      }}
                      w="90%"
                      h="48px"
                      onMouseEnter={() => setHovered('logout')}
                      onMouseLeave={() => setHovered('')}
                      _hover={{ bg: '#6F6CF3', color: 'white' }}
                    >
                      <HStack gap="5">
                        <Image src={hovered === 'logout' ? logOut : logOutBlack} />
                        <BarButtonText>Logout</BarButtonText>
                      </HStack>
                    </Button>
                  </VStack>
                </Box>
              </Flex>
            </Drawer.Body>
            <Drawer.Footer />
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default Bar;
