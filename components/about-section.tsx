"use client";
import React from "react";
import { motion } from "framer-motion";
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
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <Image
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                alt="Analytics Dashboard"
                width={800}
                height={600}
                className="relative rounded-2xl border shadow-2xl"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for the Modern Web</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Flowlog was born out of a simple need: to understand how users actually interact with
              complex web applications without being overwhelmed by raw data.
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
