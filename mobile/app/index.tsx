import { Redirect } from 'expo-router';
import { LoadingState } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';

export default function IndexScreen() {
  const { isReady, isAuthenticated } = useAuth();
  if (!isReady) return <LoadingState label="Seni hatırlıyoruz…" />;
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/giris'} />;
}
