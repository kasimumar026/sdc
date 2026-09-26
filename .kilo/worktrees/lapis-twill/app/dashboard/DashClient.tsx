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
      const v = localStorage.getItem("afaruk_show_balance");
      if (v !== null) setShowBalance(v === "1");
    } catch (e) {
      /* ignore */
    }
  }, []);

  const toggleShowBalance = () => {
    setShowBalance((s) => {
      const next = !s;
      try {
        localStorage.setItem("afaruk_show_balance", next ? "1" : "0");
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
    <main className="px-3 py-5 bg-gray-50 min-h-screen">
      {/* Card */}
      <section className=" mx-auto relative overflow-hidden">
        <header className="rounded-2xl py-1 mb-4 px-2 flex items-center gap-4 ">
          <Link href="/dashboard/account">
            <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center">
              <User className="w-6 h-6 text-teal-800400" />
            </div>
          </Link>

          <div className="flex-1">
            <p>
              Good{" "}
              {new Date().getHours() < 12
                ? "Morning"
                : new Date().getHours() < 18
                  ? "Afternoon"
                  : "Evening"}
              ,
            </p>
            <h1 className="capitalize font-bold text-2xl">
              {data?.user?.name.split(" ")[0] || ""}
            </h1>
          </div>

          <Link
            href="/dashboard/transactions"
            className=" flex flex-col gap-1 items-center "
          >
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
              <History className="w-5 h-5 m-auto text-blue-700" />
            </div>
          </Link>
        </header>
        <div className="relative overflow-hidden rounded-2xl py-3 px-2 text-white shadow-xl bg-gradient-to-r from-primary to-teal-800">
          {/* // end bubbles */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col  gap-4">
              {/* logo */}

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm opacity-90">Total Balance</p>
                  <button
                    aria-label={showBalance ? "Hide balance" : "Show balance"}
                    onClick={toggleShowBalance}
                    className="p-1 rounded hover:bg-white/10 transition"
                    title={showBalance ? "Hide balance" : "Show balance"}
                  >
                    {showBalance ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="mt-2 text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
                  {loading ? (
                    <span className="inline-block w-32 h-8 bg-white/20 rounded animate-pulse" />
                  ) : data?.wallet?.balance != null ? (
                    showBalance ? (
                      formatCurrency(data.wallet.balance)
                    ) : (
                      <span className="tracking-widest">•••••</span>
                    )
                  ) : (
                    "—"
                  )}
                </div>
              </div>

              <div className="flex items-center justify-around mt-2 gap-3 ">
                {/* On mobile, show smaller pill button */}
                <Link href="/dashboard/fund">
                  <div className="w-44 h-12 rounded-sm bg-white flex items-center px-2">
                    <PlusIcon className="w-5 h-5  text-teal-800 mr-2" />
                    <p className="text-center text-md text-teal-800 font-semibold mt-1 ">
                      FUND WALLET
                    </p>
                  </div>
                </Link>

                <Link href="#">
                  <div className="w-24 h-12 rounded-sm flex items-center px-2 justify-center">
                    <PlusIcon className="w-5 h-5  text-teal-800 mr-2" />
                    <p className="text-center text-md text-white font-semibold mt-1 ">
                      GIFT
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* subtle decorative svg in corner (smaller on mobile) */}
            <svg
              className="absolute right-0 top-0 -mr-8 -mt-8 w-36 h-36 opacity-18 pointer-events-none"
              viewBox="0 0 100 100"
              fill="none"
              aria-hidden
            >
              <circle cx="50" cy="50" r="50" fill="rgba(255,255,255,0.16)" />
            </svg>
          </div>
        </div>
      </section>

      {/* rest of dashboard cards */}
      {/* Quick Actions grid (icons in primary-colored rounded squares with labels beneath) */}
      <section className="mt-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mt-10 mb-5 px-3 md:px-20">
            <h3 className="text-md font-semibold text-primary">
              Quick Actions
            </h3>
            {/* <Link href="/dashboard" className="text-sm text-muted-foreground">
              See all
            </Link> */}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-4">
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
                <div className="flex flex-col items-center text-center cursor-pointer">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={s.title}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-white to-teal-50 flex items-center justify-center text-teal-800 shadow-md transition-transform duration-200 group-hover:scale-105"
                  >
                    {/* Icons use currentColor so they inherit the white color */}
                    {s.key === "datap" && (
                      <Wifi className="w-6 h-6 text-teal-800" />
                    )}

                    {s.key === "airtime" && (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-6 h-6 text-teal-800"
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
                        className="w-6 h-6 text-teal-800"
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
                        className="w-6 h-6 text-teal-800"
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
                        className="w-6 h-6 text-teal-800"
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
                        className="w-6 h-6 text-teal-800"
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
                      <LayoutDashboard className="w-6 h-6 text-teal-800" />
                    )}

                    {s.key === "contact" && (
                      <Headset className="w-6 h-6 text-teal-800" />
                    )}

                    {s.key === "ussd" && (
                      <Hash className="w-6 h-6 text-teal-800" />
                    )}
                  </div>

                  <div className="text-xs md:text-sm font-semibold text-teal-800 mt-2">
                    {s.title}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-12">
        {/* <DashSlide /> */}
        <img
          src="/3.png"
          alt="Ad Image"
          className="w-full mx-auto rounded-2xl"
        />
      </div>

      {/* dialog */}

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
         

          <img src="/white.png" className="mx-auto h-12 my-2" alt="" />

          <div className="p-6 space-y-4 text-xs">
            <p>
             {welcomeMessage || "Welcome to Afaruk Data Sub. We are glad to have you here."}
              <br />
              <br />
             
            </p>

            <div className="pt-4  gap-3">
              <Button
                className="w-full"
                onClick={() => setShowSuccessModal(false)}
              >
                Okay Thanks
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* end dialog */}
    </main>
  );
}

export default DashClient;
