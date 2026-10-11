import { Text, VStack, Icon, Button } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';

export function ErrorState({ message, onRetry }) {
  return (
    <VStack spacing={3} py={6}>
      <Icon as={WarningIcon} color="red.400" boxSize={6} />
      <Text color="appText" fontSize="sm" fontWeight="500">
        Не удалось загрузить
      </Text>
      <Text color="appMuted" fontSize="xs" textAlign="center">
        {message}
      </Text>
      {onRetry && (
        <Button size="sm" variant="outline" borderColor="appBorder" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </VStack>
  );
}