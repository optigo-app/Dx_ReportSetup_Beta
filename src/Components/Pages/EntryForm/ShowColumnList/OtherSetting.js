
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
} from "@mui/material";

// Move SlideValueSelector OUTSIDE the parent component
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

              <TextField
                type="text"
                label="Enter formula"
                size="small"
                fullWidth
                value={values[blockNumber]?.Formula || ""}
                onChange={(e) => handleInputChange("Formula", e.target.value)}
              />
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
  Object.entries(selected).forEach(([block, field]) => {
    if (field) {
      result[SLIDE_KEY_MAP[Number(block)]] = [{
        selectedField: field,
        title: values[block]?.Title || "",
        unit: values[block]?.Unit || "",
        formula: values[block]?.Formula || "",
        decimal: values[block]?.DecimalValue || "",
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
  const [firstSlideValues, setFirstSlideValues] = useState({
    1: {},
    2: {},
    3: {},
    4: {},
  });
  const [secondSlideValues, setSecondSlideValues] = useState({
    1: {},
    2: {},
    3: {},
    4: {},
  });

  const [firstSlideSelected, setFirstSlideSelected] = useState({
    1: "",
    2: "",
    3: "",
    4: "",
  });
  const [secondSlideSelected, setSecondSlideSelected] = useState({
    1: "",
    2: "",
    3: "",
    4: "",
  });
  const [otherSettingSnackbarOpen, setOtherSettingSnackbarOpen] =
    useState(false);

  const handleSave = async () => {
    setLoading(true);
    let newErrors = {};
    Object.entries(firstSlideValues).forEach(([block, val]) => {
      if (val.SelectedField && !val.Title?.trim()) {
        newErrors[`F-${block}`] = "Title is required";
      }
    });
    Object.entries(secondSlideValues).forEach(([block, val]) => {
      if (val.SelectedField && !val.Title?.trim()) {
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
      if (firstSlideSelected[block]) {
        spliterData.push({
          SideNumber: 1,
          BlockNumber: Number(block),
          SelectedField: firstSlideSelected[block],
          Title: val.Title || "",
          Unit: val.Unit || "",
          Formula: val.Formula || "",
          DecimalValue: val.DecimalValue || "0",
        });
      }
    });
    Object.entries(secondSlideValues).forEach(([block, val]) => {
      if (secondSlideSelected[block]) {
        spliterData.push({
          SideNumber: 2,
          BlockNumber: Number(block),
          SelectedField: secondSlideSelected[block],
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
                            IPAddress: clientIpAddress
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
    mapSlideData(
      otherSpliterSideData1,
      setFirstSlideSelected,
      setFirstSlideValues
    );
    if (otherSpliterSideData2)
      mapSlideData(
        otherSpliterSideData2,
        setSecondSlideSelected,
        setSecondSlideValues
      );
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
                setFirstSlideSelected((prev) => ({
                  ...prev,
                  [block]: val,
                }))
              }
              columns={spliterReportColum}
              values={firstSlideValues}
              setValues={setFirstSlideValues}
              errors={errors}
              setErrors={setErrors} // Add this
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
                setSecondSlideSelected((prev) => ({
                  ...prev,
                  [block]: val,
                }))
              }
              columns={spliterReportColum}
              values={secondSlideValues}
              setValues={setSecondSlideValues}
              errors={errors}
              setErrors={setErrors} // Add this
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
          }}
        >
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
