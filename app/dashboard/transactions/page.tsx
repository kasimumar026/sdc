"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, Smartphone, Database, DollarSign } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Tx = {
  _id: string;
  userId: string;
  type: string;
  amount: number;
  txRef: string;
  status: string;
  providerResponse?: any;
  createdAt?: string;
};

export default function TransactionsPage() {
  const [txs, setTxs] = useState<Tx[] | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "success" | "failed"
  >("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const fetchTxs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/transactions/user", {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(
          json?.message || json?.error || "Failed to fetch transactions",
        );
      }
      const json = await res.json();
      setTxs(json.transactions || []);
    } catch (err: any) {
      setError(err?.message || "Error fetching transactions");
      setTxs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
  }, []);

  const formatCurrency = (val?: number) => {
    if (typeof val !== "number") return "—";
    try {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(val);
    } catch (e) {
      return String(val);
    }
  };

  const iconFor = (type: string) => {
    switch (type) {
      case "fund":
        return <CreditCard className="w-5 h-5" />;
      case "other":
        return <CreditCard className="w-5 h-5" />;
      case "airtime":
        return <Smartphone className="w-5 h-5" />;
      case "data":
        return <Database className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const statusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "success") return "text-emerald-600";
    if (s === "pending") return "text-amber-500";
    return "text-rose-600"; // failed/other
  };

  return (
    <main className="p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Transactions</h1>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                aria-pressed={filterStatus === "all"}
                className={`text-sm px-3 py-1 rounded ${filterStatus === "all" ? "bg-primary text-white" : "bg-card text-card-foreground"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("success")}
                aria-pressed={filterStatus === "success"}
                className={`text-sm px-3 py-1 rounded ${filterStatus === "success" ? "bg-primary text-white" : "bg-card text-card-foreground"}`}
              >
                Successful
              </button>
              <button
                onClick={() => setFilterStatus("failed")}
                aria-pressed={filterStatus === "failed"}
                className={`text-sm px-3 py-1 rounded ${filterStatus === "failed" ? "bg-primary text-white" : "bg-card text-card-foreground"}`}
              >
                Failed
              </button>
            </div>
          </div>
          <div>
            <button
              onClick={() => router.back()}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80 transition-colors"
            >
              Go Back
            </button>
          </div>
          {/* <Link href="/dashboard/fund" className="text-sm text-primary underline">Add funds</Link> */}
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-6 bg-slate-200 rounded w-1/3 animate-pulse" />
            <div className="h-6 bg-slate-200 rounded w-1/2 animate-pulse" />
          </div>
        ) : error ? (
          <div className="text-rose-600">{error}</div>
        ) : txs && txs.length === 0 ? (
          <div className="p-6 bg-card rounded">No transactions yet.</div>
        ) : (
          <ul className="space-y-3">
            {txs
              ?.filter((t) => {
                if (filterStatus === "all") return true;
                if (filterStatus === "success")
                  return (t.status || "").toLowerCase() === "success";
                // failed
                return (t.status || "").toLowerCase() !== "success";
              })
              .map((t) => (
                <li key={t._id} className="p-0">
                  <Link
                    href={`/dashboard/transactions/${encodeURIComponent(t._id)}`}
                    className="p-4 bg-card rounded flex items-center justify-between hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {iconFor(t.type)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {t.type?.toUpperCase() || "TRANSACTION"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {t.createdAt
                            ? new Date(t.createdAt).toLocaleString()
                            : "—"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(t.amount)}
                      </div>
                      <div className={`text-xs ${statusColor(t.status)}`}>
                        {t.status}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </div>
    </main>
  );
}
