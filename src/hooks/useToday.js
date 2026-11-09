import { useState, useMemo, useCallback } from 'react';
import { format, addDays, subDays, isToday, parseISO } from 'date-fns';

export function useToday() {
  const [selectedDateStr, setSelectedDateStr] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  const selectedDate = useMemo(() => {
    try {
      return parseISO(selectedDateStr);
    } catch {
      return new Date();
    }
  }, [selectedDateStr]);

  const formattedDate = useMemo(() => {
    try {
      return format(selectedDate, 'EEEE, MMMM d');
    } catch {
      return selectedDateStr;
    }
  }, [selectedDate, selectedDateStr]);

  const isCurrentDay = useMemo(() => {
    return isToday(selectedDate);
  }, [selectedDate]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning ☀️';
    if (hour < 17) return 'Good afternoon 🌸';
    return 'Good evening 🌙';
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDateStr(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const goToPrevDay = useCallback(() => {
    setSelectedDateStr(prev => {
      const d = parseISO(prev);
      return format(subDays(d, 1), 'yyyy-MM-dd');
    });
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDateStr(prev => {
      const d = parseISO(prev);
      return format(addDays(d, 1), 'yyyy-MM-dd');
    });
  }, []);

  const setDateStr = useCallback((dateStr) => {
    setSelectedDateStr(dateStr);
  }, []);

  return {
    selectedDate,
    selectedDateStr,
    formattedDate,
    isToday: isCurrentDay,
    greeting,
    goToToday,
    goToPrevDay,
    goToNextDay,
    setDateStr,
  };
}
