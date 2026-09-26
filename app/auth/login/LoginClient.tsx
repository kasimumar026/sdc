"use client";
import React, { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Form, Formik } from "formik";
import { loginValidationSchema } from "@/helpers/validations";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ApiClient from "@/lib/API";
import { Eye, EyeOff } from "lucide-react";

function LoginClient({ className, ...props }: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  //
  const router = useRouter();
  const handleLogin = async (values: any) => {
    console.log("Login values:", values);
    const response: any = await ApiClient.post("login", {
      email: values.email,
      password: values.password,
    })
      .then(function (response) {
        toast.success("Logged in Successfully");
        if(response?.data?.user?.role === "admin"){
          router.push("/admin");
          return;
        }
        router.push("/dashboard");
      })
      .catch(function (error) {
        console.log(error?.response?.data?.error);
        toast.error(error?.response?.data?.error);
      });
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 ">
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginValidationSchema}
            onSubmit={(values: any) => handleLogin(values)}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              isSubmitting,
              /* and other goodies */
            }) => (
              <Form className="p-6 md:p-8">
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <img alt="logo" src='/white.png' className="w-20"/>
                    {/* <span className="text-2xl font-semibold text-primary">
                      SDC Smart Data Data Sub
                    </span> */}
                    <p className="text-muted-foreground text-balance mb-4">
                      Login to your <span className="font-bold text-primary">SDC Smart Data account</span>
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
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Link
                        href="/auth/forgot-password"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        Forgot your password?
                      </Link>
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
                          aria-label={showPassword ? "Hide password" : "Show password"}
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
                    <button
                      className="bg-primary text-white px-6 py-2 rounded-full hover:shadow-lg transition-all"
                      type="submit"
                      disabled={isSubmitting ? true : false}
                    >
                      {isSubmitting ? "Loading..." : "Log In"}
                    </button>
                  </Field>

                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/register">Register</Link>
                  </FieldDescription>
                </FieldGroup>
              </Form>
            )}
          </Formik>
        
        </CardContent>
      </Card>
      {/* <FieldDescription className="px-6 text-center pt-8">
            Developed by <a href="https://hamza-developer.vercel.app" target="_blank" className="text-blue-500 ">Hamza Shadeez</a>
           </FieldDescription> */}
    </div>
  );
}

export default LoginClient;