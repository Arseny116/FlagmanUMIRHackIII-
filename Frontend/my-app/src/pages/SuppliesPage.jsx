import {
  Box, Heading, Text, VStack, HStack, Button, Input, Select,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, IconButton, Table, Thead, Tbody, Tr, Th, Td,
  Divider, useToast, Skeleton, FormControl, FormLabel, FormErrorMessage, Spinner,
  useBreakpointValue, useColorModeValue,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, RepeatIcon } from '@chakra-ui/icons';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { useSearchParams } from 'react-router-dom';

const emptyRow = () => ({ productId: '', quantity: 1, shelfLifeHours: 24 });

const generateSupplyNumber = () =>
  `SUP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 9000 + 1000)}`;

function Row({ row, index, onChange, onRemove, canRemove, touched, products }) {
  const optionBg = useColorModeValue('#ffffff', '#1a1a1a');
  const optionColor = useColorModeValue('#1a1a1a', '#e4e4e7');

  const errors = {
    productId: touched && !row.productId ? 'Выберите продукт' : '',
    quantity: touched && (row.quantity === '' || Number(row.quantity) <= 0) ? 'Должно быть > 0' : '',
    shelfLifeHours: touched && (row.shelfLifeHours === '' || Number(row.shelfLifeHours) <= 0) ? 'Укажите срок' : '',
  };

  return (
    <HStack align="flex-start" spacing={3}>
      <FormControl isInvalid={!!errors.productId} flex={2}>
        <FormLabel fontSize="xs" color="appMuted" mb={1}>Продукт</FormLabel>
        <Select
          placeholder="Выберите"
          value={row.productId}
          onChange={(e) => onChange(index, { productId: e.target.value })}
          bg="appBg"
          borderColor="appBorder"
          color="appText"
          _hover={{ borderColor: 'appAccent' }}
          _focus={{ borderColor: 'appAccent', boxShadow: 'none' }}
        >
          {products.map((p) => (
            <option
              key={p.id}
              value={p.id}
              style={{ background: optionBg, color: optionColor }}
            >
              {p.name} ({p.unit})
            </option>
          ))}
        </Select>
        {errors.productId && <FormErrorMessage fontSize="xs">{errors.productId}</FormErrorMessage>}
      </FormControl>

      <FormControl isInvalid={!!errors.quantity} flex={1}>
        <FormLabel fontSize="xs" color="appMuted" mb={1}>Кол-во</FormLabel>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={row.quantity}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '') {
              onChange(index, { quantity: '' });
              return;
            }
            if (!/^\d*\.?\d*$/.test(v)) return;
            onChange(index, { quantity: v });
          }}
          bg="appBg"
          borderColor="appBorder"
          color="appText"
          _hover={{ borderColor: 'appAccent' }}
          _focus={{ borderColor: 'appAccent', boxShadow: 'none' }}
        />
        {errors.quantity && <FormErrorMessage fontSize="xs">{errors.quantity}</FormErrorMessage>}
      </FormControl>

      <FormControl isInvalid={!!errors.shelfLifeHours} flex={1}>
        <FormLabel fontSize="xs" color="appMuted" mb={1}>Срок, ч</FormLabel>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="24"
          value={row.shelfLifeHours}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '') {
              onChange(index, { shelfLifeHours: '' });
              return;
            }
            if (!/^\d*$/.test(v)) return;
            onChange(index, { shelfLifeHours: v });
          }}
          bg="appBg"
          borderColor="appBorder"
          color="appText"
          _hover={{ borderColor: 'appAccent' }}
          _focus={{ borderColor: 'appAccent', boxShadow: 'none' }}
        />
        {errors.shelfLifeHours && <FormErrorMessage fontSize="xs">{errors.shelfLifeHours}</FormErrorMessage>}
      </FormControl>

      <IconButton
        aria-label="Удалить строку"
        icon={<DeleteIcon />}
        size="md"
        variant="ghost"
        color="appMuted"
        _hover={{ color: 'red.400' }}
        isDisabled={!canRemove}
        onClick={() => onRemove(index)}
        mt={6}
      />
    </HStack>
  );
}

