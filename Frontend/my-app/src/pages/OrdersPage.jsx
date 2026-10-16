import {
  Box, Heading, Text, VStack, HStack, Button, Divider,
  IconButton, useToast, Badge, useBreakpointValue, Skeleton, Table,
  Thead, Tbody, Tr, Th, Td,
  NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon, DeleteIcon } from '@chakra-ui/icons';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useCart } from '../context/useCart';
import { api } from '../api/client';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

function OrderRejectionBody({ missing }) {
  if (!Array.isArray(missing) || missing.length === 0) {
    return <Text fontSize="sm">Не хватает ингредиентов</Text>;
  }
  return (
    <VStack align="stretch" spacing={2} mt={1}>
      {missing.map((m, i) => (
        <HStack key={i} align="flex-start" spacing={2}>
          <Box as="span" color="red.500" fontWeight="bold" lineHeight="1.2">•</Box>
          <Box>
            <Text fontSize="sm" fontWeight="600" color="gray.800">
              {m.productName ?? m.productId ?? 'Ингредиент'}
            </Text>
            <HStack spacing={3} fontSize="xs" color="gray.600">
              <Text>нужно: <b>{m.need ?? m.quantity ?? '?'} {m.unit ?? ''}</b></Text>
              <Text>есть: <b>{m.have ?? 0} {m.unit ?? ''}</b></Text>
            </HStack>
          </Box>
        </HStack>
      ))}
    </VStack>
  );
}

