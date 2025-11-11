"use client";
import React from 'react';
import Link from 'next/link';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: 'primary' | 'ghost';
  children: React.ReactNode;
};

export default function Button({ href, variant = 'primary', children, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium';
  const classes = variant === 'primary' ? `${base} bg-orange-500 text-white hover:bg-orange-600` : `${base} bg-gray-100 text-gray-700 hover:bg-gray-200`;

  if (href) {
    // Extract safe props from button props and pass explicitly to Link
    const { disabled, title } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
    // Note: avoid spreading arbitrary button props onto Link to keep types safe.
    return (
      <Link href={href} className={classes} aria-disabled={disabled ? 'true' : undefined} title={title}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
