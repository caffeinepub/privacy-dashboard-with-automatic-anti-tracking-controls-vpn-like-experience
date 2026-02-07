import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScanResultsListProps {
  trackers: string[];
  nonTrackers: string[];
  autoStopEnabled: boolean;
}

export default function ScanResultsList({ trackers, nonTrackers, autoStopEnabled }: ScanResultsListProps) {
  const totalScanned = trackers.length + nonTrackers.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Scan Results
        </CardTitle>
        <CardDescription>
          Scanned {totalScanned} domain{totalScanned !== 1 ? 's' : ''} • Found {trackers.length} tracker{trackers.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-2xl font-bold">{totalScanned}</div>
            <div className="text-sm text-muted-foreground">Total Scanned</div>
          </div>
          <div className="bg-blocked/10 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blocked">{trackers.length}</div>
            <div className="text-sm text-muted-foreground">Trackers Detected</div>
          </div>
          <div className="bg-protected/10 p-4 rounded-lg">
            <div className="text-2xl font-bold text-protected">{nonTrackers.length}</div>
            <div className="text-sm text-muted-foreground">Clean Domains</div>
          </div>
        </div>

        <Separator />

        {/* Detected Trackers */}
        {trackers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blocked" />
                Detected Trackers
              </h3>
              <Badge 
                variant={autoStopEnabled ? 'destructive' : 'secondary'}
                className={autoStopEnabled ? 'bg-blocked text-blocked-foreground' : 'bg-allowed text-allowed-foreground'}
              >
                {autoStopEnabled ? 'Blocked' : 'Allowed'}
              </Badge>
            </div>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-2">
                {trackers.map((tracker, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded">
                    <span className="text-sm font-mono">{tracker}</span>
                    {autoStopEnabled ? (
                      <AlertTriangle className="w-4 h-4 text-blocked" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-allowed" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Non-Tracker Domains */}
        {nonTrackers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-protected" />
                Clean Domains
              </h3>
              <Badge variant="secondary" className="bg-protected/20 text-protected">
                Safe
              </Badge>
            </div>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-2">
                {nonTrackers.map((domain, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded">
                    <span className="text-sm font-mono">{domain}</span>
                    <CheckCircle2 className="w-4 h-4 text-protected" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {trackers.length === 0 && nonTrackers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No valid domains to display
          </div>
        )}
      </CardContent>
    </Card>
  );
}
