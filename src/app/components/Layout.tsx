import { ReactNode, useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Video, 
  AlertTriangle, 
  History, 
  Settings,
  Satellite,
  Menu,
  X
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "live", label: "Live Monitoring", icon: Video },
    { id: "alerts", label: "Hazard Alerts", icon: AlertTriangle },
    { id: "history", label: "Alert History", icon: History },
    { id: "system", label: "System Overview", icon: Settings },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100">
      {/* Top Status Bar */}
      <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-800 rounded"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Satellite className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">SentinelX</h1>
              <p className="text-xs text-gray-400">Visual Safety Monitoring System</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-400 font-medium">Monitoring Active</span>
          </div>
          <div className="text-sm text-gray-400">
            {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } lg:w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0 transition-all duration-300 overflow-hidden`}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
