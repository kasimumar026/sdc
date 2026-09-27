"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ApiClient from "@/lib/API";
import React from "react";
import { toast } from "react-toastify";

function ForgotPin() {
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [pin, setPin] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate an API call
    const request = await ApiClient.post("get-my-pin", { password })
      .then((res) => {
        console.log(res.data);
        setPin(res.data.pin);
        toast.success("Pin retrieved successfully");
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        toast.error(
          err?.response?.data?.error || err?.message || "Failed to get pin",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="p-4">
      <h1 className="font-semibold text-2xl text-primary-700 mb-4">Forgot Pin</h1>

      <form onSubmit={handleSubmit} className="max-w-md">
        {/* password */}
        <div className="mt-4">
          <label
            htmlFor="password"
            className="block text-sm mb-1 font-medium text-gray-700"
          >
            New Pin
          </label>
          <Input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new pin"
            autoComplete="new-password"
            required
          />
          {/* submit btn */}
          <Button type="submit" className="mt-3 w-full" disabled={loading}>
            {loading ? "Loading..." : "View My Pin"}
          </Button>
        </div>
      </form>

      {pin && (
        <div className="mt-4 bg-primary-50 py-5 border border-dotted border-primary-800 rounded-md">
          <p className="text-lg font-semibold text-center text-gray-700">
            Your Pin: {pin}
          </p>
        </div>
      )}

      {/* back */}
      <div className="mt-4">
        <Button
          className="w-full"
          variant="outline"
          onClick={() => {
            window.history.back();
          }}
        >
          Back
        </Button>
      </div>
    </div>
  );
}

export default ForgotPin;
