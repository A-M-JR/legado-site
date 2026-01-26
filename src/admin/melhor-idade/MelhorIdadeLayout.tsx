import { Outlet, useNavigate, useLocation, NavLink } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import {
    Heart,
    Calendar,
    ClipboardList,
    Home,
    ArrowLeft,
    Pill,
    User
} from "lucide-react";

export default function MelhorIdadeLayout() {
    const { userProfile } = useOutletContext<{ userProfile: any }>();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: Home, label: "Início", path: "/melhor-idade" },
        { icon: Heart, label: "Saúde", path: "/melhor-idade/saude" },
        { icon: Calendar, label: "Agenda", path: "/melhor-idade/agenda" },
        { icon: ClipboardList, label: "Diário", path: "/melhor-idade/diario" },
        { icon: Pill, label: "Receitas", path: "/melhor-idade/receitas" },
    ];

    const navLinkClass = (isActive: boolean) =>
        `flex items-center gap-3 px-4 py-4 rounded-2xl font-semibold text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#5ba58c] ${isActive ? "bg-[#5ba58c] text-white shadow-lg" : "text-[#4f665a] hover:bg-[#f4fbf8]"
        }`;

    const bottomNavClass = (isActive: boolean) =>
        `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${isActive ? "text-[#5ba58c]" : "text-[#9db4aa]"
        }`;

    return (
        <div className="flex flex-col h-screen bg-[#f8fcfb]">
            <header className="h-16 bg-white border-b border-[#d1e5dc] flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="bg-[#5ba58c] p-2 rounded-xl">
                        <Heart className="text-white h-5 w-5" />
                    </div>
                    <span className="text-[#255f4f] font-bold text-lg hidden sm:inline">Melhor Idade</span>
                </div>

                <div className="flex items-center gap-3">
                    {userProfile && (
                        <div className="flex items-center gap-3 mr-2">
                            <div className="hidden sm:flex flex-col text-right">
                                <span className="text-sm font-bold text-[#255f4f]">{userProfile.nome || userProfile.email}</span>
                                <span className="text-xs text-[#6b8c7d]">{userProfile.parceiro_nome || ""}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                                {userProfile.avatar_url ? (
                                    <img src={userProfile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-5 w-5 text-[#5ba58c]" />
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => navigate("/legado-app/selecao-modulos")}
                        aria-label="Sair para seleção de jornadas"
                        className="flex items-center gap-2 text-sm font-bold text-[#5ba58c] hover:bg-[#f4fbf8] px-3 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#5ba58c] focus:ring-offset-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Sair</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="hidden md:flex w-72 lg:w-80 bg-white border-r border-[#d1e5dc] flex-col p-4 gap-3">
                    {menuItems.map((item) => (
                        <NavLink key={item.path} to={item.path} className={({ isActive }) => navLinkClass(isActive)}>
                            <item.icon className="h-6 w-6" />
                            <span className="text-sm">{item.label}</span>
                        </NavLink>
                    ))}
                </aside>

                <main className="flex-1 overflow-y-auto p-4 pb-28 md:pb-8">
                    <div className="max-w-5xl mx-auto">
                        <Outlet context={{ userProfile }} />
                    </div>
                </main>
            </div>

            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#d1e5dc] px-2 py-3 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                {menuItems.map((item) => (
                    <NavLink key={item.path} to={item.path} className={({ isActive }) => bottomNavClass(isActive)}>
                        <item.icon className="h-7 w-7" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}