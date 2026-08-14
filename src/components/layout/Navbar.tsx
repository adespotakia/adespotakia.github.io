import { useState } from "react";
import { Link, useLocation } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const {
    user,
    isAuthenticated,
    logout
  } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleLogout = async () => {
    await logout();
  };
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  const isActive = (path: string) => location.pathname === path;

  // Top-level text links shown before the dropdowns
  const navigation = [{
    name: "Αρχική",
    path: "/"
  }, {
    name: "Χάρτης",
    path: "/strays-map"
  }];

  // Top-level text links shown after the dropdowns
  const trailingNavigation = [{
    name: "Φόρουμ",
    path: "/forum"
  }];




  // Items grouped under the "Δίκτυο" dropdown
  const networkMenu = [{
    name: "Προτάσεις",
    path: "/feedback"
  }, {
    name: "Υιοθεσίες",
    path: "/stray-adoptions"
  }, {
    name: "Χαμένα",
    path: "/lost-strays"
  }];


  const NavTextLink = ({
    to,
    name,
    onClick
  }: {
    to: string;
    name: string;
    onClick?: () => void;
  }) => <Link to={to} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(to) ? "bg-strays-orange text-white" : "text-gray-700 hover:text-strays-orange hover:bg-orange-50"}`} onClick={onClick}>
      {name}
    </Link>;

  if (isMobile) {
    return <>
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-3">
                <Link to="/" className="flex-shrink-0">
                  <img src="/lovable-uploads/logo.png" alt="Αδέσπολις" className="h-40 w-40" />
                </Link>
                <Link to="/" className="text-xl font-bold text-strays-orange">
                  Αδέσπολις
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                {isAuthenticated ? <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {(user?.username || user?.email)?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-[2000]" align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Προφίλ</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Αποσύνδεση</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu> : <button onClick={toggleMobileMenu} className="p-2 rounded-md text-gray-700 hover:text-strays-orange">
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </button>}
              </div>
            </div>
          </div>
        </nav>

        {isAuthenticated && isMobileMenuOpen && <div className="fixed inset-0 z-50 bg-white">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center space-x-3">
                <Link to="/" onClick={closeMobileMenu}>
                  <img className="h-8 w-auto" src="/lovable-uploads/logo.png" alt="Αδέσπολις" />
                </Link>
                <Link to="/" onClick={closeMobileMenu} className="text-xl font-bold text-strays-orange">
                  Αδέσπολις
                </Link>
              </div>
              <button onClick={closeMobileMenu} className="p-2 rounded-md text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-4 py-6 space-y-2">
              {navigation.map(item => <Link key={item.name} to={item.path} className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.path) ? "bg-strays-orange text-white" : "text-gray-700 hover:text-strays-orange hover:bg-orange-50"}`} onClick={closeMobileMenu}>
                  {item.name}
                </Link>)}

              <div className="pt-2">
                <Link to="/map" className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/map") ? "bg-strays-orange text-white" : "text-gray-700 hover:text-strays-orange hover:bg-orange-50"}`} onClick={closeMobileMenu}>
                  Αναφορές
                </Link>
              </div>


              <div className="pt-2">
                <p className="px-3 py-1 text-xs font-semibold uppercase text-gray-400">Δίκτυο</p>
                {networkMenu.map(item => <Link key={item.name} to={item.path} className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.path) ? "bg-strays-orange text-white" : "text-gray-700 hover:text-strays-orange hover:bg-orange-50"}`} onClick={closeMobileMenu}>
                    {item.name}
                  </Link>)}
              </div>

              {trailingNavigation.map(item => <Link key={item.name} to={item.path} className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.path) ? "bg-strays-orange text-white" : "text-gray-700 hover:text-strays-orange hover:bg-orange-50"}`} onClick={closeMobileMenu}>
                  {item.name}
                </Link>)}
            </div>
          </div>}
      </>;
  }

  return <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex-shrink-0">
              <img src="/lovable-uploads/logo.png" alt="Αδέσπολις" className="h-20 w-auto" />
            </Link>
            <Link to="/" className="text-xl font-bold text-strays-orange">
              Αδέσπολις
            </Link>
          </div>

          {isAuthenticated && <div className="hidden md:flex items-center space-x-2">
            {navigation.map(item => <NavTextLink key={item.name} to={item.path} name={item.name} />)}
            <NavTextLink to="/map" name="Αναφορές" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-strays-orange hover:bg-orange-50 transition-colors">
                  Δίκτυο
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white border border-gray-200 shadow-lg z-[2000]" align="start">
                {networkMenu.map(item => <DropdownMenuItem key={item.name} asChild>
                    <Link to={item.path}>{item.name}</Link>
                  </DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
            {trailingNavigation.map(item => <NavTextLink key={item.name} to={item.path} name={item.name} />)}
          </div>}

          <div className="flex items-center space-x-4">
            {isAuthenticated ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 px-3 rounded-full">
                    <span className="text-sm text-gray-700">
                      {user?.username || user?.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-[2000]" align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Προφίλ</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Αποσύνδεση</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link to="/login">Σύνδεση</Link>
                </Button>
              </div>}
          </div>
        </div>
      </div>
    </nav>;
};
export default Navbar;
