
"use client";

import React, {
  useEffect,
  useState,
} from "react";
import "./ShowColumnList.scss";
import {
  IconButton,
  Typography,
  Checkbox,
  Button,
  Dialog,
  Snackbar,
  Alert,
  TextField,
  Grid,
  Modal,
  Box,
} from "@mui/material";
import { ArrowLeftFromLine, CheckCircle } from "lucide-react";
import CustomizeColum from "../CustomizeColum/CustomizeColum";
import CustomizeMaster from "../CustomizeMaster/CustomizeMaster";
import { CallApi } from "@/apiList/CallApi";
import LoadingBackdrop from "@/Utils/LoadingBackdrop";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import OtherSetting from "./OtherSetting";
import SpliterReport from "./SpliterReport";
import LargeData from "./LargeData";
import { useRouter, useSearchParams } from "next/navigation";
import { payloadToFormulas } from "../FormulaBaseSummary/FormulaBaseSummary";

const style = {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95%",
  bgcolor: "background.paper",
  border: "none",
  outline: "none",
  boxShadow: 24,
  borderRadius: 1,
  padding: "10px 10px 20px 20px",
};

const ShowColumnList = () => {
  const navigate = useRouter();
  const location = useSearchParams();
  const reportId = Number(location.get("reportId")) || null;
  const [spData, setSpData] = useState(null);
  const [selectedCols, setSelectedCols] = useState(["Master Setting"]);
  const [allDateOptions, setAllDateOptions] = useState([]);
  const [allDateOptionsShow, setAllDateOptionsShow] = useState(false);
  const [selectedDateOptions, setSelectedDateOptions] = useState([]); // selected frames
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [customizedStatus, setCustomizedStatus] = useState({});
  const [snackbarUpdateRecodeOpen, setsnackbarUpdateRecodeOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);
  const [largestLength, setLargestLength] = useState("");
  const [spliterMonthCont, setSpliterMonthCont] = useState("");
  const [spliterTopFilterDropDown, setSpliterTopFilterDropDown] = useState("");
  const [largeDataColum, setLargeDataColum] = useState();
  const [spliterReportColum, setSpliterReportColum] = useState();
  const [allPrintData, setAllPrintData] = useState();
  const [loading, setLoading] = useState(false);
  const [spliterFirst, setSpliterFirst] = useState(null);
  const [spliterSecond, setSpliterSecond] = useState(null);
  const [spliterSecondPanelSecondData, setSpliterSecondPanelSecondData] = useState(null);
  const [otherSpliterSideData1, setOtherSpliterSideData1] = useState();
  const [otherSpliterSideData2, setOtherSpliterSideData2] = useState();
  const [iframeMaster, setIframeMaster] = useState();
  const [formulaList, setFormulaList] = useState([]);
  const [isFormulaBasedSummary, setIsFormulaBasedSummary] = useState(false);
  const clientIpAddress = typeof window !== "undefined" ? sessionStorage.getItem("clientIpAddress") : null;
  useEffect(() => {
    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
    const getLargeColumData = async () => {
      const body = {
        con: JSON.stringify({
          mode: "getOtherSettings",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify({ ReportId: reportId }),
        f: "DynamicReport (get Largedata data)",
      };
      try {
        const response = await CallApi(body);
        if (response) {
          setAllDateOptions(response?.rd || []);
          setLargeDataColum(response?.rd1);
          const activeIds = response.rd2
            .filter((item) => item.IsOn)
            .map((item) => item.DateFrameId);
          setSelectedDateOptions(activeIds);
          setSpliterReportColum(response?.rd3);
          setAllPrintData(response?.rd4);
        }
      } catch (err) {
        console.error("Failed fetching report settings", err);
      }
    };

    const getIframeMaster = async () => {
      const body = {
        con: JSON.stringify({
          mode: "getRedirectMaster",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify({ ReportId: reportId }),
        f: "DynamicReport (get Largedata data)",
      };
      try {
        const response = await CallApi(body);
        if (response) {
          setIframeMaster(response);
        }
      } catch (err) {
        console.error("Failed fetching report settings", err);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      if (!reportId) return;

      const body = {
        con: JSON.stringify({
          mode: "getReportAndColumnSettings",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify({ ReportId: reportId }),
        f: "DynamicReport (get colum data)",
      };

      try {
        const response = await CallApi(body);
        if (response?.rd && response.rd.length > 0) {
          const rdData = response.rd[0];

          const sortedResult = (response.rd1 || []).slice().sort((a, b) => {
            const da = a.DisplayOrder;
            const db = b.DisplayOrder;
            if (da == null && db == null) return 0;
            if (da == null) return 1;
            if (db == null) return -1;
            return da - db;
          });
          setSpData({
            ...rdData,
            master: response?.rd2,
            result: sortedResult,
          });

          if (rdData?.SummaryFormulaArray) {
            setFormulaList(payloadToFormulas(rdData.SummaryFormulaArray));
          }
          setIsFormulaBasedSummary(!!rdData?.IsFormulaBasedSummary);

          setSpliterFirst(rdData?.SpliterFirstPanel || null);
          setSpliterSecond(rdData?.SpliterSecondPanel || null);
          setSpliterSecondPanelSecondData(rdData?.SpliterSecondPanelSecondData || null);
          setOtherSpliterSideData1(
            JSON.parse(rdData?.otherSpliterSideData1) || null
          );
          setOtherSpliterSideData2(
            JSON.parse(rdData?.otherSpliterSideData2) || null
          );
        }

        if (response?.rd1 && response.rd1.length > 0) {
          const sortedRd1 = [...response.rd1].sort(
            (a, b) => (a.DisplayOrder || 0) - (b.DisplayOrder || 0)
          );
          setSpData((prev) => ({ ...prev, result: sortedRd1 }));
          const visibleCols = sortedRd1.filter((c) => c.IsVisible === true);

          let initialSelected = [
            "Master Setting",
            ...visibleCols.map((c) => c.HeaderName),
          ];

          if (response?.rd[0]?.IsLargeDataReport) {
            initialSelected.push("Largest Data Report");
            if (response?.rd[0]?.LargeDataCount) {
              setLargestLength(response.rd[0].LargeDataCount.toString());
            }
          }

          if (response?.rd[0]?.IsSpliterReport) {
            initialSelected.push("Spliter Report");
            if (response?.rd[0]?.DateMonthRestriction) {
              setSpliterMonthCont(
                response.rd[0].DateMonthRestriction.toString()
              );
            }
          }

          if (response?.rd[0]?.IsSpliterReport) {
            initialSelected.push("Spliter Report");
            if (response?.rd[0]?.SpliterFirstPanelFilter) {
              setSpliterTopFilterDropDown(
                response.rd[0].SpliterFirstPanelFilter
              );
            }
          }



          if (response?.rd[0]?.SpliterFirstPanelAll) {
            initialSelected.push("SpliterFirstPanelAll");
          }

          if (response?.rd[0]?.SpliterSecondPanelAll) {
            initialSelected.push("SpliterSecondPanelAll");
          }

          if (response?.rd[0]?.SpliterSecondPanelSecondData) {
            initialSelected.push("SpliterSecondPanelSecondData");
          }

          if (response?.rd[0]?.SpliterReportAllDataButton) {
            initialSelected.push("SpliterReportAllDataButton");
          }

          setAllDateOptionsShow(response?.rd[0]?.ServerSideDateWiseFilter);
          setSelectedCols(initialSelected);

          let statusMap = { "Master Setting": false };
          visibleCols.forEach((c) => {
            statusMap[c.HeaderName] = true;
          });
          setCustomizedStatus(statusMap);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed fetching report settings", err);
      }
    };

    getIframeMaster();
    getLargeColumData();
    fetchData();
  }, [reportId]);

  const handleToggleFilterOption = async () => {
    const newVal = !allDateOptionsShow;
    setAllDateOptionsShow(newVal);
    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

    try {
      const body = {
        con: JSON.stringify({
          mode: "updateDateFrameSettingsReportWise",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify({
          ReportId: reportId,
          ServerSideDateWiseFilter: newVal,
        }),
        f: "DynamicReport ( get sp list )",
      };
      await CallApi(body);
    } catch (err) {
      console.error("Failed to update filter setting", err);
    }
  };

  const handleDateOptionChange = (dateFrameId) => {
    setSelectedDateOptions((prev) =>
      prev.includes(dateFrameId)
        ? prev.filter((id) => id !== dateFrameId)
        : [...prev, dateFrameId]
    );
  };

  const handleFirstSelect = (colId) => {
    setSpliterFirst((prev) => (prev === colId ? null : colId));
  };

  const handleSecondSelect = (colId) => {
    setSpliterSecond((prev) => (prev === colId ? null : colId));
  };

  const handleSecondPanelSecondValue = (colId) => {
    setSpliterSecondPanelSecondData((prev) => (prev === colId ? null : colId));
  };

  const handleCheckboxChange = (label) => {
    setSelectedCols((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  };

  const handleSaveAll = async () => {
    if (!spData?.ReportId || !spData?.result) return;
    try {
      const updatedCols = spData.result.map((col) => ({
        ColId: col.ColId,
        IsVisible: selectedCols.includes(col.HeaderName) ? 1 : 0,
      }));
      let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

      const visibilityBody = {
        con: JSON.stringify({
          mode: "updateColumnVisibility",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify({
          ReportId: spData.ReportId,
          IsLargeDataReport: selectedCols.includes("Largest Data Report"),
          Columns: updatedCols,
        }),
        f: "DynamicReport ( bulk update column visibility )",
      };
      const payload = {
        ReportId: reportId,
        Columns: allDateOptions.map((item) => ({
          DateFrameId: item.DateFrameId,
          IsOn: selectedDateOptions.includes(item.DateFrameId),
        })),
      };
      const body = {
        con: JSON.stringify({
          mode: "saveDateFrameSettings",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify(payload),
        f: "DynamicReport ( saveDateFrameSettings )",
      };

      await CallApi(visibilityBody);
      await CallApi(body);
      if (selectedCols.includes("Largest Data Report")) {
        if (!largestLength || Number(largestLength) <= 0) {
          alert(
            "Please enter a valid length before saving Largest Data Report."
          );
          return;
        }

        const largeDataBody = {
          con: JSON.stringify({
            mode: "updateLargeDataSettings",
            appuserid: AllData?.LUId,
            IPAddress: clientIpAddress,
          }),
          p: JSON.stringify({
            ReportId: spData?.ReportId,
            LargeDataCount: Number(largestLength),
            Columns: largeDataColum.map((col) => ({
              ColId: col.ColId,
              IsLargeDataGroup: col.IsLargeDataGroup ? 1 : 0,
              DateTimeFrame: col.DateTimeFrame || 0,
            })),
          }),
          f: "DynamicReport ( update large data settings )",
        };

        await CallApi(largeDataBody);
      }

      if (selectedCols.includes("Spliter Report")) {
        if (!spliterMonthCont || Number(spliterMonthCont) <= 0) {
          alert("Please Enter Month Restiction Before Saving Spliter Report.");
          return;
        }
      }

      const spliterDataBody = {
        con: JSON.stringify({
          mode: "updateSpliterReportSettings",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify({
          ReportId: spData?.ReportId,
          IsSpliterReport: selectedCols.includes("Spliter Report") ? 1 : 0,
          SpliterFirstPanelAll: selectedCols.includes("SpliterFirstPanelAll") ? 1 : 0,
          SpliterSecondPanelAll: selectedCols.includes("SpliterSecondPanelAll") ? 1 : 0,
          SpliterReportAllDataButton: selectedCols.includes("SpliterReportAllDataButton") ? 1 : 0,
          SpliterFirstPanel: spliterFirst || "",
          SpliterSecondPanel: spliterSecond || "",
          SpliterSecondPanelSecondData: spliterSecondPanelSecondData || "",
          DateMonthRestriction: spliterMonthCont,
          DateMonthRestriction: spliterMonthCont,
          SpliterFirstPanelFilter: spliterTopFilterDropDown
        }),
        f: "DynamicReport ( update large data settings )",
      };

      await CallApi(spliterDataBody);
      setSnackbarOpen(true);
      // setTimeout(() => {
      //   navigate(`/${location.search}`);
      // }, 1500);
      setTimeout(() => {
        setSnackbarOpen(false);
      }, 3000);
    } catch (err) {
      console.error("❌ Failed to save settings", err);
      setSnackbarError(true);
    }
  };

  const mapSpColToInitial = (col) => ({
    colid: col.id?.toString() || "",
    headerName: col.headerName || "",
    field: col.fieldName || "",
    Width: col.length ? String(col.length) : "",
    dataType: col.dataType || "",
    regex: col.regex || "",
    master: col.master || "",
    __original: col,
  });

  const openMasterCustomize = () => {
    setActiveItem({
      kind: "master",
      title: "Master Setting",
      initialData: spData,
      spId: spData?.ReportId,
    });
    setEditorOpen(true);
  };

  const openColCustomize = (col) => {
    setActiveItem({
      kind: "column",
      title: col.HeaderName || "Column",
      initialData: mapSpColToInitial(col),
      spId: spData?.ReportId,
    });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setTimeout(() => {
      setActiveItem(null);
    }, 1000);
  };

  const fieldErrors = selectedCols?.filter((col) => !customizedStatus[col]);

  // const handleDragEnd = async (result) => {
  //   if (!result.destination) return;
  //   const reordered = Array.from(spData.result);
  //   const [movedItem] = reordered.splice(result.source.index, 1);
  //   reordered.splice(result.destination.index, 0, movedItem);
  //   reordered.forEach((col, index) => {
  //     col.DisplayOrder = index + 1;
  //   });
  //   setSpData((prev) => ({ ...prev, result: reordered }));
  //   const payload = {
  //     ReportId: spData?.ReportId,
  //     Columns: reordered.map((col) => ({
  //       ColId: col.ColId,
  //       IsVisible: col.IsVisible ? 1 : 0,
  //       DisplayOrder: col.DisplayOrder,
  //     })),
  //   };
  //   let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
  //   const body = {
  //     con: JSON.stringify({
  //       mode: "updateDisplayOrderSettings",
  //       appuserid: AllData?.LUId,
  //       IPAddress: clientIpAddress,
  //     }),
  //     p: JSON.stringify(payload),
  //     f: "DynamicReport (update display order test)",
  //   };

  //   try {
  //     await CallApi(body);
  //   } catch (err) {
  //     console.error("Failed to save display order", err);
  //   }
  // };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    setSpData((prev) => {
      const items = [...prev.result];

      const [movedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, movedItem);

      const updatedItems = items.map((item, index) => ({
        ...item,
        DisplayOrder: index + 1,
      }));
      saveDisplayOrder(prev.ReportId, updatedItems);

      return {
        ...prev,
        result: updatedItems,
      };
    });
  };

  const saveDisplayOrder = async (reportId, updatedItems) => {
    const payload = {
      ReportId: reportId,
      Columns: updatedItems.map((col) => ({
        ColId: col.ColId,
        IsVisible: col.IsVisible ? 1 : 0,
        DisplayOrder: col.DisplayOrder,
      })),
    };

    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

    const body = {
      con: JSON.stringify({
        mode: "updateDisplayOrderSettings",
        appuserid: AllData?.LUId,
        IPAddress: clientIpAddress,
      }),
      p: JSON.stringify(payload),
      f: "DynamicReport (update display order test)",
    };

    try {
      await CallApi(body);
    } catch (err) {
      console.error("Failed to save display order", err);
    }
  };

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <LoadingBackdrop isLoading={loading} />
      <div className="colum_customize_main">
        <div className="spList_header">
          <Typography variant="h6" className="spList_title">
            {spData?.ReportName}
          </Typography>
          <IconButton onClick={() => {
            const params = new URLSearchParams(location.toString());
            console.log('params: ', params?.toString());
            params.delete("reportId");
            const backSearch = params.toString() ? `?${params.toString()}` : "";
            navigate.push(`/${backSearch}`);
          }}>
            <ArrowLeftFromLine style={{ color: "white" }} />
          </IconButton>
        </div>
        {!loading && (
          <div className="customize_panels_wrapper">
            <div className="customize_body">
              <div className="panel_header">Columns</div>
              <div className="panel_scroll">
                {spData?.result?.length !== 0 ? (
                  <>
                    <div className="column_list">
                      <div className={`column_row master_row${editorOpen && activeItem?.kind === "master" ? " active_row" : ""}`}>
                        <Checkbox
                          checked={selectedCols.includes("Master Setting")}
                          disabled
                        />

                        <Typography className="column_label">
                          Report Options
                        </Typography>

                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={openMasterCustomize}
                            style={{
                              marginLeft: "auto",
                              color: "rgb(86, 74, 252)",
                              borderColor: "rgb(86, 74, 252)",
                            }}
                            className="Btn_Customize"
                          >
                            Customize
                          </Button>
                        </>
                      </div>

                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="droppableColumns">
                          {(provided) => {
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="droppable-columns"
                              >
                                {spData?.result
                                  ?.slice()
                                  ?.sort((a, b) => {
                                    const da = a.DisplayOrder;
                                    const db = b.DisplayOrder;
                                    if (da == null && db == null) return 0;
                                    if (da == null) return 1;
                                    if (db == null) return -1;
                                    return da - db;
                                  })
                                  ?.map((col, index) => {
                                    const label = col.HeaderName;
                                    const isChecked =
                                      selectedCols.includes(label);

                                    return (
                                      <Draggable
                                        key={col.ColId}
                                        draggableId={col.ColId.toString()}
                                        index={index}
                                      >
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`column_row ${snapshot.isDragging ? "dragging" : ""} ${editorOpen && activeItem?.initialData?.ColId === col.ColId ? "active_row" : ""}`}
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              background: snapshot.isDragging ? "#f1f1ff" : undefined,
                                              borderRadius: "6px",
                                              padding: "6px 10px",
                                              marginBottom: "6px",
                                              ...provided.draggableProps.style,
                                            }}
                                          >
                                            <Checkbox
                                              checked={isChecked}
                                              onChange={() =>
                                                handleCheckboxChange(label)
                                              }
                                            />
                                            <Typography className="column_label">
                                              {col.HeaderName}
                                              {/* - {col?.DisplayOrder} */}
                                            </Typography>
                                            {isChecked && (
                                              <>
                                                <Button
                                                  variant="outlined"
                                                  size="small"
                                                  onClick={() =>
                                                    openColCustomize(col)
                                                  }
                                                  style={{
                                                    marginLeft: "auto",
                                                    color: "rgb(86, 74, 252)",
                                                    borderColor:
                                                      "rgb(86, 74, 252)",
                                                  }}
                                                  className="Btn_Customize"
                                                >
                                                  Customize
                                                </Button>
                                              </>
                                            )}
                                          </div>
                                        )}
                                      </Draggable>
                                    );
                                  })}
                                {provided.placeholder}
                              </div>
                            );
                          }}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  </>
                ) : (
                  <Typography
                    variant="body1"
                    style={{ margin: "20px", color: "gray" }}
                  >
                    No SP Data Found
                  </Typography>
                )}
              </div>
            </div>
            {editorOpen ? (
              <div className="editor_panel">
                <div className="panel_header editor_panel_header">
                  <IconButton size="small" onClick={closeEditor} sx={{ mr: 1, p: "3px" }}>
                    <ArrowLeftFromLine size={16} />
                  </IconButton>
                  <span>
                    {activeItem?.kind === "master" ? "Report Options" : `Customize: ${activeItem?.title || ""}`}
                  </span>
                </div>
                <div className="panel_scroll">
                  {activeItem?.kind === "master" ? (
                    <CustomizeMaster
                      initialData={spData.master}
                      spId={activeItem.spId}
                      onClose={closeEditor}
                      onSave={(savedData) => {
                        setSpData((prev) => ({
                          ...prev,
                          master: [{
                            ...(prev.master?.[0] || {}),
                            ...savedData.masterSettings,
                            ReportIframeButton: savedData.masterSettings.ReportIframeButton,
                            IframeDataArray: savedData.masterSettings.IframeDataArray,
                            IsMultiTab: savedData.masterSettings.IsMultiTab,
                            MultiTabDataArray: savedData.masterSettings.MultiTabDataArray,
                          }],
                          PrintDataArray: savedData.printViewData,
                          ImageDataArray: savedData.imageViewData,
                          PrintMasterName: savedData.printMasterName,
                          SvgIconFilter: savedData.masterSettings.SvgIconFilter,
                        }));
                        setsnackbarUpdateRecodeOpen(true);
                        setTimeout(() => setsnackbarUpdateRecodeOpen(false), 3000);
                      }}
                      spData={spData}
                      redirectionMaster={iframeMaster}
                      allPrintData={allPrintData}
                      formulaList={formulaList}
                      isFormulaBasedSummary={isFormulaBasedSummary}
                    />
                  ) : activeItem?.kind === "column" ? (
                    <CustomizeColum
                      selectedColumn={activeItem.initialData}
                      spId={activeItem.spId}
                      onClose={closeEditor}
                      allColumData={spData?.result}
                      redirectionMaster={iframeMaster}
                      masterData={spData}
                      onSave={(updatedColumn) => {
                        const newResult = spData.result.map((col) =>
                          col.ColId === updatedColumn.ColId ? { ...col, ...updatedColumn } : col
                        );
                        setSpData((prev) => ({ ...prev, result: newResult }));
                        setSelectedCols((prev) =>
                          prev.includes(updatedColumn.HeaderName) ? prev : [...prev, updatedColumn.HeaderName]
                        );
                        setsnackbarUpdateRecodeOpen(true);
                        setTimeout(() => {
                          setsnackbarUpdateRecodeOpen(false);
                        }, 3000);
                      }}
                      customizeMasterGroupCheckBox={spData?.GroupCheckBox}
                      formulaList={formulaList}
                      setFormulaList={setFormulaList}
                      isFormulaBasedSummary={isFormulaBasedSummary}
                      setIsFormulaBasedSummary={setIsFormulaBasedSummary}
                    />
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                <LargeData
                  selectedCols={selectedCols}
                  handleCheckboxChange={handleCheckboxChange}
                  largestLength={largestLength}
                  handleDateOptionChange={handleDateOptionChange}
                  setLargestLength={setLargestLength}
                  spliterMonthCont={spliterMonthCont}
                  setSpliterMonthCont={setSpliterMonthCont}
                  largeDataColum={largeDataColum}
                  spliterFirst={spliterFirst}
                  setLargeDataColum={setLargeDataColum}
                  handleSecondSelect={handleSecondSelect}
                  handleFirstSelect={handleFirstSelect}
                  spliterSecond={spliterSecond}
                  handleOpen={handleOpen}
                  allDateOptionsShow={allDateOptionsShow}
                  handleToggleFilterOption={handleToggleFilterOption}
                  allDateOptions={allDateOptions}
                  selectedDateOptions={selectedDateOptions}
                />
                <SpliterReport
                  selectedCols={selectedCols}
                  handleCheckboxChange={handleCheckboxChange}
                  largestLength={largestLength}
                  handleDateOptionChange={handleDateOptionChange}
                  setLargestLength={setLargestLength}
                  spliterMonthCont={spliterMonthCont}
                  setSpliterMonthCont={setSpliterMonthCont}
                  setSpliterTopFilterDropDown={setSpliterTopFilterDropDown}
                  spliterTopFilterDropDown={spliterTopFilterDropDown}
                  largeDataColum={largeDataColum}
                  spliterFirst={spliterFirst}
                  setLargeDataColum={setLargeDataColum}
                  handleSecondSelect={handleSecondSelect}
                  handleSecondPanelSecondValue={handleSecondPanelSecondValue}
                  handleFirstSelect={handleFirstSelect}
                  spliterSecond={spliterSecond}
                  spliterSecondPanelSecondData={spliterSecondPanelSecondData}
                  handleOpen={handleOpen}
                  allDateOptionsShow={allDateOptionsShow}
                  handleToggleFilterOption={handleToggleFilterOption}
                  allDateOptions={allDateOptions}
                  selectedDateOptions={selectedDateOptions}
                />
              </>
            )}
          </div>
        )}
        {!loading && (
          <div className="save_section">
            <Button
              variant="contained"
              onClick={handleSaveAll}
              style={{ backgroundColor: "rgb(86, 74, 252)", color: "white" }}
              className="Btn_saveColumList"
            >
              Save
            </Button>
          </div>
        )}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={1200}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="success" sx={{ width: "100%" }}>
            Column setting saved successfully.
          </Alert>
        </Snackbar>

        <Snackbar
          open={snackbarUpdateRecodeOpen}
          autoHideDuration={1200}
          onClose={() => setsnackbarUpdateRecodeOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="success" sx={{ width: "100%" }}>
            Record Update Successfully.
          </Alert>
        </Snackbar>

        <Snackbar
          open={snackbarError}
          autoHideDuration={3000}
          onClose={() => setSnackbarError(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="error" sx={{ width: "100%" }}>
            {"Please Edit Compulsory Fields Before Saving:\n" +
              fieldErrors?.join(", ")}
          </Alert>
        </Snackbar>
        <Modal open={open} onClose={handleClose}>
          <Box sx={style}>
            <LoadingBackdrop isLoading={loading} />
            <OtherSetting
              setLoading={setLoading}
              spData={spData}
              otherSpliterSideData1={otherSpliterSideData1}
              otherSpliterSideData2={otherSpliterSideData2}
              spliterReportColum={spliterReportColum}
              setOpen={setOpen}
              setOtherSpliterSideData1={setOtherSpliterSideData1}
              setOtherSpliterSideData2={setOtherSpliterSideData2}
            />
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default ShowColumnList;