// src/Footer.tsx
type FooterProps = {
  onNavigate: (route: string) => void;
};

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="text-lg font-semibold">CraftConnect</div>
          <div className="text-sm text-gray-500">Handmade • Honest • Sustainable</div>
        </div>

        <nav className="flex items-center space-x-4">
          {/* Navigation links can be added here if needed */}
        </nav>
      </div>

      <div className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-gray-400">
          © {new Date().getFullYear()} CraftConnect — Handmade. Honest. Sustainable.
        </div>
      </div>
    </footer>
  );
}
