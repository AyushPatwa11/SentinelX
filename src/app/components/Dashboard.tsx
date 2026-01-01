import { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle, MapPin, Clock, TrendingUp, Activity } from "lucide-react";
import { SafetyResponsePanel } from "./SafetyResponsePanel";

interface HazardDetection {
  type: string;
  risk_level: string;
  location: string;
  timestamp: string;
  confidence?: number;
}

export function Dashboard() {
  const [hazard, setHazard] = useState<HazardDetection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current hazard data
  const fetchData = async () => {
    try {
      const response = await axios.get<HazardDetection>("http://localhost:8000/detect", {
        timeout: 3000,
      });
      setHazard(response.data);
      setError(null);
    } catch (err) {
      // Fallback mock data for demo
      setHazard({
        type: "Smoke Detected",
        risk_level: "High",
        location: "Module A-12",
        timestamp: new Date().toISOString(),
        confidence: 92,
      });
      if (axios.isAxiosError(err) && err.code === "ERR_NETWORK") {
        setError(null); // Silently use mock data
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes("high") || lowerLevel.includes("critical")) {
      return "border-red-500 bg-red-500/10 text-red-400";
    }
    if (lowerLevel.includes("medium") || lowerLevel.includes("moderate")) {
      return "border-orange-500 bg-orange-500/10 text-orange-400";
    }
    return "border-green-500 bg-green-500/10 text-green-400";
  };

  const getRiskBadgeColor = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes("high") || lowerLevel.includes("critical")) {
      return "bg-red-500/20 text-red-400 border-red-500/30";
    }
    if (lowerLevel.includes("medium") || lowerLevel.includes("moderate")) {
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    }
    return "bg-green-500/20 text-green-400 border-green-500/30";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-1">Mission Control Dashboard</h2>
        <p className="text-sm text-gray-400">Real-time hazard detection and monitoring</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Active Hazard Status</span>
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-semibold">{hazard ? "Detected" : "Clear"}</p>
          <p className="text-xs text-gray-500 mt-1">Current monitoring state</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Risk Level</span>
            <TrendingUp className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-2xl font-semibold">{hazard?.risk_level || "Normal"}</p>
          <p className="text-xs text-gray-500 mt-1">Severity assessment</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Location</span>
            <MapPin className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-semibold">{hazard?.location || "All Clear"}</p>
          <p className="text-xs text-gray-500 mt-1">Detection zone</p>
        </div>
      </div>

      {/* Current Detection Card */}
      {hazard && (
        <>
        <div className={`rounded-lg border-2 p-6 ${getRiskColor(hazard.risk_level)}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Current Detection</h3>
                <p className="text-sm opacity-80">Active hazard requiring attention</p>
              </div>
            </div>
            <span className={`px-4 py-1.5 rounded-full border text-sm font-medium ${getRiskBadgeColor(hazard.risk_level)}`}>
              {hazard.risk_level}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Hazard Type</p>
                <p className="text-lg font-medium">{hazard.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Location</p>
                <p className="text-lg font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {hazard.location}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Detection Time</p>
                <p className="text-lg font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {new Date(hazard.timestamp).toLocaleString()}
                </p>
              </div>
              {hazard.confidence && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Confidence Level</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${hazard.confidence}%` }}
                      />
                    </div>
                    <span className="text-lg font-medium">{hazard.confidence}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Safety Response Panel */}
        <SafetyResponsePanel hazardType={hazard.type} severity={hazard.risk_level} />
        </>
      )}

      {/* No Detection State */}
      {!hazard && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">All Systems Normal</h3>
          <p className="text-gray-400">No hazards detected at this time</p>
        </div>
      )}
    </div>
  );
}