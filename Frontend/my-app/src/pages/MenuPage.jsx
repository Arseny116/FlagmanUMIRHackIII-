import {
  Box, Heading, Text, SimpleGrid, Badge, HStack, VStack,
  Divider, Button, Skeleton, Tooltip, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, FormControl, FormLabel, FormErrorMessage,
  Input, Select, NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper, IconButton, Spinner,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { api } from '../api/client';
import { useCart } from '../context/useCart';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

function AddDishModal({ isOpen, onClose }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [items, setItems] = useState([{ productId: '', quantity: 0.1 }]);
  const [touched, setTouched] = useState(false);

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: api.getProducts,
    enabled: isOpen,
  });
  const products = productsQuery.data ?? [];

  const updateItem = (i, patch) =>
    setItems((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const addItem = () => setItems((r) => [...r, { productId: '', quantity: 0.1 }]);
  const removeItem = (i) => setItems((r) => r.filter((_, idx) => idx !== i));

  const errors = {
    name: touched && !name.trim() ? 'Введите название' : '',
    items: touched && !items.length ? 'Добавьте хотя бы один ингредиент' : '',
  };

  const isValid = useMemo(() => {
    return name.trim() && items.length > 0 &&
      items.every((it) => it.productId && it.quantity > 0);
  }, [name, items]);

  const createMutation = useMutation({
    mutationFn: (body) =>
      api.createDish(body),
    onSuccess: () => {
      toast({
        title: 'Блюдо создано',
        description: name,
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['dishes'] });
      queryClient.invalidateQueries({ queryKey: ['stoplist'] });
      queryClient.invalidateQueries({ queryKey: ['hotOffers'] });
      setName('');
      setPrice(0);
      setItems([{ productId: '', quantity: 0.1 }]);
      setTouched(false);
      onClose();
    },
    onError: (err) => {
      toast({
        title: 'Ошибка создания',
        description: err.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;

    createMutation.mutate({
      name: name.trim(),
      recipeItems: items.map((it) => {
        const product = products.find((p) => p.id === it.productId);
        return {
          productId: it.productId,
          productName: product?.name,
          unit: product?.unit,
          quantity: Number(it.quantity),
        };
      }),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg="cardBg" color="appText">
        <ModalHeader color="appText">Новое блюдо</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel fontSize="sm" color="appMuted">Название</FormLabel>
              <Input
                placeholder="Например, Пицца 4 сыра"
                value={name}
                onChange={(e) => setName(e.target.value)}
                bg="appBg"
                borderColor="appBorder"
                color="appText"
                _hover={{ borderColor: 'appAccent' }}
                _focus={{ borderColor: 'appAccent', boxShadow: 'none' }}
              />
              {errors.name && <FormErrorMessage fontSize="xs">{errors.name}</FormErrorMessage>}
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" color="appMuted">Цена (₽) — опционально</FormLabel>
              <NumberInput value={price} min={0} onChange={(v) => setPrice(Number(v))}>
                <NumberInputField
                  bg="appBg" borderColor="appBorder" color="appText"
                  _hover={{ borderColor: 'appAccent' }}
                  _focus={{ borderColor: 'appAccent', boxShadow: 'none' }}
                />
              </NumberInput>
            </FormControl>

            <Divider borderColor="appBorder" />

            <Text fontSize="sm" color="appMuted" fontWeight="600">ИНГРЕДИЕНТЫ</Text>

            {productsQuery.isLoading ? (
              <HStack><Spinner size="sm" /><Text color="appMuted" fontSize="sm">Загрузка...</Text></HStack>
            ) : (
              <VStack align="stretch" spacing={2}>
                {items.map((it, i) => (
                  <HStack key={i} align="flex-start" spacing={2}>
                    <FormControl flex={2}>
                      <Select
                        placeholder="Продукт"
                        value={it.productId}
                        onChange={(e) => updateItem(i, { productId: e.target.value })}
                        bg="appBg" borderColor="appBorder" color="appText"
                        _hover={{ borderColor: 'appAccent' }}
                        _focus={{ borderColor: 'appAccent', boxShadow: 'none' }}
                        sx={{
                          '& option': {
                            background: 'var(--chakra-colors-appBg)',
                            color: 'var(--chakra-colors-appText)',
                          },
                        }}
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.unit})
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl flex={1}>
                      <NumberInput
                        value={it.quantity}
                        min={0}
                        step={0.05}
                        onChange={(v) => updateItem(i, { quantity: Number(v) })}
                      >
                        <NumberInputField
                          placeholder="Кол-во"
                          bg="appBg" borderColor="appBorder" color="appText"
                          _hover={{ borderColor: 'appAccent' }}
                          _focus={{ borderColor: 'appAccent', boxShadow: 'none' }}
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper color="appMuted" borderColor="appBorder" />
                          <NumberDecrementStepper color="appMuted" borderColor="appBorder" />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <IconButton
                      aria-label="Удалить"
                      icon={<DeleteIcon />}
                      size="md" variant="ghost"
                      color="appMuted" _hover={{ color: 'red.400' }}
                      isDisabled={items.length <= 1}
                      onClick={() => removeItem(i)}
                    />
                  </HStack>
                ))}
              </VStack>
            )}

            <Button
              leftIcon={<AddIcon />}
              variant="outline" borderColor="appBorder" color="appMuted"
              _hover={{ color: 'appAccent', borderColor: 'appAccent' }}
              onClick={addItem} size="sm" alignSelf="flex-start"
            >
              Добавить ингредиент
            </Button>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" color="appMuted" mr={3} onClick={onClose}>
            Отмена
          </Button>
          <Button
            bg="appAccent" color="white" _hover={{ opacity: 0.9 }}
            isLoading={createMutation.isPending}
            loadingText="Создаём..."
            onClick={handleSubmit}
          >
            Создать
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function MenuPage() {
  const toast = useToast();
  const { add } = useCart();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
      <HStack justify="space-between" mb={2} wrap="wrap" spacing={3}>
        <Heading size="md" color="appText" fontWeight="600">Меню</Heading>
        <HStack>
          <Badge colorScheme="purple" fontSize="sm" px={2} py={1}>
            Блюд: {dishes.length}
          </Badge>
          <Button
            size="sm"
            leftIcon={<AddIcon />}
            bg="appAccent" color="white" _hover={{ opacity: 0.9 }}
            onClick={onOpen}
          >
            Добавить блюдо
          </Button>
        </HStack>
      </HStack>
      <Text color="appMuted" fontSize="sm" mb={6}>
        Выберите блюда — они попадут в корзину. Новые блюда создаются через кнопку «Добавить блюдо».
      </Text>

      {dishes.length === 0 ? (
        <EmptyState
          title="Меню пустое"
          subtitle="Добавьте первое блюдо через кнопку выше"
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
                    {isStopped && <Badge colorScheme="red" fontSize="xs">СТОП</Badge>}
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

      <AddDishModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}