export default function Fallback() {
  return (
    <div className="ex-fallback" role="status">
      <span className="ex-spinner" />
      <p>Please wait while the component is being loaded.</p>
    </div>
  );
}
