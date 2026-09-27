"use client";

import React, { useEffect, useState } from "react";
import ApiClient from "@/lib/API";
import { Button } from "@/components/ui/button";
import { CreditCard, Mail, Phone, User, CheckCircle, Lock, Hash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ApiClient.get("me");
        setData(res.data || null);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.error || err?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const formatCurrency = (val?: number) => {
    if (typeof val !== "number") return "—";
    try {
      return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(val);
    } catch (e) {
      return String(val);
    }
  };

  const router = useRouter();


  const LogOut = async () =>{
    // log out
    const req = await ApiClient.post("logout")
    // redirect to /
    router.push("/")
    
  }

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Account</h1>
            <p className="hidden md:flex text-sm text-slate-500">Manage your profile, security, and wallet.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/" >
              <Button variant="ghost">Back</Button>
            </Link>
              <Button onClick={()=>LogOut()} className="bg-red-700">Log Out</Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-6 bg-slate-100 rounded w-1/4 animate-pulse" />
            <div className="h-6 bg-slate-100 rounded w-1/3 animate-pulse" />
          </div>
        ) : error ? (
          <div className="text-rose-600">{error}</div>
        ) : !data ? (
          <div className="p-6 bg-card rounded">No profile data</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: profile card */}
            <div className="bg-card p-6 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white">{(data.user?.name || "?").split(" ")[0]?.[0]?.toUpperCase() || "U"}</div>
                <div>
                  <div className="text-lg font-semibold">{data.user?.name || "Unnamed"}</div>
                  <div className="text-sm text-slate-500">{data.user?.role || "user"}</div>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-slate-500 text-xs">Email</div>
                    <div className="font-medium">{data.user?.email || "—"} {data.user?.isEmailVerified && <span className="text-emerald-600 ml-2 flex items-center gap-1 text-xs"><CheckCircle className="w-3 h-3"/> Verified</span>}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-slate-500 text-xs">Phone</div>
                    <div className="font-medium">{data.user?.phone || "—"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Hash className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-slate-500 text-xs">User code</div>
                    <div className="font-medium">{data.user?.code || "—"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-slate-500 text-xs">Account status</div>
                    <div className="font-medium">{data.user?.isBlocked ? "Blocked" : "Active"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle: wallet card (spans 2 columns on md) */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-gradient-to-r from-primary to-primary-800 text-white p-6 rounded-lg shadow-lg relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm opacity-90">Total Balance</div>
                    <div className="mt-2 text-3xl font-extrabold">{formatCurrency(data.wallet?.balance)}</div>
                    <div className="text-sm opacity-80 mt-1">Available balance in your wallet</div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs opacity-90">Currency</div>
                    <div className="font-medium">{data.wallet?.currency || "NGN"}</div>
                    {/* <div className="text-xs opacity-80">Ledger: {formatCurrency(data.wallet?.ledgerBalance)}</div> */}
                  </div>
                </div>

                <svg className="absolute right-0 bottom-0 -mb-8 -mr-8 w-48 h-48 opacity-10" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="50" fill="white"/></svg>
              </div>

            
            </div>
          </div>
        )}
      </div>

        <div className=" py-4 px-3 mt-5">
          <Link href="/dashboard/account/forgot-pin">
            <Button variant="outline" className="w-full md:w-auto">
              <Lock className="mr-2 h-4 w-4" />
              Forgot Pin
            </Button>
          </Link>
        </div>
    </main>
  );
}
