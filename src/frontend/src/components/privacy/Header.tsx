import { Shield } from 'lucide-react';
import LoginButton from '../auth/LoginButton';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';

export default function Header() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile } = useGetCallerUserProfile();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/generated/vpn-shield-logo.dim_512x512.png" 
                alt="Privacy Shield Logo" 
                className="w-10 h-10"
                width={40}
                height={40}
              />
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  Privacy Shield
                </h1>
                <p className="text-xs text-muted-foreground">Anti-tracking dashboard</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && userProfile && (
              <div className="hidden sm:block text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-foreground">{userProfile.name}</span>
              </div>
            )}
            <LoginButton />
          </div>
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
          <Shield className="inline w-3 h-3 mr-1" />
          Note: This is a privacy dashboard for tracker detection and blocking simulation. It does not provide actual VPN tunneling or system-wide traffic interception.
        </div>
      </div>
    </header>
  );
}
