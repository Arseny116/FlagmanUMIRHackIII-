import {
  Box, Heading, Text, SimpleGrid, Badge, HStack, VStack,
  Divider, Button,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { DISHES } from '../api/mockData';
import { useCart } from '../context/useCart';

export default function MenuPage() {
  const { add } = useCart();

  return (
    <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <Heading size="md" mb={2} color="appText" fontWeight="600">
        Меню
      </Heading>
      <Text color="appMuted" fontSize="sm" mb={6}>
        Выберите блюда — они попадут в корзину на странице «Заказы».
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
              <Heading size="sm" color="appText" fontWeight="600">{dish.name}</Heading>
              <Badge
                bg="transparent" color="appAccent"
                border="1px solid" borderColor="appAccent"
                px={2} py={0.5} borderRadius="md" fontSize="xs"
              >
                {dish.price} ₽
              </Badge>
            </HStack>

            <Divider my={3} borderColor="appBorder" />

            <Text fontSize="xs" color="appMuted" mb={2} fontWeight="500" letterSpacing="wide">
              СОСТАВ
            </Text>
            <VStack align="stretch" spacing={1} mb={4}>
              {dish.composition.map((ing, i) => (
                <HStack key={i} justify="space-between" fontSize="sm">
                  <Text color="appText">{ing.productName}</Text>
                  <Text color="appMuted">{ing.quantity} {ing.unit}</Text>
                </HStack>
              ))}
            </VStack>

            <Button
              size="sm" width="full"
              leftIcon={<AddIcon />}
              bg="appAccent" color="white"
              _hover={{ opacity: 0.9 }}
              onClick={() => add(dish)}
            >
              В заказ
            </Button>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}