function AddProductModal({ isOpen, onClose, onCreated }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('кг');
  const [touched, setTouched] = useState(false);

  const createMutation = useMutation({
    mutationFn: (body) => api.createProduct(body),
    onSuccess: (product) => {
      toast({
        title: 'Продукт создан',
        description: `${product.name} (${product.unit})`,
        status: 'success',
        duration: 3000,
      });
      setName('');
      setUnit('кг');
      setTouched(false);
      onCreated?.();
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

  const errors = {
    name: touched && !name.trim() ? 'Введите название' : '',
    unit: touched && !unit.trim() ? 'Введите единицу' : '',
  };

  const handleSubmit = () => {
    setTouched(true);
    if (!name.trim() || !unit.trim()) return;
    createMutation.mutate({ name: name.trim(), unit: unit.trim() });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="cardBg" color="appText">
        <ModalHeader color="appText">Новый продукт</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <FormControl isInvalid={!!errors.name}>
              <Text fontSize="sm" color="appMuted" mb={2}>Название</Text>
              <Input
                placeholder="Например, Грибы"
                value={name}
                onChange={(e) => setName(e.target.value)}
                bg="appBg" borderColor="appBorder" color="appText"
                _hover={{ borderColor: 'appAccent' }}
                _focus={{ borderColor: 'appAccent', boxShadow: 'none' }}
              />
              {errors.name && <FormErrorMessage fontSize="xs">{errors.name}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.unit}>
              <Text fontSize="sm" color="appMuted" mb={2}>Единица измерения</Text>
              <Select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
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
                <option value="кг">кг</option>
                <option value="г">г</option>
                <option value="л">л</option>
                <option value="мл">мл</option>
                <option value="шт">шт</option>
              </Select>
              {errors.unit && <FormErrorMessage fontSize="xs">{errors.unit}</FormErrorMessage>}
            </FormControl>
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

function SupplyForm({ onCreated }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const preselectedProductId = searchParams.get('productId') ?? '';

  const [number, setNumber] = useState(generateSupplyNumber());
  const [rows, setRows] = useState([
    { productId: preselectedProductId, quantity: 1, shelfLifeHours: 24 },
  ]);
  const [touched, setTouched] = useState(false);

  const productsQuery = useQuery({ queryKey: ['products'], queryFn: api.getProducts });
  const products = productsQuery.data ?? [];

  const updateRow = (i, patch) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const addRow = () => setRows((r) => [...r, emptyRow()]);
  const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));

  const isValid = useMemo(() => {
    return rows.length > 0 && rows.every(
      (r) =>
        r.productId &&
        r.quantity !== '' && Number(r.quantity) > 0 && Number(r.quantity) <= 1000 &&
        r.shelfLifeHours !== '' && Number(r.shelfLifeHours) > 0 && Number(r.shelfLifeHours) <= 8760
    );
  }, [rows]);

  const createMutation = useMutation({
    mutationFn: (body) => api.createSupply(body),
    onSuccess: () => {
      toast({
        title: 'Поставка принята',
        description: `Создано партий: ${rows.length}`,
        status: 'success',
        duration: 3000,
      });
      setRows([{ productId: preselectedProductId, quantity: 1, shelfLifeHours: 24 }]);
      setNumber(generateSupplyNumber());
      setTouched(false);
      onCreated?.();
    },
    onError: (err) => {
      toast({
        title: 'Ошибка поставки',
        description: err.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;

    const items = rows.map((r) => {
      const product = products.find((p) => p.id === r.productId);
      return {
        productId: r.productId,
        name: product?.name ?? 'Неизвестно',
        unit: product?.unit ?? 'шт',
        quantity: Number(r.quantity),
        shelfLifeHours: Number(r.shelfLifeHours),
      };
    });

    createMutation.mutate({
      id: crypto.randomUUID(),
      number: number.trim() || undefined,
      items,
    });
  };

  return (
    <Box>
      <VStack align="stretch" spacing={3} mb={4}>
        <HStack justify="space-between" mb={2} wrap="wrap" spacing={2}>
          <Heading size="sm" color="appText" fontWeight="600">
            Новая поставка
          </Heading>
          <HStack spacing={2}>
            <Text color="appMuted" fontSize="xs">
              Номер можно оставить пустым
            </Text>
            <Button
              size="xs"
              leftIcon={<AddIcon />}
              variant="outline"
              borderColor="appBorder"
              color="appMuted"
              _hover={{ color: 'appAccent', borderColor: 'appAccent' }}
              onClick={onOpen}
            >
              Добавить продукт
            </Button>
          </HStack>
        </HStack>

        <FormControl>
          <FormLabel fontSize="xs" color="appMuted" mb={1}>Номер поставки</FormLabel>
          <HStack>
            <Input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              bg="appBg"
              borderColor="appBorder"
              color="appText"
              flex={1}
              _hover={{ borderColor: 'appAccent' }}
              _focus={{ borderColor: 'appAccent', boxShadow: 'none' }}
            />
            <IconButton
              aria-label="Сгенерировать номер"
              icon={<RepeatIcon />}
              variant="outline"
              borderColor="appBorder"
              color="appMuted"
              _hover={{ color: 'appAccent', borderColor: 'appAccent' }}
              onClick={() => setNumber(generateSupplyNumber())}
            />
          </HStack>
        </FormControl>

        <Divider borderColor="appBorder" my={2} />

        {productsQuery.isLoading ? (
          <HStack><Spinner size="sm" /><Text color="appMuted" fontSize="sm">Загрузка продуктов...</Text></HStack>
        ) : productsQuery.error ? (
          <ErrorState message={productsQuery.error.message} onRetry={() => productsQuery.refetch()} />
        ) : (
          <VStack align="stretch" spacing={3}>
            {rows.map((row, i) => (
              <Row
                key={i}
                row={row}
                index={i}
                onChange={updateRow}
                onRemove={removeRow}
                canRemove={rows.length > 1}
                touched={touched}
                products={products}
              />
            ))}
          </VStack>
        )}

        <Button
          leftIcon={<AddIcon />}
          variant="outline"
          borderColor="appBorder"
          color="appMuted"
          _hover={{ color: 'appAccent', borderColor: 'appAccent' }}
          onClick={addRow}
          size="sm"
          alignSelf="flex-start"
          isDisabled={productsQuery.isLoading}
        >
          Добавить строку
        </Button>
      </VStack>

      <Button
        width="full"
        bg="appAccent"
        color="white"
        _hover={{ opacity: 0.9 }}
        isLoading={createMutation.isPending}
        loadingText="Оформляем..."
        onClick={handleSubmit}
        isDisabled={productsQuery.isLoading}
      >
        Оформить поставку
      </Button>

      <AddProductModal
        isOpen={isOpen}
        onClose={onClose}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['stock'] });
        }}
      />
    </Box>
  );
}

function SupplyHistory() {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['supplies'],
    queryFn: api.getSupplies,
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
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!data?.length) {
    return <EmptyState title="Поставок пока нет" subtitle="Создайте первую через форму выше" />;
  }

  if (isMobile) {
    return (
      <VStack align="stretch" spacing={2}>
        {data.map((s) => (
          <Box key={s.id} p={3} bg="appBg" border="1px solid" borderColor="appBorder" borderRadius="md">
            <HStack justify="space-between" mb={1}>
              <Text color="appText" fontWeight="600">{s.number}</Text>
              <Text color="appMuted" fontSize="xs">{s.batchesCount} партий</Text>
            </HStack>
            <Text color="appMuted" fontSize="sm">
              {new Date(s.createdAt).toLocaleString('ru-RU')}
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
          <Th isNumeric borderColor="appBorder" color="appMuted">Партий</Th>
          <Th isNumeric borderColor="appBorder" color="appMuted">Всего</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((s) => (
          <Tr key={s.id} borderColor="appBorder">
            <Td borderColor="appBorder" color="appText" fontWeight="500">{s.number}</Td>
            <Td borderColor="appBorder" color="appMuted" fontSize="sm">
              {new Date(s.createdAt).toLocaleString('ru-RU', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
              })}
            </Td>
            <Td isNumeric borderColor="appBorder" color="appMuted">{s.batchesCount}</Td>
            <Td isNumeric borderColor="appBorder" color="appText">
              {s.totalQuantity?.toFixed(2) ?? '—'}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default function SuppliesPage() {
  const queryClient = useQueryClient();

  const handleCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['supplies'] });
    queryClient.invalidateQueries({ queryKey: ['stock'] });
    queryClient.invalidateQueries({ queryKey: ['batches'] });
    queryClient.invalidateQueries({ queryKey: ['stoplist'] });
    queryClient.invalidateQueries({ queryKey: ['hotOffers'] });
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  return (
    <VStack align="stretch" spacing={6}>
      <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
        <SupplyForm onCreated={handleCreated} />
      </Box>

      <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
        <Heading size="sm" color="appText" fontWeight="600" mb={4}>
          История поставок
        </Heading>
        <SupplyHistory />
      </Box>
    </VStack>
  );
}