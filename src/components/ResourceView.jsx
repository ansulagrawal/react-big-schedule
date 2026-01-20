import { MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

/**
 * Render the scheduler's resource table with hierarchical indentation, optional expand/collapse controls,
 * clickable slot names, and support for custom slot templates or an injected resource-cell renderer.
 *
 * @param {object} schedulerData - Scheduler state and helpers; must include `renderData`,
 * `getResourceTableWidth`, and `config`.
 * @param {number} contentScrollbarHeight - Height used to set the container's bottom padding.
 * @param {Function} [slotClickedFunc] - Called as `slotClickedFunc(schedulerData, item)` when a slot name is clicked.
 * @param {Function} [slotItemTemplateResolver] - Called as `slotItemTemplateResolver
 * (schedulerData, item, slotClickedFunc, width, className)` to provide a custom slot cell element;
 * if a value is returned it replaces the default slot cell.
 * @param {Function} [toggleExpandFunc] - Called as `toggleExpandFunc(schedulerData, slotId)`
 * to toggle expansion for items with children.
 * @param {Function} [CustomResourceCell] - Optional React component rendered inside the resource
 * `<td>` when provided; receives props `{ schedulerData, item, indents, slotClickedFunc, handleToggleExpand }`.
 * @returns {JSX.Element} The rendered resource table element.
 */
function ResourceView({
  schedulerData,
  contentScrollbarHeight,
  slotClickedFunc,
  slotItemTemplateResolver,
  toggleExpandFunc,
  CustomResourceCell,
}) {
  const { renderData } = schedulerData;
  const width = schedulerData.getResourceTableWidth() - 2;
  const paddingBottom = contentScrollbarHeight;
  const displayRenderData = renderData.filter(o => o.render);

  const handleToggleExpand = item => {
    if (toggleExpandFunc) {
      toggleExpandFunc(schedulerData, item.slotId);
    }
  };

  const renderSlotItem = (item, indents) => {
    let indent = <span key={`es${item.indent}`} className="expander-space" />;

    const iconProps = { onClick: () => handleToggleExpand(item) };

    if (item.hasChildren) {
      indent = item.expanded ? (
        <MinusSquareOutlined key={`es${item.indent}`} {...iconProps} />
      ) : (
        <PlusSquareOutlined key={`es${item.indent}`} {...iconProps} />
      );
    }

    indents.push(indent);

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
          style={{ cursor: slotClickedFunc === undefined ? undefined : 'pointer' }}
        >
          {item.slotName}
        </button>
      </span>
    );

    let slotItem = (
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
        'overflow-text header2-text'
      );
      if (resolvedTemplate) {
        slotItem = resolvedTemplate;
      }
    }

    const tdStyle = {
      height: item.rowHeight,
      backgroundColor: item.groupOnly ? schedulerData.config.groupOnlySlotColor : undefined,
    };

    if (CustomResourceCell) {
      return (
        <tr key={item.slotId}>
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

    return (
      <tr key={item.slotId}>
        <td data-resource-id={item.slotId} style={tdStyle}>
          {slotItem}
        </td>
      </tr>
    );
  };

  const resourceList = displayRenderData.map(item => {
    const indents = [];
    for (let i = 0; i < item.indent; i += 1) {
      indents.push(<span key={`es${i}`} className="expander-space" />);
    }

    return renderSlotItem(item, indents);
  });

  return (
    <div style={{ paddingBottom }}>
      <table className="resource-table">
        <tbody>{resourceList}</tbody>
      </table>
    </div>
  );
}

ResourceView.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  contentScrollbarHeight: PropTypes.number.isRequired,
  slotClickedFunc: PropTypes.func,
  slotItemTemplateResolver: PropTypes.func,
  toggleExpandFunc: PropTypes.func,
  CustomResourceCell: PropTypes.func,
};

export default ResourceView;
