import { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Spinner,
  Heading,
  Text,
  HStack,
} from "@chakra-ui/react";
import {
  TableRoot,
  TableHeader,
  TableRow,
  TableColumnHeader,
  TableBody,
  TableCell,
} from "@chakra-ui/react";
import axios from "../api/apiAxios";

type User = {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  birthday: string | null;
  is_active: boolean;
  user_type: string;
  created_at: string;
};

const UsersTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<User[]>("/users/users/")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to fetch users", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box overflowX="auto" h="95%"  p={4}>
      <HStack justify="space-between" mb={4}>
        <Heading fontSize="lg" color="white">All Users</Heading>
      </HStack>

      {loading ? (
        <VStack w="100%" h="100%" justify="center" align="center">
          <Spinner color="white" />
          <Text color="white">Loading users...</Text>
        </VStack>
      ) : (
        <TableRoot variant="outline" size="sm">
          <TableHeader>
            <TableRow>
              <TableColumnHeader>ID</TableColumnHeader>
              <TableColumnHeader>Email</TableColumnHeader>
              <TableColumnHeader>Phone</TableColumnHeader>
              <TableColumnHeader>First Name</TableColumnHeader>
              <TableColumnHeader>Last Name</TableColumnHeader>
              <TableColumnHeader>Birthday</TableColumnHeader>
              <TableColumnHeader>Type</TableColumnHeader>
              <TableColumnHeader>Active</TableColumnHeader>
              <TableColumnHeader>Created</TableColumnHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id.slice(0, 6)}...</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.first_name}</TableCell>
                <TableCell>{user.last_name}</TableCell>
                <TableCell>{user.birthday || "—"}</TableCell>
                <TableCell>{user.user_type}</TableCell>
                <TableCell>{user.is_active ? "no" : "yes"}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      )}
    </Box>
  );
};

export default UsersTable;
