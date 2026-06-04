import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Module-level cache so we don't re-fetch on every component mount
let _cache = null;
let _fetching = false;
const _listeners = new Set();

const notify = (data) => {
  _cache = data;
  _listeners.forEach((fn) => fn(data));
};

export const clearPermissionCache = () => { _cache = null; };

const usePermission = () => {
  const [permissions, setPermissions] = useState(_cache);

  useEffect(() => {
    _listeners.add(setPermissions);
    if (_cache) {
      setPermissions(_cache);
    } else if (!_fetching) {
      _fetching = true;
      const token = localStorage.getItem("token");
      const url = process.env.REACT_APP_BACKEND;
      axios
        .get(`${url}admin/permissions/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => notify(r.data.data))
        .catch(() => notify(null))
        .finally(() => { _fetching = false; });
    }
    return () => _listeners.delete(setPermissions);
  }, []);

  // superAdmin always has full access
  const can = useCallback(
    (page, action) => {
      if (!permissions) return false;
      if (permissions.designation === "superAdmin") return true;
      return !!(permissions.permissions?.[page]?.[action]);
    },
    [permissions]
  );

  const isSuperAdmin = permissions?.designation === "superAdmin";
  const isLoaded = permissions !== null && permissions !== undefined;

  return { can, isSuperAdmin, isLoaded, rawPermissions: permissions?.permissions || {} };
};

export default usePermission;
