import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CalendarPlus, Utensils, CheckSquare, LineChart } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/log', label: 'Activity', icon: CalendarPlus },
  { path: '/nutrition', label: 'Nutrition', icon: Utensils },
  { path: '/routine', label: 'Quests', icon: CheckSquare },
  { path: '/history', label: 'Progress', icon: LineChart },
];

export function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-ink-200">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-150 select-none min-w-[56px] ${
                isActive
                  ? 'border-2 border-pandaOrange-500 bg-pandaOrange-50 text-pandaOrange-600 font-black shadow-sm'
                  : 'text-ink-400 font-extrabold hover:text-ink-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-6 h-6 transition-transform duration-150 ${
                    isActive ? 'scale-110 text-pandaOrange-600' : 'text-ink-400'
                  }`}
                  strokeWidth={isActive ? 3 : 2.2}
                />
                <span className={`text-[10px] tracking-tight mt-0.5 leading-tight ${isActive ? 'text-pandaOrange-600 font-black' : 'text-ink-500 font-bold'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
