"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Globe,
  ShieldCheck,
  MapPin,
  Clock,
  Save,
} from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useWallet } from "@/context/WalletContext";
import { getSellerProfile, registerSeller, updateSellerProfile } from "@/lib/stellar";

export default function ProfileSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    contact: ""
  });
  const { publicKey, walletType, xlmBalance, usdcBalance, isConnected } = useWallet();

  // Derive initials from public key for avatar
  const initials = publicKey ? publicKey.slice(0, 2).toUpperCase() : "??";

  useEffect(() => {
    if (!publicKey) return;
    
    const checkProfile = async () => {
      try {
        const profile = await getSellerProfile(publicKey);
        if (profile && profile.businessName) {
          setFormData({
            name: profile.businessName,
            description: "", // In a real app we'd load this from metadata_uri
            category: "", // And this
            contact: "" // And this
          });
          setIsRegistered(true);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };
    
    checkProfile();
  }, [publicKey]);

  const handleSave = async () => {
    if (!publicKey) return;
    setLoading(true);
    
    try {
      if (!isRegistered) {
        // First time - register seller
        await registerSeller(
          publicKey,
          formData.name,
          formData.description,
          formData.category,
          formData.contact
        );
        setIsRegistered(true);
        toast.success("Profile created on blockchain!");
      } else {
        // Update existing profile
        await updateSellerProfile(
          publicKey,
          formData
        );
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to save profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 bg-slate-50 pb-20 font-sans">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 lg:px-10 h-20 flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900">Merchant Settings</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Manage your public presence and payouts</p>
        </div>
        <GradientButton
          className="rounded-xl px-6 py-3 text-sm font-bold flex items-center gap-2"
          onClick={handleSave}
          disabled={loading || !isConnected}
        >
          {loading ? (
            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save Changes
        </GradientButton>
      </header>

      <main className="mx-auto max-w-4xl px-6 lg:px-10 py-10">
        {!isConnected ? (
          <div className="py-24 flex flex-col items-center text-center space-y-4">
            <Wallet className="size-12 text-slate-200" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Wallet Not Connected</h2>
            <p className="text-sm font-bold text-slate-400 max-w-xs mx-auto uppercase tracking-widest">
              Connect your Stellar wallet to manage your merchant profile.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="public-profile" className="space-y-8">
            <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl h-14">
              <TabsTrigger
                value="public-profile"
                className="rounded-xl px-8 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                Public Profile
              </TabsTrigger>
              <TabsTrigger
                value="payouts"
                className="rounded-xl px-8 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                Payout Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="public-profile" className="space-y-6">
              <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Globe className="size-5 text-[#0b50da]" />
                    Brand Identity
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-bold">
                    This information will be visible to all buyers on your public profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-center gap-8">
                    <div className="size-24 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                      {initials}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid gap-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Merchant Name</Label>
                        <Input 
                          placeholder="Your store name..." 
                          className="rounded-xl" 
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</Label>
                        <Input 
                          placeholder="e.g. Electronics, Handicrafts..." 
                          className="rounded-xl" 
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact / Platform</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 size-4 text-slate-400" />
                        <Input 
                          placeholder="e.g. @MyStore" 
                          className="rounded-xl pl-10" 
                          value={formData.contact}
                          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Member Since</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 size-4 text-slate-400" />
                        <Input
                          value={new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                          disabled
                          className="rounded-xl pl-10 bg-slate-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Biography</Label>
                    <Textarea
                      placeholder="Tell buyers about yourself and what you sell..."
                      className="rounded-2xl min-h-[120px]"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <p className="text-[10px] font-bold text-slate-400">Keep it short and impactful for mobile buyers. (Max 200 chars)</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden bg-slate-50/50">
                <CardContent className="p-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-slate-300 text-white flex items-center justify-center shadow-lg">
                      <ShieldCheck className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Verified Seller Status</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Not yet verified</p>
                    </div>
                  </div>
                  <GradientButton variant="variant" className="rounded-xl text-xs font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-700 min-w-fit shadow-none hover:bg-slate-50">
                    Get Verified
                  </GradientButton>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payouts" className="space-y-6">
              <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Wallet className="size-5 text-emerald-500" />
                    Stellar Payout Rails
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-bold">
                    Configure how you receive your finalized deal funds.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">

                  {/* Connected Wallet Info */}
                  <div className="p-6 rounded-[1.5rem] bg-slate-900 text-white space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        Connected Stellar Wallet ({walletType})
                      </span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-1">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Public Key</Label>
                        <p className="text-xs font-mono font-bold break-all">{publicKey}</p>
                      </div>
                      <div className="grid gap-1 text-right">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Balances</Label>
                        <p className="text-sm font-bold">{parseFloat(usdcBalance).toFixed(2)} USDC</p>
                        <p className="text-xs font-bold text-slate-400">{parseFloat(xlmBalance).toFixed(4)} XLM</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preferred Currency</Label>
                      <select className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all">
                        <option>USDC (Stablecoin)</option>
                        <option>XLM (Stellar Lumen)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Stellar Testnet Notice</h4>
                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">
                      Real bank transfers are disabled in the Testnet Sandbox. All funds are testnet-only and have no real value.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
