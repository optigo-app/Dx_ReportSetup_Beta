import React, { useState } from "react";
import {
    Box,
    Button,
    Divider,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { X, Plus, Trash2 } from "lucide-react";
const createEmptyRow = () => ({
    lable: "",
    value: "",
    fontsizel: "",
    fontsizev: "",
    fontweightl: "",
    fontweightv: "",
    displayorder: "",
});

// ── Font weight options ────────────────────────────────────────────────────────
const FONT_WEIGHTS = [
    { label: "Normal", value: "400" },
    { label: "Medium", value: "500" },
    { label: "Semi Bold", value: "600" },
    { label: "Bold", value: "700" },
    { label: "Extra Bold", value: "800" },
];

// ── Styles ────────────────────────────────────────────────────────────────────
const labelStyle = {
    fontSize: "11px",
    fontWeight: 600,
    color: "#555",
    marginBottom: "3px",
    letterSpacing: "0.3px",
};

const inputSx = {
    "& .MuiInputBase-input": { fontSize: "12px", padding: "6px 10px" },
    "& .MuiOutlinedInput-root": {
        borderRadius: "6px",
        "& fieldset": { borderColor: "#ddd" },
        "&:hover fieldset": { borderColor: "#564afc" },
        "&.Mui-focused fieldset": { borderColor: "#564afc" },
    },
};

const selectSx = {
    fontSize: "12px",
    borderRadius: "6px",
    "& .MuiSelect-select": { padding: "6px 10px" },
    "& fieldset": { borderColor: "#ddd" },
    "&:hover fieldset": { borderColor: "#564afc" },
    "&.Mui-focused fieldset": { borderColor: "#564afc" },
};

const ImageRowCard = ({ row, index, columns, onChange, onRemove, spData }) => {
    const handleField = (field) => (e) => onChange(index, field, e.target.value);

    return (
        <Box
            sx={{
                background: "#fff",
                border: "1px solid #eaeaea",
                borderRadius: "10px",
                padding: "14px 14px 10px",
                marginBottom: "10px",
                position: "relative",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: "0 2px 10px rgba(86,74,252,0.1)" },
            }}
        >
            {/* Row number badge + delete */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "10px" }}>
                <Box
                    sx={{
                        background: "rgb(86,74,252)",
                        color: "#fff",
                        borderRadius: "50%",
                        width: 22,
                        height: 22,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 700,
                    }}
                >
                    {index + 1}
                </Box>
                <Tooltip title="Remove row">
                    <IconButton
                        size="small"
                        onClick={() => onRemove(index)}
                        sx={{
                            color: "#e53935",
                            "&:hover": { background: "#fdecea" },
                            padding: "3px",
                        }}
                    >
                        <Trash2 size={14} />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Row 1: Label text + Value dropdown */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", mb: "10px" }}>
                <Box>
                    <div style={labelStyle}>Label</div>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g. Gross Wt"
                        value={row.lable}
                        onChange={handleField("lable")}
                        sx={inputSx}
                    />
                </Box>

                <Box>
                    <div style={labelStyle}>Value (Field Name)</div>
                    <Select
                        fullWidth
                        size="small"
                        displayEmpty
                        value={row.value}
                        onChange={handleField("value")}
                        sx={selectSx}
                    >
                        <MenuItem value="" disabled>
                            <em style={{ fontSize: "12px", color: "#aaa" }}>Select column</em>
                        </MenuItem>
                        {spData?.result?.map((col) => (
                            <MenuItem key={col?.ColId} value={col?.FieldName} sx={{ fontSize: "12px" }}>
                                {col.HeaderName}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Box>

            {/* Row 2: Label Font Size + Label Font Weight */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", mb: "10px" }}>
                <Box>
                    <div style={labelStyle}>Label Font Size</div>
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="e.g. 12"
                        value={row.fontsizel}
                        onChange={handleField("fontsizel")}
                        sx={inputSx}
                        inputProps={{ min: 8, max: 72 }}
                    />
                </Box>

                <Box>
                    <div style={labelStyle}>Label Font Weight</div>
                    <Select
                        fullWidth
                        size="small"
                        displayEmpty
                        value={row.fontweightl}
                        onChange={handleField("fontweightl")}
                        sx={selectSx}
                    >
                        <MenuItem value="" disabled>
                            <em style={{ fontSize: "12px", color: "#aaa" }}>Select weight</em>
                        </MenuItem>
                        {FONT_WEIGHTS.map((fw) => (
                            <MenuItem key={fw.value} value={fw.value} sx={{ fontSize: "12px" }}>
                                {fw.label}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Box>

            {/* Row 3: Value Font Size + Value Font Weight */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", mb: "10px" }}>
                <Box>
                    <div style={labelStyle}>Value Font Size</div>
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="e.g. 12"
                        value={row.fontsizev}
                        onChange={handleField("fontsizev")}
                        sx={inputSx}
                        inputProps={{ min: 8, max: 72 }}
                    />
                </Box>

                <Box>
                    <div style={labelStyle}>Value Font Weight</div>
                    <Select
                        fullWidth
                        size="small"
                        displayEmpty
                        value={row.fontweightv}
                        onChange={handleField("fontweightv")}
                        sx={selectSx}
                    >
                        <MenuItem value="" disabled>
                            <em style={{ fontSize: "12px", color: "#aaa" }}>Select weight</em>
                        </MenuItem>
                        {FONT_WEIGHTS.map((fw) => (
                            <MenuItem key={fw.value} value={fw.value} sx={{ fontSize: "12px" }}>
                                {fw.label}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Box>

            {/* Row 4: Display Order */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <Box>
                    <div style={labelStyle}>Display Order</div>
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="e.g. 1"
                        value={row.displayorder}
                        onChange={handleField("displayorder")}
                        sx={inputSx}
                        inputProps={{ min: 1 }}
                    />
                </Box>
            </Box>
        </Box>
    );
};

const ImageViewDrawer = ({ imageViewData, setImageViewData, spData, onClose }) => {
    const columns = React.useMemo(() => {
        if (!spData) return [];
        if (Array.isArray(spData.columns)) return spData.columns;
        if (Array.isArray(spData)) return spData.map((c) => c.ColumnName || c.fieldname || c).filter(Boolean);
        return [];
    }, [spData]);

    const handleChange = (index, field, value) => {
        setImageViewData((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleAdd = () => {
        setImageViewData((prev) => [...prev, createEmptyRow()]);
    };

    const handleRemove = (index) => {
        setImageViewData((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                background: "#f7f7fb",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px 12px",
                    background: "#fff",
                    borderBottom: "1px solid #eee",
                    flexShrink: 0,
                }}
            >
                <Typography
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#1a1a2e",
                        letterSpacing: "0.2px",
                    }}
                >
                    Image View Settings
                </Typography>
                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{
                        color: "#888",
                        "&:hover": { background: "#f0f0f0", color: "#333" },
                        padding: "4px",
                    }}
                >
                    <X size={16} />
                </IconButton>
            </Box>

            {/* ── Scrollable Content ── */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "14px 16px",
                    "&::-webkit-scrollbar": { width: "4px" },
                    "&::-webkit-scrollbar-thumb": { background: "#d0cdf8", borderRadius: "4px" },
                }}
            >
                {imageViewData.length === 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "160px",
                            color: "#aaa",
                            gap: "8px",
                        }}
                    >
                        <Typography sx={{ fontSize: "13px" }}>No items added yet.</Typography>
                        <Typography sx={{ fontSize: "11px" }}>Click "+ Add Row" to get started.</Typography>
                    </Box>
                ) : (
                    imageViewData.map((row, index) => (
                        <ImageRowCard
                            key={index}
                            row={row}
                            index={index}
                            columns={columns}
                            onChange={handleChange}
                            onRemove={handleRemove}
                            spData={spData}
                        />
                    ))
                )}
            </Box>

            {/* ── Footer ── */}
            <Box
                sx={{
                    flexShrink: 0,
                    padding: "12px 16px",
                    background: "#fff",
                    borderTop: "1px solid #eee",
                    display: "flex",
                    gap: "10px",
                }}
            >
                <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<Plus size={14} />}
                    onClick={handleAdd}
                    sx={{
                        fontSize: "12px",
                        textTransform: "none",
                        borderColor: "rgb(86,74,252)",
                        color: "rgb(86,74,252)",
                        borderRadius: "7px",
                        fontWeight: 600,
                        "&:hover": {
                            background: "rgba(86,74,252,0.05)",
                            borderColor: "rgb(86,74,252)",
                        },
                    }}
                >
                    Add Row
                </Button>

                <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    onClick={onClose}
                    sx={{
                        fontSize: "12px",
                        textTransform: "none",
                        background: "rgb(86,74,252)",
                        borderRadius: "7px",
                        fontWeight: 600,
                        boxShadow: "none",
                        "&:hover": {
                            background: "rgb(66,54,232)",
                            boxShadow: "none",
                        },
                    }}
                >
                    Done
                </Button>
            </Box>
        </Box>
    );
};

export default ImageViewDrawer;