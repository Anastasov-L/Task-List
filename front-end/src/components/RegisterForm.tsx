import { useState } from 'react';
import { Input, Button, VStack } from '@chakra-ui/react';

export default function RegisterForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    birthday: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack>
        <Input name="email" placeholder="Email" bg = "white" onChange={handleChange} />
        <Input name="password" type="password" placeholder="Password"  bg = "white" onChange={handleChange} />
        <Input name="first_name" placeholder="First Name"  bg = "white" onChange={handleChange} />
        <Input name="last_name" placeholder="Last Name"   bg = "white"onChange={handleChange} />
        <Input name="phone" placeholder="Phone"  bg = "white" onChange={handleChange} />
        <Input name="birthday" type="date" placeholder="Birthday"  bg = "white" onChange={handleChange} />
        <Button type="submit" colorScheme="blue" color="black" bg = "white" width="full">Register</Button>
      </VStack>
    </form>
  );
}
