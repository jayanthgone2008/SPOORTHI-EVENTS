import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

export default function QRCameraScanner({ onScan }) {
  const [active, setActive] = useState(false);
  const scannerRef = useRef(null);
  const containerId = 'qr-camera-scanner';

  useEffect(() => {
    if (!active) return;

    const scanner = new Html5QrcodeScanner(
      containerId,
      { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
      false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear().catch(() => {});
        setActive(false);
      },
      () => {}
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [active]);

  const stop = () => {
    scannerRef.current?.clear().catch(() => {});
    setActive(false);
  };

  if (!active) {
    return (
      <Button
        type="button"
        variant="outline"
        className="rounded-xl h-12 gap-2 border-primary/40 text-primary hover:bg-primary/5"
        onClick={() => setActive(true)}
      >
        <Camera className="w-4 h-4" /> Scan with Camera
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-primary flex items-center gap-1.5">
          <Camera className="w-4 h-4" /> Camera Scanner Active
        </span>
        <Button type="button" size="sm" variant="ghost" className="rounded-xl h-8 gap-1 text-muted-foreground" onClick={stop}>
          <X className="w-3.5 h-3.5" /> Stop
        </Button>
      </div>
      <div id={containerId} className="rounded-2xl overflow-hidden border border-border/50" />
    </div>
  );
}