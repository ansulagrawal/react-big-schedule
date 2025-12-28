import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'antd';

function EventItemPopover({
  schedulerData,
  eventItem,
  title,
  startTime,
  endTime,
  statusColor,
  subtitleGetter,
  viewEventClick,
  viewEventText,
  viewEvent2Click,
  viewEvent2Text,
  eventItemPopoverTemplateResolver,
}) {
  const { localeDayjs, config } = schedulerData;
  const start = localeDayjs(new Date(startTime));
  const end = localeDayjs(new Date(endTime));

  if (eventItemPopoverTemplateResolver) {
    return eventItemPopoverTemplateResolver(schedulerData, eventItem, title, start, end, statusColor);
  }

  const subtitle = subtitleGetter ? subtitleGetter(schedulerData, eventItem) : null;
  const showViewEvent = viewEventText && viewEventClick && (eventItem.clickable1 === undefined || eventItem.clickable1);
  const showViewEvent2 = viewEvent2Text && viewEvent2Click && (eventItem.clickable2 === undefined || eventItem.clickable2);

  const renderViewEvent = (text, clickHandler, marginLeft = 0) => (
    <button
      className="header2-text txt-btn-dis"
      type="button"
      style={{ color: '#108EE9', cursor: 'pointer', marginLeft: `${marginLeft}px` }}
      onClick={() => clickHandler(schedulerData, eventItem)}
    >
      {text}
    </button>
  );

  return (
    <div style={{ width: config.eventItemPopoverWidth }}>
      <Row type="flex" align="middle">
        {config.eventItemPopoverShowColor && (
          <Col span={2}>
            <div className="status-dot" style={{ backgroundColor: statusColor }} />
          </Col>
        )}
        <Col span={22} className="overflow-text">
          <span className="header2-text" title={title}>
            {title}
          </span>
        </Col>
      </Row>
      {subtitle && (
        <Row type="flex" align="middle">
          <Col span={2}>
            <div />
          </Col>
          <Col span={22} className="overflow-text">
            <span className="header2-text" title={subtitle}>
              {subtitle}
            </span>
          </Col>
        </Row>
      )}
      <Row type="flex" align="middle">
        <Col span={2}>
          <div />
        </Col>
        <Col span={22}>
          <span className="header1-text">{start.format('HH:mm')}</span>
          {config.eventItemPopoverDateFormat && (
            <span className="help-text" style={{ marginLeft: '8px' }}>
              {start.format(config.eventItemPopoverDateFormat)}
            </span>
          )}
          <span className="header2-text" style={{ marginLeft: '8px' }}>
            -
          </span>
          <span className="header1-text" style={{ marginLeft: '8px' }}>
            {end.format('HH:mm')}
          </span>
          {config.eventItemPopoverDateFormat && (
            <span className="help-text" style={{ marginLeft: '8px' }}>
              {end.format(config.eventItemPopoverDateFormat)}
            </span>
          )}
        </Col>
      </Row>
      {(showViewEvent || showViewEvent2) && (
        <Row type="flex" align="middle">
          <Col span={2}>
            <div />
          </Col>
          <Col span={22}>
            {showViewEvent && renderViewEvent(viewEventText, viewEventClick)}
            {showViewEvent2 && renderViewEvent(viewEvent2Text, viewEvent2Click, 16)}
          </Col>
        </Row>
      )}
    </div>
  );
}

EventItemPopover.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  eventItem: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  statusColor: PropTypes.string.isRequired,
  subtitleGetter: PropTypes.func,
  viewEventClick: PropTypes.func,
  viewEventText: PropTypes.string,
  viewEvent2Click: PropTypes.func,
  viewEvent2Text: PropTypes.string,
  eventItemPopoverTemplateResolver: PropTypes.func,
};

export default EventItemPopover;
