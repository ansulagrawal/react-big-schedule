import React from 'react';
import PropTypes from 'prop-types';

const AddMore = ({ schedulerData, number, left, width, top, clickAction, headerItem }) => {
  const { config } = schedulerData;
  const content = `+${number} more`;

  return (
    <a className="timeline-event" style={{ left, width, top }} onClick={() => clickAction(headerItem)}>
      <div style={{ height: config.eventItemHeight, color: '#999', textAlign: 'center' }}>{content}</div>
    </a>
  );
};

AddMore.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  number: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
  clickAction: PropTypes.func.isRequired,
  headerItem: PropTypes.object.isRequired,
};

export default AddMore;
