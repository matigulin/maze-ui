import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MAZE Staff",
  robots: { index: false, follow: false },
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-[#07080f] text-ink">
      {children}
    </div>
  );
}
