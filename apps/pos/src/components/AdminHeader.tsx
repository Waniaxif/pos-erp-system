"use client";

import { useEffect, useState } from "react";
import { Button, Typography, Tag } from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  DatabaseOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import type { UserRole } from "@/store/api/apiSlice";

const { Title } = Typography;

interface ProfileState {
  _id: string; // <-- Add this
  name: string;
  role: UserRole;
}

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<ProfileState | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadToken = () => {
      const token = Cookies.get("pos_admin_token");
      if (token && isMounted) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setProfile(payload);
        } catch (error) {
          console.error("Token decoding failed.");
        }
      }
    };
    loadToken();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    Cookies.remove("pos_admin_token");
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between bg-white px-8 py-4 shadow-sm border-b border-gray-100">
      <div className="flex items-center gap-4">
        <Title level={4} className="!mb-0">
          Control Center
        </Title>
        {profile?.role && (
          <Tag
            color={
              profile.role === "ADMIN"
                ? "red"
                : profile.role === "MANAGER"
                  ? "orange"
                  : "blue"
            }
          >
            {profile.role}
          </Tag>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Navigation Buttons based on routing context */}
        <Link href="/">
          <Button type="text" icon={<HomeOutlined />}>
            Terminal
          </Button>
        </Link>

        {pathname !== "/admin/inventory" && (
          <Link href="/admin/inventory">
            <Button
              type="default"
              icon={<DatabaseOutlined />}
              className="border-indigo-200 text-indigo-600"
            >
              Inventory Ledger
            </Button>
          </Link>
        )}

        <Link href="/admin/profile">
          <span className="text-gray-700 font-semibold text-sm flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors">
            <UserOutlined
              className={
                pathname === "/admin/profile"
                  ? "text-indigo-600"
                  : "text-gray-400"
              }
            />
            {profile?.name || "Terminal Staff"}
          </span>
        </Link>

        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
