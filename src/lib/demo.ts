/** Demo mode has been retired — real roles always apply. Kept as a stable no-op API. */
export function isDemoMode(): boolean {
  return false;
}

export function useDemoMode(): [boolean, (on: boolean) => void, boolean] {
  return [false, () => {}, true];
}
