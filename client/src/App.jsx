import { useRef, useState } from "react";
import BoxGrid from "./components/BoxGrid";
import { useEffect } from "react";
import { getGrid, saveGrid } from "./services/gridApi";
import useGridHistory from "./hooks/useGridHistory";
import HistoryControls from "./components/HistoryControls";

export default function App() {

  const {
    selectedBoxes,
    canUndo,
    canRedo,
    toggleBox,
    undo,
    redo,
    reset,
    load,
  } = useGridHistory();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const saveInFlight = useRef(false);
  

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function fetchGrid() {
      try {
        const response = await getGrid({ signal: controller.signal });

        if (active) {
          load(response.selectedBoxes);
        }
      } catch (err) {
        if (active) {
          setError(`Unable to load your saved grid: ${err.message}`);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchGrid();

    return () => {
      active = false;
      controller.abort();
    };
  }, [load]);

  function handleToggle(id) {
    setMessage("");
    toggleBox(id);
  }

  async function handleSave() {
      if (saveInFlight.current) return;
      saveInFlight.current = true;
      setSaving(true);
      setMessage("");
      setError("");
      

      try {
        
        await saveGrid(selectedBoxes);
        setMessage("Grid Saved Successfully")
      } catch (err) {
        setError(
          err.message || "unable to save the grid"
        )
      }finally{
        saveInFlight.current = false;
        setSaving(false)
      }
  }


   if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-scale-500">

          <p>Loading Grid</p>
        </div>
      )
   }
  return (
    <main className="min-h-screen bg-slate-100 px-3 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Grid Selection</h1>

          <p className="mt-2 text-sm text-slate-500">
            8*8 Chess With Undo Redo
          </p>
        </header>

        <section className="rounded-2xl bg-white p-4 shadow-xl sm:p-8">
          <div className="mb-5 flex item-center justify-between">
            <h2 className="font-semibold text-slate-700">Select Boxes</h2>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {selectedBoxes.length} /64 selected
            </span>
          </div>

          <BoxGrid selectedBoxes={selectedBoxes} onToggle={handleToggle} />

          <div className="mt-8">
            <HistoryControls
              onUndo={() => { setMessage(""); undo(); }}
              onRedo={() => { setMessage(""); redo(); }}
              canUndo={canUndo}
              canRedo={canRedo}
            
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button 
            type="button"
            onClick={() => { setMessage(""); reset(); }}
            disabled={selectedBoxes.length ===0}
            className="rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700" 
             
             >
              Clear All
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "saving.." : "Save Selector"}
            </button>
          </div>

          {message && (
            <p
              role="status"
              className="mt-5 text-center text-sm font-medium text-emerald-600"
            >
              {message}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mt-5 text-center text-sm font-medium text-red-600"
            >
              {error}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
