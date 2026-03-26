import { Shield, Eye, Bell, History, Settings, AlertTriangle, Video } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export function ThiefDetectionMenu() {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <Shield className="size-5" /> },
    { id: "live", label: "Live Feed", icon: <Eye className="size-5" /> },
    { id: "alerts", label: "Alerts", icon: <Bell className="size-5" /> },
    { id: "history", label: "History", icon: <History className="size-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="size-5" /> },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar Menu */}
      <aside className="w-64 bg-neutral-950 border-r-2 border-green-900/50 flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b-2 border-green-900/50 bg-black">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-green-600 rounded flex items-center justify-center">
              <Video className="size-6 text-black" />
            </div>
            <div>
              <h1 className="font-mono font-bold text-green-500 tracking-wider">SECUREWATCH</h1>
              <p className="text-xs text-green-700 font-mono">CCTV SYSTEM</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveItem(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 font-mono text-sm transition-colors ${
                    activeItem === item.id
                      ? "bg-green-900/50 text-green-400 border-l-2 border-green-500"
                      : "text-green-700 hover:text-green-500 hover:bg-green-950/30"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Status Indicator */}
        <div className="p-4 border-t-2 border-green-900/50 bg-black">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <div className="size-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-500">REC</span>
            </div>
            <div className="text-xs font-mono text-green-700">
              <div>{formatDate(currentTime)}</div>
              <div className="text-green-500">{formatTime(currentTime)}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-black overflow-auto">
        <div className="h-full">
          {activeItem === "dashboard" && <DashboardContent />}
          {activeItem === "live" && <LiveFeedContent />}
          {activeItem === "alerts" && <AlertsContent />}
          {activeItem === "history" && <HistoryContent />}
          {activeItem === "settings" && <SettingsContent />}
        </div>
      </main>
    </div>
  );
}

function DashboardContent() {
  return (
    <div className="h-full p-6">
      <div className="border-b-2 border-green-900/50 pb-4 mb-6">
        <h2 className="text-xl font-mono text-green-500 tracking-wider">MONITORING STATION</h2>
        <p className="text-xs font-mono text-green-700 mt-1">SYSTEM STATUS OVERVIEW</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard title="ACTIVE CAMERAS" value="01" status="ONLINE" />
        <StatCard title="ALERTS TODAY" value="00" status="SECURE" />
        <StatCard title="THREATS DETECTED" value="00" status="CLEAR" />
      </div>
      
      {/* Quick Camera Preview */}
      <div className="mt-8">
        <WebcamPreview />
      </div>
    </div>
  );
}

function LiveFeedContent() {
  return (
    <div className="h-full p-6">
      <div className="border-b-2 border-green-900/50 pb-4 mb-6">
        <h2 className="text-xl font-mono text-green-500 tracking-wider">LIVE SURVEILLANCE</h2>
        <p className="text-xs font-mono text-green-700 mt-1">CAMERA FEED - REAL TIME</p>
      </div>
      <WebcamPreview fullSize />
    </div>
  );
}

