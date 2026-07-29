import React from 'react';
import { motion } from 'motion/react';
import { Construction } from 'lucide-react';

export default function PlaceholderPage({ title, description }: { title: string, description: string }) {
  return (
    <div className="max-w-7xl mx-auto pb-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-24 h-24 bg-gold-500/10 rounded-full flex items-center justify-center text-gold-500 mb-6"
      >
        <Construction size={48} />
      </motion.div>
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl font-bold font-heading text-stone-900 mb-2"
      >
        {title}
      </motion.h1>
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-stone-500 max-w-md"
      >
        {description}
      </motion.p>
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 px-6 py-3 bg-black text-gold-500 font-bold rounded-full hover:bg-gold-500 hover:text-black transition-colors shadow-md shadow-gold-500/20"
      >
        Notify When Ready
      </motion.button>
    </div>
  );
}
