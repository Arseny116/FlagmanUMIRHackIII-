import { Box, Heading, Text } from '@chakra-ui/react';

export default function OrdersPage() {
  return (
    <Box p={5} bg="white" shadow="sm" borderRadius="md">
      <Heading size="lg" mb={2}>Заказы и Меню</Heading>
      <Text color="gray.600">Здесь будет список блюд, корзина и проверка доступности ингредиентов.</Text>
    </Box>
  );
}