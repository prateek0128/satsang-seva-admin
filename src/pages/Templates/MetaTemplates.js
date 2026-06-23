import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toast, confirmDialog } from "../../components/Popup";
import AdminTable from "../Shared/AdminTable";
import { useSortable } from "../Shared/sortable";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import SendIcon from "@mui/icons-material/SendRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import CloseIcon from "@mui/icons-material/CloseRounded";

const BRAND = "#f58021";
const cellSx = { fontSize: "0.82rem", color: "#334155", whiteSpace: "nowrap", py: 1.5, px: 2 };
const MEDIA_HEADER_FORMATS = ["IMAGE", "VIDEO", "DOCUMENT"];

const emptyForm = {
  name: "",
  language: "en_US",
  category: "UTILITY",
  headerFormat: "NONE",
  headerText: "",
  headerExampleText: "",
  headerSampleHandle: "",
  headerSampleFileName: "",
  headerSampleMimeType: "",
  bodyText: "",
  bodyExampleValues: "",
  footerText: "",
  buttons: [],
  createOnMeta: false,
};

const statusColor = (status) => {
  const value = String(status || "").toUpperCase();
  if (value === "APPROVED") return { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" };
  if (value === "REJECTED") return { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" };
  if (value === "PENDING" || value === "SUBMITTING") return { bg: "#fff7ed", color: "#D26600", border: "#fed7aa" };
  return { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" };
};

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const toForm = (template) => ({
  name: template?.name || "",
  language: template?.language || "en_US",
  category: template?.category || "UTILITY",
  headerFormat: template?.headerFormat || "NONE",
  headerText: template?.headerText || "",
  headerExampleText: template?.headerExampleText || "",
  headerSampleHandle: template?.headerSampleHandle || "",
  headerSampleFileName: template?.headerSampleFileName || "",
  headerSampleMimeType: template?.headerSampleMimeType || "",
  bodyText: template?.bodyText || "",
  bodyExampleValues: (template?.bodyExampleValues || []).join("\n"),
  footerText: template?.footerText || "",
  buttons: (template?.buttons || []).map((button) => ({
    type: button.type || "QUICK_REPLY",
    text: button.text || "",
    url: button.url || "",
    phone_number: button.phone_number || "",
  })),
  createOnMeta: false,
});

const buildPayload = (form) => ({
  name: form.name,
  language: form.language,
  category: form.category,
  headerFormat: form.headerFormat,
  headerText: form.headerFormat === "TEXT" ? form.headerText : "",
  headerExampleText: form.headerFormat === "TEXT" ? form.headerExampleText : "",
  headerSampleHandle: form.headerSampleHandle,
  headerSampleFileName: form.headerSampleFileName,
  headerSampleMimeType: form.headerSampleMimeType,
  bodyText: form.bodyText,
  bodyExampleValues: form.bodyExampleValues
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean),
  footerText: form.footerText,
  createOnMeta: form.createOnMeta,
  buttons: form.buttons
    .filter((button) => button.text?.trim())
    .slice(0, 10)
    .map((button) => ({
      type: button.type,
      text: button.text.trim(),
      url: button.type === "URL" ? button.url.trim() : "",
      phone_number: button.type === "PHONE_NUMBER" ? button.phone_number.trim() : "",
    })),
});

const MetaTemplates = () => {
  const url = process.env.REACT_APP_BACKEND;
  const [templates, setTemplates] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingMeta, setEditingMeta] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [mediaSampleFile, setMediaSampleFile] = useState(null);
  const [mediaDragActive, setMediaDragActive] = useState(false);
  const [sendTemplate, setSendTemplate] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sendAllUsers, setSendAllUsers] = useState(false);
  const [recipientFilters, setRecipientFilters] = useState({
    membership: "all",
    community: "all",
    status: "active",
  });
  const [sendParamValues, setSendParamValues] = useState([]);
  const [sendHeaderTextValue, setSendHeaderTextValue] = useState("");
  const [sendHeaderMedia, setSendHeaderMedia] = useState(null);
  const [sendButtonParamValues, setSendButtonParamValues] = useState({});
  const [metaModalOpen, setMetaModalOpen] = useState(false);
  const [metaSearch, setMetaSearch] = useState("");
  const [viewTemplate, setViewTemplate] = useState(null);
  const mediaInputRef = useRef(null);
  const sendMediaInputRef = useRef(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}admin/meta-templates`, {
        headers: headers(),
        params: { page: 1, limit: 500 },
      });
      setTemplates(res.data.data?.templates || []);
    } catch (e) {
      toast(e.response?.data?.message || "Error fetching templates", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipients = async (filters = recipientFilters) => {
    try {
      const res = await axios.get(`${url}admin/meta-templates/recipients`, {
        headers: headers(),
        params: filters,
      });
      setRecipients(res.data.data?.users || []);
    } catch {
      setRecipients([]);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchRecipients();
  }, []);

  useEffect(() => {
    if (!sendTemplate) return;
    fetchRecipients(recipientFilters);
    setSelectedUsers([]);
  }, [sendTemplate, recipientFilters]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter((template) =>
      [template.name, template.bodyText, template.status, template.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [templates, search]);

  const { sorted, orderBy, order, handleSort } = useSortable(filtered, "updatedAt", "desc");
  const paged = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const openCreate = () => {
    setEditing(null);
    setEditingMeta(false);
    setForm(emptyForm);
    setMediaSampleFile(null);
    setFormOpen(true);
  };

  const openEdit = (template, remote = false) => {
    setEditing(template);
    setEditingMeta(remote);
    setForm(toForm(template));
    setMediaSampleFile(null);
    setFormOpen(true);
  };

  const buildRequestData = (payload) => {
    if (!mediaSampleFile) return { data: payload, config: { headers: headers() } };
    const data = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (Array.isArray(value) || (value && typeof value === "object")) {
        data.append(key, JSON.stringify(value));
      } else {
        data.append(key, value ?? "");
      }
    });
    data.append("mediaSample", mediaSampleFile);
    return { data, config: { headers: headers() } };
  };

  const saveTemplate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = buildPayload(form);
      const request = buildRequestData(payload);
      if (editing) {
        const endpoint = editingMeta
          ? `${url}admin/meta-templates/${editing._id}/meta`
          : `${url}admin/meta-templates/${editing._id}`;
        await axios.put(endpoint, request.data, request.config);
        toast(editingMeta ? "Meta template updated" : "Template updated", "success");
      } else {
        await axios.post(`${url}admin/meta-templates`, request.data, request.config);
        toast(payload.createOnMeta ? "Template submitted to Meta" : "Template saved", "success");
      }
      setFormOpen(false);
      setEditingMeta(false);
      setMediaSampleFile(null);
      fetchTemplates();
    } catch (e) {
      toast(e.response?.data?.message || "Error saving template", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const syncTemplates = async () => {
    setSyncing(true);
    try {
      const res = await axios.post(`${url}admin/meta-templates/sync`, {}, { headers: headers() });
      toast(`Synced ${res.data.data?.total || 0} templates`, "success");
      fetchTemplates();
    } catch (e) {
      toast(e.response?.data?.message || "Meta sync failed", "error");
    } finally {
      setSyncing(false);
    }
  };

  const openMetaModal = async () => {
    setMetaModalOpen(true);
    setSyncing(true);
    try {
      const res = await axios.post(`${url}admin/meta-templates/sync`, {}, { headers: headers() });
      setTemplates(res.data.data?.templates || []);
    } catch (e) {
      toast(e.response?.data?.message || "Meta templates fetch failed", "error");
      fetchTemplates();
    } finally {
      setSyncing(false);
    }
  };

  const deleteTemplate = async (template) => {
    if (!(await confirmDialog(`Delete template ${template.name}?`))) return;
    try {
      await axios.delete(`${url}admin/meta-templates/${template._id}`, { headers: headers() });
      setTemplates((items) => items.filter((item) => item._id !== template._id));
      toast("Template deleted", "success");
    } catch (e) {
      toast(e.response?.data?.message || "Error deleting template", "error");
    }
  };

  const deleteMetaTemplate = async (template) => {
    if (!(await confirmDialog(`Delete Meta template ${template.name}?`))) return;
    try {
      await axios.delete(`${url}admin/meta-templates/${template._id}/meta`, { headers: headers() });
      setTemplates((items) => items.filter((item) => item._id !== template._id));
      toast("Meta template deleted", "success");
    } catch (e) {
      toast(e.response?.data?.message || "Error deleting Meta template", "error");
    }
  };

  const openSend = (template) => {
    const requirements = getSendRequirements(template);
    setSendTemplate(template);
    setSelectedUsers([]);
    setSendAllUsers(false);
    setRecipientFilters({ membership: "all", community: "all", status: "active" });
    setSendParamValues(Array.from({ length: requirements.bodyParamCount }, () => ""));
    setSendHeaderTextValue("");
    setSendHeaderMedia(null);
    setSendButtonParamValues({});
  };

  const submitSend = async () => {
    const payloadRecipients = (sendAllUsers ? [] : selectedUsers)
      .map((user) => ({ phone: user.phone, name: user.name }))
      .filter((user) => user.phone);
    if (!sendAllUsers && !payloadRecipients.length) {
      toast("Choose users or select all users", "warning");
      return;
    }

    let components = [];
    const requirements = getSendRequirements(sendTemplate);
    const bodyParamCount = requirements.bodyParamCount;

    if (requirements.headerTextParamCount > 0) {
      if (!sendHeaderTextValue.trim()) {
        toast("Fill the header parameter value", "warning");
        return;
      }
      components.push({
        type: "header",
        parameters: [{ type: "text", text: sendHeaderTextValue.trim() }],
      });
    }

    if (requirements.headerMediaFormat) {
      if (!sendHeaderMedia?.mediaId) {
        toast(`Select a ${requirements.headerMediaFormat.toLowerCase()} file for the header`, "warning");
        return;
      }
      const mediaType = requirements.headerMediaFormat.toLowerCase();
      components.push({
        type: "header",
        parameters: [{ type: mediaType, [mediaType]: { id: sendHeaderMedia.mediaId } }],
      });
    }

    if (bodyParamCount > 0) {
      const values = sendParamValues.slice(0, bodyParamCount).map((value) => value.trim());
      if (values.some((value) => !value)) {
        toast("Fill all template parameter values", "warning");
        return;
      }
      components.push({
        type: "body",
        parameters: values.map((value) => ({ type: "text", text: value })),
      });
    }

    for (const button of requirements.dynamicUrlButtons) {
      const value = sendButtonParamValues[button.index]?.trim();
      if (!value) {
        toast(`Fill URL button parameter for ${button.text || `button ${Number(button.index) + 1}`}`, "warning");
        return;
      }
      components.push({
        type: "button",
        sub_type: "url",
        index: String(button.index),
        parameters: [{ type: "text", text: value }],
      });
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${url}admin/meta-templates/${sendTemplate._id}/send`,
        { recipients: payloadRecipients, sendAllUsers, filters: recipientFilters, components },
        { headers: headers() }
      );
      const sent = res.data.data?.sent || 0;
      const failed = res.data.data?.failed || 0;
      toast(`Sent ${sent}, failed ${failed}`, failed ? "warning" : "success");
      setSendTemplate(null);
      fetchTemplates();
    } catch (e) {
      toast(e.response?.data?.message || "Error sending template", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const metaTemplates = useMemo(() => {
    const q = metaSearch.trim().toLowerCase();
    const synced = templates.filter((template) => template.metaTemplateId);
    if (!q) return synced;
    return synced.filter((template) =>
      [template.name, template.status, template.category, template.language, template.rejectedReason]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [templates, metaSearch]);

  const qualityLabel = (qualityScore) => {
    if (!qualityScore) return "UNKNOWN";
    if (typeof qualityScore === "string") return qualityScore;
    return qualityScore.score || qualityScore.date || "UNKNOWN";
  };

  const variableCount = (text) => {
    const matches = String(text || "").match(/\{\{\d+\}\}/g) || [];
    const numbers = matches.map((match) => Number(match.replace(/[{}]/g, "")));
    return numbers.length ? Math.max(...numbers) : 0;
  };

  const getSendRequirements = (template) => {
    const components = template?.components || [];
    const header = components.find((component) => String(component.type).toUpperCase() === "HEADER");
    const body = components.find((component) => String(component.type).toUpperCase() === "BODY");
    const buttonsComponent = components.find((component) => String(component.type).toUpperCase() === "BUTTONS");
    const headerFormat = String(header?.format || template?.headerFormat || "NONE").toUpperCase();
    const headerTextParamCount = headerFormat === "TEXT" ? variableCount(header?.text || template?.headerText) : 0;
    const headerMediaFormat = MEDIA_HEADER_FORMATS.includes(headerFormat) ? headerFormat : "";
    const dynamicUrlButtons = (buttonsComponent?.buttons || template?.buttons || [])
      .map((button, index) => ({ ...button, index }))
      .filter((button) => String(button.type).toUpperCase() === "URL" && variableCount(button.url) > 0);

    return {
      headerTextParamCount,
      headerMediaFormat,
      bodyParamCount: variableCount(body?.text || template?.bodyText),
      dynamicUrlButtons,
    };
  };

  const bodyVariableCount = variableCount(form.bodyText);
  const headerVariableCount = variableCount(form.headerText);
  const sendRequirements = getSendRequirements(sendTemplate);
  const sendBodyVariableCount = sendRequirements.bodyParamCount;
  const sendPreview = (sendTemplate?.bodyText || "").replace(/\{\{(\d+)\}\}/g, (_, n) => {
    const value = sendParamValues[Number(n) - 1];
    return value?.trim() || `{{Parameter ${n}}}`;
  });
  const isMediaHeader = MEDIA_HEADER_FORMATS.includes(form.headerFormat);
  const mediaAccept = form.headerFormat === "IMAGE"
    ? "image/*"
    : form.headerFormat === "VIDEO"
      ? "video/*"
      : ".pdf,.doc,.docx,.ppt,.pptx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  const handleMediaFile = (file) => {
    if (!file) return;
    setMediaSampleFile(file);
    setForm({
      ...form,
      headerSampleFileName: file.name,
      headerSampleMimeType: file.type,
      headerSampleHandle: "",
    });
  };

  const onMediaDrop = (event) => {
    event.preventDefault();
    setMediaDragActive(false);
    handleMediaFile(event.dataTransfer.files?.[0]);
  };

  const setFilter = (key, value) => {
    setRecipientFilters((prev) => ({ ...prev, [key]: value }));
  };

  const uploadSendMedia = async (file) => {
    if (!file) return;
    const data = new FormData();
    data.append("media", file);
    setSubmitting(true);
    try {
      const res = await axios.post(`${url}admin/meta-templates/media`, data, { headers: headers() });
      setSendHeaderMedia(res.data.data);
      toast("Media selected", "success");
    } catch (e) {
      toast(e.response?.data?.message || "Media upload failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const SegmentedFilter = ({ label, value, options, onChange }) => (
    <Box>
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", mb: 0.8 }}>
        {label}
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: 0.6, p: 0.5, border: "1px solid #e2e8f0", borderRadius: "9px", background: "#f8fafc" }}>
        {options.map((option) => {
          const active = value === option.value;
          return (
            <Button
              key={option.value}
              onClick={() => onChange(option.value)}
              sx={{
                minWidth: 0,
                px: 1,
                py: 0.85,
                color: active ? "#fff" : "#64748b",
                background: active ? "linear-gradient(135deg,#D26600,#f58021)" : "transparent",
                textTransform: "none",
                fontWeight: 900,
                fontSize: "0.72rem",
                borderRadius: "7px",
                "&:hover": { background: active ? "linear-gradient(135deg,#b35800,#D26600)" : "#fff7ed" },
              }}
            >
              {option.label}
            </Button>
          );
        })}
      </Box>
    </Box>
  );

  const addButton = () => {
    if (form.buttons.length >= 10) {
      toast("Meta allows up to 10 buttons", "warning");
      return;
    }
    setForm({
      ...form,
      buttons: [...form.buttons, { type: "QUICK_REPLY", text: "", url: "", phone_number: "" }],
    });
  };

  const updateButton = (index, patch) => {
    setForm({
      ...form,
      buttons: form.buttons.map((button, i) => (i === index ? { ...button, ...patch } : button)),
    });
  };

  const removeButton = (index) => {
    setForm({
      ...form,
      buttons: form.buttons.filter((_, i) => i !== index),
    });
  };

  return (
    <Box sx={{ p: { xs: "16px", sm: "24px 28px" }, minHeight: "100vh", background: "linear-gradient(145deg,#fff8f2 0%,#fff3e6 30%,#fef9f5 60%,#fff0e0 100%)" }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Admin / Meta Templates
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.05em", lineHeight: 1.2 }}>
              Meta Templates
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "#64748b", mt: 0.4, fontWeight: 500 }}>
              {loading ? "Loading..." : `${templates.length} templates ready to manage`}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<WhatsAppIcon />}
              onClick={openMetaModal}
              disabled={syncing}
              sx={{ background: "linear-gradient(135deg,#111827,#1e293b)", color: "#fff", fontWeight: 700, textTransform: "none", borderRadius: "8px", px: 2, boxShadow: "0 4px 12px rgba(15,23,42,0.25)", "&:hover": { background: "linear-gradient(135deg,#020617,#111827)" } }}
            >
              Meta Template
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={syncTemplates}
              disabled={syncing}
              sx={{ borderColor: "#fed7aa", color: "#D26600", fontWeight: 700, textTransform: "none", borderRadius: "8px", background: "#fff", "&:hover": { borderColor: BRAND, background: "#fff7ed" } }}
            >
              {syncing ? "Syncing..." : "Sync Meta"}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
              sx={{ background: "linear-gradient(135deg,#D26600,#f58021)", color: "#fff", fontWeight: 700, textTransform: "none", borderRadius: "8px", px: 2, boxShadow: "0 4px 12px rgba(245,128,33,0.3)", "&:hover": { background: "linear-gradient(135deg,#b35800,#D26600)" } }}
            >
              New Template
            </Button>
          </Box>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: "14px", border: "1px solid #e2e8f0" }}>
        <TextField
          fullWidth
          size="small"
          value={search}
          onChange={(event) => { setSearch(event.target.value); setPage(0); }}
          placeholder="Search templates by name, body, category or status"
        />
      </Paper>

      <AdminTable
        columns={[
          { label: "Name", field: "name" },
          { label: "Status", field: "status" },
          { label: "Category", field: "category" },
          { label: "Language", field: "language" },
          { label: "Body" },
          { label: "Updated", field: "updatedAt" },
          { label: "Actions" },
        ]}
        rows={paged}
        loading={loading}
        emptyText="No templates found"
        orderBy={orderBy}
        order={order}
        onSort={handleSort}
        count={sorted.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); }}
        maxHeight="calc(100vh - 300px)"
        renderRow={(template) => {
          const sc = statusColor(template.status);
          const approved = String(template.status || "").toUpperCase() === "APPROVED";
          return (
            <TableRow key={template._id} hover sx={{ "&:hover": { background: "#fafbff" } }}>
              <TableCell sx={cellSx}>
                <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.82rem" }}>{template.name}</Typography>
                {template.metaTemplateId && <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8" }}>{template.metaTemplateId}</Typography>}
              </TableCell>
              <TableCell sx={cellSx}>
                <Chip label={template.status || "LOCAL_DRAFT"} size="small" sx={{ fontSize: "0.68rem", fontWeight: 800, height: 22, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }} />
              </TableCell>
              <TableCell sx={cellSx}>{template.category}</TableCell>
              <TableCell sx={cellSx}>{template.language}</TableCell>
              <TableCell sx={{ ...cellSx, maxWidth: 360 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: "0.8rem", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    {template.bodyText}
                  </Typography>
                  <Tooltip title="View full message" arrow>
                    <IconButton size="small" onClick={() => setViewTemplate(template)} sx={{ p: 0.45, color: "#2563eb", background: "#eff6ff", borderRadius: "8px", "&:hover": { background: "#dbeafe" } }}>
                      <VisibilityIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={cellSx}>{template.updatedAt ? dayjs(template.updatedAt).format("DD MMM, hh:mm A") : "-"}</TableCell>
              <TableCell sx={cellSx}>
                <Box sx={{ display: "flex", gap: 0.6 }}>
                  <Tooltip title={approved ? "Send Template" : "Only approved templates can be sent"} arrow>
                    <span>
                      <IconButton size="small" disabled={!approved} onClick={() => openSend(template)} sx={{ background: "#f0fdf4", color: "#16a34a", borderRadius: "8px", "&:hover": { background: "#dcfce7" }, "&.Mui-disabled": { background: "#f8fafc", color: "#cbd5e1" } }}>
                        <SendIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Edit Local Template" arrow>
                    <IconButton size="small" onClick={() => openEdit(template)} sx={{ background: "#fff7ed", color: "#D26600", borderRadius: "8px", "&:hover": { background: "#ffedd5" } }}>
                      <EditIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Local Template" arrow>
                    <IconButton size="small" onClick={() => deleteTemplate(template)} sx={{ background: "#fef2f2", color: "#dc2626", borderRadius: "8px", "&:hover": { background: "#fee2e2" } }}>
                      <DeleteIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          );
        }}
      />

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 1 }}>
          <WhatsAppIcon sx={{ color: "#16a34a" }} />
          {editingMeta ? "Edit Meta Template" : editing ? "Edit Template" : "Create Meta Template"}
        </DialogTitle>
        <form onSubmit={saveTemplate}>
          <DialogContent dividers sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField label="Template Name" required size="small" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} helperText="Lowercase letters, numbers and underscores work best." />
            <TextField label="Language" required size="small" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
            <FormControl size="small">
              <InputLabel>Category</InputLabel>
              <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <MenuItem value="UTILITY">Utility</MenuItem>
                <MenuItem value="MARKETING">Marketing</MenuItem>
                <MenuItem value="AUTHENTICATION">Authentication</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Header</InputLabel>
              <Select label="Header" value={form.headerFormat} onChange={(e) => setForm({ ...form, headerFormat: e.target.value })}>
                <MenuItem value="NONE">None</MenuItem>
                <MenuItem value="TEXT">Text</MenuItem>
                <MenuItem value="IMAGE">Image Sample</MenuItem>
                <MenuItem value="VIDEO">Video Sample</MenuItem>
                <MenuItem value="DOCUMENT">Document Sample</MenuItem>
              </Select>
            </FormControl>
            {form.headerFormat === "TEXT" && (
              <>
                <TextField label="Header Text" size="small" value={form.headerText} onChange={(e) => setForm({ ...form, headerText: e.target.value })} sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }} />
                {headerVariableCount > 0 && (
                  <TextField
                    label="Header Example Value"
                    required={form.createOnMeta || editingMeta}
                    size="small"
                    value={form.headerExampleText}
                    onChange={(e) => setForm({ ...form, headerExampleText: e.target.value })}
                    sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}
                    helperText="Example value for the header variable, e.g. Ayush"
                  />
                )}
              </>
            )}
            {isMediaHeader && (
              <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.8 }}>
                  Media Sample
                </Typography>
                <Box
                  onDragOver={(e) => { e.preventDefault(); setMediaDragActive(true); }}
                  onDragLeave={() => setMediaDragActive(false)}
                  onDrop={onMediaDrop}
                  sx={{
                    border: `1.5px dashed ${mediaDragActive ? BRAND : "#cbd5e1"}`,
                    background: mediaDragActive ? "#fff7ed" : "#f8fafc",
                    borderRadius: "12px",
                    p: 2.2,
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: "0.88rem", color: "#0f172a", fontWeight: 800 }}>
                      {mediaSampleFile?.name || form.headerSampleFileName || `Drop a ${form.headerFormat.toLowerCase()} sample here`}
                    </Typography>
                    <Typography sx={{ fontSize: "0.74rem", color: "#64748b", mt: 0.4 }}>
                      {mediaSampleFile
                        ? `${Math.round(mediaSampleFile.size / 1024)} KB - ${mediaSampleFile.type || "selected file"}`
                        : form.headerSampleHandle
                          ? "Existing Meta media sample handle will be reused unless you upload a new file."
                          : "Required when submitting media-header templates to Meta."}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                      variant="outlined"
                      onClick={() => mediaInputRef.current?.click()}
                      sx={{ borderColor: "#fed7aa", color: "#D26600", textTransform: "none", fontWeight: 800, background: "#fff", "&:hover": { borderColor: BRAND, background: "#fff7ed" } }}
                    >
                      Choose Media Sample
                    </Button>
                    {(mediaSampleFile || form.headerSampleHandle) && (
                      <Button
                        color="inherit"
                        onClick={() => {
                          setMediaSampleFile(null);
                          setForm({ ...form, headerSampleHandle: "", headerSampleFileName: "", headerSampleMimeType: "" });
                        }}
                        sx={{ textTransform: "none", fontWeight: 800 }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                  <input
                    ref={mediaInputRef}
                    type="file"
                    accept={mediaAccept}
                    hidden
                    onChange={(e) => handleMediaFile(e.target.files?.[0])}
                  />
                </Box>
              </Box>
            )}
            <TextField required label="Body" minRows={5} multiline value={form.bodyText} onChange={(e) => setForm({ ...form, bodyText: e.target.value })} sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }} helperText="Use Meta variables like {{1}} when dynamic text is needed." />
            {bodyVariableCount > 0 && (
              <TextField
                label="Body Example Values"
                required={form.createOnMeta || editingMeta}
                minRows={Math.min(Math.max(bodyVariableCount, 2), 5)}
                multiline
                value={form.bodyExampleValues}
                onChange={(e) => setForm({ ...form, bodyExampleValues: e.target.value })}
                sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}
                helperText={`Add ${bodyVariableCount} example value${bodyVariableCount > 1 ? "s" : ""}, one per line, matching {{1}} to {{${bodyVariableCount}}}. Example: Ayush`}
              />
            )}
            <TextField label="Footer" size="small" value={form.footerText} onChange={(e) => setForm({ ...form, footerText: e.target.value })} sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }} />
            <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Buttons
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8", mt: 0.2 }}>
                    Add quick reply, URL, or phone number buttons like Meta templates.
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={addButton}
                  startIcon={<AddIcon />}
                  sx={{ color: "#D26600", background: "#fff7ed", border: "1px solid #fed7aa", textTransform: "none", fontWeight: 800, "&:hover": { background: "#ffedd5" } }}
                >
                  Add Button
                </Button>
              </Box>

              {form.buttons.length === 0 ? (
                <Box sx={{ p: 2, borderRadius: "10px", background: "#f8fafc", border: "1px dashed #cbd5e1", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600 }}>
                  No buttons added
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                  {form.buttons.map((button, index) => (
                    <Box key={index} sx={{ p: 1.5, borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: { xs: "1fr", md: "170px 1fr auto" }, gap: 1.2, alignItems: "start" }}>
                      <FormControl size="small">
                        <InputLabel>Button Type</InputLabel>
                        <Select
                          label="Button Type"
                          value={button.type}
                          onChange={(e) => updateButton(index, { type: e.target.value, url: "", phone_number: "" })}
                        >
                          <MenuItem value="QUICK_REPLY">Quick Reply</MenuItem>
                          <MenuItem value="URL">Visit Website</MenuItem>
                          <MenuItem value="PHONE_NUMBER">Call Phone</MenuItem>
                        </Select>
                      </FormControl>
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: button.type === "QUICK_REPLY" ? "1fr" : "1fr 1.3fr" }, gap: 1 }}>
                        <TextField
                          label="Button Text"
                          size="small"
                          required
                          value={button.text}
                          onChange={(e) => updateButton(index, { text: e.target.value })}
                          inputProps={{ maxLength: 25 }}
                          helperText={`${button.text.length}/25`}
                        />
                        {button.type === "URL" && (
                          <TextField
                            label="Website URL"
                            size="small"
                            required
                            value={button.url}
                            onChange={(e) => updateButton(index, { url: e.target.value })}
                            placeholder="https://example.com"
                          />
                        )}
                        {button.type === "PHONE_NUMBER" && (
                          <TextField
                            label="Phone Number"
                            size="small"
                            required
                            value={button.phone_number}
                            onChange={(e) => updateButton(index, { phone_number: e.target.value })}
                            placeholder="+919999999999"
                          />
                        )}
                      </Box>
                      <Tooltip title="Remove Button" arrow>
                        <IconButton onClick={() => removeButton(index)} sx={{ color: "#dc2626", background: "#fef2f2", "&:hover": { background: "#fee2e2" } }}>
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            {!editing && (
              <FormControlLabel
                sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}
                control={<Checkbox checked={form.createOnMeta} onChange={(e) => setForm({ ...form, createOnMeta: e.target.checked })} />}
                label="Submit this template to Meta now"
              />
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setFormOpen(false)} color="inherit" sx={{ textTransform: "none", fontWeight: 700 }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ background: BRAND, "&:hover": { background: "#D26600" }, textTransform: "none", fontWeight: 800 }}>
              {submitting ? "Saving..." : "Save Template"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={!!sendTemplate}
        onClose={() => setSendTemplate(null)}
        maxWidth="lg"
        fullWidth
        BackdropProps={{
          sx: { backdropFilter: "blur(7px)", background: "rgba(15,23,42,0.35)" },
        }}
        PaperProps={{
          sx: {
            borderRadius: "18px",
            background: "#ffffff",
            color: "#0f172a",
            border: "1px solid #e2e8f0",
            boxShadow: "0 28px 90px rgba(15,23,42,0.22)",
            overflow: "hidden",
            minHeight: "72vh",
          },
        }}
      >
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", gap: 2, background: "linear-gradient(135deg,#ffffff 0%,#f8fafc 55%,#fff7ed 100%)" }}>
          <Box>
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.24em", mb: 0.8 }}>
              Send Template
            </Typography>
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
              Send {sendTemplate?.name}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1.2, flexWrap: "wrap" }}>
              <Chip label={sendTemplate?.name || ""} size="small" sx={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", fontWeight: 800 }} />
              <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>{sendTemplate?.language}</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#D26600", fontWeight: 800 }}>Manual</Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setSendTemplate(null)} sx={{ color: "#64748b", alignSelf: "flex-start", background: "#fff", border: "1px solid #e2e8f0", "&:hover": { background: "#f1f5f9", color: "#0f172a" } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 0, background: "#f8fafc" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.45fr 1fr" }, gap: 2, p: 3, maxHeight: "calc(72vh - 88px)", overflow: "auto" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: "12px", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(15,23,42,0.04)" }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 900, color: "#64748b", mb: 1.4 }}>
                  Recipients
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, p: 0.5, border: "1px solid #e2e8f0", borderRadius: "9px", background: "#f8fafc", mb: 1.6 }}>
                  <Button
                    onClick={() => setSendAllUsers(false)}
                    sx={{ color: sendAllUsers ? "#64748b" : "#fff", background: sendAllUsers ? "transparent" : "linear-gradient(135deg,#D26600,#f58021)", textTransform: "none", fontWeight: 900, borderRadius: "7px", "&:hover": { background: sendAllUsers ? "#fff7ed" : "linear-gradient(135deg,#b35800,#D26600)" } }}
                  >
                    Search Users
                  </Button>
                  <Button
                    onClick={() => setSendAllUsers(true)}
                    sx={{ color: sendAllUsers ? "#fff" : "#64748b", background: sendAllUsers ? "linear-gradient(135deg,#D26600,#f58021)" : "transparent", textTransform: "none", fontWeight: 900, borderRadius: "7px", "&:hover": { background: sendAllUsers ? "linear-gradient(135deg,#b35800,#D26600)" : "#fff7ed" } }}
                  >
                    All Users
                  </Button>
                </Box>
                {sendAllUsers ? (
                  <Box sx={{ p: 2, borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <Typography sx={{ fontSize: "0.86rem", color: "#0f172a", fontWeight: 800 }}>
                      Send to all users with phone numbers
                    </Typography>
                    <Typography sx={{ fontSize: "0.76rem", color: "#64748b", mt: 0.4 }}>
                      {recipients.length} users will be included.
                    </Typography>
                  </Box>
                ) : (
                  <Autocomplete
                    multiple
                    options={recipients}
                    value={selectedUsers}
                    onChange={(_, value) => setSelectedUsers(value)}
                    getOptionLabel={(option) => `${option.name || option.phone} (${option.phone})`}
                    renderInput={(params) => <TextField {...params} placeholder="Search users by name or phone" size="small" />}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#0f172a",
                        background: "#f8fafc",
                        borderRadius: "9px",
                        "& fieldset": { borderColor: "#cbd5e1" },
                        "&:hover fieldset": { borderColor: "#94a3b8" },
                        "&.Mui-focused fieldset": { borderColor: BRAND },
                      },
                      "& input::placeholder": { color: "#64748b", opacity: 1 },
                      "& .MuiChip-root": { background: "#eff6ff", color: "#2563eb" },
                    }}
                  />
                )}
              </Box>

              <Box sx={{ p: 2, borderRadius: "12px", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(15,23,42,0.04)" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 1.5, flexWrap: "wrap" }}>
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 900, color: "#64748b" }}>
                    Recipient Filters
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600 }}>
                    Applied to selected, searched, and all-user sends
                  </Typography>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.6 }}>
                  <SegmentedFilter
                    label="Membership"
                    value={recipientFilters.membership}
                    onChange={(value) => setFilter("membership", value)}
                    options={[
                      { label: "All", value: "all" },
                      { label: "Participant", value: "participant" },
                      { label: "Host", value: "host" },
                    ]}
                  />
                  <SegmentedFilter
                    label="Community"
                    value={recipientFilters.community}
                    onChange={(value) => setFilter("community", value)}
                    options={[
                      { label: "All", value: "all" },
                      { label: "Artist", value: "artist" },
                      { label: "Orator", value: "orator" },
                      { label: "Performer", value: "performer" },
                    ]}
                  />
                  <SegmentedFilter
                    label="Account Status"
                    value={recipientFilters.status}
                    onChange={(value) => setFilter("status", value)}
                    options={[
                      { label: "Active", value: "active" },
                      { label: "Inactive", value: "inactive" },
                      { label: "All", value: "all" },
                    ]}
                  />
                </Box>
              </Box>

              <Box sx={{ p: 2, borderRadius: "12px", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(15,23,42,0.04)" }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 900, color: "#64748b", mb: 1.4 }}>
                  Template Parameters
                </Typography>
                {sendRequirements.headerTextParamCount === 0 && !sendRequirements.headerMediaFormat && sendBodyVariableCount === 0 && sendRequirements.dynamicUrlButtons.length === 0 ? (
                  <Box sx={{ p: 2, borderRadius: "10px", background: "#f8fafc", border: "1px dashed #cbd5e1", color: "#94a3b8", fontSize: "0.82rem", fontWeight: 700 }}>
                    This template has no send-time parameters.
                  </Box>
                ) : (
                  <>
                    {sendRequirements.headerTextParamCount > 0 && (
                      <Box sx={{ mb: 1.6 }}>
                        <Typography sx={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 800, mb: 0.8 }}>
                          Header Parameter
                        </Typography>
                        <TextField
                          label="Header Text Value"
                          size="small"
                          required
                          fullWidth
                          value={sendHeaderTextValue}
                          onChange={(e) => setSendHeaderTextValue(e.target.value)}
                          sx={{
                            "& .MuiInputLabel-root": { color: "#64748b" },
                            "& .MuiOutlinedInput-root": {
                              color: "#0f172a",
                              background: "#f8fafc",
                              borderRadius: "9px",
                              "& fieldset": { borderColor: "#cbd5e1" },
                              "&:hover fieldset": { borderColor: "#94a3b8" },
                              "&.Mui-focused fieldset": { borderColor: BRAND },
                            },
                          }}
                        />
                      </Box>
                    )}

                    {sendRequirements.headerMediaFormat && (
                      <Box sx={{ mb: 1.6 }}>
                        <Typography sx={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 800, mb: 0.8 }}>
                          {sendRequirements.headerMediaFormat} Header
                        </Typography>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: "10px",
                            background: "#f8fafc",
                            border: "1px dashed #cbd5e1",
                            display: "flex",
                            alignItems: { xs: "flex-start", sm: "center" },
                            justifyContent: "space-between",
                            gap: 1.5,
                            flexDirection: { xs: "column", sm: "row" },
                          }}
                        >
                          <Box>
                            <Typography sx={{ fontSize: "0.84rem", color: "#0f172a", fontWeight: 800 }}>
                              {sendHeaderMedia?.fileName || `Select ${sendRequirements.headerMediaFormat.toLowerCase()} file`}
                            </Typography>
                            <Typography sx={{ fontSize: "0.74rem", color: "#64748b", mt: 0.35 }}>
                              {sendHeaderMedia?.mediaId ? `Uploaded media id: ${sendHeaderMedia.mediaId}` : "Required for this template header."}
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            disabled={submitting}
                            onClick={() => sendMediaInputRef.current?.click()}
                            sx={{ borderColor: "#fed7aa", color: "#D26600", background: "#fff", textTransform: "none", fontWeight: 900, "&:hover": { borderColor: BRAND, background: "#fff7ed" } }}
                          >
                            {sendHeaderMedia?.mediaId ? "Change File" : "Select Document"}
                          </Button>
                          <input
                            ref={sendMediaInputRef}
                            type="file"
                            hidden
                            accept={sendRequirements.headerMediaFormat === "IMAGE" ? "image/*" : sendRequirements.headerMediaFormat === "VIDEO" ? "video/*" : ".pdf,.doc,.docx,.ppt,.pptx,.txt,application/pdf"}
                            onChange={(e) => uploadSendMedia(e.target.files?.[0])}
                          />
                        </Box>
                      </Box>
                    )}

                    {sendBodyVariableCount > 0 && (
                      <>
                        <Typography sx={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 800, mb: 0.8 }}>
                          Body Parameters
                        </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.4 }}>
                    {Array.from({ length: sendBodyVariableCount }).map((_, index) => (
                      <TextField
                        key={index}
                        label={`Parameter ${index + 1}`}
                        size="small"
                        required
                        value={sendParamValues[index] || ""}
                        onChange={(e) => {
                          const next = [...sendParamValues];
                          next[index] = e.target.value;
                          setSendParamValues(next);
                        }}
                        sx={{
                          "& .MuiInputLabel-root": { color: "#64748b" },
                          "& .MuiOutlinedInput-root": {
                            color: "#0f172a",
                            background: "#f8fafc",
                            borderRadius: "9px",
                            "& fieldset": { borderColor: "#cbd5e1" },
                            "&:hover fieldset": { borderColor: "#94a3b8" },
                            "&.Mui-focused fieldset": { borderColor: BRAND },
                          },
                        }}
                      />
                    ))}
                  </Box>
                      </>
                    )}

                    {sendRequirements.dynamicUrlButtons.length > 0 && (
                      <Box sx={{ mt: sendBodyVariableCount > 0 ? 1.8 : 0 }}>
                        <Typography sx={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 800, mb: 0.8 }}>
                          URL Button Parameters
                        </Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.4 }}>
                          {sendRequirements.dynamicUrlButtons.map((button) => (
                            <TextField
                              key={button.index}
                              label={`${button.text || "URL Button"} Value`}
                              size="small"
                              required
                              value={sendButtonParamValues[button.index] || ""}
                              onChange={(e) => setSendButtonParamValues({ ...sendButtonParamValues, [button.index]: e.target.value })}
                              helperText="Value replaces the URL variable in this button."
                              sx={{
                                "& .MuiInputLabel-root": { color: "#64748b" },
                                "& .MuiOutlinedInput-root": {
                                  color: "#0f172a",
                                  background: "#f8fafc",
                                  borderRadius: "9px",
                                  "& fieldset": { borderColor: "#cbd5e1" },
                                  "&:hover fieldset": { borderColor: "#94a3b8" },
                                  "&.Mui-focused fieldset": { borderColor: BRAND },
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Box>

            <Box sx={{ p: 2, borderRadius: "12px", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(15,23,42,0.04)", minHeight: 360 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 900, color: "#64748b" }}>
                  Full Message Preview
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigator.clipboard.writeText(sendPreview || "")}
                  sx={{ color: "#475569", border: "1px solid #cbd5e1", textTransform: "none", fontWeight: 800, background: "#fff", "&:hover": { background: "#f8fafc" } }}
                >
                  Copy
                </Button>
              </Box>
              <Box sx={{ p: 2, borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", maxHeight: 430, overflow: "auto" }}>
                <Typography sx={{ fontSize: "0.86rem", color: "#1e293b", whiteSpace: "pre-wrap", lineHeight: 1.9, fontWeight: 600 }}>
                  {sendPreview || "No message body"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", background: "#fff" }}>
          <Button onClick={() => setSendTemplate(null)} color="inherit" sx={{ color: "#475569", textTransform: "none", fontWeight: 800 }}>Cancel</Button>
          <Button variant="contained" disabled={submitting} onClick={submitSend} startIcon={<SendIcon />} sx={{ background: "linear-gradient(135deg,#D26600,#f58021)", "&:hover": { background: "linear-gradient(135deg,#b35800,#D26600)" }, textTransform: "none", fontWeight: 900, borderRadius: "8px", px: 2.4, boxShadow: "0 5px 16px rgba(245,128,33,0.28)" }}>
            {submitting ? "Sending..." : "Send Template"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={metaModalOpen}
        onClose={() => setMetaModalOpen(false)}
        maxWidth="lg"
        fullWidth
        BackdropProps={{
          sx: {
            backdropFilter: "blur(7px)",
            background: "rgba(15,23,42,0.38)",
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: "18px",
            background: "#ffffff",
            color: "#0f172a",
            border: "1px solid #e2e8f0",
            boxShadow: "0 28px 90px rgba(15,23,42,0.22)",
            overflow: "hidden",
            minHeight: "72vh",
          },
        }}
      >
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, background: "linear-gradient(135deg,#ffffff 0%,#f8fafc 55%,#fff7ed 100%)" }}>
          <Box>
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.24em", mb: 0.8 }}>
              Meta WhatsApp Manager
            </Typography>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
              Template Status
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#64748b", mt: 0.7, fontWeight: 500 }}>
              {syncing ? "Fetching templates from Meta..." : `${metaTemplates.length} templates fetched from Meta with approval status and category.`}
            </Typography>
          </Box>
          <IconButton onClick={() => setMetaModalOpen(false)} sx={{ color: "#64748b", background: "#fff", border: "1px solid #e2e8f0", "&:hover": { background: "#f1f5f9", color: "#0f172a" } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", background: "#fff" }}>
          <TextField
            value={metaSearch}
            onChange={(e) => setMetaSearch(e.target.value)}
            placeholder="Search Meta templates"
            size="small"
            sx={{
              width: { xs: "100%", sm: 450 },
              "& .MuiOutlinedInput-root": {
                color: "#0f172a",
                background: "#f8fafc",
                borderRadius: "8px",
                "& fieldset": { borderColor: "#cbd5e1" },
                "&:hover fieldset": { borderColor: "#94a3b8" },
                "&.Mui-focused fieldset": { borderColor: "#f58021" },
              },
              "& input::placeholder": { color: "#64748b", opacity: 1 },
            }}
          />
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            disabled={syncing}
            onClick={openMetaModal}
            sx={{ background: "linear-gradient(135deg,#D26600,#f58021)", fontWeight: 800, textTransform: "none", borderRadius: "8px", px: 2.2, boxShadow: "0 5px 16px rgba(245,128,33,0.28)", "&:hover": { background: "linear-gradient(135deg,#b35800,#D26600)" } }}
          >
            {syncing ? "Refreshing..." : "Refresh"}
          </Button>
        </Box>

        <Box sx={{ overflow: "auto", maxHeight: "calc(72vh - 170px)", background: "#f8fafc" }}>
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <Box component="thead" sx={{ position: "sticky", top: 0, zIndex: 1, background: "#f1f5f9" }}>
              <Box component="tr">
                {["Template", "Status", "Category", "Language", "Quality", "Reason", "Actions"].map((label) => (
                  <Box component="th" key={label} sx={{ px: 1.8, py: 1.35, textAlign: "left", color: "#64748b", fontSize: "0.68rem", fontWeight: 900, textTransform: "uppercase", borderBottom: "1px solid #dbe4ef" }}>
                    {label}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {metaTemplates.length === 0 ? (
                <Box component="tr">
                  <Box component="td" colSpan={7} sx={{ py: 7, textAlign: "center", color: "#94a3b8", fontWeight: 700 }}>
                    {syncing ? "Fetching Meta templates..." : "No Meta templates found"}
                  </Box>
                </Box>
              ) : metaTemplates.map((template) => {
                const sc = statusColor(template.status);
                return (
                  <Box component="tr" key={template._id} sx={{ background: "#fff", "&:hover": { background: "#fff7ed" } }}>
                    <Box component="td" sx={{ px: 1.8, py: 1.55, borderBottom: "1px solid #e2e8f0" }}>
                      <Typography sx={{ fontSize: "0.84rem", color: "#0f172a", fontWeight: 900 }}>{template.name}</Typography>
                      <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8", mt: 0.3 }}>{template.metaTemplateId}</Typography>
                    </Box>
                    <Box component="td" sx={{ px: 1.8, py: 1.55, borderBottom: "1px solid #e2e8f0" }}>
                      <Chip label={template.status || "UNKNOWN"} size="small" sx={{ height: 28, borderRadius: 999, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontSize: "0.68rem", fontWeight: 900 }} />
                    </Box>
                    <Box component="td" sx={{ px: 1.8, py: 1.55, borderBottom: "1px solid #e2e8f0", color: "#334155", fontSize: "0.78rem", fontWeight: 800 }}>{template.category || "-"}</Box>
                    <Box component="td" sx={{ px: 1.8, py: 1.55, borderBottom: "1px solid #e2e8f0", color: "#334155", fontSize: "0.78rem" }}>{template.language || "-"}</Box>
                    <Box component="td" sx={{ px: 1.8, py: 1.55, borderBottom: "1px solid #e2e8f0", color: "#334155", fontSize: "0.78rem", fontWeight: 800 }}>{qualityLabel(template.qualityScore)}</Box>
                    <Box component="td" sx={{ px: 1.8, py: 1.55, borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem" }}>{template.rejectedReason || "NONE"}</Box>
                    <Box component="td" sx={{ px: 1.8, py: 1.55, borderBottom: "1px solid #e2e8f0" }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="View" arrow>
                          <IconButton size="small" onClick={() => setViewTemplate(template)} sx={{ color: "#64748b", background: "#f8fafc", "&:hover": { background: "#e2e8f0", color: "#0f172a" } }}>
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Meta Template" arrow>
                          <IconButton size="small" onClick={() => openEdit(template, true)} sx={{ color: "#2563eb", background: "#eff6ff", "&:hover": { background: "#dbeafe", color: "#1d4ed8" } }}>
                            <EditIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Meta Template" arrow>
                          <IconButton size="small" onClick={() => deleteMetaTemplate(template)} sx={{ color: "#dc2626", background: "#fef2f2", "&:hover": { background: "#fee2e2", color: "#b91c1c" } }}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Dialog>

      <Dialog
        open={!!viewTemplate}
        onClose={() => setViewTemplate(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "14px",
            background: "#fff",
            border: "1px solid #dbe4ef",
            boxShadow: "0 24px 80px rgba(15,23,42,0.18)",
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.24em", mb: 0.8 }}>
              Template Content
            </Typography>
            <Typography sx={{ fontSize: "1.05rem", fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}>
              {viewTemplate?.name}
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "#64748b", mt: 0.7, fontWeight: 800, textTransform: "uppercase" }}>
              {viewTemplate?.category || "-"} / {viewTemplate?.status || "-"} - {viewTemplate?.language || "-"}
            </Typography>
          </Box>
          <IconButton onClick={() => setViewTemplate(null)} sx={{ color: "#64748b", alignSelf: "flex-start", "&:hover": { background: "#f1f5f9", color: "#0f172a" } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 2.5, maxHeight: "70vh", overflowY: "auto", background: "#f8fafc" }}>
          <Box sx={{ p: 2, borderRadius: "10px", background: "#ffffff", border: "1px solid #dbe4ef", mb: 2 }}>
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 900, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.08em", mb: 2 }}>
              Body
            </Typography>
            <Typography sx={{ fontSize: "0.86rem", color: "#1e293b", lineHeight: 1.9, whiteSpace: "pre-wrap", fontWeight: 600 }}>
              {viewTemplate?.bodyText || "-"}
            </Typography>
          </Box>

          {viewTemplate?.footerText && (
            <Box sx={{ p: 2, borderRadius: "10px", background: "#ffffff", border: "1px solid #dbe4ef", mb: 2 }}>
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 900, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.08em", mb: 1 }}>
                Footer
              </Typography>
              <Typography sx={{ fontSize: "0.84rem", color: "#334155", lineHeight: 1.7 }}>
                {viewTemplate.footerText}
              </Typography>
            </Box>
          )}

          <Box sx={{ p: 2, borderRadius: "10px", background: "#ffffff", border: "1px solid #dbe4ef" }}>
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 900, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5 }}>
              Components
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 1.8,
                borderRadius: "8px",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                color: "#334155",
                overflow: "auto",
                fontSize: "0.75rem",
                lineHeight: 1.7,
                maxHeight: 260,
              }}
            >
              {JSON.stringify(viewTemplate?.components || [], null, 2)}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MetaTemplates;
