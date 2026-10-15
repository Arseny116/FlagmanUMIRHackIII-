import {
  Box, Heading, Text, VStack, HStack, Badge, Skeleton, SimpleGrid,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

function scoreToPriority(score) {
  if (score >= 30) return { label: 'высокий', scheme: 'red' };
  if (score >= 10) return { label: 'средний', scheme: 'yellow' };
  return { label: 'низкий', scheme: 'green' };
}

export default function HotOffersPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['hotOffers'],
    queryFn: api.getHotOffers,
  });

  return (
    <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <HStack justify="space-between" mb={2}>
        <Heading size="md" color="appText" fontWeight="600">
          Горячие предложения
        </Heading>
        {!isLoading && !error && data?.length > 0 && (
          <Badge colorScheme="purple" fontSize="sm" px={2} py={1}>
            Рекомендаций: {data.length}
          </Badge>
        )}
      </HStack>

      {isLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Skeleton height="140px" borderRadius="md" />
          <Skeleton height="140px" borderRadius="md" />
          <Skeleton height="140px" borderRadius="md" />
          <Skeleton height="140px" borderRadius="md" />
        </SimpleGrid>
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState
          title="Нет рекомендаций"
          subtitle="Пока все ингредиенты свежие — нечего продвигать"
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {data.map((offer) => {
            const pr = scoreToPriority(offer.score);
            return (
              <Box
                key={offer.id}
                p={4}
                bg="appBg"
                border="1px solid"
                borderColor="appBorder"
                borderRadius="md"
                transition="border-color 0.15s"
                _hover={{ borderColor: 'appAccent' }}
              >
                <HStack justify="space-between" mb={3}>
                  <Heading size="sm" color="appText" fontWeight="600">
                    {offer.name}
                  </Heading>
                  <HStack spacing={2}>
                    <Badge colorScheme={pr.scheme} fontSize="xs">
                      {pr.label}
                    </Badge>
                  </HStack>
                </HStack>

                <Text fontSize="xs" color="appMuted" mb={2} fontWeight="600" letterSpacing="wide">
                  ПРИЧИНА
                </Text>
                <VStack align="stretch" spacing={1}>
                  {offer.reasons?.slice(0, 3).map((r, i) => (
                    <HStack key={i} fontSize="sm" color="appMuted" spacing={2}>
                      <Box as="span" color="orange.300" fontWeight="bold">•</Box>
                      <Text noOfLines={2}>{r}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}