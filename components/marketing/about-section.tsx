"use client";
import React from "react";
import { motion } from "motion/react";
import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full transition-all duration-500 group-hover:bg-primary/30" />
              <div className="relative rounded-2xl border border-border/50 shadow-2xl overflow-hidden bg-background">
                <Image
                  src="/images/marketing/dark.png"
                  alt="FlowLog Analytics Dashboard"
                  width={2700}
                  height={1440}
                  className="w-full h-auto hidden dark:block"
                />
                <Image
                  src="/images/marketing/light.png"
                  alt="FlowLog Analytics Dashboard"
                  width={2700}
                  height={1440}
                  className="w-full h-auto dark:hidden"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for Modern Product Teams</h2>
            <p className="text-muted-foreground text-lg mb-8">
              FlowLog provides the clarity you need to optimize your user experience. Real-time
              insights and beautiful visualizations allow you to act on data, not just collect it.
            </p>
            <div className="space-y-6">
              {[
                {
                  title: "Our Mission",
                  content:
                    "To provide product teams with clear, actionable insights that lead to better user experiences.",
                },
                {
                  title: "Developer Experience",
                  content:
                    "We believe analytics shouldn't be a chore. Our SDK is designed to be lightweight and intuitive.",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-1.5 h-auto bg-primary rounded-full shrink-0" />
                  <div>
                    <h4 className="font-semibold text-xl mb-2">{item.title}</h4>
                    <p className="text-muted-foreground">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
