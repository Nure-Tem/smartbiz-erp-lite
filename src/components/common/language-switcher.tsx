import { Languages } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/use-language';

export function LanguageSwitcher() {
  const { language, setLanguage, languages, t } = useLanguage();

  return (
    <Select value={language} onValueChange={(v) => setLanguage(v as typeof language)}>
      <SelectTrigger
        className="h-9 w-[9.5rem] gap-1.5 text-xs sm:text-sm"
        aria-label={t('language.label')}
      >
        <Languages className="size-4 shrink-0 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {languages.map(({ code, label }) => (
          <SelectItem key={code} value={code} className="text-sm">
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
