"use client";

import React from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import ApiClient from "@/lib/API";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

type ExamForm = {
  exam: string;
  quantity: number | string;
  pin: string;
};

const validationSchema = Yup.object().shape({
  exam: Yup.string().required("Select an exam"),
  quantity: Yup.number().min(1).required("Quantity is required"),
  pin: Yup.string().length(4, "PIN must be 4 digits").required("PIN is required"),
});

export default function BuyExamPage() {
  const router = useRouter();

  const EXAM_PRICES: Record<string, number> = {
    "1": 3400,
    "2": 1200,
    "3": 850,
  };

  const handleSubmit = async (values: ExamForm, helpers: any) => {
    helpers.setSubmitting(true);
    try {
      const payload = {
        exam: values.exam,
        quantity: Number(values.quantity),
       
        pin: values.pin,
      };

      const res: any = await ApiClient.post("buy/exam", payload);
      toast.success(res?.data?.message || "Exam purchased successfully");
      helpers.resetForm();
      router.push("/dashboard/transactions");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Failed to purchase exam");
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <main className="p-6 w-full md:w-2/3 mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Buy Exam</h1>
        <p className="text-sm text-slate-600">Purchase exam vouchers or codes instantly.</p>
      </div>

      <div className="bg-card p-6 rounded-lg shadow">
        <Formik
          initialValues={{ exam: "1", quantity: 1, pin: "" }}
          validationSchema={validationSchema}
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
          }) => (
            <Form className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Exam</FieldLabel>
                  <Select
                    value={values.exam}
                    onValueChange={(val) => setFieldValue("exam", val)}
                    // onBlur={handleBlur as any}
                  >
                    <SelectTrigger className="w-full" aria-label="Exam">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">WAEC ₦3,400</SelectItem>
                      <SelectItem value="2">NECO ₦1,200</SelectItem>
                      <SelectItem value="3">NABTEB ₦850.00</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-red-500 text-xs">{errors.exam && touched.exam && String(errors.exam)}</p>
                </Field>

                <Field>
                  <FieldLabel>Quantity</FieldLabel>
                  <div>
                    <Input
                      name="quantity"
                      type="number"
                      value={values.quantity as any}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full"
                    />
                    <p className="text-red-500 text-xs">{errors.quantity && touched.quantity && String(errors.quantity)}</p>
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card p-3 rounded">
                    <div className="text-xs text-slate-500">Price</div>
                    <div className="font-medium">{EXAM_PRICES[String(values.exam)] ? `₦${EXAM_PRICES[String(values.exam)].toLocaleString()}` : '—'}</div>
                  </div>
                  <div className="bg-card p-3 rounded">
                    <div className="text-xs text-slate-500">Total</div>
                    <div className="font-medium">{EXAM_PRICES[String(values.exam)] ? `₦${(EXAM_PRICES[String(values.exam)] * Number(values.quantity || 0)).toLocaleString()}` : '—'}</div>
                  </div>
                </div>

               

                <Field>
                  <FieldLabel>Transaction PIN</FieldLabel>
                  <div>
                    <Input
                      name="pin"
                      type="password"
                      value={values.pin}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="4-digit PIN"
                      className="w-full"
                    />
                    <p className="text-red-500 text-xs">{errors.pin && touched.pin && String(errors.pin)}</p>
                  </div>
                </Field>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className={cn(
                      "bg-primary text-white px-6 py-2 rounded-sm w-full hover:shadow-lg transition-all",
                      isSubmitting ? "opacity-60 pointer-events-none" : ""
                    )}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Buy Exam"}
                  </button>

                  <Link href="/dashboard">
                    <Button variant="ghost">Back</Button>
                  </Link>
                </div>
              </FieldGroup>
            </Form>
          )}
        </Formik>
      </div>
    </main>
  );
}