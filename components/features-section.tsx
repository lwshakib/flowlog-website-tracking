"use client";
import React from "react";
import { motion } from "framer-motion";
import { Activity, Layout, ShieldCheck, Zap } from "lucide-react";

const features = [
  {
    name: "Real-time Tracking",
    description: "Watch your users interact with your site in real-time. See every click, scroll, and navigation event as it happens.",
    icon: Activity,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    name: "Flow Visualization",
    description: "Understand the paths your users take. Our powerful flow diagrams help you identify bottlenecks and optimize conversion paths.",
    icon: Zap,
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    name: "Privacy First",
    description: "Built with privacy in mind. We are fully GDPR and CCPA compliant, ensuring your users' data stays safe and anonymous.",
    icon: ShieldCheck,
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    name: "Easy Integration",
    description: "Install with a single line of code. Support for Next.js, React, Vue, and plain HTML. Get started in less than 2 minutes.",
    icon: Layout,
    color: "bg-purple-500/10 text-purple-500",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Powerful Features for Modern Teams
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Everything you need to understand your users and grow your business.
            All in one beautiful, easy-to-use platform.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-2xl border bg-secondary/10 hover:bg-secondary/20 transition-colors duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.name}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
