"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const providers = [
  { id: "dstv", label: "DSTV" },
  { id: "gotv", label: "GOtv" },
  { id: "startimes", label: "Startimes" },
];

const plansMap: Record<string, { id: string; label: string }[]> = {
  dstv: [
    { id: "dstv-padi", label: "Padi" },
    { id: "dstv-yanga", label: "Yanga" },
    { id: "dstv-confam", label: "Confam" },
  ],
  gotv: [
    { id: "gotv-smallie", label: "Smallie" },
    { id: "gotv-jolli", label: "Jolli" },
    { id: "gotv-max", label: "Max" },
  ],
  startimes: [
    { id: "startimes-basic", label: "Basic" },
    { id: "startimes-classic", label: "Classic" },
    { id: "startimes-premier", label: "Premier" },
  ],
};

export default function Cables() {
  const [provider, setProvider] = useState<string>(providers[0].id);
  const [plan, setPlan] = useState<string>(plansMap[providers[0].id][0].id);
  const [iuc, setIuc] = useState<string>("");
  const [pin, setPin] = useState<string>("");

  useEffect(() => {
    // when provider changes, reset plan to first available
    const first = plansMap[provider] && plansMap[provider][0];
    if (first) setPlan(first.id);
  }, [provider]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ provider, plan, iuc, pin });
  };

  return (
    <main className="p-6">
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-card p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Buy Cable Subscription</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 mb-2 block">Cable Name</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className={cn(
                  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-11 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
                )}
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-2 block">Cable Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className={cn(
                  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-11 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
                )}
              >
                {(plansMap[provider] || []).map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-2 block">IUC Number</label>
              <Input
                placeholder="Enter IUC / Smartcard number"
                value={iuc}
                onChange={(e) => setIuc(e.target.value)}
                inputMode="numeric"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-2 block">Transaction Pin</label>
              <Input
                placeholder="Transaction PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                type="password"
                maxLength={6}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </div>
             <Link href="/dashboard">
              <Button variant="outline" type="submit" className="w-full">
                Cancel
              </Button>
            </Link>
          </form>
        </div>
      </div>
    </main>
  );
}