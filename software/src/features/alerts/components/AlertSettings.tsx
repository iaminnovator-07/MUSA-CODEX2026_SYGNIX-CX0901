import { useState, useEffect } from "react";
import { Settings, Bell } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { useAuth } from "@/app/providers/AuthProvider";
import { database, ref, set, onValue } from "@/services/firebase";
import { useToast } from "@/shared/hooks/use-toast";

interface Thresholds {
  tempMax: number;
  vibMax: number;
  distMin: number;
}

const defaultThresholds: Thresholds = { tempMax: 38, vibMax: 4, distMin: 30 };

const AlertSettings = ({ deviceId }: { deviceId: string }) => {
  const [open, setOpen] = useState(false);
  const [thresholds, setThresholds] = useState<Thresholds>(defaultThresholds);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !deviceId) return;
    const unsubscribe = onValue(ref(database, `alertSettings/${user.uid}/${deviceId}`), (snapshot) => {
      if (snapshot.exists()) setThresholds(snapshot.val());
    });
    return unsubscribe;
  }, [user, deviceId]);

  const save = async () => {
    if (!user) return;
    await set(ref(database, `alertSettings/${user.uid}/${deviceId}`), thresholds);
    toast({ title: "Thresholds Saved" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-display text-xs tracking-wider">
          <Settings className="w-3.5 h-3.5" />
          ALERTS
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Alert Thresholds
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-display tracking-wider text-muted-foreground mb-2">MAX TEMPERATURE (°C)</label>
            <Input type="number" value={thresholds.tempMax} onChange={(event) => setThresholds({ ...thresholds, tempMax: Number(event.target.value) })} className="bg-secondary border-border" />
          </div>
          <div>
            <label className="block text-xs font-display tracking-wider text-muted-foreground mb-2">MAX VIBRATION (g)</label>
            <Input type="number" step="0.1" value={thresholds.vibMax} onChange={(event) => setThresholds({ ...thresholds, vibMax: Number(event.target.value) })} className="bg-secondary border-border" />
          </div>
          <div>
            <label className="block text-xs font-display tracking-wider text-muted-foreground mb-2">MIN SAFE DISTANCE (cm)</label>
            <Input type="number" value={thresholds.distMin} onChange={(event) => setThresholds({ ...thresholds, distMin: Number(event.target.value) })} className="bg-secondary border-border" />
          </div>
          <Button onClick={save} className="w-full font-display tracking-wider">SAVE THRESHOLDS</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlertSettings;
