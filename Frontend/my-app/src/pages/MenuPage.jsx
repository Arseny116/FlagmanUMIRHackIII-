import {
  Box, Heading, Text, SimpleGrid, Badge, HStack, VStack, Divider,
} from '@chakra-ui/react';
import { DISHES } from '../api/mockData';

export default function MenuPage() {
  return (
    <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <Heading size="md" mb={2} color="appText" fontWeight="600">
        Меню
      </Heading>
      <Text color="appMuted" fontSize="sm" mb={6}>
        Список блюд с составом. Позже сюда добавим корзину и проверку ингредиентов.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {DISHES.map((dish) => (
          <Box
            key={dish.id}
            p={4}
            bg="appBg"
            border="1px solid"
            borderColor="appBorder"
            borderRadius="md"
            transition="all 0.15s"
            _hover={{ borderColor: 'appAccent' }}
          >
            <HStack justify="space-between" align="start" mb={2}>
              <Heading size="sm" color="appText" fontWeight="600">
                {dish.name}
              </Heading>
              <Badge
                bg="transparent"
                color="appAccent"
                border="1px solid"
                borderColor="appAccent"
                px={2}
                py={0.5}
                borderRadius="md"
                fontSize="xs"
              >
                {dish.price} ₽
              </Badge>
            </HStack>

            <Divider my={3} borderColor="appBorder" />

            <Text fontSize="xs" color="appMuted" mb={2} fontWeight="500" letterSpacing="wide">
              СОСТАВ
            </Text>
            <VStack align="stretch" spacing={1}>
              {dish.composition.map((ing, i) => (
                <HStack key={i} justify="space-between" fontSize="sm">
                  <Text color="appText">{ing.productName || `Продукт #${ing.productId}`}</Text>
                  <Text color="appMuted">
                    {ing.quantity} {ing.unit || ''}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}