import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white h-screen">
      <nav className="mt-5 px-2">
        <ul className="space-y-1">
          <li>
            <a
              href="#"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-700"
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-700"
            >
              POS
            </a>
          </li>
          <li>
            <a
              href="#"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-700"
            >
              Inventory
            </a>
          </li>
          <li>
            <a
              href="#"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-700"
            >
              Customers
            </a>
          </li>
          <li>
            <a
              href="#"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-700"
            >
              Reports
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
