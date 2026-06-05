"use client";

import { FormEvent, useEffect, useId, useMemo, useState } from "react";

type Child = {
  id: string;
  name: string;
  age: number;
  grade: number;
  pinLength?: number;
};

type ParentAccount = {
  id?: string;
  name: string;
  email: string;
  provider: string;
};

type Mission = {
  id: string;
  childId?: string;
  icon?: string;
  title: string;
  category: string;
  executionType?: "completion" | "submission" | "timed";
  target: string;
  targetApp?: string;
  detail?: string;
  activeRun?: {
    status?: string;
  } | null;
  eventRecords?: Array<{
    eventType?: string;
    title?: string;
  }>;
  goals?: string[];
  energy: number;
  occurrenceDate?: string;
  progress?: number;
  repeatRule?: string;
  rewardMinutes?: number;
  scheduledTime?: string;
  source?: string;
  timeLimitMinutes?: number;
  total?: number;
  status: "done" | "todo" | "in_progress" | "expired";
  tone?: string;
  planDetail?: {
    attachments?: TaskAttachment[];
    materials?: string[];
    notes?: string;
    summary?: string;
    vocabulary?: string[];
  };
};

type TaskAttachment = {
  id: string;
  mimeType?: string;
  name: string;
  size?: number;
  uri: string;
};

type Family = {
  id: string;
  language?: string;
  name: string;
  parent: ParentAccount | null;
  timeZone?: string;
  children: Child[];
};

type TaskTemplate = {
  active: boolean;
  category: string;
  childId: string;
  energy: number;
  goals: string[];
  icon: string;
  id: string;
  repeatRule: string;
  rewardMinutes: number;
  scheduledTime?: string;
  source?: string;
  timeLimitMinutes?: number;
  targetApp?: string;
  target: string;
  title: string;
  tone: string;
  total: number;
};

type AuthMode = "login" | "register";
type AdminView = "overview" | "tasks" | "templates" | "family" | "rules" | "history";
type CalendarView = "day" | "week" | "month";
type TaskLayout = "left" | "split" | "right";
type Language = "en" | "zh";

type TaskForm = {
  assessment: string;
  attachments: TaskAttachment[];
  category: string;
  detail: string;
  energy: string;
  goals: string;
  icon: string;
  materials: string;
  notes: string;
  occurrenceDate: string;
  repeatRule: string;
  scheduledTime: string;
  source: string;
  target: string;
  targetApp: string;
  timeLimitMinutes: string;
  title: string;
  tone: string;
  total: string;
  vocabulary: string;
};

type TemplateForm = {
  active: boolean;
  category: string;
  energy: string;
  goals: string;
  icon: string;
  repeatRule: string;
  scheduledTime: string;
  source: string;
  target: string;
  targetApp: string;
  timeLimitMinutes: string;
  title: string;
  tone: string;
  total: string;
};

type RepeatDraft = {
  byDay: string[];
  frequency: "daily" | "workDaily" | "weekly" | "weeklyCustom" | "monthly" | "none";
  interval: number;
};

type TaskFilters = {
  categories: string[];
  dateFrom: string;
  dateTo: string;
  sources: string[];
  timeFrom: string;
  timeTo: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

const zh: Record<string, string> = {
  account: "账号",
  accountRegistered: "家长账号已注册。",
  confirmPassword: "确认密码",
  addTask: "新增任务",
  assessmentMethod: "评价方式",
  attachments: "附件",
  calendar: "日历",
  calendarTasks: "日历任务",
  category: "分类",
  childName: "孩子姓名",
  childProfile: "孩子资料",
  children: "孩子",
  createAccount: "创建账号",
  createChild: "创建孩子",
  createTask: "创建任务",
  dailyTarget: "每日目标",
  date: "日期",
  delete: "删除",
  detailedContent: "详细内容",
  discardTaskEditPrompt: "任务编辑中，放弃修改吗？",
  editTask: "编辑任务",
  expandEditor: "...",
  family: "家庭",
  goals: "目标清单",
  googleSaved: "Google 登录已保存。",
  history: "历史",
  imported: "导入",
  layout: "布局",
  leftPanel: "左侧",
  login: "登录",
  logout: "退出登录",
  materials: "材料",
  newTemplate: "新模板",
  newTask: "新任务",
  noTasks: "这个视图没有任务",
  overview: "概览",
  parentAdmin: "家长后台",
  parentName: "家长姓名",
  parentNameRequired: "家长姓名不能为空。",
  password: "密码",
  passwordsDoNotMatch: "两次输入的密码不一致。",
  passwordTooShort: "密码至少需要 8 位。",
  register: "注册",
  repeat: "重复",
  resetTimedTask: "重置限时状态",
  rewardEnergy: "奖励能量",
  rules: "规则",
  saveChanges: "保存修改",
  signedIn: "已登录。",
  taskContent: "任务内容",
  templateCreated: "模板已创建。",
  templateDeleted: "模板已删除。",
  templateGenerated: "已从模板生成任务。",
  templates: "模板",
  templateUpdated: "模板已更新。",
  taskList: "任务列表",
  taskName: "任务名称",
  tasks: "任务",
  themeColor: "主题颜色",
  time: "时间",
  timeLimit: "限时分钟",
  targetApp: "目标 App",
  totalSteps: "步骤数",
  uploadFile: "上传文件",
  vocabulary: "词汇",
  anyTime: "任意时间",
  cancel: "取消",
  childProfileCreated: "孩子资料已创建。",
  childRequired: "请先创建孩子资料再添加任务。",
  completion: "完成率",
  completionRate: "完成率",
  confirmComplete: "确认完成",
  continueGoogle: "继续使用 Google",
  close: "关闭",
  createFirstTask: "创建第一个任务，包含内容、清单、时间、奖励规则和附件。",
  daily: "每天",
  dateLabel: "日期",
  doesNotRepeat: "不重复",
  familyRoles: "成员和角色",
  from: "从",
  grade: "年级",
  instructions: "说明",
  noChecklist: "还没有清单。",
  noDetail: "还没有详细内容。",
  monthly: "每月",
  every: "每",
  ok: "好",
  open: "未完成",
  parentNotes: "家长备注",
  parentSource: "家长创建",
  progress: "进度",
  review: "审核",
  rightPanel: "右侧",
  rewardRules: "奖励与权限",
  shared: "他人发送",
  source: "来源",
  filters: "过滤",
  clearFilters: "清空过滤",
  dateRange: "日期段",
  timeRange: "时间段",
  to: "到",
  today: "今天",
  serverUnreachable: "无法连接 API。请先运行 npm run server。",
  emailInvalid: "请输入正确的邮箱地址。",
  status: "状态",
  taskConfirmed: "任务已确认。",
  taskCreated: "任务已创建。",
  taskDeleted: "任务已删除。",
  timedTaskReset: "限时任务状态已重置。",
  taskUpdated: "任务已更新。",
  splitView: "分屏",
  weekly: "每周",
  weeklyCustom: "每周自定义",
  workDaily: "每工作日",
  week: "周"
};

function tr(language: Language, key: string) {
  if (language === "zh") {
    return zh[key] ?? key;
  }

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function validateRegister(account: { confirmPassword: string; email: string; name: string; password: string }, t: (key: string) => string) {
  if (!account.name.trim()) {
    return t("parentNameRequired");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email.trim())) {
    return t("emailInvalid");
  }

  if (account.password.length < 8) {
    return t("passwordTooShort");
  }

  if (account.password !== account.confirmPassword) {
    return t("passwordsDoNotMatch");
  }

  return "";
}

const webSessionKey = "koala.web.parent.session";

function readWebSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(webSessionKey);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as { familyId: string };
  } catch {
    window.localStorage.removeItem(webSessionKey);
    return null;
  }
}

function saveWebSession(familyId: string) {
  window.localStorage.setItem(webSessionKey, JSON.stringify({ familyId }));
}

function clearWebSession() {
  window.localStorage.removeItem(webSessionKey);
}

const starterTemplates = [
  { title: "English Reading", category: "Eng", icon: "📘", target: "Read 20 min", energy: "10", tone: "#3F7D58" },
  { title: "Math Practice", category: "Math", icon: "➕", target: "10 questions", energy: "10", tone: "#4B6FA8" },
  { title: "Piano Practice", category: "Other", icon: "🎹", target: "Practice 20 min", energy: "10", tone: "#8B5E83" }
];

const categoryOptions = [
  { label: "数学 Math", value: "Math" },
  { label: "中文 Chinese", value: "Chinese" },
  { label: "英文 Eng", value: "Eng" },
  { label: "运动 Sports", value: "Sports" },
  { label: "娱乐 Game", value: "Game" },
  { label: "其他 Other", value: "Other" }
];

const sourceOptions = [
  { label: "Parent", value: "parent" },
  { label: "Calendar", value: "calendar" },
  { label: "Imported", value: "import" },
  { label: "Shared", value: "shared" }
];

const emptyFilters: TaskFilters = {
  categories: [],
  dateFrom: "",
  dateTo: "",
  sources: [],
  timeFrom: "",
  timeTo: ""
};

const weekDayOptions = [
  { code: "SU", label: "日" },
  { code: "MO", label: "一" },
  { code: "TU", label: "二" },
  { code: "WE", label: "三" },
  { code: "TH", label: "四" },
  { code: "FR", label: "五" },
  { code: "SA", label: "六" }
];
const workDailyRepeatRule = "FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR";

const emptyTaskForm: TaskForm = {
  assessment: "Parent confirmation with optional photo or audio proof",
  attachments: [],
  category: "Math",
  detail: "What should the child do? Add steps, examples, and quality expectations.",
  energy: "10",
  goals: "Finish the task\nSubmit proof\nTell one reflection",
  icon: "📌",
  materials: "Book, worksheet, pencil",
  notes: "Parent review notes and reminders",
  occurrenceDate: todayKey(),
  repeatRule: workDailyRepeatRule,
  scheduledTime: "16:00",
  source: "parent",
  target: "Daily goal",
  targetApp: "",
  timeLimitMinutes: "20",
  title: "",
  tone: "#3F7D58",
  total: "1",
  vocabulary: "new word, sentence, example"
};

