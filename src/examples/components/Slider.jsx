import { Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

const items = [
  { label: 'Home', key: 'home', path: '/' },
  { label: 'Basic', key: 'basic', path: '/basic' },
  { label: 'Read Only', key: 'read-only', path: '/read-only' },
  { label: 'Add More', key: 'add-more', path: '/add-more' },
  { label: 'Drag and Drop', key: 'drag-and-drop', path: '/drag-and-drop' },
  { label: 'Custom Time', key: 'custom-time', path: '/custom-time' },
  {
    label: 'Resize By Parent',
    key: 'resize-by-parent',
    path: '/resize-by-parent',
  },
  {
    label: 'Vertical View',
    key: 'vertical-view',
    path: '/vertical-view',
  },
];

/**
 * Render a navigation menu that highlights the current route and navigates when an item is selected.
 *
 * The menu's active item is determined from the browser URL path; selecting an item navigates to its configured route.
 * @returns {JSX.Element} An Ant Design Menu element configured with route items and click handlers that perform navigation.
 */
function Slider() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activePath = pathname?.split('/')[1] || 'home';
  return <Menu selectedKeys={[activePath]} items={items.map(i => ({ ...i, onClick: () => navigate(i.path) }))} />;
}

export default Slider;
