import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import EventItem from './EventItem';
import DnDSource from './DnDSource';

function AddMorePopover(props) {
  const { schedulerData, headerItem, left, top, height, closeAction } = props;
  const { config, localeDayjs } = schedulerData;
  const { time, start, end, events } = headerItem;

  const [dndSource] = useState(new DnDSource(p => p.eventItem, EventItem, schedulerData.config.dragAndDropEnabled));

  const header = localeDayjs(new Date(time)).format(config.addMorePopoverHeaderFormat);
  const durationStart = localeDayjs(new Date(start));
  const durationEnd = localeDayjs(end);
  const DnDEventItem = dndSource.getDragSource();
  const eventList = events.map((evt, i) => {
    if (evt !== undefined) {
      const eventStart = localeDayjs(evt.eventItem.start);
      const eventEnd = localeDayjs(evt.eventItem.end);
      const isStart = eventStart >= durationStart;
      const isEnd = eventEnd < durationEnd;
      const eventItemTop = 12 + (i + 1) * config.eventItemLineHeight;

      return (
        <DnDEventItem
          {...props}
          key={evt.eventItem.id}
          eventItem={evt.eventItem}
          leftIndex={0}
          isInPopover={true}
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
    <div className="add-more-popover-overlay" style={{ left, top, height, width: '170px' }}>
      <Row justify="space-between" align="middle">
        <Col span={22}>
          <span className="base-text">{header}</span>
        </Col>
        <Col span={2}>
          <span onClick={() => closeAction(undefined)}>
            <CloseOutlined />
          </span>
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
