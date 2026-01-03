export const productCategories = [
  { icon: "grid_view", label: "All Items", active: true },
  { icon: "photo_camera", label: "Electronics" },
  { icon: "camping", label: "Outdoors" },
  { icon: "construction", label: "Tools & DIY" },
  { icon: "checkroom", label: "Fashion" },
];

export type ProductCard = {
  id: string;
  title: string;
  location: string;
  distance: string;
  price: string;
  unit: string;
  image: string;
  status?: "popular" | "available" | "rented";
  rating?: string;
  reviews?: number;
};

export const productItems: ProductCard[] = [
  {
    id: "camera",
    title: "Sony Alpha a7 III Mirrorless Camera",
    location: "Da'an District",
    distance: "2.5km away",
    price: "$800",
    unit: "/ day",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDf1Onthql8S7MPmaKq7OT4c1Vx1Zum2z8_OnPamSK5ZzAUzUBkYCbwzdJ65FkBIS1HkKONQNUk7-APqf0lj3EMXW42VqVcgxqdwKePAW2Axe5LXTctTBxW7DnVihtagJ-YhptO1rztk_Ox4Wz5jZEkjBMaOgCdWF1ttQYuqhpO6d1LuEdGCDS9OO1elPVXCf_HdGH9fj3wYVWMQ9a_AY9QCaTzTt8HZdxKgNGdMJNQ1FTaSH_8NBKnSzlrSki91FbrJFjaSEMD",
    rating: "4.9",
    reviews: 28,
    status: "available",
  },
  {
    id: "tent",
    title: "The North Face 4-Person Tent",
    location: "Xinyi District",
    distance: "5km away",
    price: "$450",
    unit: "/ day",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDuWX-AeVF2nBrFOQHn-z4nnUrXIiq4J92al9ypbxtjzz_OooBQ_LuhvHYEJKFqnfBrtXFV25S-UNaDzZz0jTiYBBLLFRAnasuYXWxuL7D2jdcHG0PlupESgDWchvTDKpsO8r1MAM55cxq2ApaK4DpIwotHBYxt1QRqJXL1YQ3SVlWXBakMqBGhEgJZKtSEayAWUW3MKOgvVROYpcrJmEaEwm5ipB518XoLb2R3rUS3wwY23r2nUxr3B2bkXN1L0N1n3G4Zcpyv",
    status: "popular",
  },
  {
    id: "drill",
    title: "DeWalt Cordless Drill Kit",
    location: "Zhongshan District",
    distance: "1.2km away",
    price: "$150",
    unit: "/ day",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDFqeULbSfBTKT9y_nGhWtaCFmi0IJrizea0NuVGvoe2wxvDG7Rg_HwYbKTVD5-bgaYW74v_BhA0w-2Oh9mQT_YxbxA32JJlKYkYiRql-ZDKkIhL9C36IBYu0j5G2n6DqV3gUKK7Y4Q5lp5kHtML-cRiBQtpv9udYzpnVpiB-9ppAO3RaSNJuUFQR26N87v25NaZujoGDs4ITVlGmwTaV_FXG0IpTJrksB2w1mUEjMBIKhexO1YEXIIUQ63RL8MI9yPOu0Eo6V8",
    rating: "5.0",
    reviews: 12,
    status: "available",
  },
  {
    id: "dress",
    title: "Designer Evening Gown (Size M)",
    location: "Songshan District",
    distance: "3km away",
    price: "$1,200",
    unit: "/ day",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB-4OtdEobDvK8rot_B2jDHkDTeq7QlUILOO0EwEz-DhE8t9L69fNJsQR5iIR7ZRgKtcbVdU6FRoFAfXzm67_VQkJeG1KYEjaPPjHjJlND7lmma1ccLMPTnqcPjBttoPNQ10dMVXO-2HaMEASffDMZdMaCNRtjj4hC0cOxXVt1sULKhl3_EyKWwPwBZvfYTN4fGMg1D10tU4lwSrmpuXoc5MrwhNkCs9gTHoHkJm_bYkHr_VnlxjiVHLJM1AKV7MOft1StOiAM5",
    rating: "5.0",
    reviews: 5,
  },
  {
    id: "dj",
    title: "Pioneer DJ Controller",
    location: "Neihu District",
    distance: "4km away",
    price: "$600",
    unit: "/ day",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD9lQ9M03cA7iWgVt3y1fJ0jPiEX43bmFgmlI-KJfV7L8k1pXhrUQ6GwQoSdp4jPxwWgs64mVq5FrQkR5rL1ZknLT36FlsP6vlq0lE5F6gSxlJ2i4Ad-7u6eJm-b6dqkD7zFykjkQ-v_L3w4Xj1KfK0EtylQeGQfDL_JbHfX60XYxJzoGDcOn83O4BMC3ybtLr1PpnWralJ9sl9xlAPl8l8y0kzby_dw8389Zk0mnKCegbVnUr4mAEN_BPA5R5zrLfuhVysdR5",
    status: "available",
  },
  {
    id: "bike",
    title: "Foldable City Bike",
    location: "Banqiao District",
    distance: "6km away",
    price: "$200",
    unit: "/ day",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCd9f04ockMPN__bKSibIvxxqR0BTgNbrvjEjc4UtDtAeexVL4m1o--vbdPR4SRj56sMTT5CdmF_ISQQsSHfgramssKqnMWzDPCB_x4I9pREQq00xk2hRr-UvTjUOG4-6RY4wx0MpWaCCGfK2S5bf_PkDvPBcTAjP3-A5Sn8M5mrwVRZDJxVeiQwo6apHjSctxepHEMSHic43_HcTb0TVIoDmXOXmI9n2TbYdaNEzC1YFfBHxBM9XM2mBzr2QDSslNZqw7mrPCq",
    status: "available",
  },
];
