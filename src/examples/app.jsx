import { Result } from 'antd';
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Fallback from './components/Fallback';
import Landing from './components/Landing';
import './css/style.css';

const Home = lazy(() => import('./pages/Home'));
const Basic = lazy(() => import('./pages/Basic'));
const ReadOnly = lazy(() => import('./pages/Read-Only'));
const AddMore = lazy(() => import('./pages/Add-More'));
const DragAndDrop = lazy(() => import('./pages/Drag-And-Drop'));
const CustomTime = lazy(() => import('./pages/Custom-Time'));
const ResizeByParent = lazy(() => import('./pages/Resize-By-Parent'));

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Landing />,
      children: [
        {
          path: '/',
          element: (
            <Suspense fallback={<Fallback />}>
              <Home />
            </Suspense>
          ),
        },
        {
          path: '/basic',
          element: (
            <Suspense fallback={<Fallback />}>
              <Basic />
            </Suspense>
          ),
        },
        {
          path: '/read-only',
          element: (
            <Suspense fallback={<Fallback />}>
              <ReadOnly />
            </Suspense>
          ),
        },
        {
          path: '/add-more',
          element: (
            <Suspense fallback={<Fallback />}>
              <AddMore />
            </Suspense>
          ),
        },
        {
          path: '/drag-and-drop',
          element: (
            <Suspense fallback={<Fallback />}>
              <DragAndDrop />
            </Suspense>
          ),
        },
        {
          path: '/custom-time',
          element: (
            <Suspense fallback={<Fallback />}>
              <CustomTime />
            </Suspense>
          ),
        },
        {
          path: '/resize-by-parent',
          element: (
            <Suspense fallback={<Fallback />}>
              <ResizeByParent />
            </Suspense>
          ),
        },
        {
          path: '*',
          element: <Result status="404" title="404" subTitle="Sorry, the page you visited does not exist or is under construction." />,
        },
      ],
    },
    {
      path: '*',
      element: <Result status="404" title="404" subTitle="Sorry, the page you visited does not exist or is under construction." />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
