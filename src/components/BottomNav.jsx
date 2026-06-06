import { NavLink } from 'react-router-dom'
import { CheckSquare, DollarSign } from 'lucide-react'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
      <div className="max-w-md mx-auto flex">
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-indigo-600' : 'text-gray-400'
            }`
          }
        >
          <CheckSquare size={22} />
          Tasks
        </NavLink>
        <NavLink
          to="/spend"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-indigo-600' : 'text-gray-400'
            }`
          }
        >
          <DollarSign size={22} />
          Spend
        </NavLink>
      </div>
    </nav>
  )
}
