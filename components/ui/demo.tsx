import React from 'react';
import { GlowCard } from "./spotlight-card";

export function Default(){
  return(
    <div className="w-screen h-screen flex flex-row items-center justify-center gap-10 custom-cursor bg-neutral-950 p-8">
      <GlowCard glowColor="blue">
        <div className="flex flex-col justify-between h-full text-white">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-blue-400">Project 01</span>
            <h3 className="text-xl font-bold">Quantum Core</h3>
            <p className="text-sm text-neutral-400">High performance distributed graph database engine.</p>
          </div>
          <div className="text-xs text-neutral-500">Explore System &rarr;</div>
        </div>
      </GlowCard>
      <GlowCard glowColor="purple">
        <div className="flex flex-col justify-between h-full text-white">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-purple-400">Project 02</span>
            <h3 className="text-xl font-bold">Neural Nexus</h3>
            <p className="text-sm text-neutral-400">Autonomous multi-agent orchestration architecture.</p>
          </div>
          <div className="text-xs text-neutral-500">Explore System &rarr;</div>
        </div>
      </GlowCard>
      <GlowCard glowColor="red">
        <div className="flex flex-col justify-between h-full text-white">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-red-400">Project 03</span>
            <h3 className="text-xl font-bold">Flame Engine</h3>
            <p className="text-sm text-neutral-400">Real-time low-latency financial fraud telemetry.</p>
          </div>
          <div className="text-xs text-neutral-500">Explore System &rarr;</div>
        </div>
      </GlowCard>
    </div>
  );
};
