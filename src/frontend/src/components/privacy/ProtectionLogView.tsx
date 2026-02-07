import { Clock, Trash2, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useProtectionLog } from '../../hooks/useProtectionLog';

export default function ProtectionLogView() {
  const { entries, clearLog } = useProtectionLog();

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Protection Activity Log</CardTitle>
          <CardDescription>
            Your recent tracker scans will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <img 
              src="/assets/generated/privacy-hero.dim_1200x600.png" 
              alt="Privacy Protection" 
              className="w-full max-w-md mb-6 rounded-lg opacity-80"
              width={600}
              height={300}
            />
            <Shield className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Start scanning domains to see your protection activity log here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Protection Activity Log</CardTitle>
            <CardDescription>
              {entries.length} scan{entries.length !== 1 ? 's' : ''} recorded
            </CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Log
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear protection log?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {entries.length} log entries. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearLog}>Clear Log</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={entry.id}>
                <div className="flex items-start gap-4 py-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      entry.autoStopEnabled ? 'bg-protected/20' : 'bg-muted'
                    }`}>
                      <Shield className={`w-5 h-5 ${
                        entry.autoStopEnabled ? 'text-protected' : 'text-muted-foreground'
                      }`} />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entry.target}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(entry.timestamp)}
                        </div>
                      </div>
                      <Badge 
                        variant={entry.autoStopEnabled ? 'default' : 'secondary'}
                        className={entry.autoStopEnabled ? 'bg-protected text-protected-foreground' : ''}
                      >
                        {entry.autoStopEnabled ? 'Protected' : 'Unprotected'}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Detected:</span>{' '}
                        <span className="font-medium text-blocked">{entry.detectedCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Blocked:</span>{' '}
                        <span className="font-medium text-protected">{entry.blockedCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {index < entries.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
