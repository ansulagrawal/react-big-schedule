import { Row, Typography } from 'antd';
import React from 'react';
import ClassBased from './class-based';
import SourceCode from '../../components/SourceCode';

function Basic() {
  return (
    <>
      <Row align="middle" justify="center">
        <Typography.Title level={2} className="m-0"> Read Only Example</Typography.Title>
      </Row>
      <SourceCode value="https://github.com/ansulagrawal/react-big-schedule/blob/master/src/examples/pages/Read-Only/index.jsx" />
      <ClassBased />
    </>
  );
}

export default Basic;
