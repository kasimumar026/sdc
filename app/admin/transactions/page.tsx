"use client";
import ApiClient from "@/lib/API";
import { Database, DollarSign, Smartphone } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Tx = {
  _id: string;
  userId: string;
  type: string;
  amount: number;
  status: string;
  createdAt?: string;
};

type User = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  isBlocked?: boolean;
};

function Transactions() {
  const [loading, setLoading] = useState(true);
  const [data, setData]: any = useState({});

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
  }, []);

  const formatNumber = (val?: number | string) => {
    if (val === undefined || val === null) return "—";
    const n = typeof val === "number" ? val : Number(val);
    if (Number.isNaN(n)) return String(val);
    return new Intl.NumberFormat("en-NG").format(n);
  };

  const fetchAll = async () => {
    setLoading(true);

    try {
      const req: any = ApiClient.get("admin")
        .then((d) => {
          setLoading(false);
          setData(d.data);
          console.log(d.data);
        })
        .catch((e) => {
          setLoading(false);
        });
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between sticky top-0 bg-white z-10 py-3">
        <h1 className="text-xl font-bold ">Transactions</h1>
        <Link
          href="/admin"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back
        </Link>
      </div>
      <div className="bg-card p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Recent Transactions</h3>
        {data?.transactions?.length === 0 ? (
          <div className="text-sm text-slate-500">
            No transactions available
          </div>
        ) : (
          <ul className="space-y-2">
            {data?.transactions?.map((t: any) => (
              <Link href={`/dashboard/transactions/${t._id}`} className="block">
                <li
                  key={t._id}
                  className="p-2 rounded hover:bg-muted bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full ${t.status === "success" ? "bg-emerald-500" : t.status === "pending" ? "bg-amber-600" : "bg-rose-500"} flex items-center justify-center`}
                      >
                        {txIcon(t.type)}
                      </div>

                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {t.type?.toUpperCase() || "TX"}
                        </div>
                        <div className="text-xs text-slate-500 capitalize truncate">
                          {t.userId?.name} ·
                          <p>
                            {t.createdAt
                              ? new Date(t.createdAt).toLocaleString()
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="font-normal">
                        N{formatNumber(t.amount)}
                      </div>
                      <div
                        className={`text-xs uppercase ${t.status === "success" ? "text-emerald-600" : t.status === "pending" ? "text-amber-500" : "text-rose-600"}`}
                      >
                        {t.status}
                      </div>
                    </div>
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Transactions;
