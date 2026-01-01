import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface HistoricalAlert {
  id: string;
  type: string;
  severity: "Low" | "Medium" | "High";
  location: string;
  timestamp: string;
  status: "Resolved" | "Active";
}

type SortField = "timestamp" | "severity" | "type";
type SortOrder = "asc" | "desc";

export function AlertHistory() {
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Mock historical data
  const alerts: HistoricalAlert[] = [
    {
      id: "1",
      type: "Smoke Detected",
      severity: "High",
      location: "Module A-12",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: "Resolved",
    },
    {
      id: "2",
      type: "Fire Detected",
      severity: "High",
      location: "Research Lab 2",
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      status: "Resolved",
    },
    {
      id: "3",
      type: "Electrical Fault",
      severity: "Medium",
      location: "Solar Array 3",
      timestamp: new Date(Date.now() - 21600000).toISOString(),
      status: "Resolved",
    },
    {
      id: "4",
      type: "Gas Leak",
      severity: "High",
      location: "Docking Port 1",
      timestamp: new Date(Date.now() - 28800000).toISOString(),
      status: "Resolved",
    },
    {
      id: "5",
      type: "Overheating",
      severity: "Low",
      location: "Equipment Bay",
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      status: "Resolved",
    },
    {
      id: "6",
      type: "Electrical Fault",
      severity: "Medium",
      location: "Module B-7",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: "Resolved",
    },
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    let compareValue = 0;

    if (sortField === "timestamp") {
      compareValue = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    } else if (sortField === "severity") {
      const severityOrder = { High: 3, Medium: 2, Low: 1 };
      compareValue = severityOrder[a.severity] - severityOrder[b.severity];
    } else if (sortField === "type") {
      compareValue = a.type.localeCompare(b.type);
    }

    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "text-red-400";
      case "Medium":
        return "text-orange-400";
      default:
        return "text-green-400";
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-1">Alert History</h2>
        <p className="text-sm text-gray-400">Past detection events and incidents</p>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th
                className="text-left px-6 py-4 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => handleSort("timestamp")}
              >
                <div className="flex items-center gap-2 font-medium text-sm">
                  Time
                  <SortIcon field="timestamp" />
                </div>
              </th>
              <th
                className="text-left px-6 py-4 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => handleSort("type")}
              >
                <div className="flex items-center gap-2 font-medium text-sm">
                  Hazard Type
                  <SortIcon field="type" />
                </div>
              </th>
              <th
                className="text-left px-6 py-4 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => handleSort("severity")}
              >
                <div className="flex items-center gap-2 font-medium text-sm">
                  Severity
                  <SortIcon field="severity" />
                </div>
              </th>
              <th className="text-left px-6 py-4 font-medium text-sm">Location</th>
              <th className="text-left px-6 py-4 font-medium text-sm">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sortedAlerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-300">
                  {new Date(alert.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium">{alert.type}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">{alert.location}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                    {alert.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Showing {sortedAlerts.length} historical alerts</span>
        <span>Sorted by {sortField} ({sortOrder})</span>
      </div>
    </div>
  );
}
