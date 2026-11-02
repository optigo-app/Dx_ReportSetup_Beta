"use client";

import React, { useState, useEffect } from "react";
import { TextField, IconButton, Tooltip } from "@mui/material";
import { Plus, Trash2, ChevronDown, X } from "lucide-react";
import { CallApi } from "@/apiList/CallApi";
import "./FormulaBaseSummary.scss";

// ─── constants ───────────────────────────────────────────────────────────────

const OPERATORS = ["+", "-", "*", "/", "(", ")", "100"];

// ─── helpers ─────────────────────────────────────────────────────────────────

const tokensToFormulaString = (tokens) =>
  tokens.join(" ").replace(/\s+/g, " ").trim();

/**
 * Convert internal formula array → SummaryFormulaArray payload shape
 * { id, formula, summurylabe, summuryunit, summurydecimal, order }
 */
export const formulasToPayload = (formulas) =>
  formulas.map((f) => ({
    id: f.isNew ? "" : String(f.id),
    formula: tokensToFormulaString(f.formula),
    summurylabe: f.title,
    summuryunit: f.unit,
    summurydecimal: f.decimal,
    order: f.order,
  }));

/**
 * Parse saved SummaryFormulaArray back into internal shape
 */
export const payloadToFormulas = (raw) => {
  try {
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => ({
      id: item.id || Date.now() + Math.random(),
      isNew: !item.id,
      title: item.summurylabe || "",
      formula: item.formula ? item.formula.split(" ").filter(Boolean) : [],
      unit: item.summuryunit || "",
      decimal: item.summurydecimal || "",
      order: item.order || "",
      saved: true,
    }));
  } catch {
    return [];
  }
};

const createNewFormula = () => ({
  id: Date.now(),
  isNew: true,
  title: "",
  formula: [],
  unit: "",
  decimal: "",
  order: "",
  saved: false,
});

// ─── FormulaRow sub-component ─────────────────────────────────────────────────

