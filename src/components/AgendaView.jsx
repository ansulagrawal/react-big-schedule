import React from 'react';
import PropTypes from 'prop-types';
import AgendaResourceEvents from './AgendaResourceEvents';

function AgendaView(props) {
  const { schedulerData } = props;
  const { config, renderData } = schedulerData;

  const agendaResourceTableWidth = schedulerData.getResourceTableWidth();
  const tableHeaderHeight = schedulerData.getTableHeaderHeight();
  const resourceName = schedulerData.isEventPerspective ? config.taskName : config.resourceName;
  const { agendaViewHeader } = config;

  const resourceEventsList = renderData.map(item => <AgendaResourceEvents {...props} resourceEvents={item} key={item.slotId} />);

  return (
    <tr>
      <td>
        <table className="scheduler-table">
          <thead>
            <tr style={{ height: tableHeaderHeight }}>
              <th style={{ width: agendaResourceTableWidth }} className="header3-text">
                {resourceName}
              </th>
              <th className="header3-text">{agendaViewHeader}</th>
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
