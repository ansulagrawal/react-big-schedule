import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { CellUnit, DATETIME_FORMAT, DATE_FORMAT, SummaryPos, ViewType } from '../config/default';
import DemoData from '../sample-data/sample1';
import AddMorePopover from './AddMorePopover';
import AgendaView from './AgendaView';
import BodyView from './BodyView';
import DnDContext from './DnDContext';
import DnDSource from './DnDSource';
import HeaderView from './HeaderView';
import ResourceEvents from './ResourceEvents';
import ResourceView from './ResourceView';
import SchedulerData from './SchedulerData';
import SchedulerHeader from './SchedulerHeader';
import wrapperFun from './WrapperFun';

const initDndContext = (schedulerData, dndSources) => {
  let sources = [];
  sources.push(new DnDSource(dndProps => dndProps.eventItem, schedulerData.config.dragAndDropEnabled));
  if (dndSources !== undefined && dndSources.length > 0) {
    sources = [...sources, ...dndSources];
  }
  return new DnDContext(sources);
};

/**
 * Renders the scheduler UI with resource and agenda views, responsive sizing, and drag-and-drop support.
 * Optimized to minimize unnecessary re-renders through memoized callbacks, stable refs, and
 * selectively updated state.
 *
 * @param {object} props - Component properties.
 * @param {SchedulerData} props.schedulerData - The view model driving all scheduler state,
 * configuration, layout data, and rendering logic.
 * @param {Array<DnDSource>} [props.dndSources] - Additional drag-and-drop sources merged into
 * the scheduler's DnD context on first mount. The DnD context is initialized once and never rebuilt.
 * @param {React.RefObject<HTMLElement>} [props.parentRef] - Ref to the parent container element.
 * When provided alongside `responsiveByParent: true` in config, a ResizeObserver tracks the
 * parent's dimensions and triggers layout updates instead of listening to the window resize event.
 * @param {function(SchedulerData):void} props.prevClick - Callback invoked when the user navigates
 * to the previous time range.
 * @param {function(SchedulerData):void} props.nextClick - Callback invoked when the user navigates
 * to the next time range.
 * @param {function(SchedulerData, object):void} props.onViewChange - Callback invoked when the
 * view type, agenda toggle, or event perspective changes.
 * @param {function(SchedulerData, string|Date):void} props.onSelectDate - Callback invoked when
 * the user selects a new date from the calendar popover.
 * @param {function(SchedulerData, object):void} [props.onSetAddMoreState] - Callback invoked when
 * a '+N more' overflow indicator is clicked, used to control the AddMorePopover visibility and position.
 * @param {function(SchedulerData, object, string):void} [props.updateEventStart] - Callback invoked
 * when the user resizes the start of an event.
 * @param {function(SchedulerData, object, string):void} [props.updateEventEnd] - Callback invoked
 * when the user resizes the end of an event.
 * @param {function(SchedulerData, object, string, string, string, string):void} [props.moveEvent] -
 * Callback invoked when an event is dragged to a new slot or time range.
 * @param {function} [props.movingEvent] - Callback invoked continuously while an event is being dragged.
 * * @param {function(SchedulerData, object, string, string, string, string, string, string):void}
 * [props.conflictOccurred] -
 * Callback invoked when a scheduling conflict is detected during create, move, or resize.
 * @param {function(SchedulerData, object):string} [props.subtitleGetter] - Returns a subtitle string
 * displayed in the event item popover.
 * @param {function(SchedulerData, object):void} [props.eventItemClick] - Callback invoked when an
 * event item is clicked.
 * @param {function(SchedulerData, object):void} [props.viewEventClick] - Callback invoked when the
 * primary action link in the event popover is clicked.
 * @param {string} [props.viewEventText] - Label text for the primary action link in the event popover.
 * @param {function(SchedulerData, object):void} [props.viewEvent2Click] - Callback invoked when the
 * secondary action link in the event popover is clicked.
 * @param {string} [props.viewEvent2Text] - Label text for the secondary action link in the event popover.
 * @param {function(SchedulerData, string, string, string, string, string, object):void} [props.newEvent] -
 * Callback invoked when a new event is created by clicking and dragging on an empty cell, or when
 * an external item is dropped into the scheduler.
 * @param {function} [props.eventItemTemplateResolver] - Returns a custom JSX element used to render
 * each event item, overriding the default appearance.
 * @param {function(SchedulerData, object):void} [props.slotClickedFunc] - Callback invoked when a
 * resource slot label in the left column is clicked.
 * @param {function(SchedulerData, string):void} [props.toggleExpandFunc] - Callback invoked when a
 * parent resource slot's expand or collapse control is clicked.
 * @param {function} [props.slotItemTemplateResolver] - Returns a custom JSX element used to render
 * each resource slot cell in the left column.
 * @param {function} [props.nonAgendaCellHeaderTemplateResolver] - Returns a custom JSX element used
 * to render individual header cells in the timeline header row.
 * @param {function(SchedulerData, HTMLElement, number):void} [props.onScrollLeft] - Callback invoked
 * when the scheduler content is scrolled to the leftmost position.
 * @param {function(SchedulerData, HTMLElement, number):void} [props.onScrollRight] - Callback invoked
 * when the scheduler content is scrolled to the rightmost position.
 * @param {function(SchedulerData, HTMLElement, number):void} [props.onScrollTop] - Callback invoked
 * when the scheduler content is scrolled to the topmost position.
 * @param {function(SchedulerData, HTMLElement, number):void} [props.onScrollBottom] - Callback invoked
 * when the scheduler content is scrolled to the bottommost position.
 * @param {React.ReactNode} [props.leftCustomHeader] - Custom content rendered on the left side of
 * the scheduler header toolbar.
 * @param {React.ReactNode} [props.rightCustomHeader] - Custom content rendered on the right side of
 * the scheduler header toolbar.
 * @param {function} [props.CustomResourceHeader] - Optional component rendered inside the resource
 * column header cell, replacing the default resource name label.
 * @param {function} [props.CustomResourceCell] - Optional component rendered inside each resource
 * slot cell in the left column.
 * @param {object} [props.configTableHeaderStyle] - Optional inline style object merged into the
 * resource column header container, used to override default header styling.
 * @returns {JSX.Element} The root scheduler table element containing the header toolbar, resource
 * column, timeline header, and all resource event rows.
 */

