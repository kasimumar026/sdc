"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Hash,
  Headset,
  History,
  LayoutDashboard,
  Plus,
  PlusIcon,
  User,
  Wifi,
  WifiIcon,
} from "lucide-react";
import DashSlide from "@/components/DashSlide";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type UserProfile = {
  user: any;
  wallet?: {
    _id?: string;
    balance?: number;
    ledgerBalance?: number;
    currency?: string;
    isLocked?: boolean;
  } | null;
};

function DashClient() {
  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [accountLoading, setAccountLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState<string>("");

  const router: any = useRouter();

  const getWelcomeMessage = async () => {
    try {
      const res = await fetch("/api/admin/welcome-message");
      const data = await res.json();
      if (res.ok) {
        setWelcomeMessage(data.message);
      } else {
        console.error("Error fetching welcome message:", data.message);
        return "No welcome message set";
      }
    } catch (error) {
      console.error("Error fetching welcome message:", error);
      return "No welcome message set";
    }
  };

  useEffect(() => {
    getWelcomeMessage();
  }, []);



  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(
          json?.error || json?.message || "Failed to fetch profile",
        );
      }
      const json: UserProfile = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || "An error occurred");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fundWallet = async (amount = 1000) => {
    try {
      setLoading(true);
      const res = await fetch("/api/wallet/fund", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error("Failed to fund wallet");
      await fetchProfile();
    } catch (err: any) {
      setError(err?.message || "Could not fund wallet");
      setLoading(false);
    }
  };

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

  const [showBalance, setShowBalance] = useState<boolean>(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem("sdc_show_balance");
      if (v !== null) setShowBalance(v === "1");
    } catch (e) {
      /* ignore */
    }
  }, []);

  const toggleShowBalance = () => {
    setShowBalance((s) => {
      const next = !s;
      try {
        localStorage.setItem("sdc_show_balance", next ? "1" : "0");
      } catch (e) {}
      return next;
    });
  };

  const getAccountNumber = async () => {
    try {
      setAccountLoading(true);
      const res = await fetch("/api/account_number", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data?.user?.email,
          firstName: data?.user?.name.split(" ")[0] || "",
          lastName: data?.user?.name.split(" ")[1] || "",
          phone: data?.user?.phone || "",
        }),
      });
      if (!res.ok) throw new Error("Failed to generate account number");
      const json = await res.json();
      alert(`Account number generated successfully: ${json.account_number}`);
    } catch (err: any) {
      setError(err?.message || "Could not generate account number");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:mb-10 sm:p-6">
          <header className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/dashboard/account"
              aria-label="Open account settings"
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-primary shadow-sm transition hover:bg-primary/5"
            >
              <User className="size-5" />
            </Link>

            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">
                Good{" "}
                {new Date().getHours() < 12
                  ? "morning"
                  : new Date().getHours() < 18
                    ? "afternoon"
                    : "evening"}
                ,
              </p>
              <h1 className="truncate text-xl font-bold capitalize tracking-tight text-foreground sm:text-2xl">
                {data?.user?.name.split(" ")[0] || "Welcome"}
              </h1>
            </div>

            <Link
              href="/dashboard/transactions"
              aria-label="View transactions"
              title="Transactions"
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-primary transition hover:bg-primary/5"
            >
              <History className="size-5" />
            </Link>
          </header>

          <div className="relative isolate mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-[#12386b] to-[#285c9b] p-5 text-white sm:mt-6 sm:p-8 lg:p-9">
            <div className="absolute -right-20 -top-28 -z-10 size-80 rounded-full border border-white/10" />
            <div className="absolute -right-5 -top-16 -z-10 size-56 rounded-full border border-white/10" />
            <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-100/80">
                  <span>Total balance</span>
                  <button
                    aria-label={showBalance ? "Hide balance" : "Show balance"}
                    onClick={toggleShowBalance}
                    className="rounded-lg p-1.5 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    title={showBalance ? "Hide balance" : "Show balance"}
                  >
                    {showBalance ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </button>
                </div>

                <div className="mt-2 break-words text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {loading ? (
                    <span className="inline-block h-10 w-36 animate-pulse rounded-lg bg-white/15" />
                  ) : data?.wallet?.balance != null ? (
                    showBalance ? (
                      formatCurrency(data.wallet.balance)
                    ) : (
                      <span className="tracking-[0.22em]">••••••</span>
                    )
                  ) : (
                    "—"
                  )}
                </div>
                <p className="mt-2 text-xs text-blue-100/65">Available in your wallet</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/fund"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-primary shadow-sm transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                >
                  <PlusIcon className="size-4" />
                  Fund wallet
                </Link>

                <Link
                  href="#"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <PlusIcon className="size-4" />
                  Gift
                </Link>
              </div>
            </div>
          </div>
        </section>

      {/* rest of dashboard cards */}
      {/* Quick Actions grid (icons in primary-colored rounded squares with labels beneath) */}
      <section className="mt-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex items-end justify-between px-1 sm:mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Get things done
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground">
                Quick actions
              </h3>
            </div>
            {/* <Link href="/dashboard" className="text-sm text-muted-foreground">
              See all
            </Link> */}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              { title: "Data", key: "datap" },
              { title: "Airtime", key: "airtime" },
              // { title: "Airtime 2 Cash", key: "airtime2cash" },
              // { title: "Electricity", key: "electricity" },
              { title: "Cable TV", key: "cable" },
              { title: "More", key: "more" },
              // { title: "Bulk SMS", key: "bulksms" },
              // { title: "Contacts", key: "contact" },
              // { title: "USSD", key: "ussd" },
            ].map((s) => (
              <Link key={s.key} href={`/dashboard/${s.key}`} className="group">
                <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-border bg-card px-3 py-5 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md sm:min-h-40">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={s.title}
                    className="flex size-12 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-primary/10 sm:size-14"
                  >
                    {/* Icons use currentColor so they inherit the white color */}
                    {s.key === "datap" && (
                      <Wifi className="w-6 h-6 text-primary-800" />
                    )}

                    {s.key === "airtime" && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-6 h-6 text-primary-800"
                      >
                        <path
                          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 3.08 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72c.12 1.01.37 2 .74 2.94a2 2 0 0 1-.45 2.11L9 10a12 12 0 0 0 6 6l1.22-1.22a2 2 0 0 1 2.11-.45c.94.37 1.93.62 2.94.74A2 2 0 0 1 22 16.92z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}

                    {s.key === "airtime2cash" && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-6 h-6 text-primary-800"
                      >
                        <path
                          d="M12 8v8"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M8 12h8"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}

                    {s.key === "electricity" && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-6 h-6 text-primary-800"
                      >
                        <path
                          d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}

                    {s.key === "cable" && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-6 h-6 text-primary-800"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="12"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                        <rect
                          x="7"
                          y="9"
                          width="6"
                          height="4"
                          rx="1"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                      </svg>
                    )}

                    {s.key === "bulksms" && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-6 h-6 text-primary-800"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="14"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                        <path
                          d="M3 8l9 6 9-6"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}

                    {s.key === "more" && (
                      <LayoutDashboard className="w-6 h-6 text-primary-800" />
                    )}

                    {s.key === "contact" && (
                      <Headset className="w-6 h-6 text-primary-800" />
                    )}

                    {s.key === "ussd" && (
                      <Hash className="w-6 h-6 text-primary-800" />
                    )}
                  </div>

                  <div className="mt-3 text-sm font-semibold text-foreground">
                    {s.title}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-6xl sm:mt-10">
        {/* <DashSlide /> */}
        <img
          src="/3.png"
          alt="Ad Image"
          className="mx-auto w-full rounded-3xl border border-border object-cover shadow-sm"
        />
      </div>

      {/* dialog */}

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
      <DialogContent className="overflow-hidden rounded-3xl border-border p-0 shadow-xl sm:max-w-md">
         

          <div className="bg-gradient-to-br from-slate-950 via-[#12386b] to-[#285c9b] px-6 py-7 text-center text-white">
            <img src="/white.png" className="mx-auto h-12 object-contain" alt="" />
            <DialogHeader className="mt-4 space-y-2 text-center">
              <DialogTitle className="text-xl font-bold text-white">Welcome to SDC Smart Data</DialogTitle>
              <DialogDescription className="text-sm leading-6 text-blue-100/80">
                {welcomeMessage || "We are glad to have you here."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <DialogFooter className="p-6 pt-5">
              <Button
                className="h-11 w-full rounded-xl"
                onClick={() => setShowSuccessModal(false)}
              >
                Okay Thanks
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* end dialog */}
      </div>
    </main>
  );
}

export default DashClient;