function WebcamPreview({ fullSize = false }: { fullSize?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError("CAMERA ACCESS DENIED");
        } else if (err.name === 'NotFoundError') {
          setError("NO CAMERA DETECTED");
        } else {
          setError("CAMERA ERROR");
        }
      }
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className={`bg-black border-2 border-green-900/50 ${fullSize ? 'w-full' : 'w-full'}`}>
      {/* Camera Header */}
      <div className="bg-black border-b-2 border-green-900/50 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isStreaming && <div className="size-2 bg-red-500 rounded-full animate-pulse" />}
            <span className="text-red-500 font-mono text-xs font-bold">
              {isStreaming ? "● REC" : "○ OFFLINE"}
            </span>
          </div>
          <span className="text-green-500 font-mono text-sm tracking-wider">CAM-01</span>
        </div>
        <div className="font-mono text-xs text-green-500">
          {formatDate(currentTime)} {formatTime(currentTime)}
        </div>
      </div>
      
      {/* Video Feed */}
      <div className="relative bg-black">
        {error ? (
          <div className="aspect-video flex items-center justify-center p-8 border-4 border-green-900/20">
            <div className="text-center">
              <div className="mb-4 text-green-700 font-mono text-6xl">⚠</div>
              <p className="text-green-500 font-mono text-sm mb-6 tracking-wider">{error}</p>
              <button
                onClick={startCamera}
                className="px-6 py-2 bg-green-900/50 hover:bg-green-800/50 text-green-400 font-mono text-sm border-2 border-green-700 transition-colors tracking-wider"
              >
                ENABLE CAMERA
              </button>
              <p className="text-xs text-green-700 font-mono mt-4 max-w-sm">
                GRANT CAMERA PERMISSION WHEN PROMPTED
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video object-cover"
              style={{ filter: 'contrast(1.1) brightness(0.95)' }}
            />
            {/* Scanline effect */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-pulse" 
                 style={{ backgroundSize: '100% 4px' }} />
            {/* Corner brackets */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-green-500/70" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-green-500/70" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-green-500/70" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-green-500/70" />
            
            {/* Overlay info */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="bg-black/80 border border-green-900/50 px-3 py-1">
                <p className="text-green-500 font-mono text-xs">LAPTOP CAMERA</p>
              </div>
              <div className="bg-black/80 border border-green-900/50 px-3 py-1">
                <p className="text-green-500 font-mono text-xs">ACTIVE MONITORING</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertsContent() {
  return (
    <div className="h-full p-6">
      <div className="border-b-2 border-green-900/50 pb-4 mb-6">
        <h2 className="text-xl font-mono text-green-500 tracking-wider">ALERT LOG</h2>
        <p className="text-xs font-mono text-green-700 mt-1">RECENT SECURITY EVENTS</p>
      </div>
      <div className="space-y-2">
        <AlertItem time="02:15:33" message="MOTION DETECTED - SECTOR 3" severity="medium" />
        <AlertItem time="01:30:12" message="UNKNOWN PERSON - CAM 01" severity="high" />
        <AlertItem time="00:45:08" message="PERIMETER BREACH - SECTOR 5" severity="low" />
      </div>
    </div>
  );
}

function HistoryContent() {
  return (
    <div className="h-full p-6">
      <div className="border-b-2 border-green-900/50 pb-4 mb-6">
        <h2 className="text-xl font-mono text-green-500 tracking-wider">EVENT HISTORY</h2>
        <p className="text-xs font-mono text-green-700 mt-1">ARCHIVED RECORDINGS</p>
      </div>
      <p className="text-green-700 font-mono text-sm">NO ARCHIVED EVENTS</p>
    </div>
  );
}

function SettingsContent() {
  return (
    <div className="h-full p-6">
      <div className="border-b-2 border-green-900/50 pb-4 mb-6">
        <h2 className="text-xl font-mono text-green-500 tracking-wider">SYSTEM CONFIG</h2>
        <p className="text-xs font-mono text-green-700 mt-1">DETECTION PARAMETERS</p>
      </div>
      <div className="space-y-4">
        <div className="border-2 border-green-900/50 bg-black p-4">
          <p className="text-green-500 font-mono text-sm mb-1">SENSITIVITY: HIGH</p>
          <p className="text-green-700 font-mono text-xs">MOTION THRESHOLD: 15%</p>
        </div>
        <div className="border-2 border-green-900/50 bg-black p-4">
          <p className="text-green-500 font-mono text-sm mb-1">ALERTS: ENABLED</p>
          <p className="text-green-700 font-mono text-xs">NOTIFICATION MODE: REALTIME</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, status }: { title: string; value: string; status: string }) {
  return (
    <div className="bg-black border-2 border-green-900/50 p-4">
      <p className="text-green-700 font-mono text-xs mb-2 tracking-wider">{title}</p>
      <p className="text-green-500 font-mono text-4xl font-bold mb-2">{value}</p>
      <div className="inline-block px-2 py-1 bg-green-900/30 border border-green-700">
        <span className="text-green-400 font-mono text-xs">{status}</span>
      </div>
    </div>
  );
}

function AlertItem({ time, message, severity }: { time: string; message: string; severity: string }) {
  const severityColors = {
    high: "border-red-500 bg-red-950/20",
    medium: "border-yellow-500 bg-yellow-950/20",
    low: "border-green-500 bg-green-950/20",
  };

  const textColors = {
    high: "text-red-400",
    medium: "text-yellow-400",
    low: "text-green-400",
  };

  return (
    <div className={`border-2 ${severityColors[severity as keyof typeof severityColors]} p-3 flex items-start gap-3`}>
      <div className="flex-1">
        <p className={`font-mono text-sm ${textColors[severity as keyof typeof textColors]}`}>{message}</p>
        <p className="text-xs font-mono text-green-700 mt-1">{time}</p>
      </div>
      <span className={`font-mono text-xs px-2 py-1 border ${textColors[severity as keyof typeof textColors]} ${severityColors[severity as keyof typeof severityColors]}`}>
        {severity.toUpperCase()}
      </span>
    </div>
  );
}