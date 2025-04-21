"use client";
import React from 'react';
import AuthForm from '@/components/forms/AuthForm';

export default function SignInPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your VibeBuild account
          </p>
        </div>
        <AuthForm mode="signin" />
      </div>
    </div>
  );
}
