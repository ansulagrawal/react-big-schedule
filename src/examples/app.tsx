import { Suspense } from 'react';
import Fallback from './components/Fallback';
import Shell from './components/Shell';
import { Link, usePath } from './router';
import { routes } from './routes';
import { ThemeProvider } from './theme';
import './css/style.css';

function Page() {
  const path = usePath();
  const route = routes.find(r => r.path === path);
  if (!route) {
    return (
      <div className="ex-fallback">
        <h2>404</h2>
        <p>Sorry, the page you visited does not exist or is under construction.</p>
        <Link to="/">Back home</Link>
      </div>
    );
  }
  const Component = route.component;
  return (
    <Suspense fallback={<Fallback />}>
      <Component />
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Shell>
        <Page />
      </Shell>
    </ThemeProvider>
  );
}
