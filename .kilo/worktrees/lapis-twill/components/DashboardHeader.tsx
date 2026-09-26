"use client"
import ApiClient from '@/lib/API';
import { User } from 'lucide-react'
import React, { useEffect } from 'react'
import { toast } from 'react-toastify';

function DashboardHeader() {
    const [data, setData] = React.useState<any>({});

  useEffect(() => {
    getMyData();
  }, []);
  const getMyData = async () => {
    try {
      const res: any = await ApiClient.get("/me")
        .then((response) => {
          setData(response.data.user);
          console.log(response.data.user);
        })
        .catch((error) => {
          toast.error("Failed to fetch data");
          console.log("Error: ===== ", error);
        });
    } catch (error) {
      console.log(error);
    }
  };
  return (
   <div className="flex gap-1">
              <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                <User size={18} />
              </div>
              <div className="">
                <p className="text-xs">Welcome</p>
                <h1 className="text-sm capitalize">{data?.name}</h1>
              </div>
            </div>
  )
}

export default DashboardHeader