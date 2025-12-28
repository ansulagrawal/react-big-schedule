import PropTypes from 'prop-types';
import React from 'react';
import { SummaryPos } from '../config/default';

function Summary({ schedulerData, summary, left, width, top }) {
  const { config } = schedulerData;
  const color = summary.color !== undefined ? summary.color : config.summaryColor;
  let textAlign = 'center';

  if (config.summaryPos === SummaryPos.TopRight || config.summaryPos === SummaryPos.BottomRight) {
    textAlign = 'right';
  } else if (config.summaryPos === SummaryPos.TopLeft || config.summaryPos === SummaryPos.BottomLeft) {
    textAlign = 'left';
  }

  const style = {
    height: config.eventItemHeight,
    color,
    textAlign,
    marginLeft: '6px',
    marginRight: '6px',
    ...(summary.fontSize !== undefined ? { fontSize: summary.fontSize } : {}),
  };

  return (
    <div className="timeline-event header2-text" style={{ left, width, top, cursor: 'default' }}>
      <div style={style}>{summary.text}</div>
    </div>
  );
}

Summary.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  summary: PropTypes.object.isRequired,
  left: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
};

export default Summary;
