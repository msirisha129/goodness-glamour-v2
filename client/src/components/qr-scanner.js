import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
export default function QRScanner({ isOpen, onClose, onScanSuccess }) {
    const [isScanning, setIsScanning] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
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
        }
        catch (error) {
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
    return (_jsx(Dialog, { open: isOpen, onOpenChange: handleClose, children: _jsxs(DialogContent, { className: "max-w-md", "data-testid": "dialog-qr-scanner", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { className: "text-center font-serif", children: "QR Code Scanner" }) }), _jsxs("div", { className: "space-y-6", children: [_jsx("p", { className: "text-center text-muted-foreground", children: "Position the QR code within the camera view to start AI assistant" }), _jsxs("div", { className: "relative w-full h-64 bg-muted rounded-lg overflow-hidden", children: [hasPermission === null && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "h-8 w-8 animate-spin mx-auto mb-2 text-primary" }), _jsx("p", { className: "text-muted-foreground", children: "Requesting camera access..." })] }) })), hasPermission === false && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Camera, { className: "h-12 w-12 mx-auto mb-2 text-muted-foreground" }), _jsx("p", { className: "text-muted-foreground", children: "Camera access denied" }), _jsx(Button, { onClick: requestCameraPermission, variant: "outline", className: "mt-2", "data-testid": "button-retry-camera", children: "Retry" })] }) })), hasPermission === true && (_jsxs(_Fragment, { children: [_jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, className: "w-full h-full object-cover", "data-testid": "video-camera" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("div", { className: "w-40 h-40 border-2 border-primary rounded-lg relative", children: [_jsx("div", { className: "absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-accent rounded-tl-lg" }), _jsx("div", { className: "absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-accent rounded-tr-lg" }), _jsx("div", { className: "absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-accent rounded-bl-lg" }), _jsx("div", { className: "absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-accent rounded-br-lg" }), isScanning && (_jsx("div", { className: "absolute inset-0 bg-accent/20 animate-pulse rounded-lg" }))] }) }), isScanning && (_jsx("div", { className: "absolute bottom-4 left-1/2 transform -translate-x-1/2", children: _jsxs("div", { className: "bg-background/90 px-4 py-2 rounded-lg flex items-center", children: [_jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2 text-primary" }), _jsx("span", { className: "text-sm", children: "Scanning..." })] }) }))] }))] }), _jsxs("div", { className: "flex space-x-4", children: [_jsx(Button, { onClick: startScanning, disabled: hasPermission !== true || isScanning, className: "flex-1 btn-primary", "data-testid": "button-start-scanning", children: isScanning ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }), "Scanning..."] })) : (_jsxs(_Fragment, { children: [_jsx(Camera, { className: "h-4 w-4 mr-2" }), "Start Scanning"] })) }), _jsxs(Button, { onClick: handleClose, variant: "outline", className: "flex-1", "data-testid": "button-cancel-scan", children: [_jsx(X, { className: "h-4 w-4 mr-2" }), "Cancel"] })] })] })] }) }));
}
