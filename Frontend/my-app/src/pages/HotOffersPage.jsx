import { Box, Heading, Text } from '@chakra-ui/react';

export default function StockPage() {
  return (
    <Box p={5} bg="white" shadow="sm" borderRadius="md">
      <Heading size="lg" mb={2}>Остатки и партии</Heading>
      <Text color="gray.600">Здесь будет таблица продуктов и партий с цветовой индикацией сроков годности.</Text>
    </Box>
  );
}