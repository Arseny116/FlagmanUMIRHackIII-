import {
  Box, Heading, Text, VStack, HStack, Button, Divider,
  IconButton, useToast, Badge, useBreakpointValue,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon, DeleteIcon } from '@chakra-ui/icons';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useCart } from '../context/useCart';
import { api } from '../api/client';

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

export default function OrdersPage() {
  const { items, remove, setQuantity, clear, total, count } = useCart();
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
      <Box p={{ base: 4, md: 6 }} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
        <Heading size="md" mb={2} color="appText" fontWeight="600">Корзина</Heading>
        <Text color="appMuted" fontSize="sm">Корзина пуста. Добавьте блюда на странице «Меню».</Text>
      </Box>
    );
  }

  const isPending = orderMutation.isPending;

  return (
    <Box p={{ base: 4, md: 6 }} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <HStack justify="space-between" mb={4}>
        <Heading size="md" color="appText" fontWeight="600">Корзина</Heading>
        <Badge colorScheme="purple" fontSize="sm" px={2} py={1}>{count} шт</Badge>
      </HStack>

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
                <HStack justify="space-between">
                  <HStack>
                    <IconButton
                      aria-label="Уменьшить" icon={<MinusIcon />} size="xs" variant="outline"
                      borderColor="appBorder" color="appText" isDisabled={isPending}
                      onClick={() => setQuantity(item.dishId, item.quantity - 1)}
                    />
                    <Text color="appText" minW="30px" textAlign="center">{item.quantity}</Text>
                    <IconButton
                      aria-label="Увеличить" icon={<AddIcon />} size="xs" variant="outline"
                      borderColor="appBorder" color="appText" isDisabled={isPending}
                      onClick={() => setQuantity(item.dishId, item.quantity + 1)}
                    />
                  </HStack>
                  <Text color="appText" fontWeight="600">{item.price * item.quantity} ₽</Text>
                </HStack>
              </VStack>
            ) : (
              <HStack justify="space-between">
                <Box flex={1}>
                  <Text color="appText" fontWeight="500">{item.name}</Text>
                  <Text color="appMuted" fontSize="sm">{item.price} ₽ / шт</Text>
                </Box>
                <HStack>
                  <IconButton
                    aria-label="Уменьшить" icon={<MinusIcon />} size="xs" variant="outline"
                    borderColor="appBorder" color="appText" isDisabled={isPending}
                    onClick={() => setQuantity(item.dishId, item.quantity - 1)}
                  />
                  <Text color="appText" minW="30px" textAlign="center">{item.quantity}</Text>
                  <IconButton
                    aria-label="Увеличить" icon={<AddIcon />} size="xs" variant="outline"
                    borderColor="appBorder" color="appText" isDisabled={isPending}
                    onClick={() => setQuantity(item.dishId, item.quantity + 1)}
                  />
                  <IconButton
                    aria-label="Удалить" icon={<DeleteIcon />} size="xs" variant="ghost"
                    color="appMuted" _hover={{ color: 'red.400' }}
                    isDisabled={isPending} onClick={() => remove(item.dishId)}
                  />
                </HStack>
                <Text color="appText" minW="90px" textAlign="right" fontWeight="600">
                  {item.price * item.quantity} ₽
                </Text>
              </HStack>
            )}
          </Box>
        ))}
      </VStack>

      <Divider my={4} borderColor="appBorder" />

      <HStack justify="space-between" mb={4}>
        <Text color="appMuted">Позиций: {count}</Text>
        <Text color="appText" fontWeight="600" fontSize="lg">Итого: {total} ₽</Text>
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