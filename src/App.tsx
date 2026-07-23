import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dumbbell,
  Plus,
  Trash2,
  Check,
  Timer,
  X,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  Settings,
  Calendar,
  Copy,
  ArrowLeft,
  MoreVertical,
  GripVertical,
} from 'lucide-react';
import { supabase, type Workout, type ExerciseWithSets } from './lib/supabase';
import AddExerciseSheet from './components/AddExerciseSheet';
const DEFAULT_REST_TIME = 90;

const REST_MINUTES_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const REST_SECONDS_OPTIONS = [0, 10, 20, 30, 40, 50];

const EXERCISE_OPTIONS = {
  upper: [
    {
      id: 'chest',
      name: '💪胸部',
      exercises: [
        { id: 'bench-press', name: '臥推' },
        { id: 'push-up', name: '伏地挺身' },
        { id: 'fly', name: '飛鳥' },
      ],
    },
    {
      id: 'back',
      name: '💪背部',
      exercises: [
        { id: 'pull-up', name: '引體向上' },
        { id: 'row', name: '划船' },
        { id: 'lat-pulldown', name: '滑輪下拉' },
      ],
    },
    {
      id: 'shoulder',
      name: '💪肩部',
      exercises: [
        { id: 'shoulder-press', name: '肩推' },
        { id: 'lateral-raise', name: '平舉' },
      ],
    },
  ],
  lower: [
    { id: 'squat', name: '深蹲' },
    { id: 'lunge', name: '分腿蹲' },
    { id: 'deadlift', name: '硬舉' },
    { id: 'good-morning', name: '早安' },
    { id: 'farmers-walk', name: '農夫走路' },
  ],
};

type AttributeField =
  | { type: 'select'; key: string; label: string; options: string[] }
  | { type: 'text'; key: string; label: string; placeholder?: string }
  | { type: 'number'; key: string; label: string; suffix?: string };

const EXERCISE_ATTRIBUTES: Record<string, AttributeField[]> = {
  臥推: [
    { type: 'select', key: 'equipment', label: '器材', options: ['槓鈴', '啞鈴'] },
    { type: 'select', key: 'angle', label: '角度', options: ['平板', '上斜', '下斜'] },
    { type: 'select', key: 'grip', label: '握距', options: ['窄握', '寬握'] },
    { type: 'text', key: 'notes', label: '備註', placeholder: '自由輸入' },
  ],
  伏地挺身: [
    { type: 'select', key: 'difficulty', label: '難易', options: ['箱上', '跪姿', '下斜', '俄挺'] },
    { type: 'select', key: 'form', label: '形式', options: ['鑽石', '寬距', '弓箭手', '高低', '單手'] },
    { type: 'text', key: 'notes', label: '備註', placeholder: '自由輸入' },
  ],
  飛鳥: [
    { type: 'select', key: 'equipment', label: '器材', options: ['啞鈴', '滑輪機', '彈力帶', '蝴蝶機'] },
    { type: 'select', key: 'form', label: '形式', options: ['標準', '反向'] },
    { type: 'text', key: 'notes', label: '備註', placeholder: '自由輸入' },
  ],
  引體向上: [
    { type: 'select', key: 'grip', label: '握法', options: ['反手', '正反握', '中立握'] },
    { type: 'select', key: 'assisted', label: '輔助', options: ['無', '彈力帶'] },
    { type: 'number', key: 'weight', label: '負重', suffix: 'kg' },
    { type: 'text', key: 'notes', label: '備註', placeholder: '自由輸入' },
  ],
  划船: [
    { type: 'select', key: 'form', label: '形式', options: ['坐姿', '俯身', '划船機', 'T字槓'] },
    { type: 'text', key: 'notes', label: '備註', placeholder: '自由輸入' },
  ],
  高位下拉: [
    { type: 'select', key: 'form', label: '形式', options: ['反手', '窄距', '繩索'] },
    { type: 'text', key: 'notes', label: '備註', placeholder: '自由輸入' },
  ],
  滑輪下拉: [
    { type: 'select', key: 'form', label: '形式', options: ['反手', '窄距', '繩索'] },
    { type: 'text', key: 'notes', label: '備註', placeholder: '自由輸入' },
  ],
  肩推: [
    { type: 'select', key: 'equipment', label: '器材', options: ['槓鈴', '啞鈴'] },
    { type: 'select', key: 'posture', label: '姿勢', options: ['站姿', '坐姿'] },
    { type: 'text', key: 'notes', label: '備註', placeholder: '自由輸入' },
  ],
  平舉: [
    { type: 'select', key: 'equipment', label: '器材', options: ['啞鈴', '滑輪機', '彈力帶'] },
    { type: 'select', key: 'form', label: '形式', options: ['側平舉', '前平舉', '俯身側平舉'] },
    { type: 'text', key: 'notes', label: '備註', placeholder: '自由輸入' },
  ],
  深蹲: [
    { type: 'select', key: 'equipment', label: '器材', options: ['槓鈴', '啞鈴'] },
    { type: 'select', key: 'form', label: '形式', options: ['高背槓', '低背槓', '前蹲', '前抱式', '酒杯式', 'SSB'] },
    { type: 'select', key: 'stance', label: '站距', options: ['標準', '寬距'] },
    { type: 'text', key: 'notes', label: '備註', placeholder: '自由輸入' },
  ],
  分腿蹲: [
    { type: 'select', key: 'equipment', label: '器材', options: ['槓鈴', '啞鈴'] },
    { type: 'select', key: 'form', label: '形式', options: ['原地', '弓箭步', '保加利亞', '前腳墊高', '後腳墊高'] },
    { type: 'text', key: 'notes', label: '備註', placeholder: '自由輸入' },
  ],
  硬舉: [
    { type: 'select', key: 'equipment', label: '器材', options: ['槓鈴', '啞鈴'] },
    { type: 'select', key: 'form', label: '形式', options: ['傳統', '相撲', '羅馬尼亞'] },
    { type: 'text', key: 'notes', label: '備註', placeholder: '自由輸入' },
  ],
  早安: [
    { type: 'select', key: 'stance', label: '站距', options: ['窄距', '寬距'] },
    { type: 'select', key: 'form', label: '形式', options: ['直膝', '屈膝'] },
    { type: 'text', key: 'notes', label: '備註', placeholder: '自由輸入' },
  ],
  農夫走路: [
    { type: 'select', key: 'equipment', label: '器材', options: ['啞鈴', '槓片', '農夫槓', '六角槓'] },
    { type: 'select', key: 'form', label: '形式', options: ['標準', '單邊', '不等重', '過頭'] },
    { type: 'text', key: 'notes', label: '備註', placeholder: '自由輸入' },
  ],
};

