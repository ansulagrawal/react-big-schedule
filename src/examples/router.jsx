import { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { createBrowserRouter } from 'react-router-dom';
import { Result } from 'antd';
import Fallback from './components/Fallback';
import Landing from './components/Landing';

const Home = lazy(() => import('./pages/Home'));
const Basic = lazy(() => import('./pages/Basic'));
const ReadOnly = lazy(() => import('./pages/Read-Only'));
const AddMore = lazy(() => import('./pages/Add-More'));
const DragAndDrop = lazy(() => import('./pages/Drag-And-Drop'));
const CustomTime = lazy(() => import('./pages/Custom-Time'));
const ResizeByParent = lazy(() => import('./pages/Resize-By-Parent'));

// Reusable 404 component
const NotFound = () => <Result status="404" title="404" subTitle="Sorry, the page you visited does not exist or is under construction." />;

// Wrapper for lazy-loaded components with Suspense
const LazyRoute = ({ Component }) => (
  <Suspense fallback={<Fallback />}>
    <Component />
  </Suspense>
);

LazyRoute.propTypes = {
  Component: PropTypes.elementType.isRequired,
};

// Create and export router
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
    children: [
      {
        index: true,
        element: <LazyRoute Component={Home} />,
      },
      {
        path: '/basic',
        element: <LazyRoute Component={Basic} />,
      },
      {
        path: '/read-only',
        element: <LazyRoute Component={ReadOnly} />,
      },
      {
        path: '/add-more',
        element: <LazyRoute Component={AddMore} />,
      },
      {
        path: '/drag-and-drop',
        element: <LazyRoute Component={DragAndDrop} />,
      },
      {
        path: '/custom-time',
        element: <LazyRoute Component={CustomTime} />,
      },
      {
        path: '/resize-by-parent',
        element: <LazyRoute Component={ResizeByParent} />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
