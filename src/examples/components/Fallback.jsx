import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function Fallback() {
  return (
    <div style={{ textAlign: 'center' }}>
      <Spin indicator={antIcon} />
      <p>Please wait while the component is being loaded.</p>
    </div>
  );
}

export default Fallback;
