"use client";

import React, { useState, useEffect, forwardRef, useRef, useCallback } from "react";
import {
  Box, Button, Checkbox,
  Modal, Drawer, Slide, Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from "@mui/material";
import "./CustomizeMaster.scss";
import { CallApi } from "@/apiList/CallApi";
import AreaChartImg from '../../../images/ChartView/AreaChartImg.png';
import BarChart1img from '../../../images/ChartView/BarChart1.png';
import BarChart2Img from '../../../images/ChartView/BarChart2.png';
import PieChartImg from '../../../images/ChartView/PieChart.png';
import ChartViewDrawer from "./ChartViewDrawer/ChartViewDrawer";
import ImageViewDrawer from "./ImageViewDrawer/ImageViewDrawer";
import PrintViewDrawer from "./PrintViewDrawer/PrintViewDrawer";
import OnReportIframeButton from "./OnReportIframeButton/OnReportIframeButton";
import SwitchtoReportFunctionality from "./SwitchtoReportFunctionality/SwitchtoReportFunctionality";
import { formulasToPayload } from "../FormulaBaseSummary/FormulaBaseSummary";
import { IoWarningOutline } from "react-icons/io5";
import { MdDoNotDisturb } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import { GiReturnArrow } from "react-icons/gi";

export const ICON_LIST = [
  {
    id: "11",
    name: "Warning",
    icon: IoWarningOutline,
  },
  {
    id: "12",
    name: "DoNot Disturb",
    icon: MdDoNotDisturb,
  },
  {
    id: "13",
    name: "Add Circle",
    icon: IoMdAddCircleOutline,
  },
  {
    id: "14",
    name: "Return Arrow",
    icon: GiReturnArrow,
  },
];

const SlideRight = forwardRef(function SlideRight(props, ref) {
  return <Slide direction="left" ref={ref} {...props} timeout={400} />;
});


const masterSettingsOrder = [
  "ChartView", "ImageView", "PrintButton", "GridViewPrintButton", "MainDateFilter", "AllDataButton", "MultiDateFilter", "ColumnSettingModel",
  "FullScreenGridButton", "CheckBoxSelection", "GroupCheckBox", "PriorityMaster",
  "CurrencyMaster", "MailButton",
  "MakeNewReport", "deafultShowAllData", "OptigoChatBotAi", "IsMainFilterButton", "otherPrintOptionShow", "IsMultiSorting", "ImageViewSelection", "IsDateFilterServerSide",
  "isShowPreFilterModal", "ShowMultiTableData", "IsSearchBySingleValue", "IsMainDateFilterMonthRestriction", "IsMainDateFilterMonthRestrictionCount","SummaryCollapseButton"
];

const NUMBER_INPUT_KEYS = ["IsMainDateFilterMonthRestrictionCount"];
// "ExcelExport", 

const DEFAULT_CHART_VIEW = [
  { type: "AreaChart", enabled: false, xAxisColumn: "", yAxisColumn: "" },
  { type: "PieChart", enabled: false, PieDataColumn: "" },
  { type: "BarChart", enabled: false, xAxisColumn: "", yAxisColumn: "" },
  { type: "BarChart2", enabled: false, xAxisColumn: "", yAxisColumn: "" },
];

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper', border: 'none', outline: 'none',
  boxShadow: 0, p: 4, borderRadius: 5,
};

const clientIpAddress = typeof window !== "undefined" ? sessionStorage.getItem("clientIpAddress") : null;

const parseChartViewData = (raw) => {
  try {
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return DEFAULT_CHART_VIEW;
    return DEFAULT_CHART_VIEW.map((def, i) => {
      const saved = arr[i] || {};
      const rawEnabled = saved[def.type];
      const enabled = rawEnabled === true || rawEnabled === 1 || rawEnabled === "true" || rawEnabled === "1";
      if (def.type === "PieChart") {
        return { ...def, enabled, PieDataColumn: saved.PieDataColumn || saved.PieDataColum || "" };
      }
      return { ...def, enabled, xAxisColumn: saved.xAxisColumn || "", yAxisColumn: saved.yAxisColumn || saved.yAxiosColumn || "" };
    });
  } catch {
    return DEFAULT_CHART_VIEW;
  }
};

