import { useState } from 'react';
import { Plus, Trash2, Info, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useGetPrivacySettings, useAddBlockEntry, useRemoveBlockEntry } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { DEFAULT_TRACKER_DOMAINS, normalizeDomain } from '../../lib/trackerBlocklist';

export default function BlocklistManager() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [newDomain, setNewDomain] = useState('');
  
  const { data: settings, isLoading, error, refetch } = useGetPrivacySettings();
  const addMutation = useAddBlockEntry();
  const removeMutation = useRemoveBlockEntry();

  const handleAdd = () => {
    const normalized = normalizeDomain(newDomain);
    if (normalized) {
      addMutation.mutate(normalized, {
        onSuccess: () => setNewDomain(''),
      });
    }
  };

  const handleRemove = (domain: string) => {
    removeMutation.mutate(domain);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blocklist Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load blocklist: {error.message}</span>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const userBlocklist = settings?.blockList ?? [];
  const totalBlocked = DEFAULT_TRACKER_DOMAINS.length + userBlocklist.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Blocklist</CardTitle>
          <CardDescription>
            Add your own domains to block in addition to the {DEFAULT_TRACKER_DOMAINS.length} built-in tracker domains
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAuthenticated && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Log in to save custom blocked domains across sessions.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="new-domain">Domain to block</Label>
              <Input
                id="new-domain"
                placeholder="tracker.example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                disabled={!isAuthenticated || addMutation.isPending}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAdd} 
                disabled={!newDomain.trim() || !isAuthenticated || addMutation.isPending}
              >
                {addMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Total Blocked Domains</div>
                <div className="text-sm text-muted-foreground">
                  {DEFAULT_TRACKER_DOMAINS.length} built-in + {userBlocklist.length} custom
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {totalBlocked}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {userBlocklist.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Custom Domains ({userBlocklist.length})</CardTitle>
            <CardDescription>
              Domains you've added to your personal blocklist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-4 space-y-2">
                {userBlocklist.map((domain, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <span className="text-sm font-mono">{domain}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(domain)}
                      disabled={removeMutation.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Built-in Tracker Domains ({DEFAULT_TRACKER_DOMAINS.length})</CardTitle>
          <CardDescription>
            Common tracking domains blocked by default
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] rounded-md border">
            <div className="p-4 space-y-2">
              {DEFAULT_TRACKER_DOMAINS.map((domain, index) => (
                <div key={index} className="py-2 px-3 bg-muted/30 rounded">
                  <span className="text-sm font-mono text-muted-foreground">{domain}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
