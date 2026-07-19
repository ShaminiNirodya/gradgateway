/** Radix Select treats `undefined` as uncontrolled; use a sentinel for empty controlled state. */
export const SELECT_UNSET = "__unset__";

export function toControlledSelectValue(value: string | null | undefined): string {
  if (value == null || value === "") return SELECT_UNSET;
  return value;
}

export function fromControlledSelectValue(value: string): string {
  return value === SELECT_UNSET ? "" : value;
}
