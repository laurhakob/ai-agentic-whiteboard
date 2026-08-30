"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/UserDetailContext";

function Provider({ children }: { children: React.ReactNode }) {
  const [userDetail, setUserDetail] = useState<any>();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      CreateNewUser();
    }
  }, [isLoaded, user]);

  const CreateNewUser = async () => {
    try {
      const result = await axios.post("/api/users");
      console.log(result.data);
      setUserDetail(result.data);
    } catch (error) {
      console.error("Failed to create/fetch user:", error);
    }
  };

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <div>{children}</div>
    </UserDetailContext.Provider>
  );
}

export default Provider;