import Link from 'next/link';
import { Tab } from '@headlessui/react';
import { useRouter } from 'next/router';

const NavTabs = () => {
  const router = useRouter();
  const nav = [
    { name: 'Trade', href: '/trade' },
    { name: 'Pool', href: '/pool' },
  ];

  return (
    <div className="flex items-center justify-center">
      <Tab.Group>
        <Tab.List className="flex py-1 px-1.5 space-x-1 bg-gray-800 rounded-xl">
          {nav.map((x) => (
            <Tab
              as="div"
              key={x.name}
              className={`py-1 px-2 w-full rounded-lg focus:outline-none ${
                router.pathname.includes(x.href) ? 'bg-gray-700/70 ' : 'dark:hover:text-gray-300 hover:text-gray-600'
              }`}
            >
              <Link href={x.href} key={x.name} passHref>
                {x.name}
              </Link>
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels></Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default NavTabs;
