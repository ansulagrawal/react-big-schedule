import GuidePopup from '../../components/GuidePopup';
import PageHeader from '../../components/PageHeader';
import ClassBased from './class-based';

export default function ReadOnly() {
  return (
    <>
      <PageHeader title="Read Only Example" source="Read-Only/index.tsx" />
      <ClassBased />
      <GuidePopup
        title="Read-Only Example Guide"
        heading="View-Only Scheduler"
        text="This read-only example showcases how React Big Schedule displays events without allowing modifications. Perfect for viewing schedules in display-only scenarios."
        features={[
          'View events and schedules',
          'Navigate between time periods',
          'No editing or dragging allowed',
          'Examine the implementation',
        ]}
        cta="Explore Read-Only Mode"
      />
    </>
  );
}
