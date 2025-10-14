import { useState, useEffect } from 'react';
import {
    Home, CheckSquare, Calendar, ShoppingCart, Settings
} from 'lucide-react';

interface BottomNavigationProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    className?: string;
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
    { id: 'more', label: 'More', icon: Settings }
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
    activeTab,
    onTabChange,
    className = ''
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    useEffect(() => {
        if (!isMobile) return;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show when scrolling up, hide when scrolling down
            if (currentScrollY < lastScrollY || currentScrollY < 50) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, isMobile]);

    // Don't show on desktop
    if (!isMobile) {
        return null;
    }

    return (
        <nav
            className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg transition-transform duration-300 z-50 pb-safe ${isVisible ? 'translate-y-0' : 'translate-y-full'} ${className}`}
        >
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive
                                ? 'text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-2' : ''}`} />
                            <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNavigation;

