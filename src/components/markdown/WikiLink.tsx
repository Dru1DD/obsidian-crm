import { useVaultStore, useUIStore } from '@/stores';

interface Props {
  href: string;
  children: React.ReactNode;
}

export default function WikiLink({ href, children }: Props) {
  const vault = useVaultStore((s) => s.vault);
  const setActiveFile = useUIStore((s) => s.setActiveFile);

  if (!vault) return <span className="text-neutral-500">{children}</span>;

  // Try direct id match, then name match
  const fileId = vault.files.has(href)
    ? href
    : [...vault.files.values()].find(f => f.name.toLowerCase() === href.toLowerCase())?.id ?? null;

  if (!fileId) {
    return <span className="text-neutral-600 cursor-not-allowed" title={`Unresolved: ${href}`}>{children}</span>;
  }

  return (
    <button
      onClick={() => setActiveFile(fileId)}
      className="text-violet-400 hover:text-violet-300 underline underline-offset-2 decoration-violet-600/50 transition-colors"
    >
      {children}
    </button>
  );
}
