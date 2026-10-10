import { Scheduler } from '../../index';
import type { SP } from '../helpers/scheduler';
import { useTheme } from '../theme';

/** The library Scheduler with the app theme applied through `config.theme`. */
export default function ThemedScheduler(props: SP) {
  const { theme } = useTheme();
  props.schedulerData.config.theme = theme;
  return <Scheduler {...props} />;
}
