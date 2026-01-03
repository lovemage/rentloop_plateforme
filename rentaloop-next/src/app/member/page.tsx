const stats = [
  {
    title: "Items Shared",
    value: "15",
    delta: "+2 this month",
    icon: "inventory_2",
    accent: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "Borrowing",
    value: "3",
    subtitle: "active rentals",
    icon: "shopping_bag",
    accent: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  },
  {
    title: "CO₂ Saved",
    value: "100kg",
    delta: "+15%",
    icon: "cloud_off",
    accent: "text-green-600 bg-green-100 dark:bg-green-900/30",
  },
  {
    title: "Trees Planted",
    value: "5",
    subtitle: "equivalent impact",
    icon: "forest",
    accent: "text-emerald-600 bg-primary/20",
  },
];

const inventoryItems = [
  {
    title: "Camping Tent 4-Person",
    description: "Heavy duty, waterproof",
    price: "$15/day",
    badge: "Available",
    badgeColor: "text-primary",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBfu_HH5a1SbU2BCUeU76Wd0zKcrJYBABjFDqmAQ4gXa3ytBbrZCiTdfkZhM1TtwNZ9bwkimOiruBj2eETFH4Om4_QZxGb_lKEiVjzbwed-sPo1EJ8j9q1jWQsZx0jLG4x5_kyOjX8qLrIydrSo4Mq9Ak8XdL7z7Sz3g4WNHqvutStyyZ0zeQNmddFIJkZhqEHYbB1Nc-N1Dvy8fzWBNCplEuCLwSXR-BtFXCsTzkQQ2fz26YcJEUpC77t6zsxElrf5Ea1G9NTm",
  },
  {
    title: "Sony Alpha a7 III",
    description: "Includes 24-70mm Lens",
    price: "$45/day",
    badge: "Rented",
    badgeColor: "text-orange-500",
    footer: "Due Oct 25",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBD8nNLvswLDgbZ8WhZ8qcd7kGHZgLj-D1T3OiK-0ZZKjMG6QPNaRDFuHxwtflgEuMZUepJcVDHXjCETc56vAgYXXxEb-AIYeEWQ129JXtSMsyCjaJJk3g6VFBGFSRjFtWnJ7EPTSf18FuOuqdgtAuBg5qzr8prHmzZtC8mz-tRILkCxZHT6McO8Y4Hksi7J8g3VhoY5UQDqXd7oCBLv7Tm2ADbs5GVFweJQjCklfO4dM63D7o8TvdZ79PTxDVMUmfoCrCC2-Qj",
  },
  {
    title: "DeWalt Cordless Drill",
    description: "20V Max, 2 Batteries",
    price: "$10/day",
    badge: "Available",
    badgeColor: "text-primary",
    footer: "⭐ 5.0",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC7GZE8Ys9bC3xxJsOOylYenyoztgMGl--mJgPJjHeXrAU1Fkv3LUTzl_tRYw0O6Uw5WiaG7FqscGav4v7HkBQXPTF5-S46gTNQZJXNAeDD5LieKtLKqzbS3bMzsdNelbF2eo3K7e-tSXmqOLxF1sb0ZVXtBzLJBXxfazKRpZAX4lZuYNVc_cFqMFzbcT63cAoQGs1SjgbWEBhiRfl_Cdpywbjk19OqCtil7kegA2zGzURjnQYHY7fNcxodpZGawxRnMZAI2syz",
  },
];

