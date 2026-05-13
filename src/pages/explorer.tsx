import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useVaultStore } from '@/stores';
import AppShell from '@/components/layout/AppShell';

export default function ExplorerPage() {
  const vault = useVaultStore((s) => s.vault);
  const navigate = useNavigate();

  // Redirect to landing if no vault loaded (e.g. page refresh)
  useEffect(() => {
    if (!vault) navigate('/', { replace: true });
  }, [vault, navigate]);

  if (!vault) return null;
  return <AppShell />;
}
