import GuidePopup from '../../components/GuidePopup';
import PageHeader from '../../components/PageHeader';
import ClassBased from './class-based';

export default function Basic() {
  return (
    <>
      <PageHeader title="Basic Example" source="Basic/index.tsx" />
      <ClassBased />
      <GuidePopup
        title="Basic Example Guide"
        heading="Explore the Scheduler"
        text="This basic example demonstrates the core functionality of React Big Schedule. Interact with the scheduler below to see how it works in action."
        features={[
          'Try dragging events around',
          'Switch between view modes',
          'Check the source code link',
          'Inspect implementation details',
        ]}
        cta="Start Exploring"
      />
    </>
  );
}
