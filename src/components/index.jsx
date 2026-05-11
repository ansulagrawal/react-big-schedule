import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CellUnit, DATE_FORMAT, DATETIME_FORMAT, SummaryPos, ViewType } from '../config/default';
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
 * Render the full scheduler table including the header toolbar, resource column, timeline header, and all resource event rows.
 *
 * @param {object} props - Component properties.
 * @param {SchedulerData} props.schedulerData - View model that supplies configuration, layout, and rendering data for the scheduler.
 * @param {Array<DnDSource>} [props.dndSources] - Additional drag-and-drop sources merged into the scheduler's DnD context on first mount.
 * @param {React.RefObject<HTMLElement>} [props.parentRef] - Parent container ref used when `config.responsiveByParent` is true; a ResizeObserver tracks this element's size.
 * @param {function(SchedulerData):void} props.prevClick - Called when navigating to the previous time range.
 * @param {function(SchedulerData):void} props.nextClick - Called when navigating to the next time range.
 * @param {function(SchedulerData, object):void} props.onViewChange - Called when the view type, agenda toggle, or event perspective changes.
 * @param {function(SchedulerData, string|Date):void} props.onSelectDate - Called when a date is selected from the date picker.
 * @param {function(SchedulerData, HTMLElement, number):void} [props.onScrollLeft] - Called when content reaches the leftmost scroll position.
 * @param {function(SchedulerData, HTMLElement, number):void} [props.onScrollRight] - Called when content reaches the rightmost scroll position.
 * @param {function(SchedulerData, HTMLElement, number):void} [props.onScrollTop] - Called when content reaches the topmost scroll position.
 * @param {function(SchedulerData, HTMLElement, number):void} [props.onScrollBottom] - Called when content reaches the bottommost scroll position.
 * @returns {JSX.Element} The root scheduler table element containing the rendered scheduler UI.
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
  const [selectionState, setSelectionState] = useState({
    isSelecting: false,
    selectedResourceIds: [],
    left: 0,
    width: 0,
  });
  const [, setRenderTrigger] = useState(0);

  const schedulerRootRef = useRef(null);

  // Layout/header refs - declare before setSchedulerHeaderRef useCallback
  const schedulerHeaderRef = useRef(null);

  // Callback ref pattern for ResizeObserver to handle schedulerHeader element reassignment
  const [schedulerHeaderEl, setSchedulerHeaderEl] = useState(null);
  const setSchedulerHeaderRef = useCallback(el => {
    schedulerHeaderRef.current = el;
    setSchedulerHeaderEl(el);
  }, []);

  // Scroll sync refs
  const schedulerHeadRef = useRef(null);
  const schedulerResourceRef = useRef(null);
  const schedulerContentRef = useRef(null);
  const schedulerContentBgTableRef = useRef(null);

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

  useEffect(() => {
    if (typeof schedulerData.setVersionChangeNotifier === 'function') {
      schedulerData.setVersionChangeNotifier(setRenderTrigger);
      return () => schedulerData.setVersionChangeNotifier(null);
    }

    return undefined;
  }, [schedulerData]);

  const onWindowResize = useCallback(() => {
    schedulerData.beginBatch();
    try {
      schedulerData._setDocumentWidth(document.documentElement.clientWidth);
      schedulerData._setDocumentHeight(document.documentElement.clientHeight);
    } finally {
      schedulerData.endBatch();
    }
  }, [schedulerData]);

  useEffect(() => {
    if (
      (schedulerData.isSchedulerResponsive() && !schedulerData.config.responsiveByParent) ||
      parentRef === undefined
    ) {
      schedulerData.beginBatch();
      try {
        schedulerData._setDocumentWidth(document.documentElement.clientWidth);
        schedulerData._setDocumentHeight(document.documentElement.clientHeight);
      } finally {
        schedulerData.endBatch();
      }
      window.addEventListener('resize', onWindowResize);
      return () => window.removeEventListener('resize', onWindowResize);
    }
  }, [schedulerData, parentRef, onWindowResize]);

  useEffect(() => {
    const parentEl = parentRef?.current;
    if (parentRef !== undefined && schedulerData.config.responsiveByParent && parentEl) {
      const updateParentSize = () => {
        schedulerData.beginBatch();
        try {
          schedulerData._setDocumentWidth(parentEl.clientWidth);
          schedulerData._setDocumentHeight(parentEl.clientHeight);
        } finally {
          schedulerData.endBatch();
        }
      };

      updateParentSize();

      // Disconnect any previous observer to prevent memory leaks
      if (ulObserverRef.current) {
        ulObserverRef.current.disconnect();
      }

      ulObserverRef.current = new ResizeObserver(updateParentSize);

      ulObserverRef.current.observe(parentEl);

      return () => {
        if (ulObserverRef.current) {
          ulObserverRef.current.disconnect();
        }
      };
    }
  }, [parentRef, schedulerData]);

  useEffect(() => {
    if (schedulerData.config.responsiveByParent && schedulerHeaderEl) {
      const updateHeaderHeight = node => {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        const totalHeight =
          rect.height +
          (parseFloat(style.marginTop) || 0) +
          (parseFloat(style.marginBottom) || 0) +
          (schedulerData.config.showWeekNumber ? schedulerData.config.weekNumberRowHeight || 0 : 0);
        schedulerData._setSchedulerHeaderHeight(totalHeight);
      };

      updateHeaderHeight(schedulerHeaderEl);

      headerObserverRef.current = new ResizeObserver(entries => {
        for (const entry of entries) {
          updateHeaderHeight(entry.target);
        }
      });

      headerObserverRef.current.observe(schedulerHeaderEl);

      return () => {
        if (headerObserverRef.current) {
          headerObserverRef.current.disconnect();
        }
      };
    }
  }, [schedulerHeaderEl, schedulerData, schedulerData.config.showWeekNumber, schedulerData.config.weekNumberRowHeight]);

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
    if (schedulerData.getScrollToSpecialDayjs() && behaviors.getScrollSpecialDayjsFunc) {
      if (
        schedulerContentRef.current &&
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
          schedulerContentRef.current.scrollWidth - schedulerContentRef.current.clientWidth,
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
          schedulerContentRef.current.scrollWidth - schedulerContentRef.current.clientWidth,
        );
      }
    } else if (schedulerContentRef.current.scrollTop !== scrollTopRef.current) {
      if (schedulerContentRef.current.scrollTop === 0 && onScrollTop !== undefined) {
        onScrollTop(
          schedulerData,
          schedulerContentRef.current,
          schedulerContentRef.current.scrollHeight - schedulerContentRef.current.clientHeight,
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
          schedulerContentRef.current.scrollHeight - schedulerContentRef.current.clientHeight,
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
    [onViewChange, schedulerData],
  );

  const goNext = useCallback(() => nextClick(schedulerData), [nextClick, schedulerData]);
  const goBack = useCallback(() => prevClick(schedulerData), [prevClick, schedulerData]);
  const onSelect = useCallback(date => onSelectDate(schedulerData, date), [onSelectDate, schedulerData]);

  const { viewType, renderData, showAgenda, config } = schedulerData;
  const width = schedulerData.getSchedulerWidth();
  const { showWeekNumber, weekNumberRowHeight } = config;
  const schedulerDataVersion = schedulerData.getVersion ? schedulerData.getVersion() : 0;
  const schedulerWidth = schedulerData.getContentTableWidth();

  const weekNumberRowStyle = useMemo(() => ({ height: weekNumberRowHeight }), [weekNumberRowHeight]);

  const weekNumberThStyle = useMemo(
    () => ({
      borderBottom: `1px solid ${config.headerBorderColor ?? '#e9e9e9'}`,
      fontSize: '0.85em',
      opacity: 0.7,
      padding: '4px 8px',
    }),
    [config.headerBorderColor],
  );

  const schedulerInnerStyle = useMemo(() => ({ width: schedulerWidth }), [schedulerWidth]);

  const displayRenderData = useMemo(() => renderData.filter(o => o.render), [renderData]);
  const eventDndSource = dndContext.getDndSource();
  const handleSelectionChange = useCallback((isSelecting, selectedResourceIds, preview = {}) => {
    const nextSelectedResourceIds = selectedResourceIds || [];
    const nextLeft = preview.left || 0;
    const nextWidth = preview.width || 0;
    setSelectionState(prev => {
      const sameIdsLength = prev.selectedResourceIds.length === nextSelectedResourceIds.length;
      const sameIds =
        sameIdsLength && prev.selectedResourceIds.every((id, index) => id === nextSelectedResourceIds[index]);
      if (prev.isSelecting === isSelecting && prev.left === nextLeft && prev.width === nextWidth && sameIds) {
        return prev;
      }
      return {
        isSelecting,
        selectedResourceIds: nextSelectedResourceIds,
        left: nextLeft,
        width: nextWidth,
      };
    });
  }, []);
  const selectionPreview = useMemo(
    () => ({
      isSelecting: selectionState.isSelecting,
      left: selectionState.left,
      width: selectionState.width,
    }),
    [selectionState.isSelecting, selectionState.left, selectionState.width],
  );
  const selectedIdsSet = useMemo(
    () => new Set(selectionState.selectedResourceIds),
    [selectionState.selectedResourceIds],
  );
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
          onSelectionChange={handleSelectionChange}
          isRowSelected={selectedIdsSet.has(item.slotId)}
          selectionPreview={selectionPreview}
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
      handleSelectionChange,
      selectedIdsSet,
      selectionPreview,
    ],
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
      width: resourceTableWidth + resourceScrollbarWidth,
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
            <section
              style={resourceContentStyle}
              ref={schedulerResourceRef}
              onMouseOver={onSchedulerResourceMouseOver}
              onFocus={onSchedulerResourceMouseOver}
              onMouseOut={onSchedulerResourceMouseOut}
              onBlur={onSchedulerResourceMouseOut}
              onScroll={onSchedulerResourceScroll}
              aria-label="Resource sidebar"
            >
              <ResourceView
                schedulerData={schedulerData}
                schedulerDataVersion={schedulerDataVersion}
                contentScrollbarHeight={resourcePaddingBottom}
                slotClickedFunc={props.slotClickedFunc}
                slotItemTemplateResolver={props.slotItemTemplateResolver}
                toggleExpandFunc={props.toggleExpandFunc}
                CustomResourceCell={props.CustomResourceCell}
                isSelecting={selectionState.isSelecting}
                selectedResourceIds={selectionState.selectedResourceIds}
              />
            </section>
          </div>
        </td>
        <td style={schedulerViewStyle}>
          <div className="scheduler-view">
            <div style={schedulerHeadWrapperStyle}>
              <section
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
                  <table className="scheduler-bg-table" style={schedulerInnerStyle}>
                    <HeaderView
                      schedulerData={schedulerData}
                      schedulerDataVersion={schedulerDataVersion}
                      nonAgendaCellHeaderTemplateResolver={props.nonAgendaCellHeaderTemplateResolver}
                    />
                  </table>
                </div>
              </section>
            </div>
            <section
              style={schedulerContentStyle}
              ref={schedulerContentRef}
              onMouseOver={onSchedulerContentMouseOver}
              onFocus={onSchedulerContentMouseOver}
              onMouseOut={onSchedulerContentMouseOut}
              onBlur={onSchedulerContentMouseOut}
              onScroll={onSchedulerContentScroll}
              aria-label="Scheduler content"
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
            </section>
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
    [config.headerEnabled],
  );

  const schedulerHeader = useMemo(
    () => (
      <SchedulerHeader
        ref={setSchedulerHeaderRef}
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
      setSchedulerHeaderRef,
    ],
  );

  const rootTableStyle = useMemo(() => ({ width: `${width}px`, tableLayout: 'fixed' }), [width]);

  return (
    <table
      id="rbs-root"
      className={`rbs ${schedulerData.isVerticalResourceView() ? 'vertical-view' : ''}`}
      style={rootTableStyle}
      ref={schedulerRootRef}
    >
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
  DATE_FORMAT,
  DATETIME_FORMAT,
  DemoData,
  DnDContext,
  DnDSource,
  Scheduler,
  SchedulerData,
  SummaryPos,
  ViewType,
  wrapperFun,
};
