import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";
import AdminNavigation from "../components/admin/AdminNavigation";
import ClassesSection from "../components/admin/sections/ClassesSection";
import DashboardSection from "../components/admin/sections/DashboardSection";
import OrganizationsSection from "../components/admin/sections/OrganizationsSection";
import ResultsSection from "../components/admin/sections/ResultsSection";
import SettingsSection from "../components/admin/sections/SettingsSection";
import TestsSection from "../components/admin/sections/TestsSection";
import TestContentManager from "../components/TestContentManager";
import { useI18n } from "../i18n/useI18n";
import UserManagement from "../pages/UserManagement";
import api from "../utils/api";
import { canManageContentArea, clearAuth, getCurrentUser } from "../utils/auth";

const CONTENT_NAV_ITEMS = [
  { id: "content", label: "Yo'nalish / Fan / Test / Savol" },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const { tx } = useI18n();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const isAdminUser = currentUser?.role === "admin";
  const isContentOnlyUser = !isAdminUser && canManageContentArea(currentUser);

  const [activeSection, setActiveSection] = useState(
    isContentOnlyUser ? "content" : "dashboard"
  );

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [siteSettings, setSiteSettings] = useState({
    header_phone: "",
    telegram_url: "",
    instagram_url: "",
    ticker_text: "",
    ticker_enabled: true,
    required_subject_count: 3,
    certificate_enabled: true,
    certificate_passing_percentage: 60,
    certificate_template: "{}",
    certificate_public_base_url: "",
    certificate_lookup_path: "/certificate",
  });

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");

  const [tests, setTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [savingTestId, setSavingTestId] = useState(null);

  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [savingRegionId, setSavingRegionId] = useState(null);
  const [savingDistrictId, setSavingDistrictId] = useState(null);
  const [savingSchoolId, setSavingSchoolId] = useState(null);
  const [savingClassId, setSavingClassId] = useState(null);
  const [savingSectionId, setSavingSectionId] = useState(null);

  const [orgLoading, setOrgLoading] = useState(true);
  const [classLoading, setClassLoading] = useState(true);

  const [newRegion, setNewRegion] = useState({
    name_uz: "",
    name_ru: "",
    is_active: true,
  });

  const [newDistrict, setNewDistrict] = useState({
    region: "",
    name_uz: "",
    name_ru: "",
    is_active: true,
  });

  const [newSchool, setNewSchool] = useState({
    district: "",
    name_uz: "",
    name_ru: "",
    is_active: true,
  });

  const [newClass, setNewClass] = useState({
    school: "",
    name: "",
    student_limit: 30,
    test_price: 15000,
    duration_minutes: 60,
    is_active: true,
  });

  const [newSection, setNewSection] = useState({
    school_class: "",
    name: "A",
    is_active: true,
  });

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get("leaderboard/");
      setLeaderboard(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Admin ma'lumotlarini olishda xatolik yuz berdi");
      setLoading(false);
    }
  };

  const fetchSiteSettings = async () => {
    try {
      setSettingsLoading(true);
      const res = await api.get("admin/site-settings/");
      setSiteSettings({
        header_phone: res.data.header_phone || "",
        telegram_url: res.data.telegram_url || "",
        instagram_url: res.data.instagram_url || "",
        ticker_text: res.data.ticker_text || "",
        ticker_enabled: !!res.data.ticker_enabled,
        required_subject_count: res.data.required_subject_count || 3,
        certificate_enabled: !!res.data.certificate_enabled,
        certificate_passing_percentage:
          res.data.certificate_passing_percentage || 60,
        certificate_template: JSON.stringify(
          res.data.certificate_template || {},
          null,
          2
        ),
        certificate_public_base_url: res.data.certificate_public_base_url || "",
        certificate_lookup_path: res.data.certificate_lookup_path || "/certificate",
      });
    } catch (error) {
      console.error("Site settings olishda xatolik:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      setTestsLoading(true);
      const res = await api.get("admin/tests/");
      setTests(res.data);
    } catch (error) {
      console.error("Testlar olishda xatolik:", error);
    } finally {
      setTestsLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      setOrgLoading(true);
      const [regionsRes, districtsRes, schoolsRes] = await Promise.all([
        api.get("admin/regions/"),
        api.get("admin/districts/"),
        api.get("admin/schools/"),
      ]);

      setRegions(regionsRes.data);
      setDistricts(districtsRes.data);
      setSchools(schoolsRes.data);
    } catch (error) {
      console.error("Tashkiliy ma'lumotlarni olishda xatolik:", error);
    } finally {
      setOrgLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setClassLoading(true);
      const [classesRes, sectionsRes] = await Promise.all([
        api.get("admin/classes/"),
        api.get("admin/class-sections/"),
      ]);

      setClasses(classesRes.data);
      setSections(sectionsRes.data);
    } catch (error) {
      console.error("Sinf ma'lumotlarini olishda xatolik:", error);
    } finally {
      setClassLoading(false);
    }
  };

  const fetchClassOptions = async () => {
    try {
      setClassLoading(true);
      const classesRes = await api.get("admin/classes/");
      setClasses(classesRes.data);
    } catch (error) {
      console.error("Sinf ro'yxatini olishda xatolik:", error);
    } finally {
      setClassLoading(false);
    }
  };

  useEffect(() => {
    if (isContentOnlyUser) {
      setActiveSection("content");
      setLoading(false);
      setSettingsLoading(false);
      setTestsLoading(false);
      setOrgLoading(false);
      fetchClassOptions();
      return;
    }

    fetchLeaderboard();
    fetchSiteSettings();
    fetchTests();
    fetchOrganizations();
    fetchClasses();
  }, [isContentOnlyUser]);

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSiteSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveSiteSettings = async () => {
    try {
      setSettingsSaving(true);
      setSettingsMessage("");
      const certificateTemplate = siteSettings.certificate_template.trim()
        ? JSON.parse(siteSettings.certificate_template)
        : {};

      await api.patch("admin/site-settings/", {
        header_phone: siteSettings.header_phone,
        telegram_url: siteSettings.telegram_url,
        instagram_url: siteSettings.instagram_url,
        ticker_text: siteSettings.ticker_text,
        ticker_enabled: siteSettings.ticker_enabled,
        required_subject_count: Number(siteSettings.required_subject_count),
        certificate_enabled: siteSettings.certificate_enabled,
        certificate_passing_percentage: Number(
          siteSettings.certificate_passing_percentage
        ),
        certificate_template: certificateTemplate,
        certificate_public_base_url: siteSettings.certificate_public_base_url,
        certificate_lookup_path: siteSettings.certificate_lookup_path,
      });

      setSettingsMessage("Sozlamalar muvaffaqiyatli saqlandi");
    } catch (error) {
      console.error("Site settings saqlashda xatolik:", error);
      setSettingsMessage("Saqlashda xatolik yuz berdi");
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleTestFieldChange = (testId, field, value) => {
    setTests((prev) =>
      prev.map((test) =>
        test.id === testId ? { ...test, [field]: value } : test
      )
    );
  };

  const handleSaveTest = async (test) => {
    try {
      setSavingTestId(test.id);

      const res = await api.patch(`admin/tests/${test.id}/`, {
        duration_minutes: Number(test.duration_minutes),
        is_active: test.is_active,
      });

      setTests((prev) =>
        prev.map((item) => (item.id === test.id ? res.data : item))
      );
    } catch (error) {
      console.error("Testni saqlashda xatolik:", error);
      alert(tx("Testni saqlashda xatolik yuz berdi"));
    } finally {
      setSavingTestId(null);
    }
  };

  const handleDeleteTest = async (test) => {
    if (!window.confirm(tx("Testni o'chirishni tasdiqlaysizmi?"))) {
      return;
    }

    try {
      await api.delete(`admin/tests/${test.id}/`);
      setTests((prev) => prev.filter((item) => item.id !== test.id));
    } catch (error) {
      console.error("Testni o'chirishda xatolik:", error);
      alert(
        error.response?.data?.error || tx("Testni o'chirishda xatolik yuz berdi")
      );
    }
  };

  const handleRegionFieldChange = (id, field, value) => {
    setRegions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleDistrictFieldChange = (id, field, value) => {
    setDistricts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSchoolFieldChange = (id, field, value) => {
    setSchools((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleClassFieldChange = (id, field, value) => {
    setClasses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSectionFieldChange = (id, field, value) => {
    setSections((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleCreateRegion = async () => {
    try {
      const res = await api.post("admin/regions/", {
        ...newRegion,
      });
      setNewRegion({ name_uz: "", name_ru: "", is_active: true });
      setRegions((prev) => [...prev, res.data]);
    } catch (error) {
      console.error(error);
      alert(tx("Viloyat qo'shishda xatolik"));
    }
  };

  const handleCreateDistrict = async () => {
    try {
      const res = await api.post("admin/districts/", {
        ...newDistrict,
        region: Number(newDistrict.region),
      });
      setNewDistrict({ region: "", name_uz: "", name_ru: "", is_active: true });
      setDistricts((prev) => [...prev, res.data]);
    } catch (error) {
      console.error(error);
      alert(tx("Tuman/Shahar qo'shishda xatolik"));
    }
  };

  const handleCreateSchool = async () => {
    try {
      const res = await api.post("admin/schools/", {
        ...newSchool,
        district: Number(newSchool.district),
      });
      setNewSchool({ district: "", name_uz: "", name_ru: "", is_active: true });
      setSchools((prev) => [...prev, res.data]);
    } catch (error) {
      console.error(error);
      alert(tx("Maktab qo'shishda xatolik"));
    }
  };

  const handleCreateClass = async () => {
    try {
      const res = await api.post("admin/classes/", {
        ...newClass,
        school: Number(newClass.school),
        name: Number(newClass.name),
        student_limit: Number(newClass.student_limit),
        test_price: Number(newClass.test_price),
        duration_minutes: Number(newClass.duration_minutes),
      });
      setNewClass({
        school: "",
        name: "",
        student_limit: 30,
        test_price: 15000,
        duration_minutes: 60,
        is_active: true,
      });
      setClasses((prev) => [...prev, res.data]);
    } catch (error) {
      console.error(error);
      alert(tx("Sinf qo'shishda xatolik"));
    }
  };

  const handleCreateSection = async () => {
    try {
      const res = await api.post("admin/class-sections/", {
        ...newSection,
        school_class: Number(newSection.school_class),
      });
      setNewSection({
        school_class: "",
        name: "A",
        is_active: true,
      });
      setSections((prev) => [...prev, res.data]);
    } catch (error) {
      console.error(error);
      alert(tx("Sinf harfi qo'shishda xatolik"));
    }
  };

  const handleSaveRegion = async (item) => {
    try {
      setSavingRegionId(item.id);
      const res = await api.patch(`admin/regions/${item.id}/`, {
        name_uz: item.name_uz,
        name_ru: item.name_ru,
        is_active: item.is_active,
      });
      setRegions((prev) =>
        prev.map((region) => (region.id === item.id ? res.data : region))
      );
    } catch (error) {
      console.error(error);
      alert(tx("Viloyatni saqlashda xatolik"));
    } finally {
      setSavingRegionId(null);
    }
  };

  const handleSaveDistrict = async (item) => {
    try {
      setSavingDistrictId(item.id);
      const res = await api.patch(`admin/districts/${item.id}/`, {
        region: Number(item.region),
        name_uz: item.name_uz,
        name_ru: item.name_ru,
        is_active: item.is_active,
      });
      setDistricts((prev) =>
        prev.map((district) => (district.id === item.id ? res.data : district))
      );
    } catch (error) {
      console.error(error);
      alert(tx("Tuman/Shaharni saqlashda xatolik"));
    } finally {
      setSavingDistrictId(null);
    }
  };

  const handleSaveSchool = async (item) => {
    try {
      setSavingSchoolId(item.id);
      const res = await api.patch(`admin/schools/${item.id}/`, {
        district: Number(item.district),
        name_uz: item.name_uz,
        name_ru: item.name_ru,
        is_active: item.is_active,
      });
      setSchools((prev) =>
        prev.map((school) => (school.id === item.id ? res.data : school))
      );
    } catch (error) {
      console.error(error);
      alert(tx("Maktabni saqlashda xatolik"));
    } finally {
      setSavingSchoolId(null);
    }
  };

  const handleSaveClass = async (item) => {
    try {
      setSavingClassId(item.id);
      const res = await api.patch(`admin/classes/${item.id}/`, {
        school: Number(item.school),
        name: Number(item.name),
        student_limit: Number(item.student_limit),
        test_price: Number(item.test_price),
        duration_minutes: Number(item.duration_minutes),
        is_active: item.is_active,
      });
      setClasses((prev) =>
        prev.map((schoolClass) =>
          schoolClass.id === item.id ? res.data : schoolClass
        )
      );
    } catch (error) {
      console.error(error);
      alert(tx("Sinfni saqlashda xatolik"));
    } finally {
      setSavingClassId(null);
    }
  };

  const handleSaveSection = async (item) => {
    try {
      setSavingSectionId(item.id);
      const res = await api.patch(
        `admin/class-sections/${item.id}/`,
        {
          school_class: Number(item.school_class),
          name: item.name,
          is_active: item.is_active,
        }
      );
      setSections((prev) =>
        prev.map((section) => (section.id === item.id ? res.data : section))
      );
    } catch (error) {
      console.error(error);
      alert(tx("Sinf harfini saqlashda xatolik"));
    } finally {
      setSavingSectionId(null);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const res = await api.get("export-results-excel/", {
        responseType: "blob",
      });
      const downloadUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "natijalar.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Excel yuklab olishda xatolik:", error);
      alert(tx("Excel yuklab olishda xatolik yuz berdi"));
    }
  };

  const handleAdminLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const totalStudents = leaderboard.length;
  const totalScore = leaderboard.reduce((sum, item) => sum + item.score, 0);
  const averageScore =
    totalStudents > 0 ? (totalScore / totalStudents).toFixed(1) : 0;

  const recentTop = useMemo(() => leaderboard.slice(0, 10), [leaderboard]);
  const navItems = isContentOnlyUser ? CONTENT_NAV_ITEMS : undefined;

  return (
    <div className="admin-shell">
      <div className="admin-layout">
        <AdminNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onDownloadExcel={handleDownloadExcel}
          onOpenLeaderboard={() => navigate("/leaderboard")}
          onOpenHome={() => navigate("/")}
          onLogout={handleAdminLogout}
          navItems={navItems}
          showAdminActions={isAdminUser}
        />

        <main className="admin-main">
          {isAdminUser && activeSection === "dashboard" && (
            <DashboardSection
              loading={loading}
              error={error}
              totalStudents={totalStudents}
              totalScore={totalScore}
              averageScore={averageScore}
              recentTop={recentTop}
            />
          )}

          {isAdminUser && activeSection === "settings" && (
            <SettingsSection
              siteSettings={siteSettings}
              settingsLoading={settingsLoading}
              settingsSaving={settingsSaving}
              settingsMessage={settingsMessage}
              onSettingsChange={handleSettingsChange}
              onSaveSiteSettings={handleSaveSiteSettings}
            />
          )}

          {isAdminUser && activeSection === "tests" && (
            <TestsSection
              tests={tests}
              testsLoading={testsLoading}
              savingTestId={savingTestId}
              onTestFieldChange={handleTestFieldChange}
              onSaveTest={handleSaveTest}
              onDeleteTest={handleDeleteTest}
            />
          )}

          {isAdminUser && activeSection === "organizations" && (
            <OrganizationsSection
              regions={regions}
              districts={districts}
              schools={schools}
              newRegion={newRegion}
              setNewRegion={setNewRegion}
              newDistrict={newDistrict}
              setNewDistrict={setNewDistrict}
              newSchool={newSchool}
              setNewSchool={setNewSchool}
              orgLoading={orgLoading}
              savingRegionId={savingRegionId}
              savingDistrictId={savingDistrictId}
              savingSchoolId={savingSchoolId}
              onCreateRegion={handleCreateRegion}
              onCreateDistrict={handleCreateDistrict}
              onCreateSchool={handleCreateSchool}
              onRegionFieldChange={handleRegionFieldChange}
              onDistrictFieldChange={handleDistrictFieldChange}
              onSchoolFieldChange={handleSchoolFieldChange}
              onSaveRegion={handleSaveRegion}
              onSaveDistrict={handleSaveDistrict}
              onSaveSchool={handleSaveSchool}
            />
          )}

          {isAdminUser && activeSection === "classes" && (
            <ClassesSection
              schools={schools}
              classes={classes}
              sections={sections}
              newClass={newClass}
              setNewClass={setNewClass}
              newSection={newSection}
              setNewSection={setNewSection}
              classLoading={classLoading}
              savingClassId={savingClassId}
              savingSectionId={savingSectionId}
              onCreateClass={handleCreateClass}
              onCreateSection={handleCreateSection}
              onClassFieldChange={handleClassFieldChange}
              onSectionFieldChange={handleSectionFieldChange}
              onSaveClass={handleSaveClass}
              onSaveSection={handleSaveSection}
            />
          )}

          {activeSection === "content" && (
            <TestContentManager classes={classes} classLoading={classLoading} />
          )}
          {isAdminUser && activeSection === "users" && <UserManagement />}
          {isAdminUser && activeSection === "results" && (
            <ResultsSection leaderboard={leaderboard} />
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
