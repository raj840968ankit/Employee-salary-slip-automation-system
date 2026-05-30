import { useEffect, useState } from "react";

function GlobalLoader() {
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleLoading = (event) => {
      setActive(event.detail.active);
    };

    window.addEventListener("api-loading", handleLoading);
    return () => window.removeEventListener("api-loading", handleLoading);
  }, []);

  useEffect(() => {
    let timer;

    if (active) {
      timer = setTimeout(() => setVisible(true), 450);
    } else {
      setVisible(false);
    }

    return () => clearTimeout(timer);
  }, [active]);

  if (!visible) return null;

  return (
    <div className="global-loader" role="status" aria-live="polite">
      <div className="loader-card">
        <div className="loader-spinner" />
        <div>
          <strong>Connecting to server</strong>
          <p>Render may take a few seconds to wake up. Please keep this tab open.</p>
        </div>
      </div>
    </div>
  );
}

export default GlobalLoader;