function OrderHistory() {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: api.getOrders,
  });

  if (isLoading) {
    return (
      <VStack align="stretch" spacing={2}>
        <Skeleton height="40px" borderRadius="md" />
        <Skeleton height="40px" borderRadius="md" />
        <Skeleton height="40px" borderRadius="md" />
      </VStack>
    );
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={refetch} />;
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="История пуста"
        subtitle="Заказы появятся здесь после оформления. Бэк пока не отдаёт список — эндпоинт в разработке."
      />
    );
  }

  if (isMobile) {
    return (
      <VStack align="stretch" spacing={2}>
        {data.map((o) => (
          <Box key={o.id} p={3} bg="appBg" border="1px solid" borderColor="appBorder" borderRadius="md">
            <HStack justify="space-between" mb={1}>
              <Text color="appText" fontWeight="600">
                {o.number ?? `#${o.id?.slice(0, 8)}`}
              </Text>
              <Badge colorScheme={o.status === 'cancelled' ? 'red' : 'green'} fontSize="xs">
                {o.status ?? 'оформлен'}
              </Badge>
            </HStack>
            <Text color="appMuted" fontSize="sm">
              {o.createdAt ? new Date(o.createdAt).toLocaleString('ru-RU') : '—'}
            </Text>
          </Box>
        ))}
      </VStack>
    );
  }

  return (
    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          <Th borderColor="appBorder" color="appMuted">Номер</Th>
          <Th borderColor="appBorder" color="appMuted">Дата</Th>
          <Th borderColor="appBorder" color="appMuted">Статус</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((o) => (
          <Tr key={o.id} borderColor="appBorder">
            <Td borderColor="appBorder" color="appText" fontWeight="500">
              {o.number ?? `#${o.id?.slice(0, 8)}`}
            </Td>
            <Td borderColor="appBorder" color="appMuted" fontSize="sm">
              {o.createdAt ? new Date(o.createdAt).toLocaleString('ru-RU') : '—'}
            </Td>
            <Td borderColor="appBorder">
              <Badge colorScheme={o.status === 'cancelled' ? 'red' : 'green'} fontSize="xs">
                {o.status ?? 'оформлен'}
              </Badge>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

function CartSection() {
  const { items, remove, setQuantity, clear, count } = useCart();
  const toast = useToast();
  const queryClient = useQueryClient();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const orderMutation = useMutation({
    mutationFn: (cartItems) =>
      api.createOrderBatch(cartItems.map((i) => ({ dishId: i.dishId, quantity: i.quantity }))),

    onSuccess: (res) => {
      if (!res.ok) {
        toast({
          title: 'Заказ отклонён',
          description: <OrderRejectionBody missing={res.missing ?? []} />,
          status: 'error', duration: 8000, isClosable: true, position: 'top-right',
        });
        return;
      }
      toast({
        title: 'Заказ оформлен',
        description: `Позиций: ${res.orders.length}`,
        status: 'success', duration: 3000, position: 'top-right',
      });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['stoplist'] });
      queryClient.invalidateQueries({ queryKey: ['hotOffers'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      clear();
    },
    onError: (err) => {
      toast({ title: 'Ошибка сети', description: err.message, status: 'error', duration: 5000 });
    },
  });

  const submitOrder = () => { if (items.length) orderMutation.mutate(items); };

  if (items.length === 0) {
    return (
      <EmptyState
        title="Корзина пуста"
        subtitle="Добавьте блюда на странице «Меню»"
      />
    );
  }

  const isPending = orderMutation.isPending;

  return (
    <Box>
     <VStack align="stretch" spacing={3} divider={<Divider borderColor="appBorder" />}>
        {items.map((item) => (
          <Box key={item.dishId} py={2}>
            {isMobile ? (
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text color="appText" fontWeight="500">{item.name}</Text>
                  <IconButton
                    aria-label="Удалить" icon={<DeleteIcon />} size="xs" variant="ghost"
                    color="appMuted" _hover={{ color: 'red.400' }}
                    isDisabled={isPending} onClick={() => remove(item.dishId)}
                  />
                </HStack>
                <NumberInput
                  size="xs"
                  maxW="100px"
                  min={1}
                  step={1}
                  precision={0}
                  value={item.quantity}
                  onChange={(v) => {
                    const n = Number(v);
                    if (Number.isFinite(n) && n > 0) {
                      setQuantity(item.dishId, n);
                    }
                  }}
                  isDisabled={isPending}
                >
                  <NumberInputField
                    bg="appBg"
                    borderColor="appBorder"
                    color="appText"
                    _hover={{ borderColor: 'appAccent' }}
                    _focus={{ borderColor: 'appAccent', boxShadow: 'none' }}
                    textAlign="center"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper color="appMuted" borderColor="appBorder" />
                    <NumberDecrementStepper color="appMuted" borderColor="appBorder" />
                  </NumberInputStepper>
                </NumberInput>
              </VStack>
            ) : (
              <HStack justify="space-between">
                <Text color="appText" fontWeight="500" flex={1}>{item.name}</Text>

                <HStack spacing={2}>
                  <NumberInput
                    size="xs"
                    maxW="80px"
                    min={1}
                    step={1}
                    precision={0}
                    value={item.quantity}
                    onChange={(v) => {
                      const n = Number(v);
                      if (Number.isFinite(n) && n > 0) {
                        setQuantity(item.dishId, n);
                      }
                    }}
                    isDisabled={isPending}
                  >
                    <NumberInputField
                      bg="appBg"
                      borderColor="appBorder"
                      color="appText"
                      _hover={{ borderColor: 'appAccent' }}
                      _focus={{ borderColor: 'appAccent', boxShadow: 'none' }}
                      textAlign="center"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper color="appMuted" borderColor="appBorder" />
                      <NumberDecrementStepper color="appMuted" borderColor="appBorder" />
                    </NumberInputStepper>
                  </NumberInput>

                  <IconButton
                    aria-label="Удалить" icon={<DeleteIcon />} size="xs" variant="ghost"
                    color="appMuted" _hover={{ color: 'red.400' }}
                    isDisabled={isPending} onClick={() => remove(item.dishId)}
                  />
                </HStack>
              </HStack>
            )}
          </Box>
        ))}
      </VStack>

      <Divider my={4} borderColor="appBorder" />

      <HStack justify="space-between" mb={4}>
        <Text color="appMuted">Позиций: {count}</Text>
      </HStack>

      <Button
        width="full" bg="appAccent" color="white" _hover={{ opacity: 0.9 }}
        isLoading={isPending} loadingText="Оформляем..."
        onClick={submitOrder}
      >
        Оформить заказ
      </Button>
    </Box>
  );
}

export default function OrdersPage() {
  const { count } = useCart();

  return (
    <VStack align="stretch" spacing={6}>
      <Box p={{ base: 4, md: 6 }} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
        <HStack justify="space-between" mb={4}>
          <Heading size="md" color="appText" fontWeight="600">Корзина</Heading>
          <Badge colorScheme="purple" fontSize="sm" px={2} py={1}>{count} шт</Badge>
        </HStack>
        <CartSection />
      </Box>

      <Box p={{ base: 4, md: 6 }} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
        <Heading size="sm" color="appText" fontWeight="600" mb={4}>История заказов</Heading>
        <OrderHistory />
      </Box>
    </VStack>
  );
}