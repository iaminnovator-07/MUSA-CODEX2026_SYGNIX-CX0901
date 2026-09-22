import { useState } from "react";
import { Plus, Cpu } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { useAuth } from "@/app/providers/AuthProvider";
import { createMachine } from "@/features/machines/services/machineService";
import { useToast } from "@/shared/hooks/use-toast";

const AddDeviceDialog = ({ onDeviceAdded }: { onDeviceAdded: () => void }) => {
  const [open, setOpen] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !deviceName.trim() || !deviceId.trim()) return;

    setLoading(true);

    try {
      await createMachine(user.uid, deviceName, deviceId);

      toast({ title: "Device Added", description: `${deviceName.trim()} has been registered.` });
      setDeviceName("");
      setDeviceId("");
      setOpen(false);
      onDeviceAdded();
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to add device", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-display text-xs tracking-wider">
          <Plus className="w-4 h-4" />
          ADD DEVICE
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            Register New Device
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-display tracking-wider text-muted-foreground mb-2">DEVICE NAME</label>
            <Input value={deviceName} onChange={(e) => setDeviceName(e.target.value)} placeholder="e.g. Lathe Machine" className="bg-secondary border-border" required />
          </div>
          <div>
            <label className="block text-xs font-display tracking-wider text-muted-foreground mb-2">DEVICE ID</label>
            <Input value={deviceId} onChange={(e) => setDeviceId(e.target.value)} placeholder="e.g. machine_001" className="bg-secondary border-border" required />
            <p className="text-[11px] text-muted-foreground mt-1">Must match the device_id your ESP32 sends in its JSON payload.</p>
          </div>
          <Button type="submit" disabled={loading} className="w-full font-display tracking-wider">
            {loading ? "REGISTERING..." : "REGISTER DEVICE"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDeviceDialog;
