import { MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

/**
 * Render the resource list table for the scheduler's left-side resource pane.
 *
 * Renders visible resources from `schedulerData.renderData` as rows with optional
 * expand/collapse controls, clickable slot names, custom slot templates, and
 * per-row height/background styling.
 *
 * @param {object} props.schedulerData - Scheduler state and helpers; must include `renderData`, `getResourceTableWidth`, and `config`.
 * @param {number} props.contentScrollbarHeight - Bottom padding to account for the content area's scrollbar.
 * @param {function} [props.slotClickedFunc] - Optional callback invoked as `slotClickedFunc(schedulerData, item)` when a slot name is clicked.
 * @param {function} [props.slotItemTemplateResolver] - Optional resolver called as `slotItemTemplateResolver(schedulerData, item, slotClickedFunc, width, className)` to provide a custom slot item element.
 * @param {function} [props.toggleExpandFunc] - Optional callback invoked as `toggleExpandFunc(schedulerData, slotId)` when a resource's expand/collapse control is toggled.
 * @returns {JSX.Element} A React element containing the resource table with one row per visible resource.
 */
function ResourceView({
  schedulerData,
  contentScrollbarHeight,
  slotClickedFunc,
  slotItemTemplateResolver,
  toggleExpandFunc,
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
    let indent = <span key={`es${item.indent}`} className='expander-space' />;

    const iconProps = { key: `es${item.indent}`, onClick: () => handleToggleExpand(item) };
    if (item.hasChildren) {
      indent = item.expanded ? <MinusSquareOutlined {...iconProps} /> : <PlusSquareOutlined {...iconProps} />;
    }

    indents.push(indent);

    const slotCell = slotClickedFunc ? (
      <span className='slot-cell'>
        {indents}
        <button
          type='button'
          style={{ cursor: 'pointer' }}
          className='slot-text txt-btn-dis'
          onClick={() => slotClickedFunc(schedulerData, item)}
        >
          {item.slotName}
        </button>
      </span>
    ) : (
      <span className='slot-cell'>
        {indents}
        <button
          type='button'
          className='slot-text txt-btn-dis'
          style={{ cursor: slotClickedFunc === undefined ? undefined : 'pointer' }}
        >
          {item.slotName}
        </button>
      </span>
    );

    let slotItem = (
      <div title={item.slotTitle || item.slotName} className='overflow-text header2-text' style={{ textAlign: 'left' }}>
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
      indents.push(<span key={`es${i}`} className='expander-space' />);
    }

    return renderSlotItem(item, indents);
  });

  return (
    <div style={{ paddingBottom }}>
      <table className='resource-table'>
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
};

export default ResourceView;