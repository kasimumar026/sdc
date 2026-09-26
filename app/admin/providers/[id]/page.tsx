"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

function ProviderDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/providers/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load");
        setProvider(json.provider);
      } catch (err: any) {
        toast.error(err?.message || String(err));
      }
    };
    load();
  }, [id]);

  const onDelete = async () => {
    if (!confirm("Delete this provider?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/providers/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to delete");
      toast.success("Provider deleted");
      router.push("/admin/providers");
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!provider) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        Back
      </Button>
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-2">{provider.name}</h1>
        <p className="text-sm text-green-700 mb-4">{provider.url}</p>
        <p className="text-sm text-gray-700 mb-4">
          Service: {provider.service}
        </p>

        {/* networks ids */}
        <div className="py-5 bg-green-50 px-5 mb-4">
          <p className="text-sm text-gray-700 mb-1">Network IDs:</p>
          <ul className="list-disc list-inside text-sm text-gray-700">
            <li>
              MTN: <span className="font-bold">{provider.mtn}</span>
            </li>
            <li>
              Glo: <span className="font-bold">{provider.glo}</span>
            </li>
            <li>
              Airtel: <span className="font-bold">{provider.airtel}</span>
            </li>
            <li>
              9mobile:{" "}
              <span className="font-bold">{provider.nineMobile}</span>
            </li>
          </ul>
        </div>
        <div className="flex gap-2">
          <Button onClick={onDelete} variant="destructive" disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <p className="mt-6 text-md">
        Notice that if delete a provider, all the data attached to it will not
        work again
      </p>
    </div>
  );
}

export default ProviderDetails;
