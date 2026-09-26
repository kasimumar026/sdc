"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import ApiClient from "@/lib/API";
import axios from "axios";

const phoneSchema = Yup.object().shape({
  phone: Yup.string()
    .required("Please enter your phone number")
    .min(10, "Full phone number please"),
});

function ForgotPassword({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    const res = await ApiClient.post("forgot-password", {
      phone: values.phone,
    })
      .then(async function (response) {
        const { phone, code } = response.data;
        const res: any = await axios({
          method: "post",
          url: "https://bilalsadasub.com/api/bulksms",
          headers: {
            Authorization:
              "7d891d160bd0667308fc2cd3948a798def931ed0d6198ed74edc558a580e",
            "Content-Type": "application/json",
          },
          data: {
            sender: "Afaruk",
            number: phone.trim(),
            message: `Your verification code is ${code}`,
          },
          timeout: 15000,
        });

        if (res.ok) {
          toast.success(`Verification code sent to ${phone}`);
          router.push("/auth/login");
        }
      })
      .catch(function (error) {
        console.log(error);
        toast.error(
          error?.response?.data?.message || "Failed to send reset code",
        );
      });
  };

  return (
    <div
      className={cn(
        "bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10",
        className,
      )}
      {...props}
    >
      <div className="w-full max-w-sm md:max-w-4xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <Formik
              initialValues={{ phone: "" }}
              validationSchema={phoneSchema}
              validateOnMount={true}
              onSubmit={(values) => handleSubmit(values)}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                isSubmitting,
                isValid,
              }) => (
                <Form className="p-6 md:p-8">
                  <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <span className="text-2xl font-semibold text-primary">
                        AFarukDataSub
                      </span>
                      <p className="text-muted-foreground text-sm  mb-4">
                        Enter the phone number associated with your account. We
                        will send your password through SMS.
                      </p>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                      <div>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="08012345678"
                          className="bg-white"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.phone}
                        />
                        <p className="text-red-500 text-xs">
                          {errors.phone &&
                            touched.phone &&
                            String(errors.phone)}
                        </p>
                      </div>
                    </Field>

                    <Field>
                      <button
                        className="bg-primary text-white px-6 py-2 rounded-sm hover:shadow-lg transition-all"
                        type="submit"
                        disabled={isSubmitting || !isValid}
                      >
                        {isSubmitting ? "Sending..." : "Send reset code"}
                      </button>
                    </Field>

                    <FieldDescription className="text-center">
                      Remembered your password?{" "}
                      <Link href="/auth/login">Login</Link>
                    </FieldDescription>
                  </FieldGroup>
                </Form>
              )}
            </Formik>

            <div className="bg-muted relative hidden md:block">
              <img
                src="/screenshot.png"
                alt="Image"
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ForgotPassword;
