export default function HistoryControls({ onUndo, onRedo, canUndo, canRedo }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="rounded-lg bg-slate-800
                        px-5 py-3 font-medium text-white
                        cursor-pointer hover:bg-slate-700
                        disabled:opacity-40
                        disabled:cursor-not-allowed

            "
      >
        Undo
      </button>

      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className="rounded-lg bg-blue-600
                        px-5 py-3 font-medium text-white
                        disabled:opacity-40 disabled:cursor-not-allowed

            "
      >
        Redo
      </button>
    </div>
  );
}
