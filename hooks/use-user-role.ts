/**
 * ユーザーロールを取得するカスタムフック
 */

'use client'

import { useEffect, useState } from "react";

export type UserRole = "ADMIN" | "SUPPORTER" | null;

interface UserRoleState {
  role: UserRole;
  isLoading: boolean;
  isAdmin: boolean;
  isSupporter: boolean;
}

/**
 * ユーザーロールを取得
 * サーバーから現在のユーザーのロールを取得
 */
export function useUserRole(): UserRoleState {
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const response = await fetch("/api/user/role");
        if (response.ok) {
          const data = await response.json();
          setRole(data.role);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("ユーザーロール取得エラー:", error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRole();
  }, []);

  return {
    role,
    isLoading,
    isAdmin: role === "ADMIN",
    isSupporter: role === "SUPPORTER",
  };
}


