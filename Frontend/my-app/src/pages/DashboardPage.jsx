import { Box, Heading, Text } from '@chakra-ui/react';

export default function DashboardPage() {
  return (
    <Box p={5} bg="white" shadow="sm" borderRadius="md">
      <Heading size="lg" mb={2}>Дашборд склада</Heading>
      <Text color="gray.600">Здесь будут ключевые показатели: позиции, партии, истекающие сроки и стоп-лист.</Text>
    </Box>
  );
}