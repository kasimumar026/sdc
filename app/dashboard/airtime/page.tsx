// "use client";

// import React from "react";
// import { Form, Formik } from "formik";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Field,
//   FieldDescription,
//   FieldGroup,
//   FieldLabel,
// } from "@/components/ui/field";
// import { airtimeValidationSchema } from "@/helpers/validations";
// import ApiClient from "@/lib/API";
// import { toast } from "react-toastify";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// type AirtimeForm = {
//   network: string;
//   phone: string;
//   amount: number;
//   pin: string;
// };

// export default function BuyAirtimePage() {
//   const router = useRouter();

//   const handleSubmit = async (values: AirtimeForm, helpers: any) => {
//     helpers.setSubmitting(true);
//     try {
//       const payload = {
//         network: values.network,
//         phone: values.phone,
//         amount: Number(values.amount), // apply 2% discount
//         pin: values.pin,
//       };

//       const res: any = await ApiClient.post("buy/airtime", payload);
//       toast.success(res?.data?.message || "Airtime purchased successfully");
//       helpers.resetForm();
//       // optionally redirect to transactions or dashboard
//       router.push("/dashboard");
//     } catch (error: any) {
//       console.error(error);
//       toast.error(error?.response?.data?.error || "Failed to purchase airtime");
//     } finally {
//       helpers.setSubmitting(false);
//     }
//   };

//   return (
//     <main className="p-6 w-full md:w-2/3 mx-auto">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold">Buy Airtime</h1>
//         <p className="text-sm text-slate-600">
//           Instant airtime purchases for all networks.
//         </p>
//       </div>

//       <div className="bg-card p-6 rounded-lg shadow">
//         <Formik
//           initialValues={{ network: "mtn", phone: "", amount: 0, pin: "" }}
//           validationSchema={airtimeValidationSchema}
//           onSubmit={handleSubmit}
//         >
//           {({
//             values,
//             errors,
//             touched,
//             handleChange,
//             handleBlur,
//             setFieldValue,
//             isSubmitting,
//           }) => (
//             <Form className="space-y-4">
//               <FieldGroup>
//                 <Field>
//                   <FieldLabel>Network</FieldLabel>
//                   <div>
//                     <Select
//                       value={values.network}
//                       onValueChange={(v: string) => setFieldValue("network", v)}
//                     >
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select a Network" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectGroup>
//                           <SelectLabel>Networks</SelectLabel>
//                           <SelectItem value={"1"}>MTN</SelectItem>
//                           <SelectItem value={"3"}>GLO</SelectItem>
//                           <SelectItem value={"2"}>Airtel</SelectItem>
//                           <SelectItem value={"4"}>9mobile</SelectItem>
//                         </SelectGroup>
//                       </SelectContent>
//                     </Select>
//                     <p className="text-red-500 text-xs">
//                       {errors.network && touched.network && String(errors.network)}
//                     </p>
//                   </div>
//                 </Field>

//                 <Field>
//                   <FieldLabel>Phone number</FieldLabel>
//                   <div>
//                     <Input
//                       name="phone"
//                       value={values.phone}
//                       onChange={handleChange}
//                       onBlur={handleBlur}
//                       placeholder="0801xxxxxxx"
//                       className="w-full"
//                     />
//                     <p className="text-red-500 text-xs">
//                       {errors.phone && touched.phone && String(errors.phone)}
//                     </p>
//                   </div>
//                 </Field>

//                 <Field>
//                   <FieldLabel>Amount</FieldLabel>
//                   <div>
//                     <Input
//                       name="amount"
//                       type="number"
//                       value={values.amount as any}
//                       onChange={handleChange}
//                       onBlur={handleBlur}
//                       className="w-full"
//                     />
//                     <p className="text-red-500 text-xs">
//                       {errors.amount && touched.amount && String(errors.amount)}
//                     </p>
//                   </div>
//                 </Field>

//                 {/* fetch Amount inserted from the field */}
//                 <h2 className="text-semibold text-primary bg-primary/10 p-2 w-full md:w-1/2">Discount Amount: ₦ {values.amount * 0.98}</h2>

