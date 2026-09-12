import type { AdSpec } from '../models/ad-spec';

export const sampleAd: AdSpec = {
  id: "sonora-headphones",
  elements: [
    {
      id: "cta-btn",
      type: "cta",
      priority: 1,
      degradation: { allowResize: true, allowReposition: true, allowTruncate: false, allowHide: false },
      preferredPosition: 'bottom-center',
      content: "Buy Now",
      minWidth: 120,
      minHeight: 44, // Minimum tap target
    },
    {
      id: "headline-main",
      type: "headline",
      priority: 2,
      degradation: { allowResize: true, allowReposition: true, allowTruncate: false, allowHide: false },
      preferredPosition: 'top-center',
      content: "Sonora Noise Cancelling",
    },
    {
      id: "product-img",
      type: "image",
      priority: 3,
      degradation: { allowResize: true, allowReposition: true, allowTruncate: false, allowHide: false },
      preferredPosition: 'center',
      imageUrl: "/images/headphones.jpg",
      aspectRatio: 1, // Square image
      minWidth: 100,
    },
    {
      id: "price-tag",
      type: "price",
      priority: 4,
      degradation: { allowResize: false, allowReposition: true, allowTruncate: false, allowHide: false },
      preferredPosition: 'center',
      content: "$299",
    },
    {
      id: "branding-logo",
      type: "branding",
      priority: 5,
      degradation: { allowResize: true, allowReposition: true, allowTruncate: true, allowHide: true },
      preferredPosition: 'top-left',
      content: "Sonora",
    },
    {
      id: "secondary-txt",
      type: "secondaryText",
      priority: 6,
      degradation: { allowResize: true, allowReposition: true, allowTruncate: true, allowHide: true },
      preferredPosition: 'bottom-center',
      content: "Experience pure sound with active noise cancellation.",
    }
  ]
};
