import React, { type ComponentType, type CSSProperties, type ReactNode } from 'react';
import type { Id, RenderItem, SlotClickedFunc, SlotItemTemplateResolver } from '../types';
import type SchedulerData from './SchedulerData';
import { MinusSquare, PlusSquare } from './ui/Icons';

export interface CustomResourceCellProps {
  schedulerData: SchedulerData;
  item: RenderItem;
  indents: ReactNode[];
  slotClickedFunc?: SlotClickedFunc;
  handleToggleExpand: (item: RenderItem) => void;
}

export interface ResourceViewProps {
  schedulerData: SchedulerData;
  /** Changes whenever schedulerData mutates, so the memoised view re-renders. */
  schedulerDataVersion?: number;
  contentScrollbarHeight: number;
  slotClickedFunc?: SlotClickedFunc;
  slotItemTemplateResolver?: SlotItemTemplateResolver;
  toggleExpandFunc?: (schedulerData: SchedulerData, slotId: Id) => void;
  CustomResourceCell?: ComponentType<CustomResourceCellProps>;
  isSelecting?: boolean;
  selectedResourceIds?: Id[] | Set<Id>;
}

/** Render the resource column: hierarchical indentation, expand/collapse controls and clickable slot names. */
function ResourceView({
  schedulerData,
  contentScrollbarHeight,
  slotClickedFunc,
  slotItemTemplateResolver,
  toggleExpandFunc,
  CustomResourceCell,
  isSelecting,
  selectedResourceIds,
}: ResourceViewProps) {
  const { renderData } = schedulerData;
  const width = schedulerData.getResourceTableWidth();
  const paddingBottom = contentScrollbarHeight;
  const displayRenderData = renderData.filter(o => o.render);

  const handleToggleExpand = (item: RenderItem) => {
    if (toggleExpandFunc) {
      toggleExpandFunc(schedulerData, item.slotId);
    }
  };

  const renderSlotItem = (item: RenderItem, indents: ReactNode[]) => {
    let indent = <span key={`es${item.indent}`} className="expander-space" />;

    const iconProps = { onClick: () => handleToggleExpand(item), style: { cursor: 'pointer' } };

    if (item.hasChildren) {
      indent = item.expanded ? (
        <MinusSquare key={`es${item.indent}`} {...iconProps} />
      ) : (
        <PlusSquare key={`es${item.indent}`} {...iconProps} />
      );
    }

    indents.push(indent);

    const tdStyle: CSSProperties = {
      height: item.rowHeight,
      backgroundColor: item.groupOnly ? schedulerData.config.groupOnlySlotColor : undefined,
      borderLeft: '3px solid transparent',
    };
    const selectedBorderColor = schedulerData.config.selectedSlotBorderColor || 'var(--rbs-accent)';
    const selectedShadowColor =
      schedulerData.config.selectedSlotShadowColor || 'color-mix(in srgb, var(--rbs-accent) 45%, transparent)';
    const selectedSlotColor =
      schedulerData.config.selectedSlotColor || 'color-mix(in srgb, var(--rbs-accent) 10%, transparent)';
    const hasSelectedResourceId =
      selectedResourceIds instanceof Set
        ? selectedResourceIds.has(item.slotId)
        : Array.isArray(selectedResourceIds) && selectedResourceIds.includes(item.slotId);
    const isRowSelected = isSelecting && hasSelectedResourceId;
    if (isRowSelected) {
      tdStyle.borderLeft = `3px solid ${selectedBorderColor}`;
      tdStyle.boxShadow = `inset 0 0 0 1px ${selectedShadowColor}`;
      if (!item.groupOnly) {
        tdStyle.backgroundColor = selectedSlotColor;
      }
    }

    if (CustomResourceCell) {
      return (
        <tr key={item.slotId} aria-selected={isRowSelected}>
          <td data-resource-id={item.slotId} style={tdStyle}>
            <CustomResourceCell
              schedulerData={schedulerData}
              item={item}
              indents={indents}
              slotClickedFunc={slotClickedFunc}
              handleToggleExpand={handleToggleExpand}
            />
          </td>
        </tr>
      );
    }

    const slotCell = slotClickedFunc ? (
      <span className="slot-cell">
        {indents}
        <button
          type="button"
          style={{ cursor: 'pointer' }}
          className="slot-text rbs-txt-btn-dis"
          onClick={() => slotClickedFunc(schedulerData, item)}
        >
          {item.slotName}
        </button>
      </span>
    ) : (
      <span className="slot-cell">
        {indents}
        <button
          type="button"
          className="slot-text rbs-txt-btn-dis"
          style={{
            cursor: slotClickedFunc === undefined ? undefined : 'pointer',
          }}
        >
          {item.slotName}
        </button>
      </span>
    );

    let slotItem: ReactNode = (
      <div title={item.slotTitle || item.slotName} className="overflow-text header2-text" style={{ textAlign: 'left' }}>
        {slotCell}
      </div>
    );

    if (slotItemTemplateResolver) {
      const resolvedTemplate = slotItemTemplateResolver(
        schedulerData,
        item,
        slotClickedFunc,
        width,
        'overflow-text header2-text',
      );
      if (resolvedTemplate) {
        slotItem = resolvedTemplate;
      }
    }

    return (
      <tr key={item.slotId} aria-selected={isRowSelected}>
        <td data-resource-id={item.slotId} style={tdStyle}>
          {slotItem}
        </td>
      </tr>
    );
  };

  const resourceList = displayRenderData.map(item => {
    if (schedulerData.isVerticalResourceView()) {
      const timeLabel = schedulerData.localeDayjs(new Date(item.slotName)).format('HH:mm');
      return (
        <tr key={item.slotId} style={{ height: item.rowHeight }}>
          <td
            data-resource-id={item.slotId}
            style={{ height: item.rowHeight, minHeight: item.rowHeight, textAlign: 'center' }}
            className="header2-text"
          >
            <span>{timeLabel}</span>
          </td>
        </tr>
      );
    }

    const indents: ReactNode[] = [];
    for (let i = 0; i < item.indent; i += 1) {
      indents.push(<span key={`es${i}`} className="expander-space" />);
    }

    return renderSlotItem(item, indents);
  });

  return (
    <section style={{ paddingBottom }}>
      <table className="resource-table">
        <tbody>{resourceList}</tbody>
      </table>
    </section>
  );
}

export default React.memo(ResourceView);
