import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

export const ScannerModal: React.FC<{
  onClose: () => void;
  onScan: (text: string) => void;
}> = ({ onClose, onScan }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: {width: 250, height: 250}, aspectRatio: 1.0 },
      /* verbose= */ false
    );
    scannerRef.current.render((text) => {
      onScan(text);
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
      onClose();
    }, (err) => {
      // ignore
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error(e));
      }
    };
  }, [onClose, onScan]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-6 pb-2">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Scan Barcode / QR</h2>
          <p className="text-sm text-gray-500">Point your camera at a product barcode to search instantly.</p>
        </div>
        <div className="p-6">
          <div id="reader" className="w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-200"></div>
        </div>
      </div>
    </div>
  );
};
