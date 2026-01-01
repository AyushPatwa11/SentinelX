import { Shield, AlertCircle } from "lucide-react";

interface SafetyResponsePanelProps {
  hazardType: string;
  severity: string;
}

export function SafetyResponsePanel({ hazardType, severity }: SafetyResponsePanelProps) {
  const getSafetyActions = (type: string): string[] => {
    const lowerType = type.toLowerCase();
    
    if (lowerType.includes("fire")) {
      return [
        "Isolate affected module immediately",
        "Activate automatic fire suppression systems",
        "Alert all crew members via intercom",
        "Evacuate personnel from adjacent modules",
        "Seal ventilation to prevent spread",
        "Monitor oxygen levels in nearby areas",
      ];
    }
    
    if (lowerType.includes("smoke")) {
      return [
        "Activate ventilation systems in affected area",
        "Alert crew members in vicinity",
        "Identify source of smoke emission",
        "Prepare fire suppression equipment",
        "Monitor air quality sensors",
        "Restrict access to affected zone",
      ];
    }
    
    if (lowerType.includes("electrical") || lowerType.includes("spark")) {
      return [
        "Immediately cut power to affected circuit",
        "Evacuate personnel from danger zone",
        "Verify backup power systems are operational",
        "Deploy insulated equipment for inspection",
        "Monitor for secondary hazards",
        "Notify engineering team for assessment",
      ];
    }
    
    if (lowerType.includes("gas") || lowerType.includes("leak")) {
      return [
        "Seal affected compartment immediately",
        "Activate emergency ventilation protocols",
        "Evacuate all personnel from area",
        "Deploy atmospheric sensors",
        "Use breathing apparatus for inspections",
        "Locate and isolate leak source",
      ];
    }
    
    if (lowerType.includes("overheat") || lowerType.includes("temperature")) {
      return [
        "Reduce power consumption in affected area",
        "Activate auxiliary cooling systems",
        "Monitor temperature trends continuously",
        "Check thermal protection systems",
        "Prepare for equipment shutdown if needed",
        "Document temperature readings",
      ];
    }
    
    return [
      "Assess the situation thoroughly",
      "Alert relevant crew members",
      "Follow standard safety protocols",
      "Document all observations",
      "Monitor system status closely",
    ];
  };

  const actions = getSafetyActions(hazardType);
  
  const getSeverityColor = () => {
    const lowerSeverity = severity.toLowerCase();
    if (lowerSeverity.includes("high") || lowerSeverity.includes("critical")) {
      return "border-red-500 bg-red-500/5";
    }
    if (lowerSeverity.includes("medium") || lowerSeverity.includes("moderate")) {
      return "border-orange-500 bg-orange-500/5";
    }
    return "border-yellow-500 bg-yellow-500/5";
  };

  return (
    <div className={`rounded-lg border-2 p-5 ${getSeverityColor()}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Safety Response Protocol</h3>
          <p className="text-sm text-gray-400">Recommended actions for {hazardType}</p>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-300">
            Follow these steps in sequence. Contact mission control if situation escalates.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
              {index + 1}
            </div>
            <p className="text-sm text-gray-300 pt-0.5">{action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
