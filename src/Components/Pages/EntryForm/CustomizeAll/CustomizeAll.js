"use client";

import React, { useState } from "react";
import {
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  FormControlLabel,
} from "@mui/material";
import { CallApi } from "@/apiList/CallApi";
import { toast } from "react-toastify";

// ── Default state matching the API payload ──────────────────────────────────
const defaultAll = {
  Width: 120,
  HeaderAlign: "left",
  ColumnAlign: "left",
  FontSize: 12,
  GrupChekBox: false,
  DefaultGrupChekBox: false,
  HideColumn: false,
  CurrencyMaster: "",
  // Filter flags
  NormalFilter: false,
  ColumnFilter: false,
  DateRangeFilter: false,
  MultiSelection: false,
  RangeFilter: false,
  SuggestionFilter: false,
  SelectDropdownFilter: false,
  ServerSideFilter: false,
  IsInFilterSection: false,
  IsOnScreenFilter: false,
};

const ALIGN_OPTS = ["left", "center", "right"];
const FONT_SIZE_OPTS = ["10", "12", "14", "16", "18", "20"];

const BOOL_FIELDS = [
  { key: "GrupChekBox",           label: "Group CheckBox" },
  { key: "DefaultGrupChekBox",    label: "Default Group CheckBox" },
  { key: "HideColumn",            label: "Hide Column" },
];

const FILTER_FIELDS = [
  { key: "NormalFilter",          label: "Normal Filter" },
  { key: "ColumnFilter",          label: "Column Filter" },
  { key: "DateRangeFilter",       label: "Date Range Filter" },
  { key: "MultiSelection",        label: "Multi Selection" },
  { key: "RangeFilter",           label: "Range Filter" },
  { key: "SuggestionFilter",      label: "Suggestion Filter" },
  { key: "SelectDropdownFilter",  label: "Select Dropdown Filter" },
  { key: "ServerSideFilter",      label: "Server Side Filter" },
];

const FILTER_PLACEMENT = [
  { key: "IsInFilterSection",  label: "In Filter Section" },
  { key: "IsOnScreenFilter",   label: "On Screen Filter" },
];

