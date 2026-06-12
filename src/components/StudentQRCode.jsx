import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import { useState } from 'react';

export default function StudentQRCode({ registration, eventTitle }) {
  const [open, setOpen] = useState(false);
  const qrData = registration.qr_code_data || registration.registration_id;

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs rounded-lg gap-1 border-primary/30 text-primary"
        onClick={() => setOpen(true)}
      >
        <QrCode className="w-3 h-3" /> QR Pass
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-center">Event Pass</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="bg-white p-4 rounded-2xl shadow-inner">
              <QRCodeSVG
                value={qrData}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm">{registration.full_name}</p>
              <p className="text-xs text-muted-foreground">{eventTitle || 'Event'}</p>
              <p className="font-mono text-xs text-primary mt-1">{registration.registration_id}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{registration.branch} · {registration.year}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}