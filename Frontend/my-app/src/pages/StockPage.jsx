import { Box, Heading, Text } from '@chakra-ui/react';

export default function StockPage() {
  return (
    <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <Heading size="md" mb={2} color="appText" fontWeight="600">
        Остатки и партии
      </Heading>
      <Text color="appMuted" fontSize="sm">
        Здесь будет таблица продуктов и партий с цветовой индикацией сроков годности.
      </Text>
    </Box>
  );
}