import React, { useState, useEffect, useCallback } from "react";
import {
  Database,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Hash,
  RefreshCw,
} from "lucide-react";
import { getApiBase } from "../../utils/api";

const LIVE_REFRESH_MS = 30_000;

const CookieConsentLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendOffline, setBackendOffline] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(() => {
    setRefreshing(true);
    fetch(`${getApiBase()}/api/cookie-consent-logs`)
      .then((res) => {
        if (!res.ok) {
          console.warn(`Server returned ${res.status}`);
          return res.json().then((err) => {
            throw new Error(err.details || err.error || "Unknown error");
          });
        }
        return res.json();
      })
      .then((data) => {
        // Ensure data is an array
        if (Array.isArray(data)) {
          setLogs(data);
        } else if (data.error) {
          console.error("API error:", data.details || data.error);
          setLogs([]);
        } else {
          console.warn("Unexpected response format:", data);
          setLogs([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setLogs([]);
        setBackendOffline(true);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
        setLastSynced(new Date());
      });
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (backendOffline) return;
    const t = setInterval(fetchLogs, LIVE_REFRESH_MS);
    return () => clearInterval(t);
  }, [fetchLogs, backendOffline]);

  const getChoiceBadge = (choice) => {
    switch (choice) {
      case "accept_all":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold ring-1 ring-green-200">
            ACCEPT ALL
          </span>
        );
      case "decline_all":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold ring-1 ring-red-200">
            DECLINE ALL
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold ring-1 ring-blue-200">
            CUSTOM
          </span>
        );
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading transparency logs...
      </div>
    );

  if (backendOffline)
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-2">Cannot load logs — backend offline.</p>
        <p className="text-sm text-gray-400">Run <code className="bg-gray-100 px-1 rounded">npm run dev:admin</code> to enable.</p>
      </div>
    );

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-hbm-purple" />
          <h3 className="font-black text-hbm-dark uppercase tracking-wider">
            Cookie Compliance Logs (2026)
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {lastSynced && (
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              Synced {lastSynced.toLocaleTimeString()}
            </span>
          )}
          <button
            type="button"
            onClick={fetchLogs}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <span className="text-xs text-gray-400 font-medium">
            Last 100 choices · Live sync
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-[10px] uppercase tracking-widest text-gray-400 font-black bg-gray-50/30">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Choice</th>
              <th className="px-6 py-4">Detailed Settings</th>
              <th className="px-6 py-4">Anonymized IP (Hash)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map((log) => {
              let settings = {};
              try {
                if (typeof log.settings === "string") settings = JSON.parse(log.settings);
                else if (log.settings && typeof log.settings === "object") settings = log.settings;
                else if (log.data) settings = typeof log.data === "string" ? JSON.parse(log.data) : log.data;
              } catch (_) {}
              const choice = log.choice || "custom";
              const hashedIp = log.hashedIp || "—";
              return (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {(log.timestamp && new Date(log.timestamp).toLocaleString()) || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getChoiceBadge(choice)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {settings.essential && (
                        <ShieldCheck
                          className="w-4 h-4 text-green-500"
                          title="Essential"
                        />
                      )}
                      {settings.analytics ? (
                        <ShieldCheck
                          className="w-4 h-4 text-blue-500"
                          title="Analytics"
                        />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-gray-300" />
                      )}
                      {settings.marketing ? (
                        <ShieldCheck
                          className="w-4 h-4 text-red-500"
                          title="Marketing"
                        />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-mono text-[10px] text-gray-400">
                      <Hash className="w-3 h-3" />
                      {hashedIp && hashedIp !== "—" ? `${hashedIp.substring(0, 16)}...` : "—"}
                    </div>
                  </td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-12 text-center text-gray-400 italic"
                >
                  No consent logs recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CookieConsentLogs;
