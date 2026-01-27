import { CloseOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import DnDSource from './DnDSource';
import EventItem from './EventItem';

function AddMorePopover(props) {
  const { schedulerData, headerItem, left, top, height, closeAction } = props;
  const { config, localeDayjs } = schedulerData;
  const { time, start, end, events } = headerItem;

  const [dndSource] = useState(new DnDSource(p => p.eventItem, schedulerData.config.dragAndDropEnabled));

  const header = localeDayjs(new Date(time)).format(config.addMorePopoverHeaderFormat);
  const durationStart = localeDayjs(new Date(start));
  const durationEnd = localeDayjs(end);
  const eventList = events.map((evt, i) => {
    if (evt !== undefined) {
      const eventStart = localeDayjs(evt.eventItem.start);
      const eventEnd = localeDayjs(evt.eventItem.end);
      const isStart = eventStart >= durationStart;
      const isEnd = eventEnd < durationEnd;
      const eventItemTop = 12 + (i + 1) * config.eventItemLineHeight;

      return (
        <EventItem
          {...props}
          key={evt.eventItem.id}
          eventItem={evt.eventItem}
          dndSource={dndSource}
          leftIndex={0}
          isInPopover
          isStart={isStart}
          isEnd={isEnd}
          rightIndex={1}
          left={10}
          width={138}
          top={eventItemTop}
        />
      );
    }
    return null;
  });

  return (
    <div className="rbs-add-more-popover-overlay" style={{ left, top, height, minWidth: '170px' }}>
      <Row justify="space-between" align="middle">
        <Col span={22}>
          <span className="base-text">{header}</span>
        </Col>
        <Col span={2}>
          <button type="button" onClick={() => closeAction(undefined)}>
            <CloseOutlined />
          </button>
        </Col>
      </Row>
      {eventList?.filter(Boolean)}
    </div>
  );
}

AddMorePopover.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  headerItem: PropTypes.object.isRequired,
  left: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  closeAction: PropTypes.func.isRequired,
  subtitleGetter: PropTypes.func,
  moveEvent: PropTypes.func,
  eventItemClick: PropTypes.func,
  viewEventClick: PropTypes.func,
  viewEventText: PropTypes.string,
  viewEvent2Click: PropTypes.func,
  viewEvent2Text: PropTypes.string,
  eventItemTemplateResolver: PropTypes.func,
};

export default AddMorePopover;
