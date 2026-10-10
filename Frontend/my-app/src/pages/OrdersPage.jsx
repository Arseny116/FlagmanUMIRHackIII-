import { Box, Heading, Text } from '@chakra-ui/react';

export default function SuppliesPage() {
  return (
    <Box p={5} bg="white" shadow="sm" borderRadius="md">
      <Heading size="lg" mb={2}>Поставки</Heading>
      <Text color="gray.600">Здесь будет форма новой поставки и история поступлений.</Text>
    </Box>
  );
}