// ── Component ────────────────────────────────────────────────────────────────
const CustomizeAll = ({ spId, onClose, onSave }) => {
  const [form, setForm] = useState({ ...defaultAll });
  const [saving, setSaving] = useState(false);

  const clientIpAddress =
    typeof window !== "undefined"
      ? sessionStorage.getItem("clientIpAddress")
      : null;

  // ── helpers ──
  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheck = (e) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFilterPlacement = (key) => {
    setForm((prev) => ({
      ...prev,
      IsInFilterSection: key === "IsInFilterSection",
      IsOnScreenFilter: key === "IsOnScreenFilter",
    }));
  };

  // ── save ──
  const handleSave = async () => {
    if (!spId) return;
    setSaving(true);

    const AllData = JSON.parse(sessionStorage.getItem("reportVarible") || "{}");

    const payload = {
      ReportId: spId,
      Width: Number(form.Width) || 120,
      HeaderAlign: form.HeaderAlign,
      ColumnAlign: form.ColumnAlign,
      FontSize: Number(form.FontSize) || 12,
      GrupChekBox: form.GrupChekBox,
      DefaultGrupChekBox: form.DefaultGrupChekBox,
      HideColumn: form.HideColumn,
      CurrencyMaster: form.CurrencyMaster || "",
      NormalFilter: form.NormalFilter,
      ColumnFilter: form.ColumnFilter,
      DateRangeFilter: form.DateRangeFilter,
      MultiSelection: form.MultiSelection,
      RangeFilter: form.RangeFilter,
      SuggestionFilter: form.SuggestionFilter,
      SelectDropdownFilter: form.SelectDropdownFilter,
      ServerSideFilter: form.ServerSideFilter,
      IsInFilterSection: form.IsInFilterSection,
      IsOnScreenFilter: form.IsOnScreenFilter,
    };

    const body = {
      con: JSON.stringify({
        id: "",
        mode: "updateAllColumnsForReport",
        appuserid: AllData?.LUId || "",
        IPAddress: clientIpAddress || "",
        FormName: "DynamicReport ( data )",
      }),
      p: JSON.stringify(payload),
      f: "DynamicReport ( data )",
    };

    try {
      await CallApi(body);
      toast.success("All columns updated successfully!", { position: "top-center" });
      if (onSave) onSave(payload);
      if (onClose) onClose();
    } catch (err) {
      console.error("❌ CustomizeAll save failed", err);
      toast.error("Failed to update columns.", { position: "top-center" });
    } finally {
      setSaving(false);
    }
  };

  // ── render ──
  return (
    <div className="Customize_Colum_Full_main" style={{ position: "relative" }}>

      {/* ── Tab-style panel (no tabs, single scrollable panel) ── */}
      <div className="Customize_Colum_main">
        <div className="cc_tab_panel">

          {/* ── Dimensions & Typography ── */}
          <div className="cc_section_label">Dimensions &amp; Typography</div>
          <div className="cc_field_grid">
            <TextField
              name="Width"
              label="Column Width"
              type="number"
              value={form.Width}
              onChange={handleInput}
              size="small"
              className="customize_colum_input"
            />

            <FormControl size="small">
              <InputLabel>Header Align</InputLabel>
              <Select
                label="Header Align"
                name="HeaderAlign"
                value={form.HeaderAlign}
                onChange={handleInput}
              >
                {ALIGN_OPTS.map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Column Align</InputLabel>
              <Select
                label="Column Align"
                name="ColumnAlign"
                value={form.ColumnAlign}
                onChange={handleInput}
              >
                {ALIGN_OPTS.map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Font Size</InputLabel>
              <Select
                label="Font Size"
                name="FontSize"
                value={String(form.FontSize)}
                onChange={handleInput}
              >
                {FONT_SIZE_OPTS.map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              name="CurrencyMaster"
              label="Currency Master"
              value={form.CurrencyMaster}
              onChange={handleInput}
              size="small"
              className="customize_colum_input"
            />
          </div>

          {/* ── Column Options ── */}
          <div className="cc_section_label" style={{ marginTop: 16 }}>Column Options</div>
          <div className="cc_bool_grid">
            {BOOL_FIELDS.map(({ key, label }) => (
              <label key={key} className="cc_bool_item">
                <Checkbox
                  name={key}
                  checked={!!form[key]}
                  onChange={handleCheck}
                  size="small"
                  sx={{ p: "2px" }}
                />
                <span className="chekbox_title_value">{label}</span>
              </label>
            ))}
          </div>

          {/* ── Filter Placement ── */}
          <div className="cc_section_label" style={{ marginTop: 16 }}>Filter Placement</div>
          <div className="cc_radio_row">
            {FILTER_PLACEMENT.map(({ key, label }) => (
              <div
                key={key}
                className={`cc_radio_item${form[key] ? " cc_radio_active" : ""}`}
                onClick={() => handleFilterPlacement(key)}
              >
                <div className="cc_radio_dot" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* ── Filter Types ── */}
          <div className="cc_section_label" style={{ marginTop: 16 }}>Filter Types</div>
          <div className="cc_filter_list">
            {FILTER_FIELDS.map(({ key, label }) => (
              <label key={key} className="cc_filter_row">
                <Checkbox
                  name={key}
                  checked={!!form[key]}
                  onChange={handleCheck}
                  size="small"
                  sx={{ p: "2px" }}
                />
                <span className="chekbox_title_value">{label}</span>
              </label>
            ))}
          </div>

        </div>
      </div>

      {/* ── Action buttons (same style as CustomizeColum) ── */}
      <div className="button-group">
        <Button onClick={onClose} className="Btn_CustomizeMaster_Model_Cancel">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="Btn_Customize_Model_Save"
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default CustomizeAll;