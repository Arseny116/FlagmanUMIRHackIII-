import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { api } from '../api/client';

const CRITICAL_HOURS = 24;

export function useExpiryToasts() {
  const toast = useToast();
  const seenIds = useRef(new Set());
  const firstLoad = useRef(true);

  const { data } = useQuery({
    queryKey: ['alerts', CRITICAL_HOURS],
    queryFn: () => api.getExpiring(CRITICAL_HOURS),
    refetchInterval: 30_000, 
  });

  useEffect(() => {
    if (!data) return;

    if (firstLoad.current) {
      data.forEach((b) => seenIds.current.add(b.id));
      firstLoad.current = false;
      return;
    }

    const fresh = data.filter((b) => !seenIds.current.has(b.id));

    for (const batch of fresh) {
      seenIds.current.add(batch.id);
      toast({
        title: 'Скоро истекает',
        description: `${batch.productName}: ${batch.quantity} ${batch.unit}, осталось ${batch.hoursLeft} ч`,
        status: 'warning',
        duration: 6000,
        isClosable: true,
        position: 'top-right',
      });
    }
  }, [data, toast]);
}