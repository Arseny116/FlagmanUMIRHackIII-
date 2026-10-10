import { Box, Heading, Text } from '@chakra-ui/react';

export default function MenuPage() {
  return (
    <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <Heading size="md" mb={2} color="appText" fontWeight="600">
        Меню
      </Heading>
      <Text color="appMuted" fontSize="sm">
        Здесь будет меню блюд.
      </Text>
    </Box>
  );
}