function Scheduler(props) {
  const {
    schedulerData,
    dndSources,
    parentRef,
    prevClick,
    nextClick,
    onViewChange,
    onSelectDate,
    leftCustomHeader,
    rightCustomHeader,
    CustomResourceHeader,
    configTableHeaderStyle,
    onScrollLeft,
    onScrollRight,
    onScrollTop,
    onScrollBottom,
  } = props;

  const [dndContext] = useState(() => initDndContext(schedulerData, dndSources));
  const [contentScrollbarHeight, setContentScrollbarHeight] = useState(17);
  const [contentScrollbarWidth, setContentScrollbarWidth] = useState(17);
  const [resourceScrollbarHeight, setResourceScrollbarHeight] = useState(17);
  const [resourceScrollbarWidth, setResourceScrollbarWidth] = useState(17);
  const [schedulerDataVersion, setSchedulerDataVersion] = useReducer(x => x + 1, 0);

  // Scroll sync refs
  const schedulerHeadRef = useRef(null);
  const schedulerResourceRef = useRef(null);
  const schedulerContentRef = useRef(null);
  const schedulerContentBgTableRef = useRef(null);

  // Layout/header refs
  const schedulerHeaderRef = useRef(null);

  // Observer refs
  const ulObserverRef = useRef(null);
  const headerObserverRef = useRef(null);

  // Scroll position tracking
  const currentAreaRef = useRef(-1);
  const scrollLeftRef = useRef(0);
  const scrollTopRef = useRef(0);
  const scrollbarSizeRef = useRef({
    contentScrollbarHeight: 17,
    contentScrollbarWidth: 17,
    resourceScrollbarHeight: 17,
    resourceScrollbarWidth: 17,
  });

  const onWindowResize = useCallback(() => {
    schedulerData._setDocumentWidth(document.documentElement.clientWidth);
    schedulerData._setDocumentHeight(document.documentElement.clientHeight);
    setSchedulerDataVersion();
  }, [schedulerData]);

  useEffect(() => {
    if (
      (schedulerData.isSchedulerResponsive() && !schedulerData.config.responsiveByParent) ||
      parentRef === undefined
    ) {
      schedulerData._setDocumentWidth(document.documentElement.clientWidth);
      schedulerData._setDocumentHeight(document.documentElement.clientHeight);
      window.addEventListener('resize', onWindowResize);
      return () => window.removeEventListener('resize', onWindowResize);
    }
  }, [schedulerData, parentRef, onWindowResize]);

  useEffect(() => {
    if (parentRef !== undefined && schedulerData.config.responsiveByParent && !!parentRef.current) {
      schedulerData._setDocumentWidth(parentRef.current.offsetWidth);

      ulObserverRef.current = new ResizeObserver(() => {
        if (parentRef.current) {
          schedulerData._setDocumentWidth(parentRef.current.offsetWidth);
          schedulerData._setDocumentHeight(parentRef.current.offsetHeight);
          setSchedulerDataVersion();
        }
      });

      ulObserverRef.current.observe(parentRef.current);

      return () => {
        if (ulObserverRef.current && parentRef.current) {
          ulObserverRef.current.unobserve(parentRef.current);
        }
      };
    }
  }, [parentRef, schedulerData]);

  useEffect(() => {
    if (schedulerData.config.responsiveByParent && !!schedulerHeaderRef.current) {
      schedulerData._setDocumentWidth(schedulerHeaderRef.current.offsetWidth);
      schedulerData._setDocumentHeight(schedulerHeaderRef.current.offsetHeight);

      headerObserverRef.current = new ResizeObserver(entries => {
        entries.forEach(entry => {
          const node = entry.target;
          const rect = node.getBoundingClientRect();
          const style = window.getComputedStyle(node);
          const totalHeight = rect.height + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
          schedulerData._setSchedulerHeaderHeight(totalHeight);
          setSchedulerDataVersion();
        });
      });

      headerObserverRef.current.observe(schedulerHeaderRef.current);

      return () => {
        if (headerObserverRef.current && schedulerHeaderRef.current) {
          headerObserverRef.current.unobserve(schedulerHeaderRef.current);
        }
      };
    }
  }, [schedulerHeaderRef, schedulerData]);

  const resolveScrollbarSize = useCallback(() => {
    const prev = scrollbarSizeRef.current;

    const newContentHeight = schedulerContentRef.current
      ? schedulerContentRef.current.offsetHeight - schedulerContentRef.current.clientHeight
      : 17;
    const newContentWidth = schedulerContentRef.current
      ? schedulerContentRef.current.offsetWidth - schedulerContentRef.current.clientWidth
      : 17;
    const newResourceHeight = schedulerResourceRef.current
      ? schedulerResourceRef.current.offsetHeight - schedulerResourceRef.current.clientHeight
      : 17;
    const newResourceWidth = schedulerResourceRef.current
      ? schedulerResourceRef.current.offsetWidth - schedulerResourceRef.current.clientWidth
      : 17;

    if (newContentHeight !== prev.contentScrollbarHeight) {
      setContentScrollbarHeight(newContentHeight);
      scrollbarSizeRef.current.contentScrollbarHeight = newContentHeight;
    }
    if (newContentWidth !== prev.contentScrollbarWidth) {
      setContentScrollbarWidth(newContentWidth);
      scrollbarSizeRef.current.contentScrollbarWidth = newContentWidth;
    }
    if (newResourceHeight !== prev.resourceScrollbarHeight) {
      setResourceScrollbarHeight(newResourceHeight);
      scrollbarSizeRef.current.resourceScrollbarHeight = newResourceHeight;
    }
    if (newResourceWidth !== prev.resourceScrollbarWidth) {
      setResourceScrollbarWidth(newResourceWidth);
      scrollbarSizeRef.current.resourceScrollbarWidth = newResourceWidth;
    }
  }, []);

  useEffect(() => {
    resolveScrollbarSize();

    const { localeDayjs, behaviors } = schedulerData;
    if (schedulerData.getScrollToSpecialDayjs() && !!behaviors.getScrollSpecialDayjsFunc) {
      if (
        !!schedulerContentRef.current &&
        schedulerContentRef.current.scrollWidth > schedulerContentRef.current.clientWidth
      ) {
        const start = localeDayjs(new Date(schedulerData.startDate)).startOf('day');
        const end = localeDayjs(new Date(schedulerData.endDate)).endOf('day');
        const specialDayjs = behaviors.getScrollSpecialDayjsFunc(schedulerData, start, end);
        if (specialDayjs >= start && specialDayjs <= end) {
          let index = 0;
          schedulerData.headers.forEach(item => {
            if (specialDayjs >= localeDayjs(new Date(item.time))) index += 1;
          });
          schedulerContentRef.current.scrollLeft = (index - 1) * schedulerData.getContentCellWidth();
          schedulerData.setScrollToSpecialDayjs(false);
        }
      }
    }
  }, [schedulerData, resolveScrollbarSize]);

  const onSchedulerHeadMouseOver = useCallback(() => {
    currentAreaRef.current = 2;
  }, []);
  const onSchedulerHeadMouseOut = useCallback(() => {
    currentAreaRef.current = -1;
  }, []);
  const onSchedulerHeadScroll = useCallback(() => {
    if (
      (currentAreaRef.current === 2 || currentAreaRef.current === -1) &&
      schedulerContentRef.current.scrollLeft !== schedulerHeadRef.current.scrollLeft
    ) {
      schedulerContentRef.current.scrollLeft = schedulerHeadRef.current.scrollLeft;
    }
  }, []);

  const onSchedulerResourceMouseOver = useCallback(() => {
    currentAreaRef.current = 1;
  }, []);
  const onSchedulerResourceMouseOut = useCallback(() => {
    currentAreaRef.current = -1;
  }, []);
  const onSchedulerResourceScroll = useCallback(() => {
    if (
      schedulerResourceRef.current &&
      (currentAreaRef.current === 1 || currentAreaRef.current === -1) &&
      schedulerContentRef.current.scrollTop !== schedulerResourceRef.current.scrollTop
    ) {
      schedulerContentRef.current.scrollTop = schedulerResourceRef.current.scrollTop;
    }
  }, []);

  const onSchedulerContentMouseOver = useCallback(() => {
    currentAreaRef.current = 0;
  }, []);
  const onSchedulerContentMouseOut = useCallback(() => {
    currentAreaRef.current = -1;
  }, []);
  const onSchedulerContentScroll = useCallback(() => {
    if (schedulerResourceRef.current) {
      if (currentAreaRef.current === 0 || currentAreaRef.current === -1) {
        if (schedulerHeadRef.current.scrollLeft !== schedulerContentRef.current.scrollLeft) {
          schedulerHeadRef.current.scrollLeft = schedulerContentRef.current.scrollLeft;
        }
        if (schedulerResourceRef.current.scrollTop !== schedulerContentRef.current.scrollTop) {
          schedulerResourceRef.current.scrollTop = schedulerContentRef.current.scrollTop;
        }
      }
    }

    if (schedulerContentRef.current.scrollLeft !== scrollLeftRef.current) {
      if (schedulerContentRef.current.scrollLeft === 0 && onScrollLeft !== undefined) {
        onScrollLeft(
          schedulerData,
          schedulerContentRef.current,
          schedulerContentRef.current.scrollWidth - schedulerContentRef.current.clientWidth
        );
      }
      if (
        Math.round(schedulerContentRef.current.scrollLeft) ===
          schedulerContentRef.current.scrollWidth - schedulerContentRef.current.clientWidth &&
        onScrollRight !== undefined
      ) {
        onScrollRight(
          schedulerData,
          schedulerContentRef.current,
          schedulerContentRef.current.scrollWidth - schedulerContentRef.current.clientWidth
        );
      }
    } else if (schedulerContentRef.current.scrollTop !== scrollTopRef.current) {
      if (schedulerContentRef.current.scrollTop === 0 && onScrollTop !== undefined) {
        onScrollTop(
          schedulerData,
          schedulerContentRef.current,
          schedulerContentRef.current.scrollHeight - schedulerContentRef.current.clientHeight
        );
      }
      if (
        Math.round(schedulerContentRef.current.scrollTop) ===
          schedulerContentRef.current.scrollHeight - schedulerContentRef.current.clientHeight &&
        onScrollBottom !== undefined
      ) {
        onScrollBottom(
          schedulerData,
          schedulerContentRef.current,
          schedulerContentRef.current.scrollHeight - schedulerContentRef.current.clientHeight
        );
      }
    }

    scrollLeftRef.current = schedulerContentRef.current.scrollLeft;
    scrollTopRef.current = schedulerContentRef.current.scrollTop;
  }, [schedulerData, onScrollLeft, onScrollRight, onScrollTop, onScrollBottom]); // ✅ no props ref

  const handleViewChange = useCallback(
    e => {
      const viewType = parseInt(e.target.value.charAt(0), 10);
      const showAgenda = e.target.value.charAt(1) === '1';
      const isEventPerspective = e.target.value.charAt(2) === '1';
      onViewChange(schedulerData, { viewType, showAgenda, isEventPerspective });
    },
    [onViewChange, schedulerData]
  );

  const goNext = useCallback(() => nextClick(schedulerData), [nextClick, schedulerData]);
  const goBack = useCallback(() => prevClick(schedulerData), [prevClick, schedulerData]);
  const onSelect = useCallback(date => onSelectDate(schedulerData, date), [onSelectDate, schedulerData]);

  const { viewType, renderData, showAgenda, config } = schedulerData;
  const width = schedulerData.getSchedulerWidth();
  const { showWeekNumber, weekNumberRowHeight } = config;

  const displayRenderData = useMemo(() => renderData.filter(o => o.render), [renderData]);
  const eventDndSource = dndContext.getDndSource();
  const resourceEventsList = useMemo(
    () =>
      displayRenderData.map(item => (
        <ResourceEvents
          key={item.slotId}
          resourceEvents={item}
          schedulerData={schedulerData}
          schedulerDataVersion={schedulerDataVersion}
          dndSource={eventDndSource}
          dndContext={dndContext}
          onSetAddMoreState={props.onSetAddMoreState}
          updateEventStart={props.updateEventStart}
          updateEventEnd={props.updateEventEnd}
          moveEvent={props.moveEvent}
          movingEvent={props.movingEvent}
          conflictOccurred={props.conflictOccurred}
          subtitleGetter={props.subtitleGetter}
          eventItemClick={props.eventItemClick}
          viewEventClick={props.viewEventClick}
          viewEventText={props.viewEventText}
          viewEvent2Click={props.viewEvent2Click}
          viewEvent2Text={props.viewEvent2Text}
          newEvent={props.newEvent}
          eventItemTemplateResolver={props.eventItemTemplateResolver}
        />
      )),
    [
      displayRenderData,
      schedulerData,
      schedulerDataVersion,
      eventDndSource,
      dndContext,
      props.onSetAddMoreState,
      props.updateEventStart,
      props.updateEventEnd,
      props.moveEvent,
      props.movingEvent,
      props.conflictOccurred,
      props.subtitleGetter,
      props.eventItemClick,
      props.viewEventClick,
      props.viewEventText,
      props.viewEvent2Click,
      props.viewEvent2Text,
      props.newEvent,
      props.eventItemTemplateResolver,
    ]
  );

  let tbodyContent = <tr />;
  if (showAgenda) {
    tbodyContent = (
      <AgendaView
        schedulerData={schedulerData}
        subtitleGetter={props.subtitleGetter}
        eventItemClick={props.eventItemClick}
        viewEventClick={props.viewEventClick}
        viewEventText={props.viewEventText}
        viewEvent2Click={props.viewEvent2Click}
        viewEvent2Text={props.viewEvent2Text}
        slotClickedFunc={props.slotClickedFunc}
        slotItemTemplateResolver={props.slotItemTemplateResolver}
        eventItemTemplateResolver={props.eventItemTemplateResolver}
        eventItemPopoverTemplateResolver={props.eventItemPopoverTemplateResolver}
      />
    );
  } else {
    const resourceTableWidth = schedulerData.getResourceTableWidth();
    const schedulerContainerWidth = width - (config.resourceViewEnabled ? resourceTableWidth : 0);
    const schedulerWidth = schedulerData.getContentTableWidth() - 1;

    const contentHeight = config.schedulerContentHeight;
    const resourcePaddingBottom = resourceScrollbarHeight === 0 ? contentScrollbarHeight : 0;
    const contentPaddingBottom = contentScrollbarHeight === 0 ? resourceScrollbarHeight : 0;

    let schedulerContentStyle = {
      overflowX: viewType === ViewType.Week ? 'hidden' : 'auto',
      overflowY: 'auto',
      margin: '0px',
      position: 'relative',
      height: contentHeight,
      paddingBottom: contentPaddingBottom,
    };

    let resourceContentStyle = {
      height: contentHeight,
      overflowX: 'auto',
      overflowY: 'auto',
      width: resourceTableWidth + resourceScrollbarWidth - 2,
      margin: `0px -${contentScrollbarWidth}px 0px 0px`,
    };

    if (config.schedulerMaxHeight > 0) {
      const totalHeaderHeight = config.tableHeaderHeight + (showWeekNumber ? weekNumberRowHeight : 0);
      schedulerContentStyle = { ...schedulerContentStyle, maxHeight: config.schedulerMaxHeight - totalHeaderHeight };
      resourceContentStyle = { ...resourceContentStyle, maxHeight: config.schedulerMaxHeight - totalHeaderHeight };
    } else if (config.responsiveByParent && schedulerData.documentHeight > 0) {
      const availableHeight = schedulerData.getSchedulerHeight();
      schedulerContentStyle = { ...schedulerContentStyle, height: availableHeight };
      resourceContentStyle = { ...resourceContentStyle, height: availableHeight };
    }

    const resourceName = schedulerData.isEventPerspective ? config.taskName : config.resourceName;

    const resourceColumnStyle = {
      display: config.resourceViewEnabled ? undefined : 'none',
      width: resourceTableWidth,
      verticalAlign: 'top',
    };

    const resourceHeaderStyle = {
      borderBottom: `1px solid ${config.headerBorderColor ?? '#e9e9e9'}`,
      height: config.tableHeaderHeight + (showWeekNumber ? weekNumberRowHeight : 0),
      ...configTableHeaderStyle,
    };

    const resourceHeaderScrollStyle = {
      overflowX: 'scroll',
      overflowY: 'hidden',
      margin: `0px 0px -${contentScrollbarHeight}px`,
    };

    const schedulerViewStyle = {
      width: schedulerContainerWidth,
      verticalAlign: 'top',
    };

    const schedulerHeadWrapperStyle = {
      overflow: 'hidden',
      borderBottom: `1px solid ${config.headerBorderColor ?? '#e9e9e9'}`,
      height: config.tableHeaderHeight + (showWeekNumber ? weekNumberRowHeight : 0),
    };

    const schedulerHeadScrollStyle = {
      overflowX: 'scroll',
      overflowY: 'hidden',
      margin: `0px 0px -${contentScrollbarHeight}px`,
    };

    const schedulerHeadInnerStyle = {
      paddingRight: `${contentScrollbarWidth}px`,
      width: schedulerWidth + contentScrollbarWidth,
    };

    const weekNumberRowStyle = useMemo(() => ({ height: weekNumberRowHeight }), [weekNumberRowHeight]);

    const weekNumberThStyle = useMemo(
      () => ({
        borderBottom: `1px solid ${config.headerBorderColor ?? '#e9e9e9'}`,
        fontSize: '0.85em',
        opacity: 0.7,
        padding: '4px 8px',
      }),
      [config.headerBorderColor]
    );

    const schedulerInnerStyle = useMemo(() => ({ width: schedulerWidth }), [schedulerWidth]);

    tbodyContent = (
      <tr>
        <td style={resourceColumnStyle}>
          <div className="resource-view">
            <div style={resourceHeaderStyle}>
              <div style={resourceHeaderScrollStyle}>
                <table className="resource-table">
                  <thead>
                    {showWeekNumber && (
                      <tr style={weekNumberRowStyle}>
                        <th style={weekNumberThStyle}>{config.weekNumberLabel ?? 'Week No.'}</th>
                      </tr>
                    )}
                    <tr style={{ height: config.tableHeaderHeight }}>
                      <th className="header3-text">{CustomResourceHeader ? <CustomResourceHeader /> : resourceName}</th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
            <div
              style={resourceContentStyle}
              ref={schedulerResourceRef}
              onMouseOver={onSchedulerResourceMouseOver}
              onFocus={onSchedulerResourceMouseOver}
              onMouseOut={onSchedulerResourceMouseOut}
              onBlur={onSchedulerResourceMouseOut}
              onScroll={onSchedulerResourceScroll}
            >
              <ResourceView
                schedulerData={schedulerData}
                schedulerDataVersion={schedulerDataVersion}
                contentScrollbarHeight={resourcePaddingBottom}
                slotClickedFunc={props.slotClickedFunc}
                slotItemTemplateResolver={props.slotItemTemplateResolver}
                toggleExpandFunc={props.toggleExpandFunc}
                CustomResourceCell={props.CustomResourceCell}
              />
            </div>
          </div>
        </td>
        <td>
          <div className="scheduler-view" style={schedulerViewStyle}>
            <div style={schedulerHeadWrapperStyle}>
              <div
                style={schedulerHeadScrollStyle}
                ref={schedulerHeadRef}
                onMouseOver={onSchedulerHeadMouseOver}
                onFocus={onSchedulerHeadMouseOver}
                onMouseOut={onSchedulerHeadMouseOut}
                onBlur={onSchedulerHeadMouseOut}
                onScroll={onSchedulerHeadScroll}
                aria-label="Scheduler Header"
              >
                <div style={schedulerHeadInnerStyle}>
                  <table className="scheduler-bg-table">
                    <HeaderView
                      schedulerData={schedulerData}
                      schedulerDataVersion={schedulerDataVersion}
                      nonAgendaCellHeaderTemplateResolver={props.nonAgendaCellHeaderTemplateResolver}
                    />
                  </table>
                </div>
              </div>
            </div>
            <div
              style={schedulerContentStyle}
              ref={schedulerContentRef}
              onMouseOver={onSchedulerContentMouseOver}
              onFocus={onSchedulerContentMouseOver}
              onMouseOut={onSchedulerContentMouseOut}
              onBlur={onSchedulerContentMouseOut}
              onScroll={onSchedulerContentScroll}
            >
              <div style={schedulerInnerStyle}>
                <div className="scheduler-content">
                  <table className="scheduler-content-table">
                    <tbody>{resourceEventsList}</tbody>
                  </table>
                </div>
                <div className="scheduler-bg">
                  <table className="scheduler-bg-table" style={schedulerInnerStyle} ref={schedulerContentBgTableRef}>
                    <BodyView schedulerData={schedulerData} schedulerDataVersion={schedulerDataVersion} />
                  </table>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  const schedulerHeaderStyle = useMemo(
    () => ({
      display: config.headerEnabled ? undefined : 'none',
      marginBottom: config.headerEnabled ? '24px' : undefined,
    }),
    [config.headerEnabled]
  );

  const schedulerHeader = useMemo(
    () => (
      <SchedulerHeader
        ref={schedulerHeaderRef}
        style={schedulerHeaderStyle}
        onViewChange={handleViewChange}
        schedulerData={schedulerData}
        onSelectDate={onSelect}
        goNext={goNext}
        goBack={goBack}
        rightCustomHeader={rightCustomHeader}
        leftCustomHeader={leftCustomHeader}
      />
    ),
    [
      schedulerHeaderStyle,
      handleViewChange,
      schedulerData,
      onSelect,
      goNext,
      goBack,
      rightCustomHeader,
      leftCustomHeader,
    ]
  );

  const rootTableStyle = useMemo(() => ({ width: `${width}px` }), [width]);

  return (
    <table id="rbs-root" className="rbs" style={rootTableStyle}>
      <thead>
        <tr>
          <td colSpan="2">{schedulerHeader}</td>
        </tr>
      </thead>
      <tbody>{tbodyContent}</tbody>
    </table>
  );
}

Scheduler.propTypes = {
  parentRef: PropTypes.object,
  schedulerData: PropTypes.object.isRequired,
  prevClick: PropTypes.func.isRequired,
  nextClick: PropTypes.func.isRequired,
  onViewChange: PropTypes.func.isRequired,
  onSelectDate: PropTypes.func.isRequired,
  onSetAddMoreState: PropTypes.func,
  updateEventStart: PropTypes.func,
  updateEventEnd: PropTypes.func,
  moveEvent: PropTypes.func,
  movingEvent: PropTypes.func,
  leftCustomHeader: PropTypes.object,
  rightCustomHeader: PropTypes.object,
  newEvent: PropTypes.func,
  subtitleGetter: PropTypes.func,
  eventItemClick: PropTypes.func,
  viewEventClick: PropTypes.func,
  viewEventText: PropTypes.string,
  viewEvent2Click: PropTypes.func,
  viewEvent2Text: PropTypes.string,
  conflictOccurred: PropTypes.func,
  eventItemTemplateResolver: PropTypes.func,
  dndSources: PropTypes.array,
  slotClickedFunc: PropTypes.func,
  toggleExpandFunc: PropTypes.func,
  slotItemTemplateResolver: PropTypes.func,
  nonAgendaCellHeaderTemplateResolver: PropTypes.func,
  onScrollLeft: PropTypes.func,
  onScrollRight: PropTypes.func,
  onScrollTop: PropTypes.func,
  onScrollBottom: PropTypes.func,
  CustomResourceHeader: PropTypes.func,
  CustomResourceCell: PropTypes.func,
  configTableHeaderStyle: PropTypes.object,
};

export {
  AddMorePopover,
  CellUnit,
  DATETIME_FORMAT,
  DATE_FORMAT,
  DemoData,
  DnDContext,
  DnDSource,
  Scheduler,
  SchedulerData,
  SummaryPos,
  ViewType,
  wrapperFun,
};
