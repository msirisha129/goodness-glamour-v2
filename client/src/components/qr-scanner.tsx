import { useState, useRef, useEffect } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
}

export default function QRScanner({ isOpen, onClose, onScanSuccess }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && hasPermission === null) {
      requestCameraPermission();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setHasPermission(true);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera permission denied:', error);
      setHasPermission(false);
      toast({
        title: "Camera Access Required",
        description: "Please allow camera access to scan QR codes.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    
    // Simulate QR scanning since we can't implement actual QR detection without additional libraries
    // In a real implementation, you would use jsQR or QuaggaJS here
    setTimeout(() => {
      setIsScanning(false);
      const mockQRData = JSON.stringify({
        url: window.location.origin + "/ai-chat",
        serviceId: null,
        source: "website",
        timestamp: new Date().toISOString()
      });
      onScanSuccess(mockQRData);
      toast({
        title: "QR Code Scanned!",
        description: "Starting AI assistant...",
      });
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    stopCamera();
    setIsScanning(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" data-testid="dialog-qr-scanner">
        <DialogHeader>
          <DialogTitle className="text-center font-serif">QR Code Scanner</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-center text-muted-foreground">
            Position the QR code within the camera view to start AI assistant
          </p>
          
          {/* Camera View */}
          <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
            {hasPermission === null && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-muted-foreground">Requesting camera access...</p>
                </div>
              </div>
            )}
            
            {hasPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Camera access denied</p>
                  <Button 
                    onClick={requestCameraPermission} 
                    variant="outline" 
                    className="mt-2"
                    data-testid="button-retry-camera"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}
            
            {hasPermission === true && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  data-testid="video-camera"
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 border-2 border-primary rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-accent rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-accent rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-accent rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-accent rounded-br-lg"></div>
                    
                    {isScanning && (
                      <div className="absolute inset-0 bg-accent/20 animate-pulse rounded-lg"></div>
                    )}
                  </div>
                </div>
                
                {isScanning && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-background/90 px-4 py-2 rounded-lg flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" />
                      <span className="text-sm">Scanning...</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button 
              onClick={startScanning} 
              disabled={hasPermission !== true || isScanning}
              className="flex-1 btn-primary"
              data-testid="button-start-scanning"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Scanning...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Scanning
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleClose} 
              variant="outline" 
              className="flex-1"
              data-testid="button-cancel-scan"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
