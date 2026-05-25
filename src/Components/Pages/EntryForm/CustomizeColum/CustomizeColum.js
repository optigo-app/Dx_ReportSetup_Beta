
"use client";

import React, { useState, useEffect, forwardRef } from "react";
import {
  Button,
  Checkbox,
  Drawer,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Slide,
  TextField,
  Tooltip,
} from "@mui/material";
import "./CustomizeColum.scss";
import { CallApi } from "@/apiList/CallApi";
import { MessageCircle, NotebookPen, Printer } from "lucide-react";
import ColorPickerPanel from "./ColorPickerPanel/ColorPickerPanel";
import { toast } from "react-toastify";
import VivewDataDrawer from "./VivewDataDrawer/VivewDataDrawer";
import FormulaBaseSummary from "../FormulaBaseSummary/FormulaBaseSummary";

const defaultField = {
  ColId: null,
  ReportId: null,
  FieldName: "",
  HeaderName: "",
  Regex: null,
  ColumnType: "Text",
  MasterId: null,
  Width: "",
  HeaderAlign: "left",
  FontWeight: 400,
  IframeTypeId: "",
  ColumnAlign: "left",
  OnHrefNavigate: "",
  RedirectId: 0,
  DisplayOrder: "",
  FontSize: 10,
  DefaultSort: "normall",
  TwoColumnData: "Select",
  BackgroundColor: "",
  FontColor: "",
  BorderRadius: "",
  SummaryValueKey: "",
  SummaryTitle: "",
  IframeColumnLable: "",
  SummeryOrder: "",
  SummaryUnit: "",
  IconName: "",
  FriendlyName: "",
  ColumnDecimal: "",
  GroupChekBox: false,
  DefaultGroupChekBox: false,
  GroupColumnImageView: false,
  ActionFilter: false,
  CopyButton: false,
  HideColumn: false,
  ImageColumn: false,
  IsPriorityColumn: false,
  PriorityColorColumn: false,
  CurrencyColumn: false,
  ViewButton: false,
  IsRightBase: false,
  IsShowDateWithTime: false,
  IsPrintColumn: false,
  ActionMasterName: "",
  DateTimeFrame: 0,
};

const defaultFieldFilter = {
  NormalFilter: false,
  MultiSelection: false,
  RangeFilter: false,
  SuggestionFilter: false,
  SelectDropdownFilter: false,
  ServerSideFilter: false,
};

const defaultFieldSummury = {
  Summary: false,
  SummaryValueFormated: false,
  UniqueCountSummury: false,
};

const defaultFieldNavigate = {
  HrefLink: false,
  HyperlinkShowButton: false
};

const defaultColorPicker = {
  "IsPositiveNagativeColor": 0,
  "PvFColor": null,
  "PvBgColor": null,
  "NvFColor": null,
  "NvBgColor": null
};

const SlideRight = forwardRef(function SlideRight(props, ref) {
  return <Slide direction="left" ref={ref} {...props} timeout={400} />;
});


