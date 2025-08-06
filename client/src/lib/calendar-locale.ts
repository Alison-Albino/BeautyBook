import { Locale } from "date-fns";

// Portuguese (Portugal) locale configuration for react-day-picker
export const ptPT: Locale = {
  code: "pt-PT",
  formatDistance: () => "",
  formatLong: {
    date: () => "dd/MM/yyyy",
    time: () => "HH:mm",
    dateTime: () => "dd/MM/yyyy HH:mm",
  } as any,
  formatRelative: () => "",
  localize: {
    ordinalNumber: (n: number) => `${n}º`,
    era: () => "",
    quarter: () => "",
    month: (n: number) => {
      const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];
      return months[n];
    },
    day: (n: number) => {
      const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
      return days[n];
    },
    dayPeriod: () => "",
  },
  match: {} as any,
  options: {
    weekStartsOn: 1, // Monday
    firstWeekContainsDate: 4,
  },
};