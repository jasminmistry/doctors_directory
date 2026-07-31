// Stricter than a bare "has an @ and a dot" check: requires the local part to start and end
// with an alphanumeric character (so "-________----@gmail.com" is rejected) and to contain no
// leading/trailing/consecutive dots; domain labels must likewise start and end alphanumeric.
export const EMAIL_RE =
  /^(?!.*\.\.)[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}
