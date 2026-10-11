import {
  Box, Heading, Text, VStack, HStack, Button, Divider,
  IconButton, useToast,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon, DeleteIcon } from '@chakra-ui/icons';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useCart } from '../context/useCart';
import { api } from '../api/client';

export default function OrdersPage() {
  const { items, remove, setQuantity, clear, total, count } = useCart();
  const toast = useToast();
  const queryClient = useQueryClient();

  const orderMutation = useMutation({
    mutationFn: async (cartItems) => {
      const results = [];
      for (const item of cartItems) {
        const res = await api.createOrder({ dishId: item.dishId, quantity: item.quantity });
        results.push({ item, res });
      }
      return results;
    },
    onSuccess: (results) => {
    const failed = results.filter(({ res }) => !res.ok);
    if (failed.length > 0) {
      const text = failed
        .map(({ item, res }) =>
          `${item.name}: не хватает ${res.missing.map((m) => `${m.productName} (нужно ${m.need} ${m.unit}, есть ${m.have} ${m.unit})`).join(', ')}`
        )
        .join('; ');
      toast({ title: 'Заказ отклонён', description: text, status: 'error', duration: 6000, isClosable: true });
      const failedIds = new Set(failed.map(({ item }) => item.dishId));
      return;
    }
    toast({ title: 'Заказ оформлен', status: 'success', duration: 3000 });
    queryClient.invalidateQueries({ queryKey: ['stock'] });
    queryClient.invalidateQueries({ queryKey: ['batches'] });
    queryClient.invalidateQueries({ queryKey: ['stoplist'] });
    queryClient.invalidateQueries({ queryKey: ['hotOffers'] });
    clear();
  },
});

  const submitOrder = () => {
    for (const item of items) {
      orderMutation.mutate({ dishId: item.dishId, quantity: item.quantity });
    }
  };

  if (items.length === 0) {
    return (
      <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
        <Heading size="md" mb={2} color="appText" fontWeight="600">
          Заказы и меню
        </Heading>
        <Text color="appMuted" fontSize="sm">
          Корзина пуста. Добавьте блюда на странице «Меню».
        </Text>
      </Box>
    );
  }

  return (
    <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <Heading size="md" mb={4} color="appText" fontWeight="600">
        Корзина
      </Heading>

      <VStack align="stretch" spacing={3} divider={<Divider borderColor="appBorder" />}>
        {items.map((item) => (
          <HStack key={item.dishId} justify="space-between" py={2}>
            <Box flex={1}>
              <Text color="appText" fontWeight="500">{item.name}</Text>
              <Text color="appMuted" fontSize="sm">{item.price} ₽ / шт</Text>
            </Box>

            <HStack>
              <IconButton
                aria-label="Уменьшить"
                icon={<MinusIcon />}
                size="xs"
                variant="outline"
                borderColor="appBorder"
                color="appText"
                onClick={() => setQuantity(item.dishId, item.quantity - 1)}
              />
              <Text color="appText" minW="30px" textAlign="center">
                {item.quantity}
              </Text>
              <IconButton
                aria-label="Увеличить"
                icon={<AddIcon />}
                size="xs"
                variant="outline"
                borderColor="appBorder"
                color="appText"
                onClick={() => setQuantity(item.dishId, item.quantity + 1)}
              />
              <IconButton
                aria-label="Удалить"
                icon={<DeleteIcon />}
                size="xs"
                variant="ghost"
                color="appMuted"
                _hover={{ color: 'red.400' }}
                onClick={() => remove(item.dishId)}
              />
            </HStack>

            <Text color="appText" minW="90px" textAlign="right" fontWeight="600">
              {item.price * item.quantity} ₽
            </Text>
          </HStack>
        ))}
      </VStack>

      <Divider my={4} borderColor="appBorder" />

      <HStack justify="space-between" mb={4}>
        <Text color="appMuted">Позиций: {count}</Text>
        <Text color="appText" fontWeight="600" fontSize="lg">Итого: {total} ₽</Text>
      </HStack>

      <Button
        width="full"
        bg="appAccent"
        color="white"
        _hover={{ opacity: 0.9 }}
        isLoading={orderMutation.isPending}
        loadingText="Оформляем..."
        onClick={submitOrder}
      >
        Оформить заказ
      </Button>
    </Box>
  );
}