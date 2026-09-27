"use client";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import React from "react";

function WelcomeMessage() {
  const [message, setMessage] = React.useState<string>("");

  React.useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await fetch("/api/admin/welcome-message");
        const data = await res.json();
        if (res.ok) {
          setMessage(data.message);
        } else {
          console.error("Error fetching welcome message:", data.message);
        }
      } catch (error) {
        console.error("Error fetching welcome message:", error);
      }
    };

    fetchMessage();
  }, []);

  const updateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/welcome-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Welcome message updated successfully");
      } else {
        console.error("Error updating welcome message:", data.message);
        alert("Error updating welcome message");
      }
    } catch (error) {
      console.error("Error updating welcome message:", error);
      alert("Error updating welcome message");
    }
  };
  return (
    <div className="p-4">
      <header className="flex items-center justify-between max-w-5xl mx-auto">
        <img src="/white.png" className="w-10" alt="" />

        <Link href="/admin">
          <button className="bg-gray-100 text-primary-600 px-4 py-2 text-sm rounded-lg font-bold">
            Back
          </button>
        </Link>
      </header>
      <div className=" max-w-5xl py-6 mx-auto">
        <h1 className="text-primary md:text-xl font-bold">Welcome Message</h1>

        <p className="text-xs text-gray-700">
          This is the welcome message that will be displayed to users on
          dashboard page.
        </p>

        <form onSubmit={updateMessage} className="flex flex-col gap-3 my-4">
          <Textarea
            className="h-44"
            rows={10}
            placeholder="Enter welcome message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="bg-primary-600 text-white px-4 py-2 text-sm rounded-lg font-bold hover:bg-primary-700"
          >
            Save Message
          </button>
        </form>
      </div>
    </div>
  );
}

export default WelcomeMessage;
