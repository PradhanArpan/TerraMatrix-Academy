import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

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

function App() {
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [learningMenuOpen, setLearningMenuOpen] = useState(false);
  const learningMenuRef = useRef<HTMLDivElement | null>(null);
  const loginMenuRef = useRef<HTMLDivElement | null>(null);

  const closeMenus = () => {
    setLoginMenuOpen(false);
    setLearningMenuOpen(false);
  };

  useEffect(() => {
    const closeDropdownsOnOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      if (
        learningMenuRef.current &&
        !learningMenuRef.current.contains(target)
      ) {
        setLearningMenuOpen(false);
      }

      if (loginMenuRef.current && !loginMenuRef.current.contains(target)) {
        setLoginMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeDropdownsOnOutsideClick);
    document.addEventListener("touchstart", closeDropdownsOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeDropdownsOnOutsideClick);
      document.removeEventListener("touchstart", closeDropdownsOnOutsideClick);
    };
  }, []);

  return (
    <BrowserRouter>
      <div style={appShell}>
        <nav style={headerBar}>
          <NavLink to="/" style={brandLink} onClick={closeMenus}>
            <img src={logo} alt="TerraMatrix Academy" style={brandLogo} />
            <div style={brandTextBlock}>
              <div style={brandTitle}>TerraMatrix Academy</div>
              <div style={brandTagline}>Engineering Knowledge for Real-World Impact</div>
            </div>
          </NavLink>

          <div style={navCluster}>
            <NavLink end to="/" style={navStyle} onClick={closeMenus}>
              Home
            </NavLink>

            <div style={dropdownWrap} ref={learningMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setLearningMenuOpen((current) => !current);
                  setLoginMenuOpen(false);
                }}
                style={learningDropdownButton}
              >
                Learning Hub ▾
              </button>

              {learningMenuOpen && (
                <div style={learningMenu}>
                  <NavLink to="/learning-videos" style={dropdownItem} onClick={closeMenus}>
                    Learning Videos
                    <span style={dropdownHint}>Open video library</span>
                  </NavLink>
                  <NavLink to="/webinars" style={dropdownItem} onClick={closeMenus}>
                    Webinars
                    <span style={dropdownHint}>Live knowledge sessions</span>
                  </NavLink>
                  <NavLink to="/workshops" style={dropdownItem} onClick={closeMenus}>
                    Workshops
                    <span style={dropdownHint}>Practice-oriented events</span>
                  </NavLink>
                  <NavLink to="/student" style={dropdownItem} onClick={closeMenus}>
                    Courses
                    <span style={dropdownHint}>Structured LMS programmes</span>
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink to="/instructors" style={navStyle} onClick={closeMenus}>
              Instructors
            </NavLink>

            <div style={dropdownWrap} ref={loginMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setLoginMenuOpen((current) => !current);
                  setLearningMenuOpen(false);
                }}
                style={loginDropdownButton}
              >
                Login ▾
              </button>

              {loginMenuOpen && (
                <div style={dropdownMenu}>
                  <NavLink to="/student-login" style={dropdownItem} onClick={closeMenus}>
                    Student Login
                    <span style={dropdownHint}>Registered learners</span>
                  </NavLink>
                  <NavLink to="/instructor-login" style={dropdownItem} onClick={closeMenus}>
                    Instructor Login
                    <span style={dropdownHint}>Classroom management</span>
                  </NavLink>
                  <NavLink to="/admin" style={dropdownItem} onClick={closeMenus}>
                    Admin Login
                    <span style={dropdownHint}>Courses, events and setup</span>
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learning-videos" element={<LearningVideos />} />
          <Route path="/webinars" element={<Webinars />} />
          <Route path="/workshops" element={<Workshops />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/instructors" element={<InstructorPage />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/student-portal" element={<StudentPortal />} />
          <Route path="/student-classroom/:courseId" element={<CourseClassroom />} />
          <Route path="/instructor-login" element={<InstructorLogin />} />
          <Route path="/instructor-portal" element={<InstructorPortal />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const appShell = {
  minHeight: "100vh",
  background: "#F7F8F5",
  fontFamily: "Inter, Arial, sans-serif",
  color: "#173F35",
};

const headerBar = {
  background: "linear-gradient(90deg, rgba(255,255,255,0.98), rgba(250,247,239,0.96))",
  padding: "14px 42px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #E5E2D8",
  position: "sticky" as const,
  top: 0,
  zIndex: 300,
  backdropFilter: "blur(12px)",
  boxShadow: "0 10px 28px rgba(23,63,53,0.06)",
};

const brandLink = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  textDecoration: "none",
  color: "#173F35",
  minWidth: "360px",
};

const brandLogo = {
  height: "58px",
  width: "58px",
  objectFit: "contain" as const,
  borderRadius: "50%",
};

const brandTextBlock = { display: "grid", gap: "3px", textAlign: "left" as const };

const brandTitle = {
  fontSize: "25px",
  lineHeight: "1",
  fontWeight: 900,
  letterSpacing: "-0.3px",
  whiteSpace: "nowrap" as const,
};

const brandTagline = {
  fontSize: "13px",
  color: "#8A661E",
  fontWeight: 700,
  whiteSpace: "nowrap" as const,
};

const navCluster = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  fontWeight: 900,
};

const navStyle = ({ isActive }: { isActive: boolean }) => ({
  textDecoration: "none",
  color: "#173F35",
  background: isActive ? "#DDE9E2" : "transparent",
  padding: "11px 16px",
  borderRadius: "999px",
  border: isActive ? "1px solid #C8DBD1" : "1px solid transparent",
  whiteSpace: "nowrap" as const,
});

const dropdownWrap = { position: "relative" as const };

const learningDropdownButton = {
  background: "#173F35",
  color: "#FFFFFF",
  border: "1px solid #173F35",
  padding: "11px 17px",
  borderRadius: "999px",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: "15px",
  whiteSpace: "nowrap" as const,
};

const loginDropdownButton = {
  background: "#F0E6CF",
  color: "#173F35",
  border: "1px solid #E0D0A8",
  padding: "11px 19px",
  borderRadius: "999px",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: "15px",
  whiteSpace: "nowrap" as const,
};

const dropdownMenu = {
  position: "absolute" as const,
  top: "44px",
  right: 0,
  width: "230px",
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "12px",
  padding: "6px",
  boxShadow: "0 14px 34px rgba(23,63,53,0.16)",
  zIndex: 500,
  display: "grid",
  gap: "5px",
};

const learningMenu = {
  ...dropdownMenu,
  right: "auto",
  left: 0,
  width: "245px",
};

const dropdownItem = ({ isActive }: { isActive: boolean }) => ({
  display: "grid",
  gap: "0px",
  textDecoration: "none",
  color: "#173F35",
  background: isActive ? "#DDE9E2" : "#FBFAF6",
  border: isActive ? "1px solid #C8DBD1" : "1px solid #E8E1D2",
  padding: "6px 9px",
  borderRadius: "8px",
  fontWeight: 900,
  fontSize: "13.5px",
  lineHeight: "1.05",
  minHeight: "38px",
  alignContent: "center",
});

const dropdownHint = {
  color: "#53665E",
  fontSize: "10px",
  fontWeight: 700,
  lineHeight: "1.05",
  marginTop: "2px",
};

export default App;
