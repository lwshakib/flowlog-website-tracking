"use client";
import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 px-8 py-20 text-center text-zinc-100 shadow-2xl border border-zinc-800/50"
        >
          {/* Enhanced decorative elements for a premium feel */}
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px] mix-blend-screen" />
          <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px] mix-blend-screen" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl text-white">
              Ready to see FlowLog in action?
            </h2>
            <p className="mx-auto mb-10 text-lg md:text-xl text-zinc-400 leading-relaxed">
              Join thousands of teams using FlowLog to understand their users and build better
              products. Start your 14-day free trial today.
            </p>
            <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-14 px-10 text-lg font-bold bg-white text-zinc-950 hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 rounded-2xl"
              >
                <Link href="/sign-up">Get Started Now</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 border-zinc-700 bg-zinc-900/50 backdrop-blur-sm px-10 text-lg font-semibold text-white hover:bg-zinc-800 hover:text-white transition-all rounded-2xl"
              >
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
