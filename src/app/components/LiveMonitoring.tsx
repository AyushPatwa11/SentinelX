import { useState, useEffect, useRef } from "react";
import { Video, Camera, Circle } from "lucide-react";

type Scenario = "smoke" | "fire" | "electrical";

export function LiveMonitoring() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>("smoke");
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const scenarios = [
    { id: "smoke" as Scenario, label: "Smoke Detection", color: "bg-gray-600" },
    { id: "fire" as Scenario, label: "Fire Detection", color: "bg-red-600" },
    { id: "electrical" as Scenario, label: "Electrical Fault", color: "bg-yellow-600" },
  ];

  // Simulate frame capture when detection occurs
  const captureFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        setCapturedFrame(canvas.toDataURL("image/jpeg"));
      }
    }
  };

  // Simulate detection after scenario change
  useEffect(() => {
    setIsDetecting(true);
    const timer = setTimeout(() => {
      setIsDetecting(false);
      captureFrame();
    }, 2000);
    return () => clearTimeout(timer);
  }, [selectedScenario]);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-1">Live Visual Monitoring</h2>
        <p className="text-sm text-gray-400">Real-time camera feed analysis</p>
      </div>

      {/* Scenario Selector */}
      <div className="flex gap-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => setSelectedScenario(scenario.id)}
            className={`px-4 py-2 rounded-lg border font-medium transition-all ${
              selectedScenario === scenario.id
                ? `${scenario.color} border-transparent text-white`
                : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600"
            }`}
          >
            {scenario.label}
          </button>
        ))}
      </div>

      {/* Video Feed and Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Feed Panel */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-400" />
              <span className="font-medium">Live Visual Feed</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-2 h-2 text-red-500 fill-red-500 animate-pulse" />
              <span className="text-sm text-gray-400">Recording</span>
            </div>
          </div>
          
          <div className="relative aspect-video bg-gray-950">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              src={`/videos/${selectedScenario}.mp4`}
              onError={(e) => {
                // Fallback to placeholder if video not found
                e.currentTarget.style.display = "none";
              }}
            />
            
            {/* Live Feed Overlay */}
            <div className="absolute top-4 left-4 bg-black/70 px-3 py-1.5 rounded text-sm font-medium">
              LIVE FEED - {selectedScenario.toUpperCase()}
            </div>

            {/* Detection Indicator */}
            {isDetecting && (
              <div className="absolute top-4 right-4 bg-red-600/90 px-3 py-1.5 rounded text-sm font-medium animate-pulse">
                HAZARD DETECTED
              </div>
            )}

            {/* Placeholder if video fails */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <Video className="w-16 h-16 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Camera Feed: {selectedScenario}</p>
                <p className="text-xs text-gray-600 mt-1">Simulated monitoring active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Captured Frame Panel */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-green-400" />
              <span className="font-medium">Detection Snapshot</span>
            </div>
            <span className="text-sm text-gray-400">Auto-captured</span>
          </div>
          
          <div className="relative aspect-video bg-gray-950 flex items-center justify-center">
            {capturedFrame ? (
              <img
                src={capturedFrame}
                alt="Captured frame"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <Camera className="w-16 h-16 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Awaiting detection</p>
                <p className="text-xs text-gray-600 mt-1">Frame will be captured automatically</p>
              </div>
            )}

            {capturedFrame && (
              <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1.5 rounded text-sm font-medium">
                SNAPSHOT - {new Date().toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Info */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-sm text-gray-300">
            AI visual analysis active • Monitoring {selectedScenario} scenario • Auto-capture enabled
          </p>
        </div>
      </div>
    </div>
  );
}
