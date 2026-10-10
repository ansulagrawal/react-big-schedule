import type { EventPopoverCallbacks, SlotClickedFunc, SlotItemTemplateResolver } from '../types';
import AgendaResourceEvents from './AgendaResourceEvents';
import type SchedulerData from './SchedulerData';

export interface AgendaViewProps extends EventPopoverCallbacks {
  schedulerData: SchedulerData;
  slotClickedFunc?: SlotClickedFunc;
  slotItemTemplateResolver?: SlotItemTemplateResolver;
}

function AgendaView(props: AgendaViewProps) {
  const { schedulerData } = props;
  const { config, renderData } = schedulerData;

  const agendaResourceTableWidth = schedulerData.getResourceTableWidth();
  const tableHeaderHeight = schedulerData.getTableHeaderHeight();
  const resourceName = schedulerData.isEventPerspective ? config.taskName : config.resourceName;
  const { agendaViewHeader } = config;

  const resourceEventsList = renderData.map(item => (
    <AgendaResourceEvents
      key={item.slotId}
      resourceEvents={item}
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
  ));

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

export default AgendaView;
