import { Row, Typography } from 'antd';
import SourceCode from '../../components/SourceCode';
import ClassBased from './class-based';

/**
 * Render a page with a centered "Drag and Drop Example" title, a SourceCode link, and the ClassBased example.
 * @returns {JSX.Element} The rendered JSX containing the title, SourceCode component, and ClassBased component.
 */
function Basic() {
  return (
    <>
      <Row align='middle' justify='center'>
        <Typography.Title level={2} className='m-0'>
          Drag and Drop Example
        </Typography.Title>
      </Row>
      <SourceCode value='https://github.com/ansulagrawal/react-big-schedule/blob/master/src/examples/pages/Drag-And-Drop/index.jsx' />
      <ClassBased />
    </>
  );
}

export default Basic;