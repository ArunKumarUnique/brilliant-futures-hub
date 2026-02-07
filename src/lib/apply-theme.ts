import { TenantTheme } from '@/types/tenant';

export const applyTheme = (theme: TenantTheme) => {
  const root = document.documentElement;

  const vars: Record<string, string> = {
    '--primary': theme.primary,
    '--primary-foreground': theme.primaryForeground,
    '--secondary': theme.secondary,
    '--secondary-foreground': theme.secondaryForeground,
    '--accent': theme.accent,
    '--accent-foreground': theme.accentForeground,
    '--background': theme.background,
    '--foreground': theme.foreground,
    '--card': theme.card,
    '--card-foreground': theme.cardForeground,
    '--muted': theme.muted,
    '--muted-foreground': theme.mutedForeground,
    '--destructive': theme.destructive,
    '--destructive-foreground': theme.destructiveForeground,
    '--border': theme.border,
    '--input': theme.input,
    '--ring': theme.ring,
    '--radius': theme.radius,
  };

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  document.body.style.fontFamily = theme.fontFamily;

  // Dynamically load tenant font
  if (theme.fontImportUrl) {
    const existingLink = document.querySelector('link[data-tenant-font]');
    if (existingLink) existingLink.remove();

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = theme.fontImportUrl;
    link.setAttribute('data-tenant-font', 'true');
    document.head.appendChild(link);
  }
};
