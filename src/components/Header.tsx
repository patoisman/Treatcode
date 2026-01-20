import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface HeaderProps {
  userEmail?: string;
  userName?: string;
}

export const Header = ({ userEmail, userName }: HeaderProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out.",
      });
      navigate("/");
    }
  };

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <Gift className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Treatcode</h1>
        </div>

        <div className="flex items-center space-x-4">
          {(userName || userEmail) && (
            <span className="text-sm text-muted-foreground hidden md:inline">
              Welcome, {userName || userEmail}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
