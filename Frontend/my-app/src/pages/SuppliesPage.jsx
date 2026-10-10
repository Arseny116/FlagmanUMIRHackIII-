import { Box, Heading, Text } from '@chakra-ui/react';

export default function SuppliesPage() {
  return (
    <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <Heading size="md" mb={2} color="appText" fontWeight="600">
        Поставки
      </Heading>
      <Text color="appMuted" fontSize="sm">
        Здесь будет форма новой поставки и история поступлений.
      </Text>
    </Box>
  );
}