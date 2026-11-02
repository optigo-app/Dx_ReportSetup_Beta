"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CirclePlus, Search, X } from "lucide-react";
import {
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  FormHelperText,
  FormControlLabel,
  Alert,
  Snackbar,
} from "@mui/material";
import { CallApi } from "@/apiList/CallApi";
import LoadingBackdrop from "@/Utils/LoadingBackdrop";
import "./ReportList.scss";


// Word-prefix search: "dx r r" => "dx recoin report"
const matchesSearch = (query, ...texts) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const text = texts.filter(Boolean).join(" ").toLowerCase();
  if (text.includes(q)) return true; // purana normal search bhi chalega

  const words = text.split(/[\s\-_/.,()]+/).filter(Boolean);
  const tokens = q.split(/\s+/).sort((a, b) => b.length - a.length); // lambe token pehle
  const used = new Set(); // ek shabd sirf ek token ke liye

  return tokens.every((t) => {
    const i = words.findIndex((w, idx) => !used.has(idx) && w.startsWith(t));
    if (i === -1) return false;
    used.add(i);
    return true;
  });
};

const ReportList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationSearch = searchParams.toString()
    ? `?${searchParams.toString()}`
    : "";

  const [loading, setLoading] = useState(false);
  const [spList, setSpList] = useState([]);
  const [multireportData, setMultireportData] = useState([]);
  const [search, setSearch] = useState("");
  const [searchMulti, setSearchMulti] = useState("");

  // Modal state
  const [iconModalOpen, setIconModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editMainId, setEditMainId] = useState(null);

  // Form state
  const [multiReportName, setMultiReportName] = useState("");
  const [selectedReports, setSelectedReports] = useState([]); // array of ReportId
  const [formErrors, setFormErrors] = useState({ name: "", reports: "" });
  const [displayOrders, setDisplayOrders] = useState({}); // { [ReportId]: order }

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const clientIpAddress =
    typeof window !== "undefined"
      ? sessionStorage.getItem("clientIpAddress")
      : null;

  const getAllData = () =>
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("reportVarible"))
      : null;

  // ─── Fetch data ──────────────────────────────────────────────────────────────
  const getSpData = async () => {
    setLoading(true);
    const AllData = getAllData();

    const body = {
      con: `{"id": "", "mode": "getSpList", "appuserid": "${AllData?.LUId}","IPAddress": "${clientIpAddress}"}`,
      p: "{}",
      f: "DynamicReport ( get sp list )",
    };

    const bodyMulti = {
      con: `{"id": "", "mode": "getMultiReportList", "appuserid": "${AllData?.LUId}","IPAddress": "${clientIpAddress}"}`,
      p: "{}",
      f: "DynamicReport ( get sp list )",
    };

    const response = await CallApi(body);
    const responseMulti = await CallApi(bodyMulti);
    setLoading(false);

    if (response?.rd) {
      const sortedData = response.rd.sort((a, b) => b.ReportId - a.ReportId);
      sessionStorage.setItem('allsplistData', JSON.stringify(sortedData))
      setSpList(sortedData);
    }

    if (responseMulti?.rd) {
      setMultireportData(responseMulti.rd);
    }
  };

  useEffect(() => {
    getSpData();
  }, []);

  // ─── Filtered list ────────────────────────────────────────────────────────────
  const filteredSpList = spList?.filter((sp) =>
    matchesSearch(search, sp.ReportName, sp.ReportDescription)
  );

  const filteredMultiList = multireportData?.filter((sp) =>
    matchesSearch(searchMulti, sp.MainReportName)
  );

  // ─── Modal helpers ────────────────────────────────────────────────────────────
  const resetForm = () => {
    setMultiReportName("");
    setSelectedReports([]);
    setDisplayOrders({});
    setFormErrors({ name: "", reports: "", order: "" });
    setIsEditMode(false);
    setEditMainId(null);
  };

  const openNewModal = () => {
    resetForm();
    setIconModalOpen(true);
  };

  const openEditModal = (mainReport) => {
    resetForm();
    setIsEditMode(true);
    setEditMainId(mainReport.MainId);
    setMultiReportName(mainReport.MainReportName);

    // Parse SubReports and pre-select by matching PageId in spList
    let subReports = [];
    try {
      subReports =
        typeof mainReport.SubReports === "string"
          ? JSON.parse(mainReport.SubReports)
          : mainReport.SubReports || [];
    } catch {
      subReports = [];
    }

    // Match SubPageId → PageId in spList and restore saved display order
    const preSelected = [];
    const orders = {};

    subReports.forEach((sub, idx) => {
      const match = spList.find((sp) => sp.PageId === sub.SubPageId);
      if (match) {
        preSelected.push(match.ReportId);
        const savedOrder = Number(
          sub.DisplayOrder ?? sub.DisplayOrder ?? sub.DisplayOrder
        );
        orders[match.ReportId] = savedOrder > 0 ? savedOrder : idx + 1;
      }
    });

    setSelectedReports(preSelected);
    setDisplayOrders(orders);
    setIconModalOpen(true);
  };

  const closeModal = () => {
    setIconModalOpen(false);
    resetForm();
  };

  const toggleReportSelection = (reportId) => {
    const isSelected = selectedReports.includes(reportId);

    if (isSelected) {
      setSelectedReports((prev) => prev.filter((id) => id !== reportId));
      setDisplayOrders((prev) => {
        const { [reportId]: _removed, ...rest } = prev;
        return rest;
      });
    } else {
      setSelectedReports((prev) => [...prev, reportId]);
      // auto-assign next order number
      setDisplayOrders((prev) => {
        const max = Math.max(0, ...Object.values(prev).map(Number));
        return { ...prev, [reportId]: max + 1 };
      });
    }
    setFormErrors((prev) => ({ ...prev, reports: "", order: "" }));
  };

  const handleOrderChange = (reportId, value) => {
    if (value !== "" && !/^\d+$/.test(value)) return; // digits only
    setDisplayOrders((prev) => ({ ...prev, [reportId]: value }));
    setFormErrors((prev) => ({ ...prev, order: "" }));
  };

  // ─── Validate ─────────────────────────────────────────────────────────────────
  const validate = () => {
    const errors = { name: "", reports: "", order: "" };
    let isValid = true;

    if (!multiReportName.trim()) {
      errors.name = "Multi Report Name is required.";
      isValid = false;
    }

    if (selectedReports.length === 0) {
      errors.reports = "Please select at least one report.";
      isValid = false;
    } else {
      const orders = selectedReports.map((id) => Number(displayOrders[id]));
      if (orders.some((o) => !o || o < 1)) {
        errors.order = "Display order must be 1 or greater for every selected report.";
        isValid = false;
      } else if (new Set(orders).size !== orders.length) {
        errors.order = "Display order must be unique for each report.";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  // ─── Build payload ────────────────────────────────────────────────────────────
  const buildPayload = () => {
    const AllData = getAllData();

    const subReports = selectedReports
      .map((reportId) => {
        const sp = spList.find((s) => s.ReportId === reportId);
        return {
          ReportName: sp?.ReportName || "",
          pid: sp?.PageId || null,
          ReportDescription: "",
          category: "",
          DisplayOrder: Number(displayOrders[reportId]) || "",
        };
      })
      .sort((a, b) => a.DisplayOrder - b.DisplayOrder);

    const mode = isEditMode
      ? "editMultipleSubReportDetails"
      : "saveMultipleSubReportDetails";

    return {
      con: JSON.stringify({
        id: "",
        mode,
        appuserid: AllData?.LUId || "",
        IPAddress: clientIpAddress || "",
        FormName: "DynamicReport ( data )",
      }),
      p: JSON.stringify({
        MainReport: { ReportName: multiReportName.trim() },
        SubReports: subReports,
      }),
      f: "DynamicReport ( data )",
    };
  };

  // ─── Save handler ─────────────────────────────────────────────────────────────
  const handleSaveMultiReport = async () => {
    if (!validate()) return;

    setLoading(true);
    const payload = buildPayload();

    try {
      const response = await CallApi(payload);
      setLoading(false);

      // Handle "already exists" or server error
      if (response?.rd?.[0]?.StatusCode === 0 || response?.status === 0) {
        const msg =
          response?.rd?.[0]?.Msg ||
          response?.message ||
          "This report name already exists. Please use a different name.";
        setSnackbar({ open: true, message: msg, severity: "error" });
        return;
      }

      // Success
      const successMsg = isEditMode
        ? "Multi Report updated successfully."
        : "Multi Report created successfully.";
      setSnackbar({ open: true, message: successMsg, severity: "success" });
      closeModal();
      getSpData(); // Refresh list
    } catch (err) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Something went wrong. Please try again.",
        severity: "error",
      });
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="SP_list_main">
      <LoadingBackdrop isLoading={loading} />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ── Multi Report Modal ── */}
      <Dialog
        open={iconModalOpen}
        onClose={closeModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? "Edit Multi Report" : "New Multi Report"}
        </DialogTitle>

        <DialogContent dividers>
          {/* Report Name */}
          <TextField
            label="Multi Report Name"
            fullWidth
            size="small"
            value={multiReportName}
            onChange={(e) => {
              setMultiReportName(e.target.value);
              if (e.target.value.trim()) {
                setFormErrors((prev) => ({ ...prev, name: "" }));
              }
            }}
            error={!!formErrors.name}
            helperText={formErrors.name}
            style={{ marginTop: "10px", marginBottom: "16px" }}
          />

          {/* Select Reports */}
          <Typography
            variant="subtitle2"
            style={{ marginBottom: "6px", fontWeight: 600 }}
          >
            Select Reports
          </Typography>

          {formErrors.reports && (
            <FormHelperText error style={{ marginBottom: "8px" }}>
              {formErrors.reports}
            </FormHelperText>
          )}
          {formErrors.order && (
            <FormHelperText error style={{ marginBottom: "8px" }}>
              {formErrors.order}
            </FormHelperText>
          )}

          <div
            style={{
              maxHeight: "280px",
              overflowY: "auto",
              border:
                formErrors.reports || formErrors.order
                  ? "1px solid #d32f2f"
                  : "1px solid #e0e0e0",
              borderRadius: "6px",
              padding: "4px 8px",
            }}
          >
            {spList?.length === 0 ? (
              <Typography variant="body2" color="text.secondary" style={{ padding: "8px 0" }}>
                No reports available.
              </Typography>
            ) : (
              [...spList]
                .sort((a, b) => {
                  const aSelected = selectedReports.includes(a.ReportId) ? 0 : 1;
                  const bSelected = selectedReports.includes(b.ReportId) ? 0 : 1;
                  return aSelected - bSelected;
                })
                .map((sp) => {
                  const isSelected = selectedReports.includes(sp.ReportId);
                  return (
                    <div
                      key={sp.ReportId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleReportSelection(sp.ReportId)}
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="body2" className="sp_list_Title">
                            {sp.ReportName}
                          </Typography>
                        }
                        style={{ flex: 1, margin: 0 }}
                      />
                      {isSelected && (
                        <TextField
                          label="Order"
                          size="small"
                          value={displayOrders[sp.ReportId] ?? ""}
                          onChange={(e) => handleOrderChange(sp.ReportId, e.target.value)}
                          slotProps={{
                            htmlInput: { inputMode: "numeric", maxLength: 3 },
                          }}
                          sx={{
                            width: "80px",
                            "& .MuiInputBase-input": { padding: "5px 8px", textAlign: "center" },
                          }}
                        />
                      )}
                    </div>
                  );
                })
            )}
          </div>

          <Typography variant="caption" color="text.secondary" style={{ marginTop: "6px", display: "block" }}>
            {selectedReports.length} report{selectedReports.length !== 1 ? "s" : ""} selected
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveMultiReport}>
            {isEditMode ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <p style={{ position: "absolute", right: "40px", bottom: "40px", color: "#f5f6fa" }}>
        Version : LOCAL76.101-250520260426
      </p>

      <div className="spList_header">
        <p className="spList_title">Report List</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "50px" }}>

        {/* ── Single Reports Panel ── */}
        {!loading && (
          <div className="report_list_body">
            <div className="report_list_toolbar">
              <TextField
                type="text"
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={16} color="#888" />
                      </InputAdornment>
                    ),
                    endAdornment: search ? (
                      <InputAdornment position="end">
                        <IconButton edge="end" size="small" onClick={() => setSearch("")}>
                          <X size={16} color="#888" />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  },
                }}
                sx={{
                  width: "320px",
                  "& .MuiInputBase-input": { padding: "7px 8px !important" },
                  "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                }}
              />
              <Typography className="report_count_label">
                {filteredSpList?.length} report{filteredSpList?.length !== 1 ? "s" : ""}
                <Button
                  className="header_add_btn"
                  onClick={() => {
                    sessionStorage.removeItem("addReportSp");
                    router.push(`/AddReport${locationSearch}`);
                  }}
                  startIcon={<CirclePlus size={18} />}
                >
                  New Report
                </Button>
              </Typography>
            </div>

            {filteredSpList?.length === 0 ? (
              <div className="empty_state">
                <Typography className="empty_state_text">
                  {search
                    ? `No reports match "${search}"`
                    : "No reports found. Click New Report to add one."}
                </Typography>
              </div>
            ) : (
              <div className="Report_list_flexView">
                {filteredSpList?.map((sp) => (
                  <div key={sp.ReportId} className="Sp_list_singleView">
                    <div className="card_accent" />
                    <div className="card_content">
                      <Typography className="sp_list_Title">{sp.ReportName}</Typography>
                      {sp.ReportDescription && (
                        <p className="sp_list_Description">{sp.ReportDescription}</p>
                      )}
                    </div>
                    <div className="card_actions">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() =>
                          router.push(
                            `/ShowColumnList${locationSearch}${locationSearch ? "&" : "?"}reportId=${sp.ReportId}`
                          )
                        }
                        className="Btn_EditSp"
                      >
                        Customize
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          sessionStorage.setItem("addReportSp", JSON.stringify({ sp }));
                          router.push(`/AddReport${locationSearch}`);
                        }}
                        className="Btn_AddColumn"
                      >
                        Add Column
                      </Button>
                      {sp?.rd && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/NewFirstSample/${sp.id}`);
                          }}
                          className="Btn_ShwoReport"
                        >
                          Show Report
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Multi Reports Panel ── */}
        {!loading && (
          <div className="multireport_list_body">
            <div className="report_list_toolbar">
              <TextField
                type="text"
                placeholder="Search multi reports..."
                value={searchMulti}
                onChange={(e) => setSearchMulti(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} color="#888" />
                    </InputAdornment>
                  ),
                  endAdornment: searchMulti ? (
                    <InputAdornment position="end">
                      <IconButton edge="end" size="small" onClick={() => setSearchMulti("")}>
                        <X size={16} color="#888" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                sx={{
                  width: "200px",
                  "& .MuiInputBase-input": { padding: "7px 8px !important" },
                  "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                }}
              />
              <Typography className="report_count_label">
                {filteredMultiList?.length} report{filteredMultiList?.length !== 1 ? "s" : ""}
                <Button
                  className="header_add_btn"
                  onClick={openNewModal}
                  startIcon={<CirclePlus size={18} />}
                >
                  New Multi Report
                </Button>
              </Typography>
            </div>

            {filteredMultiList?.length === 0 ? (
              <div className="empty_state">
                <Typography className="empty_state_text">
                  {search
                    ? `No reports match "${search}"`
                    : "No reports found. Click New Multi Report to add one."}
                </Typography>
              </div>
            ) : (
              <div className="Report_list_flexView">
                {filteredMultiList?.map((sp) => (
                  <div key={sp.MainId} className="Sp_list_singleView">
                    <div className="card_accent" />
                    <div className="card_content">
                      <Typography className="sp_list_Title">{sp.MainReportName}</Typography>
                    </div>
                    <div className="card_actions">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => openEditModal(sp)}
                        className="Btn_AddColumn"
                      >
                        Edit Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportList;