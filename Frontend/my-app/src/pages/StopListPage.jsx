import { Box, Heading, Text } from '@chakra-ui/react';

export default function StopListPage() {
  return (
    <Box p={5} bg="white" shadow="sm" borderRadius="md">
      <Heading size="lg" mb={2}>Стоп-лист</Heading>
      <Text color="gray.600">Здесь отображаются блюда, которые временно недоступны из-за нехватки продуктов.</Text>
    </Box>
  );
}