const historyRows = [
  {
    item: "Foldable Bike",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCd9f04ockMPN__bKSibIvxxqR0BTgNbrvjEjc4UtDtAeexVL4m1o--vbdPR4SRj56sMTT5CdmF_ISQQsSHfgramssKqnMWzDPCB_x4I9pREQq00xk2hRr-UvTjUOG4-6RY4wx0MpWaCCGfK2S5bf_PkDvPBcTAjP3-A5Sn8M5mrwVRZDJxVeiQwo6apHjSctxepHEMSHic43_HcTb0TVIoDmXOXmI9n2TbYdaNEzC1YFfBHxBM9XM2mBzr2QDSslNZqw7mrPCq",
    date: "Oct 12 - Oct 14",
    user: "Sarah L.",
    userImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuArCHV6ivKR9ilWjo11Rty5Zu3me-hkImnJmpfFpUVObKv8cqa9SRhUsUGxMDe6y-vdQSMQvDlVSA1-fx9wBh188vpZpfglPp9O5SHC0m0zx8dsZvEa1IhPQfJBMTA740mdIVEnSQVeJFqcLAiVKLUCq7_TnwI2lZ9ta5wVRL6cin758vgV7le2puuRa7ncl6cSORsjgSk12Y7yxXjTXPFwOcQPMRguO781sHZPDCr1oMf5SxS5U2vMSZfJFhM_6IDlu9zD9Ya1",
    status: { label: "Returned", icon: "check_circle", color: "text-green-700 bg-green-100 dark:bg-green-900/30" },
    total: "$36.00",
  },
  {
    item: "Inflatable Kayak",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB6yr7jBXtbqI6hR97FvWA2o9Us2gXItRNnHTH2V_FnJ2xbsipNABfYiZ9Q-bEoBjILmNMYhmr38q07rD7PbzdATX9J37epAcqaNOIcE8cADEVrOUU8RGEqYpi6jBFjf1q3lBEk47QWBnw45qVv7H5Rb0IskOWUUhbFp2_OXA2DQWT_M_ZTc9k1LC1LsFBnHEVBnyuCPAuOEg5G2bXjeLBV19nxIATZKCKh-i1TVcS9Z2OYgG5UqcUtzqmj83yrZvzhiarK7JMi",
    date: "Sep 28 - Sep 29",
    user: "Mike R.",
    userImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCo_HwwpxK6fEE8AODUtoT2Xfvz95IXyFR2kn1TMt871Qy7JUxygJ_Rcb0k6yrV9BYpt1pu-KhNhxwLOMUJMg1wdYMkg1hU5JBY7pGc2BwKqBsZ8prDrpHJEpxfwgdzCBfoZmOYeYwpMueyB3ZHbgiH_RL4DlWvkJ4LTW6FkKWGLOeihZDfeo0KIzcFaxP2OfodhwbZb0ZQkNX_0U8r4K9Zpi_q8rOKW9KH7o_w2W_xErgKbkPtm0b3sofvNiC1sRW6kTmEuMw8",
    status: { label: "Completed", icon: "done", color: "text-gray-600 bg-gray-100 dark:bg-gray-800" },
    total: "$50.00",
  },
];

const reviews = [
  {
    name: "Emily W.",
    subtitle: "Borrowed Camping Tent",
    badge: "Renter",
    badgeColor: "bg-primary/10 text-primary",
    quote:
      "Alex was super helpful! The tent was in perfect condition and he even showed me how to set it up quickly. Highly recommend!",
    date: "Oct 15, 2023",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAyn0uHuaAyh3Yk8FuBWZtARmp480zIX2OYezoS_8-mtfCYUmLtDXk6Np-P8Zrcecl0p8zwwbuEBMljFlLgXfeBHBMTqs4tCeAv93wC2BCZLBO1OCQr489HdJBvzaCir7rwnUchQf5ogQoLKWOvNeX9fGzD5aPVMMSZSCOgBKRbPHKXQLtuArPsipibwTfqhKop45Ab8w_EP7oU6M6ZYSweI4RRO157GliO2yXpBpxk8p5Y_jhXNq9jUhXhcxkzr__mdE87Qrv",
  },
  {
    name: "James K.",
    subtitle: "Lent Power Washer",
    badge: "Lender",
    badgeColor: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
    quote:
      "Great experience renting to Alex. He took great care of the equipment and returned it clean and on time.",
    date: "Sep 10, 2023",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB5xmCPWo2-NoqmpdGDwux64emlO4YS8QTf5umZsK4BiCxv5h9bgnTOeH38FCL_PyQZ2SXNWSyBsuSackpST8cEwpaXC_Ovz4xNWOfxrbgjDbil8vT52gxK3cjMjqBWtbb3zXZpquAlhU-3BmsfWhW-eLi0KTcFV1nMGAG2dFjvREg5z3P8nmIQ9cs9OQgiD3ptqbU3RLREaxzHqaRY_CYnzfIsAZvY8PaPnvm9IyEOWaAUA_PpaTvWW0b5kcINXkHx9Tgvg7_P",
  },
];

