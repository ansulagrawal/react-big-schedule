import React from 'react';
import { Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

const items = [
  { label: 'Home', key: 'home', path: '/' },
  { label: 'Basic', key: 'basic', path: '/basic' },
  { label: 'Read Only', key: 'read-only', path: '/read-only' },
  { label: 'Add More', key: 'add-more', path: '/add-more' },
  { label: 'Drag and Drop', key: 'drag-and-drop', path: '/drag-and-drop' },
  { label: 'Custom Time', key: 'custom-time', path: '/custom-time' },
  { label: 'Resize By Parent', key: 'resize-by-parent', path: '/resize-by-parent' },
];

function Slider() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activePath = pathname?.split('/')[1] || 'home';
  return <Menu selectedKeys={[activePath]} items={items.map(i => ({ ...i, onClick: () => navigate(i.path) }))} />;
}

export default Slider;
