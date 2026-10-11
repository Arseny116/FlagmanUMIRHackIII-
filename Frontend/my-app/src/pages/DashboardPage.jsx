import {
  Box, Heading, SimpleGrid, Text, Spinner, VStack, HStack,
  Badge, Skeleton,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { api } from '../api/client';
import { StatCard } from '../components/StatCard';
import { SectionCard } from '../components/SectionCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ExpiryBadge } from '../components/ExpiryBadge';


function ExpiringList({ items }) {
  if (!items?.length) {
    return <EmptyState title="Ничего не истекает" variant="success" subtitle="В ближайшие 24 часа всё спокойно" />;
  }
  return (
    <VStack align="stretch" spacing={2}>
      {items.slice(0, 5).map((b) => (
        <HStack key={b.id} justify="space-between" fontSize="sm">
          <Text color="appText" noOfLines={1}>{b.productName}</Text>
          <HStack spacing={2}>
            <Text color="appMuted" fontSize="xs">
              {b.quantity.toFixed(1)} {b.unit}
            </Text>
            <ExpiryBadge hours={b.hoursLeft} />
          </HStack>
        </HStack>
      ))}
    </VStack>
  );
}

function formatMissing(missing) {
  if (!missing?.length) return 'Недостаточно ингредиентов';

  if (typeof missing === 'string') return missing;

  const text = missing
    .map((m) => `${m.productName} — нужно ${m.need} ${m.unit}, есть ${m.have} ${m.unit}`)
    .join('; ');

  return text.startsWith('Не хватает') ? text : `Не хватает: ${text}`;
}

function scoreToPriority(score) {
  if (score >= 30) return { label: 'высокий', scheme: 'red' };
  if (score >= 10) return { label: 'средний', scheme: 'yellow' };
  return { label: 'низкий', scheme: 'green' };
}

function StoplistPreview({ items }) {
  if (!items?.length) {
    return <EmptyState title="Стоп-лист пуст" variant="success" subtitle="Все блюда доступны" />;
  }
  return (
    <VStack align="stretch" spacing={3}>
      {items.slice(0, 5).map((dish) => (
        <Box key={dish.id}>
          <HStack justify="space-between" mb={1}>
            <Text color="appText" fontSize="sm" fontWeight="500" noOfLines={1}>
              {dish.name}
            </Text>
            <Badge colorScheme="red" fontSize="xs">стоп</Badge>
          </HStack>

          {Array.isArray(dish.missing) ? (
            <VStack align="stretch" spacing={0.5} pl={2}>
              {dish.missing.slice(0, 2).map((m, i) => (
                <HStack key={i} fontSize="xs" color="appMuted" spacing={1}>
                  <Box as="span" color="red.300">•</Box>
                  <Text noOfLines={1}>
                    {m.productName}: нужно {m.need} {m.unit}, есть {m.have} {m.unit}
                  </Text>
                </HStack>
              ))}
              {dish.missing.length > 2 && (
                <Text fontSize="xs" color="appMuted" pl={3}>
                  + ещё {dish.missing.length - 2}
                </Text>
              )}
            </VStack>
          ) : (
            <Text color="appMuted" fontSize="xs" noOfLines={2}>
              {dish.reason ?? formatMissing(dish.missing)}
            </Text>
          )}
        </Box>
      ))}
    </VStack>
  );
}

function HotOffersPreview({ items }) {
  if (!items?.length) {
    return <EmptyState title="Нет рекомендаций" subtitle="Пока нечего продвигать" />;
  }
  return (
    <VStack align="stretch" spacing={2}>
      {items.slice(0, 5).map((offer) => {
        const pr = scoreToPriority(offer.score);
        return (
          <Box key={offer.id}>
            <HStack justify="space-between">
              <Text color="appText" fontSize="sm" fontWeight="500" noOfLines={1}>
                {offer.name}
              </Text>
              <Badge colorScheme={pr.scheme} fontSize="xs">
                {pr.label}
              </Badge>
            </HStack>
            <Text color="appMuted" fontSize="xs" noOfLines={2}>
              {offer.reasons?.[0] ?? ''}
            </Text>
          </Box>
        );
      })}
    </VStack>
  );
}


export default function DashboardPage() {
  const stockQuery = useQuery({ queryKey: ['stock'], queryFn: api.getStock });
  const stoplistQuery = useQuery({ queryKey: ['stoplist'], queryFn: api.getStopList });
  const hotOffersQuery = useQuery({ queryKey: ['hotOffers'], queryFn: api.getHotOffers });
  const alertsQuery = useQuery({
        queryKey: ['alerts', 24],
        queryFn: () => api.getExpiring(24),
  });
  const isLoading =
    stockQuery.isLoading || stoplistQuery.isLoading ||
    hotOffersQuery.isLoading || alertsQuery.isLoading;

  if (stockQuery.error) {
    return (
      <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
        <ErrorState
          message={stockQuery.error.message}
          onRetry={() => stockQuery.refetch()}
        />
      </Box>
    );
  }

  const stock = stockQuery.data ?? [];
  const totalItems = stock.length;
  const totalBatches = stock.reduce((s, i) => s + (i.batchesCount ?? 0), 0);
  const expiringCount = alertsQuery.data?.length ?? 0;
  const stopCount = stoplistQuery.data?.length ?? 0;

  return (
    <VStack align="stretch" spacing={6}>
      <Heading size="md" color="appText" fontWeight="600">
        Дашборд склада
      </Heading>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
        <StatCard
          label="Позиций на складе"
          value={totalItems}
          isLoading={stockQuery.isLoading}
        />
        <StatCard
          label="Партий"
          value={totalBatches}
          isLoading={stockQuery.isLoading}
        />
        <StatCard
          label="Истекает (24ч)"
          value={expiringCount}
          accent="orange.300"
          isLoading={alertsQuery.isLoading}
        />
        <StatCard
          label="В стоп-листе"
          value={stopCount}
          accent="red.300"
          isLoading={stoplistQuery.isLoading}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
        <SectionCard title="Скоро истекает" linkTo="/stock" linkLabel="Все">
          {alertsQuery.isLoading ? (
            <Skeleton height="80px" borderRadius="md" />
          ) : alertsQuery.error ? (
            <ErrorState message={alertsQuery.error.message} onRetry={() => alertsQuery.refetch()} />
          ) : (
            <ExpiringList items={alertsQuery.data} />
          )}
        </SectionCard>

        <SectionCard title="Стоп-лист" linkTo="/stoplist" linkLabel="Все">
          {stoplistQuery.isLoading ? (
            <Skeleton height="80px" borderRadius="md" />
          ) : stoplistQuery.error ? (
            <ErrorState message={stoplistQuery.error.message} onRetry={() => stoplistQuery.refetch()} />
          ) : (
            <StoplistPreview items={stoplistQuery.data} />
          )}
        </SectionCard>

        <SectionCard title="Горячие предложения" linkTo="/hot-offers" linkLabel="Все">
          {hotOffersQuery.isLoading ? (
            <Skeleton height="80px" borderRadius="md" />
          ) : hotOffersQuery.error ? (
            <ErrorState message={hotOffersQuery.error.message} onRetry={() => hotOffersQuery.refetch()} />
          ) : (
            <HotOffersPreview items={hotOffersQuery.data} />
          )}
        </SectionCard>
      </SimpleGrid>
    </VStack>
  );
}