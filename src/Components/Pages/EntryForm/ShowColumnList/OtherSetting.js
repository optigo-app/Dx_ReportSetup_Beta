"use client";

import React, { memo, useCallback, useEffect, useState } from "react";
import { CallApi } from "@/apiList/CallApi";
import {
  Alert,
  Button,
  Checkbox,
  Snackbar,
  TextField,
  Typography,
  Modal,
  Box,
  IconButton,
} from "@mui/material";
import { ChevronDown, X } from "lucide-react";

// ─── formula builder constants/helpers (same as FormulaBaseSummary) ──────────
const OPERATORS = ["+", "-", "*", "/", "(", ")", "100"];
const tokensToFormulaString = (tokens) => tokens.join(" ").replace(/\s+/g, " ").trim();

const formulaModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 560,
  bgcolor: "background.paper",
  borderRadius: 1,
  boxShadow: 24,
  padding: "16px 20px 20px",
};

// ─── Formula Builder Modal ─────────────────────────────────────────────────
const FormulaBuilderModal = ({ open, onClose, onSave, columns, initialFormula }) => {
  const [tokens, setTokens] = useState([]);
  const [colOpen, setColOpen] = useState(false);
  const [manualValue, setManualValue] = useState("");

  useEffect(() => {
    if (open) {
      setTokens(initialFormula ? initialFormula.split(" ").filter(Boolean) : []);
      setColOpen(false);
      setManualValue("");
    }
  }, [open, initialFormula]);

  const addToken = (tok) => {
    setTokens((p) => [...p, tok]);
    setColOpen(false);
  };
  const removeLastToken = () => setTokens((p) => p.slice(0, -1));
  const clearTokens = () => setTokens([]);

  const handleSave = () => {
    onSave(tokensToFormulaString(tokens));
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={formulaModalStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Typography variant="subtitle1">Set Formula</Typography>
          <IconButton size="small" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>

        {/* token display */}
        <div className="fbs_token_display" style={{ minHeight: 38, border: "1px solid #ddd", borderRadius: 4, padding: 6, marginBottom: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {tokens.length === 0 ? (
            <span style={{ color: "#999", fontSize: 13 }}>Pick columns &amp; operators below…</span>
          ) : (
            tokens.map((tok, i) => (
              <span
                key={i}
                style={{
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 12,
                  background: OPERATORS.includes(tok) ? "#eef" : "#e8f5e9",
                }}
              >
                {tok}
              </span>
            ))
          )}
        </div>

        {/* controls */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginBottom: 10, position: "relative" }}>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setColOpen((p) => !p)}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}
            >
              Column <ChevronDown size={12} />
            </button>
            {colOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 10,
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  maxHeight: 180,
                  overflowY: "auto",
                  minWidth: 160,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                {(columns || [])
                  .filter((col) => col.ColumnType === "Number")
                  .map((col) => (
                    <div
                      key={col.ColId}
                      onClick={() => addToken(col.FieldName)}
                      style={{ padding: "6px 10px", fontSize: 13, cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {col.HeaderName || col.FieldName}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {OPERATORS.map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => addToken(op)}
              style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}
            >
              {op}
            </button>
          ))}

          <input
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
            style={{ width: 80, padding: "4px 6px", borderRadius: 4, border: "1px solid #ccc" }}
          />
          <button
            type="button"
            onClick={() => {
              if (manualValue.trim()) {
                addToken(manualValue.trim());
                setManualValue("");
              }
            }}
            style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}
          >
            +
          </button>

          <button type="button" onClick={removeLastToken} style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>⌫</button>
          <button type="button" onClick={clearTokens} style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer", color: "#e53935" }}>Clear</button>
        </div>

        {tokens.length > 0 && (
          <div style={{ marginBottom: 12, fontSize: 13 }}>
            <span style={{ color: "#777" }}>Preview: </span>
            <code>{tokensToFormulaString(tokens)}</code>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button variant="contained" style={{ backgroundColor: "rgb(86, 74, 252)" }} onClick={handleSave}>
            Save
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

// ─── SlideValueSelector ──────────────────────────────────────────────────────
const SlideValueSelector = memo(
  ({
    title,
    blockNumber,
    sideNumber,
    selectedField,
    onSelect,
    columns,
    values,
    setValues,
    errors,
    setErrors,
    onOpenFormulaBuilder,
  }) => {
    const errorKey = `${sideNumber === 1 ? "F" : "S"}-${blockNumber}`;
    const errMsg = errors?.[errorKey] || "";
    const handleCheckboxChange = useCallback(
      (fieldName) => {
        setValues((prev) => ({
          ...prev,
          [blockNumber]: {
            ...prev[blockNumber],
            SelectedField:
              prev[blockNumber]?.SelectedField === fieldName ? "" : fieldName,
          },
        }));
        onSelect(selectedField === fieldName ? "" : fieldName);
      },
      [blockNumber, selectedField, onSelect, setValues]
    );

    const handleInputChange = useCallback(
      (key, value) => {
        setValues((prev) => ({
          ...prev,
          [blockNumber]: { ...prev[blockNumber], [key]: value },
        }));
        if (key === "Title" && value.trim()) {
          const errorKey = `${sideNumber === 1 ? "F" : "S"}-${blockNumber}`;
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[errorKey];
            return newErrors;
          });
        }
      },
      [blockNumber, sideNumber, setValues, setErrors]
    );

    return (
      <div style={{ width: "24%" }}>
        <p className="sliper_top_title">{title}</p>
        <div className="sliter_option_main_div">
          <div className="spliter_optios_main_div">
            {columns?.map((col) => (
              <div
                key={col.ColId}
                className="column_row sub_row"
                style={{ display: "flex", alignItems: "center" }}
              >
                <Checkbox
                  checked={selectedField === col.FieldName}
                  onChange={() => handleCheckboxChange(col.FieldName)}
                  className="spliter_chekbox_optins"
                />
                <Typography className="column_label">
                  {col.HeaderName}
                </Typography>
              </div>
            ))}
          </div>

          <div className="spliter_add_deatil_main">
            <div className="slpiter_add_deatil_sub_div">
              <TextField
                type="text"
                label="Enter title"
                size="small"
                fullWidth
                value={values[blockNumber]?.Title || ""}
                onChange={(e) => handleInputChange("Title", e.target.value)}
                error={!!errMsg}
                helperText={errMsg}
              />

              <div style={{ display: "flex", gap: 6, width: "100%", alignItems: "center" }}>
                <TextField
                  type="text"
                  label="Formula"
                  size="small"
                  fullWidth
                  disabled
                  value={values[blockNumber]?.Formula || ""}
                  InputProps={{ readOnly: true }}
                  onClick={() =>
                    onOpenFormulaBuilder(
                      sideNumber,
                      blockNumber,
                      values[blockNumber]?.Formula || ""
                    )
                  }
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    onOpenFormulaBuilder(
                      sideNumber,
                      blockNumber,
                      values[blockNumber]?.Formula || ""
                    )
                  }
                  style={{ whiteSpace: "nowrap", color: "rgb(86, 74, 252)", borderColor: "rgb(86, 74, 252)", minWidth: '20px', height: '38px' }}
                >
                  ADD
                </Button>
              </div>
            </div>

            <div className="slpiter_add_deatil_sub_div">
              <TextField
                type="text"
                label="Enter Unit"
                size="small"
                fullWidth
                value={values[blockNumber]?.Unit || ""}
                onChange={(e) => handleInputChange("Unit", e.target.value)}
              />
              <TextField
                type="number"
                label="Enter Decimal"
                size="small"
                fullWidth
                value={values[blockNumber]?.DecimalValue || ""}
                onChange={(e) =>
                  handleInputChange("DecimalValue", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const SLIDE_KEY_MAP = {
  1: "firstSlideFirstData",
  2: "firstSlideSecondData",
  3: "firstSlideThirdData",
  4: "firstSlideFourthData",
};

const buildSlideObject = (selected, values) => {
  const result = {
    firstSlideFirstData: [],
    firstSlideSecondData: [],
    firstSlideThirdData: [],
    firstSlideFourthData: [],
  };
  Object.entries(values).forEach(([block, val]) => {
    const field = selected[block];
    const isActive = !!field || !!val?.Formula?.trim();
    if (isActive) {
      result[SLIDE_KEY_MAP[Number(block)]] = [{
        selectedField: field || "",
        title: val?.Title || "",
        unit: val?.Unit || "",
        formula: val?.Formula || "",
        decimal: val?.DecimalValue || "",
      }];
    }
  });
  return result;
};

const OtherSetting = ({
  setLoading,
  spData,
  otherSpliterSideData1,
  otherSpliterSideData2,
  spliterReportColum,
  setOpen,
  setOtherSpliterSideData1,
  setOtherSpliterSideData2,
}) => {
  const clientIpAddress = typeof window !== "undefined" ? sessionStorage.getItem("clientIpAddress") : null;

  const [errors, setErrors] = useState({});
  const [firstSlideValues, setFirstSlideValues] = useState({ 1: {}, 2: {}, 3: {}, 4: {} });
  const [secondSlideValues, setSecondSlideValues] = useState({ 1: {}, 2: {}, 3: {}, 4: {} });

  const [firstSlideSelected, setFirstSlideSelected] = useState({ 1: "", 2: "", 3: "", 4: "" });
  const [secondSlideSelected, setSecondSlideSelected] = useState({ 1: "", 2: "", 3: "", 4: "" });
  const [otherSettingSnackbarOpen, setOtherSettingSnackbarOpen] = useState(false);

  // ── formula builder modal state ──
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);
  const [formulaModalTarget, setFormulaModalTarget] = useState(null); // { sideNumber, blockNumber }
  const [formulaModalInitial, setFormulaModalInitial] = useState("");

  const openFormulaBuilder = (sideNumber, blockNumber, currentFormula) => {
    setFormulaModalTarget({ sideNumber, blockNumber });
    setFormulaModalInitial(currentFormula || "");
    setFormulaModalOpen(true);
  };

  const closeFormulaBuilder = () => {
    setFormulaModalOpen(false);
    setFormulaModalTarget(null);
  };

  const saveFormulaToTarget = (formulaStr) => {
    if (!formulaModalTarget) return;
    const { sideNumber, blockNumber } = formulaModalTarget;
    const setValues = sideNumber === 1 ? setFirstSlideValues : setSecondSlideValues;
    setValues((prev) => ({
      ...prev,
      [blockNumber]: { ...prev[blockNumber], Formula: formulaStr },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    let newErrors = {};

    Object.entries(firstSlideValues).forEach(([block, val]) => {
      const isActive = !!firstSlideSelected[block] || !!val.Formula?.trim();
      if (isActive && !val.Title?.trim()) {
        newErrors[`F-${block}`] = "Title is required";
      }
    });
    Object.entries(secondSlideValues).forEach(([block, val]) => {
      const isActive = !!secondSlideSelected[block] || !!val.Formula?.trim();
      if (isActive && !val.Title?.trim()) {
        newErrors[`S-${block}`] = "Title is required";
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setLoading(false);
      return;
    }

    const spliterData = [];

    Object.entries(firstSlideValues).forEach(([block, val]) => {
      const isActive = !!firstSlideSelected[block] || !!val.Formula?.trim();
      if (isActive) {
        spliterData.push({
          SideNumber: 1,
          BlockNumber: Number(block),
          SelectedField: firstSlideSelected[block] || "",
          Title: val.Title || "",
          Unit: val.Unit || "",
          Formula: val.Formula || "",
          DecimalValue: val.DecimalValue || "0",
        });
      }
    });

    Object.entries(secondSlideValues).forEach(([block, val]) => {
      const isActive = !!secondSlideSelected[block] || !!val.Formula?.trim();
      if (isActive) {
        spliterData.push({
          SideNumber: 2,
          BlockNumber: Number(block),
          SelectedField: secondSlideSelected[block] || "",
          Title: val.Title || "",
          Unit: val.Unit || "",
          Formula: val.Formula || "",
          DecimalValue: val.DecimalValue || "0",
        });
      }
    });
    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
    const sliderDataBody = {
      con: JSON.stringify({
        mode: "saveSpliterData",
        appuserid: AllData?.LUId,
        IPAddress: clientIpAddress,
      }),
      p: JSON.stringify({
        ReportId: spData?.ReportId,
        SpliterData: spliterData,
      }),
      f: "DynamicReport ( saveSpliterData )",
    };
    try {
      const response = await CallApi(sliderDataBody);
      if (response?.rd[0]?.stat == 1) {
        setOtherSettingSnackbarOpen(true);
        setTimeout(() => {
          setOtherSettingSnackbarOpen(false);
        }, 4000);
        if (setOtherSpliterSideData1) {
          setOtherSpliterSideData1(buildSlideObject(firstSlideSelected, firstSlideValues));
        }
        if (setOtherSpliterSideData2) {
          setOtherSpliterSideData2(buildSlideObject(secondSlideSelected, secondSlideValues));
        }
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!otherSpliterSideData1) return;

    const mapSlideData = (data, setSelected, setValues) => {
      const newSelected = {};
      const newValues = {};

      Object.entries(data).forEach(([key, value]) => {
        if (value?.length > 0) {
          let blockNumber = 0;

          if (key === "firstSlideFirstData") blockNumber = 1;
          if (key === "firstSlideSecondData") blockNumber = 2;
          if (key === "firstSlideThirdData") blockNumber = 3;
          if (key === "firstSlideFourthData") blockNumber = 4;
          const row = value[0];
          newSelected[blockNumber] = row.selectedField;
          newValues[blockNumber] = {
            Title: row.title || "",
            Unit: row.unit || "",
            Formula: row.formula || "",
            DecimalValue: row.decimal || "",
          };
        }
      });
      setSelected((prev) => ({ ...prev, ...newSelected }));
      setValues((prev) => ({ ...prev, ...newValues }));
    };
    mapSlideData(otherSpliterSideData1, setFirstSlideSelected, setFirstSlideValues);
    if (otherSpliterSideData2)
      mapSlideData(otherSpliterSideData2, setSecondSlideSelected, setSecondSlideValues);
  }, [otherSpliterSideData1, otherSpliterSideData2]);

  return (
    <div>
      <Snackbar
        open={otherSettingSnackbarOpen}
        autoHideDuration={1200}
        onClose={() => setOtherSettingSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Other Spliter Setting Saved Successfully.
        </Alert>
      </Snackbar>

      <FormulaBuilderModal
        open={formulaModalOpen}
        onClose={closeFormulaBuilder}
        onSave={saveFormulaToTarget}
        columns={spliterReportColum}
        initialFormula={formulaModalInitial}
      />

      <div>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          {[1, 2, 3, 4].map((block) => (
            <SlideValueSelector
              key={block}
              title={`First Slide - Value ${block}`}
              blockNumber={block}
              sideNumber={1}
              selectedField={firstSlideSelected[block]}
              onSelect={(val) =>
                setFirstSlideSelected((prev) => ({ ...prev, [block]: val }))
              }
              columns={spliterReportColum}
              values={firstSlideValues}
              setValues={setFirstSlideValues}
              errors={errors}
              setErrors={setErrors}
              onOpenFormulaBuilder={openFormulaBuilder}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          {[1, 2, 3, 4].map((block) => (
            <SlideValueSelector
              key={block}
              title={`Second Slide - Value ${block}`}
              blockNumber={block}
              sideNumber={2}
              selectedField={secondSlideSelected[block]}
              onSelect={(val) =>
                setSecondSlideSelected((prev) => ({ ...prev, [block]: val }))
              }
              columns={spliterReportColum}
              values={secondSlideValues}
              setValues={setSecondSlideValues}
              errors={errors}
              setErrors={setErrors}
              onOpenFormulaBuilder={openFormulaBuilder}
            />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
          <Button
            onClick={() => setOpen(false)}
            variant="contained"
            sx={{ mt: 2 }}
            style={{ backgroundColor: "#f03d3d" }}
          >
            Close
          </Button>

          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ mt: 2 }}
            style={{ backgroundColor: "rgb(86, 74, 252)" }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OtherSetting;