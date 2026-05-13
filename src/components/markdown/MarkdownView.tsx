import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import type { VaultFile } from '@/types';
import WikiLink from './WikiLink';

// Transform [[wikilinks]] in raw markdown before react-markdown sees it
const WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]]*)?(?:\|([^\]]*))?\]\]/g;

function transformWikilinks(content: string): string {
  return content.replace(WIKILINK_RE, (_, target: string, alias?: string) => {
    const display = alias?.trim() || target.trim().split('/').pop() || target;
    return `[${display}](wikilink:${encodeURIComponent(target.trim())})`;
  });
}

interface Props {
  file: VaultFile;
}

export default function MarkdownView({ file }: Props) {
  const transformed = transformWikilinks(file.content);

  return (
    <div className="prose max-w-none px-8 py-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          a({ href, children }) {
            if (href?.startsWith('wikilink:')) {
              const target = decodeURIComponent(href.slice('wikilink:'.length));
              return <WikiLink href={target}>{children}</WikiLink>;
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">
                {children}
              </a>
            );
          },
        }}
      >
        {transformed}
      </ReactMarkdown>
    </div>
  );
}
