"use client";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import React from "react";

function DataSpecial() {
  const [data, setData]: any = React.useState(null);
  const [phone, setPhone] = React.useState("");
  const [pin, setPin] = React.useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // validate phone and pin
    if (!phone || !pin || !data) return;
    try {
      const payload = {
        plan: data === 1 ? "1GB for ₦400" : data === 2 ? "5GB for ₦1500" : null,
        phone,
        pin,
      };
      // make API call to buy data
      // await ApiClient.post("buy/data/special", payload);
    //   alert(`Data purchase successful: ${payload.plan} for ${payload.phone}`);
      // reset form
      setData(null);
      setPhone("");
      setPin("");
    } catch (error) {
      console.error(error);
      alert("Failed to purchase data. Please try again.");
    }
  }


  return (
    <div className="py-6 w-full md:w-2/3 mx-auto">
      <div className="mb-4 px-6">
        <h1 className="text-2xl font-bold">Buy Special Data</h1>
        <p className="text-sm text-slate-600">
          Enjoy Our Cheapest Special Data Plans
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 p-6 text-md">
        <div
          onClick={() => setData(1)}
          className={
            data === 1
              ? "p-4 bg-gradient-to-r from-primary-600 to-primary rounded h-24 text-white flex items-center justify-center text-center"
              : "p-4 bg-gradient-to-r from-slate-100 to-zinc-100 rounded h-24 text-primary flex items-center justify-center text-center"
          }
        >
          1GB for ₦400
        </div>

        <div
          onClick={() => setData(2)}
          className={
            data === 2
              ? "p-4 bg-gradient-to-r from-primary-600 to-primary rounded h-24 text-white flex items-center justify-center text-center"
              : "p-4 bg-gradient-to-r from-slate-100 to-zinc-100 rounded h-24 text-primary flex items-center justify-center text-center"
          }
        >
          5GB for ₦1500
        </div>
      </div>
      <p className="px-6 mb-6">
        Selected:{" "}
        {data === 1 ? "1GB for ₦400" : data === 2 ? "5GB for ₦1500" : "None"}
      </p>

      <form onSubmit={(e)=>handleSubmit(e)} className="px-6">
        <Field>
          <FieldLabel>Phone number</FieldLabel>
          <div>
            <Input
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0801xxxxxxx"
              className="w-full"
            />
          </div>
        </Field>
        <Field className="mt-5">
          <FieldLabel>PIN</FieldLabel>
          <div>
            <Input
              name="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter your PIN"
              className="w-full"
            />
          </div>
        </Field>

        <div className="flex items-center gap-3 mt-5">
          <button
            type="submit"
            className={`bg-primary text-white px-6 py-2 rounded-sm w-full hover:shadow-lg transition-all ${!data || !phone || !pin ? "opacity-60 pointer-events-none" : ""}`}
          >
            Buy Data
          </button>

          <Link href="/dashboard">
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default DataSpecial;
