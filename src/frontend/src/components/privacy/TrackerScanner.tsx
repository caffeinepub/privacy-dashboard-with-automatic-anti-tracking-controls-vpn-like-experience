import { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScanResultsList from './ScanResultsList';
import { parseDomainInput } from '../../lib/domainParsing';
import { isTrackerDomain, getEffectiveBlocklist } from '../../lib/trackerBlocklist';
import { useGetPrivacySettings } from '../../hooks/useQueries';
import { useProtectionLog } from '../../hooks/useProtectionLog';

export default function TrackerScanner() {
  const [inputMode, setInputMode] = useState<'single' | 'multiple'>('single');
  const [singleInput, setSingleInput] = useState('');
  const [multipleInput, setMultipleInput] = useState('');
  const [scanResults, setScanResults] = useState<{
    trackers: string[];
    nonTrackers: string[];
    invalid: Array<{ domain: string; error: string }>;
  } | null>(null);

  const { data: settings } = useGetPrivacySettings();
  const { addEntry } = useProtectionLog();
  const autoStopEnabled = settings?.autoStopTracking ?? true;

  const handleScan = () => {
    const input = inputMode === 'single' ? singleInput : multipleInput;
    
    if (!input.trim()) {
      return;
    }

    const parsed = parseDomainInput(input);
    const effectiveBlocklist = getEffectiveBlocklist(settings?.blockList ?? []);

    const trackers: string[] = [];
    const nonTrackers: string[] = [];
    const invalid: Array<{ domain: string; error: string }> = [];

    parsed.forEach(item => {
      if (!item.isValid) {
        invalid.push({ domain: item.original, error: item.error || 'Invalid' });
      } else if (isTrackerDomain(item.normalized, effectiveBlocklist)) {
        trackers.push(item.normalized);
      } else {
        nonTrackers.push(item.normalized);
      }
    });

    setScanResults({ trackers, nonTrackers, invalid });

    // Add to protection log
    addEntry({
      target: input.length > 50 ? `${input.substring(0, 50)}...` : input,
      detectedCount: trackers.length,
      blockedCount: autoStopEnabled ? trackers.length : 0,
      autoStopEnabled,
    });
  };

  const handleClear = () => {
    setSingleInput('');
    setMultipleInput('');
    setScanResults(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tracker Scanner</CardTitle>
          <CardDescription>
            Enter a URL or domain to check for known tracking domains
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'single' | 'multiple')}>
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="single">Single Domain</TabsTrigger>
              <TabsTrigger value="multiple">Multiple Domains</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="single-input">URL or Domain</Label>
                <Input
                  id="single-input"
                  placeholder="example.com or https://example.com"
                  value={singleInput}
                  onChange={(e) => setSingleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                />
              </div>
            </TabsContent>

            <TabsContent value="multiple" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="multiple-input">Domains (one per line)</Label>
                <Textarea
                  id="multiple-input"
                  placeholder="example.com&#10;another-site.com&#10;third-domain.org"
                  value={multipleInput}
                  onChange={(e) => setMultipleInput(e.target.value)}
                  rows={6}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2">
            <Button onClick={handleScan} className="flex-1" disabled={
              inputMode === 'single' ? !singleInput.trim() : !multipleInput.trim()
            }>
              <Search className="w-4 h-4 mr-2" />
              Scan for Trackers
            </Button>
            <Button onClick={handleClear} variant="outline">
              Clear
            </Button>
          </div>

          {scanResults && scanResults.invalid.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {scanResults.invalid.length} invalid domain(s) found. Check your input format.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {scanResults && (
        <ScanResultsList
          trackers={scanResults.trackers}
          nonTrackers={scanResults.nonTrackers}
          autoStopEnabled={autoStopEnabled}
        />
      )}
    </div>
  );
}
