import { useEffect, useState } from 'react';
import axios2 from '../api/apiAxios';
import { useAuth } from '../components/AuthProvider';
import Header from '../components/Header';
import Bar from '../components/bar';
import BarNormal from '../components/barNormal';
import UsersTable from '../components/UsersTable';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Input,
  VStack,
  useBreakpointValue,
  Skeleton,
  SkeletonText,
  SkeletonCircle
} from '@chakra-ui/react';

type TodoItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  assignee: string;
  created_at: string;
  todo_list: string;
};

type TodoList = {
  id: string;
  name: string;
  owner: string;
  created_at: string;
  last_modified: string;
  items?: TodoItem[];
};

type ReassignInput = {
  ownerId: string;
  newName: string;
};

type NewTaskInput = {
  title: string;
  description: string;
};

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};


const Dashboard = () => {
  const isDefaultOpen = useBreakpointValue({ base: false, sm: false, md: true });
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [reassignInputs, setReassignInputs] = useState<Record<string, ReassignInput>>({});
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, NewTaskInput>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [ownerIdInput, setOwnerIdInput] = useState('');
  const [viewMode, setViewMode] = useState<'todos' | 'users'>('todos');
  const [loading, setLoading] = useState(true);
  const { backendUser } = useAuth();
  const navigate = useNavigate();
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    if (backendUser) {
      if (backendUser.user_type !== 'admin') {
        navigate('/');
      } else {
        setCheckedAuth(true);
      }
    }
  }, [backendUser, navigate]);

    useEffect(() => {
      const fetchTodoLists = async () => {
        try {
          setLoading(true); // ✅ Start loading
          const res = await axios2.get('/todolists/');
          setTodoLists(res.data);
        } catch (err) {
          console.error('Failed to fetch todo lists:', err);
        } finally {
          setLoading(false); // ✅ Done loading
        }
      };
      fetchTodoLists();
    }, []);

  if (!checkedAuth) return null;

  const toggleView = () => {
    setViewMode(prev => (prev === 'todos' ? 'users' : 'todos'));
  };

  const handleReassignList = async (listId: string) => {
    const input = reassignInputs[listId];
    const list = todoLists.find(l => l.id === listId);
    if (!input?.ownerId || !input?.newName || !list) return;

    try {
      const response = await axios2.put(`/todolists/${listId}/`, {
        name: input.newName,
        owner: input.ownerId,
      });
      setTodoLists(prev => prev.map(l => l.id === listId ? response.data : l));
      setReassignInputs(prev => ({ ...prev, [listId]: { ownerId: '', newName: '' } }));
    } catch (err) {
      console.error('Failed to reassign list:', err);
    }
  };

  const handleCreateTodoList = async () => {
    if (!newListName || !ownerIdInput) return;
    try {
      const res = await axios2.post('/todolists/', {
        name: newListName,
        owner: ownerIdInput
      });
      setTodoLists(prev => [...prev, res.data]);
      setNewListName('');
      setOwnerIdInput('');
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create todo list:', err);
    }
  };

  const handleAddTask = async (listId: string) => {
    const input = newTaskInputs[listId];
    const listOwner = todoLists.find(l => l.id === listId)?.owner;
    if (!input?.title || !listOwner) return;

    try {
      const res = await axios2.post('/todoitems/', {
        title: input.title,
        description: input.description,
        status: 'todo',
        assignee: listOwner,
        todo_list: listId
      });
      setTodoLists(prev => prev.map(l => l.id === listId ? { ...l, items: [...(l.items || []), res.data] } : l));
      setNewTaskInputs(prev => ({ ...prev, [listId]: { title: '', description: '' } }));
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleEditTask = async (taskId: string, originalItem: TodoItem) => {
    const updatedTitle = prompt('Title', originalItem.title) ?? originalItem.title;
    const updatedDesc = prompt('Description', originalItem.description) ?? originalItem.description;
    const updatedStatus = prompt('Status', originalItem.status) ?? originalItem.status;

    try {
      await axios2.put(`/todoitems/${taskId}/`, {
        title: updatedTitle,
        description: updatedDesc,
        status: updatedStatus,
        todo_list: originalItem.todo_list,
        assignee: originalItem.assignee
      });
      setTodoLists(prev => prev.map(l => l.items ? {
        ...l,
        items: l.items.map(i => i.id === taskId ? { ...i, title: updatedTitle, description: updatedDesc, status: updatedStatus } : i)
      } : l));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleReassignTask = async (taskId: string, fromListId: string, toEmail: string | null, toListName: string | null) => {
    try {
      await axios2.post('todoitems/reassign/', {
        task_id: taskId,
        from_todolist_id: fromListId,
        to_owner_email: toEmail,
        to_todolist_name: toListName
      });
    } catch (err) {
      console.error('Failed to reassign task:', err);
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      await axios2.delete(`/todolists/${listId}/`);
      setTodoLists(prev => prev.filter(l => l.id !== listId));
    } catch (err) {
      console.error("Failed to delete list", err);
    }
  };

  const handleDeleteTask = async (itemId: string, listId: string) => {
    try {
      await axios2.delete(`/todoitems/${itemId}/`);
      setTodoLists(prev => prev.map(l => {
        if (l.id === listId) {
          return { ...l, items: (l.items ?? []).filter(i => i.id !== itemId) };
        }
        return l;
      }));
    } catch (err) {
      console.error("Failed to delete item", err);
    }
  };

  return (
    <Flex bg="#121212" width="100vw" h="100vh" overflowX="hidden">
      <Box w={isDefaultOpen ? '280px' : '0px'} position="unset">
        {isDefaultOpen ? <BarNormal todoLists={todoLists} /> : <Bar todoLists={todoLists} />}
      </Box>
      <Flex w="100%" direction="column" overflowY="auto" h="100%">
        <Box py="40px"  pl = "24px" h="51px" zIndex="1">
          <Header />
        </Box>
        <Flex justify="flex-end" pr = "48px" mb="24px" mt = "48px">
          <Button size="sm" bg = "gray.700" rounded = "full" colorScheme="blue" onClick={toggleView}>
            Switch to {viewMode === 'todos' ? 'Users View' : 'Todo Lists View'}
          </Button>
        </Flex>
        <Box px="24px" pb="24px" flex="1" overflowY="auto">
          {viewMode === 'todos' ? (
            <Box bg="gray.700" borderRadius="4%" color="white" shadow="md" p={4} h="100%" overflowY="auto" scrollbar="hidden">
              <HStack justify="space-between" mb={4} mt = {3}>
                <Text fontSize="xl" fontWeight="semibold">Todo Lists Overview</Text>
                <Button w = "127px" h = "30px"  colorScheme="green" onClick={() => setShowCreateForm(!showCreateForm)}>
                  {showCreateForm ? 'Cancel' : 'Create List'}
                </Button>
              </HStack>

              {showCreateForm && (
                <VStack mb={4} align="start">
                  <Input placeholder="List name" value={newListName} onChange={(e) => setNewListName(e.target.value)} size="sm" />
                  <Input placeholder="Owner ID" value={ownerIdInput} onChange={(e) => setOwnerIdInput(e.target.value)} size="sm" />
                  <Button size="sm" onClick={handleCreateTodoList} colorScheme="blue">Submit</Button>
                </VStack>
              )}

              {todoLists.length === 0 && !loading ? (
                <Text color="gray.300">No todo lists found.</Text>
              ) : loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <Box key={`skeleton-${idx}`} mb={6} borderBottom="1px solid #444" pb={3}>
                    <Skeleton height="20px" width="60%" mb="2" />
                    <SkeletonText mt="4" noOfLines={2} spacing="3" />
                    <Skeleton height="24px" width="30%" mt="3" />
                  </Box>
                ))
              ) : (
                todoLists.map((list) => (
                  <Box key={list.id} mb={6} borderBottom="1px solid #444" pb={3}>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontWeight="bold" fontSize="md">
                        {list.name} ({list.id}) — Owner ID: {list.owner}
                      </Text>
                      <HStack>
                        <Button w = "60px" h = "30px" colorScheme="red" onClick={() => handleDeleteList(list.id)}>Delete</Button>
                        <Button w = "60px" h = "30px" colorScheme="orange" onClick={() => {
                          setReassignInputs(prev => ({ ...prev, [list.id]: { ownerId: '', newName: '' } }));
                        }}>
                          Reassign
                        </Button>
                      </HStack>
                    </HStack>

                    {reassignInputs[list.id] && (
                      <VStack align="start" mt={2}>
                        <Input placeholder="New Owner ID" size="sm" value={reassignInputs[list.id].ownerId} onChange={(e) => setReassignInputs(prev => ({ ...prev, [list.id]: { ...prev[list.id], ownerId: e.target.value } }))} />
                        <Input placeholder="New List Name" size="sm" value={reassignInputs[list.id].newName} onChange={(e) => setReassignInputs(prev => ({ ...prev, [list.id]: { ...prev[list.id], newName: e.target.value } }))} />
                        <Button size="xs" colorScheme="blue" onClick={() => handleReassignList(list.id)}>Submit Reassignment</Button>
                      </VStack>
                    )}

                    {list.items && list.items.length > 0 ? (
                      <VStack align="start" mt={2}>
                        {list.items.map((item) => (
                          <Flex key={item.id} justify="space-between" w="100%" bg="gray.600" p={2} borderRadius="md">
                            <Box w="75%">
                              <Text fontWeight="semibold">{item.title}</Text>
                              <Text fontSize="sm" color="gray.200">
                                {item.description || 'No description'} | Status: {item.status}
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                ID: {item.id} | Created: {formatDate(item.created_at)}
                              </Text>
                            </Box>
                            <VStack>
                              <Button w = "60px" h = "30px" colorScheme="yellow" onClick={() => handleEditTask(item.id, item)}>Edit</Button>
                              <Button w = "60px" h = "30px" colorScheme="purple" onClick={() => handleReassignTask(item.id, list.id, prompt("New Owner Email"), prompt("Target List Name"))}>Reassign</Button>
                              <Button w = "60px" h = "30px" colorScheme="red" onClick={() => handleDeleteTask(item.id, list.id)}>Delete</Button>
                            </VStack>
                          </Flex>
                        ))}
                      </VStack>
                    ) : (
                      <Text fontSize="sm" color="white" mt={2}>No items.</Text>
                    )}

                    <VStack align="start" mt={3}>
                      <Text> Create an item: </Text>
                      <Input
                        placeholder="Task Title"
                        size="sm"
                        value={newTaskInputs[list.id]?.title || ''}
                        onChange={(e) => setNewTaskInputs(prev => ({
                          ...prev,
                          [list.id]: {
                            ...prev[list.id],
                            title: e.target.value
                          }
                        }))}
                      />
                      <Input
                        placeholder="Description"
                        size="sm"
                        value={newTaskInputs[list.id]?.description || ''}
                        onChange={(e) => setNewTaskInputs(prev => ({
                          ...prev,
                          [list.id]: {
                            ...prev[list.id],
                            description: e.target.value
                          }
                        }))}
                      />
                      <Button size="xs" colorScheme="blue" onClick={() => handleAddTask(list.id)}>Add Task</Button>
                    </VStack>
                  </Box>
                ))
              )}
            </Box>
          ) : (
            <Box bg="gray.700" borderRadius="4%" color="white" shadow="md" p={4} h="100%" overflowY="auto">
              <UsersTable />
            </Box>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

export default Dashboard;

