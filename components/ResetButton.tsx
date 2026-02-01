'use client';

import { useTypingStore } from '@/lib/store/typing-store';

export default function ResetButton() {
  const { reset } = useTypingStore();

  return (
    <button
      onClick={reset}
      className="rounded-md bg-gray-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
    >
      Reset
    </button>
  );
}
