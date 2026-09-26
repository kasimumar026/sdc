"use client";

import React, { useEffect, useState } from "react";
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
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import ApiClient from "@/lib/API";

const providers = ["mtn", "airtel", "glo", "9mobile"];
const categories = ["gifting", "sme", "cooperate_gifting", "awoof"];

const Schema = yup.object().shape({
  provider: yup.string().required("Provider is required"),
  category: yup.string().required("Category is required"),
  externalId: yup.number().nullable(),
  name: yup.string().required("Name is required"),
  platform: yup.string().required("Platform is required"),
  buyingPrice: yup.string(),
  amount: yup.number().required("Amount is required").min(0),
  validity: yup.string().required("Validity is required"),
  token: yup.string().required("Token is needed"),
  publish: yup.boolean(),
});

function Page() {
  const router = useRouter();

  const [platforms, setPlatforms]: any = useState([]);

  const getProviderPlatfroms = async () => {
    const res = await ApiClient.get("/admin/providers")
      .then((data: any) => {
        setPlatforms(data?.data?.providers);
      })
      .catch((erorr: any) => {
        console.log(erorr);
      });
  };

  useEffect(() => {
    getProviderPlatfroms();
  }, []);

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold">Create Data Plan</h1>
            <p className="text-sm text-slate-500">
              Add a new data plan to the catalog
            </p>
          </div>
          <div>
            <Link href="/admin/data-table">
              <Button variant="outline">Back to list</Button>
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6">
          <Formik
            initialValues={{
              provider: "",
              platform: "",
              category: "",
              externalId: "",
              name: "",
              buyingPrice: "",
              amount: "",
              validity: "",
              token: "",
              publish: true,
            }}
            validationSchema={Schema}
            onSubmit={async (
              values,
              { setSubmitting, resetForm, setStatus },
            ) => {
              setSubmitting(true);
              setStatus(undefined);
              try {
                // transform values
                const payload = {
                  provider: values.provider,
                  category: values.category,
                  providerId: values.platform,
                  token: values.token,
                  externalId: values.externalId
                    ? Number(values.externalId)
                    : undefined,
                  name: values.name,
                  buyingPrice: values.buyingPrice,
                  amount: Number(values.amount),
                  validity: values.validity,
                  publish: !!values.publish,
                };

                const res = await fetch("/api/admin/data-route", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });

                if (!res.ok) {
                  const err = await res.text();
                  throw new Error(err || "Failed to save");
                }

                setStatus({ success: "Plan saved" });
                resetForm();
                toast.success("Plan saved successfully");
                router.push("/admin/data-p");
              } catch (err: any) {
                setStatus({ error: err.message || "Failed to save" });
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
                      Select Provider Platform
                    </label>
                    <Select
                      onValueChange={(v) => setFieldValue("platform", v)}
                      value={values.platform}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Platform Provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map((p: any) => (
                          <SelectItem key={p?._id} value={p?._id}>
                            {p?.name?.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {touched.platform && errors.platform && (
                      <div className="text-rose-600 text-sm mt-1">
                        {String(errors.platform)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Network
                    </label>
                    <Select
                      onValueChange={(v) => setFieldValue("provider", v)}
                      value={values.provider}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select network provider" />
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

                  <div className="">
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

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Token (API KEY)
                    </label>
                    <Textarea
                      placeholder="Enter keys"
                      value={values.token}
                      onChange={handleChange}
                      name="token"
                    ></Textarea>
                     {touched.token && errors.token && (
                      <div className="text-rose-600 text-sm mt-1">
                        {String(errors.token)}
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
                    {isSubmitting ? "Saving..." : "Save plan"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      /* reset handled by formik resetForm via UI if desired */
                    }}
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

export default Page;
