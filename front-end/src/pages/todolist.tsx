import { useEffect, useState } from 'react';
import axios2 from '../api/apiAxios';
import { useAuth } from '../components/AuthProvider';
import Header from '../components/Header';
import Bar from '../components/bar';
import BarNormal from '../components/barNormal';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';


import {
  Box,
  Button,
  Flex,
  Text,
  Input,
  VStack,
  HStack,
  useBreakpointValue,
  SimpleGrid,
  Skeleton,
  SkeletonText
} from '@chakra-ui/react';

// Define types for TodoList
type TodoList = {
  id: string;
  name: string;
  created_at: string;
  last_modified: string;
  owner: string;
};



const Dashboard = () => {
  const isDefaultOpen = useBreakpointValue({
    base: false,
    sm: false,
    md: true,
    lg: true,
    xl: true,
  });
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [ownerIdInput, setOwnerIdInput] = useState('');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editInputs, setEditInputs] = useState<Record<string, { name: string; owner: string }>>({});
  const { backendUser } = useAuth();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);




    const { data: todoLists = [], isLoading: loading } = useQuery({
      queryKey: ['todolists', backendUser?.id],
      queryFn: async () => {
        const res = await axios2.get(`/todolists/?user_id=${backendUser?.id}`);
    //    await sleep(800); // Force skeleton to stay visible for 800ms
        return res.data;
      },
      enabled: !!backendUser?.id,
    });

 //   const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
 //   useEffect(() => {
 //     if (!loading && !hasFetchedOnce) {
 //       setHasFetchedOnce(true);
  //    }
 //   }, [loading, todoLists, hasFetchedOnce]);

    useEffect(() => {
      if (!loading) {
        const timer = setTimeout(() => {
          setShowContent(true);
        }, 600);

        return () => clearTimeout(timer);
      }
    }, [loading]);

    const deleteTodoListMutation = useMutation({
      mutationFn: async (id: string) => {
        await axios2.delete(`/todolists/${id}/`);
        return id;
      },
      onMutate: async (id) => {
        await queryClient.cancelQueries(['todolists', backendUser?.id]);

        const previous = queryClient.getQueryData<TodoList[]>(['todolists', backendUser?.id]);

        queryClient.setQueryData<TodoList[]>(['todolists', backendUser?.id], (old = []) =>
          old.filter(todo => todo.id !== id)
        );

        return { previous };
      },
      onError: (_err, _id, context) => {
        if (context?.previous) {
          queryClient.setQueryData(['todolists', backendUser?.id], context.previous);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['todolists', backendUser?.id]);
      },
    });

    const handleDelete = (id: string) => {
      deleteTodoListMutation.mutate(id);
    };


const createTodoListMutation = useMutation({
  mutationFn: async (newList: { name: string; owner: string }) => {
    const response = await axios2.post('/todolists/', newList);
    return response.data;
  },
      onMutate: async (newList) => {
        await queryClient.cancelQueries(['todolists', backendUser?.id]);

        const previous = queryClient.getQueryData<TodoList[]>(['todolists', backendUser?.id]);

        const optimistic = {
          ...newList,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
          last_modified: new Date().toISOString(),
        };

        queryClient.setQueryData<TodoList[]>(['todolists', backendUser?.id], (old = []) => [...old, optimistic]);

        return { previous };
      },
      onError: (_err, _newList, context) => {
        if (context?.previous) {
          queryClient.setQueryData(['todolists', backendUser?.id], context.previous);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['todolists', backendUser?.id]);
      },
    });

    const handleCreateTodoList = () => {
         if (!newListName.trim()) {
            alert("List name cannot be empty");
            return;
          }
      createTodoListMutation.mutate({
        name: newListName,
        owner: ownerIdInput.trim() || backendUser?.id,
      });
      setShowCreateForm(false);
      setNewListName('');
      setOwnerIdInput('');
    };
    const isCreating = createTodoListMutation.isPending;

