import { useEffect, useRef, useState } from "react";
import { HashRouter, Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  GraduationCap,
  LogIn,
  Menu,
  Moon,
  PlayCircle,
  Search,
  Sun,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import LearningVideos from "./pages/LearningVideos";
import Webinars from "./pages/Webinars";
import Workshops from "./pages/Workshops";
import CourseDetail from "./pages/CourseDetail";
import InstructorPage from "./pages/InstructorPage";
import StudentLogin from "./pages/StudentLogin";
import StudentPortal from "./pages/StudentPortal";
import CourseClassroom from "./pages/CourseClassroom";
import InstructorLogin from "./pages/InstructorLogin";
import InstructorPortal from "./pages/InstructorPortal";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import logo from "./assets/terramatrix-logo.png";
import { cachePublicBootstrap, hasAppsScriptRuntime, loadPublicBootstrap } from "./lib/appsScriptApi";
import "./styles/design-system.css";
import "./styles/mobile.css";

type ThemeMode = "light" | "dark";

const workspaceRoutes = ["/student-portal", "/student-classroom", "/instructor-portal", "/admin"];

function isWorkspacePath(pathname: string) {
  return workspaceRoutes.some((path) => pathname.startsWith(path));
}

function AppRoutes() {
  const location = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bootState, setBootState] = useState<"loading" | "ready" | "warning">("loading");
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("terramatrix_theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const exploreRef = useRef<HTMLDivElement | null>(null);
  const loginRef = useRef<HTMLDivElement | null>(null);

  const closeMenus = () => {
    setLoginOpen(false);
    setExploreOpen(false);
    setMobileOpen(false);
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("terramatrix_theme", theme);
  }, [theme]);

  useEffect(() => {
    closeMenus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      if (!hasAppsScriptRuntime()) {
        setBootState("ready");
        return;
      }
      try {
        await loadPublicBootstrap();
        if (active) setBootState("ready");
      } catch (error) {
        console.error("TerraMatrix public data could not be loaded.", error);
        cachePublicBootstrap({
          settings: [], categories: [], courses: [], instructors: [], learningVideos: [], webinars: [], workshops: [], learningTools: [],
        });
        if (active) setBootState("warning");
      }
    };
    void bootstrap();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const outside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (exploreRef.current && !exploreRef.current.contains(target)) setExploreOpen(false);
      if (loginRef.current && !loginRef.current.contains(target)) setLoginOpen(false);
    };
    const keydown = (event: KeyboardEvent) => { if (event.key === "Escape") closeMenus(); };
    document.addEventListener("mousedown", outside);
    document.addEventListener("touchstart", outside);
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("touchstart", outside);
      document.removeEventListener("keydown", keydown);
    };
  }, []);

  if (bootState === "loading") {
    return (
      <div className="tm3-bootstrap" role="status" aria-live="polite">
        <div className="tm3-bootstrap__brand"><img src={logo} alt="" /></div>
        <div>
          <span>TerraMatrix Academy</span>
          <strong>Preparing your engineering intelligence platform</strong>
          <div className="tm3-loader"><i /></div>
        </div>
      </div>
    );
  }

  const workspace = isWorkspacePath(location.pathname);

  return (
    <div className={`tm3-app ${workspace ? "tm3-app--workspace" : ""}`}>
      <a className="tm3-skip" href="#tm-main-content">Skip to main content</a>

      {!workspace && (
        <>
          <div className="tm3-topline">
            <span>Engineering Intelligence Platform</span>
            <span className="tm3-topline__message">Learn · Practice · Research · Collaborate · Certify</span>
            <Link to="/student">Explore programmes <ArrowUpRight size={14} /></Link>
          </div>

          <header className="tm3-header">
            <div className="tm3-header__inner">
              <Link to="/" className="tm3-brand" onClick={closeMenus}>
                <img src={logo} alt="TerraMatrix Academy" />
                <span>
                  <strong>TerraMatrix</strong>
                  <small>Academy</small>
                </span>
              </Link>

              <nav className={`tm3-nav ${mobileOpen ? "is-open" : ""}`} aria-label="Primary navigation">
                <NavLink end to="/" className={({ isActive }) => isActive ? "is-active" : ""}>Academy</NavLink>

                <div className="tm3-nav-dropdown" ref={exploreRef}>
                  <button type="button" onClick={() => { setExploreOpen((value) => !value); setLoginOpen(false); }} aria-expanded={exploreOpen}>
                    Explore <ChevronDown size={15} />
                  </button>
                  {exploreOpen && (
                    <div className="tm3-mega-menu">
                      <Link to="/student" onClick={closeMenus}>
                        <span className="tm3-menu-icon"><GraduationCap size={20} /></span>
                        <span><strong>Courses & programmes</strong><small>Structured pathways for students and professionals</small></span>
                      </Link>
                      <Link to="/learning-videos" onClick={closeMenus}>
                        <span className="tm3-menu-icon"><PlayCircle size={20} /></span>
                        <span><strong>Learning library</strong><small>Recorded lessons, demonstrations and explainers</small></span>
                      </Link>
                      <Link to="/webinars" onClick={closeMenus}>
                        <span className="tm3-menu-icon"><UsersRound size={20} /></span>
                        <span><strong>Webinars</strong><small>Expert conversations and knowledge sessions</small></span>
                      </Link>
                      <Link to="/workshops" onClick={closeMenus}>
                        <span className="tm3-menu-icon"><BriefcaseBusiness size={20} /></span>
                        <span><strong>Workshops</strong><small>Practice-led, hands-on learning experiences</small></span>
                      </Link>
                    </div>
                  )}
                </div>

                <NavLink to="/instructors" className={({ isActive }) => isActive ? "is-active" : ""}>Faculty</NavLink>
                <NavLink to="/student" className={({ isActive }) => isActive ? "is-active" : ""}>Catalogue</NavLink>

                <div className="tm3-nav-dropdown tm3-nav-dropdown--right" ref={loginRef}>
                  <button className="tm3-login-trigger" type="button" onClick={() => { setLoginOpen((value) => !value); setExploreOpen(false); }} aria-expanded={loginOpen}>
                    <LogIn size={16} /> Sign in <ChevronDown size={15} />
                  </button>
                  {loginOpen && (
                    <div className="tm3-login-menu">
                      <Link to="/student-login" onClick={closeMenus}><GraduationCap size={18} /><span><strong>Learner</strong><small>My learning and classroom</small></span></Link>
                      <Link to="/instructor-login" onClick={closeMenus}><UserRound size={18} /><span><strong>Instructor</strong><small>Courses, classes and learners</small></span></Link>
                      <Link to="/admin-login" onClick={closeMenus}><BookOpen size={18} /><span><strong>Admin</strong><small>Academy operations</small></span></Link>
                    </div>
                  )}
                </div>
              </nav>

              <div className="tm3-header-actions">
                <Link className="tm3-search-link" to="/student" aria-label="Search programmes"><Search size={18} /></Link>
                <button className="tm3-theme" type="button" onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button className="tm3-menu-button" type="button" onClick={() => setMobileOpen((value) => !value)} aria-expanded={mobileOpen} aria-label={mobileOpen ? "Close menu" : "Open menu"}>
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </header>
        </>
      )}

      {workspace && (
        <button className="tm3-workspace-theme" type="button" onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}

      {bootState === "warning" && !workspace && (
        <div className="tm3-system-warning">The shared catalogue is temporarily unavailable. Please refresh in a moment.</div>
      )}

      <div id="tm-main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/learning-videos" element={<LearningVideos />} />
          <Route path="/webinars" element={<Webinars />} />
          <Route path="/workshops" element={<Workshops />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/instructors" element={<InstructorPage />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/student-portal" element={<StudentPortal />} />
          <Route path="/student-classroom/:courseId" element={<CourseClassroom />} />
          <Route path="/instructor-login" element={<InstructorLogin />} />
          <Route path="/instructor-portal" element={<InstructorPortal />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>

      {!workspace && (
        <footer className="tm3-footer">
          <div className="tm3-footer__main">
            <div className="tm3-footer__brand">
              <img src={logo} alt="" />
              <div><strong>TerraMatrix Academy</strong><span>Engineering intelligence for lifelong learning.</span></div>
            </div>
            <div>
              <h3>Explore</h3>
              <Link to="/student">Courses</Link><Link to="/learning-videos">Learning library</Link><Link to="/webinars">Webinars</Link><Link to="/workshops">Workshops</Link>
            </div>
            <div>
              <h3>Academy</h3>
              <Link to="/instructors">Faculty</Link><Link to="/student-login">Learner login</Link><Link to="/instructor-login">Instructor login</Link>
            </div>
            <div className="tm3-footer__statement">
              <h3>Built for applied learning</h3>
              <p>Connecting education, practice, research, innovation and professional growth in one engineering ecosystem.</p>
            </div>
          </div>
          <div className="tm3-footer__bottom"><span>© {new Date().getFullYear()} TerraMatrix Academy</span><span>Accessible · Responsive · Practice-led</span></div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return <HashRouter><AppRoutes /></HashRouter>;
}
