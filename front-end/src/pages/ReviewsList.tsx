import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/apiAxios';
import { useAuth } from '../components/AuthProvider';
import Header from '../components/Header';
import Bar from '../components/bar';
import BarNormal from '../components/barNormal';
import {
  Box, Flex, VStack, HStack, Text, Button, Image, Spacer, Input,
  useBreakpointValue, Portal
} from "@chakra-ui/react";
import {
  Select as ChakraSelect,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectRoot,
  SelectLabel,
  SelectValueText,
  SelectControl,
  SelectIndicator,
  SelectIndicatorGroup,
  SelectPositioner,
  createListCollection,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import Product38 from '../resources/product38.png';
import { useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TodoItem {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

const ReviewsList = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [showContent, setShowContent] = useState(false);



  const [todoListId, setTodoListId] = useState('');
   const { data: todoItems = [], isLoading } = useQuery({
        queryKey: ['todos', todoListId],
        queryFn: async () => {
          const response = await axios.get(`/todolists/${todoListId}/`);
          return response.data.items || [];
        },
        enabled: !!todoListId, // Only run if we have a list ID
      });

     useEffect(() => {
       if (!isLoading) {
         const timer = setTimeout(() => {
           setShowContent(true);
         }, 600); // Ensures skeletons show for 600ms minimum
         return () => clearTimeout(timer);
       }
     }, [isLoading]);

  const isDefaultOpen = useBreakpointValue({ base: false, sm: false, md: true, lg: true, xl: true });
  const location = useLocation();
  const { backendUser } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [allUsers, setAllUsers] = useState<{ id: string; email: string }[]>([]);
  const [selectedUserTodoLists, setSelectedUserTodoLists] = useState<{ id: string; name: string }[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | undefined>();
  const [selectedTodoListName, setSelectedTodoListName] = useState<string | undefined>();

  useEffect(() => {
    const fetchTodoItems = async () => {
      const searchParams = new URLSearchParams(location.search);
      const listId = searchParams.get("todolist");
      console.log("Extracted todolist ID from URL:", listId);
      if (!listId) return;
      setTodoListId(listId);
      try {
        const response = await axios.get(`/todolists/${listId}/`);
      } catch (error) {
        console.error("Error fetching todo list:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await axios.get('/users/users/');
        const userList = Array.isArray(res.data) ? res.data : res.data.users || res.data.results || [];


       const nonAdmins = userList.filter(
         (user: any) =>
           user.user_type !== 'admin' && user.id !== backendUser?.id
       );

        const usersWithTodoLists = await Promise.all(
          nonAdmins.map(async (user: any) => {
            try {
              const listRes = await axios.get(`/todolists/?user_id=${user.id}`);
              const todoLists = Array.isArray(listRes.data) ? listRes.data : [];
              if (todoLists.length > 0) {
                return { id: user.id, email: user.email };
              }
            } catch (err) {
              console.warn(`Failed to fetch lists for user ${user.email}`);
            }
            return null;
          })
        );

        // Filter out nulls (users without todo lists)
        const filteredUsers = usersWithTodoLists.filter((u): u is { id: string; email: string } => u !== null);
        setAllUsers(filteredUsers);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
      fetchTodoItems();
      fetchUsers();
      }, [location.search]);


 const extractEmailString = (val: unknown): string | null => {
   if (typeof val === "string") return val;

   if (
     typeof val === "object" &&
     val !== null &&
     "value" in val &&
     Array.isArray((val as any).value)
   ) {
     return (val as any).value[0];
   }

   return null;
 };

 const fetchListsForUser = async (raw: string) => {
   const user = allUsers.find(

     (u) =>
       typeof u.email === "string" &&
       u.email === raw
   );

   if (!user) {
     console.warn("No matching user found for:", raw);
     return;
   }
    console.log("do we ever get here?");
   try {
     const res = await axios.get(`/todolists/?user_id=${user.id}`);
     console.log("501");
     setSelectedUserTodoLists(

       res.data.map((list: any) => ({
         id: list.id,
         name: list.name,
       }))
     );
     console.log("selected");
   } catch (err) {
     console.error("Failed to fetch todo lists:", err);
     setSelectedUserTodoLists([]);
   }

 };
   const deleteTodoMutation = useMutation({
     mutationFn: async (id: string) => {
       await axios.delete(`/todoitems/${id}/`);
       return id;
     },

     onMutate: async (id) => {
       await queryClient.cancelQueries({ queryKey: ['todos', todoListId] });

       const previousTodos = queryClient.getQueryData<TodoItem[]>(['todos', todoListId]);

       queryClient.setQueryData<TodoItem[]>(['todos', todoListId], (old = []) =>
         old.filter((item) => item.id !== id)
       );

       return { previousTodos };
     },

     onError: (_err, _id, context) => {
       if (context?.previousTodos) {
         queryClient.setQueryData(['todos', todoListId], context.previousTodos);
       }
     },

     onSettled: () => {
       queryClient.invalidateQueries({ queryKey: ['todos', todoListId] });
     },
   });


   const queryClient = useQueryClient();

    const createTodoMutation = useMutation({
      mutationFn: async (newTodo: Omit<TodoItem, 'id' | 'created_at'> & { assignee: string; todo_list: string }) => {
        const response = await axios.post('/todoitems/', newTodo);
        return response.data as TodoItem;
      },

      onMutate: async (newTodo) => {
        await queryClient.cancelQueries({ queryKey: ['todos', todoListId] });

        const previousTodos = queryClient.getQueryData<TodoItem[]>(['todos', todoListId]);

        const tempId = `temp-${Date.now()}`;
        const optimisticTodo: TodoItem = {
          id: tempId,
          created_at: new Date().toISOString(),
          title: newTodo.title,
          description: newTodo.description,
          status: newTodo.status,
        };

        queryClient.setQueryData<TodoItem[]>(['todos', todoListId], (old = []) => [
          ...old,
          optimisticTodo,
        ]);

        return { previousTodos, tempId };
      },

      onSuccess: (realTodo, _newTodo, context) => {
        if (!context?.tempId) return;
            console.log(" Successfully saved, replacing temp with:", realTodo);

        queryClient.setQueryData<TodoItem[]>(['todos', todoListId], (old = []) =>
          old.map((item) =>
            item.id === context.tempId ? realTodo : item
          )

        );
      },

      onError: (_err, _newTodo, context) => {
        if (context?.previousTodos) {
          queryClient.setQueryData(['todos', todoListId], context.previousTodos);
        }
      },

      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['todos', todoListId] });
      },
    });



 useEffect(() => {
   if (typeof selectedUserEmail === "string") {
     fetchListsForUser(selectedUserEmail);
   } else {
     setSelectedUserTodoLists([]);
   }
 }, [selectedUserEmail, allUsers]);


useEffect(() => {
  console.log("Selected email trigger effect:", selectedUserEmail);
}, [selectedUserEmail]);


  const handleDelete = (id: string) => {
    deleteTodoMutation.mutate(id);
  };


    const handleCreate = () => {
      if (!title.trim() || !description.trim()) {
        alert("Please fill in all fields");
        return;
      }

      createTodoMutation.mutate({
        title,
        description,
        status,
        assignee: backendUser?.id,
        todo_list: todoListId,
      });

      setTitle('');
      setDescription('');
      setStatus('todo');
      setShowCreateForm(false);
    };

   const editTodoMutation = useMutation({
     mutationFn: async (updated: TodoItem & { assignee: string; todo_list: string }) => {
       const response = await axios.put(`/todoitems/${updated.id}/`, updated);
       return response.data as TodoItem;
     },

     onMutate: async (updatedTodo) => {
       await queryClient.cancelQueries({ queryKey: ['todos', todoListId] });

       const previousTodos = queryClient.getQueryData<TodoItem[]>(['todos', todoListId]);

       queryClient.setQueryData<TodoItem[]>(['todos', todoListId], (old = []) =>
         old.map((item) =>
           item.id === updatedTodo.id
             ? { ...item, ...updatedTodo, created_at: item.created_at }
             : item
         )
       );

       return { previousTodos };
     },

     onError: (_err, _newTodo, context) => {
       queryClient.setQueryData(['todos', todoListId], context?.previousTodos ?? []);
     },

     onSettled: () => {
       queryClient.invalidateQueries({ queryKey: ['todos', todoListId] });
     },
   });



    const handleEditTask = (task: TodoItem) => {
      const updatedTitle = prompt("Edit Title", task.title) ?? task.title;
      const updatedDescription = prompt("Edit Description", task.description) ?? task.description;
      const updatedStatus = prompt("Edit Status", task.status) ?? task.status;

      editTodoMutation.mutate({
        ...task,
        title: updatedTitle,
        description: updatedDescription,
        status: updatedStatus,
        todo_list: todoListId,
        assignee: backendUser?.id!,
      });
    };


  const [userCollection, setUserCollection] = useState(() =>
    createListCollection({ items: [] })
  );

    useEffect(() => {
      try {
        if (allUsers.length > 0 && userCollection.items.length === 0) {
          const collection = createListCollection({
            items: allUsers.map(user => ({
              label: user.email,
              value: user.email,
            })),
          });
          setUserCollection(collection);
        }
      } catch (error) {
        console.error("hallor there", error);
      }
    }, [allUsers, userCollection.items.length]);



    const todoListCollection = useMemo(() => {
      try {
        return createListCollection({
          items: selectedUserTodoLists.map(list => ({
            label: list.name,
            value: list.name,
          })),
        });
      } catch (error) {
        console.error("hallor there", error);
        return createListCollection({ items: [] }); // fallback to empty list
      }
    }, [selectedUserTodoLists]);


  return (
    <Flex bg="#121212" gap="24px" w="100%" h="100vh" overflowX="hidden">
      <Box w={isDefaultOpen ? "280px" : "0px"} position="unset">
        {isDefaultOpen ? <BarNormal /> : <Bar />}
      </Box>

      <Box width={{ base: "calc(100vw - 48px)", sm: "calc(100vw - 48px)", md: "calc(100vw - 328px)", lg: "calc(100vw - 328px)" }} alignItems="center" overflowX="hidden">
        <VStack gap="24px">
          <Box py="40px" h="51px" w="100%">
            <Header />
          </Box>

          <Flex alignItems="center" w="100%" mt="35px">
            <Text fontSize={{ base: "0px", sm: "14px", md: "16px", lg: "18px" }} color="white" fontWeight="500" lineHeight="160%">
              Task List
            </Text>
            <Spacer />
            <HStack gap="8px">
              <Button w="110px" h="40px" borderRadius="10px" bg="white" color="black" onClick={() => setShowCreateForm(!showCreateForm)}>
                Create Item
              </Button>
              <Button w="110px" h="40px" bg="black" color="white" borderRadius="10px" onClick={() => setShowAssignForm(true)} disabled={!selectedTaskId}>
                Assign Task
              </Button>
            </HStack>
          </Flex>

          {showCreateForm && (
            <Box w="100%" p={4} bg="white" borderRadius="12px" shadow="sm">
              <VStack align="start">
                <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Input placeholder="Status (e.g., todo, in_progress, done)" value={status} onChange={(e) => setStatus(e.target.value)} />
                <Button colorScheme="blue" onClick={handleCreate}>Submit</Button>
              </VStack>
            </Box>
          )}

          {showAssignForm && selectedTaskId && (
            <Box w="100%" p={4} bg="white" borderRadius="12px" shadow="sm">
              <VStack align="start" spacing={3}>
                <SelectRoot
                    value={selectedUserEmail ? [selectedUserEmail] : []}
                  onValueChange={(val) => {
                    console.log("Raw value:", val);
                    console.log("Typeof value:", typeof val);
                    console.log("Stringified value:", JSON.stringify(val));

                    if (typeof val === "string") {
                      setSelectedUserEmail(val);
                      fetchListsForUser(val);
                    } else if (val && typeof val === "object" && "value" in val) {
                      const valueArray = val.value;
                      const email = Array.isArray(valueArray) ? valueArray[0] : valueArray;
                      if (typeof email === "string") {
                        setSelectedUserEmail(email);
                        fetchListsForUser(email);
                        console.log("we got jere");
                      } else {
                        console.warn("Unexpected email format inside value:", email);
                      }
                    } else {
                      console.warn("Unexpected Select value:", val);
                    }
                  }}

                  collection={userCollection}
                >
                  <SelectLabel>Select target user</SelectLabel>
                  <SelectControl>
                    <SelectTrigger>
                      <SelectValueText placeholder="Select target user" />
                    </SelectTrigger>
                    <SelectIndicatorGroup>
                      <SelectIndicator />
                    </SelectIndicatorGroup>
                  </SelectControl>
                  <Portal>
                    <SelectPositioner>
                      <SelectContent>
                         {userCollection.items.map((item) => (
                               <SelectItem key={item.value} item={item}>
                                 {item.label}
                                 <SelectIndicator />
                               </SelectItem>
                         ))}
                      </SelectContent>
                    </SelectPositioner>
                  </Portal>
                </SelectRoot>

                <SelectRoot
                  value={selectedTodoListName ? [selectedTodoListName] : []}
                  onValueChange={(val) => {
                    if (typeof val === 'string') {
                      setSelectedTodoListName(val);
                    } else if (val && typeof val === 'object' && 'value' in val) {
                      const firstVal = Array.isArray(val.value) ? val.value[0] : val.value;
                      if (typeof firstVal === 'string') {
                        setSelectedTodoListName(firstVal);
                      }
                    }
                  }}
                  collection={todoListCollection}
                >

                  <SelectLabel>Select target list</SelectLabel>
                  <SelectControl>
                    <SelectTrigger>
                      <SelectValueText placeholder="Select target list" />
                    </SelectTrigger>
                    <SelectIndicatorGroup>
                      <SelectIndicator />
                    </SelectIndicatorGroup>
                  </SelectControl>
                  <Portal>
                    <SelectPositioner>
                      <SelectContent>
                        {todoListCollection.items.map((item) => (
                          <SelectItem key={item.value} item={item}>
                            {item.label}
                          <SelectIndicator />
                          </SelectItem>
                       ))}
                      </SelectContent>
                    </SelectPositioner>
                  </Portal>
                </SelectRoot>


               <Button
                 colorScheme="purple"
                 onClick={async () => {
                   console.log(" Reassign button clicked");
                   console.log(" selectedTaskId:", selectedTaskId);
                   console.log(" todoListId (from_todolist_id):", todoListId);
                   console.log(" selectedUserEmail (to_owner_email):", selectedUserEmail);
                   console.log(" selectedTodoListName (to_todolist_name):", selectedTodoListName);

                   if (
                     !selectedTaskId ||
                     selectedTaskId.startsWith("temp-") ||
                     !todoListId ||
                     !selectedUserEmail ||
                     !selectedTodoListName
                   ) {
                     console.warn(" Invalid input detected, reassignment aborted.");
                     alert("You must select a valid saved task and target before reassigning.");
                     return;
                   }

                   const payload = {
                     task_id: selectedTaskId,
                     from_todolist_id: todoListId,
                     to_owner_email: selectedUserEmail,
                     to_todolist_name: selectedTodoListName,
                   };
                   console.log(" Final payload to POST:", payload);

                   const previousItems = [...todoItems];

                   //  Optimistically remove the task
                   queryClient.setQueryData<TodoItem[]>(['todos', todoListId], (prev = []) =>
                     prev.filter((item) => item.id !== selectedTaskId)
                   );


                   try {
                     await axios.post('/todoitems/reassign/', payload);
                     console.log(" Task reassigned!");
                     alert(" Task reassigned!");

                     // Clear form state
                     setShowAssignForm(false);
                     setSelectedTaskId(null);
                     setSelectedUserEmail(undefined);
                     setSelectedTodoListName(undefined);
                     setSelectedUserTodoLists([]);
                   } catch (error: any) {
                     console.error(" Failed to reassign task:", error);

                     //  Rollback: re-add the removed task
                     queryClient.setQueryData<TodoItem[]>(['todos', todoListId], (prev = []) =>
                       prev.filter((item) => item.id !== selectedTaskId)
                     );


                     alert(
                       "Failed to reassign task. " +
                         (error?.response?.data?.detail || "Please check inputs or try again.")
                     );
                   }
                 }}
               >
                 Reassign Task
               </Button>
              </VStack>
            </Box>
          )}

          {!showContent ? (
             Array.from({ length: todoItems.length }).map((_, index) => (
               <Box
                 key={`skeleton-${index}`}
                 bg="gray.700"
                 w="100%"
                 borderRadius="20px"
                 overflow="hidden"
                 py="12px"
                 px="16px"
               >
                 <Flex align="center" justify="space-between">
                   <HStack gap="16px">
                     <Skeleton boxSize="68px" borderRadius="md" />
                     <VStack align="flex-start" spacing={2} w="full">
                       <Skeleton height="20px" width="60%" />
                       <Skeleton height="14px" width="80%" />
                       <Skeleton height="12px" width="40%" />
                     </VStack>
                   </HStack>
                   <HStack>
                     <Skeleton height="40px" width="70px" borderRadius="8px" />
                     <Skeleton height="40px" width="70px" borderRadius="8px" />
                   </HStack>
                 </Flex>
               </Box>
             ))
           ) : (
             todoItems.map((item) => (
               <Box
                 key={item.id}
                 bg={selectedTaskId === item.id ? "#D6E4FF" : "gray.700"}
                 w="100%"
                 borderRadius="20px"
                 overflow="hidden"
                 py="12px"
                 px="16px"
                 border={selectedTaskId === item.id ? "2px solid #4C6EF5" : "none"}
                 cursor="pointer"
                 onClick={() => setSelectedTaskId(item.id)}
               >
                 <Flex align="center" justify="space-between">
                   <HStack gap="16px">
                     <Image src={Product38} boxSize="68px" />
                     <VStack align="flex-start">
                       <Text color="white">{item.title}</Text>
                       <Text fontSize="14px" color="gray.200">{item.description}</Text>
                       <Text fontSize="12px" color="gray.200">
                         Status: {item.status} | Created: {new Date(item.created_at).toLocaleString()}
                       </Text>
                     </VStack>
                   </HStack>
                   <HStack>
                     <Button color="white" bg="red.500" borderRadius="8px" h="40px" onClick={() => handleDelete(item.id)}>
                       <Text>Delete</Text>
                     </Button>
                     <Button color="white" bg="#6F6CF3" borderRadius="8px" h="40px" onClick={() => handleEditTask(item)}>
                       <Text>Edit task</Text>
                     </Button>
                   </HStack>
                 </Flex>
               </Box>
             ))
           )}
          ))
        </VStack>
      </Box>
    </Flex>
  );
};

export default ReviewsList;