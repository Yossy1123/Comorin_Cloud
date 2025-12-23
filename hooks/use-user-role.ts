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
        console.log("🔍 [useUserRole] ロール取得開始");
        const response = await fetch("/api/user/role");
        
        if (response.ok) {
          const data = await response.json();
          console.log("✅ [useUserRole] ロール取得成功:", data);
          setRole(data.role);
        } else {
          console.error("❌ [useUserRole] レスポンスエラー:", response.status, response.statusText);
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ [useUserRole] エラー詳細:", errorData);
          setRole(null);
        }
      } catch (error) {
        console.error("❌ [useUserRole] ネットワークエラー:", error);
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



