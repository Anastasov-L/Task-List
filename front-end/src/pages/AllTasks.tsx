import { useRef, useCallback } from 'react';
import axios from '../api/apiAxios';
import { useAuth } from '../components/AuthProvider';
import Header from '../components/Header';
import Bar from '../components/bar';
import BarNormal from '../components/barNormal';
import React from 'react';
import type { AxiosResponse } from 'axios';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  useBreakpointValue,
  Skeleton,
} from '@chakra-ui/react';
import Product38 from '../resources/product38.png';
import { useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 10;

type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
};

const AllTasks = () => {
  const isDefaultOpen = useBreakpointValue({
    base: false,
    sm: false,
    md: true,
    lg: true,
    xl: true,
  });

  const { backendUser } = useAuth();
  const observerRef = useRef<IntersectionObserver | null>(null);
  type PaginatedTasksResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: Task[];
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery<PaginatedTasksResponse, Error>({
    queryKey: ['tasks', backendUser?.id],
    initialPageParam: 1,  // DRF pagination is 1-indexed
    enabled: !!backendUser?.id,
    queryFn: async ({ pageParam = 1 }) => {
      const response: AxiosResponse<PaginatedTasksResponse> = await axios.get('/todoitems/', {
        params: {
          page: pageParam,
          page_size: PAGE_SIZE,
          user_id: backendUser?.id,
        },
      });

      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      const url = new URL(lastPage.next);
      return Number(url.searchParams.get('page'));
    },
  });

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting && hasNextPage && !isFetching) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 }
      );

      if (node) observerRef.current.observe(node);
    },
    [hasNextPage, isFetching, fetchNextPage]
  );

  const renderSkeleton = (count = PAGE_SIZE) => {
    return Array.from({ length: count }).map((_, idx, arr) => (
      <Box
        key={`skeleton-${idx}`}
        ref={idx === arr.length - 1 ? lastElementRef : undefined}
        p="4"
        borderRadius="md"
        boxShadow="sm"
        bg="gray.700"
        border="1px solid #2D3748"
        minH="150px"
        width="100%"
      >
        <HStack gap="16px" alignItems="start">
          <Skeleton boxSize="48px" borderRadius="full" />
          <VStack align="start" w="100%">
            <Skeleton height="16px" width="80%" />
            <Skeleton height="14px" width="100%" />
            <Skeleton height="12px" width="60%" />
          </VStack>
        </HStack>
      </Box>
    ));
  };

  return (
    <Flex bg="#0D0D0D" width="100vw" h="100vh" overflowX="hidden" gap="24px">
      <Box w={isDefaultOpen ? '280px' : '0px'} position="unset">
        {isDefaultOpen ? <BarNormal /> : <Bar />}
      </Box>

      <Flex
        w="100%"
        direction="column"
        gapY="20px"
        overflowY="auto"
        flex="1"
        minH="0"
      >
        <Box py="40px" h="51px" zIndex="1">
          <Header />
        </Box>

        <Box pt="28px">
          <Flex h="40px" w="100%" gap="8px" alignItems="center">
            <HStack w="100%" h="40px" justifyContent="space-between">
              <Text fontSize="18px" fontWeight="500" pr="24px" color="white">
                All Tasks
              </Text>
              <Text fontSize="12px" color="white" pr="24px">
                Overview of everything assigned to you.
              </Text>
            </HStack>
          </Flex>
        </Box>

        {isError && (
          <Text p="6" color="red.500">
            Failed to load tasks: {error.message}
          </Text>
        )}

        <Box pt="2" pb="4" w="100%">
          <Text fontSize="sm" color="gray.400" textAlign="center">
            Beginning of list
          </Text>
        </Box>

        <VStack pr = "24px" align="stretch">
          {isLoading && renderSkeleton()}

          {data?.pages.map((page, i) => (
            <React.Fragment key={i}>
              {page.results.map((task, idx) => (
                <Box
                  key={`${task.id}-${i}-${idx}`}
                  ref={
                    i === data.pages.length - 1 && idx === page.results.length - 1
                      ? lastElementRef
                      : undefined
                  }
                  p="4"
                  borderRadius="md"
                  boxShadow="sm"
                  bg="gray.700"
                  border="1px solid #2D3748"
                  minH="150px"
                  color="white"
                  width="100%"
                >
                  <HStack gap="16px" alignItems="start">
                    <img src={Product38} alt="icon" width={48} height={48} />
                    <VStack align="start">
                      <Text fontWeight="bold">{task.title}</Text>
                      <Text fontSize="sm" color="gray.300">
                        {task.description}
                      </Text>
                      <Text fontSize="xs" color="gray.400" pt="40px">
                        Status: {task.status} | Created:{' '}
                        {new Date(task.created_at).toLocaleDateString()}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </React.Fragment>
          ))}
        </VStack>

        <Box pt="4" pb="6" w="100%">
          <Text fontSize="sm" color="gray.400" textAlign="center">
            End of List Marker
          </Text>
        </Box>

        {isFetching && (
          <Text p="4" color="gray.500" textAlign="center">
            Fetching more tasks...
          </Text>
        )}
      </Flex>
    </Flex>
  );
};

export default AllTasks;
