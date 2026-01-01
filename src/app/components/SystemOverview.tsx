import { Activity, Video, Shield, Cpu, Database, Wifi } from "lucide-react";

export function SystemOverview() {
  const systemStats = [
    { label: "AI Model Status", value: "Operational", icon: Cpu, status: "online" },
    { label: "Camera Feeds", value: "8 Active", icon: Video, status: "online" },
    { label: "Detection Accuracy", value: "94.7%", icon: Shield, status: "online" },
    { label: "Database Connection", value: "Connected", icon: Database, status: "online" },
    { label: "Network Latency", value: "12ms", icon: Wifi, status: "online" },
    { label: "System Uptime", value: "99.8%", icon: Activity, status: "online" },
  ];

  const modules = [
    { name: "Module A-12", status: "Monitoring", cameras: 3 },
    { name: "Module B-7", status: "Monitoring", cameras: 2 },
    { name: "Research Lab 2", status: "Monitoring", cameras: 2 },
    { name: "Solar Array 3", status: "Monitoring", cameras: 1 },
    { name: "Life Support Bay", status: "Monitoring", cameras: 2 },
    { name: "Docking Port 1", status: "Monitoring", cameras: 1 },
  ];

  const detectionTypes = [
    { type: "Smoke", enabled: true, detected: 12 },
    { type: "Fire", enabled: true, detected: 3 },
    { type: "Electrical Sparks", enabled: true, detected: 8 },
    { type: "Gas Leak", enabled: true, detected: 1 },
    { type: "Overheating", enabled: true, detected: 5 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-1">System Overview</h2>
        <p className="text-sm text-gray-400">Monitoring system health and configuration</p>
      </div>

      {/* System Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-gray-900 rounded-lg border border-gray-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
              <p className="text-xl font-semibold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Monitored Modules */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Monitored Modules</h3>
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium">Module</th>
                <th className="text-left px-6 py-3 text-sm font-medium">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium">Cameras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {modules.map((module) => (
                <tr key={module.name} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{module.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400">{module.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{module.cameras} active</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detection Types */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Detection Capabilities</h3>
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium">Hazard Type</th>
                <th className="text-left px-6 py-3 text-sm font-medium">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium">Total Detected (24h)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {detectionTypes.map((detection) => (
                <tr key={detection.type} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{detection.type}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                      Enabled
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{detection.detected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
