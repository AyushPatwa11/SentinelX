import { useState } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { LiveMonitoring } from "./components/LiveMonitoring";
import { HazardAlerts } from "./components/HazardAlerts";
import { AlertHistory } from "./components/AlertHistory";
import { SystemOverview } from "./components/SystemOverview";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "live":
        return <LiveMonitoring />;
      case "alerts":
        return <HazardAlerts />;
      case "history":
        return <AlertHistory />;
      case "system":
        return <SystemOverview />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