const CustomizeColum = ({
  selectedColumn,
  spId,
  onClose,
  allColumData,
  redirectionMaster,
  onSave,
  customizeMasterGroupCheckBox,
  masterData,
  formulaList,
  setFormulaList,
  isFormulaBasedSummary,
  setIsFormulaBasedSummary,
}) => {
  const clientIpAddress = typeof window !== "undefined" ? sessionStorage.getItem("clientIpAddress") : null;
  const [formData, setFormData] = useState({ ...defaultField });
  const [colorPicker, setColorPicker] = useState({ ...defaultColorPicker });
  const [activeDrawer, setActiveDrawer] = useState(false);
  const [openFormulaSum, setOpenFormulaSum] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => {
    const base = selectedColumn?.__original || selectedColumn;
    setFormData((prev) => ({
      ...prev,
      ...base,
      ReportId: spId,
      IsInFilterSection: base?.IsInFilterSection ? 1 : 0,
      IsOnScreenFilter: base?.IsOnScreenFilter ? 1 : 0,
    }));

    setColorPicker({
      IsPositiveNagativeColor: base?.IsPositiveNagativeColor ?? 0,
      PvFColor: base?.PvFColor ?? "#000000",
      PvBgColor: base?.PvBgColor ?? "#00ff00",
      NvFColor: base?.NvFColor ?? "#ff0000",
      NvBgColor: base?.NvBgColor ?? "#ffff00",
    });
  }, [selectedColumn, spId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    if (name === "GroupChekBox" && checked && !customizeMasterGroupCheckBox) {
      toast.warning("First enable GroupCheckBox in Report Options", {
        position: "top-center",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const saveData = async () => {
    if (!formData.HeaderName || !formData.FieldName) {
      alert("Header Name and Field Name are required");
      return;
    }

    const basePayload = {
      ColId: formData.ColId,
      ReportId: spId,
      FieldName: formData.FieldName,
      HeaderName: formData.HeaderName,
      Regex: formData.Regex,
      ColumnType: formData.ColumnType,
      MasterId: formData.MasterId,
      IconName: formData.IconName,
      Width: Number(formData.Width) || null,
      HeaderAlign: formData.HeaderAlign,
      FontWeight: formData.FontWeight,
      IframeTypeId: formData.IframeTypeId,
      ColumnAlign: formData.ColumnAlign,
      OnHrefNavigate: formData.OnHrefNavigate,
      RedirectId: parseInt(formData.RedirectId),
      IsVisible: 1,
      // DateColumn: formData.DateColumn ? 1 : 0,
      DisplayOrder: formData.DisplayOrder,
      FontSize: parseInt(formData.FontSize) || 12,
      DefaultSort: formData.DefaultSort || "normall",
      TwoColumnData: formData.TwoColumnData || "Select",
      BackgroundColor: formData.BackgroundColor,
      FontColor: formData.FontColor,
      BorderRadius: Number(formData.BorderRadius) || 0,
      CopyButton: formData.CopyButton ? 1 : 0,
      GrupChekBox: formData.GroupChekBox ? 1 : 0,
      DefaultGrupChekBox: formData.DefaultGroupChekBox ? 1 : 0,
      IsPriorityColumn: formData.IsPriorityColumn ? 1 : 0,
      PriorityColorColumn: formData.PriorityColorColumn ? 1 : 0,
      IsRightBase: formData.IsRightBase ? 1 : 0,
      IsPrintColumn: formData.IsPrintColumn ? 1 : 0,
      IsCurrency: formData.CurrencyColumn ? 1 : 0,
      ViewButton: formData.ViewButton ? 1 : 0,
      IsShowDateWithTime: formData.IsShowDateWithTime ? 1 : 0,
      IsUniqueCount: formData.UniqueCountSummury ? 1 : 0,
      ActionFilter: formData.ActionFilter ? 1 : 0,
      ActionMasterName: formData.ActionMasterName,
      IsLargeDataGroup: formData.IsLargeDataGroup ? 1 : 0,
      DateTimeFrame: formData.DateTimeFrame || 0,
      FriendlyName: formData.FriendlyName || "",
      HideColumn: formData.HideColumn ? 1 : 0,
      ImageColumn: formData.ImageColumn ? 1 : 0,
      GroupColumnImageView: formData.GroupColumnImageView ? 1 : 0,
      ColumnDecimal: formData.ColumnDecimal
        ? Number(formData.ColumnDecimal)
        : null, // ✅ Fix
    };

    const filterPayload = {
      NormalFilter: formData.NormalFilter ? 1 : 0,
      DateRangeFilter: formData.DateRangeFilter ? 1 : 0,
      MultiSelection: formData.MultiSelection ? 1 : 0,
      RangeFilter: formData.RangeFilter ? 1 : 0,
      SuggestionFilter: formData.SuggestionFilter ? 1 : 0,
      SelectDropdownFilter: formData.SelectDropdownFilter ? 1 : 0,
      ServerSideFilter: formData.ServerSideFilter ? 1 : 0,

    };

    const summaryPayload = {
      Summary: formData.Summary ? 1 : 0,
      SummaryValueFormated: formData.SummaryValueFormated ? 1 : 0,
      SummaryValueKey: formData.SummaryValueKey || null,
      SummaryTitle: formData.SummaryTitle || null,
      SummeryOrder: formData.SummeryOrder || null,
      SummaryUnit: formData.SummaryUnit || null,
    };

    const defaultFieldNavigate = {
      HrefLink: formData.HrefLink ? 1 : 0,
      HyperlinkShowButton: formData.HyperlinkShowButton,
      OnHrefLinkModel: formData.OnHyperlinkLinkModel,
      // OnHyperlinkLinkModel: false,
    };

    const finalPayload = {
      ...basePayload,
      ...filterPayload,
      ...summaryPayload,
      ...defaultFieldNavigate,
      ColumnFilter: 1,
      IsInFilterSection: formData.IsInFilterSection || 0, // 0 if not selected
      IsOnScreenFilter: formData.IsOnScreenFilter || 0,     // 0 if not selected
      IframeColumnLable: formData.IframeColumnLable || null,     // 0 if not selected
      ViewButtonDataArray: formData?.ViewButtonDataArray,
      ...colorPicker
    };

    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
    const payload = {
      con: JSON.stringify({
        mode: "updateEditColumnRecord",
        appuserid: AllData?.LUId,
        IPAddress: clientIpAddress
      }),
      p: JSON.stringify(finalPayload),
      f: "DynamicReport ( Update column settings record list )",
    };

    try {
      const res = await CallApi(payload);
      if (onSave) {
        onSave({
          ...formData,
          ...colorPicker,
          IsPositiveNagativeColor: colorPicker.IsPositiveNagativeColor
        });
      }
    } catch (err) {
      console.error("❌ Failed updating column", err);
      alert("Failed to save column changes.");
    }
  };

  const iconOptions = [
    { name: "NotebookPen", component: <NotebookPen /> },
    { name: "Printer", component: <Printer /> },
    { name: "MessageCircle", component: <MessageCircle /> },
  ];

  return (
    <div className="Customize_Colum_Full_main" style={{ position: "relative", overflow: "hidden" }}>
      {/* ── Tab bar ── */}
      <div className="cc_tab_bar">
        {["General", "Filter", "Summary", "Navigation", "Iframe"].map((label, i) => (
          <button
            key={label}
            className={`cc_tab${activeTab === i ? " cc_tab_active" : ""}`}
            onClick={() => setActiveTab(i)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="Customize_Colum_main">

        {/* ══ TAB 0: GENERAL ══ */}
        {activeTab === 0 && (
          <div className="cc_tab_panel">
            <div className="cc_field_grid">
              {["HeaderName", "FieldName", "Width", "DisplayOrder", "FriendlyName",
                formData?.ColumnType === "Number" ? "ColumnDecimal" : null]
                .filter(Boolean)
                .map((field) => (
                  <TextField
                    key={field}
                    name={field}
                    variant="outlined"
                    label={field}
                    value={formData[field] || ""}
                    onChange={handleInputChange}
                    disabled={field === "FieldName"}
                    size="small"
                    className="customize_colum_input"
                  />
                ))}

              {[
                { label: "FontWeight", name: "FontWeight", opts: ["300", "400", "500", "600", "700", "800", "900"] },
                { label: "Header Align", name: "HeaderAlign", opts: ["left", "center", "right"] },
                { label: "Column Align", name: "ColumnAlign", opts: ["left", "center", "right"] },
                { label: "Font Size", name: "FontSize", opts: ["10", "12", "14", "16"] },
                { label: "Default Sort", name: "DefaultSort", opts: [["normall", "-sort-"], ["ascending", "Ascending"], ["descending", "Descending"]] },
                { label: "Two Column Data", name: "TwoColumnData", isColList: true },
              ].map(({ label, name, opts, isColList }) => (
                <FormControl key={name} size="small">
                  <InputLabel>{label}</InputLabel>
                  <Select label={label} name={name} value={formData[name] || ""} onChange={handleInputChange}>
                    {isColList ? (
                      [<MenuItem key="__sel" value="Select">-Select-</MenuItem>,
                      ...(allColumData?.map((d, i) => (
                        <MenuItem key={i} value={d.FieldName}>{d.FieldName}</MenuItem>
                      )) || [])]
                    ) : (
                      (opts || []).map((o) => {
                        const [val, lbl] = Array.isArray(o) ? o : [o, o];
                        return <MenuItem key={val} value={val}>{lbl}</MenuItem>;
                      })
                    )}
                  </Select>
                </FormControl>
              ))}
            </div>

            <div className="cc_section_label">Column Options</div>
            <div className="cc_bool_grid">
              {Object.keys(defaultField)
                .filter((key) => typeof defaultField[key] === "boolean")
                .filter((key) => key !== "IsShowDateWithTime" || formData?.ColumnType === "Date")
                .map((key) => (
                  <label key={key} className="cc_bool_item">
                    <Checkbox
                      name={key}
                      checked={!!formData[key]}
                      onChange={handleCheckboxChange}
                      size="small"
                      sx={{ p: "2px" }}
                    />
                    <span className="chekbox_title_value">{key}</span>
                    {key === "ViewButton" && formData.ViewButton && (
                      <Button
                        size="small"
                        sx={{ ml: 0.5, fontSize: "10px", py: "1px", px: "6px", bgcolor: "#564afc", color: "white", "&:hover": { bgcolor: "#4438e0" } }}
                        onClick={() => setActiveDrawer(true)}
                      >Add Data</Button>
                    )}
                  </label>
                ))}
            </div>
          </div>
        )}

        {/* ══ TAB 1: FILTER ══ */}
        {activeTab === 1 && (
          <div className="cc_tab_panel">
            <div className="cc_section_label">Filter Placement</div>
            <div className="cc_radio_row">
              {["IsInFilterSection", "IsOnScreenFilter"].map((key) => (
                <div
                  key={key}
                  className={`cc_radio_item${formData[key] === 1 ? " cc_radio_active" : ""}`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      IsInFilterSection: key === "IsInFilterSection" ? 1 : 0,
                      IsOnScreenFilter: key === "IsOnScreenFilter" ? 1 : 0,
                    }))
                  }
                >
                  <div className="cc_radio_dot" />
                  <span>{key === "IsInFilterSection" ? "In Filter Section" : "On Screen Filter"}</span>
                </div>
              ))}
            </div>

            <div className="cc_section_label">Filter Types</div>
            <div className="cc_filter_list">
              {Object.keys(defaultFieldFilter).map((key) => (
                <label key={key} className="cc_filter_row">
                  <Checkbox
                    name={key}
                    checked={formData[key] || false}
                    onChange={handleCheckboxChange}
                    size="small"
                    sx={{ p: "2px" }}
                  />
                  <span className="chekbox_title_value">{key}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ══ TAB 2: SUMMARY ══ */}
        {activeTab === 2 && (
          <div className="cc_tab_panel">
            <div className="cc_section_label">Summary Toggles</div>
            <div className="cc_checkbox_row">
              {Object.keys(defaultFieldSummury).map((key) => (
                <label key={key} className="cc_bool_item">
                  <Checkbox
                    name={key}
                    checked={formData[key] || false}
                    onChange={handleCheckboxChange}
                    size="small"
                    sx={{ p: "2px" }}
                  />
                  <span className="chekbox_title_value">{key}</span>
                </label>
              ))}
            </div>

            <div className="cc_section_label" style={{ marginTop: 12 }}>Summary Fields</div>
            <div className="cc_field_grid">
              {[["SummaryTitle", "Summary Title"], ["SummaryUnit", "Summary Unit"], ["SummaryValueKey", "Decimal"], ["SummeryOrder", "Summary Order"]]
                .map(([field, lbl]) => (
                  <TextField
                    key={field}
                    name={field}
                    variant="outlined"
                    label={lbl}
                    value={formData[field] || ""}
                    onChange={handleInputChange}
                    size="small"
                    className="customize_colum_input"
                  />
                ))}
            </div>


            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ width: '50%' }}>
                <div className="cc_section_label" style={{ marginTop: 12 }}>Positive & Negative Color</div>
                <ColorPickerPanel value={colorPicker} onChange={(val) => setColorPicker(val)} />
              </div>
              <div>
                <div className="cc_section_label" style={{ marginTop: 12 }}>FormulaBase Summury</div>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!isFormulaBasedSummary}
                      onChange={(e) => setIsFormulaBasedSummary(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Formula Based Summary"
                />
                {isFormulaBasedSummary && (
                  <Button
                    onClick={() => setOpenFormulaSum(true)}
                  >Add Summury</Button>
                )}
              </div>
            </div>


          </div>
        )}

        {/* ══ TAB 3: NAVIGATION ══ */}
        {activeTab === 3 && (
          <div className="cc_tab_panel">
            <div className="cc_section_label">Navigation Options</div>
            <div className="cc_checkbox_row">
              {Object.keys(defaultFieldNavigate).map((key) => (
                <label key={key} className="cc_bool_item">
                  <Checkbox
                    name={key}
                    checked={formData[key] || false}
                    onChange={handleCheckboxChange}
                    size="small"
                    sx={{ p: "2px" }}
                  />
                  <span className="chekbox_title_value">{key}</span>
                </label>
              ))}
            </div>

            <div className="cc_section_label" style={{ marginTop: 12 }}>Destination Report</div>
            <FormControl size="small" style={{ width: "60%", marginTop: 6 }}>
              <InputLabel>Select destination report</InputLabel>
              <Select
                label="Select destination report"
                name="RedirectId"
                value={formData.RedirectId || 0}
                onChange={handleInputChange}
              >
                <MenuItem value={0}>--Select--</MenuItem>
                {redirectionMaster?.rd1?.map((item) => (
                  <MenuItem key={item.RedirectId} value={item.RedirectId}>{item.RedirectPage}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}

        {/* ══ TAB 4: IFRAME ══ */}
        {activeTab === 4 && (
          <div className="cc_tab_panel">
            <div className="cc_section_label">Iframe Configuration</div>
            <div className="cc_field_grid" style={{ marginTop: 8 }}>
              <FormControl size="small">
                <InputLabel>Select Iframe</InputLabel>
                <Select
                  label="Select Iframe"
                  name="IframeTypeId"
                  value={formData.IframeTypeId || ""}
                  onChange={handleInputChange}
                >
                  <MenuItem value="">--Select--</MenuItem>
                  {redirectionMaster?.rd?.map((item) => (
                    <MenuItem key={item.IframeTypeId} value={item.IframeTypeId}>{item.PopupTitle}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                name="IframeColumnLable"
                variant="outlined"
                label="Iframe Column Label"
                value={formData.IframeColumnLable || ""}
                onChange={handleInputChange}
                size="small"
                className="customize_colum_input"
              />
            </div>

            <div className="cc_section_label" style={{ marginTop: 16 }}>Button Icon</div>
            <div className="cc_icon_row">
              {iconOptions.map((icon) => (
                <div
                  key={icon.name}
                  className={`cc_icon_btn${formData.IconName === icon.name ? " cc_icon_active" : ""}`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      IconName: prev.IconName === icon.name ? "" : icon.name,
                    }))
                  }
                >
                  {React.cloneElement(icon.component, {
                    style: { color: formData.IconName === icon.name ? "rgb(86,74,252)" : "#888", width: 20, height: 20 },
                  })}
                  <span>{icon.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="button-group">
        <Button onClick={onClose} className="Btn_CustomizeMaster_Model_Cancel">Cancel</Button>
        <Button onClick={saveData} className="Btn_Customize_Model_Save">Save</Button>
      </div>

      <Drawer
        anchor="right"
        open={activeDrawer}
        onClose={() => setActiveDrawer(null)}
        TransitionComponent={SlideRight}
        keepMounted
        variant="persistent"
        ModalProps={{
          keepMounted: true,
          disablePortal: true,
          hideBackdrop: true,
          style: { position: "absolute" },
        }}
        PaperProps={{
          sx: {
            position: "absolute",
            height: "100%",
            top: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
            zIndex: 1300,
          },
        }}
        style={{ width: '150px' }}
        sx={{
          "& .MuiPaper-root": {
            width: '700px !important'
          },
          width: 200
        }}
      >
        <VivewDataDrawer
          allColumData={allColumData}
          onClose={() => setActiveDrawer(false)}
          onSave={(data) => setFormData(prev => ({ ...prev, ViewButtonDataArray: data }))}
          formData={formData}
        />
      </Drawer>



      <Drawer
        anchor="right"
        open={openFormulaSum}
        onClose={() => setOpenFormulaSum(false)}
        TransitionComponent={SlideRight}
        keepMounted
        variant="persistent"
        ModalProps={{
          keepMounted: true,
          disablePortal: true,
          hideBackdrop: true,
          style: { position: "absolute" },
        }}
        PaperProps={{
          sx: {
            position: "absolute",
            width: "600px",
            height: "100%",
            top: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
            zIndex: 1300,
          },
        }}
      >
        <FormulaBaseSummary
          allColumData={allColumData}
          initialFormulas={formulaList}
          spId={spId}
          isFormulaBasedSummary={isFormulaBasedSummary}
          onSave={(updatedFormulas) => {
            setFormulaList(updatedFormulas);
          }}
          onClose={() => setOpenFormulaSum(false)}
        />
      </Drawer>
    </div>
  );
};

export default CustomizeColum;