const buildChartPayload = (chartViewData) => {
  const payload = {};
  chartViewData.forEach((chart) => {
    const enabled = chart.enabled ? 1 : 0;
    if (chart.type === "PieChart") {
      payload["PieChart"] = enabled;
      payload["PieChart_DataColumn"] = chart.enabled ? (chart.PieDataColumn || "") : "";
    } else if (chart.type === "AreaChart") {
      payload["AreaChart"] = enabled;
      payload["AreaChart_xAxisColumn"] = chart.enabled ? (chart.xAxisColumn || "") : "";
      payload["AreaChart_yAxisColumn"] = chart.enabled ? (chart.yAxisColumn || "") : "";
    } else if (chart.type === "BarChart") {
      payload["BarChart"] = enabled;
      payload["BarChart_xAxisColumn"] = chart.enabled ? (chart.xAxisColumn || "") : "";
      payload["BarChart_yAxisColumn"] = chart.enabled ? (chart.yAxisColumn || "") : "";
    } else if (chart.type === "BarChart2") {
      payload["BarChart2"] = enabled;
      payload["BarChart2_xAxisColumn"] = chart.enabled ? (chart.xAxisColumn || "") : "";
      payload["BarChart2_yAxisColumn"] = chart.enabled ? (chart.yAxisColumn || "") : "";
    }
  });
  return payload;
};

const serializeChartViewData = (chartViewData) => {
  return JSON.stringify(
    chartViewData.map((chart) => {
      if (chart.type === "PieChart") {
        return { PieChart: chart.enabled, PieDataColum: chart.PieDataColumn };
      }
      return { [chart.type]: chart.enabled, xAxisColumn: chart.xAxisColumn, yAxisColumn: chart.yAxisColumn };
    })
  );
};

const emptyRow = () => ({
  id: Date.now() + Math.random(),
  svgname: "",
  svgfieldname: "",
  svgshowcolumname: ""
});


