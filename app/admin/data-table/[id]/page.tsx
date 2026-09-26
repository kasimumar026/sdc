"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form as FormikForm } from "formik";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const providers = ["mtn", "airtel", "glo", "smobile"];
const categories = ["gifting", "sme", "cooperate_gifting"];

const Schema = yup.object().shape({
  provider: yup.string().required("Provider is required"),
  category: yup.string().required("Category is required"),
  name: yup.string().required("Name is required"),
  amount: yup.number().required("Amount is required").min(0),
});

export default function EditPage() {
  const router = useRouter();
  const params: any = useParams();
  const id = params.id as string;
  const [initial, setInitial]: any = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/data-plans/${id}`);
        const j = await res.json();
        if (j.ok) setInitial(j.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);

  if (!initial) {
    return (
      <main className="p-6">
        <div className="text-sm text-slate-500">Loading…</div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold">Edit Data Plan</h1>
            <p className="text-sm text-slate-500">Modify plan details</p>
          </div>
          <div>
            <Link href="/admin/data-table">
              <Button variant="outline">Back to list</Button>
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6">
          <Formik
            enableReinitialize
            initialValues={{
              provider: initial.provider || "",
              category: initial.category || "",
              externalId: initial.externalId ?? "",
              name: initial.name || "",
              buyingPrice: initial.meta?.buyingPrice ?? "",
              amount: initial.amount ?? "",
              validity: initial.validity || "",
              publish: initial.status === "active",
            }}
            validationSchema={Schema}
            onSubmit={async (values, { setSubmitting, setStatus }) => {
              setSubmitting(true);
              setStatus(undefined);
              try {
                const payload = {
                  provider: values.provider,
                  category: values.category,
                  externalId: values.externalId
                    ? Number(values.externalId)
                    : undefined,
                  name: values.name,
                  buyingPrice: Number(values.buyingPrice),
                  amount: Number(values.amount),
                  validity: values.validity,
                  publish: !!values.publish,
                };

                const res = await fetch(`/api/admin/data-plans/${id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });

                const j = await res.json();
                if (!j.ok) throw new Error(j.error || "Failed to update");
                setStatus({ success: "Updated" });
                router.push("/admin/data-table");
              } catch (err: any) {
                setStatus({ error: err.message || "Failed to update" });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({
              values,
              handleChange,
              setFieldValue,
              isSubmitting,
              status,
              errors,
              touched,
            }) => (
              <FormikForm>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Provider
                    </label>
                    <Select
                      onValueChange={(v) => setFieldValue("provider", v)}
                      value={values.provider}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {touched.provider && errors.provider && (
                      <div className="text-rose-600 text-sm mt-1">
                        {String(errors.provider)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    <Select
                      onValueChange={(v) => setFieldValue("category", v)}
                      value={values.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {touched.category && errors.category && (
                      <div className="text-rose-600 text-sm mt-1">
                        {String(errors.category)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      External ID
                    </label>
                    <Input
                      name="externalId"
                      value={values.externalId}
                      disabled
                      onChange={handleChange}
                      type="number"
                      placeholder="Optional numeric id"
                    />
                    {touched.externalId && errors.externalId && (
                      <div className="text-rose-600 text-sm mt-1">
                        {String(errors.externalId)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name
                    </label>
                    <Input
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      placeholder="e.g. 1GB"
                    />
                    {touched.name && errors.name && (
                      <div className="text-rose-600 text-sm mt-1">
                        {String(errors.name)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Buying Price
                    </label>
                    <Input
                      name="buyingPrice"
                      value={values.buyingPrice}
                      onChange={handleChange}
                      type="number"
                      placeholder="What you pay the vendor"
                    />
                    {touched.buyingPrice && errors.buyingPrice && (
                      <div className="text-rose-600 text-sm mt-1">
                        {String(errors.buyingPrice)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Amount (N)
                    </label>
                    <Input
                      name="amount"
                      value={values.amount}
                      onChange={handleChange}
                      type="number"
                      placeholder="Customer price"
                    />
                    {touched.amount && errors.amount && (
                      <div className="text-rose-600 text-sm mt-1">
                        {String(errors.amount)}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Validity
                    </label>
                    <Input
                      name="validity"
                      value={values.validity}
                      onChange={handleChange}
                      placeholder="e.g. 30 days"
                    />
                    {touched.validity && errors.validity && (
                      <div className="text-rose-600 text-sm mt-1">
                        {String(errors.validity)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 md:col-span-2">
                    <label className="block text-sm font-medium mb-0">
                      Publish
                    </label>
                    <Switch
                      checked={!!values.publish}
                      onCheckedChange={(v) => setFieldValue("publish", v)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Update plan"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/data-table")}
                  >
                    Cancel
                  </Button>
                  {status?.success && (
                    <div className="text-emerald-600">{status.success}</div>
                  )}
                  {status?.error && (
                    <div className="text-rose-600">{status.error}</div>
                  )}
                </div>
              </FormikForm>
            )}
          </Formik>
        </div>
      </div>
    </main>
  );
}
