import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@chakra-ui/react/preset";
import App from './App.tsx'
import { AuthProvider } from './components/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={system}>
         <QueryClientProvider client={queryClient}>
             <AuthProvider>
                <App/>
             </AuthProvider>
         </QueryClientProvider>
    </ChakraProvider>
  </StrictMode>,
)
