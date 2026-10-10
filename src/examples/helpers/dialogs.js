import { Modal } from 'antd';

// antd modals for the example pages (instead of the browser's confirm / alert popups)
export const showInfo = content => Modal.info({ title: 'Info', content, centered: true });

export const confirmAction = (content, onOk) =>
  Modal.confirm({ title: 'Please confirm', content, centered: true, okText: 'Yes', cancelText: 'No', onOk });
