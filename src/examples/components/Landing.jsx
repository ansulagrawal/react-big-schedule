import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Slider from './Slider';

/**
 * Render the landing page layout with a top header, a responsive sider, and main content outlet.
 *
 * @returns {JSX.Element} A React element containing an Ant Design Layout with Header, Sider, and Content that renders nested routes via Outlet.
 */
function Landing() {
  return (
    <Layout className='main-layout'>
      <Layout.Header className='main-header'>
        <Header />
      </Layout.Header>
      <Layout hasSider>
        <Layout.Sider breakpoint='md' theme='light'>
          <Slider />
        </Layout.Sider>
        <Layout.Content className='main-content'>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}

export default Landing;