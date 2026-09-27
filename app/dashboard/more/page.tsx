"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  Search, 
  Smartphone, 
  Wifi, 
  Tv, 
  Zap, 
  GraduationCap, 
  Diamond, 
  Smile, 
  Wallet, 
  Gift, 
  Clock, 
  User, 
  Bell, 
  Info 
} from "lucide-react";

// Structure matches the icons and names from Screenshot_20260623-153415.png
const SERVICES = [
  { id: "airtime", name: "Airtime", icon: Smartphone, href: "/dashboard/airtime" },
  { id: "data", name: "Data", icon: Wifi, href: "/dashboard/data" },
  { id: "cable", name: "Cable TV", icon: Tv, href: "/dashboard/cable" },
  { id: "electricity", name: "Electricity", icon: Zap, href: "/dashboard/electricity" },
  { id: "exam", name: "Exam Pins", icon: GraduationCap, href: "/dashboard/exam" },
  { id: "alpha", name: "Alpha", icon: Diamond, href: "#" },
  { id: "smile", name: "Smile", icon: Smile, href: "#" },
  { id: "wallet", name: "Fund Wallet", icon: Wallet, href: "/dashboard/fund" },
  { id: "referrals", name: "Referrals", icon: Gift, href: "#" },
  { id: "history", name: "History", icon: Clock, href: "/dashboard/history" },
  { id: "profile", name: "Profile", icon: User, href: "/dashboard/profile" },
  { id: "alerts", name: "Alerts", icon: Bell, href: "#" },
  { id: "about", name: "About Us", icon: Info, href: "#" },
];

export default function AllServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter services dynamically as user types
  const filteredServices = SERVICES.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 w-full md:w-1/2 mx-auto font-sans">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-5 pt-2">
        <Link 
          href="/dashboard" 
          className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-slate-800" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 pr-10 flex-1 text-center">
          All Services
        </h1>
      </div>

      {/* Custom Search Box */}
      <div className="relative mb-8">
        <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a service..."
          className="w-full bg-white text-slate-800 placeholder-slate-400 border border-slate-100 rounded-xl py-3.5 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[15px]"
        />
      </div>

      {/* 3-Column Grid matching Screenshot_20260623-153415.png */}
      {filteredServices.length === 0 ? (
        <div className="text-center text-slate-400 text-sm py-12">
          No matching services found
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-x-4 gap-y-6 justify-items-center">
          {filteredServices.map((service) => {
            const IconComponent = service.icon;
            
            return (
              <Link 
                key={service.id} 
                href={service.href}
                className="group flex flex-col items-center w-full max-w-[90px]"
              >
                {/* Square Icon Container */}
                <div className="w-[76px] h-[76px] bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-50 flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
                  <IconComponent 
                    className="w-7 h-7 text-primary"
                    strokeWidth={1.8} 
                  />
                </div>
                
                {/* Label text directly underneath */}
                <span className="mt-2.5 text-[13px] font-medium text-slate-800 text-center tracking-tight truncate w-full">
                  {service.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}

    </main>
  );
}