import GuidePopup from '../components/GuidePopup';
import { Link } from '../router';

export default function Home() {
  return (
    <>
      <section className="ex-hero">
        <img src="/banner.png" alt="React Big Schedule" className="ex-hero-img" />
        <h1>React Big Schedule</h1>
        <p>
          React Big Schedule is a powerful and intuitive scheduler and resource planning solution built with React.
          Seamlessly integrate this modern, browser-compatible component into your applications to effectively manage
          time, appointments, and resources. With drag-and-drop functionality, interactive UI, and granular views, React
          Big Schedule empowers you to effortlessly schedule and allocate resources with precision.
        </p>
        <Link to="/basic" className="ex-btn ex-btn-primary">
          Get Started
        </Link>
      </section>
      <GuidePopup
        delay={800}
        title="Welcome Guide"
        heading="React Big Schedule"
        text="Discover a powerful scheduling solution that transforms how you manage time and resources. Perfect for modern applications requiring advanced calendar functionality."
        features={['Drag & Drop Events', 'Multiple View Types', 'Resource Management']}
        cta="Start Exploring"
      />
    </>
  );
}
