import {
  Box, Heading, Text, Spinner, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Collapse, Icon,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../api/client';

function ExpiryBadge({ hours }) {
  if (hours <= 0)  return <Badge colorScheme="red">просрочено</Badge>;
  if (hours < 24)  return <Badge colorScheme="red">осталось {hours} ч</Badge>;
  if (hours < 48)  return <Badge colorScheme="yellow">осталось {hours} ч</Badge>;
  return <Badge colorScheme="green">{hours} ч</Badge>;
}

export default function StockPage() {
  const [openId, setOpenId] = useState(null);

  const stockQuery = useQuery({
    queryKey: ['stock'],
    queryFn: api.getStock,
  });

  const batchesQuery = useQuery({
    queryKey: ['batches', openId],
    queryFn: () => api.getBatches(openId),
    enabled: openId != null,
  });

  if (stockQuery.isLoading) return <Spinner />;
  if (stockQuery.error) return <Text color="appMuted">Ошибка: {stockQuery.error.message}</Text>;

  return (
    <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <Heading size="md" mb={4} color="appText" fontWeight="600">
        Остатки и партии
      </Heading>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th w="40px" borderColor="appBorder"></Th>
            <Th borderColor="appBorder" color="appMuted">Продукт</Th>
            <Th isNumeric borderColor="appBorder" color="appMuted">Кол-во</Th>
            <Th isNumeric borderColor="appBorder" color="appMuted">Партий</Th>
          </Tr>
        </Thead>
        <Tbody>
          {stockQuery.data.map((item) => {
            const isOpen = openId === item.id;
            return (
              <>
                <Tr
                  key={item.id}
                  cursor="pointer"
                  _hover={{ bg: 'blackAlpha.50' }}
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
                </Tr>
                <Tr key={`${item.id}-exp`} borderColor="appBorder">
                  <Td colSpan={4} p={0} borderColor="appBorder">
                    <Collapse in={isOpen} animateOpacity>
                      <Box p={4} bg="appBg" borderRadius="md" m={2}>
                        {batchesQuery.isLoading ? (
                          <Spinner size="sm" />
                        ) : batchesQuery.data?.length === 0 ? (
                          <Text color="appMuted" fontSize="sm">Нет активных партий</Text>
                        ) : (
                          batchesQuery.data?.map((b) => (
                            <Box
                              key={b.id}
                              display="flex"
                              gap={4}
                              align="center"
                              py={2}
                              borderBottom="1px solid"
                              borderColor="appBorder"
                              _last={{ borderBottom: 'none' }}
                            >
                              <Text color="appMuted" fontSize="sm" w="80px">#{b.id}</Text>
                              <Text color="appText" fontSize="sm" w="120px">
                                {b.quantity.toFixed(2)} {b.unit}
                              </Text>
                              <Text color="appMuted" fontSize="sm" flex={1}>
                                до {new Date(b.expiresAt).toLocaleString('ru-RU')}
                              </Text>
                              <ExpiryBadge hours={b.hoursLeft} />
                            </Box>
                          ))
                        )}
                      </Box>
                    </Collapse>
                  </Td>
                </Tr>
              </>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}