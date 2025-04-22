// Tạo hooks/useGun.ts
import { useEffect } from 'react';
import Gun, { GunDataNode, GunSchema } from 'gun';

type SubscriptionHandler<T> = (data: T, key: string) => void;
type Dispatch = (action: { type: string; payload: any }) => void;

export function useGunSubscription<T extends GunSchema>(
  path: string,
  handler: SubscriptionHandler<T>,
  dependencies: any[] = []
) {
  useEffect(() => {
    const gun = Gun();
    const node = gun.get(path);
    
    node.map().on((data: GunDataNode<T>, key: string) => {
      return handler(data as T, key);
    });

    return () => {
      node.off();
    };
  }, dependencies);
}

// Example usage in component
useGunSubscription<{ status?: string }>('online', (data, key) => {
  if (data?.status === 'online') {
    dispatch({ type: 'UPDATE_ONLINE', payload: key });
  }
}, [dispatch]);
function dispatch(arg0: { type: string; payload: string; }) {
    throw new Error('Function not implemented.');
}

