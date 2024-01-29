export function abbreviate(name?: string | null) {
  return name
    ?.match(/\b([A-Za-z0-9])/g)
    ?.join("")
    .toUpperCase();
}
