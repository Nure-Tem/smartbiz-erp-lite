import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LoadingSpinner } from "@/components/common/loading-spinner";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // The actual confirmation URL uses the implicit flow (hash fragment):
        // /auth/callback#access_token=...&refresh_token=...&type=signup
        //
        // detectSessionInUrl: true in supabase.ts handles this automatically —
        // the Supabase client reads the hash on createClient() and establishes
        // the session before this component even runs.
        //
        // We also check query params for error cases or future PKCE flows.

        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        const type = hashParams.get('type') || queryParams.get('type');
        const errorCode = hashParams.get('error') || queryParams.get('error');
        const errorDescription =
          hashParams.get('error_description') ||
          queryParams.get('error_description');

        console.log('Auth callback:', {
          type,
          errorCode,
          errorDescription,
          hash: window.location.hash.substring(0, 60) + '...',
        });

        // Surface any error Supabase put in the URL
        if (errorCode || errorDescription) {
          console.error('Auth callback error:', errorCode, errorDescription);
          setStatus('error');
          setMessage(errorDescription || 'Email confirmation failed. Please try again.');
          setTimeout(() => navigate({ to: '/login' }), 3000);
          return;
        }

        // detectSessionInUrl: true has already processed the hash.
        // Give it a tick to finish persisting the session before we read it.
        await new Promise(resolve => setTimeout(resolve, 300));

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error after callback:', sessionError);
          setStatus('error');
          setMessage('Failed to establish session. Please try logging in.');
          setTimeout(() => navigate({ to: '/login' }), 3000);
          return;
        }

        if (session) {
          console.log('Session established for:', session.user.email);
          console.log('Confirmed at:', session.user.confirmed_at);
          setStatus('success');
          setMessage('Email confirmed! Redirecting to dashboard...');
          window.dispatchEvent(new Event('smartbiz-auth'));
          setTimeout(() => navigate({ to: '/' }), 1500);
        } else {
          // Token processed but no session (e.g. already used link)
          setStatus('success');
          setMessage('Email confirmed! Please log in to continue.');
          setTimeout(() => navigate({ to: '/login' }), 2000);
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try logging in.');
        setTimeout(() => navigate({ to: '/login' }), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex items-center justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            {status === 'processing' && <LoadingSpinner />}
            {status === 'success' && (
              <svg className="size-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'error' && (
              <svg className="size-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {status === 'processing' && 'Processing...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Error'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}
