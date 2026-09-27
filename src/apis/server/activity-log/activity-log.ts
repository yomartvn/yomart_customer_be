import axios from "axios";

export type ActivityLogPayload = {
  seller_id?: number;
  actor_id?: number;
  actor_name?: string;
  actor_type?: string;
  module: string;
  module_name?: string;
  action: string;
  action_name?: string;
  summary?: string;
  entity_type?: string;
  entity_id?: string | number;
  entity_code?: string;
  old_data?: Record<string, any> | null;
  new_data?: Record<string, any> | null;
  ip?: string;
  user_agent?: string;
  request_id?: string;
  source?: string;
  /** seller | platform | both — omit để BE tự suy luận */
  audience?: "seller" | "platform" | "both";
};

/**
 * Fire-and-forget ghi activity log — không throw, không block luồng chính.
 */
export const writeActivityLog = (payload: ActivityLogPayload): void => {
  const baseUrl = (process.env.ACTIVITY_LOG_API_URL || "").replace(/\/$/, "");
  const apiVersion = (process.env.API_VERSION || "/api/v1").replace(/\/$/, "");
  const internalKey = process.env.INTERNAL_API_KEY;

  if (!baseUrl || !internalKey) {
    return;
  }

  const url = `${baseUrl}${apiVersion}/internal/logs`;

  setImmediate(() => {
    void axios
      .post(url, payload, {
        headers: {
          Authorization: `Bearer ${internalKey}`,
          "Content-Type": "application/json",
        },
        timeout: 2000,
      })
      .catch(() => {
        /* ignore */
      });
  });
};

export const writeCustomerActivityLog = (
  partial: Omit<ActivityLogPayload, "module" | "module_name" | "source"> & {
    module?: string;
    module_name?: string;
    source?: string;
  }
): void => {
  writeActivityLog({
    module: "customer",
    module_name: "Khách hàng",
    source: "customer",
    actor_type: partial.actor_type || "seller",
    ...partial,
  });
};
