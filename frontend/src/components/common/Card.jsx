import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = true,
  padding = 'p-6'
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
      className={`bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 ${padding} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
