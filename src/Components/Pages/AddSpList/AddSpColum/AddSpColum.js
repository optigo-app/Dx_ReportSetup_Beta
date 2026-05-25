"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowLeftFromLine, CirclePlus, Trash2 } from "lucide-react";
import { CallApi } from "@/apiList/CallApi";
import LoadingBackdrop from "@/Utils/LoadingBackdrop";

const styles = {
  wrapper: {
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgb(86, 74, 252)",
    padding: "8px 16px",
    borderRadius: "6px",
    marginBottom: "16px",
  },
  title: {
    color: "white",
  },
  columnsWrapper: {
    padding: "0 16px",
  },
};

const AddSpColum = ({ sp: existingSp }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationSearch = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [formErrors, setFormErrors] = useState({
    ReportName: false,
    spName: false,
    spDescription: false,
    appName: false,
    menuName: false,
  });
  const [spName, setSpName] = useState(existingSp?.SpName || "");
  const [masterOptions, setMasterOptions] = useState([]);
  const [columns, setColumns] = useState(
    existingSp?.result || [
      {
        FieldName: "",
        HeaderName: "",
        regex: "",
        ColumnType: "",
        master: "",
      },
    ]
  );
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getClientIp = () =>
    typeof window !== "undefined"
      ? sessionStorage.getItem("clientIpAddress")
      : null;

  const getAllData = () => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(sessionStorage.getItem("reportVarible"));
    } catch {
      return null;
    }
  };


  useEffect(() => {
    const storedData = sessionStorage.getItem("editSpData");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      const sp = parsed?.sp;

      if (sp) {
        setSpName(sp?.SpName || "");
        setColumns(
          sp?.result?.length
            ? sp.result
            : [
              {
                FieldName: "",
                HeaderName: "",
                regex: "",
                ColumnType: "",
                master: "",
              },
            ]
        );
      }
    }
  }, []);

  // Fetch master table list on mount
  useEffect(() => {
    const fetchMasterOptions = async () => {
      setLoading(true);
      const AllData = getAllData();
      const body = {
        con: JSON.stringify({
          id: "",
          mode: "getMasterTableList",
          appuserid: AllData?.LUId,
          IPAddress: getClientIp(),
        }),
        p: "{}",
        f: "DynamicReport ( get sp list )",
      };

      try {
        const response = await CallApi(body);
        if (response?.rd && Array.isArray(response.rd)) {
          setMasterOptions(response.rd);
        }
      } catch (error) {
        console.error("Failed to fetch master options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMasterOptions();
  }, []);

  // Fetch existing SP column data once master options are loaded
  useEffect(() => {
    if (!existingSp?.SpName || masterOptions.length === 0) return;

    const getEditColumData = async () => {
      const AllData = getAllData();
      const body = {
        con: JSON.stringify({
          mode: "getSpFieldList",
          appuserid: AllData?.LUId,
          IPAddress: getClientIp(),
        }),
        p: JSON.stringify({
          Sp_Name: existingSp?.SpName || 0,
        }),
        f: "DynamicReport ( get colum data )",
      };

      try {
        const response = await CallApi(body);
        if (response?.rd && response.rd.length > 0) {
          const mappedCols = response.rd.map((col) => {
            const match = masterOptions.find((opt) => opt.Id == col.MasterId);
            return {
              ...col,
              master: match ? match.Id : "",
            };
          });
          setColumns(mappedCols);
        }
      } catch (error) {
        console.error("getEditColumData failed:", error);
      } finally {
        setLoading(false);
      }
    };

    getEditColumData();
  }, [existingSp?.ReportId, masterOptions]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAddColumn = () => {
    setColumns([
      ...columns,
      {
        FieldName: "",
        HeaderName: "",
        regex: "",
        ColumnType: "",
        master: "",
      },
    ]);
    setErrors([
      ...errors,
      { FieldName: false, HeaderName: false, ColumnType: false },
    ]);
  };

  const handleColumnChange = (index, field, value) => {
    const updatedColumns = [...columns];
    if (!updatedColumns[index]) {
      updatedColumns[index] = {
        FieldName: "",
        HeaderName: "",
        regex: "",
        ColumnType: "",
        master: "",
      };
    }
    updatedColumns[index][field] = value;
    setColumns(updatedColumns);

    const updatedErrors = [...errors];
    if (!updatedErrors[index]) {
      updatedErrors[index] = {};
    }
    if (
      (field === "FieldName" ||
        field === "ColumnType" ||
        field === "HeaderName") &&
      value.trim() !== ""
    ) {
      updatedErrors[index][field] = false;
      setErrors(updatedErrors);
    }
  };

  const handleSave = async () => {
    // Validate SP name
    const spErrors = {
      spName: spName.trim() === "",
    };
    setFormErrors(spErrors);
    if (spErrors.spName) return;

    // Validate columns
    const validationResults = columns?.map((col) => ({
      FieldName: col?.FieldName?.trim() === "",
      HeaderName: col?.HeaderName?.trim() === "",
      ColumnType: col?.ColumnType?.trim() === "",
    }));
    setErrors(validationResults);

    const hasErrors = validationResults.some(
      (err) => err.FieldName || err.HeaderName || err.ColumnType
    );
    if (hasErrors) return;

    const result = columns.map((col) => ({
      FieldName: col.FieldName,
      HeaderName: col.HeaderName,
      Regex: col.regex,
      ColumnType: col.ColumnType,
      MasterId: col.master || col.MasterId,
      Width: col.width || col.Width,
      IsFilterable: 1,
      IsVisible: 1,
    }));

    const AllData = getAllData();
    const body = {
      con: JSON.stringify({
        mode: "saveSpFieldList",
        appuserid: AllData?.LUId,
        IPAddress: getClientIp(),
      }),
      p: JSON.stringify({
        SpNumber: "",
        SpNameR: spName,
        Columns: result,
      }),
      f: "DynamicReport ( saveReportAndColumns )",
    };

    try {
      await CallApi(body);

      if (!existingSp) {
        setSpName("");
        setColumns([
          {
            FieldName: "",
            HeaderName: "",
            regex: "",
            ColumnType: "",
            master: "",
          },
        ]);
        setErrors([]);
        setFormErrors({
          ReportName: false,
          spName: false,
          spDescription: false,
          appName: false,
          menuName: false,
        });
      }

      setOpenSnackbar(true);
    } catch (error) {
      console.error("Save API failed:", error);
    }
  };

  const handleRemoveColumn = (index) => {
    const updatedCols = [...columns];
    updatedCols.splice(index, 1);
    setColumns(updatedCols);

    const updatedErrors = [...errors];
    updatedErrors.splice(index, 1);
    setErrors(updatedErrors);
  };


  return (
    <div className="add_sp_columdata" style={styles.wrapper}>
      <LoadingBackdrop isLoading={loading} />

      {/* Header */}
      <div className="spList_header" style={styles.header}>
        <Typography variant="h6" className="spList_title" style={styles.title}>
          Enter SP Details
        </Typography>
        <IconButton onClick={() => router.push(`/${locationSearch}`)}>
          <ArrowLeftFromLine style={{ color: "white" }} />
        </IconButton>
      </div>

      {/* SP Name Field */}
      <Grid container spacing={2} sx={{ m: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Sp Name"
            value={spName}
            onChange={(e) => setSpName(e.target.value)}
            fullWidth
            size="small"
            error={formErrors.spName}
            helperText={formErrors.spName ? "Sp Name is required" : ""}
          />
        </Grid>
      </Grid>

      {/* Section heading */}
      <p
        style={{
          fontSize: "20px",
          fontWeight: 600,
          margin: "5px 0px 15px 20px",
        }}
      >
        Add Columns
      </p>

      {/* Column rows */}
      <div className="allColum_Data_main" style={styles.columnsWrapper}>
        {columns.map((col, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
            {/* Field Name */}
            <Grid item xs={12} sm={4} md={2}>
              <TextField
                label="Field Name"
                value={col.FieldName}
                onChange={(e) =>
                  handleColumnChange(index, "FieldName", e.target.value)
                }
                fullWidth
                size="small"
                error={errors[index]?.FieldName}
                helperText={
                  errors[index]?.FieldName ? "Field Name is required" : ""
                }
              />
            </Grid>

            {/* Header Name */}
            <Grid item xs={12} sm={4} md={2}>
              <TextField
                label="Header Name"
                value={col.HeaderName}
                onChange={(e) =>
                  handleColumnChange(index, "HeaderName", e.target.value)
                }
                fullWidth
                size="small"
                error={errors[index]?.HeaderName}
                helperText={
                  errors[index]?.HeaderName ? "Header Name is required" : ""
                }
              />
            </Grid>

            {/* Regex */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Regex"
                value={col.regex}
                onChange={(e) =>
                  handleColumnChange(index, "regex", e.target.value)
                }
                fullWidth
                size="small"
              />
            </Grid>

            {/* Column Type */}
            <Grid item xs={6} sm={3} md={2}>
              <FormControl
                fullWidth
                size="small"
                style={{ width: "200px" }}
                error={errors[index]?.ColumnType}
              >
                <InputLabel>Select Type</InputLabel>
                <Select
                  value={col.ColumnType}
                  label="Select Type"
                  onChange={(e) =>
                    handleColumnChange(index, "ColumnType", e.target.value)
                  }
                >
                  <MenuItem value="String">String</MenuItem>
                  <MenuItem value="Number">Number</MenuItem>
                  <MenuItem value="Date">Date</MenuItem>
                </Select>
                {errors[index]?.ColumnType && (
                  <FormHelperText>Column Type is required</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Master */}
            <Grid item xs={6} sm={3} md={2}>
              <FormControl fullWidth size="small" style={{ width: "200px" }}>
                <InputLabel>Select Master</InputLabel>
                <Select
                  value={col.master}
                  label="Select Master"
                  onChange={(e) =>
                    handleColumnChange(index, "master", e.target.value)
                  }
                >
                  <MenuItem value="">
                    <em>Select Option</em>
                  </MenuItem>
                  {masterOptions?.map((opt) => (
                    <MenuItem key={opt.Id} value={opt.Id}>
                      {opt.DisplayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Remove button */}
            {columns.length > 1 && (
              <Grid item>
                <Button onClick={() => handleRemoveColumn(index)}>
                  <Trash2 style={{ color: "#ef5252" }} />
                </Button>
              </Grid>
            )}
          </Grid>
        ))}
      </div>

      {/* Add Column Button */}
      <div style={{ marginTop: "15px" }}>
        <Button
          variant="outlined"
          startIcon={<CirclePlus style={{ color: "rgb(86, 74, 252)" }} />}
          onClick={handleAddColumn}
          sx={{ ml: 2 }}
          style={{ color: "rgb(86, 74, 252)", borderColor: "rgb(86, 74, 252)" }}
        >
          Add Column
        </Button>
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          style={{ backgroundColor: "rgb(86, 74, 252)", color: "white" }}
          className="Btn_saveAll"
        >
          Save All
        </Button>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
          Data saved successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AddSpColum;