import {
  type ComponentType,
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CellUnit, DATE_FORMAT, DATETIME_FORMAT, SummaryPos, ViewType } from '../config/default';
import { toDate } from '../helper/behaviors';
import DemoData from '../sample-data/sample1';
import type { Id, SlotClickedFunc, SlotItemTemplateResolver } from '../types';
import AddMorePopover from './AddMorePopover';
import AgendaView from './AgendaView';
import BodyView from './BodyView';
import DnDContext from './DnDContext';
import DnDSource, { type DragItem } from './DnDSource';
import HeaderView, { type NonAgendaCellHeaderTemplateResolver } from './HeaderView';
import ResourceEvents, { type ResourceEventsProps } from './ResourceEvents';
import ResourceView, { type CustomResourceCellProps } from './ResourceView';
import SchedulerData from './SchedulerData';
import type { ViewChangeEvent } from './SchedulerHeader';
import SchedulerHeader from './SchedulerHeader';
import wrapperFun from './WrapperFun';

type ScrollHandler = (schedulerData: SchedulerData, element: HTMLElement, maxScroll: number) => void;

export interface SchedulerProps
  extends Pick<
    ResourceEventsProps,
    | 'onSetAddMoreState'
    | 'updateEventStart'
    | 'updateEventEnd'
    | 'moveEvent'
    | 'movingEvent'
    | 'newEvent'
    | 'conflictOccurred'
    | 'subtitleGetter'
    | 'eventItemClick'
    | 'viewEventClick'
    | 'viewEventText'
    | 'viewEvent2Click'
    | 'viewEvent2Text'
    | 'eventItemTemplateResolver'
    | 'eventItemPopoverTemplateResolver'
  > {
  /** View model that supplies configuration, layout and render data. */
  schedulerData: SchedulerData;
  /** Extra drag sources, merged into the DnD context on first mount. */
  dndSources?: DnDSource[];
  /** Parent whose height is tracked when `config.responsiveByParent` is on. */
  parentRef?: RefObject<HTMLElement | null>;
  className?: string;
  style?: CSSProperties;
  prevClick: (schedulerData: SchedulerData) => void;
  nextClick: (schedulerData: SchedulerData) => void;
  onViewChange: (schedulerData: SchedulerData, view: ViewChangeEvent) => void;
  onSelectDate: (schedulerData: SchedulerData, date: string) => void;
  leftCustomHeader?: ReactNode;
  rightCustomHeader?: ReactNode;
  slotClickedFunc?: SlotClickedFunc;
  toggleExpandFunc?: (schedulerData: SchedulerData, slotId: Id) => void;
  slotItemTemplateResolver?: SlotItemTemplateResolver;
  nonAgendaCellHeaderTemplateResolver?: NonAgendaCellHeaderTemplateResolver;
  onScrollLeft?: ScrollHandler;
  onScrollRight?: ScrollHandler;
  onScrollTop?: ScrollHandler;
  onScrollBottom?: ScrollHandler;
  CustomResourceHeader?: ComponentType;
  CustomResourceCell?: ComponentType<CustomResourceCellProps>;
  /** Extra style for the resource column header cell. */
  configTableHeaderStyle?: CSSProperties;
}

const initDndContext = (schedulerData: SchedulerData, dndSources?: DnDSource[]) => {
  let sources: DnDSource[] = [];
  sources.push(
    new DnDSource((dndProps: { eventItem: DragItem }) => dndProps.eventItem, schedulerData.config.dragAndDropEnabled),
  );
  if (dndSources !== undefined && dndSources.length > 0) {
    sources = [...sources, ...dndSources];
  }
  return new DnDContext(sources);
};

/** Render the full scheduler: header toolbar, resource column, timeline header and all resource event rows. */

// content-box height: clientHeight includes the padding, which the scheduler cannot use
const getInnerHeight = (el: HTMLElement) => {
  const { paddingTop, paddingBottom } = window.getComputedStyle(el);
  return el.clientHeight - (parseFloat(paddingTop) || 0) - (parseFloat(paddingBottom) || 0);
};