//                 <Field>
//                   <FieldLabel>Transaction PIN</FieldLabel>
//                   <div>
//                     <Input
//                       name="pin"
//                       type="password"
//                       value={values.pin}
//                       onChange={handleChange}
//                       onBlur={handleBlur}
//                       placeholder="4-digit PIN"
//                       className="w-full"
//                     />
//                     <p className="text-red-500 text-xs">
//                       {errors.pin && touched.pin && String(errors.pin)}
//                     </p>
//                   </div>
//                 </Field>

//                 <div className="flex items-center gap-3">
//                   <button
//                     type="submit"
//                     className={cn(
//                       "bg-primary text-white px-6 py-2 rounded-sm w-full hover:shadow-lg transition-all",
//                       isSubmitting ? "opacity-60 pointer-events-none" : ""
//                     )}
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? "Processing..." : "Buy Airtime"}
//                   </button>

//                   <Link href="/dashboard">
//                     <Button variant="ghost">Back</Button>
//                   </Link>
//                 </div>
//               </FieldGroup>
//             </Form>
//           )}
//         </Formik>
//       </div>
//     </main>
//   );
// }


"use client";

import React, { useState } from "react";
import { Form, Formik } from "formik";
import { Input } from "@/components/ui/input";
import { FieldGroup } from "@/components/ui/field";
import { airtimeValidationSchema } from "@/helpers/validations";
import ApiClient from "@/lib/API";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Smartphone, Wallet, ChevronRight } from "lucide-react";

type AirtimeForm = {
  network: string;
  purchaseType: string;
  phone: string;
  amount: number | string;
  pin: string;
};

const networkOptions = [
  { id: "1", key: "mtn", label: "mtn", bg: "bg-[#FFCC00]", text: "text-black" },
  { id: "3", key: "glo", label: "glo", bg: "bg-[#7CBB15]", text: "text-white" },
  { id: "2", key: "airtel", label: "airtel", bg: "bg-[#E50914]", text: "text-white" },
  { id: "4", key: "9mobile", label: "9mobile", bg: "bg-[#23342B]", text: "text-[#9EBA28]" },
];

