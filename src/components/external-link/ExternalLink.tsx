import type { ReactNode } from 'react';

interface ExternalLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

/** A link to another site, opened in a new tab so the builder stays put. */
export const ExternalLink = ({ href, className, children }: ExternalLinkProps) => (
  <a className={className} href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);
