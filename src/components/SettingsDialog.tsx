import { useState } from 'react';
import { Settings, X, Bell, Moon, Sun, Volume2, VolumeX, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

const SettingsDialog = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    emailAlerts: false,
    autoRefresh: true,
    refreshInterval: 30,
    confidenceThreshold: 70,
    showHoldSignals: true,
  });

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your trading dashboard preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Notifications Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="flex flex-col gap-1">
                <span>Push Notifications</span>
                <span className="text-xs text-muted-foreground">
                  Receive alerts for new signals
                </span>
              </Label>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(v) => updateSetting('notifications', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sound" className="flex flex-col gap-1">
                <span>Sound Alerts</span>
                <span className="text-xs text-muted-foreground">
                  Play sound on new signals
                </span>
              </Label>
              <Switch
                id="sound"
                checked={settings.sound}
                onCheckedChange={(v) => updateSetting('sound', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="flex flex-col gap-1">
                <span>Email Alerts</span>
                <span className="text-xs text-muted-foreground">
                  Send signals to your email
                </span>
              </Label>
              <Switch
                id="email"
                checked={settings.emailAlerts}
                onCheckedChange={(v) => updateSetting('emailAlerts', v)}
              />
            </div>
          </div>

          <Separator />

          {/* Signal Preferences */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Signal Preferences</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Minimum Confidence</Label>
                <span className="text-sm font-mono text-primary">
                  {settings.confidenceThreshold}%
                </span>
              </div>
              <Slider
                value={[settings.confidenceThreshold]}
                onValueChange={([v]) => updateSetting('confidenceThreshold', v)}
                min={50}
                max={95}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Only show signals above this confidence level
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="holdSignals" className="flex flex-col gap-1">
                <span>Show HOLD Signals</span>
                <span className="text-xs text-muted-foreground">
                  Display neutral/hold recommendations
                </span>
              </Label>
              <Switch
                id="holdSignals"
                checked={settings.showHoldSignals}
                onCheckedChange={(v) => updateSetting('showHoldSignals', v)}
              />
            </div>
          </div>

          <Separator />

          {/* Data Refresh */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Data Refresh</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="autoRefresh" className="flex flex-col gap-1">
                <span>Auto Refresh</span>
                <span className="text-xs text-muted-foreground">
                  Automatically update data
                </span>
              </Label>
              <Switch
                id="autoRefresh"
                checked={settings.autoRefresh}
                onCheckedChange={(v) => updateSetting('autoRefresh', v)}
              />
            </div>

            {settings.autoRefresh && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Refresh Interval</Label>
                  <span className="text-sm font-mono text-primary">
                    {settings.refreshInterval}s
                  </span>
                </div>
                <Slider
                  value={[settings.refreshInterval]}
                  onValueChange={([v]) => updateSetting('refreshInterval', v)}
                  min={5}
                  max={60}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm">
            Reset to Defaults
          </Button>
          <Button size="sm">Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
