import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Copy, Send } from "lucide-react";
import TrainerLayout from "@/components/trainer/TrainerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const InviteClient = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    if (user) setLink(`${window.location.origin}/auth?invite=${user.id}`);
  }, [user]);

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    toast.success("Link copied");
  };

  const sendEmail = () => {
    if (!email.trim()) return;
    window.location.href = `mailto:${email}?subject=Join my coaching program&body=${encodeURIComponent(
      `Join me on NutriSnap: ${link}`
    )}`;
  };

  return (
    <TrainerLayout
      title="Invite Client"
      right={
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      }
    >
      <div className="space-y-4">
        <Card className="card-premium p-5 space-y-3">
          <Label>Invite link</Label>
          <div className="flex gap-2">
            <Input value={link} readOnly />
            <Button size="icon" variant="outline" onClick={copy}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this link so clients can sign up and link to you.
          </p>
        </Card>
        <Card className="card-premium p-5 space-y-3">
          <Label>Send via email</Label>
          <Input
            type="email"
            placeholder="client@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={sendEmail} className="w-full gap-2">
            <Send className="h-4 w-4" /> Send Invite
          </Button>
        </Card>
      </div>
    </TrainerLayout>
  );
};

export default InviteClient;