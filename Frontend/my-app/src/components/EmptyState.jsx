import { Box, Text, VStack, Icon } from '@chakra-ui/react';
import { CheckCircleIcon, InfoIcon } from '@chakra-ui/icons';

export function EmptyState({ title, subtitle, variant = 'info' }) {
  const IconComp = variant === 'success' ? CheckCircleIcon : InfoIcon;
  const iconColor = variant === 'success' ? 'green.400' : 'appMuted';

  return (
    <VStack spacing={2} py={6} color="appMuted">
      <Icon as={IconComp} boxSize={6} color={iconColor} />
      <Text color="appText" fontSize="sm" fontWeight="500">
        {title}
      </Text>
      {subtitle && (
        <Text fontSize="xs" color="appMuted" textAlign="center">
          {subtitle}
        </Text>
      )}
    </VStack>
  );
}