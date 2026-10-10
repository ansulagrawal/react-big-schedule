import GuidePopup from '../../components/GuidePopup';
import PageHeader from '../../components/PageHeader';
import ClassBased from './class-based';

export default function CustomTime() {
  return (
    <>
      <PageHeader title="Custom Time Example" source="Custom-Time/index.tsx" />
      <ClassBased />
      <GuidePopup
        title="Custom Time Guide"
        heading="Flexible Time Windows"
        text="This example demonstrates how to create custom time windows and ranges in React Big Schedule. Define your own time boundaries, working hours, and display periods to fit specific business needs."
        features={[
          'Custom time window definitions',
          'Flexible working hour ranges',
          'Business-specific time periods',
          'Study custom time implementation',
        ]}
        cta="Explore Time Customization"
      />
    </>
  );
}
