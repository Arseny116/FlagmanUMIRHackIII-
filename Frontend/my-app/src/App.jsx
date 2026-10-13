import {
  Box, Flex, Link, Heading, Container, HStack,
  IconButton, useColorMode, Tooltip, Text, Badge,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { Link as RouterLink, Routes, Route } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import DashboardPage from './pages/DashboardPage';
import MenuPage from './pages/MenuPage';
import StockPage from './pages/StockPage';
import SuppliesPage from './pages/SuppliesPage';
import OrdersPage from './pages/OrdersPage';
import StopListPage from './pages/StopListPage';
import HotOffersPage from './pages/HotOffersPage';
import AlertsPage from './pages/AlertsPage';

import { useExpiryToasts } from './hooks/useExpiryToasts';
import { useCart } from './context/useCart';
import { api } from './api/client';

function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Tooltip label={colorMode === 'dark' ? 'Светлая тема' : 'Тёмная тема'} hasArrow>
      <IconButton
        aria-label="Переключить тему"
        icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
        onClick={toggleColorMode}
        variant="ghost"
        color="appMuted"
        _hover={{ color: 'appAccent', bg: 'transparent' }}
        size="sm"
      />
    </Tooltip>
  );
}

export default function App() {
  useExpiryToasts();
  const { count } = useCart();

  const { data: alerts } = useQuery({
    queryKey: ['alerts', 24],
    queryFn: () => api.getExpiring(24),
  });
  const alertsCount = alerts?.length ?? 0;

  return (
    <Box minH="100vh" bg="appBg" color="appText">
      <Flex
        as="header"
        bg="panelBg"
        px={{ base: 4, md: 6 }}
        py={3}
        align="center"
        justify="space-between"
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 3, md: 0 }}
        borderBottom="1px solid"
        borderColor="appBorder"
      >
        <Heading size="md" color="appText" fontWeight="600" letterSpacing="tight">
          Флагман: Мониторинг
        </Heading>

        <HStack
          gap={{ base: 3, md: 5 }}
          fontSize="sm"
          fontWeight="500"
          flexWrap="wrap"
          justify="center"
        >
          <Link as={RouterLink} to="/" color="appMuted" _hover={{ color: 'appAccent' }}>Дашборд</Link>
          <Link as={RouterLink} to="/menu" color="appMuted" _hover={{ color: 'appAccent' }}>Меню</Link>
          <Link as={RouterLink} to="/stock" color="appMuted" _hover={{ color: 'appAccent' }}>Остатки</Link>
          <Link as={RouterLink} to="/supplies" color="appMuted" _hover={{ color: 'appAccent' }}>Поставки</Link>
          <Link as={RouterLink} to="/orders" color="appMuted" _hover={{ color: 'appAccent' }}>
            <HStack spacing={1}>
              <Text>Заказы</Text>
              {count > 0 && (
                <Badge colorScheme="purple" fontSize="xs" borderRadius="full" px={2}>
                  {count}
                </Badge>
              )}
            </HStack>
          </Link>
          <Link as={RouterLink} to="/stoplist" color="appMuted" _hover={{ color: 'appAccent' }}>Стоп-лист</Link>
          <Link as={RouterLink} to="/alerts" color="appMuted" _hover={{ color: 'appAccent' }}>
            <HStack spacing={1}>
              <Text>Алерты</Text>
              {alertsCount > 0 && (
                <Badge colorScheme="red" fontSize="xs" borderRadius="full" px={2}>
                  {alertsCount}
                </Badge>
              )}
            </HStack>
          </Link>
          <Link as={RouterLink} to="/hot-offers" color="appMuted" _hover={{ color: 'appAccent' }}>Горячие</Link>
          <ThemeToggle />
        </HStack>
      </Flex>

      <Container maxW="container.xl" py={{ base: 4, md: 8 }} px={{ base: 3, md: 6 }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/supplies" element={<SuppliesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/stoplist" element={<StopListPage />} />
          <Route path="/hot-offers" element={<HotOffersPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
        </Routes>
      </Container>
    </Box>
  );
}