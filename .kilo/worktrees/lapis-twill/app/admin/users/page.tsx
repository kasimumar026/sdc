"use client";
import ApiClient from "@/lib/API";
import { Database, DollarSign, Smartphone, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

function Users() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [data, setData]: any = useState({});
  const [txs, setTxs] = useState<Tx[]>([]);
  const [transactions, setTransactions] = useState({});
  const [query, setQuery] = useState("");

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
    setError(null);

    // getBilalsadaBalance();

    try {
      const req: any = ApiClient.get("admin")
        .then((d) => {
          setLoading(false);
          setData(d.data);
          console.log(d.data);
        })
        .catch((e) => {
          setLoading(false);
          setError(e.message || "Failed to fetch admin data");
        });
    } catch (error: any) {
      setError(error);
    }
  };

  // computed filtered users for local search (search by name/email)
  const filteredUsers = (data?.users || []).filter((u: any) => {
    if (!query) return true;
    const name = ((u.name || "") + (u.phone || "")).toLowerCase();
    return name.includes(String(query).toLowerCase());
  });

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between sticky top-0 bg-white z-10 py-3">
        <h1 className="text-xl font-bold ">Users</h1>
        <Link
          href="/admin"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back
        </Link>
      </div>
      <div className="bg-card p-4 rounded-lg">
        {/* search */}
        <div className="mb-4 flex gap-2">
          <Input
            placeholder="Search a user..."
            value={query}
            onChange={(e: any) => setQuery(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <X />
          </Button>
        </div>
      
        {data?.users?.length === 0 ? (
          <div className="text-sm text-slate-500">No users available</div>
        ) : (
          <ul className="space-y-2">
            <div className="bg-card rounded-lg">
              <h3 className="font-semibold mb-3">Recent Users</h3>
              {data?.users?.length === 0 ? (
                <div className="text-sm text-slate-500">No users available</div>
              ) : (
                <ul className="space-y-2">
                  {filteredUsers.map((u: any) => (
                    <Link key={u._id} href={`/admin/account/${u._id}`} className="block">
                      <li className="flex items-center justify-between p-2 rounded hover:bg-muted bg-gray-50">
                        <div>
                          <div className="font-medium capitalize">{u.name || u.email}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                          <span className="text-pink-700">{u.phone || "—"}</span>
                        </div>
                      </li>
                    </Link>
                  ))}
                </ul>
              )}
            </div>
           
          </ul>
        )}
      </div>
    </div>
  );
}

export default Users;
