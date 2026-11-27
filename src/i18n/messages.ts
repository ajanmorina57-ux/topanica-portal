import type { AbstractIntlMessages } from "next-intl";

type NamespaceSelection = Record<string, true | readonly string[]>;

/** Filters a locale message dictionary down to only the namespaces and keys needed by client components. */
export function pickMessages(
  messages: AbstractIntlMessages,
  selection: NamespaceSelection,
): AbstractIntlMessages {
  const picked: AbstractIntlMessages = {};
  for (const [namespace, keys] of Object.entries(selection)) {
    const source = messages[namespace];
    if (!source || typeof source !== "object" || Array.isArray(source)) continue;
    if (keys === true) {
      picked[namespace] = source;
      continue;
    }
    const subset: AbstractIntlMessages = {};
    const record = source as Record<string, AbstractIntlMessages[string]>;
    for (const key of keys) {
      if (key in record) {
        subset[key] = record[key];
      }
    }
    picked[namespace] = subset;
  }
  return picked;
}

export const GLOBAL_CLIENT_MESSAGES = {
  Header: ["navAria", "navNews", "navHistory", "navGallery"],
  LanguageSwitcher: true,
} as const satisfies NamespaceSelection;

export const ADMIN_CLIENT_MESSAGES = {
  ...GLOBAL_CLIENT_MESSAGES,
  Dropzone: true,
} as const satisfies NamespaceSelection;
