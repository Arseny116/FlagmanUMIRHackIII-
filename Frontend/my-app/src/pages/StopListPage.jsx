import {
  Box, Heading, Text, VStack, HStack, Badge, Skeleton, SimpleGrid,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

function MissingList({ missing }) {
  if (!Array.isArray(missing)) {
    return <Text color="appMuted" fontSize="sm">{missing ?? '—'}</Text>;
  }
  return (
    <VStack align="stretch" spacing={1} pl={1}>
      {missing.map((m, i) => (
        <HStack key={i} fontSize="sm" color="appMuted" spacing={2}>
          <Box as="span" color="red.300" fontWeight="bold">•</Box>
          <Text>
            <Text as="span" color="appText" fontWeight="500">{m.productName}</Text>
            {' — нужно '}
            <Text as="span" color="red.300">{m.need} {m.unit}</Text>
            {', есть '}
            <Text as="span" color="appText">{m.have} {m.unit}</Text>
          </Text>
        </HStack>
      ))}
    </VStack>
  );
}

export default function StopListPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stoplist'],
    queryFn: api.getStopList,
  });

  return (
    <Box p={{ base: 4, md: 6 }} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <HStack justify="space-between" mb={4}>
        <Heading size="md" color="appText" fontWeight="600">
          Стоп-лист
        </Heading>
        {!isLoading && !error && (
          <Badge colorScheme={data?.length ? 'red' : 'green'} fontSize="sm" px={2} py={1}>
            {data?.length ? `Недоступно: ${data.length}` : 'Всё доступно'}
          </Badge>
        )}
      </HStack>

      {isLoading ? (
        <VStack align="stretch" spacing={3}>
          <Skeleton height="80px" borderRadius="md" />
          <Skeleton height="80px" borderRadius="md" />
          <Skeleton height="80px" borderRadius="md" />
        </VStack>
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState
          title="Все блюда доступны"
          subtitle="Ничего не попало в стоп-лист — склад полон"
          variant="success"
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {data.map((dish) => (
            <Box
              key={dish.id}
              p={4}
              bg="appBg"
              border="1px solid"
              borderColor="appBorder"
              borderRadius="md"
              transition="border-color 0.15s"
              _hover={{ borderColor: 'red.400' }}
            >
              <HStack justify="space-between" mb={3}>
                <Heading size="sm" color="appText" fontWeight="600">
                  {dish.name}
                </Heading>
                <Badge colorScheme="red" fontSize="xs">недоступно</Badge>
              </HStack>
              <MissingList missing={dish.missing} />
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}