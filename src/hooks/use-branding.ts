import { useBrandingContext } from '@/lib/branding-context'

/** Atalho para telas que só leem a marca resolvida (não precisam editá-la). */
export function useBranding() {
  return useBrandingContext().branding
}
