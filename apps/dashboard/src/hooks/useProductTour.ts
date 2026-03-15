"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";

const TOUR_KEY = "indialeads_tour_done";

export function useProductTour() {
  const { tenant } = useAuthStore();

  useEffect(() => {
    if (!tenant) return;
    if (localStorage.getItem(TOUR_KEY)) return;
    if (typeof window === "undefined") return;

    // Lazy-load driver.js only when needed
    import("driver.js").then(({ driver }) => {
      import("driver.js/dist/driver.css").catch(() => {});

      const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayColor: "rgba(2, 8, 23, 0.85)",
        popoverClass: "indialeads-tour",
        steps: [
          {
            element: "nav a[href='/leads']",
            popover: {
              title: "📋 Step 1: Upload Leads",
              description: "Start by uploading your leads from an Excel file. Click Leads in the sidebar.",
              side: "right",
            },
          },
          {
            element: "nav a[href='/templates']",
            popover: {
              title: "📝 Step 2: Create a Template",
              description: "Build a WhatsApp message template with variables like {{name}} and {{product}}.",
              side: "right",
            },
          },
          {
            element: "nav a[href='/broadcasts']",
            popover: {
              title: "📡 Step 3: Send a Broadcast",
              description: "Select your template, choose your audience, and send bulk WhatsApp messages.",
              side: "right",
            },
          },
          {
            element: "nav a[href='/inbox']",
            popover: {
              title: "💬 Step 4: Check Replies",
              description: "All incoming WhatsApp replies appear here in real time.",
              side: "right",
            },
          },
          {
            element: "nav a[href='/analytics']",
            popover: {
              title: "📊 Step 5: View Analytics",
              description: "Track delivery rates, lead growth, and broadcast performance.",
              side: "right",
            },
          },
        ],
        onDestroyStarted: () => {
          localStorage.setItem(TOUR_KEY, "true");
          driverObj.destroy();
        },
      });

      // Delay slightly for page to render
      setTimeout(() => driverObj.drive(), 1500);
    }).catch(() => {
      // driver.js not available — skip tour silently
    });
  }, [tenant]);
}

// Call this from settings to replay the tour
export function replayTour() {
  localStorage.removeItem(TOUR_KEY);
  window.location.reload();
}
