import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift, LogOut, Menu, User, LogIn, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

interface HeaderProps {
  userEmail?: string | null;
  userName?: string | null;
  isAdmin?: boolean;
}

export const Header = ({ userEmail, userName, isAdmin }: HeaderProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isLoggedIn = !!(userEmail || userName);

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
    setOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border/50 transition-all duration-300">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => handleNavigation(isLoggedIn ? "/dashboard" : "/")}
        >
          <Gift className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Treatcode
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-muted-foreground">
                Welcome, {userName || userEmail}
              </span>
              {isAdmin && (
                <Button
                  onClick={() => handleNavigation("/admin")}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              )}
              <Button onClick={() => handleNavigation("/dashboard")} variant="default" size="sm">
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className="hidden sm:inline-flex"
              >
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-12 w-12 [&_svg]:size-8">
                <Menu />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-6">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground px-2">
                      <User className="h-4 w-4" />
                      <span>{userName || userEmail}</span>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => handleNavigation("/admin")}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleNavigation("/dashboard")}
                    >
                      <Gift className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleNavigation("/auth")}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => handleNavigation("/auth")}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