const emptyTemplateForm: TemplateForm = {
  active: true,
  category: "Math",
  energy: "10",
  goals: "Finish the task\nSubmit proof\nTell one reflection",
  icon: "📌",
  repeatRule: workDailyRepeatRule,
  scheduledTime: "16:00",
  source: "parent",
  target: "Daily goal",
  targetApp: "",
  timeLimitMinutes: "20",
  title: "",
  tone: "#3F7D58",
  total: "1"
};

export default function Page() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [language, setLanguage] = useState<Language>("en");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [adminView, setAdminView] = useState<AdminView>("overview");
  const [family, setFamily] = useState<Family | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [message, setMessage] = useState("");
  const [account, setAccount] = useState({
    confirmPassword: "",
    email: "parent@example.com",
    name: "Chen",
    password: "secret123"
  });
  const [childForm, setChildForm] = useState({
    grade: "3",
    name: "",
    pin: "1234"
  });
  const [taskForm, setTaskForm] = useState<TaskForm>(emptyTaskForm);
  const [templateForm, setTemplateForm] = useState<TemplateForm>(emptyTemplateForm);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [calendarView, setCalendarView] = useState<CalendarView>("day");
  const [calendarAnchorDate, setCalendarAnchorDate] = useState(todayKey());
  const [taskLayout, setTaskLayout] = useState<TaskLayout>("split");
  const [filters, setFilters] = useState<TaskFilters>(emptyFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const t = (key: string) => tr(language, key);

  const activeChild = family?.children[0];
  const filteredMissions = useMemo(() => applyTaskFilters(missions, filters), [filters, missions]);
  const visibleMissions = useMemo(
    () => filteredMissions.filter((mission) => missionDateKey(mission) === calendarAnchorDate),
    [calendarAnchorDate, filteredMissions]
  );
  const selectedMission = visibleMissions.find((mission) => mission.id === selectedMissionId) ?? visibleMissions[0] ?? filteredMissions[0];
  const completed = missions.filter((mission) => mission.status === "done").length;
  const totalEnergy = missions.reduce((sum, mission) => sum + (mission.status === "done" ? mission.energy : 0), 0);
  const completionRate = missions.length ? Math.round((completed / missions.length) * 100) : 0;

  const metrics = useMemo(
    () => [
      [t("children"), `${family?.children.length ?? 0}`],
      [t("open"), `${missions.length - completed}`],
      [t("completion"), `${completionRate}%`],
      [t("rewardEnergy"), `${totalEnergy}`]
    ],
    [completed, completionRate, family?.children.length, missions.length, totalEnergy]
  );

  useEffect(() => {
    const storedSession = readWebSession();

    if (storedSession) {
      setIsSignedIn(true);
      void loadFamily(storedSession.familyId);
    }
  }, []);

  useEffect(() => {
    if (activeChild) {
      void loadChildData(activeChild.id);
    }
  }, [activeChild?.id, calendarAnchorDate, calendarView, filters.dateFrom, filters.dateTo]);

  async function loadFamily(familyId = family?.id ?? "demo") {
    try {
      const data = await request<{ family: Family | null }>(`/families/${encodeURIComponent(familyId)}`);
      setFamily(data.family);

      const child = data.family?.children[0];
      if (child) {
        await loadChildData(child.id);
      } else {
        setMissions([]);
        setTemplates([]);
      }
    } catch {
      setMessage(t("serverUnreachable"));
    }
  }

  async function loadChildData(childId: string) {
    const visibleRange = calendarRange(calendarAnchorDate, calendarView);
    const startDate = filters.dateFrom && filters.dateFrom < visibleRange.startDate ? filters.dateFrom : visibleRange.startDate;
    const endDate = filters.dateTo && filters.dateTo > visibleRange.endDate ? filters.dateTo : visibleRange.endDate;
    const missionData = await request<{ missions: Mission[] }>(
      `/families/demo/missions?childId=${childId}&startDate=${startDate}&endDate=${endDate}`
    );
    const templateData = await request<{ templates: TaskTemplate[] }>(`/families/demo/templates?childId=${childId}`);
    setMissions(missionData.missions);
    setTemplates(templateData.templates);
    setSelectedMissionId((current) => current ?? missionData.missions[0]?.id ?? null);
    setSelectedTemplateId((current) => current ?? templateData.templates[0]?.id ?? null);
  }

  async function submitAuth(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    if (authMode === "register") {
      const validationMessage = validateRegister(account, t);

      if (validationMessage) {
        setMessage(validationMessage);
        return;
      }
    }

    const path = authMode === "login" ? "/auth/login/parent" : "/auth/register/parent";
    const payload =
      authMode === "login"
        ? { email: account.email, password: account.password }
        : { email: account.email, name: account.name, password: account.password };

    try {
      const data = await request<{ family: Family; session?: { familyId?: string; token?: string } }>(path, {
        body: JSON.stringify(payload),
        method: "POST"
      });

      setFamily(data.family);
      setIsSignedIn(true);
      setMessage(authMode === "login" ? "" : t("accountRegistered"));
      saveWebSession(data.session?.familyId ?? data.family.id);
      setAdminView(authMode === "login" && data.family.children.length > 0 ? "overview" : "family");

      const child = data.family.children[0];
      if (child) {
        await loadChildData(child.id);
      } else {
        setMissions([]);
        setTemplates([]);
      }
    } catch (error) {
      setMessage(readableRequestError(error, t));
    }
  }

  async function googleLogin() {
    const data = await request<{ family: Family; session?: { familyId?: string; token?: string } }>("/auth/google/parent", {
      body: JSON.stringify({
        email: account.email,
        idToken: "web-admin-google-demo",
        name: account.name || "Parent"
      }),
      method: "POST"
    });

    setFamily(data.family);
    setIsSignedIn(true);
    setMessage(t("googleSaved"));
    saveWebSession(data.session?.familyId ?? data.family.id);
    await loadFamily(data.session?.familyId ?? data.family.id);
  }

  async function createChild(event: FormEvent) {
    event.preventDefault();

    if (!family) {
      setMessage(t("childRequired"));
      return;
    }

    await request(`/families/${encodeURIComponent(family.id)}/children`, {
      body: JSON.stringify({
        grade: Number(childForm.grade),
        name: childForm.name,
        pin: childForm.pin
      }),
      method: "POST"
    });
    setMessage(t("childProfileCreated"));
    await loadFamily(family.id);
  }

  async function submitTask(event: FormEvent) {
    event.preventDefault();

    if (!activeChild) {
      setMessage(t("childRequired"));
      setAdminView("family");
      return;
    }

    const body = JSON.stringify({
      category: normalizeCategory(taskForm.category),
      childId: activeChild.id,
      attachments: taskForm.attachments,
      detail: buildTaskDetail(taskForm),
      energy: Number(taskForm.energy),
      goals: toList(taskForm.goals),
      icon: taskForm.icon,
      occurrenceDate: taskForm.occurrenceDate,
      progress: 0,
      repeatRule: taskForm.repeatRule,
      rewardMinutes: Number(taskForm.energy),
      scheduledTime: taskForm.scheduledTime,
      source: taskForm.source,
      status: "todo",
      target: taskForm.target,
      targetApp: normalizeTargetApps(taskForm.targetApp) || undefined,
      timeLimitMinutes: taskForm.timeLimitMinutes ? Number(taskForm.timeLimitMinutes) : undefined,
      title: taskForm.title || t("newTask"),
      tone: taskForm.tone,
      total: Math.max(1, Number(taskForm.total))
    });

    if (editingMissionId) {
      await request(`/families/demo/missions/${editingMissionId}`, { body, method: "PATCH" });
      setMessage(t("taskUpdated"));
    } else {
      await request("/families/demo/missions", { body, method: "POST" });
      setMessage(t("taskCreated"));
    }

    setTaskForm(emptyTaskForm);
    setEditingMissionId(null);
    setShowTaskForm(false);
    await loadFamily();
  }

  async function completeTask(missionId: string) {
    await request(`/families/demo/missions/${missionId}/complete`, {
      body: JSON.stringify({ note: "Confirmed from web admin" }),
      method: "POST"
    });
    setMessage(t("taskConfirmed"));
    await loadFamily();
  }

  async function deleteTask(missionId: string) {
    await request(`/families/demo/missions/${missionId}`, { method: "DELETE" });
    setMessage(t("taskDeleted"));
    setSelectedMissionId(null);
    await loadFamily();
  }

  async function resetTimedTask(missionId: string) {
    await request(`/families/demo/missions/${missionId}/reset-timer`, { method: "POST" });
    setMessage(t("timedTaskReset"));
    await loadFamily();
  }

  async function submitTemplate(event: FormEvent) {
    event.preventDefault();
    await saveTemplateForm(templateForm, true);
  }

  async function saveTemplateForm(form: TemplateForm, resetAfterSave: boolean) {
    if (!activeChild) {
      setMessage(t("childRequired"));
      setAdminView("family");
      return;
    }

    const body = JSON.stringify(templatePayload(activeChild.id, form));

    if (editingTemplateId) {
      await request(`/families/demo/templates/${editingTemplateId}`, { body, method: "PATCH" });
      setMessage(t("templateUpdated"));
    } else {
      await request("/families/demo/templates", { body, method: "POST" });
      setMessage(t("templateCreated"));
    }

    if (resetAfterSave) {
      setTemplateForm(emptyTemplateForm);
      setEditingTemplateId(null);
    }

    await loadFamily();
  }

  async function commitTemplateRepeatRule(repeatRule: string) {
    const nextForm = { ...templateForm, repeatRule };
    setTemplateForm(nextForm);

    if (editingTemplateId) {
      await saveTemplateForm(nextForm, false);
    }
  }

  async function toggleTemplate(template: TaskTemplate) {
    await request(`/families/demo/templates/${template.id}`, {
      body: JSON.stringify({ ...template, active: !template.active }),
      method: "PATCH"
    });
    setMessage(t("templateUpdated"));
    await loadFamily();
  }

  async function deleteTemplate(templateId: string) {
    await request(`/families/demo/templates/${templateId}`, { method: "DELETE" });
    setMessage(t("templateDeleted"));
    setSelectedTemplateId(null);
    setEditingTemplateId(null);
    await loadFamily();
  }

  async function generateFromTemplate(templateId: string) {
    const data = await request<{ mission: Mission }>(`/families/demo/templates/${templateId}/occurrences`, {
      body: JSON.stringify({ occurrenceDate: calendarAnchorDate }),
      method: "POST"
    });
    setMessage(t("templateGenerated"));
    setSelectedMissionId(data.mission.id);
    setAdminView("tasks");
    await loadFamily();
  }

  function startNewTask() {
    setTaskForm({ ...emptyTaskForm, occurrenceDate: calendarAnchorDate });
    setEditingMissionId(null);
    setShowTaskForm(true);
    setAdminView("tasks");
  }

  function startNewTemplate() {
    setTemplateForm(emptyTemplateForm);
    setEditingTemplateId(null);
    setAdminView("templates");
  }

  function startEditTask(mission: Mission) {
    const structuredMaterials = (mission.planDetail?.materials ?? []).join(", ");
    const structuredNotes = mission.planDetail?.notes ?? "";
    const structuredVocabulary = (mission.planDetail?.vocabulary ?? []).join(", ");
    const detailParts = splitTaskDetail(mission.detail ?? "", {
      assessment: emptyTaskForm.assessment,
      materials: structuredMaterials,
      notes: structuredNotes,
      vocabulary: structuredVocabulary
    });

    setTaskForm({
      ...emptyTaskForm,
      assessment: detailParts.assessment,
      attachments: mission.planDetail?.attachments ?? [],
      category: normalizeCategory(mission.category),
      detail: detailParts.detail,
      energy: String(mission.energy),
      goals: (mission.goals ?? []).join("\n"),
      icon: mission.icon ?? "📌",
      materials: detailParts.materials,
      notes: detailParts.notes,
      occurrenceDate: mission.occurrenceDate?.slice(0, 10) ?? todayKey(),
      repeatRule: mission.repeatRule ?? "FREQ=DAILY",
      scheduledTime: mission.scheduledTime ?? "16:00",
      source: mission.source ?? "parent",
      target: mission.target,
      targetApp: mission.targetApp ?? "",
      timeLimitMinutes: mission.timeLimitMinutes ? String(mission.timeLimitMinutes) : "",
      title: mission.title,
      tone: mission.tone ?? "#3F7D58",
      total: String(mission.total ?? 1),
      vocabulary: detailParts.vocabulary
    });
    setEditingMissionId(mission.id);
    setSelectedMissionId(mission.id);
    setShowTaskForm(true);
    setAdminView("tasks");
  }

  function shouldLeaveTaskEdit(nextMissionId?: string) {
    if (!showTaskForm || !editingMissionId || nextMissionId === editingMissionId) {
      return true;
    }

    return window.confirm(t("discardTaskEditPrompt"));
  }

  function leaveTaskEdit() {
    setEditingMissionId(null);
    setShowTaskForm(false);
  }

  function selectMissionSafely(missionId: string) {
    if (!shouldLeaveTaskEdit(missionId)) {
      return;
    }

    if (showTaskForm && editingMissionId && missionId !== editingMissionId) {
      leaveTaskEdit();
    }

    setSelectedMissionId(missionId);
  }

  function selectDateSafely(date: string) {
    if (date !== calendarAnchorDate && !shouldLeaveTaskEdit()) {
      return false;
    }

    if (date !== calendarAnchorDate && showTaskForm && editingMissionId) {
      leaveTaskEdit();
    }

    setCalendarAnchorDate(date);
    setTaskForm((current) => ({ ...current, occurrenceDate: date }));
    setSelectedMissionId(filteredMissions.find((mission) => missionDateKey(mission) === date)?.id ?? null);
    return true;
  }

  function startEditTemplate(template: TaskTemplate) {
    setTemplateForm(templateToForm(template));
    setEditingTemplateId(template.id);
    setSelectedTemplateId(template.id);
    setAdminView("templates");
  }

  function logout() {
    setIsSignedIn(false);
    setFamily(null);
    setMissions([]);
    setTemplates([]);
    setAdminView("overview");
    setMessage("");
    clearWebSession();
  }

  function selectAuthMode(mode: AuthMode) {
    setAuthMode(mode);
  }

  function selectAdminView(view: AdminView) {
    setAdminView(view);
  }

  if (!isSignedIn) {
    return (
      <main className="authPage">
        <AccountMenu
          account={account}
          family={family}
          isSignedIn={isSignedIn}
          language={language}
          t={t}
          onAuthMode={selectAuthMode}
          onNavigate={selectAdminView}
          onLanguage={setLanguage}
          onLogout={logout}
        />
        <section className="authPanel">
          <div className="brandBlock">
            <p className="kicker">Koala Habit Admin</p>
            <h1>{language === "zh" ? "家长管理网站" : "Parent management website"}</h1>
            <p>{language === "zh" ? "注册、登录、管理孩子资料，配置任务内容，并查看日常执行。" : "Register, sign in, manage children, configure rich task content, and review daily execution from one web workspace."}</p>
          </div>
          <form className="authCard" onSubmit={submitAuth}>
            <div className="modeSwitch" role="tablist" aria-label="Authentication mode">
              <button className={authMode === "login" ? "active" : ""} type="button" onClick={() => setAuthMode("login")}>{t("login")}</button>
              <button className={authMode === "register" ? "active" : ""} type="button" onClick={() => setAuthMode("register")}>{t("register")}</button>
            </div>
            <label>
              {t("parentName")}
              <input value={account.name} disabled={authMode === "login"} onChange={(event) => setAccount({ ...account, name: event.target.value })} />
            </label>
            <label>
              Email
              <input type="email" value={account.email} onChange={(event) => setAccount({ ...account, email: event.target.value })} />
            </label>
            <label>
              {t("password")}
              <input type="password" value={account.password} onChange={(event) => setAccount({ ...account, password: event.target.value })} />
            </label>
            {authMode === "register" ? (
              <label>
                {t("confirmPassword")}
                <input type="password" value={account.confirmPassword} onChange={(event) => setAccount({ ...account, confirmPassword: event.target.value })} />
              </label>
            ) : null}
            <button type="submit">{authMode === "login" ? t("login") : t("createAccount")}</button>
            <button className="secondary" type="button" onClick={googleLogin}>{t("continueGoogle")}</button>
            {message ? <p className="message inline">{message}</p> : null}
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="siteShell">
      <header className="siteHeader">
        <div>
          <p className="kicker">{t("parentAdmin")}</p>
          <h1>Koala Habit</h1>
        </div>
        <nav className="topNav">
          {[
            ["overview", t("overview")],
            ["tasks", t("tasks")],
            ["templates", t("templates")],
            ["history", t("history")]
          ].map(([key, label]) => (
            <button key={key} className={adminView === key ? "active" : ""} type="button" onClick={() => setAdminView(key as AdminView)}>
              {label}
            </button>
          ))}
        </nav>
        <div className="headerActions">
          <button className="iconButton" type="button" aria-label="Help">?</button>
          <button className="iconButton" type="button" aria-label="Settings">⚙</button>
          <button className="iconButton" type="button" aria-label="Apps">▦</button>
          <AccountMenu
            account={account}
            family={family}
            isSignedIn={isSignedIn}
            language={language}
            t={t}
            onAuthMode={selectAuthMode}
            onNavigate={selectAdminView}
            onLanguage={setLanguage}
            onLogout={logout}
          />
        </div>
      </header>

      {message ? <p className="message toast">{message}</p> : null}

      {adminView === "overview" ? (
        <OverviewPage
          activeChild={activeChild}
          family={family}
          metrics={metrics}
          missions={missions}
          onAddChild={() => setAdminView("family")}
          onNewTask={startNewTask}
          onOpenTasks={() => setAdminView("tasks")}
          t={t}
        />
      ) : null}

      {adminView === "tasks" ? (
        <section className={`taskWorkspace ${taskLayout}`}>
          {taskLayout !== "right" ? (
          <div className="panel taskPrimaryPanel">
            <div className="sectionHead">
              <div>
                <p className="kicker">{t("calendarTasks")}</p>
                <h2>{formatDateTitle(calendarAnchorDate, calendarView)} · {activeChild?.name ?? "child"}</h2>
              </div>
              <button type="button" onClick={startNewTask}>{t("newTask")}</button>
            </div>
            <div className="calendarToolbar">
              <div className="modeSwitch">
                {(["day", "week", "month"] as CalendarView[]).map((view) => (
                  <button key={view} className={calendarView === view ? "active" : ""} type="button" onClick={() => setCalendarView(view)}>
                    {view}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={calendarAnchorDate}
                onChange={(event) => {
                  setCalendarAnchorDate(event.target.value);
                  setTaskForm((current) => ({ ...current, occurrenceDate: event.target.value }));
                }}
              />
              <button className="secondary" type="button" onClick={() => setIsFilterOpen(true)}>
                {t("filters")}{activeFilterCount(filters) ? ` (${activeFilterCount(filters)})` : ""}
              </button>
            </div>
            <div className="templateRow">
              {starterTemplates.map((template) => (
                <button
                  key={template.title}
                  className="chip"
                  type="button"
                  onClick={() => {
                    setTaskForm((current) => ({ ...current, ...template, attachments: [], detail: `${template.target} every day.`, occurrenceDate: calendarAnchorDate }));
                    setEditingMissionId(null);
                    setShowTaskForm(true);
                  }}
                >
                  {template.icon} {template.title}
                </button>
              ))}
            </div>
            <CalendarBoard
              anchorDate={calendarAnchorDate}
              missions={filteredMissions}
              selectedMissionId={selectedMission?.id}
              selectedDate={calendarAnchorDate}
              t={t}
              view={calendarView}
              onDateSelect={selectDateSafely}
              onSelect={selectMissionSafely}
            />
            <div className="taskList">
              {visibleMissions.map((mission) => (
                <article
                  key={mission.id}
                  className={selectedMission?.id === mission.id ? "selected" : ""}
                  onClick={() => selectMissionSafely(mission.id)}
                >
                  <div className="taskIcon" style={{ background: mission.tone ?? "#3F7D58" }}>{mission.icon}</div>
                  <div>
                    <strong>{mission.title}</strong>
                    <span>{formatMissionTime(mission)} · {formatCategory(mission.category)} · {formatSource(mission.source, t)} · {mission.target}</span>
                    <p>{mission.detail ?? mission.target}</p>
                  </div>
                  <span className={`status ${mission.status}`}>{mission.status}</span>
                </article>
              ))}
              {!visibleMissions.length ? (
                <div className="emptySlot">
                  <strong>{t("noTasks")}</strong>
                  <span>{language === "zh" ? "请选择其他日期，或为当前日历格创建任务。" : "Pick another date or create a task for this calendar slot."}</span>
                </div>
              ) : null}
            </div>
          </div>
          ) : null}

          <LayoutRail layout={taskLayout} onChange={setTaskLayout} t={t} />

          {taskLayout !== "left" ? (
          <aside className="panel detailPanel">
            {showTaskForm ? (
              <TaskFormView
                editing={Boolean(editingMissionId)}
                form={taskForm}
                onCancel={() => {
                  setEditingMissionId(null);
                  setShowTaskForm(false);
                }}
                onChange={setTaskForm}
                onResetTimedTask={editingMissionId ? () => resetTimedTask(editingMissionId) : undefined}
                onSubmit={submitTask}
                t={t}
              />
            ) : selectedMission ? (
              <TaskDetail mission={selectedMission} onComplete={completeTask} onDelete={deleteTask} onEdit={startEditTask} onResetTimedTask={resetTimedTask} t={t} />
            ) : (
              <div className="emptyState">
                <h2>{t("noTasks")}</h2>
                <p>{t("createFirstTask")}</p>
                <button type="button" onClick={startNewTask}>{t("newTask")}</button>
              </div>
            )}
          </aside>
          ) : null}
          {isFilterOpen ? (
            <TaskFilterDialog
              filters={filters}
              t={t}
              onChange={setFilters}
              onClose={() => setIsFilterOpen(false)}
              onReset={() => setFilters(emptyFilters)}
            />
          ) : null}
        </section>
      ) : null}

      {adminView === "templates" ? (
        <section className="templateWorkspace">
          <div className="panel">
            <div className="sectionHead">
              <div>
                <p className="kicker">{t("templates")}</p>
                <h2>{activeChild?.name ?? "child"}</h2>
              </div>
              <button type="button" onClick={startNewTemplate}>{t("newTemplate")}</button>
            </div>
            <div className="templateList">
              {templates.map((template) => (
                <article
                  key={template.id}
                  className={selectedTemplateId === template.id ? "selected" : ""}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <div className="taskIcon" style={{ background: template.tone }}>{template.icon}</div>
                  <div>
                    <strong>{template.title}</strong>
                    <span>{formatRepeatRule(template.repeatRule, t)} · {template.scheduledTime || t("anyTime")} · {formatCategory(template.category)}</span>
                    <p>{template.target}</p>
                  </div>
                  <span className={`status ${template.active ? "done" : "todo"}`}>{template.active ? "active" : "paused"}</span>
                </article>
              ))}
              {!templates.length ? (
                <div className="emptySlot">
                  <strong>{t("templates")}</strong>
                  <span>{t("createFirstTask")}</span>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="panel detailPanel">
            <TemplateFormView
              editing={Boolean(editingTemplateId)}
              form={templateForm}
              selectedTemplate={templates.find((template) => template.id === selectedTemplateId)}
              onCancel={() => {
                setEditingTemplateId(null);
                setTemplateForm(emptyTemplateForm);
              }}
              onChange={setTemplateForm}
              onDelete={deleteTemplate}
              onEdit={startEditTemplate}
              onGenerate={generateFromTemplate}
              onRepeatCommit={commitTemplateRepeatRule}
              onSubmit={submitTemplate}
              onToggle={toggleTemplate}
              t={t}
            />
          </aside>
        </section>
      ) : null}

      {adminView === "family" ? (
        <section className="gridTwo">
          <div className="panel">
            <p className="kicker">{t("family")}</p>
            <h2>{t("familyRoles")}</h2>
            <div className="memberList">
              {family?.parent ? (
                <article>
                  <strong>{family.parent.name}</strong>
                  <span>{family.parent.email} · {family.parent.provider} · Parent admin</span>
                </article>
              ) : null}
              {family?.children.map((child) => (
                <article key={child.id}>
                  <strong>{child.name}</strong>
                  <span>Grade {child.grade} · Child executor · PIN length {child.pinLength ?? 4}</span>
                </article>
              ))}
            </div>
          </div>
          <form className="panel formStack" onSubmit={createChild}>
            <p className="kicker">{t("childProfile")}</p>
            <h2>{t("createChild")}</h2>
            <label>{t("childName")}<input value={childForm.name} onChange={(event) => setChildForm({ ...childForm, name: event.target.value })} /></label>
            <label>{t("grade")}<input value={childForm.grade} onChange={(event) => setChildForm({ ...childForm, grade: event.target.value })} /></label>
            <label>PIN<input value={childForm.pin} onChange={(event) => setChildForm({ ...childForm, pin: event.target.value.replace(/\D/g, "") })} /></label>
            <button type="submit">{t("saveChanges")}</button>
          </form>
        </section>
      ) : null}

      {adminView === "rules" ? (
        <section className="gridTwo">
          <div className="panel">
            <p className="kicker">{t("rules")}</p>
            <h2>{t("rewardRules")}</h2>
            <div className="ruleGrid">
              <article><strong>{language === "zh" ? "任务完成" : "Task completion"}</strong><span>{language === "zh" ? "家长确认后解锁能量和娱乐时间。" : "Unlock energy and play minutes after parent confirmation."}</span></article>
              <article><strong>{language === "zh" ? "孩子角色" : "Child role"}</strong><span>{language === "zh" ? "可以查看、提交、拍照、录音并查看进度。" : "Can view, submit, photograph, record, and check progress."}</span></article>
              <article><strong>{language === "zh" ? "家长角色" : "Parent role"}</strong><span>{language === "zh" ? "可以配置日程、编辑模板、查看历史并确认奖励。" : "Can configure schedules, edit templates, review history, and confirm rewards."}</span></article>
            </div>
          </div>
          <div className="panel progressCard">
            <span>{t("completionRate")}</span>
            <strong>{completionRate}%</strong>
            <div><i style={{ width: `${completionRate}%` }} /></div>
          </div>
        </section>
      ) : null}

      {adminView === "history" ? (
        <section className="panel">
          <p className="kicker">{t("history")}</p>
          <h2>{t("history")}</h2>
          <div className="historyList">
            {missions.map((mission) => (
              <article key={`history-${mission.id}`}>
                <span>{mission.status === "done" ? t("done") : t("open")}</span>
                <strong>{mission.title}</strong>
                <em>{mission.detail ?? mission.target}</em>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function OverviewPage({
  activeChild,
  family,
  metrics,
  missions,
  onAddChild,
  onNewTask,
  onOpenTasks,
  t
}: {
  activeChild?: Child;
  family: Family | null;
  metrics: string[][];
  missions: Mission[];
  onAddChild: () => void;
  onNewTask: () => void;
  onOpenTasks: () => void;
  t: (key: string) => string;
}) {
  const today = todayKey();
  const todayMissions = missions.filter((mission) => missionDateKey(mission) === today);
  const openMissions = missions.filter((mission) => mission.status !== "done");
  const doneMissions = missions.filter((mission) => mission.status === "done");
  const sourceRows = sourceOptions.map((option) => ({
    count: missions.filter((mission) => (mission.source ?? "parent") === option.value).length,
    label: formatSource(option.value, t),
    value: option.value
  })).filter((row) => row.count > 0);
  const categoryRows = categoryOptions.map((option) => ({
    count: missions.filter((mission) => normalizeCategory(mission.category) === option.value).length,
    label: option.label,
    value: option.value
  })).filter((row) => row.count > 0);

  return (
    <section className="overviewPage">
      <div className="overviewHero">
        <div>
          <p className="kicker">{t("overview")}</p>
          <h2>{family?.name ?? "Koala Family"}</h2>
          <p>{activeChild ? `${activeChild.name} · Grade ${activeChild.grade}` : t("childRequired")}</p>
        </div>
        <div className="actionRow">
          <button type="button" onClick={onNewTask}>{t("newTask")}</button>
          <button className="secondary" type="button" onClick={activeChild ? onOpenTasks : onAddChild}>
            {activeChild ? t("tasks") : t("createChild")}
          </button>
        </div>
      </div>

      <section className="metrics">
        {metrics.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <div className="overviewGrid">
        <div className="panel overviewTaskPanel">
          <div className="sectionHead">
            <div>
              <p className="kicker">{t("today")}</p>
              <h2>{t("taskList")}</h2>
            </div>
            <button className="secondary" type="button" onClick={onOpenTasks}>{t("tasks")}</button>
          </div>
          <div className="overviewTaskList">
            {(todayMissions.length ? todayMissions : openMissions.slice(0, 5)).map((mission) => (
              <article key={`overview-${mission.id}`}>
                <div className="taskIcon" style={{ background: mission.tone ?? "#3F7D58" }}>{mission.icon}</div>
                <div>
                  <strong>{mission.title}</strong>
                  <span>{formatMissionTime(mission)} · {formatCategory(mission.category)} · {formatSource(mission.source, t)}</span>
                </div>
                <span className={`status ${mission.status}`}>{mission.status}</span>
              </article>
            ))}
            {!missions.length ? (
              <div className="emptySlot">
                <strong>{t("noTasks")}</strong>
                <span>{t("createFirstTask")}</span>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="overviewSide">
          <div className="panel progressCard">
            <span>{t("completionRate")}</span>
            <strong>{missions.length ? Math.round((doneMissions.length / missions.length) * 100) : 0}%</strong>
            <div><i style={{ width: `${missions.length ? Math.round((doneMissions.length / missions.length) * 100) : 0}%` }} /></div>
          </div>
          <div className="panel overviewBreakdown">
            <p className="kicker">{t("source")}</p>
            {(sourceRows.length ? sourceRows : [{ count: 0, label: formatSource("parent", t), value: "parent" }]).map((row) => (
              <div key={row.value}>
                <span>{row.label}</span>
                <strong>{row.count}</strong>
              </div>
            ))}
          </div>
          <div className="panel overviewBreakdown">
            <p className="kicker">{t("category")}</p>
            {(categoryRows.length ? categoryRows : [{ count: 0, label: t("tasks"), value: "empty" }]).map((row) => (
              <div key={row.value}>
                <span>{row.label}</span>
                <strong>{row.count}</strong>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function LayoutRail({ layout, onChange, t }: { layout: TaskLayout; onChange: (layout: TaskLayout) => void; t: (key: string) => string }) {
  const options: Array<{ label: string; title: string; value: TaskLayout }> = [
    { label: "‹", title: t("leftPanel"), value: "left" },
    { label: "Ⅱ", title: t("splitView"), value: "split" },
    { label: "›", title: t("rightPanel"), value: "right" }
  ];

  return (
    <div className="layoutRail" aria-label={t("layout")}>
      {options.map((option) => (
        <button
          key={option.value}
          aria-label={option.title}
          className={layout === option.value ? "active" : ""}
          title={option.title}
          type="button"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ExpandableTextarea({
  label,
  onChange,
  t,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  t: (key: string) => string;
  value: string;
}) {
  const textareaId = useId();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="textareaField wide">
      <div className="fieldHeader">
        <label htmlFor={textareaId}>{label}</label>
        <button aria-label={t("expandEditor")} className="miniButton" title={t("expandEditor")} type="button" onClick={() => setIsExpanded(true)}>⤢</button>
      </div>
      <textarea id={textareaId} value={value} onChange={(event) => onChange(event.target.value)} />
      {isExpanded ? (
        <div
          className="modalBackdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsExpanded(false);
            }
          }}
        >
          <section aria-label={label} aria-modal="true" className="largeTextDialog" role="dialog">
            <div className="sectionHead">
              <div>
                <p className="kicker">{t("expandEditor")}</p>
                <h2>{label}</h2>
              </div>
              <button className="secondary" type="button" onClick={() => setIsExpanded(false)}>{t("close")}</button>
            </div>
            <textarea autoFocus className="largeTextArea" value={value} onChange={(event) => onChange(event.target.value)} />
            <div className="actionRow">
              <button type="button" onClick={() => setIsExpanded(false)}>{t("ok")}</button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function TaskFormView({
  editing,
  form,
  onCancel,
  onChange,
  onResetTimedTask,
  onSubmit,
  t
}: {
  editing: boolean;
  form: TaskForm;
  onCancel: () => void;
  onChange: (form: TaskForm) => void;
  onResetTimedTask?: () => void;
  onSubmit: (event: FormEvent) => void;
  t: (key: string) => string;
}) {
  const canResetTimedTask = editing && Boolean(onResetTimedTask) && Boolean(form.timeLimitMinutes || form.targetApp);

  return (
    <form className="taskForm" onSubmit={onSubmit}>
      <div className="sectionHead">
        <div>
          <p className="kicker">{editing ? t("editTask") : t("addTask")}</p>
          <h2>{t("taskContent")}</h2>
        </div>
        <div className="formHeaderActions">
          {canResetTimedTask ? (
            <button className="secondary" type="button" onClick={onResetTimedTask}>{t("resetTimedTask")}</button>
          ) : null}
          <button className="secondary" type="button" onClick={onCancel}>{t("cancel")}</button>
        </div>
      </div>
      <div className="formGrid">
        <label>Icon<input value={form.icon} onChange={(event) => onChange({ ...form, icon: event.target.value })} /></label>
        <label>{t("taskName")}<input value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} /></label>
        <label>{t("category")}<CategorySelect value={form.category} onChange={(category) => onChange({ ...form, category })} /></label>
        <label>{t("themeColor")}<input type="color" value={form.tone} onChange={(event) => onChange({ ...form, tone: event.target.value })} /></label>
        <label className="wide">{t("dailyTarget")}<input value={form.target} onChange={(event) => onChange({ ...form, target: event.target.value })} /></label>
        <label>{t("targetApp")}<input placeholder="Maps;Youtobe" value={form.targetApp} onChange={(event) => onChange({ ...form, targetApp: event.target.value })} /></label>
        <label>{t("rewardEnergy")}<input type="number" value={form.energy} onChange={(event) => onChange({ ...form, energy: event.target.value })} /></label>
        <label>{t("totalSteps")}<input type="number" min="1" value={form.total} onChange={(event) => onChange({ ...form, total: event.target.value })} /></label>
        <label>{t("date")}<input type="date" value={form.occurrenceDate} onChange={(event) => onChange({ ...form, occurrenceDate: event.target.value })} /></label>
        <label>{t("time")}<input type="time" value={form.scheduledTime} onChange={(event) => onChange({ ...form, scheduledTime: event.target.value })} /></label>
        <label>{t("source")}<SourceSelect t={t} value={form.source} onChange={(source) => onChange({ ...form, source })} /></label>
        <label>{t("timeLimit")}<input type="number" min="1" value={form.timeLimitMinutes} onChange={(event) => onChange({ ...form, timeLimitMinutes: event.target.value })} /></label>
        <RepeatRuleEditor value={form.repeatRule} onChange={(repeatRule) => onChange({ ...form, repeatRule })} t={t} />
        <ExpandableTextarea label={t("detailedContent")} t={t} value={form.detail} onChange={(detail) => onChange({ ...form, detail })} />
        <ExpandableTextarea label={t("goals")} t={t} value={form.goals} onChange={(goals) => onChange({ ...form, goals })} />
        <label>{t("materials")}<input value={form.materials} onChange={(event) => onChange({ ...form, materials: event.target.value })} /></label>
        <label>{t("vocabulary")}<input value={form.vocabulary} onChange={(event) => onChange({ ...form, vocabulary: event.target.value })} /></label>
        <label className="wide">{t("assessmentMethod")}<input value={form.assessment} onChange={(event) => onChange({ ...form, assessment: event.target.value })} /></label>
        <ExpandableTextarea label={t("parentNotes")} t={t} value={form.notes} onChange={(notes) => onChange({ ...form, notes })} />
        <label className="wide fileInput">
          {t("uploadFile")}
          <input multiple type="file" onChange={(event) => void attachFiles(event.currentTarget.files, form, onChange)} />
        </label>
      </div>
      {form.attachments.length > 0 ? (
        <div className="attachmentEditor">
          {form.attachments.map((attachment) => (
            <article key={attachment.id}>
              <div>
                <strong>{attachment.name}</strong>
                <span>{attachmentLabel(attachment.mimeType, attachment.size)}</span>
              </div>
              <button
                className="danger"
                type="button"
                onClick={() => onChange({ ...form, attachments: form.attachments.filter((item) => item.id !== attachment.id) })}
              >
                Remove
              </button>
            </article>
          ))}
        </div>
      ) : null}
      <button type="submit">{editing ? t("saveChanges") : t("createTask")}</button>
    </form>
  );
}

function TaskFilterDialog({
  filters,
  onChange,
  onClose,
  onReset,
  t
}: {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  onClose: () => void;
  onReset: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="modalBackdrop" role="presentation">
      <section aria-label={t("filters")} className="filterDialog" role="dialog">
        <div className="sectionHead">
          <div>
            <p className="kicker">{t("calendarTasks")}</p>
            <h2>{t("filters")}</h2>
          </div>
          <button className="secondary" type="button" onClick={onClose}>{t("close")}</button>
        </div>
        <div className="formGrid compact">
          <label>{t("dateRange")} {t("from")}<input type="date" value={filters.dateFrom} onChange={(event) => onChange({ ...filters, dateFrom: event.target.value })} /></label>
          <label>{t("dateRange")} {t("to")}<input type="date" value={filters.dateTo} onChange={(event) => onChange({ ...filters, dateTo: event.target.value })} /></label>
          <label>{t("timeRange")} {t("from")}<input type="time" value={filters.timeFrom} onChange={(event) => onChange({ ...filters, timeFrom: event.target.value })} /></label>
          <label>{t("timeRange")} {t("to")}<input type="time" value={filters.timeTo} onChange={(event) => onChange({ ...filters, timeTo: event.target.value })} /></label>
        </div>
        <MultiSelectGroup
          label={t("category")}
          options={categoryOptions}
          values={filters.categories}
          onChange={(categories) => onChange({ ...filters, categories })}
        />
        <MultiSelectGroup
          label={t("source")}
          options={sourceOptions.map((option) => ({ ...option, label: formatSource(option.value, t) }))}
          values={filters.sources}
          onChange={(sources) => onChange({ ...filters, sources })}
        />
        <div className="actionRow">
          <button className="secondary" type="button" onClick={onReset}>{t("clearFilters")}</button>
          <button type="button" onClick={onClose}>{t("ok")}</button>
        </div>
      </section>
    </div>
  );
}

function MultiSelectGroup({
  label,
  onChange,
  options,
  values
}: {
  label: string;
  onChange: (values: string[]) => void;
  options: Array<{ label: string; value: string }>;
  values: string[];
}) {
  return (
    <fieldset className="multiSelectGroup">
      <legend>{label}</legend>
      <div>
        {options.map((option) => {
          const checked = values.includes(option.value);
          return (
            <label key={option.value} className={checked ? "active" : ""}>
              <input
                checked={checked}
                type="checkbox"
                onChange={() => onChange(checked ? values.filter((value) => value !== option.value) : [...values, option.value])}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function CategorySelect({ onChange, value }: { onChange: (value: string) => void; value: string }) {
  const normalizedValue = categoryOptions.some((option) => option.value === value) ? value : "other";

  return (
    <select value={normalizedValue} onChange={(event) => onChange(event.target.value)}>
      {categoryOptions.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

function SourceSelect({ onChange, t, value }: { onChange: (value: string) => void; t: (key: string) => string; value: string }) {
  return (
    <select value={value || "parent"} onChange={(event) => onChange(event.target.value)}>
      {sourceOptions.map((option) => (
        <option key={option.value} value={option.value}>{formatSource(option.value, t)}</option>
      ))}
    </select>
  );
}

function TemplateFormView({
  editing,
  form,
  onCancel,
  onChange,
  onDelete,
  onEdit,
  onGenerate,
  onRepeatCommit,
  onSubmit,
  onToggle,
  selectedTemplate,
  t
}: {
  editing: boolean;
  form: TemplateForm;
  onCancel: () => void;
  onChange: (form: TemplateForm) => void;
  onDelete: (templateId: string) => void;
  onEdit: (template: TaskTemplate) => void;
  onGenerate: (templateId: string) => void;
  onRepeatCommit: (repeatRule: string) => Promise<void> | void;
  onSubmit: (event: FormEvent) => void;
  onToggle: (template: TaskTemplate) => void;
  selectedTemplate?: TaskTemplate;
  t: (key: string) => string;
}) {
  return (
    <div className="templateDetail">
      {selectedTemplate && !editing ? (
        <>
          <div className="detailHero">
            <div className="taskIcon large" style={{ background: selectedTemplate.tone }}>{selectedTemplate.icon}</div>
            <div>
              <p className="kicker">{t("templates")}</p>
              <h2>{selectedTemplate.title}</h2>
              <span>{formatRepeatRule(selectedTemplate.repeatRule, t)} · {selectedTemplate.scheduledTime || t("anyTime")}</span>
            </div>
          </div>
          <section>
            <h3>{t("dailyTarget")}</h3>
            <p>{selectedTemplate.target}</p>
          </section>
          <section>
            <h3>{t("goals")}</h3>
            <ul>
              {(selectedTemplate.goals.length ? selectedTemplate.goals : [t("noChecklist")]).map((goal) => <li key={goal}>{goal}</li>)}
            </ul>
          </section>
          <dl className="detailGrid">
            <div><dt>{t("status")}</dt><dd>{selectedTemplate.active ? "active" : "paused"}</dd></div>
            <div><dt>{t("category")}</dt><dd>{formatCategory(selectedTemplate.category)}</dd></div>
            <div><dt>{t("reward")}</dt><dd>{selectedTemplate.energy}</dd></div>
            <div><dt>{t("totalSteps")}</dt><dd>{selectedTemplate.total}</dd></div>
          </dl>
          <div className="actionRow">
            <button type="button" onClick={() => onEdit(selectedTemplate)}>{t("editTask")}</button>
            <button className="secondary" type="button" onClick={() => onGenerate(selectedTemplate.id)}>{t("createTask")}</button>
            <button className="secondary" type="button" onClick={() => onToggle(selectedTemplate)}>
              {selectedTemplate.active ? "Pause" : "Activate"}
            </button>
            <button className="danger" type="button" onClick={() => onDelete(selectedTemplate.id)}>{t("delete")}</button>
          </div>
        </>
      ) : (
        <form className="taskForm" onSubmit={onSubmit}>
          <div className="sectionHead">
            <div>
              <p className="kicker">{editing ? t("editTask") : t("newTemplate")}</p>
              <h2>{t("templates")}</h2>
            </div>
            <button className="secondary" type="button" onClick={onCancel}>{t("cancel")}</button>
          </div>
          <div className="formGrid compact">
            <label>Icon<input value={form.icon} onChange={(event) => onChange({ ...form, icon: event.target.value })} /></label>
            <label>{t("taskName")}<input value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} /></label>
            <label>{t("category")}<CategorySelect value={form.category} onChange={(category) => onChange({ ...form, category })} /></label>
            <label>{t("themeColor")}<input type="color" value={form.tone} onChange={(event) => onChange({ ...form, tone: event.target.value })} /></label>
            <label className="wide">{t("dailyTarget")}<input value={form.target} onChange={(event) => onChange({ ...form, target: event.target.value })} /></label>
            <label>{t("targetApp")}<input placeholder="Maps;Youtobe" value={form.targetApp} onChange={(event) => onChange({ ...form, targetApp: event.target.value })} /></label>
            <label>{t("rewardEnergy")}<input type="number" value={form.energy} onChange={(event) => onChange({ ...form, energy: event.target.value })} /></label>
            <label>{t("totalSteps")}<input type="number" min="1" value={form.total} onChange={(event) => onChange({ ...form, total: event.target.value })} /></label>
            <label>{t("time")}<input type="time" value={form.scheduledTime} onChange={(event) => onChange({ ...form, scheduledTime: event.target.value })} /></label>
            <label>{t("timeLimit")}<input type="number" min="1" value={form.timeLimitMinutes} onChange={(event) => onChange({ ...form, timeLimitMinutes: event.target.value })} /></label>
            <RepeatRuleEditor
              value={form.repeatRule}
              onChange={(repeatRule) => onChange({ ...form, repeatRule })}
              onCommit={onRepeatCommit}
              t={t}
            />
            <ExpandableTextarea label={t("goals")} t={t} value={form.goals} onChange={(goals) => onChange({ ...form, goals })} />
            <label className="checkboxLine">
              <input checked={form.active} type="checkbox" onChange={(event) => onChange({ ...form, active: event.target.checked })} />
              {t("status")}
            </label>
          </div>
          <button type="submit">{editing ? t("saveChanges") : t("newTemplate")}</button>
        </form>
      )}
    </div>
  );
}

function AccountMenu({
  account,
  family,
  isSignedIn,
  language,
  t,
  onAuthMode,
  onLanguage,
  onLogout,
  onNavigate
}: {
  account: { confirmPassword: string; email: string; name: string; password: string };
  family: Family | null;
  isSignedIn: boolean;
  language: Language;
  t: (key: string) => string;
  onAuthMode: (mode: AuthMode) => void;
  onLanguage: (language: Language) => void;
  onLogout: () => void;
  onNavigate: (view: AdminView) => void;
}) {
  const parent = family?.parent;
  const name = parent?.name ?? account.name;
  const email = parent?.email ?? account.email;

  return (
    <details className="accountMenu">
      <summary className="avatarButton" aria-label={t("account")}>
        <span>{initials(name)}</span>
      </summary>
      <div className="accountPopover" role="menu">
        <div className="accountSummary">
          <div className="avatarLarge">{initials(name)}</div>
          <strong>{name || t("account")}</strong>
          <span>{email}</span>
        </div>
        <div className="menuGroup">
          {isSignedIn ? (
            <>
              <button type="button" role="menuitem" onClick={() => onNavigate("family")}>{t("familyRoles")}</button>
              <button type="button" role="menuitem" onClick={() => onNavigate("rules")}>{t("rules")}</button>
            </>
          ) : (
            <>
              <button type="button" role="menuitem" onClick={() => onAuthMode("login")}>{t("login")}</button>
              <button type="button" role="menuitem" onClick={() => onAuthMode("register")}>{t("register")}</button>
            </>
          )}
        </div>
        <div className="menuGroup">
          <span className="menuLabel">{language === "zh" ? "语种" : "Language"}</span>
          <div className="menuSwitch" aria-label="Language switch">
            <button className={language === "en" ? "active" : ""} type="button" onClick={() => onLanguage("en")}>EN</button>
            <button className={language === "zh" ? "active" : ""} type="button" onClick={() => onLanguage("zh")}>中文</button>
          </div>
        </div>
        {isSignedIn ? (
          <div className="menuGroup">
            <button className="dangerText" type="button" role="menuitem" onClick={onLogout}>{t("logout")}</button>
          </div>
        ) : null}
      </div>
    </details>
  );
}

function RepeatRuleEditor({
  onCommit,
  onChange,
  t,
  value
}: {
  onCommit?: (value: string) => Promise<void> | void;
  onChange: (value: string) => void;
  t: (key: string) => string;
  value: string;
}) {
  const [draft, setDraft] = useState(() => parseRepeatRule(value));

  useEffect(() => {
    setDraft(parseRepeatRule(value));
  }, [value]);

  async function commit(nextDraft = draft) {
    const repeatRule = buildRepeatRule(nextDraft);
    onChange(repeatRule);
    await onCommit?.(repeatRule);
  }

  function updateFrequency(frequency: RepeatDraft["frequency"]) {
    const nextDraft = {
      ...draft,
      byDay: frequency === "weeklyCustom" ? draft.byDay : [],
      frequency
    };
    setDraft(nextDraft);

    if (frequency !== "weeklyCustom") {
      void commit(nextDraft);
    }
  }

  function toggleDay(day: string) {
    const byDay = draft.byDay.includes(day) ? draft.byDay.filter((item) => item !== day) : [...draft.byDay, day];
    setDraft({ ...draft, byDay });
  }

  return (
    <div className="repeatEditor">
      <label className="repeatFrequency">
        <span>{t("repeat")}:</span>
        <select value={draft.frequency} onChange={(event) => updateFrequency(event.target.value as RepeatDraft["frequency"])}>
          <option value="daily">{t("daily")}</option>
          <option value="workDaily">{t("workDaily")}</option>
          <option value="weekly">{t("weekly")}</option>
          <option value="weeklyCustom">{t("weeklyCustom")}</option>
          <option value="monthly">{t("monthly")}</option>
          <option value="none">{t("doesNotRepeat")}</option>
        </select>
      </label>
      {draft.frequency === "weeklyCustom" ? (
        <div className="weeklyRepeatPanel">
          <div className="weeklyInterval">
            <span>{t("every")}</span>
            <input
              min="1"
              type="number"
              value={draft.interval}
              onChange={(event) => setDraft({ ...draft, interval: Math.max(1, Number(event.target.value) || 1) })}
            />
            <span>{t("week")}:</span>
          </div>
          <div className="weekdayPicker" aria-label="Weekdays">
            {weekDayOptions.map((day) => (
              <button
                key={day.code}
                className={draft.byDay.includes(day.code) ? "active" : ""}
                type="button"
                onClick={() => toggleDay(day.code)}
              >
                {day.label}
              </button>
            ))}
          </div>
          <div className="repeatActions">
            <button className="secondary" type="button" onClick={() => setDraft(parseRepeatRule(value))}>{t("cancel")}</button>
            <button type="button" onClick={() => void commit()}>{t("ok")}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function initials(value: string) {
  const trimmed = value.trim();
  return (trimmed ? trimmed.slice(0, 1) : "K").toUpperCase();
}

function isTimedMission(mission: Mission) {
  const knownTimedDemoTitles = new Set(["日常体能训练", "电视时间", "Soccer"]);
  const hasTimerEvent = mission.eventRecords?.some((event) => {
    const eventType = event.eventType ?? "";
    const title = event.title ?? "";
    return eventType.startsWith("timer_") || title.startsWith("App run ");
  });

  return Boolean(
    mission.executionType === "timed" ||
    mission.timeLimitMinutes ||
    mission.targetApp ||
    mission.activeRun ||
    hasTimerEvent ||
    mission.category === "entertainment" ||
    mission.category === "Movies" ||
    mission.category === "Game" ||
    knownTimedDemoTitles.has(mission.title)
  );
}

function TaskDetail({
  mission,
  onComplete,
  onDelete,
  onEdit,
  onResetTimedTask,
  t
}: {
  mission: Mission;
  onComplete: (missionId: string) => void;
  onDelete: (missionId: string) => void;
  onEdit: (mission: Mission) => void;
  onResetTimedTask: (missionId: string) => void;
  t: (key: string) => string;
}) {
  const isTimedTask = isTimedMission(mission);
  const hasTimedSettings = Boolean(mission.timeLimitMinutes || mission.targetApp);
  const shouldShowTimedReset = hasTimedSettings || isTimedTask;

  return (
    <div className="taskDetail">
      <div className="detailHero">
        <div className="taskIcon large" style={{ background: mission.tone ?? "#3F7D58" }}>{mission.icon}</div>
        <div>
          <p className="kicker">{t("taskContent")}</p>
          <h2>{mission.title}</h2>
          <span>{formatCategory(mission.category)} · {mission.target}</span>
        </div>
      </div>
      {shouldShowTimedReset ? (
        <div className="timedTaskControl">
          <div>
            <p className="kicker">{t("timeLimit")}</p>
            <strong>{mission.timeLimitMinutes ? `${mission.timeLimitMinutes} min` : t("anyTime")}</strong>
            <span>{mission.targetApp || t("targetApp")}</span>
          </div>
          <button className="secondary" type="button" onClick={() => onResetTimedTask(mission.id)}>{t("resetTimedTask")}</button>
        </div>
      ) : null}
      <section>
        <h3>{t("instructions")}</h3>
        <p>{mission.detail || t("noDetail")}</p>
      </section>
      <section>
        <h3>{t("goals")}</h3>
        <ul>
          {(mission.goals?.length ? mission.goals : [t("noChecklist")]).map((goal) => <li key={goal}>{goal}</li>)}
        </ul>
      </section>
      {mission.planDetail?.attachments?.length ? (
        <section>
          <h3>{t("attachments")}</h3>
          <div className="detailAttachments">
            {mission.planDetail.attachments.map((attachment) => (
              <a key={attachment.id} href={attachment.uri} rel="noreferrer" target="_blank">
                <strong>{attachment.name}</strong>
                <span>{attachmentLabel(attachment.mimeType, attachment.size)}</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
      <dl className="detailGrid">
        <div><dt>{t("dateLabel")}</dt><dd>{formatDate(mission.occurrenceDate, t)}</dd></div>
        <div><dt>{t("time")}</dt><dd>{mission.scheduledTime || t("anyTime")}</dd></div>
        <div><dt>{t("source")}</dt><dd>{formatSource(mission.source, t)}</dd></div>
        <div><dt>{t("timeLimit")}</dt><dd>{mission.timeLimitMinutes ? `${mission.timeLimitMinutes} min` : t("anyTime")}</dd></div>
        <div><dt>{t("targetApp")}</dt><dd>{mission.targetApp || t("anyTime")}</dd></div>
        <div><dt>{t("repeat")}</dt><dd>{formatRepeatRule(mission.repeatRule, t)}</dd></div>
        <div><dt>{t("progress")}</dt><dd>{mission.progress ?? 0}/{mission.total ?? 1}</dd></div>
        <div><dt>{t("reward")}</dt><dd>{mission.energy}</dd></div>
        <div><dt>{t("status")}</dt><dd>{mission.status}</dd></div>
        <div><dt>{t("review")}</dt><dd>{languageAwareReview(t)}</dd></div>
      </dl>
      <div className="actionRow">
        <button type="button" onClick={() => onEdit(mission)}>{t("editTask")}</button>
        <button className="secondary" type="button" onClick={() => onComplete(mission.id)}>{t("confirmComplete")}</button>
        <button className="danger" type="button" onClick={() => onDelete(mission.id)}>{t("delete")}</button>
      </div>
    </div>
  );
}

function CalendarBoard({
  anchorDate,
  missions,
  onDateSelect,
  onSelect,
  selectedDate,
  selectedMissionId,
  t,
  view
}: {
  anchorDate: string;
  missions: Mission[];
  onDateSelect: (date: string) => boolean;
  onSelect: (missionId: string) => void;
  selectedDate: string;
  selectedMissionId?: string;
  t: (key: string) => string;
  view: CalendarView;
}) {
  const days = view === "day" ? [anchorDate] : view === "week" ? weekDays(anchorDate) : monthDays(anchorDate);

  return (
    <div className={`calendarBoard ${view}`}>
      {days.map((date) => {
        const dayMissions = missions.filter((mission) => missionDateKey(mission) === date);

        return (
          <article
            key={date}
            className={[date === todayKey() ? "today" : "", date === selectedDate ? "selectedDate" : ""].filter(Boolean).join(" ")}
            onClick={() => {
              onDateSelect(date);
            }}
          >
            <header>
              <strong>{shortDateLabel(date)}</strong>
              <span>{dayMissions.length}</span>
            </header>
            <div className="calendarTasks">
              {dayMissions.map((mission) => (
                <button
                  key={mission.id}
                  className={selectedMissionId === mission.id ? "selected" : ""}
                  style={{ borderLeftColor: mission.tone ?? "#3F7D58" }}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!onDateSelect(date)) {
                      return;
                    }
                    onSelect(mission.id);
                  }}
                >
                  <span>{mission.scheduledTime || "Any time"}</span>
                  <strong>{mission.title}</strong>
                  <em>{formatSource(mission.source, t)}</em>
                </button>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function buildTaskDetail(form: TaskForm) {
  return [
    form.detail.trim(),
    labeledTaskDetail("Materials", form.materials),
    labeledTaskDetail("Vocabulary", form.vocabulary),
    labeledTaskDetail("Assessment", form.assessment),
    labeledTaskDetail("Parent notes", form.notes)
  ].filter(Boolean).join("\n\n");
}

function labeledTaskDetail(label: string, value: string) {
  const trimmed = value.trim();
  return trimmed ? `${label}: ${trimmed}` : "";
}

type SplitTaskDetailParts = Pick<TaskForm, "assessment" | "detail" | "materials" | "notes" | "vocabulary">;

const taskDetailSectionPattern = /(?:^|\n)[ \t]*(Materials|Vocabulary|Assessment|Parent notes):[ \t]*/gi;

function splitTaskDetail(detail: string, fallback: Partial<Omit<SplitTaskDetailParts, "detail">> = {}): SplitTaskDetailParts {
  const parts: SplitTaskDetailParts = {
    assessment: "",
    detail: detail.trim(),
    materials: "",
    notes: "",
    vocabulary: ""
  };
  const matches: RegExpExecArray[] = [];
  taskDetailSectionPattern.lastIndex = 0;
  let match = taskDetailSectionPattern.exec(detail);

  while (match) {
    matches.push(match);
    match = taskDetailSectionPattern.exec(detail);
  }

  if (!matches.length) {
    parts.assessment = fallback.assessment ?? "";
    parts.materials = fallback.materials ?? "";
    parts.notes = fallback.notes ?? "";
    parts.vocabulary = fallback.vocabulary ?? "";
    return parts;
  }

  const firstSectionIndex = matches[0].index ?? 0;
  parts.detail = detail.slice(0, firstSectionIndex).trim();

  matches.forEach((match, index) => {
    const key = match[1].toLowerCase();
    const sectionStart = (match.index ?? 0) + match[0].length;
    const nextSectionStart = index + 1 < matches.length ? matches[index + 1].index ?? detail.length : detail.length;
    const content = detail.slice(sectionStart, nextSectionStart).trim();

    if (!content) {
      return;
    }

    if (key === "materials" && !parts.materials) {
      parts.materials = content;
    }
    if (key === "vocabulary" && !parts.vocabulary) {
      parts.vocabulary = content;
    }
    if (key === "assessment" && !parts.assessment) {
      parts.assessment = content;
    }
    if (key === "parent notes" && !parts.notes) {
      parts.notes = content;
    }
  });

  parts.assessment = parts.assessment || fallback.assessment || "";
  parts.materials = parts.materials || fallback.materials || "";
  parts.notes = parts.notes || fallback.notes || "";
  parts.vocabulary = parts.vocabulary || fallback.vocabulary || "";

  return parts;
}

function templatePayload(childId: string, form: TemplateForm) {
  return {
    active: form.active,
    category: normalizeCategory(form.category),
    childId,
    energy: Number(form.energy),
    goals: toList(form.goals),
    icon: form.icon,
    repeatRule: form.repeatRule,
    rewardMinutes: Number(form.energy),
    scheduledTime: form.scheduledTime,
    source: form.source,
    target: form.target,
    targetApp: normalizeTargetApps(form.targetApp) || undefined,
    timeLimitMinutes: form.timeLimitMinutes ? Number(form.timeLimitMinutes) : undefined,
    title: form.title || "New template",
    tone: form.tone,
    total: Math.max(1, Number(form.total))
  };
}

function normalizeTargetApps(value: string) {
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(";");
}

function normalizeCategory(value: string) {
  if (categoryOptions.some((option) => option.value === value)) {
    return value;
  }

  if (value === "reading" || value === "english") {
    return "Eng";
  }

  if (value === "language" || value === "chinese") {
    return "Chinese";
  }

  if (value === "math") {
    return "Math";
  }

  if (value === "sport") {
    return "Sports";
  }

  if (value === "entertainment" || value === "Movies") {
    return "Game";
  }

  if (value === "other" || value === "music") {
    return "Other";
  }

  return "Other";
}

function formatCategory(value: string) {
  const category = normalizeCategory(value);
  return categoryOptions.find((option) => option.value === category)?.label ?? "其他";
}

function formatSource(value: string | undefined, t: (key: string) => string) {
  switch (value) {
    case "calendar":
      return t("calendar");
    case "import":
      return t("imported");
    case "shared":
      return t("shared");
    default:
      return t("parentSource");
  }
}

function activeFilterCount(filters: TaskFilters) {
  return [
    filters.dateFrom,
    filters.dateTo,
    filters.timeFrom,
    filters.timeTo,
    ...filters.categories,
    ...filters.sources
  ].filter(Boolean).length;
}

function applyTaskFilters(missions: Mission[], filters: TaskFilters) {
  return missions.filter((mission) => {
    const date = missionDateKey(mission);
    const time = mission.scheduledTime ?? "";
    const category = normalizeCategory(mission.category);
    const source = mission.source ?? "parent";

    if (filters.dateFrom && date < filters.dateFrom) {
      return false;
    }

    if (filters.dateTo && date > filters.dateTo) {
      return false;
    }

    if (filters.timeFrom && (!time || time < filters.timeFrom)) {
      return false;
    }

    if (filters.timeTo && (!time || time > filters.timeTo)) {
      return false;
    }

    if (filters.categories.length > 0 && !filters.categories.includes(category)) {
      return false;
    }

    if (filters.sources.length > 0 && !filters.sources.includes(source)) {
      return false;
    }

    return true;
  });
}

function templateToForm(template: TaskTemplate): TemplateForm {
  return {
    active: template.active,
    category: normalizeCategory(template.category),
    energy: String(template.energy),
    goals: template.goals.join("\n"),
    icon: template.icon,
    repeatRule: template.repeatRule,
    scheduledTime: template.scheduledTime ?? "",
    source: template.source ?? "parent",
    target: template.target,
    targetApp: template.targetApp ?? "",
    timeLimitMinutes: template.timeLimitMinutes ? String(template.timeLimitMinutes) : "",
    title: template.title,
    tone: template.tone,
    total: String(template.total)
  };
}

async function attachFiles(files: FileList | null, form: TaskForm, onChange: (form: TaskForm) => void) {
  if (!files?.length) {
    return;
  }

  const attachments = await Promise.all(
    Array.from(files).map(async (file) => ({
      id: `attachment-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]+/g, "-")}`,
      mimeType: file.type || undefined,
      name: file.name,
      size: file.size,
      uri: await readFileAsDataUrl(file)
    }))
  );

  onChange({ ...form, attachments: [...form.attachments, ...attachments] });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function attachmentLabel(mimeType?: string, size?: number) {
  const typeLabel = mimeType?.split("/").pop()?.toUpperCase() ?? "FILE";

  if (!size) {
    return typeLabel;
  }

  if (size < 1024 * 1024) {
    return `${typeLabel} · ${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${typeLabel} · ${(size / 1024 / 1024).toFixed(1)} MB`;
}

function toList(value: string) {
  return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function missionDateKey(mission: Mission) {
  return mission.occurrenceDate?.slice(0, 10) ?? todayKey();
}

function isMissionInView(mission: Mission, anchorDate: string, view: CalendarView) {
  const date = missionDateKey(mission);

  if (view === "day") {
    return date === anchorDate;
  }

  const days = view === "week" ? weekDays(anchorDate) : monthDays(anchorDate);
  return days.includes(date);
}

function calendarRange(anchorDate: string, view: CalendarView) {
  const days = view === "day" ? [anchorDate] : view === "week" ? weekDays(anchorDate) : monthDays(anchorDate);

  return {
    startDate: days[0],
    endDate: days[days.length - 1]
  };
}

function weekDays(anchorDate: string) {
  const date = toLocalDate(anchorDate);
  const first = new Date(date);
  first.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, index) => addDays(first, index));
}

function monthDays(anchorDate: string) {
  const date = toLocalDate(anchorDate);
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return toDateKey(next);
}

function toLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value?: string, t?: (key: string) => string) {
  return value ? value.slice(0, 10) : t ? t("today") : "Today";
}

function formatDateTitle(anchorDate: string, view: CalendarView) {
  if (view === "day") {
    return formatDate(anchorDate);
  }

  if (view === "week") {
    const days = weekDays(anchorDate);
    return `${shortDateLabel(days[0])} - ${shortDateLabel(days[6])}`;
  }

  const date = toLocalDate(anchorDate);
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function shortDateLabel(value: string) {
  return toLocalDate(value).toLocaleDateString(undefined, { day: "numeric", weekday: "short" });
}

function formatMissionTime(mission: Mission) {
  return `${formatDate(mission.occurrenceDate)} · ${mission.scheduledTime || "Any time"}`;
}

function formatRepeatRule(rule?: string, t?: (key: string) => string) {
  const repeat = parseRepeatRule(rule ?? "FREQ=DAILY");

  if (repeat.frequency === "none") {
    return t ? t("doesNotRepeat") : "Does not repeat";
  }

  if (repeat.frequency === "monthly") {
    return t ? t("monthly") : "Monthly";
  }

  if (repeat.frequency === "weekly") {
    return t ? t("weekly") : "Weekly";
  }

  if (repeat.frequency === "weeklyCustom") {
    const weekLabel = t ? t("weeklyCustom") : "WeeklyCustom";
    const days = repeat.byDay.length ? ` · ${repeat.byDay.map(dayLabel).join("/")}` : "";
    const interval = repeat.interval > 1 ? ` · every ${repeat.interval}` : "";
    return `${weekLabel}${interval}${days}`;
  }

  if (repeat.frequency === "workDaily") {
    return t ? t("workDaily") : "WorkDaily";
  }

  return t ? t("daily") : "Daily";
}

function parseRepeatRule(rule: string): RepeatDraft {
  const parts = Object.fromEntries(
    rule.split(";").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );
  const frequency = String(parts.FREQ ?? "DAILY").toLowerCase();
  const byDay = parts.BYDAY ? String(parts.BYDAY).split(",").filter(Boolean) : [];

  return {
    byDay,
    frequency:
      frequency === "weekly" && byDay.length
        ? "weeklyCustom"
        : frequency === "daily" && byDay.join(",") === "MO,TU,WE,TH,FR"
          ? "workDaily"
          : frequency === "weekly" || frequency === "monthly" || frequency === "none"
            ? frequency
            : "daily",
    interval: Math.max(1, Number(parts.INTERVAL ?? 1) || 1)
  };
}

function buildRepeatRule(draft: RepeatDraft) {
  if (draft.frequency === "none") {
    return "FREQ=NONE";
  }

  if (draft.frequency === "workDaily") {
    return workDailyRepeatRule;
  }

  const parts = [`FREQ=${draft.frequency === "weeklyCustom" ? "WEEKLY" : draft.frequency.toUpperCase()}`];

  if (draft.interval > 1) {
    parts.push(`INTERVAL=${draft.interval}`);
  }

  if (draft.frequency === "weeklyCustom" && draft.byDay.length) {
    parts.push(`BYDAY=${weekDayOptions.map((day) => day.code).filter((code) => draft.byDay.includes(code)).join(",")}`);
  }

  return parts.join(";");
}

function dayLabel(code: string) {
  return weekDayOptions.find((day) => day.code === code)?.label ?? code;
}

function languageAwareReview(t: (key: string) => string) {
  return `${t("photo")}, ${t("audio")}, ${t("confirm")}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const data = (await response.json()) as { error?: string; issues?: Array<{ field?: string; message?: string }> };
      const issue = data.issues?.[0];
      message = issue ? `${issue.field ? `${issue.field}: ` : ""}${issue.message ?? data.error ?? message}` : data.error ?? message;
    } catch {
      // Keep the generic HTTP error when the response is not JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

function readableRequestError(error: unknown, t: (key: string) => string) {
  if (error instanceof Error) {
    return error.message;
  }

  return t("serverUnreachable");
}
