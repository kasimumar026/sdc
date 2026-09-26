"use client";
import Link from "next/link";
import { Button } from "./components/ui/button";

export default function Custom404() {
  return (
    <div className="h-screen flex flex-col gap-4 items-center justify-center">
      <h1>404 - Page Not Found</h1>
      <Link href="/">
        <Button variant="outline">Go Home</Button>
      </Link>
    </div>
  );
}
