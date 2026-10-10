import { type ReactNode, useEffect, useState } from 'react';
import { URLS } from '../constants';
import { Link, usePath } from '../router';
import { groups } from '../routes';
import { THEMES, useTheme } from '../theme';
import Select from '../ui/Select';
import { GithubIcon, MenuIcon, NpmIcon } from './icons';

const themeOptions = THEMES.map(t => ({ value: t, label: t[0]?.toUpperCase() + t.slice(1) }));

/** App chrome: top bar with logo, theme switcher and links, plus a sidebar that collapses on small screens. */
export default function Shell({ children }: { children: ReactNode }) {
  const path = usePath();
  const { theme, setTheme } = useTheme();
  const [navOpen, setNavOpen] = useState(false);

  // close the drawer after navigating
  useEffect(() => setNavOpen(false), [path]);

  return (
    <div className="ex-app" data-nav-open={navOpen}>
      <header className="ex-topbar">
        <button
          type="button"
          className="ex-btn ex-btn-ghost ex-menu-btn"
          aria-label="Toggle navigation"
          aria-expanded={navOpen}
          onClick={() => setNavOpen(o => !o)}
        >
          <MenuIcon />
        </button>
        <Link to="/" className="ex-brand">
          <img src="/logo.svg" alt="" width={32} height={32} />
          <span>React Big Schedule</span>
        </Link>
        <div className="ex-topbar-end">
          <Select label="Theme" value={theme} options={themeOptions} onChange={setTheme} />
          <a className="ex-icon-link" href={URLS.npm} target="_blank" rel="noopener noreferrer" aria-label="npm">
            <NpmIcon />
          </a>
          <a
            className="ex-icon-link"
            href={URLS.githubRepo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <GithubIcon />
          </a>
        </div>
      </header>
      <nav className="ex-sidebar" aria-label="Examples">
        {groups.map(group => (
          <div key={group.title} className="ex-nav-group">
            <h4>{group.title}</h4>
            {group.routes.map(route => (
              <Link key={route.path} to={route.path} aria-current={route.path === path ? 'page' : undefined}>
                {route.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <button type="button" className="ex-scrim" aria-label="Close navigation" onClick={() => setNavOpen(false)} />
      <main className="ex-main">{children}</main>
    </div>
  );
}
