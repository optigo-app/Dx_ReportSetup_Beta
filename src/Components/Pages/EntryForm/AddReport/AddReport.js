"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./AddReport.scss";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Grid,
  Typography,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { ArrowLeftFromLine } from "lucide-react";
import { CallApi } from "@/apiList/CallApi";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import LoadingBackdrop from "@/Utils/LoadingBackdrop";

const AddReport = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationSearch = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const [loading, setLoading] = useState(false);
  const existingSp = (() => {
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("addReportSp");
        return raw ? JSON.parse(raw)?.sp : null;
      } catch {
        return null;
      }
    }
    return null;
  })();

  const [formErrors, setFormErrors] = useState({
    ReportName: false,
    spDescription: false,
  });

  const [reportName, setReportName] = useState(existingSp?.ReportName || "");
  const [spName, setSpName] = useState(existingSp?.SpNameR || "");
  const [spDescription, setSpDescription] = useState(
    existingSp?.ReportDescription || ""
  );

  const [spListData, setSpListData] = useState([]);
  const [selectedSp, setSelectedSp] = useState(existingSp?.SpNameR || "");
  const [availableColumns, setAvailableColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const clientIpAddress = typeof window !== "undefined" ? sessionStorage.getItem("clientIpAddress") : null;

  // 🔹 Get SP list
  useEffect(() => {
    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

    const fetchSpList = async () => {
      setLoading(true);
      const bodySpList = {
        con: JSON.stringify({
          id: "",
          mode: "getSpNameList",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress
        }),
        p: "{}",
        f: "DynamicReport ( get sp list )",
      };

      try {
        const response = await CallApi(bodySpList);
        if (response?.rd && Array.isArray(response.rd)) {
          setSpListData(response.rd);
        }
      } catch (error) {
        console.error("Failed to fetch SP list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpList();
  }, []);

  useEffect(() => {
    if (!selectedSp) return;
    const fetchSpColum = async () => {
      setLoading(true);
      let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
      const bodySpList = {
        con: JSON.stringify({
          id: "",
          mode: "getSpFieldList",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress
        }),
        p: JSON.stringify({ Sp_Name: selectedSp }),
        f: "DynamicReport ( get selected sp columns )",
      };

      try {
        const response = await CallApi(bodySpList);
        if (response?.rd && Array.isArray(response.rd)) {
          let cols = response.rd;

          // If edit mode (existingSp)
          if (existingSp?.ReportId) {
            const body = {
              con: JSON.stringify({
                mode: "getReportAndColumnSettings",
                appuserid: AllData?.LUId,
                IPAddress: clientIpAddress
              }),
              p: JSON.stringify({ ReportId: existingSp.ReportId }),
              f: "DynamicReport ( get colum data )",
            };

            const resp = await CallApi(body);
            const rightCols = resp?.rd1 || [];

            // set right side columns
            setSelectedColumns(rightCols);

            // remove right side items from available list
            const filteredAvailable = cols.filter(
              (col) => !rightCols.some((sel) => sel.FieldName === col.FieldName)
            );
            setAvailableColumns(filteredAvailable);
          } else {
            setAvailableColumns(cols);
            setSelectedColumns([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch SP columns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpColum();
  }, [selectedSp, existingSp?.ReportId]);

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      const items =
        source.droppableId === "available"
          ? Array.from(availableColumns)
          : Array.from(selectedColumns);
      const [moved] = items.splice(source.index, 1);
      items.splice(destination.index, 0, moved);

      if (source.droppableId === "available") setAvailableColumns(items);
      else setSelectedColumns(items);
    } else {
      const sourceList =
        source.droppableId === "available"
          ? Array.from(availableColumns)
          : Array.from(selectedColumns);
      const destList =
        destination.droppableId === "available"
          ? Array.from(availableColumns)
          : Array.from(selectedColumns);

      const [movedItem] = sourceList.splice(source.index, 1);
      destList.splice(destination.index, 0, movedItem);

      if (source.droppableId === "available") {
        setAvailableColumns(sourceList);
        setSelectedColumns(destList);
      } else {
        setAvailableColumns(destList);
        setSelectedColumns(sourceList);
      }
    }
  };

  const handleSave = async () => {
    if (!reportName.trim()) {
      setFormErrors((prev) => ({ ...prev, ReportName: true }));
      return;
    } else {
      setFormErrors((prev) => ({ ...prev, ReportName: false }));
    }

    if (selectedColumns.length === 0) {
      alert("Please move at least one column to the Selected list.");
      return;
    }

    const result = selectedColumns.map((col) => ({
      ...col,
      FieldName: col.FieldName,
      HeaderName: col.HeaderName,
      Regex: col.Regex || "",
      ColumnType: col.ColumnType,
      MasterId: col.MasterId ?? "",
      Width: col.Width ?? "",
      IsFilterable: 1,
      IsVisible: 1,
    }));
    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

    const body = {
      con: JSON.stringify({
        mode: "saveReportAndColumns",
        appuserid: AllData?.LUId,
        IPAddress: clientIpAddress
      }),
      p: JSON.stringify({
        ReportId: existingSp?.ReportId || 0,
        ReportName: reportName,
        SpNameR: selectedSp,
        ReportDescription: spDescription,
        Columns: result,
      }),
      f: "DynamicReport ( saveReportAndColumns )",
    };

    try {
      await CallApi(body);
      setOpenSnackbar(true);
      // setTimeout(() => navigate(`/${location.search}`), 1200);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="add_report_columdata">
      <LoadingBackdrop isLoading={loading} />

      <div className="spList_header">
        <Typography variant="h6" className="spList_title">
          Enter Report Details
        </Typography>
        <IconButton onClick={() => router.push(`/${locationSearch}`)}>
          <ArrowLeftFromLine style={{ color: "white" }} />
        </IconButton>
      </div>

      <Grid container spacing={2} sx={{ m: 3 }}>
        <FormControl fullWidth size="small" style={{ width: "300px" }}>
          <InputLabel>Select SP</InputLabel>
          <Select
            value={selectedSp}
            label="Select SP"
            onChange={(e) => setSelectedSp(e.target.value)}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 400,
                  width: 300,
                },
              },
            }}
          >
            <MenuItem value="">
              <em>Select Option</em>
            </MenuItem>

            {spListData?.map((opt) => (
              <MenuItem
                key={opt.SpName}
                value={opt.SpName}
                style={{ fontSize: "14px" }}
              >
                {opt.SpName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Grid item xs={12} md={6}>
          <TextField
            label="Report Name"
            value={reportName}
            onChange={(e) => {
              const v = e.target.value;
              setReportName(v);
              if (v.trim() !== "") {
                setFormErrors((prev) => ({ ...prev, ReportName: false }));
              }
            }}
            fullWidth
            size="small"
            error={formErrors.ReportName}
            helperText={formErrors.ReportName ? "Report Name is required" : ""}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Report Description"
            value={spDescription}
            onChange={(e) => setSpDescription(e.target.value)}
            fullWidth
            size="small"
          />
        </Grid>
      </Grid>

      <p
        style={{
          fontSize: "20px",
          fontWeight: 600,
          margin: "5px 0px 15px 20px ",
        }}
      >
        Columns List
      </p>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: "flex",
            gap: "20px",
            padding: "0 20px",
            height: "64vh",
            overflow: "auto",
          }}
        >
          <Droppable droppableId="available">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  flex: 1,
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  height: "95%",
                  overflow: "auto",
                  padding: "10px",
                  background: "#f8f8f8",
                }}
              >
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Available Columns
                </Typography>
                {availableColumns.map((col, index) => (
                  <Draggable
                    key={col.FieldName}
                    draggableId={col.FieldName}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          userSelect: "none",
                          padding: "8px",
                          margin: "0 0 8px 0",
                          background: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          ...provided.draggableProps.style,
                        }}
                      >
                        {col.FieldName}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* RIGHT SIDE */}
          <Droppable droppableId="selected">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  flex: 1,
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  padding: "10px",
                  background: "#f8f8f8",
                  height: "95%",
                  overflow: "auto",
                }}
              >
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Selected Columns
                </Typography>
                {selectedColumns.map((col, index) => (
                  <Draggable
                    key={col.FieldName}
                    draggableId={`sel-${col.FieldName}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          userSelect: "none",
                          padding: "8px",
                          margin: "0 0 8px 0",
                          background: "#e3f2fd",
                          border: "1px solid #90caf9",
                          borderRadius: "4px",
                          ...provided.draggableProps.style,
                        }}
                      >
                        {col.FieldName}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
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

export default AddReport;