export default function MemberPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-2xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm ring-1 ring-border-light dark:ring-border-dark">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="relative">
                <div
                  className="size-32 rounded-full bg-cover bg-center ring-4 ring-primary/20"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDQDWXP23TzPnjWasZ9lp8fqF62m_rvyvsOinhEPMisx_F7LpADA4Ij-YkMoLpKlYjgEw3FIVF6a4kA1quITQDC1PiGqleXhG1ql0XbolvDl2D2EmiL7yLfkQnbQqq28XJ2PyWFcbFOhh1qT1qAf1BlQt8r3UfjfHW01NAwdFsoLZvoju_extH7r8Gzxo-B9wmw7NMznVEkzq1csV_WnH9x7_M30cbHX4VSx7yCbhXOPbczGBFsxrx0NF4froS6q1nh37DXF4eY")',
                  }}
                />
                <div className="absolute bottom-1 right-1 flex size-8 items-center justify-center rounded-full bg-primary text-text-main ring-2 ring-white dark:ring-background-dark">
                  <span className="material-symbols-outlined text-lg font-bold">verified</span>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">Alex Chen</h1>
                  <div className="flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-xs font-bold text-yellow-700 dark:text-yellow-400">
                    <span className="material-symbols-outlined text-sm icon-filled text-yellow-500">star</span>
                    4.9 (42 Reviews)
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-sm text-text-sub sm:flex-row sm:items-center sm:gap-4">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">calendar_month</span>
                    Member since 2021
                  </span>
                  <span className="hidden sm:block text-border-light dark:text-border-dark">|</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base text-red-500">location_on</span>
                    Taipei, Taiwan
                  </span>
                </div>
                <p className="max-w-xl text-base leading-relaxed mt-2 text-text-main/80 dark:text-white/80">
                  Passionate about sharing resources and reducing waste. Avid camper and DIY enthusiast. I take good care
                  of my gear and yours! 🌿
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:flex-col lg:flex-row">
              <button className="flex items-center justify-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm font-bold hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
                <span className="material-symbols-outlined">share</span>
                Share Profile
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-text-main shadow-sm hover:bg-primary-dark transition-colors">
                <span className="material-symbols-outlined">edit</span>
                Edit Profile
              </button>
            </div>
          </div>
        </section>

        <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="flex flex-col gap-1 rounded-xl bg-surface-light dark:bg-surface-dark p-5 ring-1 ring-border-light dark:ring-border-dark shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-sub">{stat.title}</span>
                <span className={`flex items-center justify-center rounded-full p-1.5 ${stat.accent}`}>
                  <span className="material-symbols-outlined text-lg">{stat.icon}</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold">{stat.value}</span>
                {stat.delta && (
                  <span className="text-xs font-medium text-primary flex items-center">
                    <span className="material-symbols-outlined text-sm">trending_up</span> {stat.delta}
                  </span>
                )}
                {stat.subtitle && <span className="text-xs text-text-sub">{stat.subtitle}</span>}
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <nav aria-label="Tabs" className="sticky top-24 flex flex-row overflow-x-auto lg:flex-col gap-2 pb-4 lg:pb-0">
              {[
                { label: "Items for Rent", icon: "storefront", count: "4", active: true },
                { label: "Currently Borrowing", icon: "shopping_basket", count: "3" },
                { label: "History", icon: "history" },
                { label: "Reviews", icon: "star_rate", count: "42" },
              ].map((tab) => (
                <a
                  key={tab.label}
                  className={`group flex min-w-fit items-center gap-3 rounded-lg px-4 py-3 text-sm ${
                    tab.active
                      ? "bg-primary/10 dark:bg-primary/20 text-text-main font-bold ring-1 ring-primary/50"
                      : "text-text-sub hover:bg-surface-light dark:hover:bg-surface-dark hover:text-text-main transition-colors"
                  }`}
                  href="#"
                >
                  <span className="material-symbols-outlined">{tab.icon}</span>
                  {tab.label}
                  {tab.count && (
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-xs ${
                        tab.active ? "bg-primary text-black" : "opacity-60"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </a>
              ))}
            </nav>
          </div>
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Your Inventory</h2>
              <button className="text-sm font-bold text-primary hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {inventoryItems.map((item) => (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm ring-1 ring-border-light dark:ring-border-dark hover:shadow-md transition-shadow"
                >
                  <div
                    className="aspect-[4/3] w-full bg-cover bg-center"
                    style={{ backgroundImage: `url("${item.image}")` }}
                  >
                    <div className="absolute right-3 top-3 rounded-full bg-background-light/90 dark:bg-background-dark/90 px-2 py-1 text-xs font-bold shadow-sm">
                      <span className={item.badgeColor}>{item.badge}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-sub mb-3">{item.description}</p>
                    <div className="flex items-center justify-between border-t border-border-light dark:border-border-dark pt-3 text-sm">
                      <span className="font-bold text-text-main">{item.price}</span>
                      {item.footer && <span className="text-text-sub">{item.footer}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent History</h2>
                <div className="flex gap-2">
                  {["All", "Lent", "Borrowed"].map((filter, idx) => (
                    <button
                      key={filter}
                      className={`rounded-lg px-3 py-1 text-xs font-bold ${
                        idx === 0
                          ? "bg-primary/10 text-primary"
                          : "text-text-sub hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-hidden rounded-xl bg-surface-light dark:bg-surface-dark ring-1 ring-border-light dark:ring-border-dark">
                <table className="w-full text-left text-sm">
                  <thead className="bg-background-light dark:bg-background-dark/50 text-text-sub font-medium">
                    <tr>
                      <th className="px-6 py-4">Item</th>
                      <th className="px-6 py-4 hidden sm:table-cell">Date</th>
                      <th className="px-6 py-4 hidden md:table-cell">User</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light dark:divide-border-dark">
                    {historyRows.map((row) => (
                      <tr key={row.item} className="group hover:bg-background-light dark:hover:bg-background-dark/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="size-10 rounded bg-cover bg-center"
                              style={{ backgroundImage: `url("${row.image}")` }}
                            />
                            <div>
                              <p className="font-bold text-text-main">{row.item}</p>
                              <p className="text-xs text-text-sub sm:hidden">{row.date}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell text-text-sub">{row.date}</td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div
                              className="size-6 rounded-full bg-cover bg-center"
                              style={{ backgroundImage: `url("${row.userImage}")` }}
                            />
                            <span>{row.user}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${row.status.color}`}>
                            <span className="material-symbols-outlined text-[14px]">{row.status.icon}</span>
                            {row.status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Latest Reviews</h2>
                <div className="flex items-center gap-1 text-sm font-bold text-yellow-600 dark:text-yellow-400">
                  <span className="material-symbols-outlined icon-filled">star</span>
                  4.9 Average
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review) => (
                  <div
                    key={review.name}
                    className="p-4 rounded-xl bg-surface-light dark:bg-surface-dark ring-1 ring-border-light dark:ring-border-dark"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="size-10 rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url("${review.avatar}")` }}
                        />
                        <div>
                          <p className="font-bold text-sm">{review.name}</p>
                          <p className="text-xs text-text-sub">{review.subtitle}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${review.badgeColor}`}>
                        {review.badge}
                      </span>
                    </div>
                    <div className="flex text-yellow-500 mb-2">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span key={idx} className="material-symbols-outlined text-sm icon-filled">
                          star
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-text-main/80 dark:text-white/80 italic">&quot;{review.quote}&quot;</p>
                    <p className="mt-3 text-xs text-text-sub">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="mt-12 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-text-sub">© 2023 Rentaloop. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Support"].map((link) => (
              <a key={link} className="text-sm text-text-sub hover:text-primary transition-colors" href="#">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
