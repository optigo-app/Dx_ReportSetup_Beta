import {
    Button, TextField, FormControl, InputLabel,
    Select, MenuItem, Checkbox, IconButton
} from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import "./OnReportIframeButton.scss";
import { X } from "lucide-react";

const emptyIframeRow = () => ({
    IframeButtonName: "",
    IframeLableId: "",
    IframeWidth: "300",
    IframeHeight: "300",
    IsRedirectButton: true,
    DisableCheckboxSelection: true,
});

const OnReportIframeButton = ({
    spData,
    redirectionMaster,
    currentReportIframeButton,
    currentIframeDataArray,
    onChange
}) => {
    const [checked, setChecked] = useState(false);
    const [rows, setRows] = useState([emptyIframeRow()]);

    // Only used to avoid re-parsing props on every render when nothing
    // actually changed (reference-only changes from the parent).
    const lastSyncedPropsRef = useRef(null);

    // One-time (or source-change) sync FROM props INTO local state.
    // This effect NEVER calls onChange, so it can't create a cycle.
    useEffect(() => {
        const isOn = currentReportIframeButton ?? spData?.ReportIframeButton;
        const arr = currentIframeDataArray ?? spData?.IframeDataArray;

        const propsSignature = JSON.stringify({ isOn: !!isOn, arr });
        if (propsSignature === lastSyncedPropsRef.current) {
            return;
        }
        lastSyncedPropsRef.current = propsSignature;

        setChecked(!!isOn);

        if (!arr) {
            setRows([emptyIframeRow()]);
            return;
        }

        try {
            const parsed = typeof arr === "string" ? JSON.parse(arr) : arr;

            if (Array.isArray(parsed) && parsed.length > 0) {
                setRows(parsed.map((item) => ({
                    IframeButtonName: item.IframeButtonName || item.buttonName || "",
                    IframeLableId: item.IframeLableId || item.IframeTypeId || "",
                    IframeWidth: item.IframeWidth ?? "300",
                    IframeHeight: item.IframeHeight ?? "300",
                    IsRedirectButton: item.IsRedirectButton ?? true,
                    DisableCheckboxSelection: item.DisableCheckboxSelection ?? true,
                })));
            } else {
                setRows([emptyIframeRow()]);
            }
        } catch {
            setRows([emptyIframeRow()]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentReportIframeButton, currentIframeDataArray, spData]);

    // Helper: notify parent with an explicit, freshly computed payload.
    // Called ONLY from user-driven handlers below — never from an effect.
    const notifyParent = (nextChecked, nextRows) => {
        if (!onChange) return;
        onChange({
            ReportIframeButton: nextChecked ? 1 : 0,
            IframeDataArray: nextChecked ? nextRows : []
        });
    };

    const handleCheckbox = (e) => {
        const value = e.target.checked;
        setChecked(value);
        notifyParent(value, rows);
    };

    const handleChange = (index, field, value) => {
        setRows((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            notifyParent(checked, updated);
            return updated;
        });
    };

    const addMore = () => {
        setRows((prev) => {
            const updated = [...prev, emptyIframeRow()];
            notifyParent(checked, updated);
            return updated;
        });
    };

    const removeRow = (index) => {
        setRows((prev) => {
            const filtered = prev.filter((_, i) => i !== index);
            const updated = filtered.length === 0 ? [emptyIframeRow()] : filtered;
            notifyParent(checked, updated);
            return updated;
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
                    {rows?.map((row, index) => (
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

                            <TextField
                                label="Width"
                                type="number"
                                value={row.IframeWidth}
                                onChange={(e) => handleChange(index, "IframeWidth", e.target.value)}
                                sx={{ '& .MuiInputBase-root': { height: 40 }, width: 90 }}
                            />

                            <TextField
                                label="Height"
                                type="number"
                                value={row.IframeHeight}
                                onChange={(e) => handleChange(index, "IframeHeight", e.target.value)}
                                sx={{ '& .MuiInputBase-root': { height: 40 }, width: 90 }}
                            />

                            <label style={{ display: "flex", alignItems: "center", fontSize: 13 }}>
                                <Checkbox
                                    size="small"
                                    checked={!!row.IsRedirectButton}
                                    onChange={(e) => handleChange(index, "IsRedirectButton", e.target.checked)}
                                />
                                Redirect Button
                            </label>

                            <label style={{ display: "flex", alignItems: "center", fontSize: 13 }}>
                                <Checkbox
                                    size="small"
                                    checked={!!row.DisableCheckboxSelection}
                                    onChange={(e) => handleChange(index, "DisableCheckboxSelection", e.target.checked)}
                                />
                                Disable Checkbox
                            </label>

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