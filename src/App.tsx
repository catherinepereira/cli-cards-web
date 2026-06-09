import { CardEditor } from "./components/CardEditor";
import { CardPreview } from "./components/CardPreview";
import { CreditLine } from "./components/CreditLine";
import { Toolbar } from "./components/Toolbar";

function App() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="text-ink font-mono text-3xl font-semibold">✉️ cli-cards</h1>
          <CreditLine />
        </div>
        <p className="text-ink-soft mt-1">
          Design a terminal-style usage card and download it as a PNG.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="flex flex-col gap-10">
          <CardEditor />
          <Toolbar />
        </section>

        <section className="flex flex-col gap-3">
          <CardPreview />
        </section>
      </div>

      <footer className="border-border text-ink-soft mt-12 border-t pt-6 text-sm">
        Prefer the command line? Export the config JSON and render locally:
        <code className="bg-card text-ink ml-2 rounded-sm px-2 py-1 font-mono text-xs">
          npx cli-cards --config cards.config.json --out out/
        </code>
      </footer>
    </div>
  );
}

export default App;
