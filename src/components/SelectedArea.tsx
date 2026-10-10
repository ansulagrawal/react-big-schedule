import type SchedulerData from './SchedulerData';

export interface SelectedAreaProps {
  schedulerData: SchedulerData;
  left: number;
  width: number;
}

function SelectedArea({ left, width, schedulerData }: SelectedAreaProps) {
  const { config } = schedulerData;

  const selectedAreaStyle = {
    left,
    width,
    top: 0,
    bottom: 0,
    backgroundColor: config.selectedAreaColor,
  };

  return <div className="selected-area" style={selectedAreaStyle} />;
}

export default SelectedArea;
