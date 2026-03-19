import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Gift,
  CreditCard,
  PiggyBank,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <Header userEmail={user?.email} />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 md:pt-48 md:pb-32 container mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-block p-2 px-4 rounded-full bg-secondary/50 mb-4 animate-fade-in">
            <span className="text-sm font-medium text-muted-foreground">
              ✨ Pay Now Buy Later
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
            Buy what you want, <br className="hidden sm:block" />
            <span className="text-primary">whenever you want.</span>
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
              shouldn't spark payday panic.
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
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                With Treatcode everything is already paid for
              </h2>
              <div className="prose prose-lg text-muted-foreground space-y-4">
                <p className="text-xl">
                  You're not spending — you're cashing in.
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
              <div className="aspect-square rounded-3xl bg-gradient-to-tr from-primary/20 to-purple-500/20 p-8 flex items-center justify-center">
                <div className="grid gap-6 w-full max-w-sm">
                  {/* Card 1: Accumulation */}
                  <Card className="bg-background/80 backdrop-blur border-0 shadow-lg p-5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            Balance
                          </p>
                          <p className="text-xl font-bold text-foreground">
                            £150.00
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        +£50/mo
                      </div>
                    </div>
                  </Card>

                  {/* Card 2: Redemption */}
                  <Card className="bg-background/95 backdrop-blur border-0 shadow-xl p-5 scale-105 ring-1 ring-primary/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                          <Gift className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            Treatcode Voucher
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ASOS, Nike, & more
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm font-mono text-muted-foreground">
                        TC-8X92-MN...
                      </span>
                      <span className="text-sm font-bold text-primary">
                        Redeemed!
                      </span>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Money Your Rules */}
      <section className="py-16 md:py-24 container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 md:mb-16">
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
      <section className="py-16 md:py-24 bg-secondary/30">
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
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
      <section className="py-16 md:py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-100 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-100 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight text-foreground">
            Join thousands of smart spenders.
          </h2>

          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-12 mb-16 opacity-80">
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
            <div className="flex flex-col items-center gap-3 text-primary-foreground/90 text-sm">
              <div className="flex gap-8">
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
              <p className="text-xs opacity-90 text-center">
                Need help? Contact us at{" "}
                <a
                  href="mailto:treatcode@treatcode.com"
                  className="underline underline-offset-2 hover:text-white transition-colors"
                >
                  treatcode@treatcode.com
                </a>
              </p>
            </div>
            <div className="text-primary-foreground/70 text-sm text-center md:text-right">
              <p>© 2026 Treat Code Ltd. All rights reserved.</p>
              <p className="mt-2 text-xs opacity-80">
                Treat Code Ltd is registered in the UK (16429228)
              </p>
              <p className="mt-1 text-xs opacity-80 max-w-md ml-auto">
                Treat Code Ltd is a Limited Network Exclusion company as defined
                by the Financial Conduct Authority FCA
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
