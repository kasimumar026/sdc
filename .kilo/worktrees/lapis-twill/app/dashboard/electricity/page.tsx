"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const discos = [
  { id: "ikeja", label: "Ikeja Electric" },
  { id: "eko", label: "Eko Electric" },
  { id: "jos", label: "Jos Electricity" },
  { id: "ibadan", label: "Ibadan Electric" },
];// perfect

export default function Electricity() {
  const [disco, setDisco] = useState<string>(discos[0].id);
  const [meterType, setMeterType] = useState<string>("prepaid");
  const [meterNumber, setMeterNumber] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is UI-only for now — integration with API can be added later
    console.log({ disco, meterType, meterNumber, pin, amount });
  };

  return (
    <main className="p-6">
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-card p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Pay Electricity</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 mb-2 block">Disco Name</label>
              <select
                value={disco}
                onChange={(e) => setDisco(e.target.value)}
                className={cn(
                  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
                )}
              >
                {discos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-2 block">Meter Type</label>
              <select
                value={meterType}
                onChange={(e) => setMeterType(e.target.value)}
                className={cn(
                  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
                )}
              >
                <option value="prepaid">Prepaid</option>
                <option value="postpaid">Postpaid</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-2 block">Meter Number</label>
              <Input
                placeholder="Enter meter number"
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-2 block">Transaction Pin</label>
              <Input
                placeholder="4-digit transaction PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                type="password"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-2 block">Amount</label>
              <Input
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="numeric"
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