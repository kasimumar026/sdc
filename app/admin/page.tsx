"use client";

import React, { useEffect, useState } from "react";
import ApiClient from "@/lib/API";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Users,
  FileText,
  RefreshCw,
  BarChart2,
  Smartphone,
  Database,
  DollarSign,
  WifiIcon,
  GitGraph,
  Waves,
  Inbox,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  isBlocked?: boolean;
};
type Tx = {
  _id: string;
  userId: string;
  type: string;
  amount: number;
  status: string;
  createdAt?: string;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [data, setData]: any = useState({});
  const [txs, setTxs] = useState<Tx[]>([]);
  const [transactions, setTransactions] = useState({});

  const router = useRouter();

  const LogOut = async () => {
    // log out
    const req = await ApiClient.post("logout");
    // redirect to /
    router.push("/");
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);

    getBilalsadaBalance();

    try {
      const req: any = ApiClient.get("admin")
        .then((d) => {
          setLoading(false);
          setData(d.data);
        })
        .catch((e) => {
          setLoading(false);
          setError(e.message || "Failed to fetch admin data");
        });
    } catch (error: any) {
      setError(error);
    }
  };

  const getBilalsadaBalance = async () => {
    try {
      const res: any = await ApiClient.get("bilalsadasub/token").then((d) => {
        setData((prev: any) => ({ ...prev, bilalsadaBalance: d.data.balance }));
      });
    } catch (err: any) {
      console.error("Failed to fetch Bilalsada balance:", err);
    }
  };

  const txIcon = (type: string) => {
    switch ((type || "").toLowerCase()) {
      case "airtime":
        return <Smartphone className="w-4 h-4 text-white" />;
      case "data":
        return <Database className="w-4 h-4 text-white" />;
      case "fund":
      case "wallet_fund":
      case "topup":
        return <DollarSign className="w-4 h-4 text-white" />;
      default:
        return <DollarSign className="w-4 h-4 text-white" />;
    }
  };

  useEffect(() => {
    fetchAll();
    getBilalsadaBalance();
  }, []);
  const formatNumber = (val?: number | string) => {
    if (val === undefined || val === null) return "—";
    const n = typeof val === "number" ? val : Number(val);
    if (Number.isNaN(n)) return String(val);
    return new Intl.NumberFormat("en-NG").format(n);
  };

  return (
    <main className="p-6">
      <div className="max-w-6xl mx-auto ">
        <div className="flex flex-col items-start gap-4 justify-between mb-6">
          <header className="flex justify-between items-center w-full">
            <img src="/white.png" className="w-10" alt="" />

            <Button onClick={() => LogOut()} className="bg-red-700">
              Log Out
            </Button>
          </header>
          <div>
            <h1 className="text-lg text-primary font-bold">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">
              Overview of users, transactions and platform balances.
            </p>
          </div>
        </div>
        <div className=" mb-4 grid grid-cols-2 gap-3">
          <Link href="/dashboard">
            <div className="relative bg-primary-50  border-b-2 overflow-hidden border-primary-700 shadow-sm rounded-lg  p-6">
              <BarChart2 className="w-7 h-7 text-primary-700" />

              <h1 className="text-sm font-bold text-primary-700 my-2">
                Dashboard
              </h1>

              <svg
                className="absolute -right-12 bottom-12 -mb-8 -mr-8 w-48 h-48 opacity-10"
                viewBox="0 0 70 70"
                fill="none"
              >
                <circle cx="30" cy="30" r="30" fill="#00FF00" />
              </svg>
            </div>
          </Link>

          <Link href="/admin/data-p">
            <div className="relative bg-blue-50  border-b-2 overflow-hidden border-blue-700 shadow-sm rounded-lg  p-6">
              <WifiIcon className="w-7 h-7 text-blue-700" />

              <h1 className="text-sm font-bold text-blue-700 my-2">
                Data Plans
              </h1>

              <svg
                className="absolute -right-12 bottom-12 -mb-8 -mr-8 w-48 h-48 opacity-10"
                viewBox="0 0 70 70"
                fill="none"
              >
                <circle cx="30" cy="30" r="30" fill="#0000FF" />
              </svg>
            </div>
          </Link>

          {/* users */}
          <Link href="/admin/users">
            <div className="relative bg-yellow-50  border-b-2 overflow-hidden border-yellow-700 shadow-sm rounded-lg  p-6">
              <Users className="w-7 h-7 text-yellow-700" />

              <h1 className="text-sm font-bold text-yellow-700 my-2">Users</h1>

              <svg
                className="absolute -right-12 bottom-12 -mb-8 -mr-8 w-48 h-48 opacity-10"
                viewBox="0 0 70 70"
                fill="none"
              >
                <circle cx="30" cy="30" r="30" fill="#0000FF" />
              </svg>
            </div>
          </Link>

          {/* end users */}

          {/* Analytics */}
          <Link href="#">
            <div className="relative bg-gray-50  border-b-2 overflow-hidden border-gray-700 shadow-sm rounded-lg  p-6">
              <GitGraph className="w-7 h-7 text-gray-700" />

              <h1 className="text-sm font-bold text-gray-700 my-2">
                Analytics
              </h1>

              <svg
                className="absolute -right-12 bottom-12 -mb-8 -mr-8 w-48 h-48 opacity-10"
                viewBox="0 0 70 70"
                fill="none"
              >
                <circle cx="30" cy="30" r="30" fill="#0000FF" />
              </svg>
            </div>
          </Link>

          {/* end Analytics */}

          {/* transactions */}
          <Link href="/admin/transactions">
            <div className="relative bg-purple-50  border-b-2 overflow-hidden border-purple-700 shadow-sm rounded-lg  p-6">
              <DollarSign className="w-7 h-7 text-purple-700" />

              <h1 className="text-sm font-bold text-purple-700 my-2">
                Transactions
              </h1>

              <svg
                className="absolute -right-12 bottom-12 -mb-8 -mr-8 w-48 h-48 opacity-10"
                viewBox="0 0 70 70"
                fill="none"
              >
                <circle cx="30" cy="30" r="30" fill="#0000FF" />
              </svg>
            </div>
          </Link>

          {/* end transactions */}

          {/* Providers */}
          <Link href="/admin/providers">
            <div className="relative bg-primary-50  border-b-2 overflow-hidden border-primary-700 shadow-sm rounded-lg  p-6">
              <FileText className="w-7 h-7 text-primary-700" />

              <h1 className="text-sm font-bold text-primary-700 my-2">
                Providers
              </h1>

              <svg
                className="absolute -right-12 bottom-12 -mb-8 -mr-8 w-48 h-48 opacity-10"
                viewBox="0 0 70 70"
                fill="none"
              >
                <circle cx="30" cy="30" r="30" fill="#0000FF" />
              </svg>
            </div>
          </Link>
          {/* end Providers */}
          {/* transactions */}
          <Link href="/admin/welcome-message">
            <div className="relative bg-purple-50  border-b-2 overflow-hidden border-slate-700 shadow-sm rounded-lg  p-6">
              <Inbox className="w-7 h-7 text-slate-700" />

              <h1 className="text-sm font-bold text-slate-700 my-2">
                Welcome Message
              </h1>

              <svg
                className="absolute -right-12 bottom-12 -mb-8 -mr-8 w-48 h-48 opacity-10"
                viewBox="0 0 70 70"
                fill="none"
              >
                <circle cx="30" cy="30" r="30" fill="#0000FF" />
              </svg>
            </div>
          </Link>

          {/* end transactions */}
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-6 bg-slate-100 rounded w-1/3 animate-pulse" />
            <div className="h-6 bg-slate-100 rounded w-1/4 animate-pulse" />
          </div>
        ) : error ? (
          <div className="text-rose-600 mb-4">{error}</div>
        ) : (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-card p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Total Users</div>
                    <div className="text-2xl font-bold">{data?.totalUsers}</div>
                  </div>
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>

              <div className="bg-card p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">
                      Total Transactions
                    </div>
                    <div className="text-2xl font-bold">
                      {data?.totalTransactions}
                    </div>
                    {/*
                    <div className="text-xs text-slate-400">
                      {totalSuccess} success · {totalFailed} failed
                    </div> */}
                  </div>
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              </div>

              <div className="bg-card p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">
                      Bilalsada Balance
                    </div>
                    <div className="text-2xl font-bold">
                      ₦{formatNumber(data?.bilalsadaBalance || 0)}
                    </div>
                    <div className="text-xs text-slate-400">Platform float</div>
                  </div>
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
              </div>

              <div className="bg-card p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">
                      Users' Wallets Total
                    </div>
                    <div className="text-2xl font-bold">
                      ₦{formatNumber(data?.walletsTotal || 0)}
                    </div>
                    <div className="text-xs text-slate-400">
                      Sum of user wallet balances
                    </div>
                  </div>
                  <BarChart2 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6"></section>
          </>
        )}
      </div>
    </main>
  );
}
