import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import TestDetail from "./pages/TestDetail";
import ResultPage from "./pages/ResultPage";
import Leaderboard from "./pages/Leaderboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import CertificatePage from "./pages/CertificatePage";
import Header from "./components/Header";
import RequireAdmin from "./components/RequireAdmin";
import logoDark from "./assets/ui/logo/logo-dark.png";
import logoLight from "./assets/ui/logo/logo-light.png";
import "./App.css";
import TestSessionPage from "./pages/TestSessionPage";
import api from "./utils/api";
import { CustomDropdown, MultiSelectDropdown } from "./components/common/Dropdowns";
import { useI18n } from "./i18n";
import { useTheme } from "./theme";
import LoginPage from "./pages/LoginPage";
import StaffPage from "./pages/StaffPage";

function HomePage() {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const [tests, setTests] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [siteSettings, setSiteSettings] = useState({
    ticker_text: "",
    ticker_enabled: false,
    required_subject_count: 3,
  });

  const [selectedTests, setSelectedTests] = useState([]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+998");
  const [gender, setGender] = useState("male");

  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");

  const navigate = useNavigate();
  const logoSrc = resolvedTheme === "dark" ? logoDark : logoLight;

  const fieldStyle = {
    width: "100%",
    height: "56px",
    padding: "14px 16px",
    borderRadius: "var(--app-radius-md)",
    border: "1px solid var(--app-control-border)",
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
    background: "var(--app-control-bg)",
    color: "var(--app-text)",
  };

  useEffect(() => {
    Promise.all([
      api.get("tests/"),
      api.get("regions/"),
      api.get("site-settings/"),
    ])
      .then(([testsRes, regionsRes, settingsRes]) => {
        setTests(testsRes.data);
        setRegions(regionsRes.data);
        setSiteSettings({
          ticker_text: settingsRes.data.ticker_text || "",
          ticker_enabled: !!settingsRes.data.ticker_enabled,
          required_subject_count: settingsRes.data.required_subject_count || 3,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("home.loadError");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!regionId) {
      return;
    }

    api
      .get(`regions/${regionId}/districts/`)
      .then((res) => {
        setDistricts(res.data);
      })
      .catch((err) => console.error(err));
  }, [regionId]);

  useEffect(() => {
    if (!districtId) {
      return;
    }

    api
      .get(`districts/${districtId}/schools/`)
      .then((res) => {
        setSchools(res.data);
      })
      .catch((err) => console.error(err));
  }, [districtId]);

  useEffect(() => {
    if (!schoolId) {
      return;
    }

    api
      .get(`schools/${schoolId}/classes/`)
      .then((res) => {
        setClasses(res.data);
      })
      .catch((err) => console.error(err));
  }, [schoolId]);

  useEffect(() => {
    if (!classId) {
      return;
    }

    api
      .get(`classes/${classId}/sections/`)
      .then((res) => {
        setSections(res.data);
      })
      .catch((err) => console.error(err));
  }, [classId]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFullName(value.replace(/[0-9]/g, ""));
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;

    if (!value.startsWith("+998")) {
      value = "+998";
    }

    const tail = value.slice(4).replace(/\D/g, "").slice(0, 9);
    setPhone(`+998${tail}`);
  };

  const handlePhoneKeyDown = (e) => {
    const cursorPosition = e.target.selectionStart;
    if ((e.key === "Backspace" || e.key === "Delete") && cursorPosition <= 4) {
      e.preventDefault();
    }
  };

  const handleRegionChange = (item) => {
    setRegionId(item.id);
    setDistricts([]);
    setDistrictId("");
    setSchools([]);
    setSchoolId("");
    setClasses([]);
    setClassId("");
    setSections([]);
    setSectionId("");
    setSelectedTests([]);
  };

  const handleDistrictChange = (item) => {
    setDistrictId(item.id);
    setSchools([]);
    setSchoolId("");
    setClasses([]);
    setClassId("");
    setSections([]);
    setSectionId("");
    setSelectedTests([]);
  };

  const handleSchoolChange = (item) => {
    setSchoolId(item.id);
    setClasses([]);
    setClassId("");
    setSections([]);
    setSectionId("");
    setSelectedTests([]);
  };

  const handleClassChange = (item) => {
    setClassId(item.id);
    setSections([]);
    setSectionId("");
    setSelectedTests([]);
  };

  const handleSectionChange = (item) => {
    setSectionId(item.id);
    setSelectedTests([]);
  };

  const validateForm = () => {
    const phoneRegex = /^\+998\d{9}$/;

    if (!fullName.trim()) {
      alert(t("home.validationNameRequired"));
      return false;
    }

    if (/\d/.test(fullName)) {
      alert(t("home.validationNameNoDigits"));
      return false;
    }

    if (!phoneRegex.test(phone)) {
      alert(t("home.validationPhone"));
      return false;
    }

    if (!regionId || !districtId || !schoolId || !classId || !sectionId) {
      alert(t("home.validationSelections"));
      return false;
    }

    if (selectedTests.length !== siteSettings.required_subject_count) {
      alert(
        t("home.validationSubjectCount", {
          count: siteSettings.required_subject_count,
        })
      );
      return false;
    }

    return true;
  };

  const handleToggleTest = (testId) => {
    setSelectedTests((prev) => {
      const exists = prev.includes(testId);

      if (exists) {
        return prev.filter((id) => id !== testId);
      }

      if (prev.length >= siteSettings.required_subject_count) {
        alert(
          t("home.maxSubjectCount", {
            count: siteSettings.required_subject_count,
          })
        );
        return prev;
      }

      return [...prev, testId];
    });
  };

const handleStartSelected = async () => {
  if (!validateForm()) return;

  const payload = {
    full_name: fullName.trim(),
    phone,
    gender,
    region_id: Number(regionId),
    district_id: Number(districtId),
    school_id: Number(schoolId),
    school_class_id: Number(classId),
    class_section_id: Number(sectionId),
    selected_test_ids: selectedTests,
  };

  try {
    const res = await api.post(
      "start-test-session/",
      payload
    );

    localStorage.setItem("studentData", JSON.stringify(payload));
    navigate(`/test-session/${res.data.session_id}`);
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.error || t("home.sessionCreateError"));
  }
};

  const isFanEnabled =
    !!regionId && !!districtId && !!schoolId && !!classId && !!sectionId;

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "40px" }}>
        {t("common.loading")}
      </h2>
    );
  }

  if (error) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "40px" }}>
        {error === "home.loadError" ? t(error) : error}
      </h2>
    );
  }

  return (
    <div
      className="home-page"
      style={{
        background: "var(--app-bg-soft)",
        color: "var(--app-text)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "1280px", margin: "0 auto" }}>
        <div
          className="home-logo-section"
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              className="home-logo-frame"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                maxWidth: "100%",
              }}
            >
              <img
                src={logoSrc}
                alt="e-bilimtest.uz online test platformasi logosi"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          </div>
        </div>

        <section className="home-seo-hero" aria-labelledby="home-seo-title">
          <p className="home-seo-kicker">e bilimtest uz · e-bilimtest · ebilimtest</p>
          <h1 id="home-seo-title">
            e-bilimtest.uz — maktab o‘quvchilari uchun online test,
            sertifikat va TOP reyting platformasi
          </h1>
          <p>
            e-bilimtest.uz o‘quvchilarga bilim darajasini online test orqali
            tekshirish, yuqori natija uchun sertifikat olish va respublika
            bo‘yicha reytingdagi o‘rnini kuzatishga yordam beradi.
          </p>
        </section>

        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto 26px",
            background: "var(--app-surface)",
            border: "1px solid var(--app-border)",
            borderRadius: "var(--app-radius-lg)",
            padding: "30px 28px 24px",
            boxShadow: "var(--app-card-shadow)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "24px",
              fontSize: "22px",
              color: "var(--app-text)",
              textAlign: "center",
              fontWeight: "700",
            }}
          >
            {t("home.title")}
          </h2>

          <div
            className="home-form-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "18px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--app-muted-text)",
                }}
              >
                {t("home.fullName")}
              </label>
              <input
                type="text"
                placeholder={t("home.fullNamePlaceholder")}
                value={fullName}
                onChange={handleNameChange}
                style={fieldStyle}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--app-muted-text)",
                }}
              >
                {t("home.phone")}
              </label>
              <input
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                onKeyDown={handlePhoneKeyDown}
                style={fieldStyle}
              />
            </div>

            <CustomDropdown
              label={t("home.gender")}
              placeholder={t("home.genderPlaceholder")}
              items={[
                { id: "male", name: t("home.male") },
                { id: "female", name: t("home.female") },
              ]}
              value={gender}
              onChange={(item) => setGender(item.id)}
              getLabel={(item) => item.name}
            />

            <CustomDropdown
              label={t("home.region")}
              placeholder={t("home.regionPlaceholder")}
              items={regions}
              value={regionId}
              onChange={handleRegionChange}
            />

            <CustomDropdown
              label={t("home.district")}
              placeholder={t("home.districtPlaceholder")}
              items={districts}
              value={districtId}
              onChange={handleDistrictChange}
              disabled={!regionId}
            />

            <CustomDropdown
              label={t("home.school")}
              placeholder={t("home.schoolPlaceholder")}
              items={schools}
              value={schoolId}
              onChange={handleSchoolChange}
              disabled={!districtId}
            />

            <CustomDropdown
              label={t("home.class")}
              placeholder={t("home.classPlaceholder")}
              items={classes}
              value={classId}
              onChange={handleClassChange}
              getLabel={(item) => t("home.className", { name: item.name })}
              disabled={!schoolId}
            />

            <CustomDropdown
              label={t("home.section")}
              placeholder={t("home.sectionPlaceholder")}
              items={sections}
              value={sectionId}
              onChange={handleSectionChange}
              getLabel={(item) => item.name}
              disabled={!classId}
            />

            <MultiSelectDropdown
              label={t("home.subject")}
              placeholder={t("home.subjectPlaceholder")}
              items={tests.filter((test) => test.is_active)}
              selectedValues={selectedTests}
              onToggle={handleToggleTest}
              getLabel={(item) => item.title}
              disabled={!isFanEnabled}
              requiredCount={siteSettings.required_subject_count}
            />
          </div>

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              onClick={handleStartSelected}
              disabled={
                selectedTests.length !== siteSettings.required_subject_count
              }
              style={{
                background:
                  selectedTests.length === siteSettings.required_subject_count
                    ? "var(--app-primary-strong)"
                    : "var(--app-control-disabled-bg)",
                color:
                  selectedTests.length === siteSettings.required_subject_count
                    ? "var(--app-text-inverse)"
                    : "var(--app-muted-text)",
                border: "none",
                borderRadius: "var(--app-radius-md)",
                padding: "14px 34px",
                fontSize: "16px",
                cursor:
                  selectedTests.length === siteSettings.required_subject_count
                    ? "pointer"
                    : "not-allowed",
                fontWeight: "600",
                boxShadow:
                  selectedTests.length === siteSettings.required_subject_count
                    ? "var(--app-card-shadow-strong)"
                    : "none",
              }}
            >
              {t("home.startTest")}
            </button>
          </div>
        </div>

        <section className="home-seo-content" aria-label="e-bilimtest.uz haqida">
          <article>
            <h2>Platforma haqida</h2>
            <p>
              e-bilimtest.uz — maktab o‘quvchilari uchun yaratilgan online
              test platformasi. O‘quvchi hudud, maktab, sinf va fanlarni
              tanlab test ishlaydi, natijasini ko‘radi va bilim darajasini
              baholaydi.
            </p>
          </article>

          <article>
            <h2>Qanday ishlaydi</h2>
            <h3>Ma’lumotlarni kiriting va fanlarni tanlang</h3>
            <p>
              O‘quvchi kerakli maydonlarni to‘ldiradi, fanlarni tanlaydi va
              testni boshlaydi. Test yakunida ball, foiz va umumiy natija
              ko‘rsatiladi.
            </p>
          </article>

          <article>
            <h2>Sertifikat tizimi</h2>
            <h3>Yuqori natija sertifikat bilan tasdiqlanadi</h3>
            <p>
              Belgilangan o‘tish foizidan yuqori natija olgan o‘quvchi
              sertifikatga ega bo‘ladi. Sertifikat keyinchalik maxsus kod va
              QR havola orqali tekshirilishi mumkin.
            </p>
          </article>

          <article>
            <h2>Reyting tizimi</h2>
            <h3>Respublika bo‘yicha TOP natijalar</h3>
            <p>
              e-bilimtest platformasida yuqori ball olgan o‘quvchilar
              respublika bo‘yicha TOP reyting ro‘yxatida ko‘rinadi. Bu
              o‘quvchilarga o‘z bilimini solishtirish va yanada yaxshi natija
              qilishga motivatsiya beradi.
            </p>
          </article>
        </section>

        <footer className="home-seo-footer">
          <strong>e-bilimtest.uz</strong>
          <span>e bilimtest uz · e-bilimtest · ebilimtest</span>
        </footer>
      </div>

      {siteSettings.ticker_enabled && siteSettings.ticker_text && (
        <div className="ticker-outer">
          <div className="ticker-wrap">
            <div className="ticker-marquee">
              <div className="ticker-group">
                <span className="ticker-text">{siteSettings.ticker_text}</span>
                <span className="ticker-text">{siteSettings.ticker_text}</span>
                <span className="ticker-text">{siteSettings.ticker_text}</span>
              </div>

              <div className="ticker-group">
                <span className="ticker-text">{siteSettings.ticker_text}</span>
                <span className="ticker-text">{siteSettings.ticker_text}</span>
                <span className="ticker-text">{siteSettings.ticker_text}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Header />
            <HomePage />
          </>
        }
      />
      <Route path="/test/:id" element={<TestDetail />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/certificate/:code" element={<CertificatePage />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/staff" element={<StaffPage />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/test-session/:sessionId" element={<TestSessionPage />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        }
      />
    </Routes>
  );
}

export default App;


