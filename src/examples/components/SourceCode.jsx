import { Row } from 'antd';
import { Link } from 'react-router-dom';

function SourceCode({ value }) {
  return (
    <Row align="middle" justify="center">
      <Link to={value} target="_blank">
        &lt;/&gt; Source Code
      </Link>
    </Row>
  );
}

export default SourceCode;
