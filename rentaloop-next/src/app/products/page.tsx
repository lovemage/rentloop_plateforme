"use client";

import { productCategories, productItems } from "@/data/products";
import Image from "next/image";
import { useState } from "react";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState(
    productCategories.find((c) => c.active)?.label ?? productCategories[0]?.label
  );

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark text-text-main dark:text-white">
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full lg:w-64 lg:shrink-0 space-y-8">
          <div className="lg:hidden flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Filters</h2>
            <button className="flex items-center gap-2 text-sm font-medium text-primary">
              <span className="material-symbols-outlined">tune</span>
              顯示
            </button>
          </div>

          <div className="hidden lg:block space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-text-main">Categories</h3>
              <button
                className="text-xs font-medium text-text-secondary hover:text-primary"
                onClick={() => setSelectedCategory(productCategories[0].label)}
              >
                Clear
              </button>
            </div>
            <ul className="space-y-1">
              {productCategories.map((category) => (
                <li key={category.label}>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(category.label)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      selectedCategory === category.label
                        ? "bg-primary/10 text-text-main font-bold"
                        : "text-text-sub hover:bg-gray-100 hover:text-text-main"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {category.icon}
                    </span>
                    {category.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <hr className="hidden lg:block border-border-light dark:border-border-dark" />

          <div className="hidden lg:block space-y-4">
            <h3 className="font-bold text-text-main">價格區間 (每日)</h3>
            <div className="space-y-4 px-1">
              <div className="relative h-1 w-full rounded-full bg-border-light">
                <div className="absolute left-[10%] right-[40%] h-full rounded-full bg-primary"></div>
                <div className="absolute left-[10%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-sm" />
                <div className="absolute right-[40%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-sm" />
              </div>
              <div className="flex items-center justify-between text-sm text-text-main font-medium">
                <div className="rounded-md border border-border-light bg-white px-3 py-1">
                  $50
                </div>
                <span className="text-text-secondary">-</span>
                <div className="rounded-md border border-border-light bg-white px-3 py-1">
                  $800
                </div>
              </div>
            </div>
          </div>

          <hr className="hidden lg:block border-border-light dark:border-border-dark" />

          <div className="hidden lg:block space-y-3">
            <h3 className="font-bold text-text-main">物品狀況</h3>
            {["近全新", "狀況良好", "可接受"].map((label, idx) => (
              <label key={label} className="flex cursor-pointer items-center gap-3">
                <input
                  defaultChecked={idx === 0}
                  className="size-5 rounded border-2 border-border-light text-primary focus:ring-primary focus:ring-offset-0"
                  type="checkbox"
                />
                <span className="text-sm text-text-main">{label}</span>
              </label>
            ))}
          </div>
          <button className="hidden lg:flex w-full items-center justify-center rounded-lg border border-border-light bg-white py-2.5 text-sm font-bold text-text-main hover:bg-gray-50 transition-colors">
            Reset Filters
          </button>
        </aside>

        <section className="flex-1 flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-black px-8 py-10 md:py-14 shadow-lg isolate">
            <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2813&auto=format&fit=crop')] bg-cover bg-center opacity-40" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background-dark/90 to-transparent" />
            <div className="flex max-w-lg flex-col gap-4">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary backdrop-blur-md border border-primary/30">
                <span className="material-symbols-outlined text-[16px]">eco</span>
                Sustainability Impact
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                Don&apos;t Buy it. <span className="text-primary">Rent it.</span>
              </h1>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                Access premium gear for your next adventure without the clutter. Save money and reduce waste
                with every rental.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-main">Available Items</h2>
              <p className="text-sm text-text-sub">Showing 124 results for &quot;{selectedCategory}&quot;</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-text-sub whitespace-nowrap">Sort by:</span>
              <div className="relative">
                <select className="h-10 w-full min-w-[160px] appearance-none rounded-lg border border-border-light bg-white pl-4 pr-10 text-sm font-medium text-text-main focus:border-primary focus:ring-primary">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest Arrivals</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2.5 pointer-events-none text-text-sub text-[20px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {productItems.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-xl bg-white border border-border-light dark:border-border-dark shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/30"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/90 text-text-sub shadow-sm backdrop-blur-sm transition-colors hover:text-red-500"
                  >
                    <span className="material-symbols-outlined text-[20px]">favorite</span>
                  </button>
                  {item.status === "popular" && (
                    <div className="absolute left-3 top-3 inline-flex items-center rounded-md bg-primary px-2 py-1 text-xs font-bold text-text-main shadow-sm">
                      Popular
                    </div>
                  )}
                  {item.rating && (
                    <div className="absolute left-3 bottom-3 inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-xs font-bold text-text-main shadow-sm">
                      <span className="material-symbols-outlined text-[14px] text-yellow-500">star</span>
                      {item.rating}
                      {item.reviews ? ` (${item.reviews})` : ""}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-base font-bold text-text-main line-clamp-2">{item.title}</h3>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-text-sub">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    {item.location} • {item.distance}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div>
                      <p className="text-lg font-extrabold text-primary">
                        {item.price} <span className="text-xs font-medium text-text-sub">{item.unit}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg bg-background-light px-3 py-1.5 text-xs font-bold text-text-main border border-border-light hover:bg-white hover:border-primary transition-colors"
                    >
                      Rent Now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
