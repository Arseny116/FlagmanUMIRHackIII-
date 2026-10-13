import { Box, Text, Heading, Skeleton } from '@chakra-ui/react';

export function StatCard({ label, value, accent, isLoading, hint }) {
  return (
    <Box
      p={5}
      bg="cardBg"
      border="1px solid"
      borderColor="appBorder"
      borderRadius="lg"
      transition="border-color 0.15s"
      _hover={{ borderColor: 'appAccent' }}
    >
      <Text
        color="appMuted"
        fontSize="xs"
        fontWeight="600"
        letterSpacing="wide"
        mb={2}
      >
        {label.toUpperCase()}
      </Text>

      {isLoading ? (
        <Skeleton height="32px" width="60%" borderRadius="md" />
      ) : (
        <Heading size="lg" color={accent || 'appText'} fontWeight="600">
          {value}
        </Heading>
      )}

      {hint && (
        <Text color="appMuted" fontSize="xs" mt={2}>
          {hint}
        </Text>
      )}
    </Box>
  );
}