const UNILATERAL_EXERCISES = [
  '臥推',
  '飛鳥',
  '划船',
  '滑輪下拉',
  '高位下拉',
  '肩推',
  '平舉',
  '分腿蹲',
  '硬舉',
  '農夫走路',
];

type ExerciseCategory = keyof typeof EXERCISE_OPTIONS;

function App() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<ExerciseWithSets[]>([]);
  const [loading, setLoading] = useState(true);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showExerciseSheet, setShowExerciseSheet] = useState(false);
  const [recentExercises, setRecentExercises] = useState<string[]>([]);
  const favoriteExercises = [
  "臥推",
  "引體向上",
  "深蹲",
  "肩推",
  "划船",
  "滑輪下拉",
];
  
  const [restTimer, setRestTimer] = useState<{
    exerciseId: string;
    setNumber: number;
    remaining: number;
    isRunning: boolean;
  } | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());
  const [attributeSheetExercise, setAttributeSheetExercise] = useState<ExerciseWithSets | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyWorkouts, setHistoryWorkouts] = useState<(Workout & { exercises: ExerciseWithSets[] })[]>([]);
  const [selectedHistoryWorkout, setSelectedHistoryWorkout] = useState<(Workout & { exercises: ExerciseWithSets[] }) | null>(null);
  const [showCopyConfirm, setShowCopyConfirm] = useState(false);
  const [copyTargetWorkout, setCopyTargetWorkout] = useState<(Workout & { exercises: ExerciseWithSets[] }) | null>(null);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [globalRestTime, setGlobalRestTime] = useState(() => {
    const saved = localStorage.getItem('globalRestTime');
    return saved ? parseInt(saved, 10) : DEFAULT_REST_TIME;
  });
  const [vibrationEnabled, setVibrationEnabled] = useState(() => {
    const saved = localStorage.getItem('vibrationEnabled');
    return saved ? saved === 'true' : true;
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved ? saved === 'true' : true;
  });
  const [showRestSettings, setShowRestSettings] = useState(false);
  const [showTimerUI, setShowTimerUI] = useState(false);
  const [exerciseMenuOpen, setExerciseMenuOpen] = useState<string | null>(null);
  const [deleteConfirmExercise, setDeleteConfirmExercise] = useState<ExerciseWithSets | null>(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [draggedExercise, setDraggedExercise] = useState<ExerciseWithSets | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleClose = () => {
  setSearchKeyword("");
  setSelectedExercises([]);
  onClose();
};
const toggleSelectedExercise = (name: string) => {
  setSelectedExercises((prev) =>
    prev.includes(name)
      ? prev.filter((item) => item !== name)
      : [...prev, name]
  );
};
const addSelectedExercises = async () => {
  for (const name of selectedExercises) {
    await addExercise(name);
  }

  setSelectedExercises([]);
};
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  useEffect(() => {
  loadTodayWorkout();
  loadRecentExercises();
}, []);
const loadRecentExercises = async () => {
  const { data, error } = await supabase
    .from("exercises")
    .select("name")
    .order("created_at", { ascending: false });

  if (error || !data) return;

  const unique = [...new Set(data.map((item) => item.name))];

  setRecentExercises(unique.slice(0, 8));
};
  useEffect(() => {
    localStorage.setItem('globalRestTime', globalRestTime.toString());
  }, [globalRestTime]);

  useEffect(() => {
    localStorage.setItem('vibrationEnabled', vibrationEnabled.toString());
  }, [vibrationEnabled]);

  useEffect(() => {
    localStorage.setItem('soundEnabled', soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    const handleClickOutside = () => setExerciseMenuOpen(null);
    if (exerciseMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [exerciseMenuOpen]);

  const playTick = useCallback(async () => {
    console.log('[playTick] called', { vibrationEnabled, soundEnabled });
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(100);
    }
    if (soundEnabled) {
      try {
        console.log('[playTick] soundEnabled, checking audioContext');
        if (!audioContextRef.current) {
          console.log('[playTick] creating new AudioContext');
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioContextRef.current = new AudioContextClass();
        }
        const audioContext = audioContextRef.current;
        console.log('[playTick] audioContext.state:', audioContext.state);
        if (audioContext.state === 'suspended') {
          console.log('[playTick] resuming audioContext...');
          await audioContext.resume();
          console.log('[playTick] audioContext resumed, state:', audioContext.state);
        }
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 880;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
        console.log('[playTick] sound played successfully');
      } catch (e) {
        console.error('[playTick] exception:', e);
      }
    }
  }, [vibrationEnabled, soundEnabled]);

  const playAlert = useCallback(async () => {
    console.log('[playAlert] called', { vibrationEnabled, soundEnabled });
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
    if (soundEnabled) {
      try {
        console.log('[playAlert] soundEnabled, checking audioContext');
        if (!audioContextRef.current) {
          console.log('[playAlert] creating new AudioContext');
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioContextRef.current = new AudioContextClass();
        }
        const audioContext = audioContextRef.current;
        console.log('[playAlert] audioContext.state:', audioContext.state);
        if (audioContext.state === 'suspended') {
          console.log('[playAlert] resuming audioContext...');
          await audioContext.resume();
          console.log('[playAlert] audioContext resumed, state:', audioContext.state);
        }
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 880;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.frequency.value = 880;
          osc2.type = 'sine';
          gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          osc2.start(audioContext.currentTime);
          osc2.stop(audioContext.currentTime + 0.5);
        }, 200);
        console.log('[playAlert] sound played successfully');
      } catch (e) {
        console.error('[playAlert] exception:', e);
      }
    }
  }, [vibrationEnabled, soundEnabled]);

  useEffect(() => {
    if (restTimer?.isRunning) {
      timerRef.current = setInterval(() => {
        setRestTimer((prev) => {
          if (!prev) return null;
          const newRemaining = prev.remaining - 1;
          console.log('[Timer] tick, remaining:', newRemaining);

          // Play tick at 10, 3, 2, 1 seconds remaining
          if (newRemaining === 10 || newRemaining === 3 || newRemaining === 2 || newRemaining === 1) {
            console.log('[Timer] calling playTick at', newRemaining, 'seconds');
            playTick();
          }

          if (newRemaining <= 0) {
            console.log('[Timer] FINISHED - calling playAlert');
            if (timerRef.current) clearInterval(timerRef.current);
            playAlert();
            setShowTimerUI(true);
            return { ...prev, remaining: 0, isRunning: false };
          }
          return { ...prev, remaining: newRemaining };
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [restTimer?.isRunning, playTick, playAlert]);

  // Show timer UI when restTimer starts
  useEffect(() => {
    if (restTimer?.isRunning) {
      setShowTimerUI(true);
    }
  }, [restTimer?.isRunning, restTimer?.exerciseId, restTimer?.setNumber]);

  const loadTodayWorkout = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data: existingWorkout } = await supabase
      .from('workouts')
      .select('*')
      .eq('workout_date', today)
      .maybeSingle();

    if (existingWorkout) {
      setWorkout(existingWorkout);
      await loadExercises(existingWorkout.id);
    } else {
      const { data: newWorkout, error } = await supabase
        .from('workouts')
        .insert({ name: '今日課表' })
        .select()
        .single();

      if (!error && newWorkout) {
        setWorkout(newWorkout);
        setExercises([]);
      }
    }
    setLoading(false);
  };

  const loadExercises = async (workoutId: string) => {
    const { data: exerciseList } = await supabase
      .from('exercises')
      .select('*, sets(*)')
      .eq('workout_id', workoutId)
      .order('order_index');

    if (exerciseList) {
      const exercisesWithSortedSets = exerciseList.map((ex) => ({
        ...ex,
        sets: (ex.sets as Set[]).sort((a, b) => a.set_number - b.set_number),
      }));
      setExercises(exercisesWithSortedSets as ExerciseWithSets[]);
      setExpandedExercises(new Set(exerciseList.map((e) => e.id)));
    }
  };

  const loadHistoryWorkouts = async () => {
    const { data: workouts } = await supabase
      .from('workouts')
      .select('*, exercises(*, sets(*))')
      .order('workout_date', { ascending: false });

    if (workouts) {
      const workoutsWithExercises = workouts
        .filter((w) => w.exercises && w.exercises.length > 0)
        .map((w) => ({
          ...w,
          exercises: w.exercises.map((ex: ExerciseWithSets) => ({
            ...ex,
            sets: (ex.sets as Set[]).sort((a, b) => a.set_number - b.set_number),
          })).sort((a, b) => a.order_index - b.order_index),
        }));
      setHistoryWorkouts(workoutsWithExercises as (Workout & { exercises: ExerciseWithSets[] })[]);
    }
  };

  const copyWorkoutToToday = async (sourceWorkout: Workout & { exercises: ExerciseWithSets[] }) => {
    setCopyTargetWorkout(sourceWorkout);
    if (exercises.length > 0) {
      setShowOverwriteConfirm(true);
    } else {
      setShowCopyConfirm(true);
    }
  };

  const performCopy = async (sourceWorkout: Workout & { exercises: ExerciseWithSets[] }) => {
    if (!workout) return;

    // Delete existing exercises for today if any
    const todayExerciseIds = exercises.map((e) => e.id);
    if (todayExerciseIds.length > 0) {
      await supabase.from('sets').delete().in('exercise_id', todayExerciseIds);
      await supabase.from('exercises').delete().in('id', todayExerciseIds);
    }

    // Copy exercises and sets
    for (let i = 0; i < sourceWorkout.exercises.length; i++) {
      const srcExercise = sourceWorkout.exercises[i];

      const { data: newExercise } = await supabase
        .from('exercises')
        .insert({
          workout_id: workout.id,
          name: srcExercise.name,
          order_index: i,
          exercise_attributes: srcExercise.exercise_attributes,
          is_unilateral: srcExercise.is_unilateral,
          rest_time: srcExercise.rest_time,
        })
        .select()
        .single();

      if (newExercise && srcExercise.sets) {
        const setsToInsert = srcExercise.sets.map((s, idx) => ({
          exercise_id: newExercise.id,
          set_number: idx + 1,
          weight: s.weight,
          reps: s.reps,
          completed: false,
        }));
        await supabase.from('sets').insert(setsToInsert);
      }
    }

    await loadExercises(workout.id);
    setShowHistory(false);
    setSelectedHistoryWorkout(null);
    setShowCopyConfirm(false);
    setShowOverwriteConfirm(false);
    setCopyTargetWorkout(null);
  };

  const addExercise = async (name: string) => {
    if (!workout || !name.trim()) return;

    // Find the most recent exercise with the same name to use as preset
    const { data: previousExercise } = await supabase
      .from('exercises')
      .select('*, sets(*)')
      .eq('name', name.trim())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const presetAttributes = previousExercise?.exercise_attributes || {};
    const presetIsUnilateral = previousExercise?.is_unilateral || false;
    const presetRestTime = previousExercise?.rest_time || null;
    const presetSets = previousExercise?.sets || [];

    const { data: exercise, error } = await supabase
      .from('exercises')
      .insert({
        workout_id: workout.id,
        name: name.trim(),
        order_index: exercises.length,
        exercise_attributes: presetAttributes,
        is_unilateral: presetIsUnilateral,
        rest_time: presetRestTime,
      })
      .select()
      .single();

    if (!error && exercise) {
      let setsData: Set[] = [];

      if (presetSets.length > 0) {
        // Create sets based on previous exercise's sets
        const setsToInsert = presetSets.map((s: Set, index: number) => ({
          exercise_id: exercise.id,
          set_number: index + 1,
          weight: s.weight,
          reps: s.reps,
        }));
        const { data: newSets } = await supabase.from('sets').insert(setsToInsert).select();
        setsData = newSets || [];
      } else {
        // Create default 3 empty sets
        const { data: newSets } = await supabase
          .from('sets')
          .insert([
            { exercise_id: exercise.id, set_number: 1 },
            { exercise_id: exercise.id, set_number: 2 },
            { exercise_id: exercise.id, set_number: 3 },
          ])
          .select();
        setsData = newSets || [];
      }

      const newExercise: ExerciseWithSets = {
        ...exercise,
        sets: setsData,
      };
      setExercises((prev) => [...prev, newExercise]);
      setExpandedExercises((prev) => new Set([...prev, exercise.id]));
      setNewExerciseName('');
     
    }
  };

  const handleSubcategorySelect = (name: string) => {
    addExercise(name);
  };

  const addSet = async (exerciseId: string) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    const newSetNumber = exercise.sets.length + 1;
    const { data: newSet } = await supabase
      .from('sets')
      .insert({ exercise_id: exerciseId, set_number: newSetNumber })
      .select()
      .single();

    if (newSet) {
      setExercises(
        exercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex
        )
      );
    }
  };

  const removeSet = async (exerciseId: string, setId: string) => {
    await supabase.from('sets').delete().eq('id', setId);

    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    const remainingSets = exercise.sets
      .filter((s) => s.id !== setId)
      .map((s, idx) => ({ ...s, set_number: idx + 1 }));

    for (const s of remainingSets) {
      await supabase.from('sets').update({ set_number: s.set_number }).eq('id', s.id);
    }

    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, sets: remainingSets } : ex
      )
    );
  };

  const updateSet = async (
    exerciseId: string,
    setId: string,
    updates: Partial<Set>
  ) => {
    await supabase.from('sets').update(updates).eq('id', setId);

    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
            }
          : ex
      )
    );
  };

  const updateExerciseAttribute = async (
    exerciseId: string,
    key: string,
    value: string | number | boolean | null
  ) => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    if (!exercise) return;

    const newAttributes = { ...exercise.exercise_attributes, [key]: value };
    await supabase.from('exercises').update({ exercise_attributes: newAttributes }).eq('id', exerciseId);

    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, exercise_attributes: newAttributes } : ex
      )
    );
  };

  const toggleUnilateral = async (exerciseId: string, currentValue: boolean) => {
    const newValue = !currentValue;
    await supabase.from('exercises').update({ is_unilateral: newValue }).eq('id', exerciseId);

    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, is_unilateral: newValue } : ex
      )
    );
  };

  const completeSet = useCallback(
    async (exerciseId: string, setItem: Set) => {
      if (setItem.completed) return;

      initAudioContext();

      await supabase
        .from('sets')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', setItem.id);

      const exercise = exercises.find((e) => e.id === exerciseId);
      const restTime = exercise?.rest_time ?? globalRestTime;

      setExercises(
        exercises.map((ex) =>
          ex.id === exerciseId
            ? {
                ...ex,
                sets: ex.sets.map((s) =>
                  s.id === setItem.id
                    ? { ...s, completed: true, completed_at: new Date().toISOString() }
                    : s
                ),
              }
            : ex
        )
      );

      setRestTimer({
        exerciseId,
        setNumber: setItem.set_number,
        remaining: restTime,
        isRunning: true,
      });
    },
    [exercises, globalRestTime, initAudioContext]
  );

  const uncompleteSet = async (exerciseId: string, setId: string) => {
    await supabase
      .from('sets')
      .update({ completed: false, completed_at: null })
      .eq('id', setId);

    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId ? { ...s, completed: false, completed_at: null } : s
              ),
            }
          : ex
      )
    );
  };

  const deleteExercise = async (exerciseId: string) => {
    await supabase.from('exercises').delete().eq('id', exerciseId);
    setExercises(exercises.filter((e) => e.id !== exerciseId));
  };

  const moveExercise = async (exerciseId: string, direction: 'up' | 'down') => {
    const currentIndex = exercises.findIndex((e) => e.id === exerciseId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= exercises.length) return;

    const newExercises = [...exercises];
    [newExercises[currentIndex], newExercises[newIndex]] = [newExercises[newIndex], newExercises[currentIndex]];

    // Update order_index in database
    for (let i = 0; i < newExercises.length; i++) {
      await supabase.from('exercises').update({ order_index: i }).eq('id', newExercises[i].id);
    }

    setExercises(newExercises.map((ex, i) => ({ ...ex, order_index: i })));
  };

  const updateExerciseRestTime = async (exerciseId: string, restTime: number | null) => {
    await supabase.from('exercises').update({ rest_time: restTime }).eq('id', exerciseId);
    setExercises(
      exercises.map((ex) => (ex.id === exerciseId ? { ...ex, rest_time: restTime } : ex))
    );
  };

  const finishWorkout = async () => {
    if (!workout) return;
  };

  const toggleExpand = (exerciseId: string) => {
    setExpandedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const dismissTimer = () => {
    if (restTimer?.isRunning) {
      setShowTimerUI(false);
    } else {
      setRestTimer(null);
      setShowTimerUI(false);
    }
  };

  const toggleTimer = () => {
    if (!restTimer) return;
    initAudioContext();
    setRestTimer({ ...restTimer, isRunning: !restTimer.isRunning });
  };

  const resetTimer = () => {
    if (!restTimer) return;
    setRestTimer({ ...restTimer, remaining: DEFAULT_REST_TIME, isRunning: false });
  };

  const handleTimerKeydown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      dismissTimer();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-lg">載入中...</div>
      </div>
    );
  }

  const getWeekdayName = (dateStr: string) => {
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return weekdays[new Date(dateStr).getDay()];
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  // History List View
  if (showHistory && !selectedHistoryWorkout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-white">訓練紀錄</h1>
            </div>
          </header>

          <div className="space-y-3">
            {historyWorkouts.map((hw) => (
              <div
                key={hw.id}
                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <button
                    onClick={() => setSelectedHistoryWorkout(hw)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">
                        {formatDate(hw.workout_date || hw.created_at)}
                      </h3>
                      <span className="text-slate-400 text-sm">
                        ({getWeekdayName(hw.workout_date || hw.created_at)})
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      {hw.exercises.length} 個動作
                    </p>
                  </button>
                  <button
                    onClick={() => copyWorkoutToToday(hw)}
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                    title="複製到今日課表"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-slate-500 text-sm truncate">
                  {hw.exercises.map((e) => e.name).join('｜')}
                </p>
              </div>
            ))}
            {historyWorkouts.length === 0 && (
              <div className="text-center py-12 text-slate-500">尚無訓練紀錄</div>
            )}
          </div>
        </div>

        {/* Copy Confirm Modal */}
        {showCopyConfirm && copyTargetWorkout && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full mx-4">
              <p className="text-white text-center mb-6">是否將此課表複製到今日課表？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCopyConfirm(false);
                    setCopyTargetWorkout(null);
                  }}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => performCopy(copyTargetWorkout)}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
                >
                  確認
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overwrite Confirm Modal */}
        {showOverwriteConfirm && copyTargetWorkout && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full mx-4">
              <p className="text-white text-center mb-6">今日課表已有內容，是否覆蓋目前課表？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowOverwriteConfirm(false);
                    setCopyTargetWorkout(null);
                  }}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => performCopy(copyTargetWorkout)}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                >
                  覆蓋
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // History Detail View
  if (selectedHistoryWorkout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedHistoryWorkout(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {formatDate(selectedHistoryWorkout.workout_date || selectedHistoryWorkout.created_at)}
                  </h1>
                  <p className="text-slate-400 text-sm">
                    {getWeekdayName(selectedHistoryWorkout.workout_date || selectedHistoryWorkout.created_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => copyWorkoutToToday(selectedHistoryWorkout)}
                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                title="複製到今日課表"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="space-y-4">
            {selectedHistoryWorkout.exercises.map((exercise) => {
              const completedSets = exercise.sets.filter((s) => s.completed).length;
              const totalSets = exercise.sets.length;

              return (
                <div
                  key={exercise.id}
                  className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white text-lg">{exercise.name}</h3>
                      <p className="text-slate-400 text-sm">
                        {completedSets}/{totalSets} 組完成
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const summary: string[] = [];
                    if (exercise.is_unilateral) summary.push('單邊');
                    const attrs = EXERCISE_ATTRIBUTES[exercise.name];
                    if (attrs) {
                      attrs.forEach((field) => {
                        if (field.type === 'select') {
                          const val = exercise.exercise_attributes?.[field.key] as string;
                          if (val && val !== '標準' && val !== '無') summary.push(val);
                        } else if (field.type === 'number') {
                          const val = exercise.exercise_attributes?.[field.key] as number;
                          if (val) summary.push(`${val}${field.suffix || ''}`);
                        }
                      });
                    }
                    return summary.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {summary.map((s, i) => (
                          <span key={i} className="text-xs bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : null;
                  })()}

                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-xs text-slate-400 px-2">
                      <span className="col-span-1">組</span>
                      <span className="col-span-3">重量</span>
                      <span className="col-span-3">次數</span>
                      <span className="col-span-5 text-right">狀態</span>
                    </div>
                    {exercise.sets.map((s) => (
                      <div key={s.id} className="grid grid-cols-12 gap-2 items-center bg-slate-700/30 rounded-lg p-2">
                        <span className="col-span-1 text-slate-300 font-medium">{s.set_number}</span>
                        <span className="col-span-3 text-slate-300">{s.weight ? `${s.weight} kg` : '-'}</span>
                        <span className="col-span-3 text-slate-300">{s.reps || '-'}</span>
                        <div className="col-span-5 flex justify-end">
                          {s.completed && (
                            <span className="text-emerald-400 text-sm">已完成</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {exercise.exercise_attributes?.notes && (
                    <div className="mt-3 text-slate-400 text-sm">
                      備註：{exercise.exercise_attributes.notes as string}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Copy Confirm Modal */}
        {showCopyConfirm && copyTargetWorkout && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full mx-4">
              <p className="text-white text-center mb-6">是否將此課表複製到今日課表？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCopyConfirm(false);
                    setCopyTargetWorkout(null);
                  }}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => performCopy(copyTargetWorkout)}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
                >
                  確認
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overwrite Confirm Modal */}
        {showOverwriteConfirm && copyTargetWorkout && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full mx-4">
              <p className="text-white text-center mb-6">今日課表已有內容，是否覆蓋目前課表？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowOverwriteConfirm(false);
                    setCopyTargetWorkout(null);
                  }}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => performCopy(copyTargetWorkout)}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                >
                  覆蓋
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Dumbbell className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                {workout?.name || '今日課表'}
              </h1>
            </div>
            <button
              onClick={() => {
                loadHistoryWorkouts();
                setShowHistory(true);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-sm">日期</span>
            </button>
          </div>
          <p className="text-slate-400 text-sm">
            {new Date().toLocaleDateString('zh-TW', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </header>

        
        <div className="mb-6">
          <button
            onClick={() => setShowExerciseSheet(true)}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            新增動作
          </button>
        </div>

        <AddExerciseSheet
          isOpen={showExerciseSheet}
          onClose={() => setShowExerciseSheet(false)}
          newExerciseName={newExerciseName}
          setNewExerciseName={setNewExerciseName}
          addExercise={addExercise}
          recentExercises={recentExercises}
          selectedExercises={selectedExercises}
          toggleSelectedExercise={toggleSelectedExercise}
         
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          exerciseOptions={EXERCISE_OPTIONS}
          favoriteExercises={favoriteExercises}
          addSelectedExercises={addSelectedExercises}
          setSelectedExercises={setSelectedExercises}
        />

        <div className="space-y-4">
          {exercises.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>尚未新增任何動作</p>
              <p className="text-sm mt-1">開始建立你的今日課表</p>
            </div>
          )}

          {exercises.map((exercise) => {
            const isExpanded = expandedExercises.has(exercise.id);
            const completedSets = exercise.sets.filter((s) => s.completed).length;
            const totalSets = exercise.sets.length;
            const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
            const idx = exercises.findIndex((e) => e.id === exercise.id);

            return (
              <div
                key={exercise.id}
                draggable={reorderMode}
                onDragStart={(e) => {
                  if (!reorderMode) return;
                  setDraggedExercise(exercise);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  if (!reorderMode || !draggedExercise) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  if (!reorderMode || !draggedExercise || draggedExercise.id === exercise.id) return;
                  e.preventDefault();
                  const fromIdx = exercises.findIndex((ex) => ex.id === draggedExercise.id);
                  const toIdx = idx;
                  const newExercises = [...exercises];
                  newExercises.splice(fromIdx, 1);
                  newExercises.splice(toIdx, 0, draggedExercise);
                  for (let i = 0; i < newExercises.length; i++) {
                    supabase.from('exercises').update({ order_index: i }).eq('id', newExercises[i].id);
                  }
                  setExercises(newExercises.map((ex, i) => ({ ...ex, order_index: i })));
                  setDraggedExercise(null);
                }}
                className={`bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden ${
                  reorderMode ? 'cursor-grab' : ''
                } ${draggedExercise?.id === exercise.id ? 'opacity-50' : ''}`}
              >
                <div
                  className="p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
                  onClick={() => !reorderMode && toggleExpand(exercise.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 -rotate-90">
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-slate-700"
                          />
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${progress} 100`}
                            className={progress === 100 ? 'text-emerald-400' : 'text-amber-400'}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                          {completedSets}/{totalSets}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white text-lg">
                            {exercise.name}
                          </h3>
                          {EXERCISE_ATTRIBUTES[exercise.name] && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAttributeSheetExercise(exercise);
                              }}
                              className="text-xs bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg px-2 py-1 text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              屬性
                            </button>
                          )}
                        </div>
                        {(() => {
                          const summary: string[] = [];
                          if (exercise.is_unilateral) {
                            summary.push('單邊');
                          }
                          const attrs = EXERCISE_ATTRIBUTES[exercise.name];
                          if (attrs) {
                            attrs.forEach((field) => {
                              if (field.type === 'select') {
                                const val = exercise.exercise_attributes?.[field.key] as string;
                                if (val && val !== '標準' && val !== '無') {
                                  summary.push(val);
                                }
                              } else if (field.type === 'number') {
                                const val = exercise.exercise_attributes?.[field.key] as number;
                                if (val) {
                                  summary.push(`${val}${field.suffix || ''}`);
                                }
                              }
                            });
                          }
                          if (summary.length === 0) return null;
                          return (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {summary.map((s, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          );
                        })()}
                        <p className="text-sm text-slate-400 mt-1">
                          {completedSets === totalSets && totalSets > 0
                            ? '已完成'
                            : `進度 ${completedSets}/${totalSets}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {reorderMode && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveExercise(exercise.id, 'up');
                            }}
                            disabled={idx === 0}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveExercise(exercise.id, 'down');
                            }}
                            disabled={idx === exercises.length - 1}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExerciseMenuOpen(exerciseMenuOpen === exercise.id ? null : exercise.id);
                          }}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {exerciseMenuOpen === exercise.id && (
                          <div className="absolute right-0 top-full mt-1 bg-slate-700 border border-slate-600 rounded-xl shadow-xl z-20 min-w-[160px] overflow-hidden">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExerciseMenuOpen(null);
                                setAttributeSheetExercise(exercise);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-600 flex items-center gap-2"
                            >
                              <Timer className="w-4 h-4" />
                              設定休息時間
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExerciseMenuOpen(null);
                                setReorderMode(true);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-600 flex items-center gap-2"
                            >
                              <GripVertical className="w-4 h-4" />
                              移動動作排序
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExerciseMenuOpen(null);
                                setDeleteConfirmExercise(exercise);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-slate-600 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              刪除動作
                            </button>
                          </div>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-700/50">
                    <div className="px-4 py-3 space-y-3">
                      <div className="grid grid-cols-[36px_70px_70px_44px] gap-2 text-xs font-medium text-slate-400">
                        <span className="text-center">組</span>
                        <span className="text-center">重量</span>
                        <span className="text-center">次數</span>
                        <span></span>
                      </div>

                      {exercise.sets.map((setItem) => (
                        <div
                          key={setItem.id}
                          className={`grid grid-cols-[36px_70px_70px_44px] gap-2 items-center p-2 rounded-xl transition-all duration-200 ${
                            setItem.completed
                              ? 'bg-emerald-500/10 border border-emerald-500/30'
                              : 'bg-slate-700/30 hover:bg-slate-700/50'
                          }`}
                        >
                          <span className="font-bold text-slate-300 text-center">
                            {setItem.set_number}
                          </span>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={setItem.weight ?? ''}
                            onChange={(e) =>
                              updateSet(exercise.id, setItem.id, {
                                weight: e.target.value ? parseFloat(e.target.value) : null,
                              })
                            }
                            placeholder="-"
                            className="h-11 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-center text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          />
                          <input
                            type="number"
                            inputMode="numeric"
                            value={setItem.reps ?? ''}
                            onChange={(e) =>
                              updateSet(exercise.id, setItem.id, {
                                reps: e.target.value ? parseInt(e.target.value) : null,
                              })
                            }
                            placeholder="-"
                            className="h-11 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-center text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          />
                          <button
                            onClick={() =>
                              setItem.completed
                                ? uncompleteSet(exercise.id, setItem.id)
                                : completeSet(exercise.id, setItem)
                            }
                            className={`h-11 w-11 rounded-lg transition-all duration-200 flex items-center justify-center ${
                              setItem.completed
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-600 hover:bg-emerald-500 text-slate-300 hover:text-white'
                            }`}
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        </div>
                      ))}

                      <div className="flex gap-2">
                        <button
                          onClick={() => addSet(exercise.id)}
                          className="h-10 flex-1 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          新增一組
                        </button>
                        {exercise.sets.length > 1 && (
                          <button
                            onClick={() => {
                              const lastSet = exercise.sets[exercise.sets.length - 1];
                              removeSet(exercise.id, lastSet.id);
                            }}
                            className="h-10 flex-1 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-red-500/50 hover:text-red-400 transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            刪除一組
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {restTimer && showTimerUI && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onKeyDown={handleTimerKeydown}
        >
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-amber-400">
                <Timer className="w-5 h-5" />
                <span className="font-medium">休息時間</span>
              </div>
              <button
                onClick={dismissTimer}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-6">
              <div
                className={`text-7xl font-bold tabular-nums ${
                  restTimer.remaining === 0
                    ? 'text-emerald-400'
                    : restTimer.remaining <= 10
                    ? 'text-red-400 countdown-pulse'
                    : 'text-white'
                }`}
              >
                {formatTime(restTimer.remaining)}
              </div>
              {restTimer.remaining === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-4 border-emerald-400 pulse-ring" />
                </div>
              )}
            </div>

            <p className="text-slate-400 mb-6">
              {restTimer.remaining === 0
                ? '休息結束！'
                : `第 ${restTimer.setNumber} 組完成`}
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={resetTimer}
                className="p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              <button
                onClick={toggleTimer}
                className="p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
              >
                {restTimer.isRunning ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {attributeSheetExercise && (
        <div
          className="fixed inset-0 bg-black/60 z-50"
          onClick={() => setAttributeSheetExercise(null)}
        >
          <div
            className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 rounded-t-3xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
              <h2 className="text-lg font-semibold text-white">{attributeSheetExercise.name} 屬性</h2>
              <button
                onClick={() => setAttributeSheetExercise(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {EXERCISE_ATTRIBUTES[attributeSheetExercise.name]?.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{field.label}</label>
                  {field.type === 'select' && (
                    <div className="flex flex-wrap gap-2">
                      {field.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            const newVal =
                              attributeSheetExercise.exercise_attributes?.[field.key] === opt
                                ? null
                                : opt;
                            updateExerciseAttribute(attributeSheetExercise.id, field.key, newVal);
                            setAttributeSheetExercise({
                              ...attributeSheetExercise,
                              exercise_attributes: {
                                ...attributeSheetExercise.exercise_attributes,
                                [field.key]: newVal,
                              },
                            });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            attributeSheetExercise.exercise_attributes?.[field.key] === opt
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  {field.type === 'number' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={(attributeSheetExercise.exercise_attributes?.[field.key] as number) ?? ''}
                        onChange={(e) => {
                          const newVal = e.target.value ? parseFloat(e.target.value) : null;
                          updateExerciseAttribute(attributeSheetExercise.id, field.key, newVal);
                          setAttributeSheetExercise({
                            ...attributeSheetExercise,
                            exercise_attributes: {
                              ...attributeSheetExercise.exercise_attributes,
                              [field.key]: newVal,
                            },
                          });
                        }}
                        className="w-24 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0"
                      />
                      {field.suffix && <span className="text-slate-400">{field.suffix}</span>}
                    </div>
                  )}
                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={(attributeSheetExercise.exercise_attributes?.[field.key] as string) || ''}
                      onChange={(e) => {
                        const newVal = e.target.value || null;
                        updateExerciseAttribute(attributeSheetExercise.id, field.key, newVal);
                        setAttributeSheetExercise({
                          ...attributeSheetExercise,
                          exercise_attributes: {
                            ...attributeSheetExercise.exercise_attributes,
                            [field.key]: newVal,
                          },
                        });
                      }}
                      placeholder={field.placeholder || field.label}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  )}
                </div>
              ))}
              {UNILATERAL_EXERCISES.includes(attributeSheetExercise.name) && (
                <div className="pt-2 border-t border-slate-700">
                  <label className="block text-sm font-medium text-slate-300 mb-2">單邊訓練</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        toggleUnilateral(attributeSheetExercise.id, attributeSheetExercise.is_unilateral);
                        setAttributeSheetExercise({
                          ...attributeSheetExercise,
                          is_unilateral: !attributeSheetExercise.is_unilateral,
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        attributeSheetExercise.is_unilateral
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      單邊
                    </button>
                    <button
                      onClick={() => {
                        if (attributeSheetExercise.is_unilateral) {
                          toggleUnilateral(attributeSheetExercise.id, true);
                          setAttributeSheetExercise({
                            ...attributeSheetExercise,
                            is_unilateral: false,
                          });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        !attributeSheetExercise.is_unilateral
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      雙邊
                    </button>
                  </div>
                </div>
              )}
              <div className="pt-2 border-t border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">休息時間</label>
                <div className="flex items-center gap-2">
                  <select
                    value={Math.floor((attributeSheetExercise.rest_time ?? globalRestTime) / 60)}
                    onChange={(e) => {
                      const mins = parseInt(e.target.value, 10);
                      const secs = (attributeSheetExercise.rest_time ?? globalRestTime) % 60;
                      updateExerciseRestTime(attributeSheetExercise.id, mins * 60 + secs);
                      setAttributeSheetExercise({
                        ...attributeSheetExercise,
                        rest_time: mins * 60 + secs,
                      });
                    }}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {REST_MINUTES_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m} 分
                      </option>
                    ))}
                  </select>
                  <select
                    value={(attributeSheetExercise.rest_time ?? globalRestTime) % 60}
                    onChange={(e) => {
                      const mins = Math.floor((attributeSheetExercise.rest_time ?? globalRestTime) / 60);
                      const secs = parseInt(e.target.value, 10);
                      updateExerciseRestTime(attributeSheetExercise.id, mins * 60 + secs);
                      setAttributeSheetExercise({
                        ...attributeSheetExercise,
                        rest_time: mins * 60 + secs,
                      });
                    }}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {REST_SECONDS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s} 秒
                      </option>
                    ))}
                  </select>
                  {(attributeSheetExercise.rest_time ?? globalRestTime) !== globalRestTime && (
                    <button
                      onClick={() => {
                        updateExerciseRestTime(attributeSheetExercise.id, null);
                        setAttributeSheetExercise({
                          ...attributeSheetExercise,
                          rest_time: null,
                        });
                      }}
                      className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-700"
                    >
                      重置為預設
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  目前：{Math.floor((attributeSheetExercise.rest_time ?? globalRestTime) / 60)}:
                  {String((attributeSheetExercise.rest_time ?? globalRestTime) % 60).padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmExercise && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full mx-4">
            <p className="text-white text-center mb-6">確定要刪除此動作嗎？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmExercise(null)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  deleteExercise(deleteConfirmExercise.id);
                  setDeleteConfirmExercise(null);
                }}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest Settings Modal */}
      {showRestSettings && (
        <div
          className="fixed inset-0 bg-black/60 z-50"
          onClick={() => setShowRestSettings(false)}
        >
          <div
            className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 rounded-t-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
              <h2 className="text-lg font-semibold text-white">休息時間設定</h2>
              <button
                onClick={() => setShowRestSettings(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-slate-400 text-sm mb-4">設定全域預設休息時間</p>
              <div className="flex items-center gap-4">
                <select
                  value={Math.floor(globalRestTime / 60)}
                  onChange={(e) => {
                    const mins = parseInt(e.target.value, 10);
                    setGlobalRestTime(mins * 60 + (globalRestTime % 60));
                  }}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {REST_MINUTES_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m} 分
                    </option>
                  ))}
                </select>
                <select
                  value={globalRestTime % 60}
                  onChange={(e) => {
                    const secs = parseInt(e.target.value, 10);
                    setGlobalRestTime(Math.floor(globalRestTime / 60) * 60 + secs);
                  }}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {REST_SECONDS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s} 秒
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                <p className="text-slate-300 text-center text-lg font-medium">
                  {Math.floor(globalRestTime / 60)}:{String(globalRestTime % 60).padStart(2, '0')}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-sm mb-4">休息結束提醒</p>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">震動提醒</span>
                    <div
                      onClick={() => setVibrationEnabled(!vibrationEnabled)}
                      className={`w-12 h-7 rounded-full transition-colors ${
                        vibrationEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-1 ${
                          vibrationEnabled ? 'translate-x-6 ml-1' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">提示音提醒</span>
                    <div
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`w-12 h-7 rounded-full transition-colors ${
                        soundEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-1 ${
                          soundEnabled ? 'translate-x-6 ml-1' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Fixed Toolbar */}
      {exercises.length > 0 && !showHistory && !selectedHistoryWorkout && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700 px-4 py-3 z-40">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <button
              onClick={() => {
                initAudioContext();
                setShowRestSettings(true);
              }}
              className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl transition-colors"
            >
              <Timer className="w-5 h-5" />
              <span className="text-sm">休息計時器</span>
              <span className="text-xs text-slate-400 ml-1">
                {Math.floor(globalRestTime / 60)}:{String(globalRestTime % 60).padStart(2, '0')}
              </span>
            </button>
            <div className="flex-1" />
            {reorderMode ? (
              <button
                onClick={() => setReorderMode(false)}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
              >
                完成排序
              </button>
            ) : (
              <button
                onClick={finishWorkout}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
              >
                完成訓練
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating timer indicator when UI is hidden */}
      {restTimer?.isRunning && !showTimerUI && (
        <button
          onClick={() => setShowTimerUI(true)}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2 animate-bounce"
        >
          <Timer className="w-5 h-5" />
          <span className="tabular-nums">{formatTime(restTimer.remaining)}</span>
        </button>
      )}
    </div>
  );
}

export default App;
