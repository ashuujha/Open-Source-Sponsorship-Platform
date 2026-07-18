"use client";

import { useEventFeed } from "@/hooks/useEventFeed";
import { Activity, ExternalLink, Calendar, Database, Shield, Zap } from "lucide-react";

export default function FeedPage() {
  const { events, isLoading } = useEventFeed();

  const getEventIcon = (type: string) => {
    switch (type) {
      case "project_registered":
        return <Database className="h-4 w-4 text-cyan-400" />;
      case "project_verified":
        return <Shield className="h-4 w-4 text-green-400" />;
      case "project_sponsored":
        return <Zap className="h-4 w-4 text-yellow-400" />;
      default:
        return <Activity className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 text-left">
      <div className="flex items-center justify-between border-b border-border-dark pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Live Activity Feed
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Real-time feed of sponsorships, project registrations, and milestone payouts directly from the Soroban network.
          </p>
        </div>

        {/* Live Pulse Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Live Poller Active</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-32 glass-panel rounded-3xl border border-border-dark">
          <div className="relative flex h-10 w-10 items-center justify-center">
            <Activity className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <span className="text-text-muted text-sm mt-4">Connecting to RPC Event Logs...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center p-20 glass-panel rounded-3xl border border-border-dark">
          <p className="text-text-muted text-sm">No events found in the recent ledgers.</p>
        </div>
      ) : (
        <div className="relative border-l border-border-dark ml-4 flex flex-col gap-8">
          {events.map((event, index) => (
            <div key={event.id} className="relative pl-8 group animate-fade-in">
              {/* Event Dot Icon */}
              <div className="absolute -left-[17px] top-1 flex h-8 w-8 items-center justify-center rounded-xl bg-surface-dark border border-border-dark text-white group-hover:border-primary transition-colors">
                {getEventIcon(event.type)}
              </div>

              {/* Event Content */}
              <div className="glass-panel p-5 rounded-2xl border border-border-dark flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {event.type.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {event.contractType}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-200">{event.description}</p>
                </div>

                <div className="flex items-center gap-4 sm:self-center">
                  <span className="text-[11px] text-text-muted flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {event.timestamp}
                  </span>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${event.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-primary/20 hover:border-primary/30 text-text-muted hover:text-white transition-all"
                    title="View on Stellar.expert"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
