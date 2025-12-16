import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

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
