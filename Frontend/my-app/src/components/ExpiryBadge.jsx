import { Badge } from '@chakra-ui/react';

export function ExpiryBadge({ hours }) {
  if (hours <= 0) return <Badge colorScheme="red">просрочено</Badge>;
  if (hours < 24) return <Badge colorScheme="red">осталось {hours} ч</Badge>;
  if (hours < 48) return <Badge colorScheme="yellow">осталось {hours} ч</Badge>;
  return <Badge colorScheme="green">{hours} ч</Badge>;
}