"use client";

import React, { useEffect, useState } from "react";
import ApiClient from "@/lib/API";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Mail,
  Phone,
  User,
  CheckCircle,
  Lock,
  Hash,
  Smartphone,
  Database,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function AccountPage() {
  // get params
  const { account } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const fetchMe = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ApiClient.get("account/" + account);
        setData(res.data || null);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to load profile",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
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

  const router = useRouter();

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Account</h1>
            <p className="hidden md:flex text-sm text-slate-500">
              Manage your profile, security, and wallet.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/transactions" className="hidden md:flex">
              <Button variant="ghost">Transactions</Button>
            </Link>
            <Link href="/admin">
              <Button className="bg-red-700">Go Back</Button>
            </Link>
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
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white">
                  {(data.user?.name || "?").split(" ")[0]?.[0]?.toUpperCase() ||
                    "U"}
                </div>
                <div>
                  <div className="text-lg font-semibold capitalize">
                    {data.user?.name || "Unnamed"}
                  </div>
                  <div className="text-sm text-slate-500 uppercase">
                    {data.user?.role || "user"}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-slate-500 text-xs">Email</div>
                    <div className="font-medium">
                      {data.user?.email || "—"}{" "}
                      {data.user?.isEmailVerified && (
                        <span className="text-emerald-600 ml-2 flex items-center gap-1 text-xs">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
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
                    <div className="font-medium">
                      {data.user?.isBlocked ? "Blocked" : "Active"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle: wallet card (spans 2 columns on md) */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-gradient-to-r from-primary to-teal-800 text-white p-6 rounded-lg shadow-lg relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm opacity-90">Total Balance</div>
                    <div className="mt-2 text-3xl font-extrabold">
                      {formatCurrency(data.wallet?.balance)}
                    </div>
                    <div className="text-sm opacity-80 mt-1">
                      Available balance in your wallet
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs opacity-90">Currency</div>
                    <div className="font-medium">
                      {data.wallet?.currency || "NGN"}
                    </div>
                    <Button
                      className="z-[100]"
                      onClick={() => {
                        const params = new URLSearchParams({
                          walletBalance: data.wallet?.balance,
                          name: data.user?.name,
                        });
                        router.push(
                          `/admin/manage-balance/${account}?${params.toString()}`,
                        );
                      }}
                    >
                      Manage Balance
                    </Button>
                  </div>
                </div>

                <svg
                  className="absolute right-0 bottom-0 -mb-8 -mr-8 w-48 h-48 opacity-10"
                  viewBox="0 0 100 100"
                  fill="none"
                >
                  <circle cx="50" cy="50" r="50" fill="white" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* transactions   */}
      {data && (
        <div className="mt-10">
          <div className="bg-card p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Recent Transactions</h3>
            {data?.transactions?.length === 0 ? (
              <div className="text-sm text-slate-500">
                No transactions available
              </div>
            ) : (
              <ul className="space-y-2">
                {data?.transactions?.map((t: any) => (
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
                        <div className="font-normal">N{t.amount}</div>
                        <div
                          className={`text-xs uppercase ${t.status === "success" ? "text-emerald-600" : t.status === "pending" ? "text-amber-500" : "text-rose-600"}`}
                        >
                          {t.status}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* danger zone */}
      {data && (
        <div
          className="bg-red-100 mt-10 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Danger Zone! </strong>

          {/* delete user */}
          <span className="block sm:inline">
            Deleting this account is irreversible. Please proceed with caution.
          </span>

          <div className="mt-4">
            <Button
              variant="destructive"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete this account? This action cannot be undone.",
                  )
                ) {
                  ApiClient.delete("account/" + account)
                    .then(() => {
                      toast.success("Account deleted successfully");
                      router.push("/admin");
                    })
                    .catch((err) => {
                      console.error(err);
                      toast.error(
                        "Failed to delete account: " +
                          (err?.response?.data?.error ||
                            err?.message ||
                            "Unknown error"),
                      );
                    });
                }
              }}
            >
              Delete Account
            </Button>

            {/* block user */}
            <Button
              variant="outline"
              className="border border-primary text-white bg-primary hover:bg-primary/90 ml-4"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to block this user? This action can be undone later.",
                  )
                ) {
                  ApiClient.post("account/" + account + "/block")
                    .then(() => {
                      toast.success("User blocked successfully");
                      router.push("/admin");
                    })
                    .catch((err) => {
                      console.error(err);
                      toast.error(
                        "Failed to block user: " +
                          (err?.response?.data?.error ||
                            err?.message ||
                            "Unknown error"),
                      );
                    });
                }
              }}
            >
              Block User
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
