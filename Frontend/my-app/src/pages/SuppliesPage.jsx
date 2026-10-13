import {
  Box, Heading, Text, VStack, HStack, Button, Input, Select,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, IconButton, Table, Thead, Tbody, Tr, Th, Td,
  Divider, useToast, Skeleton, FormControl, FormErrorMessage, Spinner, 
} from '@chakra-ui/react';
import {  AddIcon, DeleteIcon, RepeatIcon  } from '@chakra-ui/icons';
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
  
  const errors = {
    productId: touched && !row.productId ? 'Выберите продукт' : '',
    quantity: touched && (!row.quantity || row.quantity <= 0) ? 'Должно быть > 0' : '',
    shelfLifeHours: touched && (!row.shelfLifeHours || row.shelfLifeHours <= 0) ? 'Укажите срок' : '',
  };

  return (
    <HStack align="flex-start" spacing={3}>
      <FormControl isInvalid={!!errors.productId} flex={2}>
        <Select
          placeholder="Продукт"
          value={row.productId}
          onChange={(e) => onChange(index, { productId: e.target.value })}
          bg="appBg"
          borderColor="appBorder"
          color="appText"
          _hover={{ borderColor: 'appAccent' }}
          _focus={{ borderColor: 'appAccent', boxShadow: 'none' }}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id} style={{ background: '#1a1a1a' }}>
              {p.name} ({p.unit})
            </option>
          ))}
        </Select>
        {errors.productId && <FormErrorMessage fontSize="xs">{errors.productId}</FormErrorMessage>}
      </FormControl>

      <FormControl isInvalid={!!errors.quantity} flex={1}>
        <NumberInput
          value={row.quantity}
          min={0}
          step={0.1}
          onChange={(v) => onChange(index, { quantity: Number(v) })}
        >
          <NumberInputField
            placeholder="Кол-во"
            bg="appBg"
            borderColor="appBorder"
            color="appText"
            _hover={{ borderColor: 'appAccent' }}
            _focus={{ borderColor: 'appAccent', boxShadow: 'none' }}
          />
          <NumberInputStepper>
            <NumberIncrementStepper color="appMuted" borderColor="appBorder" />
            <NumberDecrementStepper color="appMuted" borderColor="appBorder" />
          </NumberInputStepper>
        </NumberInput>
        {errors.quantity && <FormErrorMessage fontSize="xs">{errors.quantity}</FormErrorMessage>}
      </FormControl>

      <FormControl isInvalid={!!errors.shelfLifeHours} flex={1}>
        <NumberInput
          value={row.shelfLifeHours}
          min={1}
          step={1}
          onChange={(v) => onChange(index, { shelfLifeHours: Number(v) })}
        >
          <NumberInputField
            placeholder="Срок, ч"
            bg="appBg"
            borderColor="appBorder"
            color="appText"
            _hover={{ borderColor: 'appAccent' }}
            _focus={{ borderColor: 'appAccent', boxShadow: 'none' }}
          />
          <NumberInputStepper>
            <NumberIncrementStepper color="appMuted" borderColor="appBorder" />
            <NumberDecrementStepper color="appMuted" borderColor="appBorder" />
          </NumberInputStepper>
        </NumberInput>
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
      />
    </HStack>
  );
}

function SupplyForm({ onCreated }) {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const preselectedProductId = searchParams.get('productId') ?? '';

  const [number, setNumber] = useState(generateSupplyNumber());
  const [rows, setRows] = useState([
    { productId: preselectedProductId, quantity: 1, shelfLifeHours: 24 },
  ]);
  const [touched, setTouched] = useState(false);
  
  const stockQuery = useQuery({
    queryKey: ['stock'],
    queryFn: api.getStock,
  });
  const products = stockQuery.data ?? [];

  const updateRow = (i, patch) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const addRow = () => setRows((r) => [...r, emptyRow()]);
  const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));

  const isValid = useMemo(() => {
    return rows.length > 0 && rows.every(
      (r) => r.productId && r.quantity > 0 && r.shelfLifeHours > 0
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
        <HStack justify="space-between" mb={2}>
          <Heading size="sm" color="appText" fontWeight="600">
            Новая поставка
          </Heading>
          <Text color="appMuted" fontSize="xs">
            Номер можно оставить пустым — сгенерируется автоматически
          </Text>
        </HStack>

        <HStack>
  <Input
    placeholder="Номер"
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

        <Divider borderColor="appBorder" my={2} />

        {stockQuery.isLoading ? (
          <HStack><Spinner size="sm" /><Text color="appMuted" fontSize="sm">Загрузка продуктов...</Text></HStack>
        ) : stockQuery.error ? (
          <ErrorState message={stockQuery.error.message} onRetry={() => stockQuery.refetch()} />
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
          isDisabled={stockQuery.isLoading}
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
        isDisabled={stockQuery.isLoading}
      >
        Оформить поставку
      </Button>
    </Box>
  );
}

function SupplyHistory() {
  return (
    <EmptyState
      title="История недоступна"
      subtitle="Бэк пока не отдаёт список поставок. Создавайте поставки через форму выше."
    />
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