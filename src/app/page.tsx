"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import {
  Loader2, Mail, Menu, X, ArrowRight, ChevronDown,
  Users, TrendingUp, ShieldCheck, Star,
} from 'lucide-react';
import Link from 'next/link';
import { HomeChatWidget } from '@/components/HomeChatWidget';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { currentUser, isLoading } = useAppContext();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#5b4fa8]" />
          <p className="text-sm text-gray-500 font-medium">Loading BLMC Connect…</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'How to Join', href: '#how-to-join' },
    { label: 'About', href: '#about' },
  ];

  const services = [
    {
      icon: '💰',
      iconBg: 'bg-blue-50',
      iconBorder: 'border-blue-100',
      accent: '#3b82f6',
      title: 'Loan Services',
      desc: 'Affordable loans for livestock production, farm inputs, and livelihood improvement with flexible repayment options.',
    },
    {
      icon: '🌾',
      iconBg: 'bg-red-50',
      iconBorder: 'border-red-100',
      accent: '#c0392b',
      title: 'Supply & Feeds Program',
      desc: 'Quality feeds, veterinary supplies, and farm inputs at cooperative prices through our supply member program.',
    },
    {
      icon: '🏦',
      iconBg: 'bg-emerald-50',
      iconBorder: 'border-emerald-100',
      accent: '#10b981',
      title: 'Savings & Share Capital',
      desc: 'Build personal savings through share capital contributions with annual patronage refunds and dividends.',
    },
    {
      icon: '📚',
      iconBg: 'bg-amber-50',
      iconBorder: 'border-amber-100',
      accent: '#f59e0b',
      title: 'Training & Seminars',
      desc: 'Regular programs on financial management, biosecurity, and cooperative governance for all members.',
    },
    {
      icon: '📊',
      iconBg: 'bg-purple-50',
      iconBorder: 'border-purple-100',
      accent: '#5b4fa8',
      title: 'Production Monitoring',
      desc: 'The body helps plot/monitor production plans and harvest data through our digital logging system.',
    },
    {
      icon: '🤝',
      iconBg: 'bg-indigo-50',
      iconBorder: 'border-indigo-100',
      accent: '#6366f1',
      title: 'Membership Benefits',
      desc: 'Priority access to programs, financial assistance, and community support networks for all members.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Submit Application',
      desc: 'Fill out the membership inquiry form with your personal and farm information.',
    },
    {
      step: '02',
      title: 'Attend Interview',
      desc: 'Attend the cooperative membership orientation and interview scheduled by the cooperative.',
    },
    {
      step: '03',
      title: 'Submit Documents',
      desc: 'Submit required documents including the PDF membership form and ₱500 membership fee.',
    },
    {
      step: '04',
      title: 'Get Approved',
      desc: 'Receive your member ID and start enjoying all cooperative benefits.',
    },
  ];

  const aboutCards = [
    {
      icon: '🎯',
      gradient: 'from-blue-500 to-blue-600',
      title: 'Our Mission',
      desc: 'Implement programs and services that will address the modern system of animal husbandry, which will uplift the social conditions of the members and the community.',
      list: null,
    },
    {
      icon: '👁️',
      gradient: 'from-red-500 to-red-600',
      title: 'Our Vision',
      desc: 'Leading Cooperative in Eastern Mindoro that united, strengthen the Livestock Sector in collaboration of the members and community.',
      list: null,
    },
    {
      icon: '💚',
      gradient: 'from-emerald-500 to-emerald-600',
      title: 'Our Goals',
      desc: null,
      list: [
        'Improve the standard of living of the members thru various cooperative services.',
        'Promote the proper marketing of products.',
        'Protect the members against exploitative buyers.',
        'Improve the breed of pigs and other livestock.',
        'Have a constant supply of live pigs, fresh meat, and processed meat approved by the FDA.',
        'Provide livelihood to members and the community.',
        'Help the members with livestock farming.',
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2f5] font-sans">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-gray-100 shadow-sm overflow-hidden bg-white flex items-center justify-center shrink-0">
              <img
                src="/blmc-logo.png"
                alt="BLMC"
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="leading-tight">
              <p className="font-bold text-sm text-gray-900 leading-none">Bansud Livestock</p>
              <p className="text-[10px] font-semibold" style={{ color: '#c0392b' }}>
                Multi-Purpose Cooperative
              </p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors relative group"
              >
                {l.label}
                <span
                  className="absolute -bottom-0.5 left-0 w-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-full"
                  style={{ background: '#5b4fa8' }}
                />
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Login dropdown — desktop */}
            <div className="hidden sm:block relative group">
              <button
                className="flex items-center gap-2 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all shadow-md hover:shadow-lg hover:opacity-95 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #c0392b, #5b4fa8)' }}
              >
                <ArrowRight className="w-4 h-4" />
                Login
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors rounded-xl mx-1"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">Admin Login</span>
                </Link>
                <Link
                  href="/member-login"
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors rounded-xl mx-1"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-[#c0392b]" />
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">Member Login</span>
                </Link>
              </div>
            </div>
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 shadow-lg animate-fade-in">
            {navLinks.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Admin Login
              </Link>
              <Link href="/member-login" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <Users className="w-4 h-4 text-[#c0392b]" /> Member Login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f0f2f5 0%, #eef0f8 60%, #fdf0f0 100%)' }}
      >
        {/* Background decoration */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 translate-x-1/3 -translate-y-1/4"
            style={{ background: 'radial-gradient(circle, #5b4fa8, transparent)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 -translate-x-1/4 translate-y-1/4"
            style={{ background: 'radial-gradient(circle, #c0392b, transparent)' }}
          />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(#5b4fa8 1px, transparent 1px), linear-gradient(90deg, #5b4fa8 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-2xl space-y-6 sm:space-y-8">
            {/* CDA badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-100">
              <ShieldCheck className="w-4 h-4" style={{ color: '#5b4fa8' }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#5b4fa8' }}>
                CDA Registered Cooperative
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                <span className="text-gray-900">Bansud</span>
                <br />
                <span style={{ color: '#c0392b' }}>Livestock</span>
                <br />
                <span style={{ color: '#5b4fa8' }}>Cooperative</span>
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-md">
              Empowering livestock raisers and farmers in Bansud, Oriental Mindoro through shared resources, financial services, and community support.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-white text-sm font-bold px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:opacity-95 active:scale-[0.98] transition-all"
                style={{ background: 'linear-gradient(135deg, #c0392b 0%, #5b4fa8 100%)' }}
              >
                <Star className="w-4 h-4" />
                Become a Member
              </Link>
              <a
                href="#services"
                className="inline-flex items-center gap-2 border-2 border-gray-200 bg-white text-gray-700 text-sm font-semibold px-7 py-3.5 rounded-full hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronDown className="w-4 h-4" />
                Our Services
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 sm:gap-10 pt-2">
              <div className="text-center">
                <p className="font-extrabold text-lg leading-none" style={{ color: '#5b4fa8' }}>CDA</p>
                <p className="text-xs text-gray-400 mt-1">Registered</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <p className="font-extrabold text-lg leading-none text-emerald-500">100%</p>
                <p className="text-xs text-gray-400 mt-1">Member-Owned</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <p className="font-extrabold text-lg leading-none text-gray-800">6+</p>
                <p className="text-xs text-gray-400 mt-1">Services</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <span className="text-xs text-gray-500 font-medium">Scroll</span>
          <ChevronDown className="w-4 h-4 text-gray-500 animate-bounce" />
        </div>
      </section>

      {/* ── Services ───────────────────────────────────────────────────────── */}
      <section id="services" className="py-20 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
              style={{ background: '#f0edf8', color: '#5b4fa8' }}
            >
              Our Services
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              What BLMC Offers
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
              A range of services designed to support members' livelihoods and financial growth.
            </p>
          </div>

          {/* Service cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="group bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default"
              >
                <div
                  className={`w-12 h-12 ${service.iconBg} border ${service.iconBorder} rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  {service.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{service.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{service.desc}</p>
                <div
                  className="mt-5 flex items-center gap-1 text-xs font-semibold transition-colors"
                  style={{ color: service.accent }}
                >
                  Learn more <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to Join ────────────────────────────────────────────────────── */}
      <section
        id="how-to-join"
        className="py-20 sm:py-24 px-4 sm:px-6"
        style={{ background: 'linear-gradient(135deg, #1a2240 0%, #1e2a4a 50%, #2d3f6e 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 bg-white/10 text-blue-300">
              Membership
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              How to Become a Member
            </h2>
            <p className="text-blue-200 max-w-xl mx-auto text-base leading-relaxed">
              Follow these simple steps to join the Bansud Livestock Multi-Purpose Cooperative.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center text-center gap-4">
                {/* Connector line (desktop) */}
                {i < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="hidden lg:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px bg-white/20"
                  />
                )}
                {/* Step number */}
                <div
                  className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  {s.step}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-blue-200 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex justify-center mt-14">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white font-bold text-sm px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:bg-gray-50 active:scale-[0.98] transition-all"
              style={{ color: '#1e2a4a' }}
            >
              <Users className="w-4 h-4" />
              Apply for Membership Now
            </Link>
          </div>
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 sm:py-24 px-4 sm:px-6 bg-[#f8f9fa]">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
              style={{ background: '#f0edf8', color: '#5b4fa8' }}
            >
              About Us
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              About BLMC
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-base leading-relaxed">
              Bansud Livestock Multi-Purpose Cooperative is a CDA-registered cooperative dedicated to empowering
              livestock raisers and farmers in Bansud, Oriental Mindoro through collective action and shared resources.
            </p>
          </div>

          {/* Mission / Vision / Goals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-8">
            {aboutCards.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-7 sm:p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-md`}
                >
                  {item.icon}
                </div>
                <h3 className="font-extrabold text-gray-900 mb-3 text-lg">{item.title}</h3>
                {item.desc && (
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                )}
                {item.list && (
                  <ul className="space-y-2.5 mt-1">
                    {item.list.map((g, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500">
                        <span
                          className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 text-white"
                          style={{ background: '#10b981' }}
                        >
                          {i + 1}
                        </span>
                        <span className="leading-snug">{g}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* CDA Registration card */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100 text-center max-w-2xl mx-auto">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
              style={{ background: '#f0edf8', color: '#5b4fa8' }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Registered with the Cooperative Development Authority
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-semibold text-gray-800 mb-2">
              <span>CDA Reg. No. 9520-04000617</span>
              <span className="text-gray-300">·</span>
              <span>CIN-0107040018</span>
              <span className="text-gray-300">·</span>
              <span>TIN No. 004-972-048-000</span>
            </div>
            <p className="text-sm text-gray-400 mb-7">Poblacion, Bansud, Oriental Mindoro</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-white text-sm font-bold px-7 py-3 rounded-full shadow-md hover:shadow-lg hover:opacity-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #5b4fa8, #7c6fd4)' }}
            >
              <Mail className="w-4 h-4" />
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-sm"
                style={{ background: 'linear-gradient(135deg, #5b4fa8, #7c6fd4)' }}
              >
                B
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">© 2025 BLMC Management System</p>
                <p className="text-xs text-gray-400">Built with XianFire Framework at Mindoro State University</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-5 text-sm text-gray-400">
              <a href="#about" className="hover:text-gray-700 transition-colors font-medium">About</a>
              <span className="text-gray-200">|</span>
              <a href="#" className="hover:text-gray-700 transition-colors font-medium">Home</a>
              <span className="text-gray-200">|</span>
              <span className="font-semibold" style={{ color: '#5b4fa8' }}>v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Floating AI Chat Widget ─────────────────────────────────────────── */}
      <HomeChatWidget />
    </div>
  );
}
