"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ProviderCard = ({ data }: any) => {
  return (
    <Link href={`/admin/providers/${data._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
        <h2 className="text-lg font-semibold mb-2">
          {data.name || "Unnamed Provider"}
        </h2>
        <p className="text-gray-600">{data.url || "No URL available"}</p>
      </div>
    </Link>
  );
};

function Providers() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [service, setService] = useState<"data" | "airtime">("data");
  const [mtnId, setMtnId] = useState(1);
  const [gloId, setGloId] = useState(3);
  const [airtelId, setAirtelId] = useState(2);
  const [nineMobileId, setNineMobileId] = useState(4);

  const onSubmit = async () => {
    // client-side validation
    if (!name.trim()) return toast.error("Name is required");
    if (!url.trim() || !/^https?:\/\//i.test(url))
      return toast.error("Valid URL is required (include http:// or https://)");
    if (!service) return toast.error("Service is required");
    try {
      const res = await fetch("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, service, mtn:mtnId, glo:gloId, airtel:airtelId, nineMobile:nineMobileId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      toast.success("Provider created");
      setOpen(false);
      setName("");
      setUrl("");
      setService("data");
      setMtnId(1);
      setGloId(3);
      setAirtelId(2);
      setNineMobileId(4);
      // append to local list
      setProviders((curr) => [json.provider, ...curr]);
    } catch (err: any) {
      toast.error(err?.message || String(err));
    }
  };
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/providers");
        const json = await res.json();
        if (res.ok) setProviders(json.providers || []);
        else toast.error(json?.error || "Failed to load providers");
      } catch (err: any) {
        toast.error(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const router = useRouter();

  return (
    <div className="p-5 bg-gray-50">
      <Button
        variant="outline"
        onClick={() => router.push("/admin")}
        className="mb-4"
      >
        Back
      </Button>
      <img src="/white.png" className="w-20 mx-auto" alt="" />
      <h1 className="text-xl text-center  font-bold text-primary my-1">
        Connected Providers
      </h1>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-primary text-teal-100 py-2.5 active:bg-primary/70 rounded-md text-sm"
      >
        Link New Provider
      </button>

      <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
        <DialogContent>
          <DialogTitle>Link New Provider</DialogTitle>
          <div className="py-4">
            <label className="block text-sm mb-1">Name</label>
            <Input
              value={name}
              onChange={(e: any) => setName(e.target.value)}
            />
            <label className="block text-sm mt-3 mb-1">URL</label>
            <Input value={url} onChange={(e: any) => setUrl(e.target.value)} />
            <label className="block text-sm mt-3 mb-1">Service</label>
            <Select value={service} onValueChange={(v: any) => setService(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data">Data</SelectItem>
                <SelectItem value="airtime">Airtime</SelectItem>
              </SelectContent>
            </Select>

            <label className="block text-sm mt-3 mb-1">MTN ID</label>
            <Input
              type="number"
              value={mtnId}
              onChange={(e: any) => setMtnId(Number(e.target.value))}
            />
            <label className="block text-sm mt-3 mb-1">GLO ID</label>
            <Input
              type="number"
              value={gloId}
              onChange={(e: any) => setGloId(Number(e.target.value))}
            />
            <label className="block text-sm mt-3 mb-1">Airtel ID</label>
            <Input
              type="number"
              value={airtelId}
              onChange={(e: any) => setAirtelId(Number(e.target.value))}
            />
            <label className="block text-sm mt-3 mb-1">9Mobile ID</label>
            <Input
              type="number"
              value={nineMobileId}
              onChange={(e: any) => setNineMobileId(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {loading ? (
          <div>Loading providers...</div>
        ) : providers.length === 0 ? (
          <div>No providers yet</div>
        ) : (
          providers.map((p) => <ProviderCard key={p._id} data={p} />)
        )}
      </div>
    </div>
  );
}

export default Providers;
