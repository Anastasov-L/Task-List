import { Button, Field, Fieldset, Input, Box } from "@chakra-ui/react";

const LogDemo = ({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
}: {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) => {
  return (
    <form onSubmit={onSubmit}>
      <Box w="65vw" h="50vh" px="18vw">
        <Field.Root>
          <Field.Label>Email address</Field.Label>
          <Input bg = "white" value={email} onChange={(e) => setEmail(e.target.value)} type="email" name="email" />
        </Field.Root>

        <Fieldset.Root>
          <Fieldset.Content>
            <Field.Root>
              <Field.Label>Password</Field.Label>
              <Input bg = "white" value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" />
            </Field.Root>
          </Fieldset.Content>

          <Button type="submit" borderRadius="20px" bg="white" color="black">
            Login
          </Button>
        </Fieldset.Root>
      </Box>
    </form>
  );
};

export default LogDemo;

