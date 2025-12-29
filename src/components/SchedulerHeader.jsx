import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Calendar, Col, Popover, Radio, Row, Space, Spin } from 'antd';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { DATE_FORMAT } from '../config/default';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const SchedulerHeader = React.forwardRef(
  ({ onViewChange, goNext, goBack, onSelectDate, schedulerData, leftCustomHeader, rightCustomHeader, style }, ref) => {
    const [viewSpinning, setViewSpinning] = useState(false);
    const [dateSpinning, setDateSpinning] = useState(false);
    const [visible, setVisible] = useState(false);

    const { viewType, showAgenda, isEventPerspective, config } = schedulerData;
    const dateLabel = schedulerData.getDateLabel();
    const selectDate = schedulerData.getSelectedDate();
    const calendarLocale = schedulerData.getCalendarPopoverLocale()?.default?.Calendar;
    const defaultValue = `${viewType}${showAgenda ? 1 : 0}${isEventPerspective ? 1 : 0}`;

import React, { useEffect, useRef, useState } from 'react';

// ... other code ...

    const isMountedRef = useRef(true);

    useEffect(() => {
      return () => {
        isMountedRef.current = false;
      };
    }, []);

    const handleEvents = (func, isViewSpinning, funcArg) => {
      const isSpinEnabled = isViewSpinning ? config.viewChangeSpinEnabled : config.dateChangeSpinEnabled;

      const setSpin = isViewSpinning ? setViewSpinning : setDateSpinning;

      if (isSpinEnabled) {
        setSpin(true);
      }

      const coreFunc = () => {
        try {
          funcArg !== undefined ? func(funcArg) : func();
        } finally {
          if (isSpinEnabled && isMountedRef.current) {
            setSpin(false);
          }
        }
      };

      if (isSpinEnabled) {
        setTimeout(coreFunc, config.schedulerHeaderEventsFuncsTimeoutMs);
      } else {
        coreFunc();
      }
    };

    const popover = (
      <div className="rbs-popover-calendar">
        <Calendar
          locale={calendarLocale}
          defaultValue={dayjs(selectDate)}
          fullscreen={false}
          onSelect={date => {
            setVisible(false);
            handleEvents(onSelectDate, false, date.format(DATE_FORMAT));
          }}
        />
      </div>
    );

    const radioButtonList = config.views.map(item => (
      <RadioButton
        key={`${item.viewType}${item.showAgenda ? 1 : 0}${item.isEventPerspective ? 1 : 0}`}
        value={`${item.viewType}${item.showAgenda ? 1 : 0}${item.isEventPerspective ? 1 : 0}`}
      >
        <span style={{ margin: '0px 8px' }}>{item.viewName}</span>
      </RadioButton>
    ));

    return (
      <Row ref={ref} gutter={[10, 10]} align="middle" justify="space-between" style={{ ...style }}>
        {leftCustomHeader}
        <Col>
          <div className="header2-text">
            <Space>
              <div>
                <LeftOutlined
                  style={{ marginRight: '8px' }}
                  className="icon-nav"
                  onClick={() => handleEvents(goBack, false)}
                />
                {config.calendarPopoverEnabled ? (
                  <Popover
                    content={popover}
                    placement="bottomLeft"
                    trigger="click"
                    open={visible}
                    onOpenChange={setVisible}
                    overlayClassName="scheduler-header-popover"
                  >
                    <span className="header2-text-label" style={{ cursor: 'pointer' }}>
                      {dateLabel}
                    </span>
                  </Popover>
                ) : (
                  <span className="header2-text-label">{dateLabel}</span>
                )}
                <RightOutlined
                  style={{ marginLeft: '8px' }}
                  className="icon-nav"
                  onClick={() => handleEvents(goNext, false)}
                />
              </div>
              <Spin spinning={dateSpinning} />
            </Space>
          </div>
        </Col>
        <Col>
          <Space>
            <Spin spinning={viewSpinning} />
            <RadioGroup
              buttonStyle="solid"
              defaultValue={defaultValue}
              size="default"
              onChange={event => handleEvents(onViewChange, true, event)}
            >
              {radioButtonList}
            </RadioGroup>
          </Space>
        </Col>
        {rightCustomHeader}
      </Row>
    );
  }
);

SchedulerHeader.propTypes = {
  onViewChange: PropTypes.func.isRequired,
  goNext: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  onSelectDate: PropTypes.func.isRequired,
  schedulerData: PropTypes.object.isRequired,
  leftCustomHeader: PropTypes.object,
  rightCustomHeader: PropTypes.object,
  style: PropTypes.object,
};

SchedulerHeader.displayName = 'SchedulerHeader';

export default SchedulerHeader;
