import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

const AcademicYearSwitcher = ({ compact = false }: { compact?: boolean }) => {
  const { years, selectedYearId, setSelectedYearId, loading } = useAcademicYear();

  if (loading || years.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <Select value={selectedYearId || ''} onValueChange={setSelectedYearId}>
        <SelectTrigger className={compact ? 'h-8 text-xs w-[110px]' : 'h-8 text-xs w-[130px]'}>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map(y => (
            <SelectItem key={y.id} value={y.id} className="text-xs">
              {y.name}{y.is_active ? ' • Active' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AcademicYearSwitcher;
