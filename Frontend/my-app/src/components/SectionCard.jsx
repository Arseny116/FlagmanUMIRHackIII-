import { Box, Heading, HStack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ChevronRightIcon } from '@chakra-ui/icons';

export function SectionCard({ title, linkTo, linkLabel = 'Все', children }) {
  return (
    <Box
      p={5}
      bg="cardBg"
      border="1px solid"
      borderColor="appBorder"
      borderRadius="lg"
      display="flex"
      flexDirection="column"
      transition="border-color 0.15s"
      _hover={{ borderColor: 'appAccent' }}
    >
      <HStack justify="space-between" mb={4}>
        <Heading size="sm" color="appText" fontWeight="600">
          {title}
        </Heading>
        {linkTo && (
          <HStack
            as={RouterLink}
            to={linkTo}
            spacing={1}
            color="appMuted"
            fontSize="xs"
            _hover={{ color: 'appAccent' }}
          >
            <Text>{linkLabel}</Text>
            <ChevronRightIcon />
          </HStack>
        )}
      </HStack>
      {children}
    </Box>
  );
}