const SvgIconSection = ({ spData, svgRows, setSvgRows }) => {
  const [iconModalOpen, setIconModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [tempSelectedIcon, setTempSelectedIcon] = useState("");

  const fieldOptions = Array.isArray(spData?.result)
    ? spData.result.map((col) => col.FieldName).filter(Boolean)
    : [];

  const handleChange = (index, key, value) => {
    setSvgRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleAdd = () => setSvgRows((prev) => [...prev, emptyRow()]);
  const handleRemove = (index) => setSvgRows((prev) => prev.filter((_, i) => i !== index));

  const handleOpenIconModal = (index) => {
    setSelectedRowIndex(index);
    setTempSelectedIcon(svgRows[index]?.svgname || "");
    setIconModalOpen(true);
  };

  const handleSaveIcon = () => {
    if (selectedRowIndex === null) return;

    handleChange(selectedRowIndex, "svgname", tempSelectedIcon);

    setIconModalOpen(false);
  };
  return (
    <div style={{ marginBottom: 4, minWidth: '50%' }}>
      <Dialog
        open={iconModalOpen}
        onClose={() => setIconModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Icon</DialogTitle>

        <DialogContent>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
              gap: 16,
              paddingTop: 10,
            }}
          >
            {ICON_LIST.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => setTempSelectedIcon(item.id)}
                  style={{
                    border:
                      tempSelectedIcon === item.id
                        ? "2px solid #564afc"
                        : "1px solid #ddd",
                    borderRadius: 10,
                    padding: 12,
                    cursor: "pointer",
                    textAlign: "center",
                    background:
                      tempSelectedIcon === item.id
                        ? "#f4f2ff"
                        : "#fff",
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <IconComp size={34} />
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#777",
                      marginTop: 4,
                    }}
                  >
                    {item.id}
                  </div>
                </div>
              );
            })}
          </div>

        </DialogContent>

        <DialogActions>
          <Button onClick={() => setIconModalOpen(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveIcon}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <label className="cm_section_label" style={{ marginBottom: 0 }}>Icon Filter</label>
        <Button
          size="small"
          variant="outlined"
          onClick={handleAdd}
          sx={{ fontSize: "11px", py: "2px", px: "10px", color: "rgb(86,74,252)", borderColor: "rgb(86,74,252)", minWidth: "unset", lineHeight: 1.5 }}
        >
          + Add
        </Button>
      </div>

      {svgRows.map((row, index) => (
        <div key={row.id} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            onClick={() => handleOpenIconModal(index)}
            sx={{
              minWidth: 180,
              justifyContent: "flex-start",
              textTransform: "none",
              height: 40,
            }}
          >
            {row.svgname || "Select Icon"}
          </Button>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id={`svg-field-${index}`}>SVG Field</InputLabel>

            <Select
              labelId={`svg-field-${index}`}
              value={row.svgfieldname}
              label="SVG Field"
              onChange={(e) =>
                handleChange(index, "svgfieldname", e.target.value)
              }
            >
              <MenuItem value="">-- SVG Field --</MenuItem>

              {fieldOptions.map((f) => (
                <MenuItem key={f} value={f}>
                  {f}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* SHOW COLUMN */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id={`svg-show-${index}`}>Show Column</InputLabel>
            <Select
              labelId={`svg-show-${index}`}
              value={row.svgshowcolumname}
              label="Show Column"
              onChange={(e) =>
                handleChange(index, "svgshowcolumname", e.target.value)
              }
            >
              <MenuItem value="">-- Show Column --</MenuItem>
              {fieldOptions.map((f) => (
                <MenuItem key={f} value={f}>
                  {f}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button size="small" onClick={() => handleRemove(index)} sx={{ minWidth: "unset", p: "4px", color: "#e53935" }}>✕</Button>
        </div>
      ))}

      {svgRows.length === 0 && (
        <p style={{ fontSize: 12, color: "#999", margin: "4px 0 0" }}>No SVG rows added yet.</p>
      )}
    </div>
  );
};

const CustomizeMaster = ({ initialData, spId, onClose, onSave, spData, redirectionMaster, allPrintData, formulaList, isFormulaBasedSummary }) => {
  console.log('initialData: ', initialData);
  console.log('spData: ', spData);
  const [masterSettings, setMasterSettings] = useState({});
  const [chartViewData, setChartViewData] = useState(DEFAULT_CHART_VIEW);
  const [imageViewData, setImageViewData] = useState([]);
  const [printViewData, setPrintViewData] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [openChartType, setOpenChartType] = useState("");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [selectedPrintColum, setSelectedPrintColum] = useState("");
  const [selectedPrintMaster, setSelectedPrintMaster] = useState("");
  const [selectedMainPrint, setSelectedMainPrint] = useState("");
  const [selectedDefaultPrint, setSelectedDefaultPrint] = useState("");
  const [selectedDefaultPrintColum, setSelectedDefaultPrintColum] = useState("");
  const [svgRows, setSvgRows] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const isSaving = useRef(false);

  useEffect(() => {
    if (isSaving.current) return;

    const settings = { ...initialData[0] };
    setMasterSettings(settings);

    setChartViewData(settings.chartViewData ? parseChartViewData(settings.chartViewData) : DEFAULT_CHART_VIEW);

    if (spData?.PrintDataArray) {
      try {
        const parsed = typeof spData.PrintDataArray === "string" ? JSON.parse(spData.PrintDataArray) : spData.PrintDataArray;
        if (Array.isArray(parsed)) setPrintViewData(parsed);
      } catch { }
    }

    if (spData?.ImageDataArray) {
      try {
        const parsed = typeof spData.ImageDataArray === "string" ? JSON.parse(spData.ImageDataArray) : spData.ImageDataArray;
        if (Array.isArray(parsed)) setImageViewData(parsed);
      } catch { setImageViewData([]); }
    }

    if (spData?.SvgIconFilter) {
      try {
        const parsed = typeof spData.SvgIconFilter === "string" ? JSON.parse(spData.SvgIconFilter) : spData.SvgIconFilter;
        if (Array.isArray(parsed)) setSvgRows(parsed);
      } catch { setSvgRows([]); }
    }

    if (spData?.PrintMasterName) setSelectedPrintMaster(spData.PrintMasterName);
    if (spData?.MainPrintColumn) setSelectedMainPrint(spData.MainPrintColumn);
    if (spData?.DefaultPrintColumn) setSelectedDefaultPrintColum(spData.DefaultPrintColumn);
    if (spData?.DefaultPrintName) setSelectedDefaultPrint(spData.DefaultPrintName);
    if (spData?.IsPrintColumn) setSelectedPrintColum(spData.IsPrintColumn);
  }, [initialData, spId, spData]);

  // ── Stable callbacks — no inline arrow functions in JSX ──
  const handleIframeChange = useCallback((data) => {
    setMasterSettings((prev) => {
      if (
        prev.ReportIframeButton === data.ReportIframeButton &&
        JSON.stringify(prev.IframeDataArray) === JSON.stringify(data.IframeDataArray)
      ) return prev;
      return { ...prev, ReportIframeButton: data.ReportIframeButton, IframeDataArray: data.IframeDataArray };
    });
  }, []);

  const handleMultiTabChange = useCallback((data) => {
    setMasterSettings((prev) => {
      if (
        prev.IsMultiTab === data.IsMultiTab &&
        JSON.stringify(prev.MultiTabDataArray) === JSON.stringify(data.MultiTabDataArray)
      ) return prev;
      return { ...prev, IsMultiTab: data.IsMultiTab, MultiTabDataArray: data.MultiTabDataArray };
    });
  }, []);

  const handleCheckboxChange = (key) => {
    setMasterSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNumberChange = (key, value) => {
    const onlyDigits = value.replace(/\D/g, "");
    setMasterSettings((prev) => ({ ...prev, [key]: onlyDigits }));
  };

  const handleAddDataClick = (e, key) => {
    e.preventDefault();
    if (key === "ChartView") setActiveDrawer("chart");
    if (key === "ImageView") setActiveDrawer("image");
    if (key === "PrintButton") setActiveDrawer("print");
  };

  const buildImagePayload = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map((row) => ({
      FieldName: row.value || "", lable: row.lable || "", value: row.value || "",
      fontsizel: row.fontsizel || "", fontsizev: row.fontsizev || "",
      fontweightl: row.fontweightl || "", fontweightv: row.fontweightv || "",
      displayorder: row.displayorder || "",
      HideShowLableName: row.HideShowLableName || ""
    }));
  };

  const buildPrintPayload = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map((row) => ({
      FieldName: row.value || "", lable: row.lable || "", value: row.value || "",
      fontsizel: row.fontsizel || "", fontsizev: row.fontsizev || "",
      fontweightl: row.fontweightl || "", fontweightv: row.fontweightv || "",
      displayorder: row.displayorder || "",
      HideShowLableName: row.HideShowLableName || "",
      IsHideShowOption: row.IsHideShowOption || "",
    }));
  };

  const handleSave = async () => {
    isSaving.current = true;
    const AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

    const masterFields = Object.keys(masterSettings).reduce((acc, key) => {
      if (["chartViewData", "imageViewData", "printViewData", "IframeDataArray", "MultiTabDataArray", "SvgIconFilter", "PrintMasterName", "SummaryFormulaArray"].includes(key)) return acc;

      if (NUMBER_INPUT_KEYS.includes(key)) {
        const num = parseInt(masterSettings[key], 10);
        acc[key] = Number.isNaN(num) ? 0 : num;   // store as number
        return acc;
      }

      acc[key] = masterSettings[key] ? 1 : 0;
      return acc;
    }, {});

    const p = {
      ReportId: spId,
      PrintMasterName: selectedPrintMaster,
      MainPrintColumn: selectedMainPrint,
      DefaultPrintColumn: selectedDefaultPrintColum,
      DefaultPrintName: selectedDefaultPrint,
      IsPrintColumn: selectedPrintColum,
      SummaryFormulaArray: formulasToPayload(formulaList || []),
      IsFormulaBasedSummary: isFormulaBasedSummary ? 1 : 0,
      SvgIconFilter: svgRows,
      ...masterFields,
      ...(masterSettings.ChartView ? buildChartPayload(chartViewData) : {}),
      ...(masterSettings.ImageView ? { ImageDataArray: buildImagePayload(imageViewData) } : {}),
      ...(masterSettings.PrintButton ? { PrintDataArray: buildPrintPayload(printViewData) } : {}),
      ...(masterSettings.ReportIframeButton ? { IframeDataArray: masterSettings.IframeDataArray } : { IframeDataArray: [] }),
      ...(masterSettings.IsMultiTab ? { MultiTabDataArray: masterSettings.MultiTabDataArray || [] } : { MultiTabDataArray: [] }),
    };

    const payload = {
      con: JSON.stringify({ mode: "updateReportMasterSettings", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
      p: JSON.stringify(p),
      f: "DynamicReport ( Update report master setting )",
    };

    try {
      await CallApi(payload);
      if (onSave) {
        onSave({
          masterSettings: {
            ...masterSettings,
            chartViewData: serializeChartViewData(chartViewData),
            ReportIframeButton: masterSettings.ReportIframeButton,
            IframeDataArray: masterSettings.IframeDataArray,
            IsMultiTab: masterSettings.IsMultiTab,
            MultiTabDataArray: masterSettings.MultiTabDataArray,
            SvgIconFilter: JSON.stringify(
              svgRows.map(({ id, ...row }) => ({
                svgname: row.svgname || "",
                svgfieldname: row.svgfieldname || "",
                svgshowcolumname: row.svgshowcolumname || "",
              }))
            ),
          },
          printViewData,
          imageViewData,
          printMasterName: selectedPrintMaster,
          DefaultPrintColumn: selectedDefaultPrintColum,
          DefaultPrintName: selectedDefaultPrint,
          MainPrintColumn: selectedMainPrint,
          IsPrintColumn: selectedPrintColum,
        });
      }
    } catch (err) {
      isSaving.current = false;
      console.error("❌ Failed saving master settings", err);
      alert("Failed to save master settings");
    }
  };

  const previewImage =
    openChartType === "AreaChart" ? AreaChartImg :
      openChartType === "PieChart" ? PieChartImg :
        openChartType === "BarChart" ? BarChart1img : BarChart2Img;

  const ADD_DATA_KEYS = ["ChartView", "ImageView", "PrintButton"];

  const renderDrawerContent = () => {
    switch (activeDrawer) {
      case "chart":
        return <ChartViewDrawer spData={spData} setChartViewData={setChartViewData} setChartDrawerOpen={() => setActiveDrawer(null)} chartViewData={chartViewData} setPreviewOpen={setPreviewOpen} setOpenChartType={setOpenChartType} />;
      case "image":
        return <ImageViewDrawer imageViewData={imageViewData} setImageViewData={setImageViewData} spData={spData} onClose={() => setActiveDrawer(null)} />;
      case "print":
        return <PrintViewDrawer printViewData={printViewData} setPrintViewData={setPrintViewData} spData={spData} onClose={() => setActiveDrawer(null)} />;
      default:
        return null;
    }
  };


  const fieldOptions = Array.isArray(spData?.result)
    ? spData.result.map((col) => col.FieldName).filter(Boolean)
    : [];


  const printOptions = allPrintData.flatMap((item) => {
    try {
      return JSON.parse(item.DistinctPrintNamesJSON || "[]").map(
        (printItem) => ({
          id: printItem.id,
          name: printItem.printname,
        })
      );
    } catch (err) {
      return [];
    }
  });

  return (
    <div className="Customize_Master_Colum_main" style={{ position: "relative", overflow: "hidden" }}>
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <Box sx={modalStyle}>
          <img src={previewImage} style={{ width: "1500px" }} alt={openChartType} />
        </Box>
      </Modal>

      {/* ── Tab Bar ── */}
      <div className="cc_tab_bar">
        {["Report Features", "Print", "Iframe", "Switch Report"].map((label, i) => (
          <button
            key={label}
            className={`cc_tab${activeTab === i ? " cc_tab_active" : ""}`}
            onClick={() => setActiveTab(i)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="left-form">

        {/* ══ TAB 0: REPORT FEATURES ══ */}
        {activeTab === 0 && (
          <div className="cc_tab_panel">
            <p className="cm_section_label">Report Features</p>
            <div className="cm_chip_grid">
              {masterSettingsOrder
                .filter((key) => key in masterSettings)
                .map((key) => {
                  if (NUMBER_INPUT_KEYS.includes(key)) {
                    return (
                      <div key={key} className="cm_chip" style={{ cursor: "default" }}>
                        <span className="chekbox_title_value" style={{ marginRight: 8 }}>{key}</span>
                        <TextField
                          size="small"
                          type="text"
                          value={masterSettings[key] ?? ""}
                          onChange={(e) => handleNumberChange(key, e.target.value)}
                          inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 3 }}
                          sx={{ width: 80, ml: "auto" }}
                          placeholder="0"
                        />
                      </div>
                    );
                  }
                  const isChecked = Boolean(masterSettings[key]);
                  const hasAddData = ADD_DATA_KEYS.includes(key);
                  return (
                    <div
                      key={key}
                      className={`cm_chip${isChecked ? " cm_chip_on" : ""}`}
                      onClick={() => handleCheckboxChange(key)}
                    >
                      <Checkbox
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(key)}
                        size="small"
                        sx={{ p: "2px", mr: "4px" }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="chekbox_title_value">{key}</span>
                      {hasAddData && isChecked && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => { e.stopPropagation(); handleAddDataClick(e, key); }}
                          sx={{ ml: "auto", fontSize: "10px", py: "1px", px: "6px", color: "rgb(86,74,252)", borderColor: "rgb(86,74,252)", minWidth: "unset", lineHeight: 1.4 }}
                        >
                          Config
                        </Button>
                      )}
                    </div>
                  );
                })}
            </div>

            <Divider style={{ margin: "14px 0 10px" }} />
            <SvgIconSection spData={spData} svgRows={svgRows} setSvgRows={setSvgRows} />
          </div>
        )}

        {/* ══ TAB 1: PRINT ══ */}
        {activeTab === 1 && (
          <div className="cc_tab_panel">
            <p className="cm_section_label">Print Settings</p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Select Print Column</InputLabel>
                <Select
                  value={selectedPrintColum}
                  label="Select Print Column"
                  onChange={(e) => setSelectedPrintColum(e.target.value)}
                  MenuProps={{ PaperProps: { style: { maxHeight: 500 } } }}
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  {fieldOptions.map((f) => (
                    <MenuItem key={f} value={f}>{f}</MenuItem>
                  ))}
                </Select>
              </FormControl>


              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Print Template</InputLabel>
                <Select
                  value={selectedPrintMaster}
                  label="Print Template"
                  onChange={(e) => setSelectedPrintMaster(e.target.value)}
                  MenuProps={{ PaperProps: { style: { maxHeight: 500 } } }}
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  {allPrintData.map((item, index) => (
                    <MenuItem key={index} value={item?.PrintMaster}>
                      {item?.PrintMaster}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Print Data Column</InputLabel>
                <Select
                  value={selectedMainPrint}
                  label="Print Data Column"
                  onChange={(e) => setSelectedMainPrint(e.target.value)}
                  MenuProps={{ PaperProps: { style: { maxHeight: 500 } } }}
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  {fieldOptions.map((f) => (
                    <MenuItem key={f} value={f}>{f}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <Divider style={{ margin: "14px 0 10px" }} />
            <p className="cm_section_label">Default Print</p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Select Default Print</InputLabel>
                <Select
                  value={selectedDefaultPrint}
                  label="Select Default Print"
                  onChange={(e) => setSelectedDefaultPrint(e.target.value)}
                >
                  <MenuItem value="">-- Select Default Print --</MenuItem>
                  {printOptions.map((item) => (
                    <MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Default Print Column Field</InputLabel>
                <Select
                  value={selectedDefaultPrintColum}
                  label="Default Print Column Field"
                  onChange={(e) => setSelectedDefaultPrintColum(e.target.value)}
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  {fieldOptions.map((f) => (
                    <MenuItem key={f} value={f}>{f}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        )}

        {/* ══ TAB 2: IFRAME ══ */}
        {activeTab === 2 && (
          <div className="cc_tab_panel">
            <p className="cm_section_label">Iframe Settings</p>
            <OnReportIframeButton
              spData={spData}
              redirectionMaster={redirectionMaster}
              currentReportIframeButton={masterSettings.ReportIframeButton}
              currentIframeDataArray={masterSettings.IframeDataArray}
              onChange={handleIframeChange}
            />
          </div>
        )}

        {/* ══ TAB 3: SWITCH REPORT ══ */}
        {activeTab === 3 && (
          <div className="cc_tab_panel">
            <p className="cm_section_label">Switch Report Settings</p>
            <SwitchtoReportFunctionality
              spData={spData}
              redirectionMaster={redirectionMaster}
              currentIsMultiTab={masterSettings.IsMultiTab}
              currentMultiTabDataArray={masterSettings.MultiTabDataArray}
              onChange={handleMultiTabChange}
            />
          </div>
        )}

        {/* ── Save / Cancel ── */}
        <div className="button-group" style={{ marginTop: 16 }}>
          <Button onClick={onClose} className="Btn_CustomizeMaster_Model_Cancel">Cancel</Button>
          <Button onClick={handleSave} className="Btn_Customize_Model_Save">Save</Button>
        </div>
      </div>

      {/* ── Chart / Image / Print Drawers ── */}
      <Drawer
        anchor="right"
        open={Boolean(activeDrawer)}
        onClose={() => setActiveDrawer(null)}
        keepMounted
        variant="persistent"
        ModalProps={{ keepMounted: true, disablePortal: true, hideBackdrop: true, style: { position: "absolute" } }}
        slots={{ transition: SlideRight }}
        slotProps={{
          paper: {
            sx: {
              position: "absolute",
              width: activeDrawer === "chart" ? "420px" : "460px",
              height: "100%", top: 0, right: 0,
              display: "flex", flexDirection: "column",
              boxShadow: "-4px 0 20px rgba(0,0,0,0.15)", zIndex: 1300,
            },
          },
        }}
      >
        {renderDrawerContent()}
      </Drawer>
    </div>
  );
};

export default CustomizeMaster;