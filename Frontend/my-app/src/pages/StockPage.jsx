import {
  Box, Heading, Text, Spinner, Table, Thead, Tbody, Tr, Th, Td,
  Collapse, Icon, Input, InputGroup, InputLeftElement,
  Select, Checkbox, HStack, VStack, Button,
  useBreakpointValue, useColorModeValue,
} from '@chakra-ui/react';
import {
  ChevronDownIcon, ChevronRightIcon, SearchIcon, CloseIcon,
} from '@chakra-ui/icons';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useState, useMemo } from 'react';
import { api } from '../api/client';
import { ExpiryBadge } from '../components/ExpiryBadge';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

const EXPIRING_THRESHOLD = 48;

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

export default function StockPage() {
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [onlyExpiring, setOnlyExpiring] = useState(false);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const optionBg = useColorModeValue('#ffffff', '#1a1a1a');
  const optionColor = useColorModeValue('#1a1a1a', '#e4e4e7');

  const stockQuery = useQuery({ queryKey: ['stock'], queryFn: api.getStock });
  const allBatchesQuery = useQuery({ queryKey: ['batches', 'all'], queryFn: () => api.getBatches() });
  const batchesQuery = useQuery({
    queryKey: ['batches', openId],
    queryFn: () => api.getBatches(openId),
    enabled: openId != null,
  });

  const enriched = useMemo(() => {
    const stock = stockQuery.data ?? [];
    const batches = allBatchesQuery.data ?? [];
    const soonestByProduct = new Map();
    for (const b of batches) {
      const cur = soonestByProduct.get(b.productId);
      if (cur == null || b.hoursLeft < cur) soonestByProduct.set(b.productId, b.hoursLeft);
    }
    return stock.map((s) => ({ ...s, soonestExpiry: soonestByProduct.get(s.id) ?? Infinity }));
  }, [stockQuery.data, allBatchesQuery.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = enriched;
    if (q) list = list.filter((s) => s.name.toLowerCase().includes(q));
    if (onlyExpiring) list = list.filter((s) => s.soonestExpiry <= EXPIRING_THRESHOLD);
    const sorted = [...list];
    if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    else if (sortBy === 'qty') sorted.sort((a, b) => b.totalQuantity - a.totalQuantity);
    else if (sortBy === 'expiry') sorted.sort((a, b) => a.soonestExpiry - b.soonestExpiry);
    return sorted;
  }, [enriched, search, sortBy, onlyExpiring]);

  const hasActiveFilters = search || onlyExpiring || sortBy !== 'name';
  const resetFilters = () => { setSearch(''); setSortBy('name'); setOnlyExpiring(false); };

  if (stockQuery.isLoading || allBatchesQuery.isLoading) {
    return <Box p={{ base: 4, md: 6 }} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg"><Spinner /></Box>;
  }
  if (stockQuery.error) {
    return (
      <Box p={{ base: 4, md: 6 }} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
        <ErrorState message={stockQuery.error.message} onRetry={() => stockQuery.refetch()} />
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 6 }} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <HStack justify="space-between" mb={4} wrap="wrap" spacing={3}>
        <Heading size="md" color="appText" fontWeight="600">Остатки и партии</Heading>
        <Text color="appMuted" fontSize="sm">Показано: {filtered.length} из {enriched.length}</Text>
      </HStack>

      <VStack align="stretch" spacing={3} mb={5}>
        <HStack spacing={3} wrap="wrap">
          <InputGroup size="sm" maxW="320px" flex={1} minW="220px">
            <InputLeftElement pointerEvents="none"><SearchIcon color="appMuted" /></InputLeftElement>
            <Input
              placeholder="Поиск продукта..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              bg="appBg" borderColor="appBorder" color="appText"
              _hover={{ borderColor: 'appAccent' }}
              _focus={{ borderColor: 'appAccent', boxShadow: 'none' }}
            />
          </InputGroup>

          <Select
            size="sm" maxW="240px" value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            bg="appBg" borderColor="appBorder" color="appText"
            _hover={{ borderColor: 'appAccent' }}
            _focus={{ borderColor: 'appAccent', boxShadow: 'none' }}
          >
            <option value="name" style={{ background: optionBg, color: optionColor }}>По названию (А-Я)</option>
            <option value="qty" style={{ background: optionBg, color: optionColor }}>По количеству (убыв.)</option>
            <option value="expiry" style={{ background: optionBg, color: optionColor }}>По сроку (сначала истекающие)</option>
          </Select>

          <Checkbox
            size="sm" isChecked={onlyExpiring}
            onChange={(e) => setOnlyExpiring(e.target.checked)}
            colorScheme="orange" color="appText"
          >
            <Text fontSize="sm" color="appText">Только истекающие (&lt; {EXPIRING_THRESHOLD} ч)</Text>
          </Checkbox>

          {hasActiveFilters && (
            <Button
              size="sm" variant="ghost" color="appMuted"
              leftIcon={<CloseIcon boxSize={3} />}
              _hover={{ color: 'appAccent' }}
              onClick={resetFilters}
            >
              Сбросить
            </Button>
          )}
        </HStack>
      </VStack>

      {filtered.length === 0 ? (
        <EmptyState
          title="Ничего не найдено"
          subtitle={hasActiveFilters ? 'Попробуйте изменить фильтры или сбросить их' : 'На складе пока нет продуктов'}
        />
      ) : isMobile ? (
        <VStack align="stretch" spacing={3}>
          {filtered.map((item) => {
            const isOpen = openId === item.id;
            const hasSoonest = item.soonestExpiry !== Infinity;
            return (
              <Box key={item.id} p={4} bg="appBg" border="1px solid" borderColor="appBorder" borderRadius="md">
                <HStack justify="space-between" mb={2} cursor="pointer" onClick={() => setOpenId(isOpen ? null : item.id)}>
                  <HStack>
                    <Icon as={isOpen ? ChevronDownIcon : ChevronRightIcon} color="appMuted" />
                    <Text color="appText" fontWeight="600">{item.name}</Text>
                  </HStack>
                  {hasSoonest && <ExpiryBadge hours={item.soonestExpiry} />}
                </HStack>
                <HStack justify="space-between" fontSize="sm" color="appMuted">
                  <Text>Кол-во: <Text as="span" color="appText">{item.totalQuantity.toFixed(2)} {item.unit}</Text></Text>
                  <Text>Партий: <Text as="span" color="appText">{item.batchesCount}</Text></Text>
                </HStack>
                <Collapse in={isOpen} animateOpacity>
                  <Box mt={3} p={3} bg="cardBg" borderRadius="md">
                    {batchesQuery.isLoading ? (
                      <Spinner size="sm" />
                    ) : batchesQuery.data?.length === 0 ? (
                      <Text color="appMuted" fontSize="sm">Нет активных партий</Text>
                    ) : (
                      <VStack align="stretch" spacing={2}>
                        {batchesQuery.data?.map((b) => (
                          <VStack key={b.id} align="stretch" spacing={1}>
                            <HStack justify="space-between">
                              <Text color="appText" fontSize="sm" fontWeight="500">
                                {b.quantity.toFixed(2)} {b.unit}
                              </Text>
                              <ExpiryBadge hours={b.hoursLeft} />
                            </HStack>
                            <Text color="appMuted" fontSize="xs">
                              до {formatDate(b.expiresAt)}
                            </Text>
                          </VStack>
                        ))}
                      </VStack>
                    )}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </VStack>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th w="40px" borderColor="appBorder"></Th>
              <Th borderColor="appBorder" color="appMuted">Продукт</Th>
              <Th isNumeric borderColor="appBorder" color="appMuted">Кол-во</Th>
              <Th isNumeric borderColor="appBorder" color="appMuted">Партий</Th>
              <Th borderColor="appBorder" color="appMuted">Ближайший срок</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((item) => {
              const isOpen = openId === item.id;
              const hasSoonest = item.soonestExpiry !== Infinity;
              return (
                <Fragment key={item.id}>
                  <Tr
                    cursor="pointer" _hover={{ bg: 'blackAlpha.50' }}
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    borderColor="appBorder"
                  >
                    <Td borderColor="appBorder">
                      <Icon as={isOpen ? ChevronDownIcon : ChevronRightIcon} color="appMuted" />
                    </Td>
                    <Td borderColor="appBorder" color="appText" fontWeight="medium">{item.name}</Td>
                    <Td isNumeric borderColor="appBorder" color="appText">
                      {item.totalQuantity.toFixed(2)} {item.unit}
                    </Td>
                    <Td isNumeric borderColor="appBorder" color="appMuted">{item.batchesCount}</Td>
                    <Td borderColor="appBorder">
                      {hasSoonest ? <ExpiryBadge hours={item.soonestExpiry} /> : <Text color="appMuted" fontSize="sm">—</Text>}
                    </Td>
                  </Tr>
                  <Tr borderColor="appBorder">
                    <Td colSpan={5} p={0} borderColor="appBorder">
                      <Collapse in={isOpen} animateOpacity>
                        <Box p={4} bg="appBg" borderRadius="md" m={2}>
                          {batchesQuery.isLoading ? (
                            <Spinner size="sm" />
                          ) : batchesQuery.data?.length === 0 ? (
                            <Text color="appMuted" fontSize="sm">Нет активных партий</Text>
                          ) : (
                            <VStack align="stretch" spacing={2}>
                              {batchesQuery.data?.map((b) => (
                                <HStack
                                  key={b.id}
                                  justify="space-between"
                                  py={2}
                                  flexWrap="wrap"
                                  gap={3}
                                  borderBottom="1px solid"
                                  borderColor="appBorder"
                                  _last={{ borderBottom: 'none' }}
                                >
                                  <Text color="appText" fontSize="sm" fontWeight="500" minW="80px">
                                    {b.quantity.toFixed(2)} {b.unit}
                                  </Text>
                                  <Text color="appMuted" fontSize="sm" flex={1} minW="150px">
                                    до {formatDate(b.expiresAt)}
                                  </Text>
                                  <ExpiryBadge hours={b.hoursLeft} />
                                </HStack>
                              ))}
                            </VStack>
                          )}
                        </Box>
                      </Collapse>
                    </Td>
                  </Tr>
                </Fragment>
              );
            })}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}