import { Box, Heading, Text } from '@chakra-ui/react';

export default function OrdersPage() {
  return (
    <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <Heading size="md" mb={2} color="appText" fontWeight="600">
        Заказы и меню
      </Heading>
      <Text color="appMuted" fontSize="sm">
        Здесь будет список блюд, корзина и проверка доступности ингредиентов.
      </Text>
    </Box>
  );
}