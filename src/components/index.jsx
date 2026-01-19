import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
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

/**
 * Render the scheduler UI with resource and agenda views, responsive sizing, and drag-and-drop support.
 *
 * @param {object} props - Component properties.
 * @param {SchedulerData} props.schedulerData - Scheduler state and configuration used to drive rendering and behavior.
 * @param {Array<DnDSource>} [props.dndSources] - Additional drag-and-drop sources to merge into the scheduler's DnD context.
 * @param {React.RefObject<HTMLElement>} [props.parentRef] - Parent element ref used when sizing is driven by the parent container.
 * @param {function(SchedulerData):void} props.prevClick - Callback invoked to navigate to the previous range.
 * @param {function(SchedulerData):void} props.nextClick - Callback invoked to navigate to the next range.
 * @param {function(SchedulerData, object):void} props.onViewChange - Callback invoked when the view type, agenda toggle, or perspective changes.
 * @param {function(SchedulerData, string|Date):void} props.onSelectDate - Callback invoked when a date is selected.
 * @param {React.ReactNode} [props.leftCustomHeader] - Optional custom content rendered on the left side of the header.
 * @param {React.ReactNode} [props.rightCustomHeader] - Optional custom content rendered on the right side of the header.
 * @param {function} [props.CustomResourceHeader] - Optional component used to render the resource header cell.
 * @param {object} [props.configTableHeaderStyle] - Optional inline style object applied to the resource header container.
 * @returns {JSX.Element} The scheduler root element tree to be rendered.
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
  } = props;

  // Initialize DnD context
  const initDndContext = () => {
    let sources = [];
    sources.push(new DnDSource(dndProps => dndProps.eventItem, schedulerData.config.dragAndDropEnabled));
    if (dndSources !== undefined && dndSources.length > 0) {
      sources = [...sources, ...dndSources];
    }
    return new DnDContext(sources);
  };

  // State initialization
  const [state, setState] = useState({
    dndContext: initDndContext(),
    contentScrollbarHeight: 17,
    contentScrollbarWidth: 17,
    resourceScrollbarHeight: 17,
    resourceScrollbarWidth: 17,
    documentWidth: 0,
    documentHeight: 0,
    headerHeight: 0,
  });

  // Refs instead of class properties
  const currentAreaRef = useRef(-1);
  const scrollLeftRef = useRef(0);
  const scrollTopRef = useRef(0);
  const schedulerHeadRef = useRef(null);
  const schedulerHeaderRef = useRef(null);
  const schedulerResourceRef = useRef(null);
  const schedulerContentRef = useRef(null);
  const schedulerContentBgTableRef = useRef(null);
  const ulObserverRef = useRef(null);
  const headerObserverRef = useRef(null);

  // Window resize handler
  const onWindowResize = useCallback(() => {
    schedulerData._setDocumentWidth(document.documentElement.clientWidth);
    schedulerData._setDocumentHeight(document.documentElement.clientHeight);
    setState(prevState => ({
      ...prevState,
      documentWidth: document.documentElement.clientWidth,
      documentHeight: document.documentElement.clientHeight,
    }));
  }, [schedulerData]);

  // Effect for window resize event
  useEffect(() => {
    if (
      (schedulerData.isSchedulerResponsive() && !schedulerData.config.responsiveByParent) ||
      parentRef === undefined
    ) {
      schedulerData._setDocumentWidth(document.documentElement.clientWidth);
      schedulerData._setDocumentHeight(document.documentElement.clientHeight);
      window.addEventListener('resize', onWindowResize);

      return () => {
        window.removeEventListener('resize', onWindowResize);
      };
    }
  }, [schedulerData, parentRef, onWindowResize]);

  // Effect for parent element resize observation
  useEffect(() => {
    if (parentRef !== undefined) {
      if (schedulerData.config.responsiveByParent && !!parentRef.current) {
        schedulerData._setDocumentWidth(parentRef.current.offsetWidth);

        ulObserverRef.current = new ResizeObserver(() => {
          if (parentRef.current) {
            const width = parentRef.current.offsetWidth;
            const height = parentRef.current.offsetHeight;
            schedulerData._setDocumentWidth(width);
            schedulerData._setDocumentHeight(height);
            setState(prevState => ({
              ...prevState,
              documentWidth: width,
              documentHeight: height,
            }));
          }
        });

        ulObserverRef.current.observe(parentRef.current);

        return () => {
          if (ulObserverRef.current && parentRef.current) {
            ulObserverRef.current.unobserve(parentRef.current);
          }
        };
      }
    }
  }, [parentRef, schedulerData]);

  // Effect for scheduler header resize observation
  useEffect(() => {
    if (schedulerHeaderRef !== undefined) {
      if (schedulerData.config.responsiveByParent && !!schedulerHeaderRef.current) {
        schedulerData._setDocumentWidth(schedulerHeaderRef.current.offsetWidth);
        schedulerData._setDocumentHeight(schedulerHeaderRef.current.offsetHeight);
        headerObserverRef.current = new ResizeObserver(entries => {
          entries.forEach(entry => {
            // Get the DOM node
            const node = entry.target;
            // Get the height from the bounding rect (includes padding and border)
            const rect = node.getBoundingClientRect();
            // Get computed styles for margins
            const style = window.getComputedStyle(node);
            const marginTop = parseFloat(style.marginTop) || 0;
            const marginBottom = parseFloat(style.marginBottom) || 0;
            // Total height including margins
            const totalHeight = rect.height + marginTop + marginBottom;
            schedulerData._setSchedulerHeaderHeight(totalHeight);
            setState(prevState => ({
              ...prevState,
              headerHeight: totalHeight,
            }));
          });
        });

        headerObserverRef.current.observe(schedulerHeaderRef.current);

        return () => {
          if (headerObserverRef.current && schedulerHeaderRef.current) {
            headerObserverRef.current.unobserve(schedulerHeaderRef.current);
          }
        };
      }
    }
  }, [schedulerHeaderRef, schedulerData]);

  // Resolving scrollbar sizes
  const resolveScrollbarSize = useCallback(() => {
    let contentScrollbarHeight = 17;
    let contentScrollbarWidth = 17;
    let resourceScrollbarHeight = 17;
    let resourceScrollbarWidth = 17;

    if (schedulerContentRef.current) {
      contentScrollbarHeight = schedulerContentRef.current.offsetHeight - schedulerContentRef.current.clientHeight;
      contentScrollbarWidth = schedulerContentRef.current.offsetWidth - schedulerContentRef.current.clientWidth;
    }

    if (schedulerResourceRef.current) {
      resourceScrollbarHeight = schedulerResourceRef.current.offsetHeight - schedulerResourceRef.current.clientHeight;
      resourceScrollbarWidth = schedulerResourceRef.current.offsetWidth - schedulerResourceRef.current.clientWidth;
    }

    let needSet = false;
    let tmpState = {};

    if (contentScrollbarHeight !== state.contentScrollbarHeight) {
      tmpState = { ...tmpState, contentScrollbarHeight };
      needSet = true;
    }
    if (contentScrollbarWidth !== state.contentScrollbarWidth) {
      tmpState = { ...tmpState, contentScrollbarWidth };
      needSet = true;
    }
    if (resourceScrollbarHeight !== state.resourceScrollbarHeight) {
      tmpState = { ...tmpState, resourceScrollbarHeight };
      needSet = true;
    }
    if (resourceScrollbarWidth !== state.resourceScrollbarWidth) {
      tmpState = { ...tmpState, resourceScrollbarWidth };
      needSet = true;
    }

    if (needSet) {
      setState(prevState => ({
        ...prevState,
        ...tmpState,
      }));
    }
  }, [
    state.contentScrollbarHeight,
    state.contentScrollbarWidth,
    state.resourceScrollbarHeight,
    state.resourceScrollbarWidth,
  ]);

  // Effect for scrollToSpecialDayjs functionality
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
            const header = localeDayjs(new Date(item.time));
            if (specialDayjs >= header) {
              index += 1;
            }
          });
          schedulerContentRef.current.scrollLeft = (index - 1) * schedulerData.getContentCellWidth();

          schedulerData.setScrollToSpecialDayjs(false);
        }
      }
    }
  }, [schedulerData, resolveScrollbarSize]);

  // Mouse event handlers
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
    if (schedulerResourceRef.current) {
      if (
        (currentAreaRef.current === 1 || currentAreaRef.current === -1) &&
        schedulerContentRef.current.scrollTop !== schedulerResourceRef.current.scrollTop
      ) {
        schedulerContentRef.current.scrollTop = schedulerResourceRef.current.scrollTop;
      }
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

    const { onScrollLeft, onScrollRight, onScrollTop, onScrollBottom } = props;

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
  }, [props, schedulerData]);

  // Event handlers
  const handleViewChange = useCallback(
    e => {
      const viewType = parseInt(e.target.value.charAt(0), 10);
      const showAgenda = e.target.value.charAt(1) === '1';
      const isEventPerspective = e.target.value.charAt(2) === '1';
      onViewChange(schedulerData, { viewType, showAgenda, isEventPerspective });
    },
    [onViewChange, schedulerData]
  );

  const goNext = useCallback(() => {
    nextClick(schedulerData);
  }, [nextClick, schedulerData]);

  const goBack = useCallback(() => {
    prevClick(schedulerData);
  }, [prevClick, schedulerData]);

  const onSelect = useCallback(
    date => {
      onSelectDate(schedulerData, date);
    },
    [onSelectDate, schedulerData]
  );

  // Rendering
  const { viewType, renderData, showAgenda, config } = schedulerData;
  const width = schedulerData.getSchedulerWidth();
  const { contentScrollbarHeight, contentScrollbarWidth, resourceScrollbarHeight, resourceScrollbarWidth } = state;

  const { showWeekNumber, weekNumberRowHeight } = config;

  let tbodyContent = <tr />;
  if (showAgenda) {
    tbodyContent = <AgendaView {...props} />;
  } else {
    const resourceTableWidth = schedulerData.getResourceTableWidth();
    const schedulerContainerWidth = width - (config.resourceViewEnabled ? resourceTableWidth : 0);
    const schedulerWidth = schedulerData.getContentTableWidth() - 1;
    const eventDndSource = state.dndContext.getDndSource();

    const displayRenderData = renderData.filter(o => o.render);
    const resourceEventsList = displayRenderData.map(item => (
      <ResourceEvents
        {...props}
        key={item.slotId}
        resourceEvents={item}
        dndSource={eventDndSource}
        dndContext={state.dndContext}
      />
    ));

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
      schedulerContentStyle = {
        ...schedulerContentStyle,
        maxHeight: config.schedulerMaxHeight - totalHeaderHeight,
      };
      resourceContentStyle = {
        ...resourceContentStyle,
        maxHeight: config.schedulerMaxHeight - totalHeaderHeight,
      };
    } else if (config.responsiveByParent && schedulerData.documentHeight > 0) {
      // Responsive height minus SchedulerHeader
      const availableHeight = schedulerData.getSchedulerHeight();

      schedulerContentStyle = {
        ...schedulerContentStyle,
        height: availableHeight,
      };
      resourceContentStyle = {
        ...resourceContentStyle,
        height: availableHeight,
      };
    }

    const resourceName = schedulerData.isEventPerspective ? config.taskName : config.resourceName;

    tbodyContent = (
      <tr>
        <td
          style={{
            display: config.resourceViewEnabled ? undefined : 'none',
            width: resourceTableWidth,
            verticalAlign: 'top',
          }}
        >
          <div className="resource-view">
            <div
              style={{
                borderBottom: `1px solid ${config.headerBorderColor ?? '#e9e9e9'}`,
                height: config.tableHeaderHeight + (showWeekNumber ? weekNumberRowHeight : 0),
                ...configTableHeaderStyle,
              }}
            >
              <div
                style={{
                  overflowX: 'scroll',
                  overflowY: 'hidden',
                  margin: `0px 0px -${contentScrollbarHeight}px`,
                }}
              >
                <table className="resource-table">
                  <thead>
                    {showWeekNumber && (
                      <tr style={{ height: weekNumberRowHeight }}>
                        <th
                          style={{
                            borderBottom: `1px solid ${config.headerBorderColor ?? '#e9e9e9'}`,
                            fontSize: '0.85em',
                            opacity: 0.7,
                            padding: '4px 8px',
                          }}
                        >
                          {config.weekNumberLabel ?? 'Week No.'}
                        </th>
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
              <ResourceView {...props} contentScrollbarHeight={resourcePaddingBottom} />
            </div>
          </div>
        </td>
        <td>
          <div className="scheduler-view" style={{ width: schedulerContainerWidth, verticalAlign: 'top' }}>
            <div
              style={{
                overflow: 'hidden',
                borderBottom: `1px solid ${config.headerBorderColor ?? '#e9e9e9'}`,
                height: config.tableHeaderHeight + (showWeekNumber ? weekNumberRowHeight : 0),
              }}
            >
              <div
                style={{ overflowX: 'scroll', overflowY: 'hidden', margin: `0px 0px -${contentScrollbarHeight}px` }}
                ref={schedulerHeadRef}
                onMouseOver={onSchedulerHeadMouseOver}
                onFocus={onSchedulerHeadMouseOver}
                onMouseOut={onSchedulerHeadMouseOut}
                onBlur={onSchedulerHeadMouseOut}
                onScroll={onSchedulerHeadScroll}
                aria-label="Scheduler Header"
              >
                <div
                  style={{ paddingRight: `${contentScrollbarWidth}px`, width: schedulerWidth + contentScrollbarWidth }}
                >
                  <table className="scheduler-bg-table">
                    <HeaderView {...props} />
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
              <div style={{ width: schedulerWidth }}>
                <div className="scheduler-content">
                  <table className="scheduler-content-table">
                    <tbody>{resourceEventsList}</tbody>
                  </table>
                </div>
                <div className="scheduler-bg">
                  <table
                    className="scheduler-bg-table"
                    style={{ width: schedulerWidth }}
                    ref={schedulerContentBgTableRef}
                  >
                    <BodyView {...props} />
                  </table>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  const schedulerHeader = (
    <SchedulerHeader
      ref={schedulerHeaderRef}
      style={{
        display: config.headerEnabled ? undefined : 'none',
        marginBottom: config.headerEnabled ? '24px' : undefined,
      }}
      onViewChange={handleViewChange}
      schedulerData={schedulerData}
      onSelectDate={onSelect}
      goNext={goNext}
      goBack={goBack}
      rightCustomHeader={rightCustomHeader}
      leftCustomHeader={leftCustomHeader}
    />
  );

  return (
    <table id="rbs-root" className="rbs" style={{ width: `${width}px` }}>
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
