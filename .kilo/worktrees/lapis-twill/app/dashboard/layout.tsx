import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 flex-col gap-4  pt-0 bg-gray-50">
      {children}
      <div className="px-6 text-sm text-center pt-12">

        <Link href="/dashboard/contact" className="text-blue-500 ">
          Contact Us
        </Link>
      </div>
    </div>
  );
}
