"use client";

import Header from "./components/Header";
import Hero from "./components/Hero";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <Footer />
    </div>
  );
}
