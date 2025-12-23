import { CloseOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import PropTypes from 'prop-types';
import { useState } from 'react';
import DnDSource from './DnDSource';
import EventItem from './EventItem';

/**
 * Render a positioned "add more" popover that lists events for a scheduler time slot.
 *
 * @param {object} props - Component properties.
 * @param {object} props.schedulerData - Scheduler context object with `config` and `localeDayjs`.
 * @param {object} props.headerItem - Header info for the popover containing `time`, `start`, `end`, and `events`.
 * @param {number} props.left - Left offset in pixels for popover positioning.
 * @param {number} props.top - Top offset in pixels for popover positioning.
 * @param {number} props.height - Height in pixels for the popover container.
 * @param {function} props.closeAction - Callback invoked to close the popover; called with `undefined` when closed.
 * @returns {JSX.Element} A positioned popover element containing a header and a list of event items for the given time range.
 */
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
    <div className='add-more-popover-overlay' style={{ left, top, height, width: '170px' }}>
      <Row justify='space-between' align='middle'>
        <Col span={22}>
          <span className='base-text'>{header}</span>
        </Col>
        <Col span={2}>
          <button type='button' onClick={() => closeAction(undefined)}>
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