const FormulaRow = ({ formula, columns, onChange, onDelete }) => {
  const [colOpen, setColOpen] = useState(false);
  const [manualValue, setManualValue] = useState("");

  const addToken = (token) => {
    onChange({ ...formula, formula: [...formula.formula, token], saved: false });
    setColOpen(false);
  };

  const removeLastToken = () => {
    if (!formula.formula.length) return;
    onChange({ ...formula, formula: formula.formula.slice(0, -1), saved: false });
  };

  const clearTokens = () => onChange({ ...formula, formula: [], saved: false });

  return (
    <div className="fbs_row">
      {/* ── top fields ── */}
      <div className="fbs_row_top">
        <TextField
          size="small"
          label="Summary Label"
          value={formula.title}
          onChange={(e) => onChange({ ...formula, title: e.target.value, saved: false })}
          sx={{ flex: 1, minWidth: 120 }}
        />
        <TextField
          size="small"
          label="Unit"
          value={formula.unit}
          onChange={(e) => onChange({ ...formula, unit: e.target.value, saved: false })}
          sx={{ width: 70 }}
        />
        <TextField
          size="small"
          label="Order"
          type="number"
          value={formula.order}
          onChange={(e) => onChange({ ...formula, order: e.target.value, saved: false })}
          sx={{ width: 70 }}
        />
        <TextField
          size="small"
          label="Decimal"
          type="number"
          value={formula.decimal}
          onChange={(e) => onChange({ ...formula, decimal: e.target.value, saved: false })}
          sx={{ width: 75 }}
        />
        <Tooltip title="Delete formula">
          <IconButton size="small" onClick={onDelete} sx={{ color: "#e53935" }}>
            <Trash2 size={15} />
          </IconButton>
        </Tooltip>
      </div>

      {/* ── formula builder ── */}
      <div className="fbs_builder">
        {/* token display */}
        <div className="fbs_token_display">
          {formula.formula.length === 0 ? (
            <span className="fbs_placeholder">Pick columns &amp; operators below…</span>
          ) : (
            formula.formula.map((tok, i) => (
              <span
                key={i}
                className={`fbs_token ${OPERATORS.includes(tok) ? "fbs_token_op" : "fbs_token_col"}`}
              >
                {tok}
              </span>
            ))
          )}
        </div>

        {/* controls row */}
        <div className="fbs_controls">
          {/* column picker */}
          <div className="fbs_col_picker_wrap">
            <button className="fbs_pick_btn" onClick={() => setColOpen((p) => !p)}>
              Column <ChevronDown size={12} />
            </button>
            {colOpen && (
              <div className="fbs_col_dropdown">
                {columns
                  .filter((col) => col.ColumnType === "Number")
                  .map((col) => (
                    <div
                      key={col.ColId}
                      className="fbs_col_option"
                      onClick={() => addToken(col.FieldName)}
                    >
                      {col.HeaderName || col.FieldName}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* operator buttons */}
          {OPERATORS.map((op) => (
            <button key={op} className="fbs_op_btn" onClick={() => addToken(op)}>
              {op}
            </button>
          ))}

          {/* manual value input */}
          <input
            className="fbs_manual_input"
            type="text"
            placeholder="value…"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && manualValue.trim()) {
                addToken(manualValue.trim());
                setManualValue("");
              }
            }}
          />
          <button
            className="fbs_op_btn fbs_manual_add_btn"
            onClick={() => {
              if (manualValue.trim()) {
                addToken(manualValue.trim());
                setManualValue("");
              }
            }}
          >+</button>

          {/* undo / clear */}
          <button className="fbs_util_btn" onClick={removeLastToken}>⌫</button>
          <button className="fbs_util_btn fbs_clear_btn" onClick={clearTokens}>Clear</button>
        </div>

        {/* preview */}
        {formula.formula.length > 0 && (
          <div className="fbs_preview">
            <span className="fbs_preview_label">Preview: </span>
            <code>{tokensToFormulaString(formula.formula)}</code>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── main FormulaBaseSummary component ───────────────────────────────────────

/**
 * Props:
 *  - allColumData      : column list from parent
 *  - initialFormulas   : parsed array from masterData?.SummaryFormulaArray (pre-filled)
 *  - spId              : ReportId — required for API call
 *  - onSave(formulas)  : optional callback after successful save
 *  - onClose()         : closes the drawer
 */
const FormulaBaseSummary = ({ allColumData = [], initialFormulas = [], spId, onSave, onClose, isFormulaBasedSummary }) => {
  const [formulas, setFormulas] = useState([]);
  const [saving, setSaving] = useState(false);

  const clientIpAddress =
    typeof window !== "undefined" ? sessionStorage.getItem("clientIpAddress") : null;

  // pre-fill from saved data — re-runs when initialFormulas changes (async load or after save)
  useEffect(() => {
    setFormulas(initialFormulas?.length ? initialFormulas : []);
  }, [initialFormulas]);

  const handleAdd = () => setFormulas((p) => [...p, createNewFormula()]);

  const handleChange = (updated) =>
    setFormulas((p) => p.map((f) => (f.id === updated.id ? updated : f)));

  const handleDelete = (id) =>
    setFormulas((p) => p.filter((f) => f.id !== id));

  const handleSave = async () => {
    setSaving(true);
    try {
      const AllData = JSON.parse(sessionStorage.getItem("reportVarible") || "{}");
      const payload = {
        con: JSON.stringify({
          mode: "updateReportMasterSettings",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify({
          ReportId: spId,
          SummaryFormulaArray: formulasToPayload(formulas),
          IsFormulaBasedSummary: isFormulaBasedSummary ? 1 : 0,
        }),
        f: "DynamicReport (updateReportMasterSettings - FormulaBaseSummary)",
      };
      await CallApi(payload);
      if (onSave) onSave(formulas);
      if (onClose) onClose();
    } catch (err) {
      console.error("Failed to save formula summaries", err);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormulas(initialFormulas?.length ? initialFormulas : []);
    if (onClose) onClose();
  };

  return (
    <div className="fbs_drawer_wrap">
      {/* header */}
      <div className="fbs_drawer_header">
        <span className="fbs_drawer_title">Formula Based Summary</span>
        <IconButton size="small" onClick={handleCancel}>
          <X size={16} />
        </IconButton>
      </div>

      {/* body */}
      <div className="fbs_drawer_body">
        {formulas.length === 0 && (
          <p className="fbs_empty">No formulas yet. Click "+ Add Formula" to create one.</p>
        )}

        {formulas.map((formula) => (
          <FormulaRow
            key={formula.id}
            formula={formula}
            columns={allColumData}
            onChange={handleChange}
            onDelete={() => handleDelete(formula.id)}
          />
        ))}

        <button className="fbs_add_btn" onClick={handleAdd}>
          <Plus size={13} /> Add Formula
        </button>
      </div>

      {/* footer */}
      <div className="fbs_drawer_footer">
        <button className="fbs_btn_cancel" onClick={handleCancel} disabled={saving}>Cancel</button>
        <button className="fbs_btn_save" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default FormulaBaseSummary;