function Scheduler(props: SchedulerProps) {
  const {
    schedulerData,
    dndSources,
    parentRef,
    className,
    style,
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
  const [selectionState, setSelectionState] = useState<{
    isSelecting: boolean;
    selectedResourceIds: Id[];
    left: number;
    width: number;
  }>({
    isSelecting: false,
    selectedResourceIds: [],
    left: 0,
    width: 0,
  });
  const [, setRenderTrigger] = useState(0);

  const schedulerRootRef = useRef<HTMLTableElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Layout/header refs - declare before setSchedulerHeaderRef useCallback
  const schedulerHeaderRef = useRef<HTMLDivElement | null>(null);

  // Callback ref pattern for ResizeObserver to handle schedulerHeader element reassignment
  const [schedulerHeaderEl, setSchedulerHeaderEl] = useState<HTMLDivElement | null>(null);
  const setSchedulerHeaderRef = useCallback((el: HTMLDivElement | null) => {
    schedulerHeaderRef.current = el;
    setSchedulerHeaderEl(el);
  }, []);

  // Scroll sync refs
  const schedulerHeadRef = useRef<HTMLElement>(null);
  const schedulerResourceRef = useRef<HTMLElement>(null);
  const schedulerContentRef = useRef<HTMLElement>(null);
  const schedulerContentBgTableRef = useRef<HTMLTableElement>(null);

  // Observer refs
  const ulObserverRef = useRef<ResizeObserver | null>(null);
  const headerObserverRef = useRef<ResizeObserver | null>(null);

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

  // Width comes from the scheduler's own wrapper (100% wide of its parent). `parentRef` only supplies the height
  // when responsiveByParent is on.
  useEffect(() => {
    const { responsiveByParent } = schedulerData.config;
    const parentEl = responsiveByParent ? parentRef?.current : null;
    // the wrapper is 100% wide of its parent (padding excluded), so it gives the width in both modes
    const widthEl = containerRef.current;
    if (!widthEl) return undefined;

    const update = () => {
      schedulerData.beginBatch();
      try {
        schedulerData._setDocumentWidth(widthEl.clientWidth);
        if (responsiveByParent) {
          schedulerData._setDocumentHeight(parentEl ? getInnerHeight(parentEl) : document.documentElement.clientHeight);
        }
      } finally {
        schedulerData.endBatch();
      }
    };

    update();
    ulObserverRef.current = new ResizeObserver(update);
    ulObserverRef.current.observe(widthEl);
    if (parentEl) ulObserverRef.current.observe(parentEl);
    const listenToWindow = responsiveByParent && !parentEl;
    if (listenToWindow) window.addEventListener('resize', update);

    return () => {
      ulObserverRef.current?.disconnect();
      if (listenToWindow) window.removeEventListener('resize', update);
    };
  }, [parentRef, schedulerData]);

  useEffect(() => {
    if (schedulerData.config.responsiveByParent && schedulerHeaderEl) {
      const updateHeaderHeight = (node: Element) => {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        const totalHeight =
          rect.height +
          (parseFloat(style.marginTop) || 0) +
          (parseFloat(style.marginBottom) || 0) +
          schedulerData.getHeaderGroupRowsHeight();
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
  }, [
    schedulerHeaderEl,
    schedulerData,
    schedulerData.config.showWeekNumber,
    schedulerData.config.weekNumberRowHeight,
    schedulerData.config.showMonthRow,
    schedulerData.config.monthRowHeight,
  ]);

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
        const start = localeDayjs(toDate(schedulerData.startDate)).startOf('day');
        const end = localeDayjs(toDate(schedulerData.endDate)).endOf('day');
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
    const content = schedulerContentRef.current;
    const head = schedulerHeadRef.current;
    if (
      content &&
      head &&
      (currentAreaRef.current === 2 || currentAreaRef.current === -1) &&
      content.scrollLeft !== head.scrollLeft
    ) {
      content.scrollLeft = head.scrollLeft;
    }
  }, []);

  const onSchedulerResourceMouseOver = useCallback(() => {
    currentAreaRef.current = 1;
  }, []);
  const onSchedulerResourceMouseOut = useCallback(() => {
    currentAreaRef.current = -1;
  }, []);
  const onSchedulerResourceScroll = useCallback(() => {
    const content = schedulerContentRef.current;
    const resource = schedulerResourceRef.current;
    if (
      content &&
      resource &&
      (currentAreaRef.current === 1 || currentAreaRef.current === -1) &&
      content.scrollTop !== resource.scrollTop
    ) {
      content.scrollTop = resource.scrollTop;
    }
  }, []);

  const onSchedulerContentMouseOver = useCallback(() => {
    currentAreaRef.current = 0;
  }, []);
  const onSchedulerContentMouseOut = useCallback(() => {
    currentAreaRef.current = -1;
  }, []);
  const onSchedulerContentScroll = useCallback(() => {
    const content = schedulerContentRef.current;
    const head = schedulerHeadRef.current;
    if (!content || !head) return;
    if (schedulerResourceRef.current) {
      if (currentAreaRef.current === 0 || currentAreaRef.current === -1) {
        if (head.scrollLeft !== content.scrollLeft) {
          head.scrollLeft = content.scrollLeft;
        }
        if (schedulerResourceRef.current.scrollTop !== content.scrollTop) {
          schedulerResourceRef.current.scrollTop = content.scrollTop;
        }
      }
    }

    if (content.scrollLeft !== scrollLeftRef.current) {
      if (content.scrollLeft === 0 && onScrollLeft !== undefined) {
        onScrollLeft(schedulerData, content, content.scrollWidth - content.clientWidth);
      }
      if (Math.round(content.scrollLeft) === content.scrollWidth - content.clientWidth && onScrollRight !== undefined) {
        onScrollRight(schedulerData, content, content.scrollWidth - content.clientWidth);
      }
    } else if (content.scrollTop !== scrollTopRef.current) {
      if (content.scrollTop === 0 && onScrollTop !== undefined) {
        onScrollTop(schedulerData, content, content.scrollHeight - content.clientHeight);
      }
      if (
        Math.round(content.scrollTop) === content.scrollHeight - content.clientHeight &&
        onScrollBottom !== undefined
      ) {
        onScrollBottom(schedulerData, content, content.scrollHeight - content.clientHeight);
      }
    }

    scrollLeftRef.current = content.scrollLeft;
    scrollTopRef.current = content.scrollTop;
  }, [schedulerData, onScrollLeft, onScrollRight, onScrollTop, onScrollBottom]);

  const handleViewChange = useCallback(
    (e: { target: { value: string } }) => {
      const viewType = parseInt(e.target.value.charAt(0), 10);
      const showAgenda = e.target.value.charAt(1) === '1';
      const isEventPerspective = e.target.value.charAt(2) === '1';
      onViewChange(schedulerData, { viewType, showAgenda, isEventPerspective });
    },
    [onViewChange, schedulerData],
  );

  const goNext = useCallback(() => nextClick(schedulerData), [nextClick, schedulerData]);
  const goBack = useCallback(() => prevClick(schedulerData), [prevClick, schedulerData]);
  const onSelect = useCallback((date: string) => onSelectDate(schedulerData, date), [onSelectDate, schedulerData]);

  const { viewType, renderData, showAgenda, config } = schedulerData;
  const width = schedulerData.getSchedulerWidth();
  const { showWeekNumber, weekNumberRowHeight, showMonthRow, monthRowHeight } = config;
  const schedulerDataVersion = schedulerData.getVersion ? schedulerData.getVersion() : 0;
  const schedulerWidth = schedulerData.getContentTableWidth();

  const weekNumberRowStyle = useMemo(() => ({ height: weekNumberRowHeight }), [weekNumberRowHeight]);

  const weekNumberThStyle = useMemo(
    () => ({
      borderBottom: `1px solid ${config.headerBorderColor ?? 'var(--rbs-border)'}`,
      fontSize: '0.85em',
      opacity: 0.7,
      padding: '4px 8px',
    }),
    [config.headerBorderColor],
  );

  const schedulerInnerStyle = useMemo(() => ({ width: schedulerWidth }), [schedulerWidth]);

  const displayRenderData = useMemo(() => renderData.filter(o => o.render), [renderData]);
  const eventDndSource = dndContext.getDndSource();
  if (!eventDndSource) throw new Error('react-big-schedule: no DnD source registered for events');
  const handleSelectionChange = useCallback(
    (isSelecting: boolean, selectedResourceIds: Id[], preview: { left?: number; width?: number } = {}) => {
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
    },
    [],
  );
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
          eventItemPopoverTemplateResolver={props.eventItemPopoverTemplateResolver}
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
      props.eventItemPopoverTemplateResolver,
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

    const configuredContentHeight = config.schedulerContentHeight;
    const contentHeight =
      !config.responsiveByParent && configuredContentHeight === '100%'
        ? schedulerData.getSchedulerContentDesiredHeight()
        : configuredContentHeight;
    const resourcePaddingBottom = resourceScrollbarHeight === 0 ? contentScrollbarHeight : 0;
    const contentPaddingBottom = contentScrollbarHeight === 0 ? resourceScrollbarHeight : 0;

    let schedulerContentStyle: CSSProperties = {
      overflowX: viewType === ViewType.Week ? 'hidden' : 'auto',
      overflowY: 'auto',
      margin: '0px',
      position: 'relative',
      height: contentHeight,
      paddingBottom: contentPaddingBottom,
    };

    let resourceContentStyle: CSSProperties = {
      height: contentHeight,
      overflowX: 'auto',
      overflowY: 'auto',
      width: resourceTableWidth + resourceScrollbarWidth,
      margin: `0px -${contentScrollbarWidth}px 0px 0px`,
    };

    if (config.schedulerMaxHeight > 0) {
      const totalHeaderHeight = config.tableHeaderHeight + schedulerData.getHeaderGroupRowsHeight();
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
      borderBottom: `1px solid ${config.headerBorderColor ?? 'var(--rbs-border)'}`,
      height: config.tableHeaderHeight + schedulerData.getHeaderGroupRowsHeight(),
      ...configTableHeaderStyle,
    };

    const resourceHeaderScrollStyle: CSSProperties = {
      overflowX: 'scroll',
      overflowY: 'hidden',
      margin: `0px 0px -${contentScrollbarHeight}px`,
    };

    const schedulerViewStyle = {
      width: schedulerContainerWidth,
    };

    const schedulerViewColumnStyle = {
      verticalAlign: 'top',
    };

    const schedulerHeadWrapperStyle = {
      overflow: 'hidden',
      borderBottom: `1px solid ${config.headerBorderColor ?? 'var(--rbs-border)'}`,
      height: config.tableHeaderHeight + schedulerData.getHeaderGroupRowsHeight(),
    };

    const schedulerHeadScrollStyle: CSSProperties = {
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
                    {showMonthRow && (
                      <tr style={{ height: monthRowHeight }}>
                        <th style={weekNumberThStyle} />
                      </tr>
                    )}
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
        <td style={schedulerViewColumnStyle}>
          <div className="scheduler-view" style={schedulerViewStyle}>
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

  // table-layout: fixed sizes columns from the first row (the toolbar, colSpan=2), so pin the resource column here
  const resourceColumnWidth =
    schedulerData.showAgenda || !config.resourceViewEnabled ? undefined : schedulerData.getResourceTableWidth();

  const rootTableStyle = useMemo<CSSProperties>(() => ({ width: `${width}px`, tableLayout: 'fixed' }), [width]);

  return (
    <div
      ref={containerRef}
      className={className ? `rbs-container ${className}` : 'rbs-container'}
      style={style}
      data-rbs-theme={config.theme}
    >
      <table
        id="rbs-root"
        className={`rbs ${schedulerData.isVerticalResourceView() ? 'vertical-view' : ''}`}
        style={rootTableStyle}
        ref={schedulerRootRef}
      >
        {resourceColumnWidth !== undefined && (
          <colgroup>
            <col style={{ width: resourceColumnWidth }} />
            <col />
          </colgroup>
        )}
        <thead>
          <tr>
            <td colSpan={2}>{schedulerHeader}</td>
          </tr>
        </thead>
        <tbody>{tbodyContent}</tbody>
      </table>
    </div>
  );
}

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
