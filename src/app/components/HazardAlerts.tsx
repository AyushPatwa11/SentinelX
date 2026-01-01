import { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle, MapPin, Clock, TrendingUp } from "lucide-react";

interface Alert {
  id: string;
  type: string;
  severity: "Low" | "Medium" | "High";
  location: string;
  timestamp: string;
  description?: string;
}

export function HazardAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch alerts from backend
  const fetchAlerts = async () => {
    try {
      const response = await axios.get<Alert[]>("http://localhost:8000/alerts", {
        timeout: 3000,
      });
      setAlerts(response.data);
    } catch (err) {
      // Fallback mock data for demo
      setAlerts([
        {
          id: "1",
          type: "Smoke Detected",
          severity: "High",
          location: "Module A-12",
          timestamp: new Date(Date.now() - 120000).toISOString(),
          description: "Dense smoke detected in corridor section"
        },
        {
          id: "2",
          type: "Electrical Fault",
          severity: "Medium",
          location: "Solar Array 3",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          description: "Abnormal electrical discharge observed"
        },
        {
          id: "3",
          type: "Temperature Spike",
          severity: "Low",
          location: "Life Support Bay",
          timestamp: new Date(Date.now() - 600000).toISOString(),
          description: "Minor temperature fluctuation recorded"
        },
        {
          id: "4",
          type: "Fire Detected",
          severity: "High",
          location: "Research Lab 2",
          timestamp: new Date(Date.now() - 900000).toISOString(),
          description: "Active fire detected by visual monitoring"
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh alerts
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "border-red-500 bg-red-500/10 text-red-400";
      case "Medium":
        return "border-orange-500 bg-orange-500/10 text-orange-400";
      default:
        return "border-green-500 bg-green-500/10 text-green-400";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Medium":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return then.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Loading alerts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Active Hazard Alerts</h2>
          <p className="text-sm text-gray-400">Real-time detection notifications</p>
        </div>
        <div className="text-sm text-gray-400">
          {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Active Alerts</h3>
            <p className="text-gray-400">All systems operating normally</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border-2 p-5 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{alert.type}</h3>
                    {alert.description && (
                      <p className="text-sm opacity-80 mt-1">{alert.description}</p>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getSeverityBadge(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 opacity-80">
                  <MapPin className="w-4 h-4" />
                  <span>{alert.location}</span>
                </div>
                <div className="flex items-center gap-2 opacity-80">
                  <Clock className="w-4 h-4" />
                  <span>{getTimeAgo(alert.timestamp)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
