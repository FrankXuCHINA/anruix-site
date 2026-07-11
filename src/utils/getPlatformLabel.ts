const platformLabels: Record<string, string> = {
  facebook: "Facebook",
  mail: "邮件",
  pinterest: "Pinterest",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  x: "X",
};

export function getPlatformLabel(name: string): string {
  return (
    platformLabels[name.toLowerCase()] ??
    name.charAt(0).toUpperCase() + name.slice(1)
  );
}
