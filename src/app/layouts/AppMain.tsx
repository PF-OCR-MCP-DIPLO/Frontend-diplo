import { Outlet } from 'react-router-dom';

export function AppMain() {
  return (
    <main id='app-main' className='flex-1 p-4 sm:p-6'>
      <div className='page-shell'>
        <Outlet />
      </div>
    </main>
  );
}