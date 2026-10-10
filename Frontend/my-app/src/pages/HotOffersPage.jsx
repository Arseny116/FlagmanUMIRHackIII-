import { Box, Heading, Text } from '@chakra-ui/react';

export default function HotOffersPage() {
  return (
    <Box p={6} bg="cardBg" border="1px solid" borderColor="appBorder" borderRadius="lg">
      <Heading size="md" mb={2} color="#e4e4e7" fontWeight="600">
        Горячие предложения
      </Heading>
      <Text color="appMuted" fontSize="sm">
        Здесь будут рекомендации по приоритетной продаже блюд, у которых скоро истекают продукты.
      </Text>
    </Box>
  );
}