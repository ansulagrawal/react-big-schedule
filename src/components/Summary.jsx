import React from 'react';
import PropTypes from 'prop-types';
import { SummaryPos } from '../config/default';

const Summary = ({ schedulerData, summary, left, width, top }) => {
  const {
    config: { summaryColor, summaryPos, eventItemHeight },
  } = schedulerData;

  const { color = summaryColor, fontSize } = summary;
  let textAlign = 'center';

  if (summaryPos === SummaryPos.TopRight || summaryPos === SummaryPos.BottomRight) {
    textAlign = 'right';
  } else if (summaryPos === SummaryPos.TopLeft || summaryPos === SummaryPos.BottomLeft) {
    textAlign = 'left';
  }

  const style = { height: eventItemHeight, color, textAlign, marginLeft: '6px', marginRight: '6px', ...(fontSize && { fontSize }) };

  return (
    <>
      <div className="timeline-event header2-text" style={{ left, width, top, cursor: 'default' }}>
        <div style={style}>{summary.text}</div>
      </div>
    </>
  );
};

Summary.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  summary: PropTypes.object.isRequired,
  left: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
};

export default Summary;
