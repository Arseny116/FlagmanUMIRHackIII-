import { Box, Heading, Text } from '@chakra-ui/react';

export default function HotOffersPage() {
  return (
    <Box p={5} bg="white" shadow="sm" borderRadius="md">
      <Heading size="lg" mb={2}>Горячие предложения</Heading>
      <Text color="gray.600">Здесь будут рекомендации по приоритетной продаже блюд, у которых скоро истекают продукты.</Text>
    </Box>
  );
}