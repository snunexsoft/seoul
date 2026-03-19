'use client';

import { useState, useEffect } from 'react';

interface HeaderProps {
  currentPage?: string;
}

interface MenuItem {
  id: number;
  name: string;
  url: string;
  type: string;
  children?: MenuItem[];
}

const Header = ({ currentPage = '' }: HeaderProps) => {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/public/menus');
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="h-[200px] bg-white relative z-[1000]">
      <div className="max-w-[1920px] mx-auto h-full flex items-center justify-between px-10">
        {/* Logo */}
        <div className="logo">
          <a href="/">
            <img 
              src="/img/main_logo.png" 
              alt="서울대학교 탄소중립 캠퍼스" 
              className="h-[60px] w-auto max-w-[400px]"
            />
          </a>
        </div>

        {/* Navigation */}
        <nav className="relative ml-auto">
          <ul className="flex list-none gap-0 m-0 p-0 h-[200px] items-center justify-end">
            {menuItems.map((item) => (
              <li 
                key={item.id}
                className="relative h-full flex items-center"
                onMouseEnter={() => item.children && item.children.length > 0 && setDropdownOpen(item.id.toString())}
                onMouseLeave={() => item.children && item.children.length > 0 && setDropdownOpen(null)}
              >
                {(!item.children || item.children.length === 0) ? (
                  <a
                    href={item.url}
                    className={`
                      block px-[15px] text-[#424443] no-underline font-medium text-[1.3rem] 
                      transition-all duration-300 relative h-[200px] flex items-center
                      hover:text-[#6ECD8E] font-['SUIT']
                      ${currentPage === item.url ? 'text-[#6ECD8E]' : ''}
                      after:content-[''] after:absolute after:bottom-[80px] after:left-1/2 
                      after:transform after:-translate-x-1/2 after:w-0 after:h-[3px] 
                      after:bg-[#53BD6A] after:transition-all after:duration-300
                      hover:after:w-[calc(100%-30px)]
                      ${currentPage === item.url ? 'after:w-[calc(100%-30px)]' : ''}
                    `}
                  >
                    {item.name}
                  </a>
                ) : (
                  <span
                    className="
                      block px-[15px] text-[#424443] no-underline font-medium text-[1.3rem] 
                      transition-all duration-300 relative h-[200px] flex items-center
                      hover:text-[#6ECD8E] cursor-pointer font-['SUIT']
                    "
                  >
                    {item.name}
                  </span>
                )}

                {/* Dropdown Menu */}
                {item.children && item.children.length > 0 && (
                  <div className={`
                    absolute top-[120px] left-0 bg-white min-w-[200px] 
                    shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-lg
                    transition-all duration-300 z-[1000] py-4
                    ${dropdownOpen === item.id.toString() 
                      ? 'opacity-100 visible translate-y-0' 
                      : 'opacity-0 invisible -translate-y-2'
                    }
                  `}>
                    {item.children.map((childItem) => (
                      <a
                        key={childItem.id}
                        href={childItem.url}
                        className="
                          block py-3 px-6 text-[#424443] no-underline text-[0.9rem] 
                          font-normal transition-all duration-300 border-b border-[#f1f5f9]
                          hover:bg-[#F5FDE7] hover:text-[#6ECD8E]
                          last:border-b-0
                        "
                      >
                        {childItem.name}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 