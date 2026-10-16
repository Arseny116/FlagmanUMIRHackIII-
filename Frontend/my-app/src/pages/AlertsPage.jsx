import {
  Box, Heading, Text, VStack, HStack, Skeleton,
  Button, ButtonGroup, Divider,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../api/client';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ExpiryBadge } from '../components/ExpiryBadge';

export default function AlertsPage() {
  const [hours, setHours] = useState(24);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['alerts', hours],
    queryFn: () => api.getExpiring(hours),
  });

  return (
    <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <HStack justify="space-between" mb={2} wrap="wrap" spacing={3}>
        <Heading size="md" color="appText" fontWeight="600">
          Уведомления об истечении
        </Heading>

        <ButtonGroup size="sm" isAttached variant="outline">
          {[24, 48].map((h) => (
            <Button
              key={h}
              onClick={() => setHours(h)}
              bg={hours === h ? 'appAccent' : 'transparent'}
              color={hours === h ? 'white' : 'appMuted'}
              borderColor="appBorder"
              _hover={{ bg: hours === h ? 'appAccent' : 'appBg' }}
            >
              {h} ч
            </Button>
          ))}
        </ButtonGroup>
      </HStack>

      <Text color="appMuted" fontSize="sm" mb={6}>
        Партии, у которых срок годности истекает в пределах {hours} часов.
      </Text>

      {isLoading ? (
        <VStack align="stretch" spacing={3}>
          <Skeleton height="72px" borderRadius="md" />
          <Skeleton height="72px" borderRadius="md" />
          <Skeleton height="72px" borderRadius="md" />
        </VStack>
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState
          title={`Ничего не истекает в ближайшие ${hours} ч`}
          subtitle="Все партии свежие — можно работать спокойно"
          variant="success"
        />
      ) : (
        <VStack align="stretch" spacing={3} divider={<Divider borderColor="appBorder" />}>
          {data.map((b) => (
            <HStack
              key={b.id}
              justify="space-between"
              align="center"
              py={3}
              wrap="wrap"
              spacing={3}
            >
              <VStack align="flex-start" spacing={1} flex={1} minW="200px">
                <Text color="appText" fontWeight="600">
                  {b.productName}
                </Text>
                <Text color="appMuted" fontSize="sm">
                  {b.quantity.toFixed(2)} {b.unit} • до{' '}
                  {new Date(b.expiresAt).toLocaleString('ru-RU', {
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </VStack>

              <HStack spacing={3}>
                <ExpiryBadge hours={b.hoursLeft} />
                <Button
                  as={RouterLink}
                  to={`/supplies?productId=${b.productId}`}
                  size="sm"
                  variant="outline"
                  borderColor="appBorder"
                  color="appMuted"
                  _hover={{ color: 'appAccent', borderColor: 'appAccent' }}
                >
                  Заказать поставку
                </Button>
              </HStack>
            </HStack>
          ))}
        </VStack>
      )}
    </Box>
  );
}