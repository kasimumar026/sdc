"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function DataTable() {
  const [data, setData]: any = useState([]);
  const [loading, setLoading] = useState(false);
  const [fullData, setFullData]: any = useState([]);
  const [networks, setNetworks] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const fetchData = async (provider?: string, category?: string) => {
    setLoading(true);
    try {
      let url = "/api/admin/data-plans";
      const params: string[] = [];
      if (provider) params.push(`provider=${encodeURIComponent(provider)}`);
      if (category) params.push(`category=${encodeURIComponent(category)}`);
      if (params.length) url += `?${params.join("&")}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json?.ok) setData(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch all once to derive provider list
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/data-plans");
        const json = await res.json();
        if (json?.ok) {
          setFullData(json.data || []);
          const uniq: any = Array.from(
            new Set((json.data || []).map((p: any) => p.provider)),
          ).filter(Boolean);
          setNetworks(uniq);
          // initial load: show all
          setData(json.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    try {
      const res = await fetch(`/api/admin/data-plans/${id}`, {
        method: "DELETE",
      });
      const j = await res.json();
      if (j.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="p-6">
      <div className="flex items-end mb-3 justify-end">
        <Link href="/admin" className="">
          <Button variant="outline">
            <X /> Back
          </Button>
        </Link>
      </div>
      <header className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-xl text-primary">Data Table</h1>
        <Link
          href="/admin/data-table/create"
          className="bg-primary text-white rounded-md"
        >
          <Button>
            <Plus /> Create
          </Button>
        </Link>
      </header>

      {/* Filters: Provider and Category */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Select
            value={selectedProvider}
            onValueChange={async (v: string) => {
              setSelectedProvider(v);
              setSelectedCategory("");
              // derive categories from fullData for this provider
              const cats: any = Array.from(
                new Set(
                  (fullData || [])
                    .filter((p: any) => p.provider === v)
                    .map((p: any) => p.category),
                ),
              ).filter(Boolean);
              setCategories(cats);
              // fetch filtered rows
              await fetchData(v);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Providers</SelectLabel>
                {/* <SelectItem value="all">All</SelectItem> */}
                {networks.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={selectedCategory}
            onValueChange={async (v: string) => {
              setSelectedCategory(v);
              // fetch with both provider and category if provider selected
              await fetchData(selectedProvider || undefined, v || undefined);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                {/* <SelectItem value="all">All</SelectItem> */}
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c.replace(/_/g, " ").toUpperCase()}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              setSelectedProvider("");
              setSelectedCategory("");
              setCategories([]);
              await fetchData();
            }}
          >
            Clear filters
          </Button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-6">
        {loading ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : (
          <div className="overflow-x-auto bg-card rounded-lg p-4">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="px-2 py-2">Provider</th>
                  <th className="px-2 py-2">Category</th>
                  <th className="px-2 py-2">ID</th>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Buying</th>
                  <th className="px-2 py-2">Amount</th>
                  <th className="px-2 py-2">Validity</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-sm text-slate-500 py-4 text-center"
                    >
                      No data plans
                    </td>
                  </tr>
                )}
                {data.map((d: any) => (
                  <tr key={d._id} className="border-t">
                    <td className="px-2 py-3 uppercase">{d.provider}</td>
                    <td className="px-2 py-3 uppercase">{d.category}</td>
                    <td className="px-2 py-3">{d.externalId ?? "—"}</td>
                    <td className="px-2 py-3">{d.name}</td>
                    <td className="px-2 py-3">{d.buyingPrice ?? "—"}</td>
                    <td className="px-2 py-3">N{d.amount}</td>
                    <td className="px-2 py-3">{d.validity}</td>
                    <td className="px-2 py-3">
                      {d.publish ? "Published" : "Draft"}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/data-table/${d._id}`}>
                          <Button size="sm" variant="outline">
                            <Edit2 />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(d._id)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default DataTable;
