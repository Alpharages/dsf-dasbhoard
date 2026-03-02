import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const location = useLocation();

  const requestedUrl = useMemo(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;
    return path || '/';
  }, [location.pathname, location.search, location.hash]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-4">
        <CircleAlert className="h-6 w-6" aria-hidden="true" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight">404 — Page Not Found</h1>
      <p className="text-muted-foreground mt-2">The page you requested does not exist.</p>

      <p className="text-sm text-muted-foreground mt-4">
        Requested URL: <code className="font-mono">{requestedUrl}</code>
      </p>

      <Button asChild className="mt-6">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Go to Dashboard
        </Link>
      </Button>
    </div>
  );
}
