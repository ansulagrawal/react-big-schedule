import GuidePopup from '../../components/GuidePopup';
import PageHeader from '../../components/PageHeader';
import ClassBased from './class-based';

export default function AddMoreExample() {
  return (
    <>
      <PageHeader title="Add More Example" source="Add-More/index.tsx" />
      <ClassBased />
      <GuidePopup
        title="Add More Example Guide"
        heading="Overflow Event Management"
        text="This example demonstrates how React Big Schedule handles event overflow with the “Add More” feature. When multiple events occupy the same time slot, a “+N more” indicator appears for better space management."
        features={[
          'Look for “+N more” indicators',
          'Click to view all hidden events',
          'Better space utilization',
          'Study the overflow handling',
        ]}
        cta="Try Add More Feature"
      />
    </>
  );
}
