
"use client";

import React, { useState } from "react";
import { Form, Formik } from "formik";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { FieldGroup } from "@/components/ui/field";
import { dataValidationSchema } from "@/helpers/validations";
import ApiClient from "@/lib/API";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle2, Clock, Smartphone } from "lucide-react"; // lucide icons for header and input

type DataForm = {
  network: string;
  category: string;
  plan: number | string;
  pin: string;
};

// Map provider keys to background colors/styles mimicking data pAGE.png
const networkStyles: Record<
  string,
  { bg: string; text: string; logoText: string }
> = {
  mtn: { bg: "bg-[#FFCC00]", text: "text-black", logoText: "mtn" },
  airtel: { bg: "bg-[#E50914]", text: "text-white", logoText: "airtel" },
  glo: { bg: "bg-[#7CBB15]", text: "text-white", logoText: "glo" },
  "9mobile": {
    bg: "bg-[#23342B]",
    text: "text-[#9EBA28]",
    logoText: "9mobile",
  },
};

export default function BuyDataPage() {
  const router = useRouter();
  const [networks, setNetworks] = React.useState<string[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [plans, setPlans] = React.useState<any[]>([]);
  const [loadingProviders, setLoadingProviders] = React.useState(false);
  const [loadingPlans, setLoadingPlans] = React.useState(false);
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseData, setPurchaseData] = useState<any>(null);

  const defaultNetwork = "mtn";
  const defaultCategory = "sme"; // updated to match image default
  const defaultPlan = "";

  // Fetch available providers (networks) once
  React.useEffect(() => {
    (async () => {
      setLoadingProviders(true);
      try {
        const res = await fetch("/api/admin/data-plans");
        const j = await res.json();
        if (j.ok && Array.isArray(j.data)) {
          const unique: any = Array.from(
            new Set(j.data.map((p: any) => p.provider)),
          ).filter(Boolean);
          setNetworks(
            unique.length ? unique : ["mtn", "airtel", "glo", "9mobile"],
          ); // Fallback array if API empty
        } else {
          setNetworks(["mtn", "airtel", "glo", "9mobile"]);
        }
      } catch (err) {
        console.error(err);
        setNetworks(["mtn", "airtel", "glo", "9mobile"]);
      } finally {
        setLoadingProviders(false);
      }
    })();
  }, []);

  // Fetch categories for a provider
  const fetchCategoriesForNetwork = async (network: string) => {
    setLoadingPlans(true);
    try {
      const res = await fetch(
        `/api/admin/data-plans?provider=${encodeURIComponent(network)}`,
      );
      const j = await res.json();
      if (j.ok && Array.isArray(j.data)) {
        const cats: any = Array.from(
          new Set(j.data.map((p: any) => p.category)),
        ).filter(Boolean);
        setCategories(cats);
        return j.data;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlans(false);
    }
    return [];
  };

  const fetchPlansFor = async (network: string, category: string) => {
    setLoadingPlans(true);
    try {
      const url = `/api/admin/data-plans?provider=${encodeURIComponent(network)}`;
      const res = await fetch(url);
      const j = await res.json();
      if (j.ok && Array.isArray(j.data)) {
        setPlans(j.data);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error(err);
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSubmit = async (values: DataForm, helpers: any) => {
    if(loading) return;
    setLoading(true);
    helpers.setSubmitting(true);
    try {
      const payload = {
        network: values.network,
        category: values.category,
        planId: Number(values.plan),
        phone: phone,
        pin: values.pin,
      };

      const res: any = await ApiClient.post("buy/data", payload).then((data:any)=>{
        setPurchaseData(data?.data)
        setShowSuccessModal(true)
        helpers.resetForm();
        setLoading(false);

      });
      // toast.success(res?.data?.message || "Data purchased successfully");
      // router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      setLoading(false);
      toast.error(error?.response?.data?.error || "Failed to purchase data");
    } finally {
      helpers.setSubmitting(false);
      setLoading(false);
    }
  };

  // Initial plan load for default network/category
  React.useEffect(() => {
    fetchPlansFor(defaultNetwork, defaultCategory);
  }, []);

  const changePhoneFromInput = (e: React.ChangeEvent<HTMLInputElement>) =>{
    setPhone(e.target.value)
    console.log(e.target.value)
    if(e.target.value.length === 11){
      alert("11 digits")
    }
  }

  return (
    <main className="min-h-screen  p-4 w-full bg-[#F8FAFC] mx-auto font-sans">
      {/* Header aligned with data  pAGE.png */}

      {/* model */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-primary-800 p-8 text-white flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <h2 className="text-2xl font-bold mt-5">Purchase Successful</h2>

            <p className="text-primary-100 text-center mt-2">
              Your data bundle has been delivered successfully.
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Phone Number</span>
              <span className="font-semibold text-primary-800">{purchaseData?.phone}</span>
            </div>

            {/* <div className="flex justify-between">
              <span className="text-slate-500">Network</span>
              <span className="font-semibold text-primary-800">MTN</span>
            </div> */}

            <div className="flex justify-between">
              <span className="text-slate-500">Bundle</span>
              <span className="font-semibold text-primary-800">{purchaseData?.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold text-primary-800">₦{purchaseData?.amount}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Reference</span>
              <span className="text-sm font-medium text-primary-800">
                {purchaseData?.txRef}
              </span>
            </div>

            <div className="pt-4 grid grid-cols-2 gap-3">
              <Button
                onClick={() => setShowSuccessModal(false)}
                variant="outline"
              >
                Buy Another
              </Button>
              <Link  href="/dashboard">
                <Button className="w-40">Done</Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* end model */}
      <div className="flex items-center justify-between mb-8 pt-2">
        <Link href="/dashboard" className="text-slate-700">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-[#1E293B]">Purchase Data</h1>
        <button className="text-slate-700">
          <Clock className="w-6 h-6" />
        </button>
      </div>

      <Formik
        initialValues={{
          network: defaultNetwork,
          category: defaultCategory,
          plan: defaultPlan,
          pin: "",
        }}
        enableReinitialize
        validationSchema={dataValidationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          handleChange,
          handleBlur,
          isSubmitting,
        }) => {
          const handleNetworkChange = async (net: string) => {
            setFieldValue("network", net);
            const providerPlans = await fetchCategoriesForNetwork(net);
            const firstCat = providerPlans.length
              ? providerPlans[0].category
              : "sme";
            setFieldValue("category", firstCat);
            await fetchPlansFor(net, firstCat);
          };

          const handleCategoryChange = async (cat: string) => {
            setFieldValue("category", cat);
            await fetchPlansFor(values.network, cat);
          };

          return (
            <Form className="">
              <FieldGroup className="">
                {/* 1. Network Circular Selection */}
                <div>
                  <div className="flex justify-around items-center py-2">
                    {networks.map((net) => {
                      const lowerNet = net.toLowerCase();
                      const style = networkStyles[lowerNet] || {
                        bg: "bg-gray-300",
                        text: "text-black",
                        logoText: net,
                      };
                      const isSelected =
                        values.network.toLowerCase() === lowerNet;

                      return (
                        <button
                          key={net}
                          type="button"
                          onClick={() => handleNetworkChange(lowerNet)}
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-[10px] font-black tracking-tighter uppercase transition-all shadow-md ${style.bg} ${style.text} ${
                            isSelected
                              ? "ring-4 ring-black ring-offset-2 scale-105"
                              : "opacity-80"
                          }`}
                        >
                          {style.logoText}
                        </button>
                      );
                    })}
                  </div>
                  {errors.network && touched.network && (
                    <p className="text-red-500 text-xs mt-1 text-center">
                      {String(errors.network)}
                    </p>
                  )}
                </div>

                {/* 2. Phone Number Input Layout */}
                <div className="relative border-b bg-white px-3 border-slate-200 py-1">
                  <Input
                    name="phone"
                    value={phone}
                    onChange={changePhoneFromInput}
                    // onBlur={handleBlur}
                    placeholder="Enter a phone number"
                    className="w-full bg-white border-none text-lg placeholder-slate-400 focus-visible:ring-0 px-0 h-12 pr-10"
                  />
                  <Smartphone className="absolute right-2 top-3 text-slate-400 w-6 h-6" />
                 {/* message */}
                </div>

                {/* 3. Category Horizontal Tabs */}
                <div>
                  <div className="flex justify-between border-b border-slate-100 text-sm font-semibold text-slate-400">
                    {["sme", "gifting", "corporate", "awoof"].map((cat) => {
                      const isActive = values.category.toLowerCase() === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategoryChange(cat)}
                          className={`pb-3 px-2 uppercase tracking-wider transition-all border-b-2 text-xs md:text-sm ${
                            isActive
                              ? "border-blue-600 text-blue-600 font-bold"
                              : "border-transparent hover:text-slate-600"
                          }`}
                        >
                          {cat === "corporate" ? "CORPORATE" : cat}
                        </button>
                      );
                    })}
                  </div>
                  {errors.category && touched.category && (
                    <p className="text-red-500 text-xs mt-1">
                      {String(errors.category)}
                    </p>
                  )}
                </div>

                {/* 4. Plans Grid Cards Layout */}
                <div>
                  {loadingPlans ? (
                    <div className="text-center py-8 text-sm text-slate-500">
                      Loading plans...
                    </div>
                  ) : plans.length === 0 ? (
                    <div className="text-center py-8 text-sm text-slate-400">
                      No active plans found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {plans.map((p: any) => {
                        const planIdStr = String(p.externalId || p._id || p.id);
                        const isSelected = values.plan === planIdStr;
                        const currentNetStyle = networkStyles[
                          values.network.toLowerCase()
                        ] || { bg: "bg-yellow-400" };

                        return (
                          <button
                            key={planIdStr}
                            type="button"
                            onClick={() => setFieldValue("plan", planIdStr)}
                            className={`p-4 bg-white rounded-2xl shadow-sm border text-left flex items-center gap-3 transition-all ${
                              isSelected
                                ? "border-blue-600 ring-2 ring-blue-100"
                                : "border-slate-100"
                            }`}
                          >
                            {/* Tiny network circle avatar inside card */}
                            <div
                              className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[5px] font-black uppercase text-black ${currentNetStyle.bg}`}
                            >
                              {values.network.substring(0, 3)}
                            </div>

                            <div>
                              <div className="font-bold text-primary-800 text-sm">
                                {p.name || "Data Plan"}
                              </div>
                              <div className="text-[10px] text-slate-400 uppercase font-medium tracking-tight">
                                {p.validity || "7 Days"}
                              </div>
                              <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                                ₦{" "}
                                {new Intl.NumberFormat("en-NG").format(
                                  p.amount,
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {errors.plan && touched.plan && (
                    <p className="text-red-500 text-xs mt-2">
                      {String(errors.plan)}
                    </p>
                  )}
                </div>

                {/* 5. Security & Action Area */}
                {values.plan && (
                  <div className="pt-4 space-y-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Transaction PIN
                      </label>
                      <Input
                        name="pin"
                        type="password"
                        value={values.pin}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter 4-digit PIN"
                        maxLength={4}
                        className="w-full tracking-widest text-center"
                      />
                      {errors.pin && touched.pin && (
                        <p className="text-red-500 text-xs mt-1">
                          {String(errors.pin)}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className={`bg-blue-600 text-white font-bold py-3.5 rounded-xl w-full text-center hover:bg-blue-700 transition-all ${
                        isSubmitting ? "opacity-60 pointer-events-none" : ""
                      }`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Complete Purchase"}
                    </button>
                  </div>
                )}
              </FieldGroup>
            </Form>
          );
        }}
      </Formik>
    </main>
  );
}
