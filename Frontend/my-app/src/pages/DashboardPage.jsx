import { Box, Heading, Text } from '@chakra-ui/react';

export default function DashboardPage() {
  return (
   <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <Heading size="md" mb={2} color="appText" fontWeight="600">
        Дашборд склада
      </Heading>
      <Text color="appMuted" fontSize="sm">
        Здесь будут ключевые показатели:позиции, партии, истекающие сроки и стоп-лист.
      </Text>
    </Box>
  );
}