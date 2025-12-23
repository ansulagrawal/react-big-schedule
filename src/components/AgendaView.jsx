import PropTypes from 'prop-types';
import AgendaResourceEvents from './AgendaResourceEvents';

/**
 * Renders an agenda-style table row for the scheduler showing resources and their events.
 *
 * Renders a single <tr> containing a nested table with a header (resource name and agenda header)
 * and a body with per-resource event groups.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.schedulerData - Scheduler data and helpers used to compute layout and render rows.
 * @returns {JSX.Element} A table row (<tr>) element containing the agenda view for the provided schedulerData.
 */
function AgendaView(props) {
  const { schedulerData } = props;
  const { config, renderData } = schedulerData;

  const agendaResourceTableWidth = schedulerData.getResourceTableWidth();
  const tableHeaderHeight = schedulerData.getTableHeaderHeight();
  const resourceName = schedulerData.isEventPerspective ? config.taskName : config.resourceName;
  const { agendaViewHeader } = config;

  const resourceEventsList = renderData.map(item => (
    <AgendaResourceEvents {...props} resourceEvents={item} key={item.slotId} />
  ));

  return (
    <tr>
      <td>
        <table className='scheduler-table'>
          <thead>
            <tr style={{ height: tableHeaderHeight }}>
              <th style={{ width: agendaResourceTableWidth }} className='header3-text'>
                {resourceName}
              </th>
              <th className='header3-text'>{agendaViewHeader}</th>
            </tr>
          </thead>
          <tbody>{resourceEventsList}</tbody>
        </table>
      </td>
    </tr>
  );
}

AgendaView.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  subtitleGetter: PropTypes.func,
  eventItemClick: PropTypes.func,
  viewEventClick: PropTypes.func,
  viewEventText: PropTypes.string,
  viewEvent2Click: PropTypes.func,
  viewEvent2Text: PropTypes.string,
  slotClickedFunc: PropTypes.func,
};

export default AgendaView;