import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ShieldCheck,
  Gift,
  CreditCard,
  PiggyBank,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import type { User, Session } from "@supabase/supabase-js";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gift className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Treatcode
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <Button onClick={() => navigate("/dashboard")} variant="default">
                Dashboard
              </Button>
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 md:pt-48 md:pb-32 container mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-block p-2 px-4 rounded-full bg-secondary/50 mb-4 animate-fade-in">
            <span className="text-sm font-medium text-muted-foreground">
              ✨ Fun shouldn't feel reckless
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Get what you want. <br />
            <span className="text-primary">No Guilt.</span>
          </h1>

          <div className="flex flex-wrap justify-center gap-4 text-muted-foreground md:text-lg mt-6 font-medium">
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> No credit
              cards
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> No Buy Now
              Pay Later
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> No
              touching savings
            </span>
          </div>

          <div className="pt-8">
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              You work hard. A new pair of trainers or that skincare haul
              shouldn’t spark payday panic.
            </p>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/auth">
                  Start Cashing In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Concept Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                With Treatcode, every treat is pre-saved.
              </h2>
              <div className="prose prose-lg text-muted-foreground space-y-4">
                <p className="text-xl">
                  You’re not spending — you’re cashing in.
                </p>
                <p>
                  Each month, you set aside a little money into your Treatcode
                  account — we call them treatcodes.
                </p>
                <p>
                  As your balance grows, you can redeem your treatcodes
                  instantly for retail vouchers from our partner retailers.
                </p>
              </div>
            </div>
            <div className="relative">
              {/* Visual abstract representation */}
              <div className="aspect-square rounded-3xl bg-gradient-to-tr from-primary/20 to-purple-500/20 p-8 flex items-center justify-center">
                <div className="grid gap-4 w-full">
                  <Card className="bg-background/80 backdrop-blur border-0 shadow-lg p-4 animate-pulse">
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-2 w-20 bg-muted rounded"></div>
                      <div className="h-2 w-8 bg-green-500 rounded"></div>
                    </div>
                    <div className="h-8 w-24 bg-muted rounded mb-2"></div>
                  </Card>
                  <Card className="bg-background/90 backdrop-blur border-0 shadow-xl p-4 scale-105">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Gift className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="h-2 w-24 bg-muted rounded mb-1"></div>
                        <div className="text-lg font-bold">Redeemed!</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Money Your Rules */}
      <section className="py-24 container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-16">
          Your money, your rules.
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="bg-secondary/30 border-0">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <PiggyBank className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Stash It</CardTitle>
            </CardHeader>
            <CardContent>
              Put in £25, £50, or £100+/mo automatically.
            </CardContent>
          </Card>
          <Card className="bg-secondary/30 border-0">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Watch It Grow</CardTitle>
            </CardHeader>
            <CardContent>
              Watch your Treatcode balance build up safely.
            </CardContent>
          </Card>
          <Card className="bg-secondary/30 border-0">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Redeem Instantly</CardTitle>
            </CardHeader>
            <CardContent>
              Redeem any amount, any time, for instant email vouchers.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Retailers */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block p-2 px-4 rounded-full bg-background mb-6 shadow-sm">
            <span className="text-sm font-medium text-foreground">
              🛍️ More brands added frequently
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Shop brands you love
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Your Treatcodes work with the biggest names in fashion, tech, and
            lifestyle.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              "ASOS",
              "Nike",
              "Zara",
              "Amazon",
              "Apple",
              "Sephora",
              "Adidas",
              "H&M",
            ].map((brand) => (
              <div
                key={brand}
                className="group bg-background p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center border border-border/50 cursor-default"
              >
                <div className="flex items-center gap-2 font-bold text-xl text-muted-foreground group-hover:text-primary transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                  {brand}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / CTA */}
      <section className="py-24 bg-background relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-100 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-100 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight text-foreground">
            Join thousands of smart spenders.
          </h2>

          <div className="flex justify-center items-center gap-4 md:gap-12 mb-16 opacity-80">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <PiggyBank className="w-8 h-8 text-primary" />
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Gift className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Ready to start treating yourself better? Create your account and set
            your first treat goal today.
          </p>

          {!user && (
            <Button
              size="lg"
              className="px-8 py-6 text-lg font-semibold h-auto"
              asChild
            >
              <Link to="/auth">Start Cashing In</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2">
              <Gift className="h-6 w-6 text-primary-foreground" />
              <span className="text-xl font-bold">Treatcode</span>
            </div>
            <div className="flex gap-8 text-primary-foreground/90 text-sm">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
            </div>
            <div className="text-primary-foreground/70 text-sm">
              © 2026 Treatcode. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
