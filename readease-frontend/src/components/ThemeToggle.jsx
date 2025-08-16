import { useTheme } from '../ThemeContext';
import Switch from 'react-switch';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Switch
      onChange={toggleTheme}
      checked={theme === 'dark'}
      offColor="#ccc"
      onColor="#1100FF"
      uncheckedIcon={false}
      checkedIcon={false}
    />
  );
};

export default ThemeToggle;