export default function BuyAirtimePage() {
  const router = useRouter();
  const [showPinModal, setShowPinModal] = useState(false);

  const handleSubmit = async (values: AirtimeForm, helpers: any) => {
    helpers.setSubmitting(true);
    try {
      const payload = {
        network: values.network, // sends your needed numeric strings ("1", "2", etc.)
        phone: values.phone,
        amount: Number(values.amount),
        pin: values.pin,
      };

      const res: any = await ApiClient.post("buy/airtime", payload);
      toast.success(res?.data?.message || "Airtime purchased successfully");
      helpers.resetForm();
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Failed to purchase airtime");
    } finally {
      helpers.setSubmitting(false);
      setShowPinModal(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 w-full md:w-1/2 mx-auto font-sans">
      {/* Header exactly like Screenshot_20260623-155628.png */}
      <div className="flex items-center justify-between mb-8 pt-2">
        <Link href="/dashboard" className="text-slate-700">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-teal-800">Airtime TopUp</h1>
        <button className="text-slate-700">
          <Clock className="w-6 h-6" />
        </button>
      </div>

      <Formik
        initialValues={{ network: "1", purchaseType: "vtu", phone: "", amount: "", pin: "" }}
        validationSchema={airtimeValidationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
          isSubmitting,
        }) => {
          const selectedAmount = Number(values.amount) || 0;

          return (
            <Form className="space-y-3">
              <FieldGroup className="space-y-3">
                
                {/* 1. Network Circle Matrix */}
                <div className="flex justify-around items-center py-2">
                  {networkOptions.map((net) => {
                    const isSelected = values.network === net.id;
                    return (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => setFieldValue("network", net.id)}
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-[10px] font-black tracking-tighter uppercase transition-all shadow-md ${net.bg} ${net.text} ${
                          isSelected ? "ring-4 ring-black ring-offset-2 scale-105" : "opacity-75"
                        }`}
                      >
                        {net.label}
                      </button>
                    );
                  })}
                </div>
                {errors.network && touched.network && (
                  <p className="text-red-500 text-xs text-center">{String(errors.network)}</p>
                )}

                {/* 2. Purchase Type Segment Selector */}
                <div>
                  <label className="text-sm font-bold text-slate-500 block mb-2">Purchase Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    {["vtu", "awoof"].map((type) => {
                      const isActive = values.purchaseType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFieldValue("purchaseType", type)}
                          className={`py-3 rounded-xl font-bold text-base text-sm border transition-all text-center uppercase ${
                            isActive
                              ? "bg-teal-800 text-white border-teal-800" // Deep dark blue matched perfectly
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Recipient Container Box */}
                <div>
                  <label className="text-sm font-bold text-slate-500 block mb-1">Recipient Details</label>
                  <div className="relative border border-slate-200 bg-white rounded-2xl p-1 flex items-center shadow-sm">
                    <Smartphone className="ml-4 text-slate-400 w-5 h-5 flex-shrink-0" />
                    <Input
                      name="phone"
                      value={values.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter Mobile Number"
                      className="w-full bg-transparent border-none text-base placeholder-slate-400 focus-visible:ring-0 pl-3 h-10 pr-12"
                    />
                    <div className="absolute right-4 text-slate-400">
                      <svg className="w-6 h-6 text-[#1A237E]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5.25-4H6.75V5h10.5v11z"/>
                      </svg>
                    </div>
                  </div>
                  {errors.phone && touched.phone && (
                    <p className="text-red-500 text-xs mt-1 pl-1">{String(errors.phone)}</p>
                  )}
                </div>

                {/* 4. Amount Entry Box */}
                <div>
                  <label className="text-sm font-bold text-slate-500 block mb-1">Amount</label>
                  <div className="relative border border-slate-200 bg-white rounded-2xl p-1 flex items-center shadow-sm">
                    <Wallet className="ml-4 text-slate-400 w-5 h-5 flex-shrink-0" />
                    <Input
                      name="amount"
                      type="number"
                      value={values.amount}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="0.00"
                      className="w-full bg-transparent border-none text-base font-medium placeholder-slate-400 focus-visible:ring-0 pl-3 h-10 text-slate-800"
                    />
                  </div>
                  {errors.amount && touched.amount && (
                    <p className="text-red-500 text-xs mt-1 pl-1">{String(errors.amount)}</p>
                  )}
                  
                  {/* Embedded dynamic discount label */}
                  {selectedAmount > 0 && (
                    <div className="mt-2 text-xs text-emerald-600 font-semibold pl-1">
                      Pays ₦{new Intl.NumberFormat("en-NG").format(selectedAmount * 0.98)} after 2% discount
                    </div>
                  )}
                </div>

                {/* 5. Execution Call to Action */}
                {!showPinModal ? (
                  <button
                    type="button"
                    disabled={!values.phone || !values.amount}
                    onClick={() => setShowPinModal(true)}
                    className="w-full py-3 rounded-2xl font-bold bg-[#A0AEC0] text-white hover:bg-slate-500 transition-all text-center text-[15px]"
                    style={{
                      backgroundColor: values.phone && values.amount ? "teal" : "#A0AEC0"
                    }}
                  >
                    Proceed to Pay
                  </button>
                ) : (
                  /* 6. PIN Box slide-in area once target data verified */
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Confirm Transaction PIN
                      </label>
                      <Input
                        name="pin"
                        type="password"
                        value={values.pin}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter 4-digit PIN"
                        maxLength={4}
                        className="w-full tracking-widest text-center text-lg focus:ring-0"
                      />
                      {errors.pin && touched.pin && (
                        <p className="text-red-500 text-xs mt-1">{String(errors.pin)}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPinModal(false)}
                        className="w-1/3 py-2 text-sm font-semibold border border-slate-200 rounded-xl text-slate-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || values.pin.length < 4}
                        className="flex-1 py-2 text-sm font-bold bg-teal-800 text-white rounded-xl disabled:opacity-50"
                      >
                        {isSubmitting ? "Paying..." : "Verify & Buy"}
                      </button>
                    </div>
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