export const COLORS = {
  background: '#0D0F1A',
  surface: '#161829',
  card: '#1E2035',
  cardHighlight: '#252840',
  aquamarine: '#5DFFC2',
  aquamarineDark: '#3ECFA0',
  aquamarineMuted: 'rgba(93, 255, 194, 0.12)',
  green: '#34D399',
  greenBg: 'rgba(52, 211, 153, 0.15)',
  red: '#F87171',
  redBg: 'rgba(248, 113, 113, 0.15)',
  white: '#F1F5F9',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#2A2D45',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export const formatCurrency = (value) => {
  return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};
