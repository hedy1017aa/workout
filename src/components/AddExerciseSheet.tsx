import { X, Plus, } from 'lucide-react';


type Props = {
  isOpen: boolean;
  onClose: () => void;
  newExerciseName: string;
  setNewExerciseName: (value: string) => void;
  addExercise: (name: string) => void;
  recentExercises: string[];
  selectedExercises: string[];
  toggleSelectedExercise: (name: string) => void;

  searchKeyword: string;
  setSearchKeyword: (value: string) => void;
  exerciseOptions: {
    upper: { id: string; name: string; exercises: { id: string; name: string }[] }[];
    lower: { id: string; name: string }[];
  };
  favoriteExercises: string[];
  addSelectedExercises: () => void;
  setSelectedExercises: (value: string[]) => void;
  
};

export default function AddExerciseSheet({
  isOpen,
  onClose,
  newExerciseName,
  setNewExerciseName,
  addExercise,
  recentExercises,
  selectedExercises,
  toggleSelectedExercise,

  searchKeyword,
  setSearchKeyword,
  exerciseOptions,
  favoriteExercises,
  addSelectedExercises,
  const handleClose = () => {
  setSelectedExercises([]);
  setSearchKeyword("");
  onClose();
};
  setSelectedExercises,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 fade-in"
      onClick={onClose}
    >
      <div
        className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 rounded-t-3xl max-h-[85vh] overflow-y-auto slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
          <h2 className="text-lg font-semibold text-white">新增動作</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="mb-4">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="🔍 搜尋動作..."
              className="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && newExerciseName.trim() && addExercise(newExerciseName)}
              placeholder="輸入動作名稱..."
              className="h-12 flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
            />
            <button
              onClick={() => addExercise(newExerciseName)}
              disabled={!newExerciseName.trim()}
              className="h-12 px-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              新增
            </button>
          </div>

          {recentExercises.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-400 mb-2">
                🕘 最近使用
              </h3>

              <div className="flex flex-wrap gap-2">
                {recentExercises.map((name) => (
                  <button
                    key={name}
                    onClick={() => toggleSelectedExercise(name)}
                    className={`px-3 py-2 rounded-lg border transition-all ${
                      selectedExercises.includes(name)
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {selectedExercises.includes(name) && "✅ "}
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-amber-400 mb-2">
              ⭐ 常用
            </h3>

            <div className="flex flex-wrap gap-2">
              {favoriteExercises.map((name) => (
                <button
                  key={name}
                  onClick={() => toggleSelectedExercise(name)}
                  className={`px-3 py-2 rounded-lg border transition-all ${
                    selectedExercises.includes(name)
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {selectedExercises.includes(name) && "✅ "}
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="mt-4 space-y-4">
  {exerciseOptions.upper.map((group) => (
    <div key={group.id}>
      <h3 className="text-sm font-semibold text-emerald-400 mb-2">
        {group.name}
      </h3>

      <div className="flex flex-wrap gap-2">
        {group.exercises
          .filter((ex) =>
            ex.name.toLowerCase().includes(searchKeyword.toLowerCase())
          )
          .map((ex) => (
            <button
              key={ex.id}
              onClick={() => toggleSelectedExercise(ex.name)}
              className={`px-3 py-2 rounded-lg border transition-all ${
                selectedExercises.includes(ex.name)
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {selectedExercises.includes(ex.name) && "✅ "}
              {ex.name}
            </button>
          ))}
      </div>
    </div>
  ))}
</div>
            </div>

            <div>
              <div className="mt-6">
  <h3 className="text-base font-semibold text-emerald-400 mb-3">
    🦵 下肢
  </h3>

  <div className="flex flex-wrap gap-2">
    {exerciseOptions.lower
      .filter((opt) =>
        opt.name.toLowerCase().includes(searchKeyword.toLowerCase())
      )
      .map((opt) => (
        <button
          key={opt.id}
          onClick={() => toggleSelectedExercise(opt.name)}
          className={`px-3 py-2 rounded-lg border transition-all ${
            selectedExercises.includes(opt.name)
              ? "bg-emerald-500 text-white border-emerald-500"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {selectedExercises.includes(opt.name) && "✅ "}
          {opt.name}
        </button>
      ))}
  </div>
</div>
            </div>
          </div>

          {/* 已選動作 */}
          {selectedExercises.length > 0 && (
            <div className="mt-4 p-3 bg-slate-800 rounded-xl border border-slate-700">
              <div className="text-sm text-slate-400 mb-2">
                已選 {selectedExercises.length} 個動作
              </div>

              <div className="text-emerald-400 text-sm break-words">
                {selectedExercises.join(" ｜ ")}
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setSelectedExercises([])}
              className="flex-1 h-12 rounded-xl border border-slate-600 text-slate-300"
            >
              取消
            </button>

           <button
  onClick={async () => {
  await addSelectedExercises();
  setSelectedExercises([]);
  setSearchKeyword("");
  onClose();
}}
  disabled={selectedExercises.length === 0}
  className="flex-1 h-12 rounded-xl bg-emerald-500 text-white disabled:bg-slate-700 disabled:cursor-not-allowed"
>
  加入 {selectedExercises.length} 個動作
</button>
          </div>
        </div>
      </div>
    </div>
  );
}
