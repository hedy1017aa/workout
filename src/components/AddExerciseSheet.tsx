type Props = {
  isOpen: boolean;
};

export default function AddExerciseSheet({ isOpen }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end">
      <div className="w-full rounded-t-3xl bg-slate-900 p-6">
        <h2 className="text-xl text-white font-bold">
          新增動作
        </h2>
      </div>
    </div>
  );
}