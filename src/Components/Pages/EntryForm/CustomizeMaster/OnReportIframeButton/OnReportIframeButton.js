import {
    Button, TextField, FormControl, InputLabel,
    Select, MenuItem, Checkbox, IconButton
} from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import "./OnReportIframeButton.scss";
import { X } from "lucide-react";

const OnReportIframeButton = ({
    spData,
    redirectionMaster,
    currentReportIframeButton,
    currentIframeDataArray,
    onChange
}) => {
    const [checked, setChecked] = useState(false);
    const [rows, setRows] = useState([{ IframeButtonName: "", IframeLableId: "" }]);
    const isFirstRender = useRef(true);

    // Single unified useEffect for initializing state
    useEffect(() => {
        const isOn = currentReportIframeButton ?? spData?.ReportIframeButton;
        setChecked(!!isOn);

        const arr = currentIframeDataArray ?? spData?.IframeDataArray;

        if (!arr) {
            setRows([{ IframeButtonName: "", IframeLableId: "" }]);
            return;
        }

        try {
            const parsed = typeof arr === "string" ? JSON.parse(arr) : arr;

            if (Array.isArray(parsed) && parsed.length > 0) {
                setRows(parsed.map((item) => ({
                    IframeButtonName: item.IframeButtonName || item.buttonName || "",
                    IframeLableId: item.IframeLableId || item.IframeTypeId || ""
                })));
            } else {
                setRows([{ IframeButtonName: "", IframeLableId: "" }]);
            }
        } catch {
            setRows([{ IframeButtonName: "", IframeLableId: "" }]);
        }
    }, [currentReportIframeButton, currentIframeDataArray, spData]);

    // Notify parent — skip on first render to avoid overwriting parent state
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (!onChange) return;
        onChange({
            ReportIframeButton: checked ? 1 : 0,
            IframeDataArray: checked ? rows : []
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

    const addMore = () => setRows((prev) => [...prev, { IframeButtonName: "", IframeLableId: "" }]);

    const removeRow = (index) => {
        setRows((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            return updated.length === 0 ? [{ IframeButtonName: "", IframeLableId: "" }] : updated;
        });
    };

    return (
        <div className="iframeButtonContainer">
            <label style={{ width: "fit-content", display: "flex", alignItems: "center", cursor: "pointer" }}>
                <span className="chekbox_title_value">Add On Report Iframe Button</span>
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
                                value={row.IframeButtonName}
                                onChange={(e) => handleChange(index, "IframeButtonName", e.target.value)}
                                sx={{ '& .MuiInputBase-root': { height: 40 } }}
                            />
                            <FormControl size="small">
                                <InputLabel>Select Iframe</InputLabel>
                                <Select
                                    value={row.IframeLableId}
                                    label="Select Iframe"
                                    onChange={(e) => handleChange(index, "IframeLableId", e.target.value)}
                                    sx={{ width: 150 }}
                                >
                                    <MenuItem value="">--Select--</MenuItem>
                                    {redirectionMaster?.rd?.map((item) => (
                                        <MenuItem
                                            key={item.IframeLableId ?? item.IframeTypeId}
                                            value={item.IframeLableId ?? item.IframeTypeId}
                                        >
                                            {item.PopupTitle}
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

export default OnReportIframeButton;