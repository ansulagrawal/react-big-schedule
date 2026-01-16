import { Row, Typography } from 'antd';
import SourceCode from '../../components/SourceCode';
import ClassBased from './functional-based';
import { URLS } from '../../constants';

function Basic() {
  return (
    <>
      <Row align="middle" justify="center">
        <Typography.Title level={2} className="m-0">
          Drag and Drop Example
        </Typography.Title>
      </Row>
      <SourceCode value={URLS.examples.dragAndDrop} />
      <ClassBased />
    </>
  );
}

export default Basic;
