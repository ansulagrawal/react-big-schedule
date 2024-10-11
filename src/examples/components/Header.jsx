import { GithubOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <Row align="middle" justify="space-between" className="header-wrapper">
      <Col span={2}>
        <Link to="/">
          <img src="/logo.png" alt="Logo" className="logo_img" />
        </Link>
      </Col>
      <Col>
        <Link to="https://www.npmjs.com/package/react-big-schedule" target="_blank" className="npm-icon">
          <img src="/npm.svg" alt="npm-logo" />
        </Link>
        <Link to="https://github.com/react-scheduler/react-big-schedule" target="_blank" className="github-icon">
          <GithubOutlined />
        </Link>
      </Col>
    </Row>
  );
}

export default Header;
