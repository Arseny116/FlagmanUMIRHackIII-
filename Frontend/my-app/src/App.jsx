import { Box, Flex, Link, Heading, Container } from '@chakra-ui/react';
import { Link as RouterLink, Routes, Route } from 'react-router-dom';

import DashboardPage from './pages/DashboardPage';
import StockPage from './pages/StockPage';
import SuppliesPage from './pages/SuppliesPage';
import OrdersPage from './pages/OrdersPage';
import StopListPage from './pages/StopListPage';
import HotOffersPage from './pages/HotOffersPage';

export default function App() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Flex 
        as="header" 
        bg="blue.600" 
        color="white" 
        p={4} 
        align="center" 
        justify="space-between"
        boxShadow="sm"
      >
        <Heading size="md">Флагман: Мониторинг</Heading>
        <Flex gap={4} fontSize="sm" fontWeight="medium">
          <Link as={RouterLink} to="/" _hover={{ textDecoration: 'underline' }}>Дашборд</Link>
          <Link as={RouterLink} to="/stock" _hover={{ textDecoration: 'underline' }}>Остатки</Link>
          <Link as={RouterLink} to="/supplies" _hover={{ textDecoration: 'underline' }}>Поставки</Link>
          <Link as={RouterLink} to="/orders" _hover={{ textDecoration: 'underline' }}>Заказы</Link>
          <Link as={RouterLink} to="/stoplist" _hover={{ textDecoration: 'underline' }}>Стоп-лист</Link>
          <Link as={RouterLink} to="/hot-offers" _hover={{ textDecoration: 'underline' }}>Горячие</Link>
        </Flex>
      </Flex>

      <Container maxW="container.xl" pt={6}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/supplies" element={<SuppliesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/stoplist" element={<StopListPage />} />
          <Route path="/hot-offers" element={<HotOffersPage />} />
        </Routes>
      </Container>
    </Box>
  );
}