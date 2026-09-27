"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Airtime2CashPage() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(500);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await new Promise((r) => setTimeout(r, 900));
      setSuccess(`Converted airtime of ${amount} to cash for ${phone}`);
    } catch (err: any) {
      setError(err?.message || "Failed to process conversion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Airtime 2 Cash</h1>
        <p className="text-sm text-slate-600">Convert airtime into wallet balance or bank transfers.</p>
      </div>

      <form onSubmit={submit} className="space-y-4 bg-card p-6 rounded-lg shadow">
        <div>
          <label className="text-sm block mb-1">Sender Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0801xxxxxxx" className="w-full rounded border px-3 py-2" />
        </div>

        <div>
          <label className="text-sm block mb-1">Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full rounded border px-3 py-2" />
        </div>

        {error && <div className="text-destructive text-sm">{error}</div>}
        {success && <div className="text-foreground text-sm">{success}</div>}

        <div className="flex items-center gap-3">
          <Button type="submit" className="bg-primary text-primary-foreground" disabled={loading}>{loading ? "Processing..." : "Convert"}</Button>
          <Link href="/dashboard"><Button variant="ghost">Back</Button></Link>
        </div>
      </form>
    </main>
  );
}
