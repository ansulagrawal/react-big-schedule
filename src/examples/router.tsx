import { type AnchorHTMLAttributes, useEffect, useState } from 'react';

const read = () => window.location.hash.slice(1) || '/';

/** Current path of the hash router (`#/basic` is `/basic`). */
export const usePath = () => {
  const [path, setPath] = useState(read);
  useEffect(() => {
    const onChange = () => setPath(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
};

export function Link({ to, ...rest }: { to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return <a href={`#${to}`} {...rest} />;
}
