import { Box, Heading, Text } from '@chakra-ui/react';

export default function StopListPage() {
  return (
    <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <Heading size="md" mb={2} color="appText" fontWeight="600">
        Стоп-лист
      </Heading>
      <Text color="appMuted" fontSize="sm">
        Здесь отображаются блюда, которые временно недоступны из-за нехватки продуктов.
      </Text>
    </Box>
  );
}