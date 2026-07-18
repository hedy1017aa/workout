interface ExerciseSelectorProps {
  searchKeyword: string;
  setSearchKeyword: (value: string) => void;
}

export default function ExerciseSelector({
  searchKeyword,
  setSearchKeyword,
}: ExerciseSelectorProps) {
  return (
    <div className="mb-4">
      <input
        type="text"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        placeholder="🔍 搜尋動作..."
        className="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      />
    </div>
  );
}