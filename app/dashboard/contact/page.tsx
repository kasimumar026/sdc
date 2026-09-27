"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Mail } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // UI-only: log and show a friendly alert. Replace with API call when ready.
    console.log({ name, email, message });
    setTimeout(() => {
      setSending(false);
      setName("");
      setEmail("");
      setMessage("");
      alert("Message sent — we'll get back to you shortly.");
    }, 700);
  };

  return (
    <main className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Contact details */}
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-3">Get in touch</h2>
            <p className="text-sm text-slate-500 mb-6">
              We're happy to help — reach out using any of the channels below and
              we'll respond as soon as we can.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-md">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Phone</div>
                  <a href="tel:07036574563" className="font-medium text-base text-primary">
                    07036574563
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-md">
                  <MessageSquare className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">WhatsApp</div>
                  <a href="https://wa.me/07036574563" target="_blank" rel="noreferrer" className="font-medium text-base text-emerald-600">
                    07036574563
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 rounded-md">
                  <Mail className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Email</div>
                  <a href="mailto:sdcsmartdatasub@gmail.com" className="font-medium text-base text-indigo-600">
                    sdc@gmail.com
                  </a>
                </div>
              </div> c
            </div>
          </div>

          {/* Right: Contact form */}
          {/* <div className="bg-card p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-2 block">Your name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-2 block">Your email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-2 block">Message</label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? "Sending..." : "Send message"}
                </Button>
              </div>
            </form>
          </div> */}
        </div>
      </div>
    </main>
  );
}