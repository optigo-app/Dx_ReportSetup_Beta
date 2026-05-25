import {
    Button, TextField, FormControl, InputLabel,
    Select, MenuItem, Checkbox, IconButton
} from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import "./SwitchtoReportFunctionality.scss";
import { X } from "lucide-react";

const SwitchtoReportFunctionality = ({
    spData,
    redirectionMaster,
    currentIsMultiTab,
    currentMultiTabDataArray,
    onChange
}) => {
    const [checked, setChecked] = useState(false);
    const [rows, setRows] = useState([{ TabTitle: "", RouteId: "" }]);
    const isFirstRender = useRef(true);

    // Single unified useEffect for initializing state
    useEffect(() => {
        const isMultiTab = currentIsMultiTab ?? spData?.IsMultiTab;
        setChecked(!!isMultiTab);

        const tabData = currentMultiTabDataArray ?? spData?.MultiTabDataArray;

        if (!tabData) {
            setRows([{ TabTitle: "", RouteId: "" }]);
            return;
        }

        try {
            const parsed = typeof tabData === "string" ? JSON.parse(tabData) : tabData;

            if (Array.isArray(parsed) && parsed.length > 0) {
                setRows(parsed.map((item) => ({
                    TabTitle: item.TabTitle || item.buttonName || "",
                    RouteId: item.RouteId || item.IframeTypeId || ""
                })));
            } else {
                setRows([{ TabTitle: "", RouteId: "" }]);
            }
        } catch {
            setRows([{ TabTitle: "", RouteId: "" }]);
        }
    }, [currentIsMultiTab, currentMultiTabDataArray, spData]);

    // Notify parent — skip on first render to avoid overwriting parent state
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (!onChange) return;
        onChange({
            IsMultiTab: checked,
            MultiTabDataArray: checked ? rows : []
        });
    }, [checked, rows]);

    const handleCheckbox = (e) => setChecked(e.target.checked);

    const handleChange = (index, field, value) => {
        setRows((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addMore = () => setRows((prev) => [...prev, { TabTitle: "", RouteId: "" }]);

    const removeRow = (index) => {
        setRows((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            return updated.length === 0 ? [{ TabTitle: "", RouteId: "" }] : updated;
        });
    };

    return (
        <div className="iframeButtonContainer">
            <label style={{ width: "fit-content", display: "flex", alignItems: "center", cursor: "pointer" }}>
                <span className="chekbox_title_value">Switch to Report Functionality</span>
                <Checkbox
                    checked={checked}
                    onChange={handleCheckbox}
                    style={{ margin: "0px", padding: "4px 4px 4px 8px" }}
                />
            </label>

            {checked && (
                <div className="bottomPanel">
                    {rows.map((row, index) => (
                        <div className="row" key={index}>
                            <TextField
                                label="Button Name"
                                value={row.TabTitle}
                                onChange={(e) => handleChange(index, "TabTitle", e.target.value)}
                                sx={{ '& .MuiInputBase-root': { height: 40 } }}
                            />
                            <FormControl size="small">
                                <InputLabel>Select Iframe</InputLabel>
                                <Select
                                    value={row.RouteId}
                                    label="Select Iframe"
                                    onChange={(e) => handleChange(index, "RouteId", e.target.value)}
                                    sx={{ width: 200 }}
                                >
                                    <MenuItem value="">--Select--</MenuItem>
                                    {redirectionMaster?.rd2?.map((item) => (
                                        <MenuItem key={item.RouteId} value={item.RouteId}>
                                            {item.RouteName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <IconButton onClick={() => removeRow(index)} size="small" sx={{ height: 40, width: 40, ml: 1 }}>
                                <X size={18} />
                            </IconButton>
                        </div>
                    ))}
                    <Button variant="outlined" onClick={addMore} className="addMoreBtn">
                        Add More
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SwitchtoReportFunctionality;