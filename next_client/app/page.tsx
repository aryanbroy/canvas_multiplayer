"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Paintbrush, Users, Zap, Globe, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  // useEffect(() => {
  //   const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  //   if (prefersDark.matches) {
  //     setDarkMode(true);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (darkMode) {
  //     document.documentElement.classList.add("dark");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //   }
  // }, [darkMode]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b border-gray-200 dark:border-gray-800">
        <Link className="flex items-center justify-center" href="#">
          <Paintbrush className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
          <span className="font-bold">CollabCanvas</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#features"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#how-it-works"
          >
            How It Works
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#pricing"
          >
            Pricing
          </Link>
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button> */}
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Collaborate in Real-Time on a Shared Canvas
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Experience the power of creativity with our multiplayer
                    canvas. Draw, sketch, and brainstorm together in real-time,
                    no matter where you are.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" onClick={() => router.push("/rooms")}>
                    Get Started for Free
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                  <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="absolute top-2 left-2 right-2 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center space-x-2 px-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <div className="absolute inset-4 top-10 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      {/* Simulated canvas content */}
                      <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-blue-500 rounded-full" />
                      <div className="absolute bottom-1/3 right-1/3 w-20 h-20 bg-green-500 rounded-lg rotate-45" />
                      <div className="absolute top-1/2 left-1/2 w-24 h-12 bg-yellow-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              Key Features
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <Users className="h-12 w-12 mb-4 text-blue-500 dark:text-blue-400" />
                <h3 className="text-xl font-bold mb-2">
                  Real-Time Collaboration
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Work together seamlessly with multiple users on the same
                  canvas in real-time.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Zap className="h-12 w-12 mb-4 text-yellow-500 dark:text-yellow-400" />
                <h3 className="text-xl font-bold mb-2">Instant Updates</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  See changes instantly with our lightning-fast WebSocket
                  technology.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Globe className="h-12 w-12 mb-4 text-green-500 dark:text-green-400" />
                <h3 className="text-xl font-bold mb-2">
                  Cross-Platform Support
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Access your canvas from any device, anywhere in the world.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              How It Works
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold mb-2">Create a Room</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Start a new canvas or join an existing one with a simple
                  click.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold mb-2">Invite Collaborators</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Share your room link with friends or colleagues to start
                  collaborating.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2">Draw Together</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Start drawing, sketching, or brainstorming in real-time with
                  your team.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 CollabCanvas. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
