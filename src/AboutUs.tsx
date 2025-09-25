// src/AboutUs.tsx
type AboutUsProps = {
  onNavigate: (route: string) => void;
};

export default function AboutUs({ onNavigate }: AboutUsProps) {
  return (
    <div className="px-6 py-12 max-w-5xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold">About CraftConnect</h1>
        <p className="mt-2 text-gray-600 text-base md:text-lg">
          A marketplace with purpose — where tradition meets sustainability.
        </p>
      </header>

      <main className="space-y-8 text-gray-800">
        {/* Intro */}
        <section className="leading-relaxed">
          <p>
            CraftConnect connects authentic Indian artisans with conscious buyers. We believe every handmade product tells a story — of craft, culture, and care — and every purchase can be a vote for sustainable living. Here you'll find handwoven textiles, terracotta, jute goods and bamboo crafts — each product showing the environmental impact it helps avert. 🌿🧵🏺
          </p>
        </section>

        {/* Mission */}
        <section className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-2xl font-medium mb-3">Our Mission</h2>
          <p className="text-gray-700">
            To empower rural artisans with transparent digital tools and to make sustainable shopping simple, measurable, and rewarding for buyers. 🌱
          </p>
        </section>

        {/* Why both seller & buyer flows */}
        <section className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-2xl font-medium mb-3">
            Why we built both Seller & Buyer flows in one platform
          </h2>

          <div className="space-y-4 text-gray-700">
            <p>
              <strong>End-to-end empowerment:</strong> A marketplace is only fair when artisans can price, share, and sell their work directly — not just list products. By building seller and buyer experiences together we remove middlemen, enable fair pricing, and preserve craft narratives. 🤝
            </p>

            <p>
              <strong>Trust through transparency:</strong> Buyer confidence grows when they can learn who made the product, how it was made, and what impact their purchase creates. That trust requires integrated seller profiles and buyer-facing product pages. 🔎
            </p>

            <p>
              <strong>Network effects:</strong> When sellers are supported with tools (pricing estimates, analytics), product quality and discoverability improve — which in turn draws more conscious buyers. Both sides grow together. 📈
            </p>
          </div>
        </section>

        {/* Seller experience */}
        <section className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-2xl font-medium mb-4">How the Seller Experience Works</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <strong>Sign up & profile:</strong> Create a seller profile with artisan or cooperative details and images. 🧑‍🎨
            </li>
            <li>
              <strong>Create product:</strong> Upload photos, add description, select category & materials, and enter weight / hours. 📸
            </li>
            <li>
              <strong>Get a fair price estimate:</strong> Use our backend estimator (AI + rules) to get a suggested price that factors material, labor, and market trends. You can accept, tweak, or replace it. ⚖
            </li>
            <li>
              <strong>Fulfill & grow:</strong> As you sell, access analytics, optional promotion slots, and tips for better listings. 📦
            </li>
          </ol>
        </section>

        {/* Buyer experience */}
        <section className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-2xl font-medium mb-4">How the Buyer Experience Works</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <strong>Browse curated categories:</strong> Terracotta, Bamboo, Jute, Textiles — all products curated for authenticity and quality. 🧺
            </li>
            <li>
              <strong>See real impact:</strong> Each product shows an estimated <strong>CO₂ saved</strong> vs a mass-produced equivalent, and an artisan story. 🌍
            </li>
          </ol>
        </section>

        {/* Values */}
        <section className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-2xl font-medium mb-3">Our Values</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              <strong>Fairness:</strong> We help artisans earn what their craft deserves. ⚖
            </li>
            <li>
              <strong>Transparency:</strong> Impact metrics and artisan stories are visible to buyers. 🔍
            </li>
            <li>
              <strong>Sustainability:</strong> We put CO₂ savings at the center of product choices. 🌱
            </li>
          </ul>
        </section>

        {/* Back to home button */}
        <section className="text-center pt-8">
          <button
            onClick={() => onNavigate("home")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg shadow-md transition"
          >
            ⬅ Back to Home
          </button>
        </section>
      </main>
    </div>
  );
}
