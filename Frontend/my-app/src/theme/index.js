import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  semanticTokens: {
    colors: {
      appBg: {
        default: '#f7f7f9',        
        _dark:    '#0d0d12',       
      },
      panelBg: {
        default: '#ffffff',
        _dark:    '#15151c',
      },
      cardBg: {
        default: '#ffffff',
        _dark:    '#17171f',
      },
      appBorder: {
        default: '#e4e4e7',
        _dark:    '#262630',
      },
      appText: {
        default: '#18181b',
        _dark:    '#e4e4e7',
      },
      appMuted: {
        default: '#52525b',
        _dark:    '#a1a1aa',
      },
      appAccent: {
        default: '#7c3aed',
        _dark:    '#8b5cf6',
      },
    },
  },
});

export default theme;