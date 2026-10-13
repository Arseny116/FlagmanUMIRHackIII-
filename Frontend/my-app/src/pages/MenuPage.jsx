import {
  Box, Heading, Text, SimpleGrid, Badge, HStack, VStack,
  Divider, Button, Skeleton, Tooltip, useToast 
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useCart } from '../context/useCart';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';




export default function MenuPage() {
  const toast = useToast();
  const { add } = useCart();

  const dishesQuery = useQuery({
    queryKey: ['dishes'],
    queryFn: api.getDishes,
  });

  const stoplistQuery = useQuery({
    queryKey: ['stoplist'],
    queryFn: api.getStopList,
  });

  const stopIds = new Set((stoplistQuery.data ?? []).map((d) => d.id));

  if (dishesQuery.isLoading) {
    return (
      <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
        <Skeleton height="32px" width="200px" mb={6} />
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Skeleton height="220px" borderRadius="md" />
          <Skeleton height="220px" borderRadius="md" />
          <Skeleton height="220px" borderRadius="md" />
          <Skeleton height="220px" borderRadius="md" />
        </SimpleGrid>
      </Box>
    );
  }

  if (dishesQuery.error) {
    return (
      <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
        <ErrorState
          message={dishesQuery.error.message}
          onRetry={() => dishesQuery.refetch()}
        />
      </Box>
    );
  }

  const dishes = dishesQuery.data ?? [];

  return (
    <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <HStack justify="space-between" mb={2}>
        <Heading size="md" color="appText" fontWeight="600">
          Меню
        </Heading>
        <Badge colorScheme="purple" fontSize="sm" px={2} py={1}>
          Блюд: {dishes.length}
        </Badge>
      </HStack>
      <Text color="appMuted" fontSize="sm" mb={6}>
        Выберите блюда — они попадут в корзину на странице «Заказы».
      </Text>

      {dishes.length === 0 ? (
        <EmptyState
          title="Меню пустое"
          subtitle="Блюда ещё не созданы. Попросите администратора добавить их."
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {dishes.map((dish) => {
            const isStopped = stopIds.has(dish.id);
            return (
              <Box
                key={dish.id}
                p={4}
                bg="appBg"
                border="1px solid"
                borderColor={isStopped ? 'red.800' : 'appBorder'}
                borderRadius="md"
                transition="all 0.15s"
                _hover={{ borderColor: isStopped ? 'red.500' : 'appAccent' }}
                opacity={isStopped ? 0.65 : 1}
              >
                <HStack justify="space-between" align="start" mb={2}>
                  <Heading size="sm" color="appText" fontWeight="600">
                    {dish.name}
                  </Heading>
                  <HStack spacing={2}>
                    {dish.price > 0 && (
                      <Badge
                        bg="transparent" color="appAccent"
                        border="1px solid" borderColor="appAccent"
                        px={2} py={0.5} borderRadius="md" fontSize="xs"
                      >
                        {dish.price} ₽
                      </Badge>
                    )}
                    {isStopped && (
                      <Badge colorScheme="red" fontSize="xs">СТОП</Badge>
                    )}
                  </HStack>
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

                <Tooltip
                  label={isStopped ? 'Блюдо в стоп-листе — не хватает ингредиентов' : ''}
                  hasArrow
                  isDisabled={!isStopped}
                >
                  <Button
                    size="sm"
                    width="full"
                    leftIcon={<AddIcon />}
                    bg={isStopped ? 'gray.600' : 'appAccent'}
                    color="white"
                    _hover={{ opacity: isStopped ? 1 : 0.9 }}
                    isDisabled={isStopped}
                    onClick={() => {
                      add(dish);
                      toast({
                        title: 'Добавлено в заказ',
                        description: dish.name,
                        status: 'success',
                        duration: 1500,
                        isClosable: true,
                        position: 'bottom-right',
                        });
                      }}
                  >
                    {isStopped ? 'Недоступно' : 'В заказ'}
                  </Button>
                </Tooltip>
              </Box>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}