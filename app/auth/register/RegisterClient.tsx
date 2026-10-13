"use client";
import React, { useState } from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Form, Formik } from "formik";
import { registerValidationSchema } from "@/helpers/validations";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ApiClient from "@/lib/API";
import { Eye, EyeOff } from "lucide-react";

function RegisterClient({ className, ...props }: React.ComponentProps<"div">) {
  //
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async (values: any) => {
    try {
      await ApiClient.post("register", {
        email: values.email,
        password: values.password,
        phone: values.phone,
        name: values.name,
      });
      toast.success("Account created. Set up your wallet to continue.");
      router.push("/auth/create-wallet");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Registration failed. Please try again.",
      );
    }
  };
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0">
          <Formik
            initialValues={{
              email: "",
              password: "",
              confirmPassword: "",
              phone: "",
              name: "",
            }}
            validationSchema={registerValidationSchema}
            validateOnMount={true}
            onSubmit={(values: any) => handleRegister(values)}
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
              <Form className="p-6">
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    {/* <span className="text-2xl font-semibold text-primary">
                       Data Sub
                    </span> */}
                    <img alt="logo" src="/white.png" className="w-20" />

                    <p className="text-muted-foreground text-balance mb-0">
                      Register a new <span className="font-bold text-primary">SDC Smart Data account</span>
                    </p>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        name="email"
                        className="bg-white"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.email}
                      />
                      <p className="text-red-700 text-xs">
                        {errors.email && touched.email && String(errors.email)}
                      </p>
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <div>
                      <Input
                        id="name"
                        type="name"
                        placeholder="Usama Muhd..."
                        name="name"
                        className="bg-white"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.name}
                      />
                      <p className="text-red-700 text-xs">
                        {errors.name && touched.name && String(errors.name)}
                      </p>
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="phone">Phone</FieldLabel>
                    <div>
                      <Input
                        id="phone"
                        type="phone"
                        placeholder="08012345678"
                        name="phone"
                        className="bg-white"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.phone}
                      />
                      <p className="text-red-700 text-xs">
                        {errors.phone && touched.phone && String(errors.phone)}
                      </p>
                    </div>
                  </Field>

                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                    </div>
                    <div>
                      <div className="relative">
                        <Input
                          name="password"
                          className="bg-white pr-10"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.password}
                          placeholder="Password"
                          id="password"
                          type={showPassword ? "text" : "password"}
                        />

                        <button
                          type="button"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-slate-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      </div>

                      <p className="text-red-700 text-xs">
                        {errors.password &&
                          touched.password &&
                          String(errors.password)}
                      </p>
                    </div>
                  </Field>

                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="confirmPassword">
                        Confirm Password
                      </FieldLabel>
                    </div>
                    <div>
                      <div className="relative">
                        <Input
                          name="confirmPassword"
                          className="bg-white pr-10"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.confirmPassword}
                          placeholder="Confirm Password"
                          id="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                        />

                        <button
                          type="button"
                          aria-label={
                            showConfirm ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowConfirm((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded"
                        >
                          {showConfirm ? (
                            <EyeOff className="w-4 h-4 text-slate-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      </div>

                      <p className="text-red-700 text-xs">
                        {errors.confirmPassword &&
                          touched.confirmPassword &&
                          String(errors.confirmPassword)}
                      </p>
                    </div>
                  </Field>
                  <Field>
                    <button
                      className="bg-primary rounded-sm text-white px-6 py-2  hover:shadow-lg transition-all"
                      type="submit"
                      disabled={isSubmitting || !isValid}
                    >
                      {isSubmitting ? "Loading..." : "Register"}
                    </button>
                  </Field>

                  <FieldDescription className="text-center">
                    Do you have an account? <Link href="/">Login</Link>
                  </FieldDescription>
                </FieldGroup>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
      {/* <FieldDescription className="px-6 text-center pt-4">
        Developed by{" "}
        <a
          href="https://hamza-developer.vercel.app"
          target="_blank"
          className="text-blue-500 "
        >
          Hamza Shadeez
        </a>
      </FieldDescription> */}
    </div>
  );
}

export default RegisterClient;
