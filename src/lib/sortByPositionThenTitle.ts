export function sortByPositionThenTitle<T>(
  items: T[],
  getPosition: (item: T) => number | undefined,
  getTitle: (item: T) => string
): T[] {
  return [...items].sort((a, b) => {
    const aPos = getPosition(a) ?? Number.POSITIVE_INFINITY;
    const bPos = getPosition(b) ?? Number.POSITIVE_INFINITY;

    if (aPos !== bPos) return aPos - bPos;
    return getTitle(a).localeCompare(getTitle(b));
  });
}
