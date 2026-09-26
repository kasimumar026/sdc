import * as Yup from "yup";

export const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email is required")
    .email("Please use an email address")
    .label("email"),

  password: Yup.string()
    .required("Password is required")
    .min(6, "Should be at least 6 characters")
    .label("password"),
 
});

export const registerValidationSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email is required")
    .email("Please use an email address")
    .label("email"),

  name: Yup.string()
    .required("Please enter your full name")
    .min(3, "Full name please")
    .label("name"),

  phone: Yup.string()
    .required("Please enter your phone number")
    .min(10, "Full phone number please")
    .label("phone"),

  password: Yup.string()
    .required("Password is required")
    .min(6, "Should be at least 6 characters")
    .label("password"),

    confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref('password'), ""], "Passwords must match")
    .label("confirm password"),
});

export const airtimeValidationSchema = Yup.object().shape({
  network: Yup.string().required("Please select a network").label("network"),
  phone: Yup.string()
    .required("Please enter a phone number")
    .min(10, "Full phone number please")
    .label("phone"),
  amount: Yup.number()
    .required("Amount is required")
    .min(50, "Minimum amount is 50")
    .label("amount"),
  pin: Yup.string()
    .required("Transaction PIN is required")
    .matches(/^\d{4}$/, "PIN must be 4 digits")
    .label("pin"),
});

export const dataValidationSchema = Yup.object().shape({
  network: Yup.string().required("Please select a network").label("network"),
  category: Yup.string().required("Please select a category").label("category"),
  plan: Yup.string().required("Please select a plan").label("plan"),
  // phone: Yup.string()
  //   .required("Please enter a phone number")
  //   .min(10, "Full phone number please")
  //   .label("phone"),
  pin: Yup.string()
    .required("Transaction PIN is required")
    .matches(/^\d{4}$/, "PIN must be 4 digits")
    .label("pin"),
});
