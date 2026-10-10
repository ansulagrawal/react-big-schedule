import GuidePopup from '../../components/GuidePopup';
import PageHeader from '../../components/PageHeader';
import ClassBased from './class-based';

export default function ResizeByParent() {
  return (
    <>
      <PageHeader title="Resize By Parent Example" source="Resize-By-Parent/index.tsx" />
      <ClassBased />
      <GuidePopup
        title="Responsive Design Guide"
        heading="Parent-Based Responsiveness"
        text="This example shows how React Big Schedule automatically adapts to its parent container size. Perfect for embedded components, dashboards, and responsive layouts that need flexible sizing."
        features={[
          'Automatic container adaptation',
          'Flexible width and height scaling',
          'Responsive across all devices',
          'Study responsive implementation',
        ]}
        cta="Test Responsive Layout"
      />
    </>
  );
}
