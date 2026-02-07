import { Shield, ShieldAlert, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetPrivacySettings, useSetAutoStopTracking } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function ProtectionStatusCard() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: settings, isLoading } = useGetPrivacySettings();
  const setAutoStopMutation = useSetAutoStopTracking();

  const isProtected = settings?.autoStopTracking ?? true;

  const handleToggle = (checked: boolean) => {
    setAutoStopMutation.mutate(checked);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {isProtected ? (
                <>
                  <Shield className="w-5 h-5 text-protected" />
                  <span>Protection Active</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5 text-allowed" />
                  <span>Protection Disabled</span>
                </>
              )}
            </CardTitle>
            <CardDescription className="mt-2">
              {isProtected
                ? 'Trackers are being detected and blocked when you scan domains.'
                : 'Tracker detection is active but blocking is disabled.'}
            </CardDescription>
          </div>
          <Badge 
            variant={isProtected ? 'default' : 'secondary'}
            className={isProtected ? 'bg-protected text-protected-foreground' : ''}
          >
            {isProtected ? 'Protected' : 'Unprotected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <Label htmlFor="auto-stop-tracking" className="text-base font-medium cursor-pointer">
              Auto-stop tracking
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Automatically block detected trackers during scans
            </p>
          </div>
          <Switch
            id="auto-stop-tracking"
            checked={isProtected}
            onCheckedChange={handleToggle}
            disabled={setAutoStopMutation.isPending || !isAuthenticated}
          />
        </div>

        {!isAuthenticated && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Log in to save your privacy settings and custom blocklist across sessions.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
