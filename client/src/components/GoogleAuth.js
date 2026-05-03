import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
export default function GoogleAuth({ onSuccess, onError, className = "", variant = "outline", size = "default" }) {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    // Load Google Identity Services
    useEffect(() => {
        // Prefer Vite env, but fall back to server-provided runtime value when serving from port 5000
        const clientId = import.meta?.env?.VITE_GOOGLE_CLIENT_ID;
        const runtimeClientId = window.__GOOGLE_CLIENT_ID__;
        const effectiveClientId = clientId || runtimeClientId;
        if (!effectiveClientId) {
            console.error('Google Client ID missing. Set VITE_GOOGLE_CLIENT_ID in client/.env or provide GOOGLE_CLIENT_ID on the server.');
            toast({
                title: 'Google Sign-in',
                description: 'missing_client_id. Provide VITE_GOOGLE_CLIENT_ID (front-end) or GOOGLE_CLIENT_ID (server).',
            });
        }
        const loadGoogleScript = () => {
            if (window.google) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: effectiveClientId,
                        callback: handleGoogleResponse,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                        itp_support: true,
                        use_fedcm_for_prompt: true,
                    });
                    window.google.accounts.id.disableAutoSelect();
                }
                catch (e) {
                    console.error('GIS init error:', e);
                }
                setIsGoogleLoaded(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                try {
                    window.google.accounts.id.initialize({
                        client_id: effectiveClientId,
                        callback: handleGoogleResponse,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                        itp_support: true,
                        use_fedcm_for_prompt: true,
                    });
                    window.google.accounts.id.disableAutoSelect();
                }
                catch (e) {
                    console.error('GIS init error:', e);
                }
                setIsGoogleLoaded(true);
            };
            script.onerror = () => {
                console.error('Failed to load Google Identity Services');
                onError?.('Failed to load Google authentication');
            };
            document.head.appendChild(script);
        };
        loadGoogleScript();
    }, []);
    const handleGoogleResponse = async (response) => {
        setIsLoading(true);
        try {
            // Send the credential to your backend
            const backendResponse = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: response.credential
                }),
            });
            const data = await backendResponse.json();
            if (data.success) {
                // Store user data and token
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                // Show success message
                toast({
                    title: "Welcome!",
                    description: `Successfully signed in as ${data.user.name}`,
                });
                // Call success callback
                onSuccess?.(data.user);
                // Redirect based on user role
                if (data.user.role === 'admin') {
                    setLocation('/admin-dashboard');
                }
                else {
                    setLocation('/my-bookings');
                }
            }
            else {
                throw new Error(data.message || 'Google authentication failed');
            }
        }
        catch (error) {
            console.error('Google auth error:', error);
            const errorMessage = error.message || 'Google authentication failed';
            toast({
                title: "Authentication Failed",
                description: errorMessage,
                variant: "destructive",
            });
            onError?.(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleGoogleSignIn = (e) => {
        // Prevent the button from submitting the surrounding form
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!isGoogleLoaded) {
            toast({
                title: "Loading...",
                description: "Google authentication is still loading. Please try again.",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        try {
            // Force showing the account chooser; avoid FedCM-only path to reduce AbortError
            if (window.google?.accounts?.id) {
                // Re-initialize with relaxed settings in case the first init was blocked
                try {
                    const clientId = import.meta?.env?.VITE_GOOGLE_CLIENT_ID || window.__GOOGLE_CLIENT_ID__;
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: handleGoogleResponse,
                        auto_select: false,
                        cancel_on_tap_outside: false,
                        itp_support: true,
                        use_fedcm_for_prompt: false,
                    });
                }
                catch { }
            }
            window.google.accounts.id.prompt((notification) => {
                const notDisplayed = notification.isNotDisplayed?.();
                const skipped = notification.isSkippedMoment?.();
                if (notDisplayed || skipped) {
                    setIsLoading(false);
                    const reason = notification.getNotDisplayedReason?.() || notification.getSkippedReason?.() || 'Prompt was dismissed';
                    if (reason !== 'tap_outside') {
                        toast({
                            title: "Google Sign-in",
                            description: `${reason}. If the account chooser didn't appear, enable third‑party cookies or FedCM and ensure no popup blocker is active.`,
                        });
                    }
                }
            });
        }
        catch (error) {
            console.error('Error initiating Google sign-in:', error);
            setIsLoading(false);
            onError?.('Failed to initiate Google sign-in');
        }
    };
    return (_jsxs(Button, { type: "button", onClick: handleGoogleSignIn, disabled: isLoading || !isGoogleLoaded, variant: variant, size: size, className: `w-full flex items-center justify-center gap-3 transition-all duration-300 ${variant === 'outline'
            ? 'border-2 border-[#D4C4B4] hover:border-[#C9A58B] hover:bg-[#C9A58B]/10 text-[#8B7D6B] hover:text-[#C9A58B]'
            : 'bg-[#8B7D6B] hover:bg-[#9D8E7C] text-white'} ${className}`, children: [isLoading ? (_jsx(Loader2, { className: "h-4 w-4 animate-spin" })) : (_jsxs("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", children: [_jsx("path", { fill: "currentColor", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), _jsx("path", { fill: "currentColor", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { fill: "currentColor", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { fill: "currentColor", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] })), _jsx("span", { className: "font-medium", children: isLoading ? 'Signing in...' : 'Continue with Google' })] }));
}