const updateTodoListMutation = useMutation({
  mutationFn: async (updated: { id: string; name: string; owner: string }) => {
    const response = await axios2.put(`/todolists/${updated.id}/`, updated);
    return response.data;
  },
  onMutate: async (updated) => {
    await queryClient.cancelQueries(['todolists', backendUser?.id]);

    const previous = queryClient.getQueryData<TodoList[]>(['todolists', backendUser?.id]);

    queryClient.setQueryData<TodoList[]>(['todolists', backendUser?.id], (old = []) =>
      old.map(item => item.id === updated.id ? { ...item, ...updated } : item)
    );

    return { previous };
  },
  onError: (_err, _updated, context) => {
    if (context?.previous) {
      queryClient.setQueryData(['todolists', backendUser?.id], context.previous);
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries(['todolists', backendUser?.id]);
  },
});

    const handleUpdateTodoList = (id: string) => {
      const input = editInputs[id];
      if (!input?.name || !input?.owner) {
        alert("Both name and owner are required");
        return;
      }

      updateTodoListMutation.mutate(
        {
          id,
          name: input.name,
          owner: input.owner,
        },
        {
          onSuccess: () => {
            setTimeout(() => {
              setEditingListId(null);
              setEditInputs(prev => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
              });
            }, 300);
          },
        }
      );
    };



  return (
    <Flex bg="#0D0D0D" width="100vw" h="100vh" overflowX="hidden" gap="24px">
      <Box w={isDefaultOpen ? '280px' : '0px'} position="unset">
        {isDefaultOpen ? <BarNormal todoLists={todoLists} /> : <Bar todoLists={todoLists} />}
      </Box>

      <Flex w="100%" direction="column" gapY="20px" overflowY="auto">
        <Box py="40px" h="51px" zIndex="1">
          <Header />
        </Box>

        <Box pt="28px" pr="24px">
          <Flex justify="space-between" align="center" mb="12px">
            <Text fontSize="18px" fontWeight="500" color="white">Calendar View</Text>
            <Button onClick={() => setShowCreateForm(!showCreateForm)} bg="gray.700" color="white" borderRadius="10px">
              {showCreateForm ? "Cancel" : "Create"}
            </Button>
          </Flex>

          {showCreateForm && (
            <Box mb="16px" p="4" border="1px solid #CBD5E0" borderRadius="md" bg="white">
              <Text fontWeight="semibold" mb="2">Create a New Todo List</Text>
              <VStack  align="start" mb="3">
                <Input
                  placeholder="Todo List Name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                />
              </VStack>
              <Button size="sm" onClick={handleCreateTodoList} colorScheme="blue">
                Submit
              </Button>
            </Box>
          )}
        </Box>

        {!showContent ? (
          <SimpleGrid
            minChildWidth="250px"
            pr="24px"
            py="16px"
            width="100%"
            rowGap="24px"
            columnGap="24px"
          >
            {Array.from({ length: todoLists.length || 6 }).map((_, idx) => (
              <Box
                key={`skeleton-${idx}`}
                p="4"
                borderRadius="md"
                boxShadow="sm"
                bg="gray.700"
                border="1px solid"
              >
                <Skeleton height="20px" width="70%" mb="3" />
                <Skeleton height="14px" width="50%" mb="2" />
                <Skeleton height="14px" width="90%" />
              </Box>
            ))}
          </SimpleGrid>
        ) : todoLists.length === 0 ? (
          <Box pt="6" color="gray.500">
            No todo lists yet.
          </Box>
        ) : (
          <SimpleGrid
            minChildWidth="250px"
            pr="24px"
            py="16px"
            width="100%"
            rowGap="24px"
            columnGap="24px"
          >
            {todoLists.map((todo) => (
              <Box
                key={todo.id}
                position="relative"
                p="4"
                borderRadius="md"
                boxShadow="sm"
                bg="gray.700"
                border="1px solid"
                cursor="pointer"
                _hover={{ bg: 'gray.600' }}
                onClick={() => {
                  if (editingListId !== todo.id) {
                    navigate(`/reviewsList?todolist=${todo.id}`);
                  }
                }}
              >
                <HStack w = "230px" gap = "30px" bg = "red">
                <HStack spacing={2} position="absolute" top="4px" right="4px">
                     {!todo.id.startsWith('temp-') && (
                       <Button
                         size="xs"
                         colorScheme="orange"
                         onClick={(e) => {
                           e.stopPropagation();
                           setEditingListId(todo.id);
                           setEditInputs(prev => ({
                             ...prev,
                             [todo.id]: { name: todo.name, owner: todo.owner }
                           }));
                         }}
                       >
                         Edit
                       </Button>
                     )}


                  <Button
                    size="xs"
                    colorScheme="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(todo.id);
                    }}
                  >
                    Delete
                  </Button>
                </HStack>


                 </HStack>
                <Text fontWeight="bold" fontSize="lg" color="white" mb="1">
                  {todo.name || 'Untitled'}
                </Text>
                <Text fontSize="xs" color="gray.200">
                  Created: {new Date(todo.created_at).toLocaleDateString()}
                </Text>
                <Text fontSize="xs" color="gray.200" mt="2">
                  ID: {todo.id}
                </Text>
                {editingListId === todo.id && (
                  <VStack mt={3} spacing={2} align="start">
                    <Input
                      placeholder="New List Name"
                      size="sm"
                      value={editInputs[todo.id]?.name || ''}
                      onChange={(e) =>
                        setEditInputs(prev => ({
                          ...prev,
                          [todo.id]: {
                            ...prev[todo.id],
                            name: e.target.value,
                          }
                        }))
                      }
                    />
                    <Button
                      size="xs"
                      colorScheme="blue"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateTodoList(todo.id);
                      }}
                    >
                      Save
                    </Button>
                  </VStack>
                )}


              </Box>
            ))}
          </SimpleGrid>
        )}
      </Flex>
    </Flex>
  );
};

export default Dashboard;
