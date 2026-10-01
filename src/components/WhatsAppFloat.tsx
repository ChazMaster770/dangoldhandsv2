"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { waLink } from "@/lib/constants";

export default function WhatsAppFloat() {
  return (
    <motion.a
      href={waLink("היי דן! הגעתי מהאתר — אשמח לעזרה עם מוצרי פוקימון TCG.")}
      target="_blank"
      rel="noreferrer"
      aria-label="דברו עם דן בוואטסאפ"
      className="group fixed bottom-5 left-5 z-40"
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366]/50 blur-lg animate-glow-pulse" />
      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#2be072] to-[#1faa53] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.7)] transition-transform group-hover:scale-110">
        <MessageCircle size={26} />
        <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-night bg-emerald-300" />
      </span>
      <span className="pointer-events-none absolute bottom-1/2 right-full me-3 hidden translate-y-1/2 rounded-full bg-[#0c0c24] px-4 py-2 text-sm font-bold whitespace-nowrap text-white/85 opacity-0 shadow-xl ring-1 ring-white/10 transition-all duration-300 group-hover:opacity-100 md:block">
        דן זמין — כתבו לנו
      </span>
    </motion.a>
  );
}
