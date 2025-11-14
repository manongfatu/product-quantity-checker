import QuantityChecker from "@/components/QuantityChecker";

export default function Page() {
  return (
    <main className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Quantity Checker</h1>
        <p className="text-gray-600">Upload a CSV with Lineitem name and Lineitem quantity.</p>
      </header>
      <QuantityChecker />
    </main>
  );
}


