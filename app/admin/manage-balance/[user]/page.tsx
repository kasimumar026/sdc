"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";

function ManageBalance() {
  const { user } = useParams();
  const searchParams = useSearchParams();
  const walletBalance = searchParams.get("walletBalance");
  const name = searchParams.get("name");

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

  const MoneyChip = ({
    amount,
    type,
  }: {
    amount: number;
    type?: "add" | "subtract";
  }) => {
    return (
      // if type is subtract, make the button red, else make it primary
      <button
        onClick={() => onSelectAmount(amount)}
        className={`px-4 py-2 rounded-md text-xs m-1 transition ${
          type === "subtract"
            ? "bg-red-700 text-white hover:bg-red-800"
            : "bg-primary-700 text-white hover:bg-primary-800"
        }`}
      >
        {formatCurrency(amount)}
      </button>
    );
  };

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSelectAmount = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount("");
    setConfirmOpen(true);
  };

  const router = useRouter();

  const onConfirm = async () => {
    const amt = selectedAmount ?? Number(customAmount || 0);
    if (!amt) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/wallet/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user, amount: amt, reason: "admin_manual" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to update wallet");
      // show toast and navigate back
      toast.success("Balance updated successfully");
      router.back();
    } catch (e: any) {
      alert(e.message || String(e));
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="bg-primary-900">
      <main className="w-full md:w-1/2 h-screen bg-white p-4 mx-auto">
        <img src="/white.png" alt="logo" className="w-20 mx-auto" />
        <h1 className="text-2xl font-bold text-center text-primary mb-4">
          Update Balance
        </h1>
        <p className="text-sm text-slate-500 mb-2">
          Update the balance for{" "}
          <span className="font-semibold text-primary-700 capitalize">{name}</span>
          .
        </p>
        <p className="text-sm text-slate-500 mb-4">
          Current balance:{" "}
          <span className="font-semibold text-primary-700">
            {formatCurrency(Number(walletBalance))}
          </span>
        </p>

        <div className="mb-4 bg-primary-100 p-4 rounded-md">
          <h3>Add Money</h3>
          <div className="flex flex-wrap gap-1">
            <MoneyChip amount={400} type="add" />
            <MoneyChip amount={500} type="add" />
            <MoneyChip amount={1000} type="add" />
            <MoneyChip amount={2000} type="add" />
            <MoneyChip amount={5000} type="add" />
            <MoneyChip amount={10000} type="add" />
          </div>
        </div>

        <div className="mt-8 bg-red-50 p-4 rounded-md">
          <h3 className="font-semibold text-red-600">Subtract Money</h3>
          <div className="flex flex-wrap gap-1">
            <MoneyChip amount={-400} type="subtract" />
            <MoneyChip amount={-500} type="subtract" />
            <MoneyChip amount={-1000} type="subtract" />
            <MoneyChip amount={-2000} type="subtract" />
            <MoneyChip amount={-5000} type="subtract" />
            <MoneyChip amount={-10000} type="subtract" />
          </div>
        </div>

        <div className="bg-gray-100 px-4 py-8 shadow-sm mt-4">
          <h1>Custom Amount</h1>
          <div className="flex items-center gap-3">
            <Input
              className="px-4 py-2 bg-white"
              type="number"
              placeholder="Enter custom amount"
              value={customAmount}
              onChange={(e: any) => setCustomAmount(e.target.value)}
            />
            <button
              onClick={() => {
                if (!customAmount) return;
                setSelectedAmount(Number(customAmount));
                setConfirmOpen(true);
              }}
              className=" px-4 border-none py-2 bg-primary-700 text-white rounded-md hover:bg-primary-800 text-sm"
            >
              Update
            </button>
          </div>
        </div>

        {/* confirmation dialog */}
        <Dialog open={confirmOpen} onOpenChange={(open) => setConfirmOpen(open)}>
          <DialogContent>
            <DialogTitle>Confirm balance update</DialogTitle>
            <div className="py-4">
              <p>
                You are about to <strong>{(selectedAmount ?? Number(customAmount || 0)) < 0 ? 'subtract' : 'add'}</strong>{' '}
                <strong>{formatCurrency(Math.abs(selectedAmount ?? Number(customAmount || 0)))}</strong> to <strong>{name}</strong>.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={onConfirm} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

export default ManageBalance;
