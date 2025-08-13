import { useColorScheme } from 'react-native';

export const lightTheme = {
  background: '#fff',
  text: '#000',
  inputBorder: '#ddd',
  placeholder: '#666',
  button: '#007bff',
  buttonText: '#fff',
  error: '#d9534f',
};

export const darkTheme = {
  background: '#121212',
  text: '#fff',
  inputBorder: '#333',
  placeholder: '#aaa',
  button: '#1e88e5',
  buttonText: '#fff',
  error: '#ff6b6b',
};

export const useTheme = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
};
